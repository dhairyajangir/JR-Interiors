# Production Deployment Guide - JR Interiors

This document outlines the requirements and step-by-step procedures for deploying the JR Interiors web application to production.

---

## 1. Hosting & Infrastructure
- **Platform**: Vercel (recommended for Next.js standalone and optimal performance)
- **Database**: Supabase PostgreSQL (managed database instance)
- **Rate Limiting / Key-Value**: Upstash Redis (serverless Redis)
- **DNS / CDN**: Cloudflare (for DNS, SSL, and Turnstile bot protection)

---

## 2. Environment Variables Checklist
Configure the following environment variables in your hosting environment (e.g. Vercel dashboard):

```bash
# ---- Database (Supabase PostgreSQL) ----
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[db_name]?schema=public&sslmode=require"

# ---- Authentication & Cookie Protection ----
# Generate via: openssl rand -base64 32
AUTH_SECRET="your-32-character-or-longer-random-secret"

# ---- Public Site URL (Used for Sitemap & SEO) ----
NEXT_PUBLIC_SITE_URL="https://jrinteriors.in"

# ---- Admin & Moderation Queue ----
ADMIN_EMAIL="demo@jrinteriors.in"
ADMIN_SECRET_KEY="your-secure-admin-shared-secret"

# ---- Upstash Redis (Rate Limiting) ----
UPSTASH_REDIS_REST_URL="https://[endpoint].upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# ---- Cloudflare Turnstile (Spam Protection) ----
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-cloudflare-turnstile-site-key"
TURNSTILE_SECRET_KEY="your-cloudflare-turnstile-secret-key"

# ---- Razorpay Payment Gateway (Optional) ----
RAZORPAY_KEY_ID="rzp_live_[your-live-key-id]"
RAZORPAY_KEY_SECRET="your-live-key-secret"
```

---

## 3. Pre-Deployment Verification Checklist
Before running the deployment, execute these verification commands locally:

1. **Verify Prisma Schema**:
   Ensure client builds match database models:
   ```bash
   npx prisma generate
   ```
2. **Build standalone package**:
   ```bash
   npm run build
   ```

---

## 4. Vercel Deployment Steps
1. Push your audited branch to the repository.
2. Link the repository to your Vercel team/account.
3. Inject the production environment variables (under Project Settings > Environment Variables).
4. Run the production build. Standalone output is automatically bundled.

---

## 5. DNS & Domain Configuration
To point `jrinteriors.in` to Vercel via Cloudflare:
1. In Cloudflare DNS settings, add a CNAME record:
   - Name: `@` (root)
   - Target: `cname.vercel-dns.com`
   - Proxy status: DNS Only (or Proxied if utilizing custom Cloudflare Page Rules)
2. Add a CNAME record for WWW:
   - Name: `www`
   - Target: `cname.vercel-dns.com`
