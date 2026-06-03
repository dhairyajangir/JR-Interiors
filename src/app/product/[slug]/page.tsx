import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { price } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { ProductView } from "@/components/ProductView";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

type Finish = { name: string; hex: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Not found | JR INTERIORS" };
  return {
    title: `${product.name} | JR INTERIORS`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { reviews: { orderBy: { createdAt: "asc" } }, category: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { room: product.room, id: { not: product.id } },
    take: 4,
    orderBy: { reviewCount: "desc" },
  });

  return (
    <main className="pt-24 md:pt-28 pb-stack-lg">
      {/* Breadcrumb */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        <nav className="flex text-label-sm text-on-surface-variant/60 gap-2">
          <Link className="hover:text-primary transition-colors" href="/furniture">Furniture</Link>
          <span>/</span>
          <Link className="hover:text-primary transition-colors" href={`/furniture?room=${product.room}`}>
            {product.category?.name ?? product.room}
          </Link>
          <span>/</span>
          <span className="text-on-surface-variant">{product.name}</span>
        </nav>
      </div>

      <ProductView
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          series: product.series,
          description: product.description,
          priceCents: product.priceCents,
          material: product.material,
          rating: product.rating,
          reviewCount: product.reviewCount,
          images: product.images.length ? product.images : [product.imageUrl],
          finishes: (product.finishes as unknown as Finish[]) ?? [],
          upholstery: product.upholstery,
        }}
        reviews={product.reviews.map((r) => ({
          id: r.id,
          author: r.author,
          initials: r.initials,
          rating: r.rating,
          body: r.body,
        }))}
      />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-stack-lg bg-surface-container-low py-stack-lg">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex justify-between items-end mb-stack-sm">
              <div>
                <span className="text-label-xs uppercase tracking-widest text-outline">Curated Pairs</span>
                <h2 className="text-headline-section-mobile md:text-headline-section text-primary">Complete the Space</h2>
              </div>
            </div>
            <div className="flex gap-gutter overflow-x-auto pb-8 scroll-hide">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/product/${r.slug}`}
                  className="min-w-[280px] sm:min-w-[300px] bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="h-64 rounded-lg overflow-hidden bg-surface-container mb-4 relative">
                    <Image src={r.imageUrl} alt={r.name} fill sizes="300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    {r.tagline && (
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="bg-white/90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          {r.tagline.split(" / ")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-label-sm text-on-surface mb-1">{r.name}</h4>
                  <p className="text-label-sm text-primary">{price(r.priceCents)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
