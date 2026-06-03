import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { priceExact } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { AdminNav } from "@/components/AdminNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders · Admin", robots: { index: false } };

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();

  // Hide existence from non-admins.
  if (!user?.isAdmin) notFound();

  const [orders, stats, pendingCount] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 100 }),
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true }),
    prisma.product.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <AdminNav active="/admin/orders" pendingListings={pendingCount} />
        <div className="mb-stack-md">
          <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-2">Orders</h1>
          <p className="text-body-lg text-on-surface-variant">
            {stats._count} order{stats._count === 1 ? "" : "s"} · {priceExact(stats._sum.totalCents ?? 0)} total
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-10 text-center text-on-surface-variant">
            <Icon name="inbox" className="text-5xl text-outline-variant mb-4" />
            <p>No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-surface-container-lowest rounded-xl editorial-shadow p-6">
                <div className="flex flex-wrap justify-between gap-4 items-start">
                  <div>
                    <p className="text-label-sm font-bold text-primary">{o.number}</p>
                    <p className="text-label-xs text-on-surface-variant">{dateFmt.format(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-label-xs uppercase tracking-wider bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
                      {o.paymentMethod === "razorpay" ? "Online" : "COD"}
                    </span>
                    <span
                      className={`text-label-xs uppercase tracking-wider px-3 py-1 rounded-full ${
                        o.paymentStatus === "paid"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary-fixed text-on-tertiary-fixed"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                    <span className="text-body-md font-bold text-primary tabular-nums">{priceExact(o.totalCents)}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-label-sm">
                  <div>
                    <p className="text-on-surface font-semibold">{o.fullName}</p>
                    <p className="text-on-surface-variant">{o.email}{o.phone ? ` · ${o.phone}` : ""}</p>
                    <p className="text-on-surface-variant">
                      {o.address1}{o.address2 ? `, ${o.address2}` : ""}, {o.city}, {o.region} {o.postalCode}
                    </p>
                  </div>
                  <ul className="text-on-surface-variant space-y-1">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex justify-between gap-4">
                        <span>{it.name} × {it.quantity}{[it.finish, it.upholstery].filter(Boolean).length ? ` · ${[it.finish, it.upholstery].filter(Boolean).join(" · ")}` : ""}</span>
                        <span className="tabular-nums shrink-0">{priceExact(it.priceCents * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
