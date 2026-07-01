import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "jr_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const DEV_FALLBACK = "dev-insecure-secret-change-me";
const isProduction = process.env.NODE_ENV === "production";
const isBuild = process.env.NEXT_PHASE?.includes("build") || process.env.CI === "true";
const SECRET = process.env.AUTH_SECRET || (isProduction && !isBuild ? "" : DEV_FALLBACK);

if (isProduction && !process.env.AUTH_SECRET) {
  if (isBuild) {
    console.warn("[auth] AUTH_SECRET is not set during build; using a temporary fallback for compilation.");
  } else {
    throw new Error("AUTH_SECRET is required in production. Set a long random value.");
  }
}

if (isProduction && SECRET && (SECRET === DEV_FALLBACK || SECRET.length < 16)) {
  console.warn("[auth] AUTH_SECRET is weak — use a long random string in production.");
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
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

const ABSOLUTE_TIMEOUT = 1000 * 60 * 60 * 24 * 30; // 30 days
const IDLE_TIMEOUT = 1000 * 60 * 60 * 24 * 7; // 7 days

/** token = base64url(userId).createdAtMs.lastActiveMs.signature */
function makeToken(userId: string, createdAt = Date.now(), lastActive = Date.now()): string {
  const payload = `${Buffer.from(userId).toString("base64url")}.${createdAt}.${lastActive}`;
  return `${payload}.${sign(payload)}`;
}

type TokenPayload = {
  userId: string;
  createdAt: number;
  lastActive: number;
};

function readToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const payload = `${parts[0]}.${parts[1]}.${parts[2]}`;
  const expected = sign(payload);
  const got = parts[3];
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  const createdAt = Number(parts[1]);
  const lastActive = Number(parts[2]);
  const now = Date.now();

  if (now - createdAt > ABSOLUTE_TIMEOUT) return null;
  if (now - lastActive > IDLE_TIMEOUT) return null;

  const userId = Buffer.from(parts[0], "base64url").toString("utf8");
  return { userId, createdAt, lastActive };
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

import { cache } from "react";

/** Current logged-in user, or null. Safe in Server Components. */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const decoded = readToken(token);
  if (!decoded) return null;

  // Session rotation: if active for over 15 minutes, update lastActive timestamp
  if (Date.now() - decoded.lastActive > 15 * 60 * 1000) {
    try {
      store.set(COOKIE, makeToken(decoded.userId, decoded.createdAt, Date.now()), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: MAX_AGE,
      });
    } catch {
      // Ignore set-cookie failures in read-only render contexts
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
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
});

/** Require a logged-in seller; returns their user + sellerId or null. */
export async function getSellerUser(): Promise<SafeUser | null> {
  const user = await getCurrentUser();
  if (!user || !user.sellerId) return null;
  return user;
}
