import { headers } from "next/headers";
import { checkRateLimit } from "./rate-limit";
import { verifyTurnstileToken } from "./turnstile";

export async function getClientIp(): Promise<string> {
  const store = await headers();
  const forwardedFor = store.get("x-forwarded-for");
  const realIp = store.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";
}

export async function validateFormSecurity(
  formData: FormData,
  rateLimitKeyPrefix: string,
  limit = 5,
  windowMs = 300_000 // 5 minutes default
): Promise<{ error?: string; isSpam?: boolean }> {
  // 1. Honeypot check
  const honey = formData.get("website_honey");
  if (honey && typeof honey === "string" && honey.trim().length > 0) {
    // Fail silently or mark as spam to prevent database write
    return { isSpam: true };
  }

  // 2. Rate limit check
  const ip = await getClientIp();
  const { success } = await checkRateLimit(`${rateLimitKeyPrefix}:${ip}`, limit, windowMs);
  if (!success) {
    return { error: "Too many requests. Please try again later." };
  }

  // 3. Turnstile check
  const turnstileToken = formData.get("cf-turnstile-response");
  if (turnstileToken && typeof turnstileToken === "string") {
    const isValid = await verifyTurnstileToken(turnstileToken, ip);
    if (!isValid) {
      return { error: "Bot verification failed. Please try again." };
    }
  }

  return {};
}
