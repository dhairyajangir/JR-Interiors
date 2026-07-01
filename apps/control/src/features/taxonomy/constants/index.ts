/**
 * Taxonomy Feature — Constants
 *
 * Human-readable labels, valid state transitions, badge colors,
 * and static config for the taxonomy engine.
 */

import type { TaxKind, TaxStatus, TaxVisibility } from "../types";

// ── Kind metadata ─────────────────────────────────────────────────────────────

export const TAX_KIND_LABELS: Record<TaxKind, string> = {
  CATEGORY:   "Category",
  COLLECTION: "Collection",
  ROOM:       "Room",
  MATERIAL:   "Material",
  STYLE:      "Style",
  FINISH:     "Finish",
};

export const TAX_KIND_DESCRIPTIONS: Record<TaxKind, string> = {
  CATEGORY:   "Main product hierarchy for the storefront catalog",
  COLLECTION: "Curated editorial sets (e.g. Atelier, Luxury Office)",
  ROOM:       "Room-based navigation (Living, Office, Dining…)",
  MATERIAL:   "Material classification (Wood, Metal, Fabric…)",
  STYLE:      "Design language (Minimal, Industrial, Scandinavian…)",
  FINISH:     "Surface treatment taxonomy (Matte, Lacquer, Natural…)",
};

/** Badge color class per kind — maps to tailwind-compatible class strings */
export const TAX_KIND_COLORS: Record<TaxKind, string> = {
  CATEGORY:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  COLLECTION: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  ROOM:       "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  MATERIAL:   "bg-violet-500/15 text-violet-400 border-violet-500/20",
  STYLE:      "bg-pink-500/15 text-pink-400 border-pink-500/20",
  FINISH:     "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

// ── Status metadata ───────────────────────────────────────────────────────────

export const TAX_STATUS_LABELS: Record<TaxStatus, string> = {
  DRAFT:     "Draft",
  PUBLISHED: "Published",
  ARCHIVED:  "Archived",
};

export const TAX_STATUS_COLORS: Record<TaxStatus, string> = {
  DRAFT:     "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  PUBLISHED: "bg-green-500/15 text-green-400 border-green-500/20",
  ARCHIVED:  "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

/**
 * Valid state machine transitions per status.
 * The service layer enforces these; the UI uses them to show allowed actions.
 */
export const TAX_STATUS_TRANSITIONS: Record<TaxStatus, TaxStatus[]> = {
  DRAFT:     ["PUBLISHED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED:  ["PUBLISHED"], // Re-publish is allowed; back to DRAFT is not
};

// ── Visibility metadata ───────────────────────────────────────────────────────

export const TAX_VISIBILITY_LABELS: Record<TaxVisibility, string> = {
  PUBLIC:   "Public",
  PRIVATE:  "Private",
  UNLISTED: "Unlisted",
};

export const TAX_VISIBILITY_DESCRIPTIONS: Record<TaxVisibility, string> = {
  PUBLIC:   "Visible to all users on the storefront",
  PRIVATE:  "Admin only — hidden from all public surfaces",
  UNLISTED: "Accessible via direct link but not in navigation",
};

export const TAX_VISIBILITY_COLORS: Record<TaxVisibility, string> = {
  PUBLIC:   "bg-green-500/15 text-green-400 border-green-500/20",
  PRIVATE:  "bg-red-500/15 text-red-400 border-red-500/20",
  UNLISTED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

// ── Audit actions ─────────────────────────────────────────────────────────────

export const TAXONOMY_AUDIT_ACTIONS = {
  TAXONOMY_CREATED:          "TAXONOMY_CREATED",
  TAXONOMY_UPDATED:          "TAXONOMY_UPDATED",
  TAXONOMY_PUBLISHED:        "TAXONOMY_PUBLISHED",
  TAXONOMY_ARCHIVED:         "TAXONOMY_ARCHIVED",
  TAXONOMY_DELETED:          "TAXONOMY_DELETED",
  TAXONOMY_MOVED:            "TAXONOMY_MOVED",
  TAXONOMY_MERGED:           "TAXONOMY_MERGED",
  TAXONOMY_REORDERED:        "TAXONOMY_REORDERED",
  TAXONOMY_PRODUCT_ASSIGNED: "TAXONOMY_PRODUCT_ASSIGNED",
  TAXONOMY_PRODUCT_REMOVED:  "TAXONOMY_PRODUCT_REMOVED",
  TAXONOMY_COUNTS_REBUILT:   "TAXONOMY_COUNTS_REBUILT",
} as const;

// ── Limits & tuning ───────────────────────────────────────────────────────────

export const TAXONOMY_LIMITS = {
  /** Maximum nesting depth before the UI shows a warning */
  MAX_DEPTH_SOFT: 5,
  /** Hard limit: prevent creating nodes deeper than this */
  MAX_DEPTH_HARD: 10,
  /** Slug max length */
  SLUG_MAX_LENGTH: 128,
  /** Name max length */
  NAME_MAX_LENGTH: 200,
  /** Description max length */
  DESC_MAX_LENGTH: 2000,
  /** Default page size */
  DEFAULT_PAGE_SIZE: 25,
  /** Max page size */
  MAX_PAGE_SIZE: 100,
} as const;
