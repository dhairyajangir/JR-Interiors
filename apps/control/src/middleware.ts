import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { createAdminClientInstance } from "./lib/supabase/admin";
import { ROLE_PERMISSIONS, type Permission } from "@jr/validation/permissions";
import type { UserRole } from "@jr/types";

/** Allowed roles for JR Control. Any other role is rejected. */
const CONTROL_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SELLER", "DESIGNER", "ACCOUNTANT", "SUPPORT"];

/** Route path prefixes mapped to their required granular permissions. */
const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/settings": "SETTINGS_EDIT",
  "/financials": "FINANCIAL_VIEW",
  "/audit-logs": "AUDIT_LOGS_VIEW",
  "/catalog": "INVENTORY_READ",
  "/crm": "CRM_EDIT",
};

/**
 * JR Control Middleware
 *
 * Responsibility boundary:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  Edge Middleware (this file)                                │
 *  │  ✓ Session cookie refresh (keepalive via @supabase/ssr)    │
 *  │  ✓ Authentication gate — redirect to /login if no session  │
 *  │  ✓ Authorization / RBAC — lightweight DB check via Admin API│
 *  └─────────────────────────────────────────────────────────────┘
 */
export async function middleware(request: NextRequest) {
  // Refresh the Supabase session cookie if it's close to expiry
  const { response, user } = await updateSession(request);

  const path = request.nextUrl.pathname;

  const isPublicAuthRoute =
    path === "/login" ||
    path === "/forgot-password" ||
    path === "/reset-password";

  const isForbiddenPage = path === "/403";
  const hasSession = !!user;

  // ── Auth route logic ─────────────────────────────────────────────────────
  if (isPublicAuthRoute) {
    // Authenticated users have no business on auth pages — redirect to app
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // ── Protected route gate ─────────────────────────────────────────────────
  if (!hasSession) {
    if (isForbiddenPage) return response; // allow anonymous 403 viewing if redirection clears session
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    if (path !== "/" && !isForbiddenPage) {
      loginUrl.searchParams.set("next", path);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Allow 403 page without further role/permission validation
  if (isForbiddenPage) {
    return response;
  }

  // Root redirect
  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── RBAC / Authorization check ──────────────────────────────────────────
  try {
    const adminSupabase = createAdminClientInstance();
    const { data: userProfile, error } = await adminSupabase
      .from("User")
      .select("role")
      .eq("supabaseId", user.id)
      .single();

    if (error || !userProfile) {
      console.warn(`[Middleware RBAC] User ${user.id} has no matching profile record.`);
      // Sign out and redirect to login
      const redirectResponse = NextResponse.redirect(new URL("/login?error=no-profile", request.url));
      // Clear Supabase session cookies
      redirectResponse.cookies.delete("sb-access-token");
      redirectResponse.cookies.delete("sb-refresh-token");
      return redirectResponse;
    }

    const role = userProfile.role as UserRole;

    // Check if role is allowed in JR Control
    if (!CONTROL_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/403", request.url));
    }

    // Check route prefix permissions
    const matchedPrefix = Object.keys(ROUTE_PERMISSIONS).find((prefix) =>
      path.startsWith(prefix)
    );

    if (matchedPrefix) {
      const requiredPermission = ROUTE_PERMISSIONS[matchedPrefix];
      const permissions = ROLE_PERMISSIONS[role] ?? [];

      if (!permissions.includes(requiredPermission)) {
        console.warn(`[Middleware RBAC] User role ${role} denied access to ${path} (requires ${requiredPermission})`);
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }
  } catch (err) {
    console.error("[Middleware RBAC] Unexpected error:", err);
    // On unexpected database query failure, fail closed for security
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - Any image/font file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
