import { z } from "zod";
import { PRODUCT_STATUS } from "@jr/domain";

const STATUS_VALUES = [
  PRODUCT_STATUS.DRAFT,
  PRODUCT_STATUS.PENDING_REVIEW,
  PRODUCT_STATUS.APPROVED,
  PRODUCT_STATUS.PUBLISHED,
  PRODUCT_STATUS.CHANGES_REQUESTED,
  PRODUCT_STATUS.ARCHIVED,
] as const;

const finishSchema = z.object({
  name: z.string().min(1, "Finish name is required"),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code"),
});

const seoSchema = z.object({
  title: z.string().max(100, "SEO title is too long").optional(),
  description: z.string().max(250, "SEO description is too long").optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional(),
  canonical: z.string().url().optional(),
  twitterCard: z.string().optional(),
  robots: z.string().optional(),
  jsonLd: z.string().optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  tagline: z.string().max(100, "Tagline cannot exceed 100 characters").optional(),
  series: z.string().max(150, "Series name cannot exceed 150 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceCents: z.number().int().positive("Price must be a positive integer in cents"),
  material: z.string().min(2, "Material description is required"),
  room: z.enum(["Living", "Office", "Dining", "Bedroom", "Studio"], {
    errorMap: () => ({ message: "Invalid showroom room category" }),
  }),
  type: z.enum(["Seating", "Tables", "Storage", "Bedroom", "Lighting", "Decor"], {
    errorMap: () => ({ message: "Invalid product type category" }),
  }),
  imageUrl: z.string().url("Valid thumbnail image URL is required"),
  images: z.array(z.string().url("Valid image URL is required")).optional().default([]),
  finishes: z.array(finishSchema).optional().default([]),
  upholstery: z.array(z.string().min(1)).optional().default([]),
  colorHexes: z.array(z.string().regex(/^#([A-Fa-f0-9]{6})$/)).optional().default([]),
  stock: z.number().int().nonnegative("Stock cannot be negative").optional().default(0),
  categoryId: z.string().cuid("Invalid category ID").optional(),
  mediaId: z.string().cuid("Invalid media ID").optional(),
  mediaIds: z.array(z.string().cuid("Invalid media ID")).optional().default([]),
  seo: seoSchema.optional().default({}),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  status: z.enum(STATUS_VALUES).optional(),
  reviewNote: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  signature: z.boolean().optional(),
});

export const PublishSchema = z.object({
  id: z.string().cuid("Invalid product ID"),
});

export const RejectSchema = z.object({
  id: z.string().cuid("Invalid product ID"),
  reviewNote: z.string().min(5, "Rejection review note must be at least 5 characters long"),
});

export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid("Invalid product ID")).min(1, "At least one product ID must be provided"),
});

export const BulkPublishSchema = z.object({
  ids: z.array(z.string().cuid("Invalid product ID")).min(1, "At least one product ID must be provided"),
});

export const BulkArchiveSchema = z.object({
  ids: z.array(z.string().cuid("Invalid product ID")).min(1, "At least one product ID must be provided"),
});

export const ProductQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  categoryId: z.string().cuid().optional(),
  room: z.string().optional(),
  type: z.string().optional(),
  sellerId: z.string().optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  inStock: z.boolean().optional(),
  
  // Pagination & Sorting parameters
  limit: z.number().int().min(1).max(100).optional().default(25),
  cursor: z.string().optional(),
  sortBy: z.enum(["createdAt", "priceCents", "reviewCount", "name", "stock"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
