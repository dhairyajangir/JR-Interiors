import { randomUUID } from "node:crypto";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type UploadResult = { success: boolean; filename?: string; error?: string };

export async function validateAndNormalizeUpload(
  fileBuffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<UploadResult> {
  // 1. Size check
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return { success: false, error: "File exceeds 5MB size limit." };
  }

  // 2. Extension check
  const ext = originalFilename.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { success: false, error: "Extension not allowed. Whitelisted: webp, png, jpg, jpeg." };
  }

  // 3. Magic bytes validation
  const hex = fileBuffer.slice(0, 4).toString("hex").toUpperCase();
  let validatedMime = "";
  if (hex === "89504E47") {
    validatedMime = "image/png";
  } else if (hex.startsWith("FFD8FF")) {
    validatedMime = "image/jpeg";
  } else if (
    fileBuffer.slice(0, 4).toString("utf8") === "RIFF" &&
    fileBuffer.slice(8, 12).toString("utf8") === "WEBP"
  ) {
    validatedMime = "image/webp";
  }

  if (!validatedMime || !ALLOWED_MIMES.includes(validatedMime)) {
    return { success: false, error: "Invalid file signature (magic bytes)." };
  }

  // 4. Generate random filename to prevent overwrites / directory traversal
  const safeFilename = `${randomUUID()}.${ext}`;

  return { success: true, filename: safeFilename };
}
