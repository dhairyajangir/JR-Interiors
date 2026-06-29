"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { priceExact } from "@/lib/format";
import { updateLine, removeLine } from "@/app/actions";
import { GST_RATE } from "@/lib/commerce";
import type { CartLine } from "@/lib/cart";

export function CartView({ lines: initial }: { lines: CartLine[] }) {
  const { setCount } = useCart();
  const [lines, setLines] = useOptimistic(initial);
  const [, start] = useTransition();

  function setQty(id: string, qty: number) {
    start(async () => {
      setLines((cur) =>
        qty <= 0
          ? cur.filter((l) => l.id !== id)
          : cur.map((l) => (l.id === id ? { ...l, quantity: qty, lineTotalCents: l.priceCents * qty } : l))
      );
      const res = await updateLine(id, qty);
      if (res.ok && typeof res.count === "number") setCount(res.count);
    });
  }

  function remove(id: string) {
    start(async () => {
      setLines((cur) => cur.filter((l) => l.id !== id));
      const res = await removeLine(id);
      if (res.ok && typeof res.count === "number") setCount(res.count);
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  if (lines.length === 0) {
    return (
      <div className="py-stack-lg text-center">
        <Icon name="shopping_bag" className="text-6xl text-outline-variant mb-6" />
        <h2 className="text-subheading text-primary mb-2">Your selections are empty</h2>
        <p className="text-on-surface-variant mb-8">Curated pieces you add will appear here.</p>
        <Link href="/furniture" className="inline-block bg-primary text-on-primary px-10 py-4 rounded-lg font-label-sm hover:opacity-90 transition">
          Explore the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md items-start">
      {/* Lines */}
      <div className="lg:col-span-2 space-y-6">
        {lines.map((l) => (
          <div key={l.id} className="flex gap-4 md:gap-6 bg-surface-container-lowest rounded-xl p-4 editorial-shadow">
            <Link href={`/product/${l.slug}`} className="relative w-24 h-28 md:w-32 md:h-36 rounded-lg overflow-hidden bg-surface-container shrink-0">
              <Image src={l.imageUrl} alt={l.name} fill sizes="128px" className="object-cover" />
            </Link>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between gap-4">
                <div>
                  <Link href={`/product/${l.slug}`}>
                    <h3 className="text-body-md font-medium text-primary hover:underline">{l.name}</h3>
                  </Link>
                  <p className="text-label-xs text-on-surface-variant mt-1">
                    {[l.finish, l.upholstery].filter(Boolean).join(" · ") || l.tagline}
                  </p>
                </div>
                <button onClick={() => remove(l.id)} aria-label="Remove item" className="text-on-surface-variant hover:text-error transition h-fit">
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
              <div className="mt-auto flex items-end justify-between pt-4">
                <div className="flex items-center border border-outline-variant rounded-lg">
                  <button onClick={() => setQty(l.id, l.quantity - 1)} aria-label="Decrease quantity" className="w-9 h-9 flex items-center justify-center text-primary hover:bg-surface-container transition rounded-l-lg">
                    <Icon name="remove" className="text-[18px]" />
                  </button>
                  <span className="w-10 text-center text-label-sm tabular-nums">{l.quantity}</span>
                  <button onClick={() => setQty(l.id, l.quantity + 1)} aria-label="Increase quantity" className="w-9 h-9 flex items-center justify-center text-primary hover:bg-surface-container transition rounded-r-lg">
                    <Icon name="add" className="text-[18px]" />
                  </button>
                </div>
                <p className="text-body-md font-bold text-primary tabular-nums">{priceExact(l.lineTotalCents)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-surface-container-low rounded-xl p-6 md:p-8 lg:sticky lg:top-28">
        <h2 className="text-subheading text-primary mb-6">Order Summary</h2>
        <div className="space-y-3 text-body-md">
          <Row label="Subtotal" value={priceExact(subtotal)} />
          <Row label="GST (18%)" value={priceExact(gst)} />
          <div className="flex justify-between text-on-surface-variant">
            <span>Shipping</span>
            <span className="text-secondary">Calculated at checkout</span>
          </div>
        </div>
        <div className="border-t border-outline-variant my-6" />
        <div className="flex justify-between items-baseline mb-8">
          <span className="text-label-sm uppercase tracking-widest text-primary">Total</span>
          <span className="text-subheading font-bold text-primary tabular-nums">{priceExact(total)}</span>
        </div>
        <Link href="/checkout/shipping" className="block w-full text-center bg-primary text-on-primary py-4 rounded-lg font-label-sm hover:opacity-90 transition active:scale-[0.98]">
          Proceed to Checkout
        </Link>
        <Link href="/furniture" className="block w-full text-center text-label-sm text-on-surface-variant mt-4 hover:text-primary transition">
          Continue Exploring
        </Link>
        <div className="flex items-center gap-2 justify-center mt-6 text-label-xs text-on-surface-variant">
          <Icon name="lock" className="text-[16px]" />
          Secure white-glove checkout
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-on-surface-variant">
      <span>{label}</span>
      <span className="text-primary tabular-nums">{value}</span>
    </div>
  );
}
