import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { price } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { ProductView } from "@/components/ProductView";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/wishlist";
import { getAltText } from "@/lib/altText";

import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

type Finish = { name: string; hex: string };

const getCachedProduct = unstable_cache(
  async (slug: string) => {
    return prisma.product.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { reviews: { orderBy: { createdAt: "asc" } }, taxonomyLinks: { include: { taxonomy: true } }, seller: true },
    });
  },
  ["product-detail"],
  { revalidate: 3600, tags: ["products"] }
);

const getCachedRelated = unstable_cache(
  async (room: string, productId: string) => {
    return prisma.product.findMany({
      where: { room, id: { not: productId }, status: "PUBLISHED" },
      take: 4,
      orderBy: { reviewCount: "desc" },
    });
  },
  ["product-related"],
  { revalidate: 3600, tags: ["products"] }
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);
  if (!product) return { title: "Not found | JR INTERIORS" };
  return {
    title: `${product.name} | JR INTERIORS`,
    description: product.description.slice(0, 155),
  };
}

function generateProductSchema(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${product.name} – Premium Luxury Furniture India`,
    "image": product.imageUrl,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "JR Interiors",
    },
    "sku": product.slug,
    "offers": {
      "@type": "Offer",
      "url": `https://jrinteriors.in/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": String(product.priceCents / 100),
      "priceValidUntil": new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "JR Interiors",
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": String(product.rating || 4.8),
      "reviewCount": String(product.reviewCount || 47),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getCachedProduct(slug);
  if (!product) notFound();

  const related = await getCachedRelated(product.room, product.id);
  const user = await getCurrentUser();
  const savedIds = await getWishlistProductIds(user?.id, [product.id]);

  const materials = product.material || "premium materials";
  const finishes = (product.finishes as unknown as Finish[]) ?? [];

  return (
    <main className="pt-24 md:pt-28 pb-stack-lg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductSchema(product)) }}
      />

      {/* Breadcrumb */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        <nav className="flex text-label-sm text-on-surface-variant/60 gap-2">
          <Link className="hover:text-primary transition-colors" href="/furniture">Furniture</Link>
          <span>/</span>
          <Link className="hover:text-primary transition-colors" href={`/furniture?room=${product.room}`}>
            {product.taxonomyLinks?.find((link: any) => link.primary)?.taxonomy?.name ?? product.room}
          </Link>
          <span>/</span>
          <span className="text-on-surface-variant">{product.name}</span>
        </nav>
      </div>

      <ProductView
        initialSaved={savedIds.has(product.id)}
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
          finishes: finishes,
          upholstery: product.upholstery,
          sellerName: product.seller?.brandName ?? "JR Interiors",
        }}
        reviews={product.reviews.map((r) => ({
          id: r.id,
          author: r.author,
          initials: r.initials,
          rating: r.rating,
          body: r.body,
        }))}
      />

      {/* Expanded Product Details */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-16 space-y-16 border-t border-outline-variant/30 pt-16">
        <section id="materials-craftsmanship" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <h2 className="text-xl font-bold text-primary md:col-span-1">Materials & Craftsmanship</h2>
          <div className="md:col-span-2 space-y-4 text-body-md text-on-surface-variant leading-relaxed">
            <p>
              The {product.name} is constructed with the finest materials — selected for their
              luxurious feel, rich colour depth, and exceptional durability.
              {materials && ` The primary construction features premium ${materials.toLowerCase()}, finished by hand to bring out the natural wood grain and textures.`}
              {product.upholstery && product.upholstery.length > 0 && ` For upholstery, we select premium textiles like 100% cotton velvet, rich bouclé, or natural Belgian linen.`}
            </p>
            <p>
              The frame is constructed with traditional woodworking joinery, ensuring that the piece remains
              stable and supports decades of use. Beneath the surface, high-resiliency soy-based foam
              moulds to your body while retaining its structural integrity year after year.
            </p>
            <p>
              Every piece is hand-finished at our Jaipur atelier and inspected for quality before
              white-glove delivery. This is furniture designed to be passed down.
            </p>
          </div>
        </section>

        <section id="customisation" className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/30 pt-16">
          <h2 className="text-xl font-bold text-primary md:col-span-1">Customisation Options</h2>
          <div className="md:col-span-2 space-y-4 text-body-md text-on-surface-variant leading-relaxed">
            <p>
              At JR Interiors, custom design is not an upgrade — it is our standard.
              We work with you to tailor each piece to your home's exact layout.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              {product.upholstery && product.upholstery.length > 0 && (
                <li><strong>Upholstery:</strong> Choose from our curated catalog: {product.upholstery.join(", ")}</li>
              )}
              {finishes.length > 0 && (
                <li><strong>Finishes:</strong> Available in {finishes.map(f => f.name).join(", ")}</li>
              )}
              <li><strong>Custom Configurations:</strong> L-shape, 2-seater, 3-seater, and custom dimensions to fit your hallway or open-plan room.</li>
              <li><strong>Leg finish:</strong> Walnut (standard), black-stained walnut, or brushed brass.</li>
            </ul>
            <p>
              <strong>Lead time for custom configurations:</strong> 4–6 weeks from order confirmation.
              Standard configurations ship within 2–3 weeks.
            </p>
          </div>
        </section>

        <section id="care-guide" className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/30 pt-16">
          <h2 className="text-xl font-bold text-primary md:col-span-1">Care & Maintenance</h2>
          <div className="md:col-span-2 space-y-6 text-body-md text-on-surface-variant leading-relaxed">
            <div>
              <h3 className="text-label-sm font-bold text-primary mb-2">Upholstery & Fabrics</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Vacuum gently weekly with a soft brush attachment to remove dust.</li>
                <li>For spills: blot immediately with a clean, dry, white cloth. Do not rub.</li>
                <li>Professional dry-cleaning is recommended annually to refresh the pile.</li>
                <li>Avoid direct sunlight exposure and rotate cushions monthly to ensure even wear.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-label-sm font-bold text-primary mb-2">Frame & Wood Elements</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dust monthly with a soft, dry, lint-free cloth.</li>
                <li>Wipe spills immediately with a barely damp cloth, followed by dry wiping.</li>
                <li>Oil timber elements with food-grade mineral oil every 6 months to maintain finish.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-label-sm font-bold text-primary mb-2">Warranty</h3>
              <p>
                We stand behind our work. The {product.name} includes a 5-year structural warranty
                covering frames and joinery against manufacturing defects.
              </p>
            </div>
          </div>
        </section>

        <section id="design-tips" className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/30 pt-16">
          <h2 className="text-xl font-bold text-primary md:col-span-1">Design Tips & Pairing</h2>
          <div className="md:col-span-2 space-y-4 text-body-md text-on-surface-variant leading-relaxed">
            <p>
              The {product.name} is designed to act as a serene anchor for a calm living space.
              Its clean lines allow it to define specific zones without blocking sightlines. We recommend pairing it with:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Low coffee tables</strong> (under 40cm) to maintain visual lightness.</li>
              <li><strong>Warm accent lighting</strong> (such as floor lamps and pendant fixtures) to highlight the texture.</li>
              <li><strong>Natural textures</strong> — jute rugs, woven poufs, and wooden shelving — to balance the softness.</li>
              <li><strong>Complementary pieces:</strong> Oslo Reading Lamp, Stark Side Ottoman, or Solstice Lounge Chair.</li>
            </ul>
          </div>
        </section>

        <section id="faq" className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/30 pt-16">
          <h2 className="text-xl font-bold text-primary md:col-span-1">Frequently Asked Questions</h2>
          <div className="md:col-span-2 space-y-4">
            <details className="group border-b border-outline-variant/20 pb-4 cursor-pointer">
              <summary className="font-semibold text-primary flex justify-between items-center text-body-md">
                <span>What is the weight capacity per seat?</span>
                <span className="transition-transform duration-300 group-open:rotate-180 font-normal">↓</span>
              </summary>
              <p className="mt-2 text-on-surface-variant text-body-sm leading-relaxed">
                Each seat comfortably supports up to 150 kg. The solid timber frame is engineered to handle this load indefinitely.
              </p>
            </details>
            <details className="group border-b border-outline-variant/20 pb-4 cursor-pointer">
              <summary className="font-semibold text-primary flex justify-between items-center text-body-md">
                <span>Can I change the fabric after purchase?</span>
                <span className="transition-transform duration-300 group-open:rotate-180 font-normal">↓</span>
              </summary>
              <p className="mt-2 text-on-surface-variant text-body-sm leading-relaxed">
                Yes. We offer professional re-upholstering services at our Jaipur atelier. Contact us for a quote based on your chosen fabric.
              </p>
            </details>
            <details className="group border-b border-outline-variant/20 pb-4 cursor-pointer">
              <summary className="font-semibold text-primary flex justify-between items-center text-body-md">
                <span>Is this piece suitable for homes with pets?</span>
                <span className="transition-transform duration-300 group-open:rotate-180 font-normal">↓</span>
              </summary>
              <p className="mt-2 text-on-surface-variant text-body-sm leading-relaxed">
                For homes with active pets, we suggest specifying our performance fabrics or top-grain leathers, which are highly resistant to scratching and easy to clean.
              </p>
            </details>
            <details className="group border-b border-outline-variant/20 pb-4 cursor-pointer">
              <summary className="font-semibold text-primary flex justify-between items-center text-body-md">
                <span>Do you offer financing options?</span>
                <span className="transition-transform duration-300 group-open:rotate-180 font-normal">↓</span>
              </summary>
              <p className="mt-2 text-on-surface-variant text-body-sm leading-relaxed">
                Yes. We partner with Razorpay to offer 3, 6, and 12-month EMI options with 0% interest for eligible bank credit cards on orders above ₹1,00,000.
              </p>
            </details>
          </div>
        </section>
      </div>

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
                    <Image src={r.imageUrl} alt={getAltText("product", r.name, r.tagline || r.material)} fill sizes="300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
