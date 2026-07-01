# Security Architecture & Vulnerability Policy - JR Interiors

This document outlines the security architecture implemented in the codebase to protect user data, secure authentication, and prevent bot exploitation.

---

## 1. Core Security Mitigations

### A. Session Security
- **HMAC Signatures**: Custom cookie session tokens (`jr_session`) are constructed using SHA-256 HMAC signatures with `AUTH_SECRET`. This prevents cookie tampering and hijacking.
- **Cookie Security Flags**: Session cookies are configured with `httpOnly: true`, `sameSite: "lax"`, and `secure: true` (in production) to protect against XSS token harvesting and CSRF vectors.
- **Session Rotation**: The server rotates session timestamps every 15 minutes of activity to limit replay-attack validity.

### B. Bot & Spam Protections
- **Honeypot Fields**: Form fields (such as `website_honey` in `Honeypot.tsx`) are hidden from humans but exposed to bots. Submissions containing honeypot values are silently ignored.
- **Upstash Redis Rate Limiting**: Enforces IP-based rate limiting on sensitive actions (like newsletter signups and consultation booking) to prevent resource exhaustion.
- **Cloudflare Turnstile**: Standard integration for token verification is supported on endpoints to block automated bot submissions.

### C. Injection & Data Integrity
- **Zod Schema Validation**: All input boundaries (registration, login, consultation requests, checkout shipping, addresses) are validated via strict Zod schemas in `validation.ts`.
- **Unicode Normalization**: Form text parameters undergo NFC Unicode normalization to block multi-byte script bypass vectors.
- **Prisma SQL Injection Shield**: Raw query parameters are formatted using SQL parameters or processed via Prisma's query builder to eliminate standard SQL injection vectors.

---

## 2. HTTP Security Headers & Content Security Policy (CSP)
Next.js security headers are configured inside `next.config.mjs`:
- **Content-Security-Policy (CSP)**: Standard headers restricting script, style, image, connection, and frame loading to approved domains (such as Vercel, Supabase, Razorpay, Google Fonts). Inline script evaluation is blocked in production.
- **Strict-Transport-Security (HSTS)**: Enforced with a 2-year duration, including subdomains and preloading.
- **X-Frame-Options: DENY**: Eliminates clickjacking risks.
- **X-Content-Type-Options: nosniff**: Blocks mime-type sniffing attacks.
- **Referrer-Policy: strict-origin-when-cross-origin**: Protects query string metadata from leaking to external domains.

---

## 3. Vulnerability Reporting
If you discover a security vulnerability, please refer to our security policy contact:
- **Email**: adityajangid1409@gmail.com
- **Preferred Languages**: English, Hindi
- **Policy**: Do not disclose vulnerabilities publicly prior to coordination. We target patching critical bugs within 72 hours of disclosure.
