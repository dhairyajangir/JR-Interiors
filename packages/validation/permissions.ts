import { UserRole } from "@jr/types";

export type Permission =
  | "catalog:read"
  | "catalog:write"
  | "catalog:publish"
  | "crm:read"
  | "crm:write"
  | "orders:read"
  | "orders:write"
  | "orders:fulfill"
  | "logs:read"
  | "settings:read"
  | "settings:write";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "catalog:read",
    "catalog:write",
    "catalog:publish",
    "crm:read",
    "crm:write",
    "orders:read",
    "orders:write",
    "orders:fulfill",
    "logs:read",
    "settings:read",
    "settings:write",
  ],
  ADMIN: [
    "catalog:read",
    "catalog:write",
    "catalog:publish",
    "crm:read",
    "crm:write",
    "orders:read",
    "orders:write",
    "orders:fulfill",
    "logs:read",
    "settings:read",
  ],
  SELLER: [
    "catalog:read",
    "catalog:write",
    "orders:read",
    "orders:fulfill",
    "crm:read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}
