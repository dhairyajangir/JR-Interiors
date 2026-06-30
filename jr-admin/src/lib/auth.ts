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
  twoFactorEnabled: boolean;
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

const ABSOLUTE_TIMEOUT = 1000 * 60 * 60 * 12; // 12 hours
const IDLE_TIMEOUT = 1000 * 60 * 60 * 2; // 2 hours

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
      twoFactorEnabled: true,
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
    twoFactorEnabled: user.twoFactorEnabled,
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

export function makeTempLoginToken(userId: string): string {
  const secret = getSecret();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
  const payload = `${Buffer.from(userId).toString("base64url")}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyTempLoginToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const actual = parts[2];

  const a = Buffer.from(expected);
  const b = Buffer.from(actual);

  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expiresAt = Number(parts[1]);
  if (Date.now() > expiresAt) return null;

  return Buffer.from(parts[0], "base64url").toString("utf8");
}

function decodeBase32(charSequence: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bin = "";
  for (let idx = 0; idx < charSequence.length; idx++) {
    const char = charSequence[idx].toUpperCase();
    if (char === "=") break;
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bin += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let idx = 0; idx + 8 <= bin.length; idx += 8) {
    bytes.push(parseInt(bin.slice(idx, idx + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateBase32Secret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let idx = 0; idx < 16; idx++) {
    secret += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return secret;
}

export function getOTPAuthURI(email: string, secret: string): string {
  return `otpauth://totp/JR%20Admin:${encodeURIComponent(email)}?secret=${secret}&issuer=JR%20Admin`;
}

export function verifyTOTP(token: string, secret: string, window = 1): boolean {
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) return false;

  try {
    const key = decodeBase32(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const currentCounter = Math.floor(epoch / timeStep);

    for (let idx = -window; idx <= window; idx++) {
      const counter = currentCounter + idx;
      const buffer = Buffer.alloc(8);
      buffer.writeUInt32BE(0, 0);
      buffer.writeUInt32BE(counter, 4);

      const hmac = createHmac("sha1", key).update(buffer).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const code =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

      const expected = (code % 1_000_000).toString().padStart(6, "0");
      if (expected === cleanToken) return true;
    }
  } catch {
    return false;
  }
  return false;
}
