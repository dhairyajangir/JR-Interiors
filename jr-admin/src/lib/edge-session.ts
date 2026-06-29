import { SESSION_COOKIE } from "@/lib/session-config";

const encoder = new TextEncoder();

function getSecret() {
  return process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
}

function fromBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeUserId(value: string): string | null {
  try {
    return fromBase64Url(value);
  } catch {
    return null;
  }
}

async function sign(payload: string, secret = getSecret()): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export async function validateEdgeToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = await sign(payload);
  if (expected !== parts[2]) return null;

  if (Date.now() > Number(parts[1])) return null;
  return decodeUserId(parts[0]);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
