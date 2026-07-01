"use client";

import React, { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import {
  TAX_KIND_LABELS,
  TAX_STATUS_LABELS,
  TAX_VISIBILITY_LABELS,
} from "../constants";
import type { TaxKind, TaxStatus, TaxVisibility, TaxonomyFilters } from "../types";

interface TaxonomyFiltersBarProps {
  filters: TaxonomyFilters;
  onChange: (filters: TaxonomyFilters) => void;
  showKindFilter?: boolean;
  lockKind?: TaxKind;
}

const ALL_KINDS = Object.keys(TAX_KIND_LABELS) as TaxKind[];
const ALL_STATUSES = Object.keys(TAX_STATUS_LABELS) as TaxStatus[];
const ALL_VISIBILITIES = Object.keys(TAX_VISIBILITY_LABELS) as TaxVisibility[];

export function TaxonomyFiltersBar({
  filters,
  onChange,
  showKindFilter = true,
  lockKind,
}: TaxonomyFiltersBarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null && v !== ""
  ).length;

  const setFilter = <K extends keyof TaxonomyFilters>(
    key: K,
    value: TaxonomyFilters[K] | undefined
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => onChange({});

  return (
    <div className="space-y-2">
      {/* Trigger row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="
            flex items-center gap-1.5 h-8 px-3 text-xs
            bg-panel border border-muted rounded-md
            text-secondary hover:text-primary hover:border-gold/40
            transition-all duration-150
          "
        >
          <Filter className="h-3 w-3" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 bg-gold/20 text-gold text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-secondary hover:text-primary transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div className="p-4 bg-panel border border-muted rounded-md grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Kind filter */}
          {showKindFilter && !lockKind && (
            <FilterSelect
              label="Kind"
              value={filters.kind ?? ""}
              onChange={(v) => setFilter("kind", v ? (v as TaxKind) : undefined)}
              options={ALL_KINDS.map((k) => ({ value: k, label: TAX_KIND_LABELS[k] }))}
              placeholder="All kinds"
            />
          )}

          {/* Status filter */}
          <FilterSelect
            label="Status"
            value={filters.status ?? ""}
            onChange={(v) => setFilter("status", v ? (v as TaxStatus) : undefined)}
            options={ALL_STATUSES.map((s) => ({ value: s, label: TAX_STATUS_LABELS[s] }))}
            placeholder="All statuses"
          />

          {/* Visibility filter */}
          <FilterSelect
            label="Visibility"
            value={filters.visibility ?? ""}
            onChange={(v) =>
              setFilter("visibility", v ? (v as TaxVisibility) : undefined)
            }
            options={ALL_VISIBILITIES.map((v) => ({
              value: v,
              label: TAX_VISIBILITY_LABELS[v],
            }))}
            placeholder="All visibilities"
          />

          {/* Top-level only toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider">
              Hierarchy
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.parentId === null}
                onChange={(e) =>
                  setFilter("parentId", e.target.checked ? null : undefined)
                }
                className="w-3.5 h-3.5 rounded border-muted bg-panel text-gold focus:ring-gold/50"
              />
              <span className="text-xs text-primary">Top-level only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inner: reusable select ────────────────────────────────────────────────────

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-secondary uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-8 px-2.5 text-xs
          bg-sidebar border border-muted rounded-md
          text-primary
          focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50
          transition-all duration-150
        "
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
