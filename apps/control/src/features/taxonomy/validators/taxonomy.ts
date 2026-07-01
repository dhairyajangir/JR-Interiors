import { z } from "zod";
import { TAXONOMY_LIMITS } from "../constants";

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const SlugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(TAXONOMY_LIMITS.SLUG_MAX_LENGTH, `Slug cannot exceed ${TAXONOMY_LIMITS.SLUG_MAX_LENGTH} characters`)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens only"
  );

const TaxKindSchema = z.enum(
  ["CATEGORY", "COLLECTION", "ROOM", "MATERIAL", "STYLE", "FINISH"],
  { errorMap: () => ({ message: "Invalid taxonomy kind" }) }
);

const TaxStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
  errorMap: () => ({ message: "Invalid taxonomy status" }),
});

const TaxVisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "UNLISTED"], {
  errorMap: () => ({ message: "Invalid visibility value" }),
});

// ── Create ────────────────────────────────────────────────────────────────────

export const CreateTaxonomySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(TAXONOMY_LIMITS.NAME_MAX_LENGTH, `Name cannot exceed ${TAXONOMY_LIMITS.NAME_MAX_LENGTH} characters`),
  slug: SlugSchema,
  kind: TaxKindSchema,
  description: z
    .string()
    .max(TAXONOMY_LIMITS.DESC_MAX_LENGTH, `Description cannot exceed ${TAXONOMY_LIMITS.DESC_MAX_LENGTH} characters`)
    .optional(),
  coverImage: z.string().url("Cover image must be a valid URL").optional(),
  bannerImage: z.string().url("Banner image must be a valid URL").optional(),
  icon: z.string().max(200).optional(),
  parentId: z.string().cuid("Invalid parent taxonomy ID").optional(),
  sortOrder: z.number().int().nonnegative().optional().default(0),
  visibility: TaxVisibilitySchema.optional().default("PUBLIC"),
  seoTitle: z.string().max(200, "SEO title max 200 chars").optional(),
  seoDesc: z.string().max(500, "SEO description max 500 chars").optional(),
  seoKeywords: z.array(z.string().min(1)).max(20, "Max 20 SEO keywords").optional().default([]),
});

// ── Update ────────────────────────────────────────────────────────────────────

export const UpdateTaxonomySchema = CreateTaxonomySchema.partial().extend({
  status: TaxStatusSchema.optional(),
  slugLocked: z.boolean().optional(),
});

// ── Move (change parent) ──────────────────────────────────────────────────────

export const MoveTaxonomySchema = z.object({
  id: z.string().cuid("Invalid taxonomy ID"),
  newParentId: z.string().cuid("Invalid parent taxonomy ID").nullable(),
});

// ── Merge ─────────────────────────────────────────────────────────────────────

export const MergeTaxonomySchema = z.object({
  sourceId: z.string().cuid("Invalid source taxonomy ID"),
  targetId: z.string().cuid("Invalid target taxonomy ID"),
}).refine(
  (data) => data.sourceId !== data.targetId,
  { message: "Cannot merge a taxonomy node into itself", path: ["targetId"] }
);

// ── Reorder ───────────────────────────────────────────────────────────────────

export const ReorderTaxonomySchema = z.object({
  parentId: z.string().cuid("Invalid parent taxonomy ID").nullable(),
  orderedIds: z.array(z.string().cuid()).min(1, "At least one ID required"),
});

// ── Bulk operations ───────────────────────────────────────────────────────────

export const BulkTaxonomySchema = z.object({
  ids: z.array(z.string().cuid("Invalid taxonomy ID")).min(1, "At least one ID required"),
});

export const BulkMoveSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, "At least one ID required"),
  newParentId: z.string().cuid("Invalid parent taxonomy ID").nullable(),
});

export const BulkVisibilitySchema = z.object({
  ids: z.array(z.string().cuid()).min(1, "At least one ID required"),
  visibility: TaxVisibilitySchema,
});

// ── Product assignment ────────────────────────────────────────────────────────

export const AssignProductSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  taxonomyId: z.string().cuid("Invalid taxonomy ID"),
  primary: z.boolean().optional().default(false),
});

export const RemoveProductSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  taxonomyId: z.string().cuid("Invalid taxonomy ID"),
});

// ── Query / filter ────────────────────────────────────────────────────────────

export const TaxonomyQuerySchema = z.object({
  search: z.string().optional(),
  kind: TaxKindSchema.optional(),
  status: TaxStatusSchema.optional(),
  visibility: TaxVisibilitySchema.optional(),
  parentId: z.string().cuid().nullable().optional(),
  hasParent: z.boolean().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  // Pagination
  limit: z.number().int().min(1).max(100).optional().default(25),
  cursor: z.string().optional(),
  sortBy: z
    .enum(["name", "sortOrder", "productCount", "childCount", "createdAt", "updatedAt"])
    .optional()
    .default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});
