"use client";

import React from "react";
import type { Permission } from "@jr/validation/permissions";
import type { UserRole } from "@jr/types";
import { useCurrentUser, useHasPermission } from "../hooks";
import { can } from "@jr/auth";

interface PermissionGateProps {
  /** The permission required to render children. */
  permission: Permission;
  /** Optional business context object to check ownership rules. */
  context?: any;
  /** Optional fallback to render when permission is denied. Renders nothing by default. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGate
 *
 * Conditionally renders children based on the current user's permissions.
 * This is a UI-only guard — critical data mutations must ALWAYS be guarded
 * server-side via requirePermission() in Server Actions or Route Handlers.
 */
export function PermissionGate({ permission, context, fallback = null, children }: PermissionGateProps) {
  const user = useCurrentUser();
  const allowed = user ? can(user, permission, context) : false;

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Can
 *
 * Reusable alias component for PermissionGate.
 */
export const Can = PermissionGate;

interface CannotProps {
  permission: Permission;
  context?: any;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Cannot
 *
 * Conditionally renders children only if the user does NOT have the specified permission.
 */
export function Cannot({ permission, context, fallback = null, children }: CannotProps) {
  const user = useCurrentUser();
  const allowed = user ? can(user, permission, context) : false;

  if (allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  /** The roles permitted to render children. */
  allowedRoles: UserRole[];
  /** Optional fallback to render when user lacks the roles. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RoleGate
 *
 * Conditionally renders children based on the current user's role.
 */
export function RoleGate({ allowedRoles, fallback = null, children }: RoleGateProps) {
  const user = useCurrentUser();
  const allowed = user ? allowedRoles.includes(user.role) : false;

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
