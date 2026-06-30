# JR Interiors - Digital Atelier

This repository contains the Next.js application for **JR Interiors**, a premium luxury interior design studio and custom furniture workshop based in Jaipur, Rajasthan, India.

The application has been audited, secured, and prepared for production deployment in India.

---

## 1. Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Database ORM**: Prisma Client
- **Database Hosting**: Supabase PostgreSQL
- **Key-Value Store**: Upstash Redis (Sliding-window IP rate limiting)
- **Styling**: Tailwind CSS & shadcn/ui (Tailored luxury design system)
- **Security**: Cloudflare Turnstile, signed session cookies (`jr_session`)

---

## 2. Documentation Architecture
Detailed technical reports and operational guidelines are available in the following files:

1. **[DEPLOYMENT.md](DEPLOYMENT.md)**: Hosting setups, production environment variable configuration, DNS settings, and deploy procedures.
2. **[LEGAL_COMPLIANCE.md](LEGAL_COMPLIANCE.md)**: Explains compliance architecture for the Digital Personal Data Protection Act 2023 (DPDPA), Information Technology Act 2000, and Consumer Protection Act 2019.
3. **[SECURITY.md](SECURITY.md)**: Details token cryptography, HTTP security headers, CSP configs, CSRF/XSS shields, and vulnerability reporting.
4. **[SEO_REPORT.md](SEO_REPORT.md)**: Focuses on dynamic metadata, JSON-LD schemas (Organization, LocalBusiness, FAQ), and index crawling rules.
5. **[ACCESSIBILITY.md](ACCESSIBILITY.md)**: Outlines keyboard focus indicators, WCAG 2.2 AA guidelines, focus routing, and ARIA labels.
6. **[PERFORMANCE.md](PERFORMANCE.md)**: Documenting image optimizations (AVIF/WebP), standalone build packaging, and font preloading structures.

---

## 3. Development Setup

### A. Environment Config
Copy `.env.example` to `.env` and populate your keys:
```bash
cp .env.example .env
```

### B. Startup Script
Run local services and sync the database models:
```bash
# Sync schema and generate Prisma Client
npx prisma db push
# Run dev server
npm run dev
```
The site will be running on `http://localhost:3000`.

---

## 4. Production Build Verification
To run a local build and check compile configurations:
```bash
npm run build
```
This script runs schema checks, generates the standalone client build, and minifies assets.
