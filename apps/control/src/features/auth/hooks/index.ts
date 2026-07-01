import { useAuthContext } from "../providers/auth-provider";
import type { Permission } from "@jr/validation/permissions";
import { can } from "@jr/auth";

export function useAuth() {
  const { logout, isLoading, error } = useAuthContext();
  return { logout, isLoading, error };
}

export function useCurrentUser() {
  const { user } = useAuthContext();
  return user;
}

/** Returns true if the current user has the given permission. */
export function useHasPermission(permission: Permission): boolean {
  const { user } = useAuthContext();
  if (!user) return false;
  return user.permissions.includes(permission);
}

/** Returns true if the current user can perform the action under the given context. */
export function useCan(permission: Permission, context?: any): boolean {
  const { user } = useAuthContext();
  if (!user) return false;
  return can(user, permission, context);
}
