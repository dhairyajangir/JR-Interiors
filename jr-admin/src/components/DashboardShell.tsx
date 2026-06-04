import Link from "next/link";
import { ReactNode } from "react";
import { logout } from "@/app/actions";
import type { SafeUser } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Products" },
  { href: "/onboarding", label: "UPI Billing" },
];

export function DashboardShell({
  user,
  currentPath,
  children,
}: {
  user: SafeUser;
  currentPath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel sticky top-4 h-fit overflow-hidden">
          <div className="border-b border-line px-6 py-6">
            <p className="text-xs uppercase tracking-[0.28em] text-mint">Standalone service</p>
            <h1 className="mt-3 text-2xl font-semibold text-ink">{user.businessName}</h1>
            <p className="mt-2 text-sm text-steel">{user.fullName}</p>
          </div>

          <nav className="space-y-2 px-4 py-4">
            {nav.map((item) => {
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-ink text-white shadow-soft"
                      : "text-steel hover:bg-sand/70 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4 border-t border-line px-6 py-6">
            <div className="rounded-2xl bg-sand px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Onboarding state</p>
              <p className="mt-2 text-lg font-semibold text-ink">{user.status}</p>
              <p className="mt-1 text-sm text-steel">Payment report moves account into review. Listing access stays tied to this service only.</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-full border border-line px-4 py-3 text-sm font-medium text-steel transition hover:border-ink hover:text-ink"
              >
                Log out
              </button>
            </form>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
