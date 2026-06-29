"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { placeOrder } from "@/app/actions";
import { clsx } from "@/lib/clsx";

const KEY = "jr_checkout";

type Shipping = Record<string, string>;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutPaymentForm({ razorpayReady }: { razorpayReady: boolean }) {
  const router = useRouter();
  const [shipping, setShipping] = useState<Shipping | null>(null);
  const [method, setMethod] = useState<"razorpay" | "cod">(razorpayReady ? "razorpay" : "cod");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (!saved) {
        router.replace("/checkout/shipping");
        return;
      }
      setShipping(JSON.parse(saved));
    } catch {
      router.replace("/checkout/shipping");
    }
  }, [router]);

  if (!shipping) {
    return <div className="py-16 text-center text-on-surface-variant">Loading your details…</div>;
  }

  async function payOnline() {
    setError(null);
    setProcessing(true);
    try {
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingType: shipping!.shippingType || "standard" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment.");

      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) throw new Error("Could not load payment gateway.");

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "JR Interiors",
        description: "Order payment",
        prefill: {
          name: shipping!.fullName || "",
          email: shipping!.email || "",
          contact: shipping!.phone || "",
        },
        theme: { color: "#513726" },
        handler: async (resp: Record<string, string>) => {
          try {
            const v = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...resp, shipping }),
            });
            const vd = await v.json();
            if (!v.ok) throw new Error(vd.error || "Verification failed.");
            sessionStorage.removeItem(KEY);
            router.push(`/order/${vd.number}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Verification failed.");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-stack-md">
      {/* Premium Progress Tracker */}
      <div className="flex items-center justify-center gap-4 py-4 mb-6 border-b border-outline-variant/20 max-w-md mx-auto">
        <Link href="/checkout/shipping" className="flex items-center gap-2 text-on-surface-variant/80 hover:text-primary font-bold text-label-xs">
          <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[11px]"><Icon name="check" className="text-[14px]" /></span>
          <span>Shipping</span>
        </Link>
        <div className="w-12 h-[1px] bg-primary" />
        <div className="flex items-center gap-2 text-primary font-bold text-label-xs">
          <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px]">2</span>
          <span>Payment</span>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-sm">
          <Icon name="error" className="text-[18px]" />
          {error}
        </div>
      )}

      <div>
        <h2 className="text-label-sm uppercase tracking-widest text-primary mb-4 font-bold">Payment Method</h2>
        <div className="space-y-3">
          {razorpayReady && (
            <button
              type="button"
              onClick={() => setMethod("razorpay")}
              className={clsx(
                "w-full flex items-start gap-3 border rounded-lg p-4 text-left transition",
                method === "razorpay" ? "border-primary bg-surface-container-low" : "border-outline-variant hover:bg-surface-container-low"
              )}
            >
              <Icon name={method === "razorpay" ? "radio_button_checked" : "radio_button_unchecked"} className="text-primary mt-0.5" />
              <div>
                <p className="text-label-sm text-primary font-semibold">Pay by UPI / Card</p>
                <p className="text-label-xs text-on-surface-variant">GPay, PhonePe, Paytm & any UPI app · cards · net banking · wallets</p>
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={() => setMethod("cod")}
            className={clsx(
              "w-full flex items-start gap-3 border rounded-lg p-4 text-left transition",
              method === "cod" ? "border-primary bg-surface-container-low" : "border-outline-variant hover:bg-surface-container-low"
            )}
          >
            <Icon name={method === "cod" ? "radio_button_checked" : "radio_button_unchecked"} className="text-primary mt-0.5" />
            <div>
              <p className="text-label-sm text-primary font-semibold">Cash on Delivery</p>
              <p className="text-label-xs text-on-surface-variant">Pay when your order is delivered</p>
            </div>
          </button>
        </div>
      </div>

      {method === "razorpay" ? (
        <button
          type="button"
          onClick={payOnline}
          disabled={processing}
          className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-sm hover:opacity-90 transition active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {processing ? "Opening payment…" : (<><Icon name="lock" className="text-[18px]" /> Pay by UPI / Card</>)}
        </button>
      ) : (
        <form
          action={placeOrder}
          onSubmit={() => {
            setProcessing(true);
            sessionStorage.removeItem(KEY);
          }}
        >
          {Object.entries(shipping).map(([k, val]) => (
            <input key={k} type="hidden" name={k} value={val} />
          ))}
          <button
            type="submit"
            disabled={processing}
            className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-sm hover:opacity-90 transition active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {processing ? "Placing order…" : (<><Icon name="local_shipping" className="text-[18px]" /> Place Order (Cash on Delivery)</>)}
          </button>
        </form>
      )}

      <button type="button" onClick={() => router.push("/checkout/shipping")} className="w-full text-label-sm text-on-surface-variant hover:text-primary transition">
        ← Back to shipping
      </button>
    </div>
  );
}
