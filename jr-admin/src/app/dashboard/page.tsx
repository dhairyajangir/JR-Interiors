import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatInr } from "@/lib/format";

export const dynamic = "force-dynamic";

function statValue(value: number): string {
  return value.toLocaleString("en-IN");
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
      <section className="panel p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Catalog dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Product listing control center.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">
              This service only manages what appears on the platform. Add, update, delete, and organize listings without touching the storefront codepath.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/products/new" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint">
              Add product
            </Link>
            <Link href="/onboarding" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-steel transition hover:border-ink hover:text-ink">
              UPI billing
            </Link>
          </div>
        </div>

        {payment && payment.status === "PENDING" ? (
          <div className="mt-6 rounded-[24px] border border-coral/20 bg-coral/10 px-5 py-4 text-sm text-coral">
            Registration payment still pending. You can keep managing listings, or{" "}
            <Link href="/onboarding" className="font-semibold underline">
              finish UPI payment now
            </Link>
            .
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Total listings</p>
          <p className="mt-3 text-4xl font-semibold text-ink">{statValue(products.length)}</p>
        </article>
        <article className="panel p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Live now</p>
          <p className="mt-3 text-4xl font-semibold text-ink">{statValue(live)}</p>
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
            <p className="text-sm text-steel">{statValue(totalInventory)} total units across all listings</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-xl font-semibold text-ink">No listings yet.</p>
            <p className="mt-3 text-sm text-steel">Create the first product for this standalone platform service.</p>
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
                    <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-steel">
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
