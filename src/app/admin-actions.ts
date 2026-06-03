"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/catalog";

function str(fd: FormData, k: string): string {
  return ((fd.get(k) as string) ?? "").trim();
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/account/login");
  return user;
}

async function uniqueSellerSlug(base: string): Promise<string> {
  const root = slugify(base) || "store";
  let slug = root;
  for (let i = 0; i < 50; i++) {
    const existing = await prisma.seller.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${root}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return `${root}-${Date.now()}`;
}

/** Invite-only: admin creates a seller account (User + Seller profile). */
export async function createSeller(fd: FormData): Promise<void> {
  await requireAdmin();

  const email = str(fd, "email").toLowerCase();
  const fullName = str(fd, "fullName");
  const brandName = str(fd, "brandName");
  const password = str(fd, "password");
  const bio = str(fd, "bio");

  if (!email || !fullName || !brandName || password.length < 8) {
    redirect("/admin/sellers?error=missing");
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect("/admin/sellers?error=email");

  const slug = await uniqueSellerSlug(brandName);
  await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash: hashPassword(password),
      role: "SELLER",
      seller: { create: { brandName, slug, bio: bio || null } },
    },
  });
  revalidatePath("/admin/sellers");
  redirect("/admin/sellers?created=1");
}

export async function approveListing(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = str(fd, "id");
  await prisma.product.update({ where: { id }, data: { status: "PUBLISHED", reviewNote: null } });
  revalidatePath("/admin/listings");
  revalidatePath("/furniture");
}

export async function rejectListing(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = str(fd, "id");
  const note = str(fd, "note") || "Does not meet listing guidelines.";
  await prisma.product.update({ where: { id }, data: { status: "REJECTED", reviewNote: note } });
  revalidatePath("/admin/listings");
}

export async function setSellerStatus(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status") === "suspended" ? "suspended" : "active";
  await prisma.seller.update({ where: { id }, data: { status } });
  revalidatePath("/admin/sellers");
}
