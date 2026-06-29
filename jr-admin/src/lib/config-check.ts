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
    if (secret === "jr-admin-dev-secret-change-me") {
      throw new Error(
        "[CRITICAL] AUTH_SECRET matches the development default. You must change it in production."
      );
    }

    if (secret.length < 16) {
      console.warn(
        "[CRITICAL] AUTH_SECRET is extremely weak (under 16 chars). Please rotate it."
      );
    } else if (secret.length < 32) {
      console.warn(
        "[WARNING] AUTH_SECRET is under 32 chars. A longer random key is recommended for enterprise strength."
      );
    }
  }
}
