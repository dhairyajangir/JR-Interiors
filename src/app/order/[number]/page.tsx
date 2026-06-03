import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { priceExact } from "@/lib/format";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

type Params = Promise<{ number: string }>;

export const metadata: Metadata = { title: "Order Confirmed | JR INTERIORS" };

export default async function OrderConfirmationPage({ params }: { params: Params }) {
  const { number } = await params;
  const order = await prisma.order.findUnique({
    where: { number },
    include: { items: true },
  });
  if (!order) notFound();

  const shippingLabel = order.shippingType === "express" ? "Express Concierge (3–5 days)" : "White-Glove Standard (7–14 days)";

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-stack-md reveal">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-6">
            <Icon name="check" className="text-3xl" />
          </div>
          <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-2 block">Thank you</span>
          <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-3">Your order is confirmed</h1>
          <p className="text-body-lg text-on-surface-variant">
            A confirmation has been sent to <span className="text-primary">{order.email}</span>.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 md:p-8 mb-6">
          <div className="flex flex-wrap justify-between gap-4 pb-6 border-b border-outline-variant">
            <div>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant">Order Number</p>
              <p className="text-label-sm font-bold text-primary">{order.number}</p>
            </div>
            <div>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant">Delivery</p>
              <p className="text-label-sm text-primary">{shippingLabel}</p>
            </div>
            <div>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant">Ship To</p>
              <p className="text-label-sm text-primary">{order.fullName}, {order.city} {order.region}</p>
            </div>
            <div>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant">Payment</p>
              <p className="text-label-sm text-primary">
                {order.paymentMethod === "razorpay"
                  ? "Paid online"
                  : "Cash on Delivery"}
              </p>
            </div>
          </div>

          <div className="py-6 space-y-5">
            {order.items.map((it) => (
              <div key={it.id} className="flex gap-4">
                {it.imageUrl && (
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0">
                    <Image src={it.imageUrl} alt={it.name} fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-label-sm text-primary font-medium">{it.name}</p>
                  <p className="text-label-xs text-on-surface-variant">
                    Qty {it.quantity}
                    {[it.finish, it.upholstery].filter(Boolean).length ? ` · ${[it.finish, it.upholstery].filter(Boolean).join(" · ")}` : ""}
                  </p>
                </div>
                <p className="text-label-sm text-primary tabular-nums">{priceExact(it.priceCents * it.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant pt-6 space-y-3">
            <Row label="Subtotal" value={priceExact(order.subtotalCents)} />
            <Row label="Shipping" value={order.shippingCents === 0 ? "Free" : priceExact(order.shippingCents)} />
            <Row label="GST (18%)" value={priceExact(order.taxCents)} />
            <div className="flex justify-between items-baseline pt-3 border-t border-outline-variant">
              <span className="text-label-sm uppercase tracking-widest text-primary">Total</span>
              <span className="text-subheading font-bold text-primary tabular-nums">{priceExact(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/furniture" className="text-center bg-primary text-on-primary px-8 py-4 rounded-lg font-label-sm hover:opacity-90 transition">
            Continue Shopping
          </Link>
          <Link href="/account" className="text-center border border-outline-variant text-primary px-8 py-4 rounded-lg font-label-sm hover:bg-surface-container-low transition">
            View My Account
          </Link>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-body-md text-on-surface-variant">
      <span>{label}</span>
      <span className="text-primary tabular-nums">{value}</span>
    </div>
  );
}
