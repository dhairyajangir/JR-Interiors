import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

async function main() {
  const demoMode = process.env.DEMO_MODE === "true";
  const isProduction = process.env.NODE_ENV === "production";

  if (!demoMode || isProduction) {
    console.log("Skipping demo admin seed. DEMO_MODE must be true and NODE_ENV must not be production.");
    return;
  }

  const email = (process.env.DEMO_ADMIN_EMAIL || "admin@jrinteriors.com").toLowerCase();
  const password = process.env.DEMO_ADMIN_PASSWORD || "Demo@Admin2024";

  if (!process.env.DEMO_ADMIN_PASSWORD) {
    console.warn("DEMO_ADMIN_PASSWORD missing. Using dev-only fallback password.");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: {
          fullName: "JR Interiors Demo Admin",
          businessName: "JR Interiors Demo Workspace",
          phone: "+91 96678 64262",
          passwordHash: hashPassword(password),
          status: "ACTIVE",
          isAdmin: true,
          isDemo: true,
        },
        select: { email: true },
      })
    : await prisma.user.create({
        data: {
          email,
          fullName: "JR Interiors Demo Admin",
          businessName: "JR Interiors Demo Workspace",
          phone: "+91 96678 64262",
          passwordHash: hashPassword(password),
          status: "ACTIVE",
          isAdmin: true,
          isDemo: true,
        },
        select: { email: true },
      });

  console.log(`Demo admin ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
