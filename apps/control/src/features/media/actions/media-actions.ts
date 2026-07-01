"use server";

import { requireAuth } from "../../auth/utils";
import * as mediaService from "../services/media-service";
import { AuthorizationError } from "@jr/auth";

export type ActionResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } };

function handleActionError(error: unknown): ActionResponse<any> {
  console.error("[Media Action Error]:", error);
  if (error instanceof AuthorizationError) {
    return {
      success: false,
      data: null,
      error: { code: "FORBIDDEN", message: error.message },
    };
  }
  const message = error instanceof Error ? error.message : "An unexpected media operation error occurred.";
  return {
    success: false,
    data: null,
    error: { code: "INTERNAL_ERROR", message },
  };
}

export async function uploadMediaAssetAction(fileData: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  base64Data: string;
}): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const asset = await mediaService.uploadMediaAssetService(fileData, user);
    return { success: true, data: asset, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listMediaAssetsAction(filters: { search?: string } = {}): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const assets = await mediaService.listMediaAssetsService(filters, user);
    return { success: true, data: assets, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteMediaAssetAction(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await requireAuth();
    const result = await mediaService.deleteMediaAssetService(id, user);
    return { success: true, data: result, error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
