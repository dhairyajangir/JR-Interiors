"use client";

import React, { useCallback } from "react";
import { Search, X } from "lucide-react";

interface TaxonomySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TaxonomySearch({
  value,
  onChange,
  placeholder = "Search by name, slug, or description…",
  className = "",
}: TaxonomySearchProps) {
  const handleClear = useCallback(() => onChange(""), [onChange]);

  return (
    <div className={`relative flex-1 min-w-0 max-w-sm ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary pointer-events-none" />
      <input
        id="taxonomy-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-8 pl-9 pr-8 text-xs
          bg-panel border border-muted rounded-md
          text-primary placeholder:text-secondary
          focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50
          transition-all duration-150
        "
        aria-label="Search taxonomy"
        autoComplete="off"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
          aria-label="Clear search"
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
