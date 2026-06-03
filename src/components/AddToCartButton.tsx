"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { addToCart } from "@/app/actions";
import { clsx } from "@/lib/clsx";

/** Circular "+" quick-add used on product cards. Optimistic badge update. */
export function QuickAddButton({ productId }: { productId: string }) {
  const { count, setCount } = useCart();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCount(count + 1); // optimistic
    start(async () => {
      const res = await addToCart({ productId, quantity: 1 });
      if (res.ok && typeof res.count === "number") setCount(res.count);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    });
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={pending}
      aria-label="Add to cart"
      className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 shadow-md hover:scale-105 active:scale-90 disabled:opacity-60"
    >
      <Icon name={done ? "check" : "add"} className="text-[20px]" />
    </button>
  );
}

/** Full-width primary "Add to Cart" used on the product detail page. */
export function AddToCart({
  productId,
  finish,
  upholstery,
  quantity = 1,
  className,
  label = "Add to Cart",
}: {
  productId: string;
  finish?: string | null;
  upholstery?: string | null;
  quantity?: number;
  className?: string;
  label?: string;
}) {
  const { count, setCount } = useCart();
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);

  function add() {
    setCount(count + quantity);
    start(async () => {
      const res = await addToCart({ productId, quantity, finish, upholstery });
      if (res.ok && typeof res.count === "number") setCount(res.count);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    });
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={pending}
      className={clsx(
        "bg-primary text-on-primary py-4 rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2",
        className
      )}
    >
      {added ? (
        <>
          <Icon name="check" className="text-[18px]" /> Added to Cart
        </>
      ) : pending ? (
        "Adding…"
      ) : (
        label
      )}
    </button>
  );
}
