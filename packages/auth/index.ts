import { User, UserRole } from "@jr/types";
import { Permission } from "@jr/validation/permissions";

/** Custom Authorization Error to throw when verification fails */
export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized action. Permission denied.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Numerical hierarchy mapping for system roles. Lower number = less privileged. */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  SELLER: 40,
  DESIGNER: 40,
  ACCOUNTANT: 40,
  SUPPORT: 20,
  CUSTOMER: 0,
};

/**
 * Check whether a user has a specific role.
 */
export function hasRole(user: User, allowedRoles: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Check whether a user has a specific granular permission.
 */
export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * Verify permissions and run business/ownership logic for an action.
 *
 * @param user The authenticated User object.
 * @param permission The granular permission to verify.
 * @param context Optional domain context (e.g. lead, product, quote) to verify ownership or business rules.
 */
export function can(user: User, permission: Permission, context?: any): boolean {
  // 1. Basic permission existence check
  if (!hasPermission(user, permission)) {
    return false;
  }

  // 2. Ownership / Business Rule checks
  // Rule: Sellers can only edit CRM notes/leads explicitly assigned to their user ID (UUID).
  if (permission === "CRM_EDIT" && user.role === "SELLER") {
    if (context && context.assignedToId && context.assignedToId !== user.id) {
      return false;
    }
  }

  return true;
}

/**
 * Negation of can() check.
 */
export function cannot(user: User, permission: Permission, context?: any): boolean {
  return !can(user, permission, context);
}

/**
 * Enforces that a user has one of the allowed roles.
 * Throws AuthorizationError if check fails.
 */
export function requireRole(user: User, allowedRoles: UserRole | UserRole[]): void {
  if (!hasRole(user, allowedRoles)) {
    throw new AuthorizationError(
      `Access denied. Required role not met. User role: ${user.role}`
    );
  }
}

/**
 * Enforces that a user has a specific permission.
 * Throws AuthorizationError if check fails.
 */
export function requirePermission(user: User, permission: Permission, context?: any): void {
  if (!can(user, permission, context)) {
    throw new AuthorizationError(
      `Access denied. Required permission '${permission}' not met.`
    );
  }
}
