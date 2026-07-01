"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { listTaxonomiesAction } from "../actions/taxonomy-actions";

interface ParentPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
  kind?: string;
  excludeId?: string;   // Prevent selecting self or descendants
  disabled?: boolean;
  label?: string;
}

interface TaxOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  depth?: number;
}

export function ParentPicker({
  value,
  onChange,
  kind,
  excludeId,
  disabled = false,
  label = "Parent",
}: ParentPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<TaxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch options on open / search change
  useEffect(() => {
    if (!open) return;
    setLoading(true);

    const timer = setTimeout(async () => {
      const res = await listTaxonomiesAction(
        { search, kind, status: "PUBLISHED" },
        { limit: 50, sortBy: "name", sortOrder: "asc" }
      );

      if (res.success) {
        const filtered = (res.data.nodes as TaxOption[]).filter(
          (n) => n.id !== excludeId
        );
        setOptions(filtered);
      }
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [open, search, kind, excludeId]);

  // Resolve label for current value
  useEffect(() => {
    if (!value) {
      setSelectedLabel("");
      return;
    }
    const found = options.find((o) => o.id === value);
    if (found) setSelectedLabel(found.name);
  }, [value, options]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = useCallback(
    (id: string, name: string) => {
      onChange(id);
      setSelectedLabel(name);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setSelectedLabel("");
    },
    [onChange]
  );

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((p) => !p)}
          className="
            w-full flex items-center justify-between
            h-8 px-3 text-xs
            bg-panel border border-muted rounded-md
            text-primary hover:border-gold/40
            focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={selectedLabel ? "text-primary" : "text-secondary"}>
            {selectedLabel || "None (top-level)"}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <span
                role="button"
                onClick={handleClear}
                className="text-secondary hover:text-primary"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown className="h-3 w-3 text-secondary" />
          </div>
        </button>

        {open && (
          <div className="
            absolute top-full left-0 right-0 z-50 mt-1
            bg-panel border border-muted rounded-md shadow-xl
            overflow-hidden
          ">
            {/* Search within picker */}
            <div className="p-2 border-b border-muted">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="
                  w-full h-7 px-2.5 text-xs
                  bg-sidebar border border-muted rounded
                  text-primary placeholder:text-secondary
                  focus:outline-none focus:ring-1 focus:ring-gold/50
                "
              />
            </div>

            <ul
              role="listbox"
              className="max-h-56 overflow-y-auto"
            >
              {/* None option */}
              <li
                role="option"
                aria-selected={!value}
                onClick={() => { onChange(null); setSelectedLabel(""); setOpen(false); }}
                className="
                  flex items-center gap-2 px-3 py-2 text-xs
                  cursor-pointer hover:bg-heavy/30 transition-colors
                  text-secondary italic
                "
              >
                <Check className={`h-3 w-3 ${!value ? "opacity-100" : "opacity-0"}`} />
                None (top-level)
              </li>

              {loading ? (
                <li className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-secondary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </li>
              ) : options.length === 0 ? (
                <li className="px-3 py-4 text-xs text-secondary text-center">
                  No nodes found
                </li>
              ) : (
                options.map((opt) => (
                  <li
                    key={opt.id}
                    role="option"
                    aria-selected={value === opt.id}
                    onClick={() => handleSelect(opt.id, opt.name)}
                    className="
                      flex items-center gap-2 px-3 py-2 text-xs
                      cursor-pointer hover:bg-heavy/30 transition-colors
                    "
                  >
                    <Check
                      className={`h-3 w-3 text-gold shrink-0 ${
                        value === opt.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="text-primary truncate">{opt.name}</span>
                    <span className="text-secondary ml-auto shrink-0 text-[10px]">
                      {opt.slug}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
