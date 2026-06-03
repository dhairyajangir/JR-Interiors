"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";

export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [, start] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const next = new URLSearchParams();
      if (value.trim()) next.set("q", value.trim());
      start(() => router.replace(`/search?${next.toString()}`, { scroll: false }));
    }, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative max-w-2xl mx-auto">
      <Icon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
      <input
        autoFocus
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search the collection — “walnut”, “sofa”, “lamp”…"
        aria-label="Search products"
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-14 pr-6 py-4 text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition shadow-sm"
      />
    </div>
  );
}
