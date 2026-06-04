import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "jr_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const DEV_FALLBACK = "dev-insecure-secret-change-me";

function authSecret(): string {
  const secret = process.env.AUTH_SECRET || DEV_FALLBACK;
  if (process.env.NODE_ENV === "production") {
    if (!process.env.AUTH_SECRET) {
      throw new Error("AUTH_SECRET is required in production. Set a long random value.");
    }
    if (secret === DEV_FALLBACK || secret.length < 16) {
      console.warn("[auth] AUTH_SECRET is weak — use a long random string in production.");
    }
  }
  return secret;
}

export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  isAdmin: boolean;
  sellerId: string | null;
  brandName: string | null;
};

/** Admin = role ADMIN or the configured store-owner email. */
export function emailIsAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  return Boolean(adminEmail && email.toLowerCase() === adminEmail);
}

function sign(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

/** token = base64url(userId).expiryMs.signature */
function makeToken(userId: string): string {
  const payload = `${Buffer.from(userId).toString("base64url")}.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const got = parts[2];
  if (expected.length !== got.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(got))) return null;
  if (Date.now() > Number(parts[1])) return null;
  return Buffer.from(parts[0], "base64url").toString("utf8");
}

/** Set the session cookie. Call from a Server Action / Route Handler. */
export async function startSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Current logged-in user, or null. Safe in Server Components. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const userId = readToken(token);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    isAdmin: user.role === "ADMIN" || emailIsAdmin(user.email),
    sellerId: user.seller?.id ?? null,
    brandName: user.seller?.brandName ?? null,
  };
}

/** Require a logged-in seller; returns their user + sellerId or null. */
export async function getSellerUser(): Promise<SafeUser | null> {
  const user = await getCurrentUser();
  if (!user || !user.sellerId) return null;
  return user;
}
