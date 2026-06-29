import { headers } from "next/headers";

type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_LIMIT_KEYS = 5000;

export async function getRequestMeta(): Promise<{ ipAddress: string | null; userAgent: string | null }> {
  const store = await headers();
  const forwardedFor = store.get("x-forwarded-for");
  const realIp = store.get("x-real-ip");

  return {
    ipAddress: forwardedFor?.split(",")[0]?.trim() || realIp || null,
    userAgent: store.get("user-agent"),
  };
}

export async function enforceSameOrigin(): Promise<void> {
  const store = await headers();
  const origin = store.get("origin");
  const host = store.get("x-forwarded-host") || store.get("host");
  if (!origin || !host) return;

  const originHost = new URL(origin).host;
  if (originHost !== host) {
    throw new Error("Blocked cross-origin request.");
  }
}

export async function enforceRateLimit(config: RateLimitConfig): Promise<void> {
  const now = Date.now();
  
  // Clean up expired keys if store exceeds capacity limit
  if (rateLimitStore.size >= MAX_LIMIT_KEYS) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.expiresAt <= now) {
        rateLimitStore.delete(key);
      }
    }
    // If still too full, evict first key to stay safe
    if (rateLimitStore.size >= MAX_LIMIT_KEYS) {
      const firstKey = rateLimitStore.keys().next().value;
      if (firstKey) {
        rateLimitStore.delete(firstKey);
      }
    }
  }

  const current = rateLimitStore.get(config.key);

  if (!current || current.expiresAt <= now) {
    rateLimitStore.set(config.key, {
      count: 1,
      expiresAt: now + config.windowMs,
    });
    return;
  }

  if (current.count >= config.limit) {
    throw new Error("Too many requests. Please wait a minute and try again.");
  }

  current.count += 1;
  rateLimitStore.set(config.key, current);
}
