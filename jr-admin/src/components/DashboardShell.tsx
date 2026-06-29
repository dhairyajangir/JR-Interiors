import Link from "next/link";
import { ReactNode } from "react";
import { logout } from "@/app/actions";
import { DemoBanner } from "@/components/DemoBanner";
import type { SafeUser } from "@/lib/auth";

function isActive(currentPath: string, href: string): boolean {
  if (href === "/dashboard") {
    return currentPath === "/dashboard";
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function DashboardShell({
  user,
  currentPath,
  children,
}: {
  user: SafeUser;
  currentPath: string;
  children: ReactNode;
}) {
  const adminNav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/customers", label: "Customers" },
    { href: "/dashboard/sellers", label: "Sellers" },
    { href: "/dashboard/consultations", label: "Consultations" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/audit", label: "Audit Log" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  const sellerNav = [
    { href: "/dashboard", label: "Products" },
    { href: "/onboarding", label: "UPI Billing" },
  ];

  const nav = user.isAdmin ? adminNav : sellerNav;

  return (
    <div className="min-h-screen px-4 py-4 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-4 h-fit overflow-hidden rounded-[28px] border border-[#1f2937] bg-[#111827] text-white shadow-[0_28px_80px_rgba(17,24,39,0.2)]">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[#90d9d2]">
              {user.isAdmin ? "Platform admin" : "Seller workspace"}
            </p>
            <h1 className="mt-3 text-2xl font-semibold">{user.businessName}</h1>
            <p className="mt-2 text-sm text-white/70">{user.fullName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">{user.status}</p>
          </div>

          <nav className="space-y-2 px-4 py-4">
            {nav.map((item) => {
              const active = isActive(currentPath, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-[#111827]"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4 border-t border-white/10 px-6 py-6">
            <div className="rounded-2xl bg-white/6 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[#f4b488]">
                {user.isAdmin ? "Access level" : "Onboarding state"}
              </p>
              <p className="mt-2 text-lg font-semibold">{user.isAdmin ? "Full platform control" : user.status}</p>
              <p className="mt-1 text-sm text-white/65">
                {user.isAdmin
                  ? "Live bridge into storefront products, orders, customers, sellers, and consultations."
                  : "Registration payment moves seller account into review."}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-full border border-white/12 px-4 py-3 text-sm font-medium text-white/78 transition hover:border-white/28 hover:text-white"
              >
                Log out
              </button>
            </form>
          </div>
        </aside>

        <main className="space-y-6">
          <DemoBanner user={user} />
          {children}
        </main>
      </div>
    </div>
  );
}
