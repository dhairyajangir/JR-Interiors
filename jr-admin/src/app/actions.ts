"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { endSession, getCurrentUser, startSession } from "@/lib/auth";
import { slugify } from "@/lib/catalog";
import { buildPaymentReference, buildUpiLink, getUpiConfig } from "@/lib/upi";

export type FormState = { error?: string } | undefined;

function str(fd: FormData, key: string): string {
  return ((fd.get(key) as string) ?? "").trim();
}

function num(fd: FormData, key: string, fallback = 0): number {
  const raw = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(raw) ? raw : fallback;
}

async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "product";
  let candidate = base;

  for (let index = 0; index < 30; index += 1) {
    const existing = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
    candidate = `${base}-${index + 2}`;
  }

  return `${base}-${Date.now().toString().slice(-6)}`;
}

function buildSku(title: string): string {
  const token = slugify(title).replace(/-/g, "").slice(0, 6).toUpperCase() || "ITEM";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${token}-${Date.now().toString().slice(-6)}${suffix}`;
}

function parseGallery(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function validateHttpUrl(value: string, field: string): string {
  if (!value) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
    return parsed.toString();
  } catch {
    throw new Error(`${field} must be a valid http or https URL.`);
  }
}

function readProductStatus(fd: FormData): "DRAFT" | "LIVE" | "ARCHIVED" {
  const value = str(fd, "status");
  if (value === "DRAFT" || value === "ARCHIVED") return value;
  return "LIVE";
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

export async function register(_prev: FormState, fd: FormData): Promise<FormState> {
  const fullName = str(fd, "fullName");
  const businessName = str(fd, "businessName");
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone") || null;
  const password = str(fd, "password");

  if (!fullName || !businessName || !email || !password) {
    return { error: "Fill all required fields." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Account already exists for this email." };
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      businessName,
      email,
      phone,
      passwordHash: hashPassword(password),
    },
  });

  const upi = getUpiConfig();
  const reference = buildPaymentReference(email);
  const note = `${businessName} registration fee`;

  await prisma.registrationPayment.create({
    data: {
      userId: user.id,
      reference,
      planName: "Seller Launch",
      amountInr: upi.registrationFeeInr,
      note,
      payeeVpa: upi.payeeVpa,
      payeeName: upi.payeeName,
      upiLink: buildUpiLink({
        payeeVpa: upi.payeeVpa,
        payeeName: upi.payeeName,
        amountInr: upi.registrationFeeInr,
        reference,
        note,
      }),
    },
  });

  await startSession(user.id);
  revalidatePath("/", "layout");
  redirect(`/onboarding?ref=${reference}`);
}

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");

  if (!email || !password) {
    return { error: "Enter email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  await startSession(user.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function reportPayment(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const paymentId = str(fd, "paymentId");
  const payment = await prisma.registrationPayment.findFirst({
    where: { id: paymentId, userId: user.id },
  });

  if (!payment) redirect("/onboarding");

  await prisma.registrationPayment.update({
    where: { id: payment.id },
    data: { status: "REPORTED" },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "PENDING_REVIEW" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}

export async function createProduct(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = str(fd, "title");
  const category = str(fd, "category");
  const shortDescription = str(fd, "shortDescription");
  const coverImage = str(fd, "coverImage");
  const priceInr = num(fd, "priceInr");
  const inventory = num(fd, "inventory");

  if (!title || !category || !shortDescription || !coverImage || priceInr <= 0) {
    redirect("/dashboard/products/new?error=missing");
  }

  let normalizedCoverImage = coverImage;
  let gallery: string[] = [];
  try {
    normalizedCoverImage = validateHttpUrl(coverImage, "Cover image URL");
    gallery = parseGallery(str(fd, "gallery")).map((entry) => validateHttpUrl(entry, "Gallery URL"));
  } catch {
    redirect("/dashboard/products/new?error=invalid-url");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.product.create({
        data: {
          ownerId: user.id,
          title,
          slug: await uniqueSlug(title),
          sku: buildSku(title),
          category,
          priceInr,
          inventory: Math.max(0, inventory),
          status: readProductStatus(fd),
          shortDescription,
          coverImage: normalizedCoverImage,
          gallery,
          featured: fd.get("featured") === "on",
        },
      });
      break;
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 2) throw error;
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProduct(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = str(fd, "id");
  const existing = await prisma.product.findFirst({ where: { id, ownerId: user.id } });
  if (!existing) redirect("/dashboard");

  const title = str(fd, "title");
  const category = str(fd, "category");
  const shortDescription = str(fd, "shortDescription");
  const coverImage = str(fd, "coverImage");
  const priceInr = num(fd, "priceInr");
  const inventory = num(fd, "inventory");
  let normalizedCoverImage = coverImage;
  let gallery: string[] = [];
  try {
    normalizedCoverImage = validateHttpUrl(coverImage, "Cover image URL");
    gallery = parseGallery(str(fd, "gallery")).map((entry) => validateHttpUrl(entry, "Gallery URL"));
  } catch {
    redirect("/dashboard/products/" + id + "/edit?error=invalid-url");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.product.update({
        where: { id },
        data: {
          title,
          slug: await uniqueSlug(title, id),
          category,
          priceInr: Math.max(1, priceInr),
          inventory: Math.max(0, inventory),
          status: readProductStatus(fd),
          shortDescription,
          coverImage: normalizedCoverImage,
          gallery,
          featured: fd.get("featured") === "on",
        },
      });
      break;
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 2) throw error;
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteProduct(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = str(fd, "id");
  await prisma.product.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/dashboard");
}
