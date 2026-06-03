import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CheckoutShippingForm } from "@/components/CheckoutShippingForm";
import { CheckoutSummary, CheckoutSteps } from "@/components/CheckoutSummary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shipping | JR INTERIORS Checkout" };

export default async function ShippingPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) redirect("/cart");

  const user = await getCurrentUser();
  const addresses = user
    ? await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { id: "asc" }],
      })
    : [];

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <CheckoutSteps active="shipping" />
        {!user && (
          <div className="mb-stack-sm bg-surface-container-low rounded-lg px-4 py-3 text-label-sm text-on-surface-variant">
            Have an account?{" "}
            <Link href="/account/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>{" "}
            for faster checkout — or continue as a guest below.
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md items-start">
          <div className="lg:col-span-2">
            <CheckoutShippingForm
              loggedIn={!!user}
              userEmail={user?.email}
              userName={user?.fullName}
              addresses={addresses.map((a) => ({
                id: a.id,
                label: a.label,
                fullName: a.fullName,
                line1: a.line1,
                line2: a.line2,
                city: a.city,
                region: a.region,
                postalCode: a.postalCode,
                country: a.country,
              }))}
            />
          </div>
          <CheckoutSummary lines={cart.lines} />
        </div>
      </div>
    </main>
  );
}
