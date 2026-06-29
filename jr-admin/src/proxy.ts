import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookieName, validateEdgeToken } from "@/lib/edge-session";
import { securityHeaders } from "@/lib/security-headers";

const protectedPrefixes = ["/dashboard", "/onboarding"];

function isProtected(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64");
  const response = isProtected(request.nextUrl.pathname)
    ? await protectRequest(request)
    : NextResponse.next();

  const headers = securityHeaders(nonce);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  // Expose nonce for hydration/rendering script support
  response.headers.set("x-nonce", nonce);

  return response;
}

async function protectRequest(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(getSessionCookieName())?.value;
  if (!token || !(await validateEdgeToken(token))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
