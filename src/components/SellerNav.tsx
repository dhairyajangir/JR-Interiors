import Link from "next/link";
import { Icon } from "@/components/Icon";

export function SellerNav({ brandName, active }: { brandName: string; active: "products" | "orders" }) {
  return (
    <div className="mb-stack-md">
      <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-2 block">Seller Studio</span>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-headline-section-mobile md:text-headline-section text-primary">{brandName}</h1>
        {active === "products" && (
          <Link href="/seller/products/new" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-sm hover:opacity-90 transition">
            <Icon name="add" className="text-[18px]" /> Add product
          </Link>
        )}
      </div>
      <nav className="flex gap-6 mt-6 border-b border-outline-variant">
        <Link
          href="/seller"
          className={`pb-3 text-label-sm border-b-2 transition ${active === "products" ? "border-primary text-primary font-semibold" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          Products
        </Link>
        <Link
          href="/seller/orders"
          className={`pb-3 text-label-sm border-b-2 transition ${active === "orders" ? "border-primary text-primary font-semibold" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          Orders
        </Link>
      </nav>
    </div>
  );
}
