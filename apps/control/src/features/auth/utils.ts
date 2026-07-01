import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerClientInstance } from "../../lib/supabase/server";
import { prisma } from "@jr/database";
import type { User } from "./types";
import { ROLE_PERMISSIONS, type Permission } from "@jr/validation/permissions";
import type { UserRole } from "@jr/types";

/** Allowed roles for JR Control. Any other role is rejected. */
const CONTROL_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SELLER"];

/**
 * Canonical user lookup by Supabase UUID.
 *
 * On the very first login for a user, their `supabaseId` may not yet be
 * set in the Prisma database (accounts created before this field existed).
 * In that case we fall back to an email lookup and backfill `supabaseId`.
 * All subsequent calls go through the UUID-only path.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerClientInstance();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) return null;

    // ── Primary path: look up by Supabase UUID ──────────────────────────────
    let userRecord = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: { seller: true },
    });

    // ── Backfill path: first login for an existing email-only account ────────
    if (!userRecord && supabaseUser.email) {
      const emailRecord = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
        include: { seller: true },
      });

      if (emailRecord && !emailRecord.supabaseId) {
        userRecord = await prisma.user.update({
          where: { id: emailRecord.id },
          data: { supabaseId: supabaseUser.id },
          include: { seller: true },
        });
      }
    }

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
  return (user.permissions as Permission[]).includes(permission);
}

/**
 * Server-side guard. Throws/redirects if the authenticated user lacks
 * the required permission.
 */
export async function requirePermission(
  permission: Permission,
  redirectTo: string = "/dashboard"
): Promise<User> {
  const user = await requireAuth();
  if (!hasPermission(user, permission)) {
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
 *
 * `userId` may be null for pre-authentication failures (e.g. LOGIN_FAILED
 * where the user record doesn't exist).
 *
 * Device metadata is extracted from the request `User-Agent` and forwarded
 * `X-Forwarded-For` / `CF-Connecting-IP` headers for future device models.
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
