import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { AdminNav } from "@/components/AdminNav";
import { createSeller, setSellerStatus } from "@/app/admin-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sellers · Admin", robots: { index: false } };

const FIELD =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";
const LABEL = "text-label-sm text-primary block mb-2";

type SP = Promise<{ created?: string; error?: string }>;

export default async function AdminSellersPage({ searchParams }: { searchParams: SP }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();
  const { created, error } = await searchParams;

  const [pendingCount, sellers] = await Promise.all([
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.seller.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } }, _count: { select: { products: true } } },
    }),
  ]);

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <AdminNav active="/admin/sellers" pendingListings={pendingCount} />
        <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-stack-md">Sellers</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md items-start">
          {/* Invite */}
          <section className="lg:col-span-1 bg-surface-container-lowest rounded-xl editorial-shadow p-6">
            <h2 className="text-subheading text-primary mb-5 flex items-center gap-2">
              <Icon name="person_add" className="text-[22px]" /> Invite a seller
            </h2>
            {created && (
              <div className="bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 text-label-sm mb-4">
                Seller account created.
              </div>
            )}
            {error && (
              <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-sm mb-4">
                {error === "email" ? "That email already has an account." : "Please fill all required fields (password 8+ chars)."}
              </div>
            )}
            <form action={createSeller} className="space-y-4">
              <div>
                <label className={LABEL} htmlFor="brandName">Brand / store name *</label>
                <input id="brandName" name="brandName" required placeholder="Studio Oak" className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="fullName">Contact name *</label>
                <input id="fullName" name="fullName" required placeholder="Owner name" className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="email">Login email *</label>
                <input id="email" name="email" type="email" required placeholder="seller@brand.in" className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="password">Temp password *</label>
                <input id="password" name="password" required minLength={8} placeholder="Min 8 characters" className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="bio">Bio (optional)</label>
                <textarea id="bio" name="bio" rows={2} placeholder="Short brand description" className={FIELD} />
              </div>
              <button className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-sm hover:opacity-90 transition">
                Create seller account
              </button>
              <p className="text-label-xs text-on-surface-variant">Share the email + temp password with the seller. They sign in and manage their own products.</p>
            </form>
          </section>

          {/* List */}
          <section className="lg:col-span-2">
            {sellers.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-10 text-center text-on-surface-variant">
                <Icon name="storefront" className="text-5xl text-outline-variant mb-4" />
                <p>No sellers yet. Invite your first vendor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellers.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-4 bg-surface-container-lowest rounded-xl editorial-shadow p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-body-md font-medium text-primary">{s.brandName}</p>
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold ${s.status === "active" ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant">{s.user.email} · {s._count.products} product{s._count.products === 1 ? "" : "s"}</p>
                    </div>
                    <form action={setSellerStatus}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="status" value={s.status === "active" ? "suspended" : "active"} />
                      <button className="text-label-sm border border-outline-variant text-primary px-4 py-2 rounded-lg hover:bg-surface-container transition">
                        {s.status === "active" ? "Suspend" : "Reactivate"}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
