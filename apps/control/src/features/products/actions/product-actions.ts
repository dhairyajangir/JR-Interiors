"use server";

import { requireAuth } from "../../auth/utils";
import * as productService from "../services/product-service";
import { CreateProductSchema, UpdateProductSchema, PublishSchema, RejectSchema, BulkDeleteSchema, BulkPublishSchema, BulkArchiveSchema } from "../validators/product";
import { AuthorizationError } from "@jr/auth";
import { ZodError } from "zod";

export type ActionResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string; details?: any } };

/**
 * Global helper to handle and serialize service errors into the standard response envelope.
 */
function handleActionError(error: unknown): ActionResponse<any> {
  console.error("[Product Server Action Error]:", error);

  if (error instanceof AuthorizationError) {
    return {
      success: false,
      data: null,
      error: {
        code: "FORBIDDEN",
        message: error.message,
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      data: null,
      error: {
        code: "INVALID_PAYLOAD",
        message: "Validation failed for product input data.",
        details: error.flatten().fieldErrors,
      },
    };
  }

  const message = error instanceof Error ? error.message : "An unexpected database error occurred.";
  return {
    success: false,
    data: null,
    error: {
      code: message.includes("not found") ? "ENTITY_NOT_FOUND" : "INTERNAL_ERROR",
      message,
    },
  };
}

export async function createProductAction(input: unknown): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const product = await productService.createProductService(input, user);
    return { success: true, data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateProductAction(id: string, input: unknown): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const product = await productService.updateProductService(id, input, user);
    return { success: true, data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProductAction(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await productService.deleteProductService(id, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function publishProductAction(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const validated = PublishSchema.parse({ id });
    const product = await productService.publishProductService(validated.id, user);
    return { success: true, data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rejectProductAction(id: string, reviewNote: string): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const validated = RejectSchema.parse({ id, reviewNote });
    const product = await productService.rejectProductService(validated.id, validated.reviewNote, user);
    return { success: true, data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function archiveProductAction(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const product = await productService.archiveProductService(id, user);
    return { success: true, data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function duplicateProductAction(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const product = await productService.duplicateProductService(id, user);
    return { success: true, data: product, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkDeleteAction(ids: string[]): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const validated = BulkDeleteSchema.parse({ ids });
    const result = await productService.bulkDeleteService(validated.ids, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkPublishAction(ids: string[]): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const validated = BulkPublishSchema.parse({ ids });
    const result = await productService.bulkPublishService(validated.ids, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkArchiveAction(ids: string[]): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const validated = BulkArchiveSchema.parse({ ids });
    const result = await productService.bulkArchiveService(validated.ids, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
