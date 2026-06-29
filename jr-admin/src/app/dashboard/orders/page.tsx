import { updateStorefrontOrderStatus } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/db";
import { formatDate, formatInr } from "@/lib/format";
import { formatCompactNumber, requireDashboardAdmin, statusTone } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireDashboardAdmin();
  const orders = await prisma.storefrontOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: true,
    },
  });

  return (
    <DashboardShell user={user} currentPath="/dashboard/orders">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Orders</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Customer Order Queue</h1>
        <p className="mt-1 text-sm text-steel">
          Review live storefront orders, track payment statuses, and manage fulfillment workflows.
        </p>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-lg font-semibold text-ink">Order queue</h2>
          <p className="text-sm text-steel">{formatCompactNumber(orders.length)} orders loaded</p>
        </div>
        <div className="divide-y divide-line">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col gap-3 px-6 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-ink">{order.number}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${statusTone(order.status)}`}>
                    {order.status}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${statusTone(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="mt-2 text-xs text-steel flex flex-wrap gap-x-4 gap-y-1 font-medium">
                  <span>Customer: <strong className="text-ink">{order.fullName}</strong> ({order.email})</span>
                  {order.phone ? <span>Phone: <strong className="text-ink">{order.phone}</strong></span> : null}
                  <span>Destination: <strong className="text-ink">{order.city}, {order.region}</strong></span>
                  <span>Placed: <strong className="text-ink">{formatDate(order.createdAt)}</strong></span>
                </div>
                
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-steel">Items:</span>
                  {order.items.map((item) => (
                    <span key={item.id} className="rounded-full bg-sand px-2.5 py-1 text-xs text-steel font-medium">
                      <strong className="text-ink">{item.name}</strong> (Qty {item.quantity} · {formatInr(Math.round(item.priceCents / 100))})
                    </span>
                  ))}
                </div>
              </div>

              <form action={updateStorefrontOrderStatus} className="flex flex-wrap items-center gap-4 border-t border-line/60 pt-3 mt-1">
                <input type="hidden" name="id" value={order.id} />
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-steel">Status:</span>
                  <select id={`status-${order.id}`} name="status" defaultValue={order.status} className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink outline-none transition focus:border-mint">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="text-xs text-steel flex flex-wrap gap-x-4 ml-auto">
                  <span>Method: <strong className="text-ink">{order.paymentMethod}</strong></span>
                  <span>Shipping: <strong className="text-ink">{order.shippingType}</strong></span>
                  <span>Total: <strong className="text-mint">{formatInr(Math.round(order.totalCents / 100))}</strong></span>
                </div>

                <button type="submit" className="rounded-full bg-ink px-4 py-1 text-xs font-semibold text-white transition hover:bg-mint whitespace-nowrap">
                  Save
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
