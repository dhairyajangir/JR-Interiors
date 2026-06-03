import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { price } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { AdminNav } from "@/components/AdminNav";
import { ListingModeration } from "@/components/RejectListingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Listings · Admin", robots: { index: false } };

export default async function AdminListingsPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const pending = await prisma.product.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { seller: true },
  });

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <AdminNav active="/admin/listings" pendingListings={pending.length} />
        <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-2">Pending listings</h1>
        <p className="text-body-lg text-on-surface-variant mb-stack-md">
          {pending.length} listing{pending.length === 1 ? "" : "s"} awaiting review.
        </p>

        {pending.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-10 text-center text-on-surface-variant">
            <Icon name="task_alt" className="text-5xl text-outline-variant mb-4" />
            <p>All caught up — no listings to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((p) => (
              <div key={p.id} className="bg-surface-container-lowest rounded-xl editorial-shadow p-5">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="relative w-full md:w-40 h-48 md:h-32 rounded-lg overflow-hidden bg-surface-container shrink-0">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="160px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-subheading text-primary">{p.name}</h3>
                      <span className="text-label-sm text-primary font-bold">{price(p.priceCents)}</span>
                    </div>
                    <p className="text-label-xs text-on-surface-variant mb-2">
                      by {p.seller?.brandName ?? "—"} · {p.room} · {p.type} · {p.material} · stock {p.stock}
                    </p>
                    <p className="text-body-md text-on-surface-variant line-clamp-3">{p.description}</p>
                    <div className="mt-4">
                      <ListingModeration id={p.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
