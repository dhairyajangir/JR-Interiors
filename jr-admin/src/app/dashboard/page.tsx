import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { prisma } from "@/lib/db";
import { formatDate, formatInr } from "@/lib/format";
import {
  formatCompactNumber,
  getAdminOverviewData,
  requireDashboardUser,
  statusTone,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireDashboardUser();

  if (!user.isAdmin) {
    const [products, payment] = await Promise.all([
      prisma.product.findMany({
        where: { ownerId: user.id },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.registrationPayment.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const live = products.filter((item) => item.status === "LIVE").length;
    const totalInventory = products.reduce((sum, item) => sum + item.inventory, 0);
    const averagePrice = products.length
      ? Math.round(products.reduce((sum, item) => sum + item.priceInr, 0) / products.length)
      : 0;

    return (
      <DashboardShell user={user} currentPath="/dashboard">
        <div className="mb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Catalog dashboard</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Product Listing Control Center</h1>
              <p className="mt-1 text-sm text-steel max-w-2xl">
                Manage your product listings and view catalog stats. Complete your UPI onboarding below if pending.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/products/new" className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-mint">
                Add product
              </Link>
              <Link href="/onboarding" className="rounded-full border border-line bg-white/60 px-5 py-2.5 text-xs font-semibold text-steel transition hover:border-ink hover:text-ink">
                UPI billing
              </Link>
            </div>
          </div>

          {payment && payment.status === "PENDING" ? (
            <div className="mt-4 rounded-xl border border-coral/20 bg-coral/10 px-5 py-4 text-sm text-coral">
              Registration payment still pending. You can keep managing listings, or{" "}
              <Link href="/onboarding" className="font-semibold underline">
                finish UPI payment now
              </Link>
              .
            </div>
          ) : null}
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="panel p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Total listings</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{formatCompactNumber(products.length)}</p>
          </article>
          <article className="panel p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-coral">Live now</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{formatCompactNumber(live)}</p>
          </article>
          <article className="panel p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Avg price</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{averagePrice ? formatInr(averagePrice) : "-"}</p>
          </article>
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <p className="text-lg font-semibold text-ink">Products</p>
              <p className="text-sm text-steel">{formatCompactNumber(totalInventory)} total units across all listings</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-xl font-semibold text-ink">No listings yet.</p>
              <p className="mt-3 text-sm text-steel">Create first product for this standalone workspace.</p>
              <Link href="/dashboard/products/new" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint">
                Add first product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {products.map((product) => (
                <article key={product.id} className="grid gap-5 px-6 py-5 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-center">
                  <div className="overflow-hidden rounded-[20px] border border-line bg-sand">
                    <img src={product.coverImage} alt={product.title} className="aspect-[4/3] h-auto w-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-ink">{product.title}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusTone(product.status)}`}>
                        {product.status}
                      </span>
                      {product.featured ? (
                        <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-mint">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">{product.shortDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-steel">
                      <span>{formatInr(product.priceInr)}</span>
                      <span>{product.category}</span>
                      <span>{product.inventory} in stock</span>
                      <span>Updated {formatDate(product.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/dashboard/products/${product.id}/edit`} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-steel transition hover:border-ink hover:text-ink">
                      Edit
                    </Link>
                    <DeleteProductButton id={product.id} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </DashboardShell>
    );
  }

  const data = await getAdminOverviewData();

  return (
    <DashboardShell user={user} currentPath="/dashboard">
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Platform overview</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Compact control room for orders, moderation, sellers, and follow-up.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-steel">
            Direct Prisma bridge into `public` plus admin-only controls in `jr_admin`. Use this surface to keep storefront operations moving without switching apps.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/orders" className="rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-mint whitespace-nowrap">
            Review live orders
          </Link>
          <Link href="/dashboard/products" className="rounded-full border border-line px-5 py-3 text-center text-sm font-semibold text-steel transition hover:border-ink hover:text-ink whitespace-nowrap">
            Moderate products
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Revenue tracked</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{formatInr(Math.round(data.revenueCents / 100))}</p>
          <p className="mt-2 text-sm text-steel">{formatCompactNumber(data.storefrontOrderCount)} orders across storefront history</p>
        </article>
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Customers</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{formatCompactNumber(data.customerCount)}</p>
          <p className="mt-2 text-sm text-steel">{formatCompactNumber(data.storefrontConsultationCount)} total consultations on record</p>
        </article>
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Products</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{formatCompactNumber(data.storefrontProductCount)}</p>
          <p className="mt-2 text-sm text-steel">{formatCompactNumber(data.pendingProductsCount)} pending moderation, {formatCompactNumber(data.lowStockCount)} low stock</p>
        </article>
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Sellers</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{formatCompactNumber(data.storefrontSellerCount)}</p>
          <p className="mt-2 text-sm text-steel">{formatCompactNumber(data.adminProducts.length)} internal admin listings recently updated</p>
        </article>
      </section>

      {/* Performance Analytics Grid */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Revenue trend</h2>
              <p className="text-sm text-steel">Sales performance aggregated over the last 6 months.</p>
            </div>
            <Link href="/dashboard/analytics" className="text-sm font-semibold text-mint">
              Detailed view
            </Link>
          </div>
          <div className="mt-6 grid h-[200px] grid-cols-6 items-end gap-4">
            {data.monthlySeries.map(([label, value]) => (
              <div key={label} className="flex h-full flex-col justify-end text-center">
                <div
                  className="rounded-t-lg bg-mint/80 transition-all duration-300 hover:bg-mint"
                  style={{ height: `${Math.max(10, Math.round((value / data.maxRevenue) * 100))}%` }}
                />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-steel">{label}</p>
                <p className="mt-1 text-xs font-semibold text-ink">{formatInr(Math.round(value / 100))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-lg font-semibold text-ink">Category spread</h2>
            <p className="text-sm text-steel mb-4">Storefront products by room category.</p>
            <div className="space-y-4">
              {Object.entries(data.roomCounts).slice(0, 3).map(([room, count]) => {
                const total = data.storefrontProductCount || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={room} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-steel font-semibold">
                      <span className="text-ink">{room}</span>
                      <span>{count} listings ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-sand rounded-full h-2">
                      <div className="bg-mint h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="text-lg font-semibold text-ink">Order status mix</h2>
            <p className="text-sm text-steel mb-4">Total platform orders grouped by progress state.</p>
            <div className="space-y-4">
              {Object.entries(data.statusCounts).slice(0, 3).map(([status, count]) => {
                const total = data.storefrontOrderCount || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-steel font-semibold">
                      <span className="text-ink uppercase tracking-wider text-[10px]">{status}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-sand rounded-full h-2">
                      <div className="bg-coral h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-ink">Recent orders</h2>
              <p className="text-sm text-steel">Latest storefront activity with payment and fulfillment signal.</p>
            </div>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-mint">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {data.storefrontOrders.map((order) => (
              <article key={order.id} className="grid gap-3 px-6 py-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-ink">{order.number}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusTone(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusTone(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-steel">
                    {order.fullName} · {order.items.length} items · {formatDate(order.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-ink">{formatInr(Math.round(order.totalCents / 100))}</p>
                <Link href="/dashboard/orders" className="text-sm font-semibold text-mint">
                  Manage
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="text-lg font-semibold text-ink">Follow-up queue</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-[22px] bg-sand px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-coral">Consultations</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{formatCompactNumber(data.pendingConsultationsCount)}</p>
                <p className="mt-1 text-sm text-steel">Requests still open across new, contacted, and scheduled states.</p>
              </div>
              <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.24em] text-mint">Low stock</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{formatCompactNumber(data.lowStockCount)}</p>
                <p className="mt-1 text-sm text-steel">Storefront products with 3 units or fewer remaining.</p>
              </div>
            </div>
          </section>

          <section className="panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Recent audit</h2>
              <Link href="/dashboard/audit" className="text-sm font-semibold text-mint">
                Open log
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {data.auditLogs.slice(0, 4).map((entry) => (
                <article key={entry.id} className="rounded-[22px] border border-line bg-white/80 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusTone(entry.action)}`}>
                      {entry.action.replaceAll("_", " ")}
                    </span>
                    <p className="text-xs uppercase tracking-[0.2em] text-steel">{formatDate(entry.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">{entry.user.fullName}</p>
                  <p className="mt-1 text-sm text-steel">{entry.details ?? "No extra details recorded."}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}
