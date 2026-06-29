import type { Metadata } from "next";
import { getCart } from "@/lib/cart";
import { CartView } from "@/components/CartView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Atelier Selections | JR INTERIORS" };

export default async function CartPage() {
  const cart = await getCart();
  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-stack-md">
          <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-2">Atelier Selections</h1>
          <p className="text-body-lg text-on-surface-variant">
            {cart.count > 0 ? `${cart.count} item${cart.count === 1 ? "" : "s"} in your collection.` : "Begin curating your space."}
          </p>
        </div>
        <CartView lines={cart.lines} />
      </div>
    </main>
  );
}
