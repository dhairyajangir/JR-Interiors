import "server-only";

import { prisma } from "@/lib/db";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "DEMO_LOGIN"
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"
  | "ORDER_STATUS_UPDATE"
  | "SELLER_VERIFY"
  | "CONSULTATION_UPDATE"
  | "SETTINGS_UPDATE"
  | "PAYMENT_REPORT";

export async function logAudit(
  userId: string,
  action: AuditAction,
  details?: {
    entity?: string;
    entityId?: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: details?.entity ?? null,
        entityId: details?.entityId ?? null,
        details: details?.description ?? null,
        ipAddress: details?.ipAddress ?? null,
        userAgent: details?.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.error("[AuditLog] Failed to write:", error);
  }
}

export async function getAuditLogs(options?: {
  userId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};
  if (options?.userId) where.userId = options.userId;
  if (options?.action) where.action = options.action;

  return prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: { fullName: true, email: true, businessName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
}

export async function getAuditLogCount(options?: {
  userId?: string;
  action?: string;
}) {
  const where: Record<string, unknown> = {};
  if (options?.userId) where.userId = options.userId;
  if (options?.action) where.action = options.action;

  return prisma.auditLog.count({ where });
}
