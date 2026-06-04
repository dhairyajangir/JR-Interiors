import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "jr_admin_session";
const MAX_AGE = 60 * 60 * 24 * 30;
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
};

function sign(value: string, secret = getSecret()): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function makeToken(userId: string, secret = getSecret()): string {
  const payload = `${Buffer.from(userId).toString("base64url")}.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload, secret)}`;
}

function readToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const actual = parts[2];

  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(actual))) return null;
  if (Date.now() > Number(parts[1])) return null;

  return Buffer.from(parts[0], "base64url").toString("utf8");
}

export async function startSession(userId: string): Promise<void> {
  const secret = getSecret();
  const store = await cookies();
  store.set(COOKIE, makeToken(userId, secret), {
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

export async function getCurrentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const userId = readToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    businessName: user.businessName,
    phone: user.phone,
    status: user.status,
  };
}
