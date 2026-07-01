"use client";

import React from "react";
import type { Permission } from "@jr/validation/permissions";
import { useHasPermission } from "../hooks";

interface PermissionGateProps {
  /** The permission required to render children. */
  permission: Permission;
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
 *
 * @example
 * <PermissionGate permission="catalog:publish">
 *   <PublishButton />
 * </PermissionGate>
 */
export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const allowed = useHasPermission(permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
