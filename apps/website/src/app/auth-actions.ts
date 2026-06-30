"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { startSession, endSession, getCurrentUser } from "@/lib/auth";
import { RegistrationSchema, LoginSchema, AddressSchema } from "@/lib/validation";
import { validateFormSecurity } from "@/lib/security-helpers";

export type AuthState = { error?: string } | undefined;

function str(fd: FormData, key: string): string {
  return ((fd.get(key) as string) ?? "").trim();
}

export async function register(_prev: AuthState, fd: FormData): Promise<AuthState> {
  // 1. Enforce form security
  const security = await validateFormSecurity(fd, "register", 5, 600_000);
  if (security.isSpam) return { error: "Security check failed." };
  if (security.error) return { error: security.error };

  const email = str(fd, "email");
  const fullName = str(fd, "fullName");
  const password = str(fd, "password");

  // 2. Schema check
  const parsed = RegistrationSchema.safeParse({ email, fullName, password });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with that email already exists." };

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      passwordHash: hashPassword(parsed.data.password),
    },
  });
  await startSession(user.id);
  revalidatePath("/", "layout");
  const redirectTo = str(fd, "redirectTo") || "/account";
  redirect(redirectTo);
}

export async function login(_prev: AuthState, fd: FormData): Promise<AuthState> {
  // 1. Enforce form security
  const security = await validateFormSecurity(fd, "login", 5, 600_000);
  if (security.isSpam) return { error: "Security check failed." };
  if (security.error) return { error: security.error };

  const email = str(fd, "email");
  const password = str(fd, "password");

  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
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
  
  const parsed = AddressSchema.safeParse({
    label: str(fd, "label") || "Home",
    fullName: str(fd, "fullName") || user.fullName,
    line1: str(fd, "line1"),
    line2: str(fd, "line2") || null,
    city: str(fd, "city"),
    region: str(fd, "region"),
    postalCode: str(fd, "postalCode"),
    country: str(fd, "country") || "India",
    phone: str(fd, "phone") || null,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const data = {
    userId: user.id,
    label: parsed.data.label,
    fullName: parsed.data.fullName,
    line1: parsed.data.line1,
    line2: parsed.data.line2,
    city: parsed.data.city,
    region: parsed.data.region,
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
    phone: parsed.data.phone,
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
