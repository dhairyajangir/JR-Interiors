import "server-only";

export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // If not configured, fail-safe or warn in dev
    if (process.env.NODE_ENV === "production") {
      console.error("[Turnstile] TURNSTILE_SECRET_KEY is missing in production.");
      return false;
    }
    return true; // Bypass in development to prevent blocking
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    return data.success;
  } catch (error) {
    console.error("[Turnstile] Verification failed:", error);
    return false;
  }
}
