// Shared option vocab for product forms + filters.
export const PRODUCT_TYPES = ["Seating", "Tables", "Storage", "Bedroom", "Lighting", "Decor"] as const;
export const PRODUCT_ROOMS = ["Living", "Office", "Dining", "Bedroom", "Studio"] as const;
export const PRODUCT_MATERIALS = [
  "Solid Walnut",
  "Oak Veneer",
  "Brushed Brass",
  "Italian Leather",
  "Stone",
  "Wool",
  "Ceramic",
  "Velvet",
  "Glass",
  "Other",
] as const;

/** URL-safe slug from a product name. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
