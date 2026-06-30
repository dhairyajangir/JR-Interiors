import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { price } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { SellerNav } from "@/components/SellerNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seller Studio", robots: { index: false } };

export default async function SellerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  if (!user.sellerId) redirect("/account");

  const products = await prisma.product.findMany({
    where: { sellerId: user.sellerId },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    published: products.filter((p) => p.status === "PUBLISHED").length,
    pending: products.filter((p) => p.status === "PENDING").length,
    rejected: products.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <SellerNav brandName={user.brandName ?? "Your Store"} active="products" />

        <div className="grid grid-cols-3 gap-gutter mb-stack-md">
          <Stat label="Published" value={counts.published} />
          <Stat label="Pending" value={counts.pending} />
          <Stat label="Rejected" value={counts.rejected} />
        </div>

        {products.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-10 text-center">
            <Icon name="inventory_2" className="text-5xl text-outline-variant mb-4" />
            <p className="text-on-surface-variant mb-6">No products yet. List your first piece.</p>
            <Link href="/seller/products/new" className="inline-block bg-primary text-on-primary px-8 py-3 rounded-lg font-label-sm hover:opacity-90 transition">
              Add product
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-surface-container-lowest rounded-xl editorial-shadow p-4">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0">
                  {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="64px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-body-md font-medium text-primary truncate">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-label-sm text-on-surface-variant">{price(p.priceCents)} · {p.type} · stock {p.stock}</p>
                  {p.status === "REJECTED" && p.reviewNote && (
                    <p className="text-label-xs text-error mt-1">Reason: {p.reviewNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {p.status === "PUBLISHED" && (
                    <Link href={`/product/${p.slug}`} className="text-on-surface-variant hover:text-primary transition" aria-label="View">
                      <Icon name="open_in_new" className="text-[20px]" />
                    </Link>
                  )}
                  <Link href={`/seller/products/${p.id}/edit`} className="text-on-surface-variant hover:text-primary transition" aria-label="Edit">
                    <Icon name="edit" className="text-[20px]" />
                  </Link>
                  <DeleteProductButton id={p.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-5">
      <p className="text-display-hero-mobile md:text-headline-section text-primary font-medium tabular-nums leading-none">{value}</p>
      <p className="text-label-xs uppercase tracking-widest text-on-surface-variant mt-2">{label}</p>
    </div>
  );
}
