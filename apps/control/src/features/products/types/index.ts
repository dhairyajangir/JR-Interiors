import type { UserRole } from "@jr/types";
import { ProductStatus } from "@jr/domain";

export type { ProductStatus };

export interface Finish {
  name: string;
  hex: string;
}

export interface ProductFilters {
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  room?: string;
  type?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export type ProductSortField = "createdAt" | "priceCents" | "reviewCount" | "name" | "stock";
export type SortOrder = "asc" | "desc";

export interface ProductSortOptions {
  field?: ProductSortField;
  order?: SortOrder;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  twitterCard?: string;
  robots?: string;
  jsonLd?: string;
}

export interface ProductInventory {
  stock: number;
  inStock: boolean;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  tagline?: string;
  series?: string;
  description: string;
  priceCents: number;
  material: string;
  room: string;
  type: string;
  imageUrl: string;
  images?: string[];
  finishes?: Finish[];
  upholstery?: string[];
  colorHexes?: string[];
  stock?: number;
  categoryId?: string;
  mediaId?: string;
  mediaIds?: string[];
  seo?: ProductSEO;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface CursorConnection<T> {
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}
