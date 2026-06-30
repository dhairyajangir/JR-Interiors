import Link from "next/link";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { DashboardShell } from "@/components/DashboardShell";
import { updateStorefrontProductStatus } from "@/app/actions";
import { prisma } from "@/lib/db";
import { formatDate, formatInr } from "@/lib/format";
import { formatCompactNumber, requireDashboardUser, statusTone } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const user = await requireDashboardUser();

  if (!user.isAdmin) {
    const products = await prisma.product.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return (
      <DashboardShell user={user} currentPath="/dashboard/products">
        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Your listings</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Product Catalog</h1>
            <p className="mt-1 text-sm text-steel max-w-2xl">
              Create and maintain your workspace listings. Published items appear on the main storefront.
            </p>
          </div>
          <Link href="/dashboard/products/new" className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-mint whitespace-nowrap">
            Add product
          </Link>
        </div>

        <section className="panel overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Listings</h2>
            <p className="text-sm text-steel">{formatCompactNumber(products.length)} records</p>
          </div>
          <div className="divide-y divide-line">
            {products.map((product) => (
              <article key={product.id} className="grid gap-4 px-6 py-4 lg:grid-cols-[80px_minmax(0,1fr)_auto] lg:items-center">
                <div className="overflow-hidden rounded-[16px] border border-line bg-sand h-20 w-20 shrink-0">
                  <img src={product.coverImage} alt={product.title} className="aspect-[4/3] h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-base font-semibold text-ink">{product.title}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${statusTone(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-steel">{product.shortDescription}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-steel">
                    <span>{formatInr(product.priceInr)}</span>
                    <span>{product.category}</span>
                    <span>{product.inventory} in stock</span>
                    <span>Updated {formatDate(product.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/dashboard/products/${product.id}/edit`} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-steel transition hover:border-ink hover:text-ink">
                    Edit
                  </Link>
                  <DeleteProductButton id={product.id} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </DashboardShell>
    );
  }

  const [adminProducts, storefrontProducts] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        owner: true,
      },
    }),
    prisma.storefrontProduct.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        seller: true,
      },
    }),
  ]);

  return (
    <DashboardShell user={user} currentPath="/dashboard/products">
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Products</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Product Management & Moderation</h1>
          <p className="mt-1 text-sm text-steel max-w-2xl">
            Review live storefront products or manage internal admin-scoped catalog listings.
          </p>
        </div>
        <Link href="/dashboard/products/new" className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-mint whitespace-nowrap">
          Add internal listing
        </Link>
      </div>

      <div className="space-y-6">
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Storefront moderation</h2>
            <p className="text-sm text-steel">{formatCompactNumber(storefrontProducts.length)} storefront products with live admin controls</p>
          </div>
          <div className="divide-y divide-line">
            {storefrontProducts.map((product) => (
              <article key={product.id} className="flex flex-col gap-4 px-6 py-5">
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[16px] border border-line bg-sand">
                    <img src={product.imageUrl} alt={product.name} className="aspect-[4/3] h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-ink">{product.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${statusTone(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-steel/80">
                      {product.seller?.brandName ?? "JR Interiors"} · {product.room} / {product.type}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-steel">{product.description}</p>
                    {product.reviewNote ? (
                      <div className="mt-2 text-xs text-coral font-medium">
                        Seller note: <span className="italic">{product.reviewNote}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <form action={updateStorefrontProductStatus} className="flex flex-wrap items-center gap-4 border-t border-line/60 pt-3">
                  <input type="hidden" name="id" value={product.id} />
                  
                  <div className="flex items-center gap-2">
                    <label htmlFor={`status-${product.id}`} className="text-xs font-semibold text-steel">Moderation:</label>
                    <select
                      id={`status-${product.id}`}
                      name="status"
                      defaultValue={product.status}
                      className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink outline-none transition focus:border-mint"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div className="flex flex-1 min-w-[200px] items-center gap-2">
                    <label htmlFor={`reviewNote-${product.id}`} className="text-xs font-semibold text-steel">Review note:</label>
                    <input
                      id={`reviewNote-${product.id}`}
                      name="reviewNote"
                      defaultValue={product.reviewNote ?? ""}
                      className="flex-1 rounded-full border border-line bg-white px-4 py-1 text-xs text-ink outline-none transition placeholder:text-steel/50 focus:border-mint"
                      placeholder="Optional note for seller..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-full bg-ink px-4 py-1 text-xs font-semibold text-white transition hover:bg-mint whitespace-nowrap"
                  >
                    Save
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Internal admin listings</h2>
            <p className="text-sm text-steel">{formatCompactNumber(adminProducts.length)} records in `jr_admin`</p>
          </div>
          <div className="divide-y divide-line">
            {adminProducts.map((product) => (
              <article key={product.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{product.title}</p>
                    <p className="mt-1 text-sm text-steel">{product.owner.businessName} · {formatInr(product.priceInr)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusTone(product.status)}`}>
                    {product.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
