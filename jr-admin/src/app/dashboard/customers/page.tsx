import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/db";
import { formatDate, formatInr } from "@/lib/format";
import { formatCompactNumber, requireDashboardAdmin } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const user = await requireDashboardAdmin();
  const customers = await prisma.storefrontUser.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: {
          totalCents: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <DashboardShell user={user} currentPath="/dashboard/customers">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Customers</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Customer Registry</h1>
        <p className="mt-1 text-sm text-steel">
          View customer profiles, total orders, and aggregate spend metrics directly from the storefront database.
        </p>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-lg font-semibold text-ink">Customer registry</h2>
          <p className="text-sm text-steel">{formatCompactNumber(customers.length)} customer records found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-line bg-sand/70 text-steel font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Customer info</th>
                <th className="px-6 py-3 font-semibold">Total orders</th>
                <th className="px-6 py-3 font-semibold">Aggregate spend</th>
                <th className="px-6 py-3 font-semibold">Last order date</th>
                <th className="px-6 py-3 font-semibold">Registration date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((customer) => {
                const spendCents = customer.orders.reduce((sum, order) => sum + order.totalCents, 0);
                const lastOrder = customer.orders
                  .slice()
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

                return (
                  <tr key={customer.id} className="hover:bg-sand/30 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink">{customer.fullName}</p>
                      <p className="mt-0.5 text-steel font-medium">{customer.email}</p>
                      <p className="mt-0.5 text-steel/60 text-[10px] font-semibold">{customer.phone ?? "No phone captured"}</p>
                    </td>
                    <td className="px-6 py-4 text-ink font-semibold">{formatCompactNumber(customer.orders.length)}</td>
                    <td className="px-6 py-4 text-ink font-semibold">{formatInr(Math.round(spendCents / 100))}</td>
                    <td className="px-6 py-4 text-steel font-medium">{lastOrder ? formatDate(lastOrder.createdAt) : "-"}</td>
                    <td className="px-6 py-4 text-steel font-medium">{formatDate(customer.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
