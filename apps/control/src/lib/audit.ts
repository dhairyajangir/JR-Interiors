import { headers } from "next/headers";
import { prisma } from "@jr/database";
import * as crypto from "crypto";

export interface RichAuditDetails extends Record<string, any> {
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  changedFields?: string[];
  reason?: string | null;
  requestId?: string;
  sessionId?: string;
  correlationId?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
}

export interface AuditLogOptions {
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  details?: RichAuditDetails;
}

/**
 * Writes an administrative audit log entry tracking state changes on entities.
 * Can execute within a Prisma transaction if `tx` is provided.
 */
export async function logAuditAction(
  options: AuditLogOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx?: any
): Promise<void> {
  const client = tx || prisma;
  let userAgent = "unknown";
  let ip = "unknown";
  let requestId: string = crypto.randomUUID();
  let correlationId: string = crypto.randomUUID();
  let sessionId = "unknown";

  try {
    const headersList = await headers();
    userAgent = headersList.get("user-agent") ?? "unknown";
    ip =
      headersList.get("cf-connecting-ip") ??
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    // Attempt to extract request tracing headers
    requestId = headersList.get("x-request-id") ?? headersList.get("x-amz-request-id") ?? requestId;
    correlationId = headersList.get("x-correlation-id") ?? correlationId;
    sessionId = headersList.get("x-session-id") ?? sessionId;
  } catch (headersErr) {
    // Standalone scripts or background runs will not have headers context
  }

  // Construct the rich context payload
  const richDetails: Record<string, any> = {
    timestamp: new Date().toISOString(),
    requestId,
    correlationId,
    sessionId,
    ip,
    userAgent,
    ...(options.details || {}),
  };

  try {
    await client.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        details: JSON.stringify(richDetails),
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (err) {
    // Fail-safe: audit log errors should never crash primary operations
    console.error("[logAuditAction] failed to create audit log entry:", err);
  }
}

/**
 * Utility to compute the diff between two objects for audit log details.
 * Returns null if no changes are found.
 */
export function computeObjectDiff(
  oldObj: Record<string, any>,
  newObj: Record<string, any>
): { before: Record<string, any>; after: Record<string, any>; changedFields: string[] } | null {
  const before: Record<string, any> = {};
  const after: Record<string, any> = {};
  const changedFields: string[] = [];
  let hasChanges = false;

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    // Skip internal fields that don't represent client data changes
    if (key === "updatedAt" || key === "createdAt" || key === "id") continue;

    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Handle deep comparison for arrays/JSON if needed
    if (typeof oldVal === "object" && typeof newVal === "object") {
      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);
      if (oldStr !== newStr) {
        before[key] = oldVal;
        after[key] = newVal;
        changedFields.push(key);
        hasChanges = true;
      }
    } else if (oldVal !== newVal) {
      before[key] = oldVal;
      after[key] = newVal;
      changedFields.push(key);
      hasChanges = true;
    }
  }

  return hasChanges ? { before, after, changedFields } : null;
}
