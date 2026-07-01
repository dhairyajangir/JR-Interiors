"use client";

import React, { createContext, useContext, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClientInstance } from "../../../lib/supabase/browser";
import type { User } from "../types";
import { logoutAction } from "../actions";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider
 *
 * The server is the single source of truth for authentication. This provider:
 *  - Accepts the already-resolved `initialUser` from the Server Component root layout.
 *  - Syncs with Supabase auth state changes on the client (SIGNED_OUT, TOKEN_REFRESHED)
 *    by triggering a server re-render via router.refresh(), not via a client API fetch.
 *  - Does NOT own a separate session object — the browser cookie managed by @supabase/ssr
 *    is the session. Server Components read it on every render.
 *  - Does NOT use Zustand. React state is sufficient here because the server is canonical.
 */
export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Listen for auth state changes on the client (e.g. tab re-focus, token refresh).
  // We do NOT fetch from /api/auth/me. Instead we refresh the RSC tree which re-runs
  // getCurrentUser() on the server and passes the fresh initialUser down.
  React.useEffect(() => {
    const supabase = createBrowserClientInstance();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        startTransition(() => {
          router.refresh();
          router.push("/login");
        });
      } else if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        // Let the server re-hydrate the user profile on the next render
        startTransition(() => {
          router.refresh();
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local state in sync when the server passes a new initialUser
  React.useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutAction();
      setUser(null);
      startTransition(() => {
        router.refresh();
        router.push("/login");
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logout failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
