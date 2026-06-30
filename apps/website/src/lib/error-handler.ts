import { randomUUID } from "node:crypto";

export type SanitizedError = {
  message: string;
  correlationId: string;
};

export function handleUnexpectedError(error: unknown): SanitizedError {
  const correlationId = `ERR-${randomUUID().slice(0, 8).toUpperCase()}`;

  // Log real details internally for system admin inspection
  console.error(`[${correlationId}] Unexpected error details:`, error);

  return {
    message: "An unexpected internal error occurred. Please try again or contact support.",
    correlationId,
  };
}
