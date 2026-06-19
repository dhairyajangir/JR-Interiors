"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { startSession, endSession, getCurrentUser } from "@/lib/auth";

export type AuthState = { error?: string } | undefined;

function str(fd: FormData, key: string): string {
  return ((fd.get(key) as string) ?? "").trim();
}

export async function register(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  const fullName = str(fd, "fullName");
  const password = str(fd, "password");

  if (!email || !fullName || !password) return { error: "All fields are required." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const user = await prisma.user.create({
    data: { email, fullName, passwordHash: hashPassword(password) },
  });
  await startSession(user.id);
  revalidatePath("/", "layout");
  const redirectTo = str(fd, "redirectTo") || "/account";
  redirect(redirectTo);
}

export async function login(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }
  await startSession(user.id);
  revalidatePath("/", "layout");
  const redirectTo = str(fd, "redirectTo") || "/account";
  redirect(redirectTo);
}

export async function logout(): Promise<void> {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  await prisma.user.update({
    where: { id: user.id },
    data: { fullName: str(fd, "fullName") || user.fullName, phone: str(fd, "phone") || null },
  });
  revalidatePath("/account");
}

export async function saveAddress(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const makeDefault = fd.get("isDefault") === "on";
  const data = {
    userId: user.id,
    label: str(fd, "label") || "Home",
    fullName: str(fd, "fullName") || user.fullName,
    line1: str(fd, "line1"),
    line2: str(fd, "line2") || null,
    city: str(fd, "city"),
    region: str(fd, "region"),
    postalCode: str(fd, "postalCode"),
    country: str(fd, "country") || "United States",
    phone: str(fd, "phone") || null,
    isDefault: makeDefault,
  };

  const count = await prisma.address.count({ where: { userId: user.id } });
  if (count === 0) data.isDefault = true; // first address is default

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  await prisma.address.create({ data });
  revalidatePath("/account");
  revalidatePath("/checkout/shipping");
}

export async function deleteAddress(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  const id = str(fd, "id");
  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account");
}

export async function makeAddressDefault(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  const id = str(fd, "id");
  await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } });
  revalidatePath("/account");
}
