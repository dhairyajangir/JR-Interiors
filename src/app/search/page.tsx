import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";

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

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-stack-md">
          <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-6">Search</h1>
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
              <div className="reveal-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                {results.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{ id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, priceCents: p.priceCents, imageUrl: p.imageUrl, colorHexes: p.colorHexes }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-label-xs uppercase tracking-widest text-on-surface-variant text-center mb-8">Signature Pieces</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {popular.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{ id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, priceCents: p.priceCents, imageUrl: p.imageUrl, colorHexes: p.colorHexes }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
