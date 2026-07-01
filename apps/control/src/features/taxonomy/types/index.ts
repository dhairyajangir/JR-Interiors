/**
 * Taxonomy Feature — Type Definitions
 *
 * Mirrors Prisma enums + adds UI-friendly computed types.
 * All business logic remains in the service layer.
 */

// ── Enum mirrors (Prisma-aligned) ─────────────────────────────────────────────

export type TaxKind =
  | "CATEGORY"
  | "COLLECTION"
  | "ROOM"
  | "MATERIAL"
  | "STYLE"
  | "FINISH";

export type TaxStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type TaxVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

// ── Core flat node ─────────────────────────────────────────────────────────────

export interface TaxonomyNode {
  id: string;
  kind: TaxKind;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  bannerImage: string | null;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
  status: TaxStatus;
  visibility: TaxVisibility;
  publishedAt: Date | null;
  slugLocked: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
  seoKeywords: string[];
  productCount: number;
  childCount: number;
  createdById: string | null;
  updatedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Tree node (recursive) ──────────────────────────────────────────────────────

export interface TaxonomyTreeNode extends TaxonomyNode {
  children: TaxonomyTreeNode[];
  depth: number;           // 0 = root
  breadcrumb: string[];    // ancestor names for display
}

// ── Flat node with parent summary (for grids) ──────────────────────────────────

export interface TaxonomyWithParent extends TaxonomyNode {
  parent: Pick<TaxonomyNode, "id" | "name" | "slug"> | null;
}

// ── Filters ────────────────────────────────────────────────────────────────────

export interface TaxonomyFilters {
  search?: string;
  kind?: TaxKind;
  status?: TaxStatus;
  visibility?: TaxVisibility;
  parentId?: string | null;   // null = top-level only
  hasParent?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

// ── Sort ───────────────────────────────────────────────────────────────────────

export type TaxonomySortField =
  | "name"
  | "sortOrder"
  | "productCount"
  | "childCount"
  | "createdAt"
  | "updatedAt";

export type SortOrder = "asc" | "desc";

export interface TaxonomySortOptions {
  field?: TaxonomySortField;
  order?: SortOrder;
}

// ── Form inputs ────────────────────────────────────────────────────────────────

export interface TaxonomyFormInput {
  name: string;
  slug: string;
  kind: TaxKind;
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
  visibility?: TaxVisibility;
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string[];
}

export interface UpdateTaxonomyInput extends Partial<TaxonomyFormInput> {
  status?: TaxStatus;
}

// ── Operations ────────────────────────────────────────────────────────────────

export interface MoveTaxonomyInput {
  id: string;
  newParentId: string | null;
}

export interface MergeTaxonomyInput {
  sourceId: string;
  targetId: string;
}

export interface ReorderInput {
  parentId: string | null;
  orderedIds: string[]; // IDs in desired sort order
}

export interface BulkTaxonomyInput {
  ids: string[];
}

export interface BulkMoveInput {
  ids: string[];
  newParentId: string | null;
}

export interface BulkVisibilityInput {
  ids: string[];
  visibility: TaxVisibility;
}

// ── Product assignment ────────────────────────────────────────────────────────

export interface ProductTaxonomyAssignment {
  productId: string;
  taxonomyId: string;
  primary: boolean;
}

// ── Pagination (reused from product pattern) ─────────────────────────────────

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface CursorConnection<T> {
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}
