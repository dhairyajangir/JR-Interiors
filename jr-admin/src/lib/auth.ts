import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session-config";

const DEV_FALLBACK = "jr-admin-dev-secret-change-me";

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production and must be at least 16 characters.");
  }
  return secret || DEV_FALLBACK;
}

export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  phone: string | null;
  status: string;
  isDemo: boolean;
  isAdmin: boolean;
};

function getDemoEmail(): string {
  return (process.env.DEMO_ADMIN_EMAIL || "admin@jrinteriors.com").toLowerCase();
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || getDemoEmail()).toLowerCase();
}

function sign(value: string, secret = getSecret()): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

const ABSOLUTE_TIMEOUT = 1000 * 60 * 60 * 24 * 30; // 30 days
const IDLE_TIMEOUT = 1000 * 60 * 60 * 24 * 7; // 7 days

function makeToken(userId: string, createdAt = Date.now(), lastActive = Date.now(), secret = getSecret()): string {
  const payload = `${Buffer.from(userId).toString("base64url")}.${createdAt}.${lastActive}`;
  return `${payload}.${sign(payload, secret)}`;
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
  const actual = parts[3];

  const a = Buffer.from(expected);
  const b = Buffer.from(actual);

  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  const createdAt = Number(parts[1]);
  const lastActive = Number(parts[2]);
  const now = Date.now();

  if (now - createdAt > ABSOLUTE_TIMEOUT) return null;
  if (now - lastActive > IDLE_TIMEOUT) return null;

  return {
    userId: Buffer.from(parts[0], "base64url").toString("utf8"),
    createdAt,
    lastActive,
  };
}

export async function startSession(userId: string): Promise<void> {
  const secret = getSecret();
  const store = await cookies();
  store.set(SESSION_COOKIE, makeToken(userId, Date.now(), Date.now(), secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      loginCount: { increment: 1 },
    },
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const decoded = readToken(token);
  if (!decoded) return null;

  // Session rotation: if active for over 15 minutes, update lastActive timestamp
  if (Date.now() - decoded.lastActive > 15 * 60 * 1000) {
    try {
      const secret = getSecret();
      store.set(SESSION_COOKIE, makeToken(decoded.userId, decoded.createdAt, Date.now(), secret), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });
    } catch {
      // Ignore set-cookie failures in read-only render contexts
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      businessName: true,
      phone: true,
      status: true,
      isDemo: true,
      isAdmin: true,
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    businessName: user.businessName,
    phone: user.phone,
    status: user.status,
    isDemo: user.isDemo,
    isAdmin: user.isAdmin || user.email.toLowerCase() === getAdminEmail(),
  };
});

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (!user.isAdmin) {
    redirect("/dashboard?error=admin-required");
  }
  return user;
}

export function isDemo(user: SafeUser): boolean {
  return user.isDemo;
}

export function isDemoModeEnabled(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function demoWritesAllowed(): boolean {
  return isDemoModeEnabled() && process.env.NODE_ENV !== "production";
}

export function validateToken(token: string): string | null {
  const payload = readToken(token);
  return payload ? payload.userId : null;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}
