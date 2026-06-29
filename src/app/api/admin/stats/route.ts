import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminRequestAuthorization } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminRequestAuthorization())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [revenue, orders, products, customers, sellers, consultations, pendingOrders, pendingConsultations] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.seller.count(),
    prisma.consultation.count(),
    prisma.order.count({ where: { status: { in: ["pending", "confirmed", "processing"] } } }),
    prisma.consultation.count({ where: { status: { in: ["NEW", "CONTACTED", "SCHEDULED"] } } }),
  ]);

  return NextResponse.json({
    revenueCents: revenue._sum.totalCents ?? 0,
    orders,
    products,
    customers,
    sellers,
    consultations,
    pendingOrders,
    pendingConsultations,
  });
}