import Image from "next/image";
import { priceExact } from "@/lib/format";
import { GST_RATE } from "@/lib/commerce";
import type { CartLine } from "@/lib/cart";

/** Read-only order summary shown alongside the checkout forms. */
export function CheckoutSummary({ lines }: { lines: CartLine[] }) {
  const subtotal = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  return (
    <div className="bg-surface-container-low rounded-xl p-6 md:p-8 lg:sticky lg:top-28">
      <h2 className="text-subheading text-primary mb-6">Order Summary</h2>
      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto scroll-hide">
        {lines.map((l) => (
          <div key={l.id} className="flex gap-4">
            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0">
              <Image src={l.imageUrl} alt={l.name} fill sizes="64px" className="object-cover" />
              <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {l.quantity}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-label-sm text-primary font-medium leading-tight">{l.name}</p>
              <p className="text-label-xs text-on-surface-variant">
                {[l.finish, l.upholstery].filter(Boolean).join(" · ") || l.tagline}
              </p>
            </div>
            <p className="text-label-sm text-primary tabular-nums">{priceExact(l.lineTotalCents)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant pt-6 space-y-3 text-body-md">
        <div className="flex justify-between text-on-surface-variant">
          <span>Subtotal</span>
          <span className="text-primary tabular-nums">{priceExact(subtotal)}</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>GST (18%)</span>
          <span className="text-primary tabular-nums">{priceExact(gst)}</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>Shipping</span>
          <span className="text-secondary">Free (standard)</span>
        </div>
      </div>
      <div className="border-t border-outline-variant mt-6 pt-6 flex justify-between items-baseline">
        <span className="text-label-sm uppercase tracking-widest text-primary">Total</span>
        <span className="text-subheading font-bold text-primary tabular-nums">{priceExact(total)}</span>
      </div>
    </div>
  );
}

export function CheckoutSteps({ active }: { active: "shipping" | "payment" }) {
  const steps = [
    { id: "cart", label: "Cart", done: true },
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
  ];
  return (
    <ol className="flex items-center gap-3 mb-stack-md text-label-sm">
      {steps.map((s, i) => {
        const isActive = s.id === active;
        const isDone = s.done || (active === "payment" && s.id === "shipping");
        return (
          <li key={s.id} className="flex items-center gap-3">
            <span
              className={[
                "w-7 h-7 rounded-full flex items-center justify-center text-label-xs font-bold",
                isActive ? "bg-primary text-on-primary" : isDone ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant",
              ].join(" ")}
            >
              {i + 1}
            </span>
            <span className={isActive ? "text-primary font-semibold" : "text-on-surface-variant"}>{s.label}</span>
            {i < steps.length - 1 && <span className="w-8 h-px bg-outline-variant" />}
          </li>
        );
      })}
    </ol>
  );
}
