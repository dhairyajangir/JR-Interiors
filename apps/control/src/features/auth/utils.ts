import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerClientInstance } from "../../lib/supabase/server";
import { prisma } from "@jr/database";
import type { User, UserRole } from "@jr/types";
import { Permission, ROLE_PERMISSIONS } from "@jr/validation/permissions";
import { can as authCan, hasPermission as authHasPermission } from "@jr/auth";

/** Allowed roles for JR Control. Any other role is rejected. */
const CONTROL_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SELLER", "DESIGNER", "ACCOUNTANT", "SUPPORT"];

/**
 * Canonical user lookup by Supabase UUID.
 *
 * All lookups are resolved via the UUID.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerClientInstance();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) return null;

    // Look up by Supabase UUID
    const userRecord = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: { seller: true },
    });

    if (!userRecord) return null;

    const role = userRecord.role as UserRole;

    // Reject any role not permitted in JR Control
    if (!CONTROL_ROLES.includes(role)) return null;

    const permissions = ROLE_PERMISSIONS[role] ?? [];

    return {
      id: userRecord.id,
      email: userRecord.email,
      supabaseId: userRecord.supabaseId,
      fullName: userRecord.fullName,
      phone: userRecord.phone,
      role,
      isAdmin: role === "ADMIN" || role === "SUPER_ADMIN",
      sellerId: userRecord.seller?.id ?? null,
      brandName: userRecord.seller?.brandName ?? null,
      permissions,
    };
  } catch (error) {
    console.error("[getCurrentUser] error:", error);
    return null;
  }
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 */
export async function requireAuth(redirectTo: string = "/login"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * Check whether a user has a specific granular permission.
 */
export function hasPermission(user: User, permission: Permission): boolean {
  return authHasPermission(user, permission);
}

/**
 * Server-side guard. Throws/redirects if the authenticated user lacks
 * the required permission.
 */
export async function requirePermission(
  permission: Permission,
  context?: any,
  redirectTo: string = "/403"
): Promise<User> {
  const user = await requireAuth();
  if (!authCan(user, permission, context)) {
    redirect(redirectTo);
  }
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Security event logging
// ─────────────────────────────────────────────────────────────────────────────

export type SecurityEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "LOGOUT"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "NEW_DEVICE_LOGIN";

/**
 * Writes a structured security event to the AuditLog table.
 */
export async function logSecurityEvent(
  event: SecurityEvent,
  userId: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") ?? "unknown";
    const ip =
      headersList.get("cf-connecting-ip") ??
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    // Strip ip/userAgent from details (stored in dedicated columns)
    const { ip: _ip, userAgent: _ua, ...rest } = details;

    await prisma.auditLog.create({
      data: {
        userId: userId ?? undefined, // undefined = no relation, null-safe
        action: event,
        ipAddress: ip,
        userAgent,
        details: Object.keys(rest).length > 0 ? JSON.stringify(rest) : undefined,
      },
    });
  } catch (err) {
    // Never allow audit logging to crash the auth flow
    console.error("[logSecurityEvent] failed to write audit log:", err);
  }
}
