import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

/**
 * JR Control Middleware
 *
 * Responsibility boundary:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  Edge Middleware (this file)                                │
 *  │  ✓ Session cookie refresh (keepalive via @supabase/ssr)    │
 *  │  ✓ Authentication gate — redirect to /login if no session  │
 *  │  ✗ Authorization / RBAC — NOT here (requires DB access)    │
 *  └─────────────────────────────────────────────────────────────┘
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  Server Components & Actions                                │
 *  │  ✓ Role validation — getCurrentUser() checks DB role       │
 *  │  ✓ Permission gating — requirePermission() checks matrix   │
 *  │  ✓ Audit logging — logSecurityEvent() on mutations         │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * The Edge runtime cannot run Prisma. Keep this file dependency-free.
 */
export async function middleware(request: NextRequest) {
  // Refresh the Supabase session cookie if it's close to expiry.
  // This is the session rotation mechanism — Supabase rotates refresh tokens
  // and invalidates old ones automatically when updateSession is called.
  const { response, user } = await updateSession(request);

  const path = request.nextUrl.pathname;

  const isPublicAuthRoute =
    path === "/login" ||
    path === "/forgot-password" ||
    path === "/reset-password";

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
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    if (path !== "/") {
      loginUrl.searchParams.set("next", path);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Root redirect
  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
