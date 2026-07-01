import * as mediaRepository from "../repository/media-repository";
import type { User } from "@jr/types";
import { can, AuthorizationError } from "@jr/auth";
import * as crypto from "crypto";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadMediaAssetService(
  fileData: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    base64Data: string; // Base64 representation of the file
  },
  currentUser: User
) {
  // 1. Authorize: Require CATALOG_WRITE permission
  if (!can(currentUser, "CATALOG_WRITE")) {
    throw new AuthorizationError("You do not have permission to upload digital assets.");
  }

  // 2. Validate MimeType and Size
  if (!ALLOWED_MIME_TYPES.includes(fileData.mimeType)) {
    throw new Error(`MimeType "${fileData.mimeType}" is not allowed. Supported formats: JPEG, PNG, WebP, GIF.`);
  }

  if (fileData.sizeBytes > MAX_PHOTO_SIZE) {
    throw new Error(`File size exceeds 2 MB limit (current size: ${(fileData.sizeBytes / 1024 / 1024).toFixed(2)} MB).`);
  }

  // 3. Compute SHA-256 Hash for Deduplication
  const fileBuffer = Buffer.from(fileData.base64Data, "base64");
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // 4. Check for existing asset (Deduplication)
  const existingAsset = await mediaRepository.findByHash(hash);
  if (existingAsset) {
    console.log(`[Media Service] Deduplication match found for hash: ${hash}`);
    return existingAsset;
  }

  // 5. In a real application, we would upload to S3 / Cloudinary here.
  // For the prototype workspace, we simulate CDN storage by generating a local path or using an external mock URL.
  // We'll write to a mock CDN URL or database relative path.
  const cleanFilename = fileData.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const mockUrl = `/cdn-root/catalog/products/${Date.now()}_${cleanFilename}`;

  // 6. Save asset record to Database
  return mediaRepository.createMediaAsset({
    url: mockUrl,
    filename: fileData.filename,
    mimeType: fileData.mimeType,
    sizeBytes: fileData.sizeBytes,
    hash,
  });
}

export async function listMediaAssetsService(
  filters: { search?: string },
  currentUser: User
) {
  if (!can(currentUser, "INVENTORY_READ")) {
    throw new AuthorizationError("You do not have permission to view media assets.");
  }
  return mediaRepository.findManyMediaAssets(filters);
}

export async function deleteMediaAssetService(
  id: string,
  currentUser: User
) {
  if (!can(currentUser, "CATALOG_WRITE")) {
    throw new AuthorizationError("You do not have permission to delete media assets.");
  }
  return mediaRepository.deleteMediaAsset(id);
}
