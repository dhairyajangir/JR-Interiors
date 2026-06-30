import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { SellerProductForm } from "@/components/SellerProductForm";
import { SellerNav } from "@/components/SellerNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add product · Seller", robots: { index: false } };

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  if (!user.sellerId) redirect("/account");

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
        <SellerNav brandName={user.brandName ?? "Your Store"} active="products" />
        <h2 className="text-subheading text-primary mb-6">New listing</h2>
        <SellerProductForm mode="create" />
      </div>
    </main>
  );
}
