import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Wishlist | JR INTERIORS" };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?redirect=/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id, product: { status: "PUBLISHED" } },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen pt-32 pb-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-stack-md">
          <span className="mb-3 block text-label-xs uppercase tracking-[0.2em] text-primary/60">Saved for later</span>
          <h1 className="text-headline-section-mobile text-primary md:text-headline-section">My Wishlist</h1>
          <p className="mt-3 text-body-lg text-on-surface-variant">
            {items.length} saved piece{items.length === 1 ? "" : "s"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl bg-surface-container-low p-10 text-center">
            <Icon name="favorite" className="mb-4 text-5xl text-outline-variant" />
            <p className="mb-6 text-on-surface-variant">Your wishlist is ready for pieces you love.</p>
            <Link href="/furniture" className="inline-block rounded-lg bg-primary px-8 py-3 font-label-sm text-on-primary transition hover:opacity-90">
              Explore Furniture
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(({ product }) => (
              <ProductCard
                key={product.id}
                product={product}
                initialSaved
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
