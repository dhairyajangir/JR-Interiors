/**
 * Taxonomy Feature — Public Barrel
 *
 * Import taxonomy types, constants, actions, and components from this barrel
 * rather than reaching into feature internals.
 */

// Types
export type {
  TaxKind,
  TaxStatus,
  TaxVisibility,
  TaxonomyNode,
  TaxonomyTreeNode,
  TaxonomyWithParent,
  TaxonomyFilters,
  TaxonomySortField,
  SortOrder,
  TaxonomyFormInput,
  UpdateTaxonomyInput,
  MoveTaxonomyInput,
  MergeTaxonomyInput,
  ReorderInput,
  BulkTaxonomyInput,
  ProductTaxonomyAssignment,
  CursorConnection,
  PageInfo,
} from "./types";

// Constants
export {
  TAX_KIND_LABELS,
  TAX_KIND_COLORS,
  TAX_KIND_DESCRIPTIONS,
  TAX_STATUS_LABELS,
  TAX_STATUS_COLORS,
  TAX_STATUS_TRANSITIONS,
  TAX_VISIBILITY_LABELS,
  TAX_VISIBILITY_COLORS,
  TAX_VISIBILITY_DESCRIPTIONS,
  TAXONOMY_AUDIT_ACTIONS,
  TAXONOMY_LIMITS,
} from "./constants";

// Validators
export {
  CreateTaxonomySchema,
  UpdateTaxonomySchema,
  MoveTaxonomySchema,
  MergeTaxonomySchema,
  ReorderTaxonomySchema,
  BulkTaxonomySchema,
  AssignProductSchema,
  RemoveProductSchema,
  TaxonomyQuerySchema,
} from "./validators/taxonomy";

// Server Actions (re-exported for use in other features)
export {
  getTaxonomyAction,
  listTaxonomiesAction,
  getTaxonomyTreeAction,
  createTaxonomyAction,
  updateTaxonomyAction,
  publishTaxonomyAction,
  archiveTaxonomyAction,
  deleteTaxonomyAction,
  moveTaxonomyAction,
  mergeTaxonomyAction,
  reorderTaxonomyAction,
  assignProductAction,
  removeProductAction,
  getProductTaxonomiesAction,
} from "./actions/taxonomy-actions";

// UI Components
export { TaxonomyTable } from "./components/taxonomy-table";
export { TaxonomyTree } from "./components/taxonomy-tree";
export { ProductAssignmentPanel } from "./components/product-assignment-panel";
export { ParentPicker } from "./components/parent-picker";
export { SlugField, generateSlug } from "./components/slug-field";
