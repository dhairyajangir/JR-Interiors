import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/format";
import { formatCompactNumber, requireDashboardAdmin, statusTone } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireDashboardAdmin();
  const [orders, products] = await Promise.all([
    prisma.storefrontOrder.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        totalCents: true,
        status: true,
      },
    }),
    prisma.storefrontProduct.findMany({
      select: {
        id: true,
        room: true,
        status: true,
        stock: true,
      },
    }),
  ]);

  const revenueByMonth = new Map<string, number>();
  for (const order of orders) {
    const key = `${order.createdAt.toLocaleString("en-IN", { month: "short" })} ${order.createdAt.getFullYear()}`;
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + order.totalCents);
  }

  const monthlySeries = Array.from(revenueByMonth.entries()).slice(-6);
  const maxRevenue = Math.max(...monthlySeries.map(([, value]) => value), 1);

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  const roomCounts = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.room] = (acc[product.room] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardShell user={user} currentPath="/dashboard/analytics">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Operating Analytics</h1>
        <p className="mt-1 text-sm text-steel">
          Server-rendered metrics for catalog performance, stock levels, and store revenue.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6">
          <h2 className="text-lg font-semibold text-ink">Revenue trend</h2>
          <div className="mt-8 grid h-[260px] grid-cols-6 items-end gap-4">
            {monthlySeries.map(([label, value]) => (
              <div key={label} className="flex h-full flex-col justify-end text-center">
                <div
                  className="rounded-t-lg bg-mint/80 transition-all duration-300 hover:bg-mint"
                  style={{ height: `${Math.max(14, Math.round((value / maxRevenue) * 100))}%` }}
                />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-steel">{label}</p>
                <p className="mt-1 text-xs font-semibold text-ink">{formatInr(Math.round(value / 100))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="text-lg font-semibold text-ink">Order status mix</h2>
            <div className="mt-6 space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = orders.length || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-steel">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${statusTone(status)}`}>
                        {status}
                      </span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-sand rounded-full h-1.5">
                      <div className="bg-coral h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-lg font-semibold text-ink">Category spread</h2>
            <div className="mt-6 space-y-4">
              {Object.entries(roomCounts).map(([room, count]) => {
                const total = products.length || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={room} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-steel">
                      <span className="text-ink">{room}</span>
                      <span>{count} listings ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-sand rounded-full h-1.5">
                      <div className="bg-mint h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}
