import "server-only";

import { headers } from "next/headers";

export function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET_KEY || null;
}

export async function isAdminRequestAuthorized(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;

  const store = await headers();
  const headerSecret = store.get("x-admin-key");
  return Boolean(headerSecret && headerSecret === secret);
}

export async function requireAdminRequestAuthorization(): Promise<boolean> {
  return isAdminRequestAuthorized();
}