export function securityHeaders(nonce?: string): Record<string, string> {
  const isProduction = process.env.NODE_ENV === "production";
  
  const cspHeader = nonce
    ? `default-src 'self'; img-src 'self' https: data:; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProduction ? "" : " 'unsafe-eval'"}; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`
    : `default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`;

  return {
    "Content-Security-Policy": cspHeader,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}
