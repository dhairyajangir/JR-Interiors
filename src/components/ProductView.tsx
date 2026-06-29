"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [finish, setFinish] = useState<Finish | null>(product.finishes[0] ?? null);
  const [uph, setUph] = useState<string | null>(product.upholstery[0] ?? null);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "mats" | "revs">("desc");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const index = Math.round(target.scrollLeft / target.clientWidth);
    setActiveSlide(index);
    if (product.images[index]) {
      setActiveImg(product.images[index]);
    }
  };

  const scrollToSlide = (idx: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.clientWidth * idx,
        behavior: "smooth",
      });
      setActiveSlide(idx);
    }
  };

  return (
    <>
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-12">
          
          {/* Product Gallery: Swipable on mobile, thumbnails list on desktop */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
            
            {/* Desktop Thumbnails Column (hidden on mobile/tablet) */}
            <div className="hidden md:flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto scroll-hide">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(img)}
                  className={clsx(
                    "min-w-[80px] w-20 h-24 rounded-lg overflow-hidden bg-surface-container relative transition",
                    activeImg === img ? "ring-1 ring-primary p-0.5" : "hover:opacity-80"
                  )}
                >
                  <Image src={img} alt={getAltText("product", `${product.name} thumbnail ${i + 1}`, product.material)} fill sizes="80px" className="object-cover rounded-md" />
                </button>
              ))}
            </div>

            {/* Desktop Main Image Display (hidden on mobile/tablet) */}
            <div className="hidden md:block flex-1 rounded-xl overflow-hidden bg-surface-container relative group min-h-[500px]">
              <Image 
                src={activeImg} 
                alt={getAltText("product", product.name, product.material)} 
                fill 
                sizes="(max-width:1024px) 100vw, 58vw" 
                priority 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <WishlistButton productId={product.id} initialSaved={initialSaved} className="absolute right-4 top-4" />
            </div>

            {/* Mobile/Tablet Swipe Carousel Gallery */}
            <div className="md:hidden w-full relative">
              <div 
                ref={scrollRef}
                onScroll={handleMobileScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-hide touch-momentum w-full aspect-square relative rounded-xl bg-surface-container"
              >
                {product.images.map((img, i) => (
                  <div key={img} className="shrink-0 w-full h-full snap-start relative">
                    <Image
                      src={img}
                      alt={getAltText("product", `${product.name} slide ${i + 1}`, product.material)}
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <WishlistButton productId={product.id} initialSaved={initialSaved} className="absolute right-4 top-4 z-10 shadow-md" />
              
              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={clsx(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      activeSlide === i ? "bg-primary w-5" : "bg-primary/30"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="lg:col-span-5 flex flex-col py-2">
            {product.series && (
              <span className="text-label-xs uppercase tracking-widest text-outline mb-3 block font-semibold">{product.series}</span>
            )}
            <h1 className="text-[28px] md:text-headline-section text-primary mb-2 font-bold leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <p className="text-[20px] md:text-subheading text-primary font-bold">{priceExact(product.priceCents)}</p>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-1 text-on-secondary-container bg-secondary-container px-2 py-1 rounded-md">
                  <Icon name="star" fill className="text-[14px]" />
                  <span className="text-label-xs font-semibold">
                    {product.rating} ({product.reviewCount} Reviews)
                  </span>
                </div>
              )}
            </div>

            <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">{product.description}</p>
            <p className="text-label-sm text-on-surface-variant mb-6">
              Sold by <span className="text-primary font-bold">{product.sellerName}</span>
            </p>

            <div className="space-y-6 mb-8">
              {product.finishes.length > 0 && (
                <div>
                  <span className="text-label-sm block mb-3 font-semibold text-primary">
                    Finish: <span className="text-primary font-bold">{finish?.name}</span>
                  </span>
                  <div className="flex gap-3">
                    {product.finishes.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setFinish(f)}
                        aria-label={f.name}
                        className={clsx(
                          "w-10 h-10 rounded-full transition min-h-[44px] min-w-[44px]",
                          finish?.name === f.name ? "ring-2 ring-offset-2 ring-primary scale-105" : "ring-1 ring-outline-variant hover:scale-102"
                        )}
                        style={{ backgroundColor: f.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.upholstery.length > 0 && (
                <div>
                  <span className="text-label-sm block mb-3 font-semibold text-primary">
                    Upholstery: <span className="text-primary font-bold">{uph}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.upholstery.map((u) => (
                      <button
                        key={u}
                        onClick={() => setUph(u)}
                        className={clsx(
                          "px-4 py-2.5 rounded-lg text-label-xs font-semibold uppercase tracking-wider transition-colors min-h-[44px]",
                          uph === u ? "border-2 border-primary bg-surface text-primary" : "border border-outline-variant hover:bg-surface-container-low text-on-surface-variant"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3 border border-outline-variant/20">
                <Icon name="local_shipping" className="text-primary mt-0.5" />
                <div>
                  <p className="text-label-sm text-primary font-bold">White-Glove Delivery Included</p>
                  <p className="text-label-xs text-on-surface-variant">Estimated arrival: 7–14 business days · In-room assembly</p>
                </div>
              </div>
            </div>

            {/* Desktop Actions Grid (hidden on mobile sticky viewport) */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AddToCart productId={product.id} finish={finish?.name ?? null} upholstery={uph} />
              <Link
                href="/contact"
                className="border border-outline-variant text-primary py-4 rounded-lg font-bold text-label-sm hover:bg-surface-container-low transition-all active:scale-[0.98] text-center"
              >
                Book Design Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion list on Mobile, Tab sheets on Desktop */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-12">
        
        {/* Desktop Tabs (>= lg) */}
        <div className="hidden lg:block">
          <div className="border-b border-outline-variant/30 flex gap-12 overflow-x-auto scroll-hide">
            {[
              { id: "desc", label: "Description" },
              { id: "specs", label: "Specifications" },
              { id: "mats", label: "Materials" },
              { id: "revs", label: "Reviews" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={clsx(
                  "pb-4 text-label-sm uppercase tracking-wider font-bold whitespace-nowrap transition-all border-b-2",
                  activeTab === t.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
                )}
              >
                {t.label}
                {t.id === "revs" && product.reviewCount > 0 ? ` (${product.reviewCount})` : ""}
              </button>
            ))}
          </div>
          
          <div className="py-8 min-h-[220px]">
            {activeTab === "desc" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-subheading text-primary font-semibold">Sculptural Form meets Lasting Comfort</h3>
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
                  <Image src={product.images[product.images.length > 1 ? 1 : 0]} alt={getAltText("atelier", "Craftsmanship detail of " + product.name)} fill sizes="40vw" className="object-cover" />
                </div>
              </div>
            )}
            
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                {[
                  ["Material", product.material],
                  ["Assembly", "Fully Assembled"],
                  ["Warranty", "10-Year Structural"],
                  ["Origin", "Hand-built, Jaipur Atelier"],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-outline-variant/20 pb-4 flex justify-between">
                    <span className="text-label-sm text-outline font-semibold">{k}</span>
                    <span className="text-label-sm text-primary font-bold">{v}</span>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === "mats" && (
              <div className="flex flex-wrap gap-4">
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex-1 min-w-[240px]">
                  <h4 className="text-label-sm font-bold mb-2 text-primary">{product.material}</h4>
                  <p className="text-label-xs text-on-surface-variant">
                    Selected for its rich character and durability. Hand-finished with natural oils to reveal depth and grain.
                  </p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex-1 min-w-[240px]">
                  <h4 className="text-label-sm font-bold mb-2 text-primary">Sustainable Sourcing</h4>
                  <p className="text-label-xs text-on-surface-variant">
                    Responsibly sourced and crafted to last generations — the antithesis of disposable furniture.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === "revs" && (
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
                      <p className="text-label-sm font-bold text-primary">{r.author}</p>
                      <p className="text-body-md text-on-surface-variant">&ldquo;{r.body}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Accordions (< lg) */}
        <div className="lg:hidden space-y-2 mt-4">
          <Accordion title="Description" defaultOpen>
            <p className="mb-4">{product.description}</p>
            <ul className="space-y-3">
              {["FSC Certified timber", "High-resiliency soy-based foam", "Stain-resistant fabric finish"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-label-xs font-semibold text-on-surface-variant">
                  <Icon name="check_circle" className="text-[16px] text-secondary" />
                  {f}
                </li>
              ))}
            </ul>
          </Accordion>

          <Accordion title="Specifications">
            <div className="space-y-3">
              {[
                ["Material", product.material],
                ["Assembly", "Fully Assembled"],
                ["Warranty", "10-Year Structural"],
                ["Origin", "Hand-built, Jaipur Atelier"],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-outline-variant/10 pb-2 flex justify-between text-label-xs font-semibold">
                  <span className="text-outline">{k}</span>
                  <span className="text-primary font-bold">{v}</span>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Materials & Care">
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <h4 className="text-label-xs font-bold mb-1 text-primary">{product.material}</h4>
                <p className="text-[12px] text-on-surface-variant">
                  Selected for its rich character and durability. Hand-finished with natural oils to reveal depth and grain.
                </p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <h4 className="text-label-xs font-bold mb-1 text-primary">Sustainable Sourcing</h4>
                <p className="text-[12px] text-on-surface-variant">
                  Responsibly sourced and crafted to last generations — the antithesis of disposable furniture.
                </p>
              </div>
            </div>
          </Accordion>

          <Accordion title={`Reviews (${product.reviewCount})`}>
            <div className="space-y-6">
              {reviews.length === 0 && <p className="text-on-surface-variant text-[13px]">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary shrink-0 text-sm">
                    {r.initials}
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-primary mb-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Icon key={i} name="star" fill className="text-[12px]" />
                      ))}
                    </div>
                    <p className="text-label-xs font-bold text-primary">{r.author}</p>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed">&ldquo;{r.body}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </Accordion>
        </div>
      </section>

      {/* Sticky Bottom checkout Panel (Mobile Only, < md) */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-bright/95 backdrop-blur-md border-t border-outline-variant/30 px-5 py-3.5 flex items-center justify-between shadow-premium-bottom-nav pb-[calc(env(safe-area-inset-bottom,16px)+10px)]"
        style={{
          boxShadow: "0 -8px 25px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-outline-variant uppercase tracking-wider truncate max-w-[120px]">
            {product.name}
          </span>
          <span className="text-[16px] font-bold text-primary">
            {priceExact(product.priceCents)}
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-2/3 justify-end">
          <AddToCart 
            productId={product.id} 
            finish={finish?.name ?? null} 
            upholstery={uph} 
            className="w-full flex-1 max-w-[200px] !py-3.5 !rounded-full text-label-xs font-semibold uppercase tracking-wider" 
            label="Buy Now"
          />
        </div>
      </div>
    </>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-outline-variant/20 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-3 text-label-xs uppercase tracking-wider text-primary font-bold text-left min-h-[44px]"
      >
        <span>{title}</span>
        <Icon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} className="text-primary text-[18px]" />
      </button>
      {open && (
        <div className="pb-4 text-[13px] text-on-surface-variant leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
