import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { priceExact } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { ProfileForm, AddressForm, AddressActions, LogoutButton } from "@/components/AccountForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account | JR INTERIORS" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const [addresses, orders] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }),
  ]);

  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-stack-md">
          <div>
            <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-1">My Account</h1>
            <p className="text-body-lg text-on-surface-variant">Welcome back, {user.fullName.split(" ")[0]}.</p>
          </div>
          <div className="flex items-center gap-6">
            {user.sellerId && (
              <Link href="/seller" className="flex items-center gap-2 text-label-sm text-primary font-semibold hover:underline">
                <Icon name="storefront" className="text-[18px]" /> Seller Studio
              </Link>
            )}
            {user.isAdmin && (
              <Link href="/admin/orders" className="flex items-center gap-2 text-label-sm text-primary font-semibold hover:underline">
                <Icon name="dashboard" className="text-[18px]" /> Admin
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md items-start">
          {/* Profile */}
          <section className="lg:col-span-1 bg-surface-container-lowest rounded-xl editorial-shadow p-6">
            <h2 className="text-subheading text-primary mb-5 flex items-center gap-2">
              <Icon name="person" className="text-[22px]" /> Profile
            </h2>
            <ProfileForm fullName={user.fullName} email={user.email} phone={user.phone} />
          </section>

          {/* Addresses */}
          <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl editorial-shadow p-6">
            <h2 className="text-subheading text-primary mb-5 flex items-center gap-2">
              <Icon name="home_pin" className="text-[22px]" /> Saved Addresses
            </h2>
            <div className="space-y-4 mb-5">
              {addresses.length === 0 && (
                <p className="text-on-surface-variant text-body-md">No saved addresses yet.</p>
              )}
              {addresses.map((a) => (
                <div key={a.id} className="border border-outline-variant rounded-lg p-4 flex justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-label-sm font-semibold text-primary">{a.label}</span>
                      {a.isDefault && (
                        <span className="text-[10px] uppercase tracking-wider bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-body-md text-on-surface">{a.fullName}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.region} {a.postalCode}
                    </p>
                  </div>
                  <AddressActions id={a.id} isDefault={a.isDefault} />
                </div>
              ))}
            </div>
            <AddressForm />
          </section>

          {/* Orders */}
          <section className="lg:col-span-3">
            <h2 className="text-subheading text-primary mb-5 flex items-center gap-2">
              <Icon name="receipt_long" className="text-[22px]" /> Order History
            </h2>
            {orders.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-10 text-center">
                <Icon name="receipt_long" className="text-5xl text-outline-variant mb-4" />
                <p className="text-on-surface-variant mb-6">You have no orders yet.</p>
                <Link href="/furniture" className="inline-block bg-primary text-on-primary px-8 py-3 rounded-lg font-label-sm hover:opacity-90 transition">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <Link key={o.id} href={`/order/${o.number}`} className="block bg-surface-container-lowest rounded-xl editorial-shadow p-6 hover:shadow-md transition">
                    <div className="flex flex-wrap justify-between gap-3 items-center">
                      <div>
                        <p className="text-label-sm font-bold text-primary">{o.number}</p>
                        <p className="text-label-xs text-on-surface-variant">{o.items.length} item{o.items.length === 1 ? "" : "s"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-label-xs uppercase tracking-widest bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">{o.status}</span>
                        <span className="text-body-md font-bold text-primary tabular-nums">{priceExact(o.totalCents)}</span>
                        <Icon name="chevron_right" className="text-on-surface-variant" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
