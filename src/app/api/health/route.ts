import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Liveness + DB readiness probe for load balancers / uptime monitors. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "up" });
  } catch (err: any) {
    return NextResponse.json({
      status: "degraded",
      db: "down",
      error: err?.message || String(err),
      env_db_url_exists: !!process.env.DATABASE_URL,
      env_db_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) : null
    }, { status: 503 });
  }
}
