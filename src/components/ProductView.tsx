"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { AddToCart } from "@/components/AddToCartButton";
import { priceExact } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import { WishlistButton } from "@/components/WishlistButton";
import { getAltText } from "@/lib/altText";

type Finish = { name: string; hex: string };
type ReviewT = { id: string; author: string; initials: string; rating: number; body: string };

export type ProductViewData = {
  id: string;
  slug: string;
  name: string;
  series: string | null;
  description: string;
  priceCents: number;
  material: string;
  rating: number;
  reviewCount: number;
  images: string[];
  finishes: Finish[];
  upholstery: string[];
  sellerName: string;
};

const TABS = [
  { id: "desc", label: "Description" },
  { id: "specs", label: "Specifications" },
  { id: "mats", label: "Materials" },
  { id: "revs", label: "Reviews" },
] as const;

export function ProductView({
  product,
  reviews,
  initialSaved = false,
}: {
  product: ProductViewData;
  reviews: ReviewT[];
  initialSaved?: boolean;
}) {
  const [activeImg, setActiveImg] = useState(product.images[0]);
  const [finish, setFinish] = useState<Finish | null>(product.finishes[0] ?? null);
  const [uph, setUph] = useState<string | null>(product.upholstery[0] ?? null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("desc");

  return (
    <>
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-12">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto scroll-hide">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(img)}
                  className={clsx(
                    "min-w-[80px] w-20 h-24 rounded-lg overflow-hidden bg-surface-container relative transition",
                    activeImg === img ? "ring-1 ring-primary p-0.5" : "hover:opacity-80"
                  )}
                >
                  <Image src={img} alt={getAltText("product", `${product.name} view ${i + 1}`, product.material)} fill sizes="80px" className="object-cover rounded-md" />
                </button>
              ))}
            </div>
            <div className="flex-1 rounded-xl overflow-hidden bg-surface-container relative group min-h-[360px] md:min-h-[560px]">
              <Image src={activeImg} alt={getAltText("product", product.name, product.material)} fill sizes="(max-width:1024px) 100vw, 58vw" priority className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <WishlistButton productId={product.id} initialSaved={initialSaved} className="absolute right-4 top-4" />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 flex flex-col py-2">
            {product.series && (
              <span className="text-label-xs uppercase tracking-widest text-outline mb-4">{product.series}</span>
            )}
            <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <p className="text-subheading text-primary font-semibold">{priceExact(product.priceCents)}</p>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-1 text-on-secondary-container bg-secondary-container px-2 py-1 rounded-md">
                  <Icon name="star" fill className="text-[16px]" />
                  <span className="text-label-sm">
                    {product.rating} ({product.reviewCount} Reviews)
                  </span>
                </div>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">{product.description}</p>
            <p className="text-label-sm text-on-surface-variant mb-8">
              Sold by <span className="text-primary font-semibold">{product.sellerName}</span>
            </p>

            <div className="space-y-8 mb-10">
              {product.finishes.length > 0 && (
                <div>
                  <span className="text-label-sm block mb-4">
                    Finish: <span className="text-primary font-bold">{finish?.name}</span>
                  </span>
                  <div className="flex gap-3">
                    {product.finishes.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setFinish(f)}
                        aria-label={f.name}
                        className={clsx(
                          "w-10 h-10 rounded-full transition",
                          finish?.name === f.name ? "ring-2 ring-offset-2 ring-primary" : "ring-1 ring-outline-variant"
                        )}
                        style={{ backgroundColor: f.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.upholstery.length > 0 && (
                <div>
                  <span className="text-label-sm block mb-4">
                    Upholstery: <span className="text-primary font-bold">{uph}</span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {product.upholstery.map((u) => (
                      <button
                        key={u}
                        onClick={() => setUph(u)}
                        className={clsx(
                          "px-4 py-2 rounded-lg text-label-sm transition-colors",
                          uph === u ? "border-2 border-primary bg-surface" : "border border-outline-variant hover:bg-surface-container-low"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3">
                <Icon name="local_shipping" className="text-outline" />
                <div>
                  <p className="text-label-sm text-on-surface font-semibold">Ready for Delivery</p>
                  <p className="text-label-xs text-on-surface-variant">Estimated arrival: 7–14 business days</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AddToCart productId={product.id} finish={finish?.name ?? null} upholstery={uph} />
              <Link
                href="/contact"
                className="border border-outline-variant text-primary py-4 rounded-lg font-label-sm text-label-sm hover:bg-surface-container-low transition-all active:scale-[0.98] text-center"
              >
                Book Design Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="mt-stack-lg max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="border-b border-outline-variant/30 flex gap-8 md:gap-12 overflow-x-auto scroll-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "pb-4 text-label-sm whitespace-nowrap transition-all border-b-2",
                tab === t.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
              )}
            >
              {t.label}
              {t.id === "revs" && product.reviewCount > 0 ? ` (${product.reviewCount})` : ""}
            </button>
          ))}
        </div>
        <div className="py-stack-sm min-h-[280px]">
          {tab === "desc" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-subheading text-primary">Sculptural Form meets Lasting Comfort</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{product.description}</p>
                <ul className="space-y-3">
                  {["FSC Certified timber", "High-resiliency soy-based foam", "Stain-resistant fabric finish"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                      <Icon name="check_circle" className="text-[18px] text-secondary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl overflow-hidden h-80 bg-surface-container relative">
                <Image src={product.images[product.images.length > 1 ? 1 : 0]} alt={getAltText("atelier", "Craftsmanship detail of " + product.name)} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" />
              </div>
            </div>
          )}
          {tab === "specs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
              {[
                ["Material", product.material],
                ["Assembly", "Fully Assembled"],
                ["Warranty", "10-Year Structural"],
                ["Origin", "Hand-built, North America"],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-outline-variant/20 pb-4 flex justify-between">
                  <span className="text-label-sm text-outline">{k}</span>
                  <span className="text-label-sm text-primary">{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "mats" && (
            <div className="flex flex-wrap gap-4">
              <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex-1 min-w-[240px]">
                <h4 className="text-label-sm font-bold mb-2">{product.material}</h4>
                <p className="text-label-xs text-on-surface-variant">
                  Selected for its rich character and durability. Hand-finished with natural oils to reveal depth and grain.
                </p>
              </div>
              <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex-1 min-w-[240px]">
                <h4 className="text-label-sm font-bold mb-2">Sustainable Sourcing</h4>
                <p className="text-label-xs text-on-surface-variant">
                  Responsibly sourced and crafted to last generations — the antithesis of disposable furniture.
                </p>
              </div>
            </div>
          )}
          {tab === "revs" && (
            <div className="space-y-8">
              {reviews.length === 0 && <p className="text-on-surface-variant">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary shrink-0">
                    {r.initials}
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-primary mb-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Icon key={i} name="star" fill className="text-sm" />
                      ))}
                    </div>
                    <p className="text-label-sm font-bold">{r.author}</p>
                    <p className="text-body-md text-on-surface-variant">&ldquo;{r.body}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
