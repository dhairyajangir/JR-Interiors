import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { priceExact } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { SellerNav } from "@/components/SellerNav";
import { fulfillOrderItem } from "@/app/seller-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders · Seller", robots: { index: false } };

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default async function SellerOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  if (!user.sellerId) redirect("/account");

  // Order items belonging to this seller, grouped by their order.
  const items = await prisma.orderItem.findMany({
    where: { sellerId: user.sellerId },
    orderBy: { order: { createdAt: "desc" } },
    include: { order: true },
  });

  const byOrder = new Map<string, { order: (typeof items)[number]["order"]; lines: typeof items }>();
  for (const it of items) {
    const g = byOrder.get(it.orderId);
    if (g) g.lines.push(it);
    else byOrder.set(it.orderId, { order: it.order, lines: [it] });
  }
  const groups = [...byOrder.values()];

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <SellerNav brandName={user.brandName ?? "Your Store"} active="orders" />

        {groups.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-10 text-center text-on-surface-variant">
            <Icon name="inbox" className="text-5xl text-outline-variant mb-4" />
            <p>No orders for your products yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(({ order, lines }) => (
              <div key={order.id} className="bg-surface-container-lowest rounded-xl editorial-shadow p-6">
                <div className="flex flex-wrap justify-between gap-3 items-start pb-4 border-b border-outline-variant">
                  <div>
                    <p className="text-label-sm font-bold text-primary">{order.number}</p>
                    <p className="text-label-xs text-on-surface-variant">{dateFmt.format(order.createdAt)} · {order.fullName}</p>
                    <p className="text-label-xs text-on-surface-variant">
                      {order.city}, {order.region} {order.postalCode}{order.phone ? ` · ${order.phone}` : ""}
                    </p>
                  </div>
                  <span className="text-label-xs uppercase tracking-wider bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
                    {order.paymentMethod === "razorpay" ? "Paid online" : "COD"}
                  </span>
                </div>
                <div className="pt-4 space-y-3">
                  {lines.map((it) => (
                    <div key={it.id} className="flex items-center gap-4">
                      {it.imageUrl && (
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-surface-container shrink-0">
                          <Image src={it.imageUrl} alt={it.name} fill sizes="48px" className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-label-sm text-primary truncate">{it.name} × {it.quantity}</p>
                        <p className="text-label-xs text-on-surface-variant">{priceExact(it.priceCents * it.quantity)}</p>
                      </div>
                      {it.itemStatus === "fulfilled" ? (
                        <span className="inline-flex items-center gap-1 text-label-xs text-secondary font-semibold">
                          <Icon name="check_circle" className="text-[16px]" /> Fulfilled
                        </span>
                      ) : (
                        <form action={fulfillOrderItem}>
                          <input type="hidden" name="id" value={it.id} />
                          <button className="text-label-xs bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition">
                            Mark fulfilled
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
