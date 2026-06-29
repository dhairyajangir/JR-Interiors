import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, type SafeUser } from "@/lib/auth";

export async function requireDashboardUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireDashboardAdmin(): Promise<SafeUser> {
  const user = await requireDashboardUser();
  if (!user.isAdmin) {
    redirect("/dashboard?error=admin-required");
  }
  return user;
}

export function formatCompactNumber(value: number): string {
  return value.toLocaleString("en-IN");
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function statusTone(status: string): string {
  switch (status.toLowerCase()) {
    case "published":
    case "live":
    case "active":
    case "confirmed":
    case "paid":
    case "delivered":
    case "completed":
    case "fulfilled":
      return "bg-mint/10 text-mint";
    case "pending":
    case "pending_review":
    case "processing":
    case "contacted":
    case "scheduled":
    case "trial":
      return "bg-sand text-ink";
    case "rejected":
    case "suspended":
    case "cancelled":
    case "failed":
    case "archived":
      return "bg-coral/10 text-coral";
    default:
      return "bg-white text-steel";
  }
}

export async function getAdminOverviewData() {
  const [
    orderAggregate,
    storefrontOrderCount,
    storefrontProductCount,
    storefrontSellerCount,
    storefrontConsultationCount,
    storefrontOrders,
    storefrontProducts,
    storefrontUsers,
    storefrontSellers,
    storefrontConsultations,
    adminProducts,
    auditLogs,
    allOrdersForCharts,
    allProductsForCharts,
    // Accurate counts — not capped by display list take limits
    lowStockCount,
    pendingProductsCount,
    pendingConsultationsCount,
  ] = await Promise.all([
    prisma.storefrontOrder.aggregate({
      _sum: { totalCents: true },
    }),
    prisma.storefrontOrder.count(),
    prisma.storefrontProduct.count(),
    prisma.storefrontSeller.count(),
    prisma.storefrontConsultation.count(),
    prisma.storefrontOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        items: true,
        user: true,
      },
    }),
    prisma.storefrontProduct.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        seller: true,
      },
    }),
    prisma.storefrontUser.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        orders: {
          select: {
            totalCents: true,
          },
        },
      },
    }),
    prisma.storefrontSeller.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: true,
        products: {
          select: { id: true },
        },
      },
    }),
    prisma.storefrontConsultation.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        owner: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            businessName: true,
          },
        },
      },
    }),
    prisma.storefrontOrder.findMany({
      select: {
        createdAt: true,
        totalCents: true,
        status: true,
      },
    }),
    prisma.storefrontProduct.findMany({
      select: {
        room: true,
      },
    }),
    // Accurate counters — separate from display list queries
    prisma.storefrontProduct.count({ where: { stock: { lte: 3 }, inStock: true } }),
    prisma.storefrontProduct.count({ where: { status: "PENDING" } }),
    prisma.storefrontConsultation.count({ where: { status: { not: "COMPLETED" } } }),
  ]);

  const revenueCents = orderAggregate._sum.totalCents ?? 0;
  // Keep display-list filtered arrays for the dashboard cards (first 8 items only)
  const lowStock = storefrontProducts.filter((product) => product.stock <= 3 && product.inStock);
  const pendingProducts = storefrontProducts.filter((product) => product.status === "PENDING");
  const pendingConsultations = storefrontConsultations.filter((c) => c.status !== "COMPLETED");
  const customerCount = await prisma.storefrontUser.count({
    where: { role: "CUSTOMER" },
  });

  // Aggregate monthly series for charts
  const revenueByMonth = new Map<string, number>();
  for (const order of allOrdersForCharts) {
    const key = `${order.createdAt.toLocaleString("en-IN", { month: "short" })} ${order.createdAt.getFullYear()}`;
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + order.totalCents);
  }
  const monthlySeries = Array.from(revenueByMonth.entries()).slice(-6);
  const maxRevenue = Math.max(...monthlySeries.map(([, value]) => value), 1);

  // Order status counts
  const statusCounts = allOrdersForCharts.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  // Category counts
  const roomCounts = allProductsForCharts.reduce<Record<string, number>>((acc, product) => {
    acc[product.room] = (acc[product.room] ?? 0) + 1;
    return acc;
  }, {});

  return {
    revenueCents,
    storefrontOrderCount,
    storefrontProductCount,
    storefrontSellerCount,
    storefrontConsultationCount,
    storefrontOrders,
    storefrontProducts,
    storefrontUsers,
    storefrontSellers,
    storefrontConsultations,
    adminProducts,
    auditLogs,
    customerCount,
    lowStock,
    pendingProducts,
    pendingConsultations,
    // Accurate platform-wide counts from dedicated queries
    lowStockCount,
    pendingProductsCount,
    pendingConsultationsCount,
    monthlySeries,
    maxRevenue,
    statusCounts,
    roomCounts,
  };
}
