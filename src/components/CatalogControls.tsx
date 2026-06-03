"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
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

  return (
    <aside className={clsx("w-full md:w-64 flex-shrink-0 space-y-stack-md md:sticky md:top-28 self-start", pending && "opacity-70")}>
      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-4">Category</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => apply((p) => p.delete("type"))}
              className={clsx("text-body-md hover:translate-x-1 transition-transform", !type ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary")}
            >
              All Pieces
            </button>
          </li>
          {TYPES.map((t) => (
            <li key={t}>
              <button
                onClick={() => apply((p) => (type === t ? p.delete("type") : p.set("type", t)))}
                className={clsx("text-body-md hover:translate-x-1 transition-transform", type === t ? "text-primary font-medium" : "text-on-surface-variant hover:text-primary")}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-4">Room Type</h3>
        <div className="flex flex-wrap gap-2">
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => apply((p) => (room === r ? p.delete("room") : p.set("room", r)))}
              className={clsx(
                "px-4 py-2 rounded-lg text-label-sm transition-colors",
                room === r ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant hover:bg-secondary-container"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-4">Material</h3>
        <div className="space-y-2">
          {MATERIALS.map((m) => (
            <label key={m} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={materials.includes(m)}
                onChange={() => toggleMaterial(m)}
                className="w-5 h-5 border-outline rounded text-primary focus:ring-primary"
              />
              <span className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-label-sm uppercase tracking-widest text-primary mb-4">Color Palette</h3>
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c.name}
              title={c.name}
              aria-label={c.name}
              className="w-6 h-6 rounded-full border border-outline-variant"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <SortSelect sort={sort} onChange={(v) => apply((p) => p.set("sort", v))} />
      </div>
    </aside>
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
