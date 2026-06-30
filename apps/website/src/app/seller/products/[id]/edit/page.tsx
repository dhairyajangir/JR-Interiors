import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SellerProductForm } from "@/components/SellerProductForm";
import { SellerNav } from "@/components/SellerNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product · Seller", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  if (!user.sellerId) redirect("/account");

  const product = await prisma.product.findFirst({ where: { id, sellerId: user.sellerId } });
  if (!product) notFound();

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
        <SellerNav brandName={user.brandName ?? "Your Store"} active="products" />
        <h2 className="text-subheading text-primary mb-6">Edit “{product.name}”</h2>
        <SellerProductForm
          mode="edit"
          product={{
            id: product.id,
            name: product.name,
            tagline: product.tagline,
            description: product.description,
            priceCents: product.priceCents,
            material: product.material,
            room: product.room,
            type: product.type,
            imageUrl: product.imageUrl,
            images: product.images,
            colorHexes: product.colorHexes,
            stock: product.stock,
          }}
        />
      </div>
    </main>
  );
}
