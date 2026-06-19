import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { razorpayEnabled } from "@/lib/razorpay";
import { CheckoutPaymentForm } from "@/components/CheckoutPaymentForm";
import { CheckoutSummary, CheckoutSteps } from "@/components/CheckoutSummary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment | JR INTERIORS Checkout" };

export default async function PaymentPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) redirect("/cart");

  const user = await getCurrentUser();
  if (!user) redirect("/account/login?redirect=/checkout/shipping");

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <CheckoutSteps active="payment" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md items-start">
          <div className="lg:col-span-2">
            <CheckoutPaymentForm razorpayReady={razorpayEnabled()} />
          </div>
          <CheckoutSummary lines={cart.lines} />
        </div>
      </div>
    </main>
  );
}
