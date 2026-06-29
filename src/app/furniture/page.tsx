import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { CatalogControls, SortBar, PageLink, PageArrow } from "@/components/CatalogControls";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

const PER_PAGE = 8;

type SP = Promise<Record<string, string | string[] | undefined>>;

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function FurniturePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" ? sp.type : undefined;
  const room = typeof sp.room === "string" ? sp.room : undefined;
  const materials = asArray(sp.material);
  const sort = (typeof sp.sort === "string" ? sp.sort : "newest") as string;
  const page = Math.max(1, parseInt((sp.page as string) ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(type ? { type } : {}),
    ...(room ? { room } : {}),
    ...(materials.length ? { material: { in: materials } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { priceCents: "asc" }
      : sort === "price-desc"
      ? { priceCents: "desc" }
      : sort === "popular"
      ? { reviewCount: "desc" }
      : { createdAt: "desc" };

  const [total, products, user] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getCurrentUser(),
  ]);
  const savedIds = await getWishlistProductIds(user?.id, products.map((product) => product.id));

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <main className="pt-32 pb-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-stack-md reveal">
          <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-4">
            The Furniture Collection
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Discover a curated selection of artisanal pieces crafted for modern
            sanctuaries. From minimalist silhouettes to tactile walnut finishes.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-gutter">
          <CatalogControls />

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-label-sm text-on-surface-variant">
                Showing {from}–{to} of {total} results
              </span>
              <div className="hidden md:block">
                <SortBar sort={sort} />
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-stack-lg text-center text-on-surface-variant">
                <p className="text-subheading text-primary mb-2">No pieces match those filters.</p>
                <p>Try removing a filter to see more of the collection.</p>
              </div>
            ) : (
              <div className="reveal-group grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-gutter">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    initialSaved={savedIds.has(p.id)}
                    product={{
                      id: p.id,
                      slug: p.slug,
                      name: p.name,
                      tagline: p.tagline,
                      priceCents: p.priceCents,
                      imageUrl: p.imageUrl,
                      colorHexes: p.colorHexes,
                    }}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-stack-lg flex justify-center items-center gap-4">
                <PageArrow page={page - 1} dir="left" disabled={page <= 1} />
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <PageLink key={n} page={n} current={n === page}>
                      {n}
                    </PageLink>
                  ))}
                </div>
                <PageArrow page={page + 1} dir="right" disabled={page >= totalPages} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
