"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { demoWritesAllowed, endSession, getCurrentUser, isDemoModeEnabled, requireAdmin, requireUser, startSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/catalog";
import { hashPassword, verifyPassword } from "@/lib/password";
import { enforceRateLimit, enforceSameOrigin, getRequestMeta } from "@/lib/security";
import { buildPaymentReference, buildUpiLink, getUpiConfig } from "@/lib/upi";
import { isSafeUrl } from "@/lib/ssrf-check";

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

async function validateHttpUrl(value: string, field: string): Promise<string> {
  if (!value) return value;
  const safe = await isSafeUrl(value);
  if (!safe) {
    throw new Error(`${field} must be a safe, valid http or https URL.`);
  }
  return value;
}

function readProductStatus(fd: FormData): "DRAFT" | "LIVE" | "ARCHIVED" {
  const value = str(fd, "status");
  if (value === "DRAFT" || value === "ARCHIVED") return value;
  return "LIVE";
}

function readStorefrontProductStatus(fd: FormData): "PUBLISHED" | "PENDING" | "REJECTED" {
  const value = str(fd, "status");
  if (value === "PENDING" || value === "REJECTED") return value;
  return "PUBLISHED";
}

function readConsultationStatus(fd: FormData): "NEW" | "CONTACTED" | "SCHEDULED" | "COMPLETED" {
  const value = str(fd, "status");
  if (value === "CONTACTED" || value === "SCHEDULED" || value === "COMPLETED") return value;
  return "NEW";
}

