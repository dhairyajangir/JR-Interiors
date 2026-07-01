export const PRODUCT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

export const ROOM_CATEGORIES = [
  "Living",
  "Office",
  "Dining",
  "Bedroom",
  "Studio",
] as const;

export type RoomCategory = typeof ROOM_CATEGORIES[number];

export const PRODUCT_TYPES = [
  "Seating",
  "Tables",
  "Storage",
  "Bedroom",
  "Lighting",
  "Decor",
] as const;

export type ProductType = typeof PRODUCT_TYPES[number];

export const CATEGORY_KINDS = {
  ROOM: "room",
  COLLECTION: "collection",
  TYPE: "type",
} as const;

export type CategoryKind = typeof CATEGORY_KINDS[keyof typeof CATEGORY_KINDS];
