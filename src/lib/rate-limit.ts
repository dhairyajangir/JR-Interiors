import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Safe fallback in development if Redis is not configured
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`[RateLimit] Redis is not configured. Bypassing rate limit for key: ${key}`);
    }
    return { success: true, limit, remaining: limit, reset: Date.now() + windowMs };
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    analytics: true,
  });

  const { success, limit: limitVal, remaining, reset } = await ratelimit.limit(key);
  return { success, limit: limitVal, remaining, reset };
}