function readOrderStatus(fd: FormData): string {
  const value = str(fd, "status").toLowerCase();
  const allowed = new Set(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);
  return allowed.has(value) ? value : "confirmed";
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

async function rateLimitAuth(prefix: string, identity?: string): Promise<void> {
  const meta = await getRequestMeta();
  await enforceRateLimit({
    key: `${prefix}:${meta.ipAddress ?? "unknown"}:${identity ?? "anon"}`,
    limit: 5,
    windowMs: 60_000,
  });
}

async function ensureMutationAllowed(requireAdminUser = false) {
  await enforceSameOrigin();
  const user = requireAdminUser ? await requireAdmin() : await requireUser();
  if (user.isDemo && !demoWritesAllowed()) {
    throw new Error("Demo account is read-only in production.");
  }
  return user;
}

export async function register(_prev: FormState, fd: FormData): Promise<FormState> {
  const fullName = str(fd, "fullName");
  const businessName = str(fd, "businessName");
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone") || null;
  const password = str(fd, "password");

  await enforceSameOrigin();
  await rateLimitAuth("register", email);

  if (!fullName || !businessName || !email || !password) {
    return { error: "Fill all required fields." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
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

  await enforceSameOrigin();
  await rateLimitAuth("login", email);

  if (!email || !password) {
    return { error: "Enter email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
    },
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  const meta = await getRequestMeta();
  await startSession(user.id);
  await logAudit(user.id, "LOGIN", {
    description: "Dashboard login",
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function demoLogin(): Promise<FormState> {
  await enforceSameOrigin();
  await rateLimitAuth("demo-login");

  if (!isDemoModeEnabled() || process.env.NODE_ENV === "production") {
    return { error: "Demo login is disabled." };
  }

  const email = (process.env.DEMO_ADMIN_EMAIL || "admin@jrinteriors.com").toLowerCase();
  const password = process.env.DEMO_ADMIN_PASSWORD || "Demo@Admin2024";
  const existingDemoUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const user = existingDemoUser
    ? await prisma.user.update({
        where: { email },
        data: {
          fullName: "JR Interiors Demo Admin",
          businessName: "JR Interiors Demo Workspace",
          phone: "+91 94603 00750",
          passwordHash: hashPassword(password),
          status: "ACTIVE",
          isDemo: true,
          isAdmin: true,
        },
        select: { id: true },
      })
    : await prisma.user.create({
        data: {
          email,
          fullName: "JR Interiors Demo Admin",
          businessName: "JR Interiors Demo Workspace",
          phone: "+91 94603 00750",
          passwordHash: hashPassword(password),
          status: "ACTIVE",
          isDemo: true,
          isAdmin: true,
        },
        select: { id: true },
      });

  if (!user) {
    return { error: "Demo account is not seeded yet." };
  }

  const meta = await getRequestMeta();
  await startSession(user.id);
  await logAudit(user.id, "DEMO_LOGIN", {
    description: "Quick demo login",
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const currentUser = await getCurrentUser();
  const meta = await getRequestMeta();

  if (currentUser) {
    await logAudit(currentUser.id, "LOGOUT", {
      description: "Dashboard logout",
      ipAddress: meta.ipAddress ?? undefined,
      userAgent: meta.userAgent ?? undefined,
    });
  }

  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function reportPayment(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed();
  const meta = await getRequestMeta();

  const paymentId = str(fd, "paymentId");
  const utrNumber = str(fd, "utrNumber") || null;
  const payment = await prisma.registrationPayment.findFirst({
    where: { id: paymentId, userId: user.id },
  });

  if (!payment) redirect("/onboarding");

  // If already confirmed, do nothing
  if (payment.status === "CONFIRMED") {
    redirect("/onboarding");
  }

  await prisma.registrationPayment.update({
    where: { id: payment.id },
    data: {
      status: "REPORTED",
      // Store UTR as the screenshot field (text reference)
      screenshot: utrNumber ?? payment.screenshot,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "PENDING_REVIEW" },
  });

  await logAudit(user.id, "PAYMENT_REPORT", {
    entity: "RegistrationPayment",
    entityId: payment.id,
    description: `Registration payment reported${utrNumber ? ` — UTR: ${utrNumber}` : ""}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}

export async function createProduct(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed();
  const meta = await getRequestMeta();

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
    normalizedCoverImage = await validateHttpUrl(coverImage, "Cover image URL");
    const rawGallery = parseGallery(str(fd, "gallery"));
    for (const entry of rawGallery) {
      gallery.push(await validateHttpUrl(entry, "Gallery URL"));
    }
  } catch (err: any) {
    redirect(`/dashboard/products/new?error=invalid-url&msg=${encodeURIComponent(err.message)}`);
  }

  let createdProductId = "";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const created = await prisma.product.create({
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
      createdProductId = created.id;
      break;
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 2) throw error;
    }
  }

  await logAudit(user.id, "PRODUCT_CREATE", {
    entity: "Product",
    entityId: createdProductId,
    description: `Created admin product ${title}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProduct(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed();
  const meta = await getRequestMeta();

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
    normalizedCoverImage = await validateHttpUrl(coverImage, "Cover image URL");
    const rawGallery = parseGallery(str(fd, "gallery"));
    for (const entry of rawGallery) {
      gallery.push(await validateHttpUrl(entry, "Gallery URL"));
    }
  } catch (err: any) {
    redirect(`/dashboard/products/${id}/edit?error=invalid-url&msg=${encodeURIComponent(err.message)}`);
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

  await logAudit(user.id, "PRODUCT_UPDATE", {
    entity: "Product",
    entityId: id,
    description: `Updated admin product ${title}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteProduct(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed();
  const meta = await getRequestMeta();
  const id = str(fd, "id");

  await prisma.product.deleteMany({ where: { id, ownerId: user.id } });
  await logAudit(user.id, "PRODUCT_DELETE", {
    entity: "Product",
    entityId: id,
    description: "Deleted admin product",
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });
  revalidatePath("/dashboard");
}

function readOrderPaymentStatus(fd: FormData): string {
  const value = str(fd, "paymentStatus").toLowerCase();
  const allowed = new Set(["pending", "paid", "failed"]);
  return allowed.has(value) ? value : "";
}

export async function updateStorefrontOrderStatus(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed(true);
  const meta = await getRequestMeta();
  const id = str(fd, "id");
  const status = readOrderStatus(fd);
  const paymentStatus = readOrderPaymentStatus(fd);

  await prisma.storefrontOrder.update({
    where: { id },
    data: {
      status,
      ...(paymentStatus ? { paymentStatus } : {}),
    },
  });

  await logAudit(user.id, "ORDER_STATUS_UPDATE", {
    entity: "StorefrontOrder",
    entityId: id,
    description: `Updated storefront order to ${status}${paymentStatus ? ` / payment: ${paymentStatus}` : ""}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
}

export async function updateStorefrontSellerStatus(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed(true);
  const meta = await getRequestMeta();
  const id = str(fd, "id");
  const status = str(fd, "status") === "suspended" ? "suspended" : "active";

  await prisma.storefrontSeller.update({
    where: { id },
    data: { status },
  });

  await logAudit(user.id, "SELLER_VERIFY", {
    entity: "StorefrontSeller",
    entityId: id,
    description: `Updated storefront seller to ${status}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sellers");
}

export async function updateStorefrontProductStatus(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed(true);
  const meta = await getRequestMeta();
  const id = str(fd, "id");
  const status = readStorefrontProductStatus(fd);
  const reviewNote = str(fd, "reviewNote") || null;

  await prisma.storefrontProduct.update({
    where: { id },
    data: {
      status,
      // Always preserve reviewer notes — do not clear on approval
      reviewNote,
    },
  });

  await logAudit(user.id, "PRODUCT_UPDATE", {
    entity: "StorefrontProduct",
    entityId: id,
    description: `Updated storefront product to ${status}${reviewNote ? ` — note: ${reviewNote}` : ""}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/sellers");
}

export async function updateConsultationStatus(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed(true);
  const meta = await getRequestMeta();
  const id = str(fd, "id");
  const status = readConsultationStatus(fd);

  await prisma.storefrontConsultation.update({
    where: { id },
    data: { status },
  });

  await logAudit(user.id, "CONSULTATION_UPDATE", {
    entity: "StorefrontConsultation",
    entityId: id,
    description: `Updated consultation to ${status}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/consultations");
}

export async function updateAdminStatus(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed(true);
  const meta = await getRequestMeta();
  const id = str(fd, "id");
  const nextStatus = str(fd, "status");
  const allowed = new Set(["TRIAL", "PENDING_REVIEW", "ACTIVE", "SUSPENDED"]);
  const status = allowed.has(nextStatus) ? nextStatus : "TRIAL";

  const targetUser = await prisma.user.update({
    where: { id },
    data: { status: status as "TRIAL" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" },
  });

  // Seller Bridge: when an admin workspace account is activated, ensure
  // a corresponding storefront User + Seller profile exists in the public schema.
  if (status === "ACTIVE" && targetUser.email) {
    try {
      const existingStorefrontUser = await prisma.storefrontUser.findUnique({
        where: { email: targetUser.email },
      });

      if (!existingStorefrontUser) {
        // Create the storefront user
        const storefrontUserId = id; // reuse the same ID for traceability
        await prisma.storefrontUser.create({
          data: {
            id: storefrontUserId,
            email: targetUser.email,
            passwordHash: targetUser.passwordHash,
            fullName: targetUser.fullName,
            phone: targetUser.phone ?? null,
            role: "SELLER",
            createdAt: targetUser.createdAt,
          },
        });

        // Create the seller profile
        const brandSlug = targetUser.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || `seller-${id.slice(-6)}`;

        await prisma.storefrontSeller.create({
          data: {
            id: `seller-${id}`,
            userId: storefrontUserId,
            brandName: targetUser.businessName,
            slug: `${brandSlug}-${id.slice(-6)}`,
            status: "active",
            createdAt: targetUser.createdAt,
          },
        });

        await logAudit(user.id, "SELLER_VERIFY", {
          entity: "StorefrontSeller",
          entityId: storefrontUserId,
          description: `Auto-created storefront profile for activated seller ${targetUser.email}`,
          ipAddress: meta.ipAddress ?? undefined,
          userAgent: meta.userAgent ?? undefined,
        });
      }
    } catch (bridgeError) {
      // Log but don't fail — the admin status update succeeded
      console.error("[SellerBridge] Failed to create storefront profile:", bridgeError);
    }
  }

  await logAudit(user.id, "SETTINGS_UPDATE", {
    entity: "User",
    entityId: id,
    description: `Updated admin account status to ${status}`,
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard/sellers");
}

export async function updateAdminProfile(fd: FormData): Promise<void> {
  const user = await ensureMutationAllowed();
  const meta = await getRequestMeta();

  const fullName = str(fd, "fullName");
  const businessName = str(fd, "businessName");
  const phone = str(fd, "phone") || null;

  if (!fullName || !businessName) {
    redirect("/dashboard/settings?error=missing");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName,
      businessName,
      phone,
    },
  });

  await logAudit(user.id, "SETTINGS_UPDATE", {
    entity: "User",
    entityId: user.id,
    description: "Updated admin profile",
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard/settings");
}

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await ensureMutationAllowed();
  const meta = await getRequestMeta();
  const currentPassword = str(fd, "currentPassword");
  const nextPassword = str(fd, "nextPassword");

  if (!currentPassword || !nextPassword) {
    return { error: "Enter both current and new password." };
  }

  if (nextPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!dbUser || !verifyPassword(currentPassword, dbUser.passwordHash)) {
    return { error: "Current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(nextPassword) },
  });

  await logAudit(user.id, "SETTINGS_UPDATE", {
    entity: "User",
    entityId: user.id,
    description: "Changed account password",
    ipAddress: meta.ipAddress ?? undefined,
    userAgent: meta.userAgent ?? undefined,
  });

  revalidatePath("/dashboard/settings");
  return undefined;
}

export async function getRequestHeaderValue(name: string): Promise<string | null> {
  const store = await headers();
  return store.get(name);
}
