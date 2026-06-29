export function verifyEnvConfig() {
  const isProd = process.env.NODE_ENV === "production";
  const isBuild = process.env.NEXT_PHASE?.includes("build") || process.env.CI === "true";

  if (isProd && !isBuild) {
    const required = ["AUTH_SECRET", "DATABASE_URL"];
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`[CRITICAL] Missing required environment variable: ${key}`);
      }
    }

    const secret = process.env.AUTH_SECRET!;
    if (secret === "jr-admin-dev-secret-change-me" || secret.length < 32) {
      throw new Error(
        "[CRITICAL] AUTH_SECRET is insecure. Must be at least 32 characters long and not the development default."
      );
    }
  }
}
