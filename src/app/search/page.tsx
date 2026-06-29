import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/wishlist";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search | JR INTERIORS" };

type SP = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query
    ? await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { material: { contains: query, mode: "insensitive" } },
            { tagline: { contains: query, mode: "insensitive" } },
            { type: { contains: query, mode: "insensitive" } },
            { room: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { reviewCount: "desc" },
        take: 24,
      })
    : [];

  const popular = !query
    ? await prisma.product.findMany({ where: { signature: true, status: "PUBLISHED" }, take: 4, orderBy: { priceCents: "desc" } })
    : [];
  const products = query ? results : popular;
  const user = await getCurrentUser();
  const savedIds = await getWishlistProductIds(user?.id, products.map((product) => product.id));

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-stack-md">
          <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-6 font-bold">Search</h1>
          <SearchBox />
        </div>

        {query ? (
          <>
            <p className="text-label-sm text-on-surface-variant mb-6">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            {results.length === 0 ? (
              <div className="py-stack-lg text-center text-on-surface-variant">
                <p className="text-subheading text-primary mb-2">Nothing matched that search.</p>
                <Link href="/furniture" className="text-primary underline">Browse the full collection</Link>
              </div>
            ) : (
              <div className="reveal-group grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-gutter">
                {results.map((p) => (
                  <ProductCard
                    key={p.id}
                    initialSaved={savedIds.has(p.id)}
                    product={{ id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, priceCents: p.priceCents, imageUrl: p.imageUrl, colorHexes: p.colorHexes }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-12">
            {/* Trending & Categories Suggestions */}
            <div className="max-w-2xl mx-auto space-y-8 text-left">
              <div>
                <h3 className="text-label-xs uppercase tracking-widest text-on-surface-variant/80 mb-3.5 font-bold">Trending Searches</h3>
                <div className="flex flex-wrap gap-2.5">
                  {["Walnut", "Sofa", "Leather", "Oak", "Dining Table", "Brushed Brass"].map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-body-md rounded-full text-primary border border-outline-variant/20 hover:border-primary/45 transition min-h-[44px] flex items-center"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-label-xs uppercase tracking-widest text-on-surface-variant/80 mb-3.5 font-bold">Shop by Category</h3>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: "Seating", type: "Seating" },
                    { label: "Tables", type: "Tables" },
                    { label: "Bedroom", type: "Bedroom" },
                    { label: "Lighting", type: "Lighting" },
                    { label: "Decor", type: "Decor" }
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={`/furniture?type=${encodeURIComponent(cat.type)}`}
                      className="px-4 py-2 bg-primary/5 hover:bg-primary hover:text-on-primary text-body-md font-semibold text-primary rounded-full transition min-h-[44px] flex items-center"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant text-center mb-6 font-semibold">Signature Masterpieces</p>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-gutter">
                {popular.map((p) => (
                  <ProductCard
                    key={p.id}
                    initialSaved={savedIds.has(p.id)}
                    product={{ id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, priceCents: p.priceCents, imageUrl: p.imageUrl, colorHexes: p.colorHexes }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
