import { useAuthContext } from "../providers/auth-provider";
import type { Permission } from "@jr/validation/permissions";

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
  return (user.permissions as Permission[]).includes(permission);
}
