"use server";

import { requireAuth } from "../../auth/utils";
import * as taxonomyService from "../services/taxonomy-service";
import { AuthorizationError } from "@jr/auth";
import { ZodError } from "zod";

// ── Standard response envelope (mirrors product-actions.ts pattern) ───────────

export type ActionResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string; details?: any } };

function handleActionError(error: unknown): ActionResponse<any> {
  console.error("[Taxonomy Server Action Error]:", error);

  if (error instanceof AuthorizationError) {
    return {
      success: false,
      data: null,
      error: { code: "FORBIDDEN", message: error.message },
    };
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      data: null,
      error: {
        code: "INVALID_PAYLOAD",
        message: "Validation failed for taxonomy input.",
        details: error.flatten().fieldErrors,
      },
    };
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  return {
    success: false,
    data: null,
    error: {
      code: message.includes("not found") ? "ENTITY_NOT_FOUND" : "INTERNAL_ERROR",
      message,
    },
  };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getTaxonomyAction(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const node = await taxonomyService.getTaxonomyById(id, user);
    return { success: true, data: node, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listTaxonomiesAction(
  filters: any,
  pagination: any
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.listTaxonomies(filters, pagination, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getTaxonomyTreeAction(
  kind?: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const tree = await taxonomyService.getTaxonomyTree(kind, user);
    return { success: true, data: tree, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getTaxonomyAncestorsAction(
  id: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const ancestors = await taxonomyService.getTaxonomyAncestors(id, user);
    return { success: true, data: ancestors, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createTaxonomyAction(
  input: unknown
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const node = await taxonomyService.createTaxonomyService(input, user);
    return { success: true, data: node, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateTaxonomyAction(
  id: string,
  input: unknown
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const node = await taxonomyService.updateTaxonomyService(id, input, user);
    return { success: true, data: node, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Publish / Archive ─────────────────────────────────────────────────────────

export async function publishTaxonomyAction(
  id: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const node = await taxonomyService.publishTaxonomyService(id, user);
    return { success: true, data: node, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function archiveTaxonomyAction(
  id: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const node = await taxonomyService.archiveTaxonomyService(id, user);
    return { success: true, data: node, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteTaxonomyAction(
  id: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.deleteTaxonomyService(id, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Move ──────────────────────────────────────────────────────────────────────

export async function moveTaxonomyAction(
  id: string,
  newParentId: string | null
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.moveTaxonomyService(id, newParentId, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Merge ─────────────────────────────────────────────────────────────────────

export async function mergeTaxonomyAction(
  sourceId: string,
  targetId: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.mergeTaxonomyService(
      sourceId,
      targetId,
      user
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Reorder ───────────────────────────────────────────────────────────────────

export async function reorderTaxonomyAction(
  orderedIds: string[],
  parentId: string | null
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.reorderTaxonomyService(
      orderedIds,
      parentId,
      user
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Count rebuild ─────────────────────────────────────────────────────────────

export async function recalculateCountsAction(
  id?: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.recalculateCountsService(id, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Product assignment ────────────────────────────────────────────────────────

export async function assignProductAction(
  productId: string,
  taxonomyId: string,
  primary = false
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.assignProductService(
      productId,
      taxonomyId,
      primary,
      user
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeProductAction(
  productId: string,
  taxonomyId: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.removeProductService(
      productId,
      taxonomyId,
      user
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProductTaxonomiesAction(
  productId: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.getProductTaxonomies(productId, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getTaxonomyProductsAction(
  taxonomyId: string,
  pagination: { cursor?: string; limit?: number }
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.getTaxonomyProducts(
      taxonomyId,
      pagination,
      user
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

// ── Bulk ──────────────────────────────────────────────────────────────────────

export async function bulkPublishTaxonomyAction(
  ids: string[]
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.bulkPublishService(ids, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkArchiveTaxonomyAction(
  ids: string[]
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.bulkArchiveService(ids, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkDeleteTaxonomyAction(
  ids: string[]
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.bulkDeleteService(ids, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkMoveTaxonomyAction(
  ids: string[],
  newParentId: string | null
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.bulkMoveService(ids, newParentId, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkChangeVisibilityAction(
  ids: string[],
  visibility: string
): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await taxonomyService.bulkChangeVisibilityService(
      ids,
      visibility,
      user
    );
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
