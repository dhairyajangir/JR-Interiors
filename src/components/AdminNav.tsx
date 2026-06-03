import Link from "next/link";

const TABS = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/sellers", label: "Sellers" },
];

export function AdminNav({ active, pendingListings }: { active: string; pendingListings?: number }) {
  return (
    <div className="mb-stack-md">
      <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-2 block">Admin</span>
      <nav className="flex gap-6 border-b border-outline-variant">
        {TABS.map((t) => {
          const on = t.href === active;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`pb-3 text-label-sm border-b-2 transition flex items-center gap-2 ${on ? "border-primary text-primary font-semibold" : "border-transparent text-on-surface-variant hover:text-primary"}`}
            >
              {t.label}
              {t.label === "Listings" && pendingListings ? (
                <span className="bg-error text-on-error text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {pendingListings}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
