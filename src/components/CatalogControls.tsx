"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { clsx } from "@/lib/clsx";

const TYPES = ["Seating", "Tables", "Storage", "Bedroom", "Lighting", "Decor"];
const ROOMS = ["Living", "Office", "Dining", "Studio"];
const MATERIALS = ["Solid Walnut", "Oak Veneer", "Brushed Brass", "Italian Leather"];
const COLORS = [
  { hex: "#513726", name: "Walnut" },
  { hex: "#F8F6F2", name: "Cream" },
  { hex: "#303030", name: "Charcoal" },
  { hex: "#81756d", name: "Taupe" },
];
const SORTS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export function CatalogControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const apply = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page");
      start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
    },
    [params, pathname, router]
  );

  const type = params.get("type");
  const room = params.get("room");
  const sort = params.get("sort") ?? "newest";
  const materials = params.getAll("material");

  const toggleMaterial = (m: string) =>
    apply((p) => {
      const cur = p.getAll("material");
      p.delete("material");
      const next = cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m];
      next.forEach((v) => p.append("material", v));
    });

  const activeFiltersCount = (type ? 1 : 0) + (room ? 1 : 0) + materials.length;

  const clearAll = () => {
    apply((p) => {
      p.delete("type");
      p.delete("room");
      p.delete("material");
    });
    setMobileOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-3.5 font-bold">Category</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => apply((p) => p.delete("type"))}
              className={clsx("text-body-md text-left py-1 hover:translate-x-1 transition-transform", !type ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary")}
            >
              All Pieces
            </button>
          </li>
          {TYPES.map((t) => (
            <li key={t}>
              <button
                onClick={() => apply((p) => (type === t ? p.delete("type") : p.set("type", t)))}
                className={clsx("text-body-md text-left py-1 hover:translate-x-1 transition-transform", type === t ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary")}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Room Type */}
      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-3.5 font-bold">Room Type</h3>
        <div className="flex flex-wrap gap-2.5">
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => apply((p) => (room === r ? p.delete("room") : p.set("room", r)))}
              className={clsx(
                "px-4 py-2.5 rounded-lg text-label-xs font-semibold uppercase tracking-wider transition-colors min-h-[44px]",
                room === r ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-secondary-container"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-3.5 font-bold">Material</h3>
        <div className="space-y-3">
          {MATERIALS.map((m) => (
            <label key={m} className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
              <input
                type="checkbox"
                checked={materials.includes(m)}
                onChange={() => toggleMaterial(m)}
                className="w-6 h-6 border-outline rounded text-primary focus:ring-primary accent-primary"
              />
              <span className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors font-medium">{m}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-3.5 font-bold">Color Palette</h3>
        <div className="flex gap-4">
          {COLORS.map((c) => (
            <button
              key={c.name}
              title={c.name}
              aria-label={c.name}
              className="w-8 h-8 rounded-full border border-outline-variant/60 shadow-sm active:scale-90 transition-transform"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Control Bar */}
      <div className="md:hidden flex justify-between items-center gap-4 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-lg text-label-sm font-semibold hover:opacity-95 transition"
        >
          <Icon name="tune" className="text-[18px]" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
        <div className="flex-1 border-l border-outline-variant/40 pl-4">
          <SortSelect sort={sort} onChange={(v) => apply((p) => p.set("sort", v))} />
        </div>
      </div>

      {/* Desktop Sidebar Filter View */}
      <aside className={clsx("hidden md:block w-64 flex-shrink-0 space-y-stack-md sticky top-28 self-start", pending && "opacity-70")}>
        <FilterContent />
      </aside>

      {/* Mobile Slide-Up Bottom Drawer Sheet */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs animate-backdrop"
          />
          {/* Bottom Drawer Container */}
          <div 
            className="relative w-full max-h-[85vh] bg-surface rounded-t-2xl shadow-drawer animate-slide-up flex flex-col z-10"
          >
            {/* Header / Drag Bar */}
            <div className="flex flex-col items-center justify-center py-3 border-b border-outline-variant/20 sticky top-0 bg-surface rounded-t-2xl z-10">
              <span className="w-12 h-1 bg-outline-variant/70 rounded-full mb-2" />
              <div className="w-full px-6 flex justify-between items-center h-8">
                <span className="text-label-sm font-bold uppercase tracking-wider text-primary">Filters</span>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAll} className="text-label-xs uppercase text-error tracking-wider font-semibold py-1">
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            {/* Filter Forms Body (Scrollable) */}
            <div className="p-6 overflow-y-auto pb-24 touch-momentum">
              <FilterContent />
            </div>

            {/* Bottom Sticky Action Bar in Drawer */}
            <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-outline-variant/20 p-4 pb-[calc(env(safe-area-inset-bottom,16px)+12px)] flex gap-4">
              <button 
                onClick={() => setMobileOpen(false)}
                className="flex-1 bg-primary text-on-primary py-4 rounded-xl text-label-sm font-bold hover:bg-primary/95 transition active:scale-98"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SortSelect({ sort, onChange }: { sort: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-label-sm text-on-surface-variant">Sort by:</span>
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none text-primary font-medium text-label-sm focus:ring-0 cursor-pointer"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}

export function SortBar({ sort }: { sort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const change = (v: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("sort", v);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  return <SortSelect sort={sort} onChange={change} />;
}

export function PageLink({ page, current, children }: { page: number; current: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const go = () => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    router.replace(`${pathname}?${next.toString()}`, { scroll: true });
  };
  return (
    <button
      onClick={go}
      className={clsx(
        "w-10 h-10 rounded-full text-label-sm flex items-center justify-center transition-all",
        current ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
      )}
    >
      {children ?? page}
    </button>
  );
}

export function PageArrow({ page, dir, disabled }: { page: number; dir: "left" | "right"; disabled: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const go = () => {
    if (disabled) return;
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    router.replace(`${pathname}?${next.toString()}`, { scroll: true });
  };
  return (
    <button
      onClick={go}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous page" : "Next page"}
      className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-40"
    >
      <Icon name={dir === "left" ? "chevron_left" : "chevron_right"} />
    </button>
  );
}
