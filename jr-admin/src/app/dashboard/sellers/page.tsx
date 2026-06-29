import { updateAdminStatus, updateStorefrontSellerStatus } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getAdminEmail } from "@/lib/auth";
import { formatCompactNumber, requireDashboardAdmin, statusTone } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function SellersPage() {
  const user = await requireDashboardAdmin();
  const adminEmail = getAdminEmail();
  const [adminUsers, storefrontSellers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        businessName: true,
        email: true,
        status: true,
        createdAt: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            status: true,
            createdAt: true,
          },
        },
        products: {
          select: { id: true },
        },
      },
    }),
    prisma.storefrontSeller.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        products: {
          select: { id: true },
        },
      },
    }),
  ]);

  return (
    <DashboardShell user={user} currentPath="/dashboard/sellers">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Sellers</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Seller Directories & Moderation</h1>
        <p className="mt-1 text-sm text-steel">
          Verify seller onboarding payments in `jr_admin` and manage active seller profiles on the live storefront.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Admin workspace accounts</h2>
            <p className="text-sm text-steel">{formatCompactNumber(adminUsers.length)} sellers and admins in `jr_admin`</p>
          </div>
          <div className="divide-y divide-line">
            {adminUsers.map((account) => (
              <article key={account.id} className="flex flex-col gap-3 px-6 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-base font-semibold text-ink">{account.businessName}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${statusTone(account.status)}`}>
                      {account.status}
                    </span>
                    {account.email.toLowerCase() === adminEmail ? (
                      <span className="rounded-full bg-mint/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-mint">
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-steel">{account.fullName} · {account.email}</p>
                  <p className="mt-1 text-xs text-steel">
                    {formatCompactNumber(account.products.length)} listings · Joined {formatDate(account.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-steel">
                    Payment {account.payments[0]?.status ?? "not started"}
                  </p>
                </div>
                <form action={updateAdminStatus} className="flex flex-wrap items-center gap-3 border-t border-line/60 pt-3">
                  <input type="hidden" name="id" value={account.id} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-steel">Workspace:</span>
                    <select name="status" defaultValue={account.status} className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink outline-none transition focus:border-mint">
                      <option value="TRIAL">Trial</option>
                      <option value="PENDING_REVIEW">Pending review</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                  <button type="submit" className="rounded-full bg-ink px-4 py-1 text-xs font-semibold text-white transition hover:bg-mint whitespace-nowrap">
                    Save
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Storefront sellers</h2>
            <p className="text-sm text-steel">{formatCompactNumber(storefrontSellers.length)} sellers in `public`</p>
          </div>
          <div className="divide-y divide-line">
            {storefrontSellers.map((seller) => (
              <article key={seller.id} className="flex flex-col gap-3 px-6 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-base font-semibold text-ink">{seller.brandName}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${statusTone(seller.status)}`}>
                      {seller.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-steel">{seller.user.fullName} · {seller.user.email}</p>
                  <p className="mt-1 text-xs text-steel">
                    {formatCompactNumber(seller.products.length)} products · Created {formatDate(seller.createdAt)}
                  </p>
                </div>
                <form action={updateStorefrontSellerStatus} className="flex flex-wrap items-center gap-3 border-t border-line/60 pt-3">
                  <input type="hidden" name="id" value={seller.id} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-steel">Storefront:</span>
                    <select name="status" defaultValue={seller.status} className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink outline-none transition focus:border-mint">
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <button type="submit" className="rounded-full bg-ink px-4 py-1 text-xs font-semibold text-white transition hover:bg-mint whitespace-nowrap">
                    Save
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
