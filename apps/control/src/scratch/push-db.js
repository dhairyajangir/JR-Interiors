const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 1. Resolve and Parse .env
const envPath = path.resolve(__dirname, "../../../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const firstEquals = trimmed.indexOf("=");
    if (firstEquals !== -1) {
      const key = trimmed.substring(0, firstEquals).trim();
      const value = trimmed.substring(firstEquals + 1).trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  });
}

// 2. Execute db:push
console.log("Running Prisma db push...");
try {
  execSync("pnpm --filter @jr/database exec prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Database schema pushed and client generated successfully!");
} catch (error) {
  console.error("Prisma db push failed:", error);
  process.exit(1);
}
