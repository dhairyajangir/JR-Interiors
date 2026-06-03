# JR Interiors — Ecommerce Furniture (Next.js + Postgres)

Production-ready storefront for **JR Interiors**, an Indian premium furniture brand.
Built to the *Atelier Warmth* / "Calm Luxury" design system, server-rendered with
Next.js App Router and Postgres (Prisma) for fast, real-time data.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript) — server components + server actions
- **Postgres 16** (Docker) via **Prisma 6**
- **Tailwind CSS** with the exact design tokens (colors, type scale, spacing)
- **DM Sans** + **Material Symbols**
- **Razorpay** for online payments (UPI / cards / net banking / wallets)

## Localized for India 🇮🇳

- Prices in **₹ (INR)** with Indian digit grouping (₹1,45,000 / ₹1,00,30,000)
- **18% GST** shown on cart, checkout and orders
- **PIN code** + **Indian states** dropdown + **+91 mobile** in all address forms
- Country defaults to India

## Features

- Cinematic, animated home page (DB-driven signature pieces + room collections)
- Furniture catalog — real filtering (category / room / material), sort, pagination
- Product detail — gallery, finish/upholstery variants, spec tabs, reviews, related pieces
- **User accounts** — email + password (scrypt), signed-cookie sessions
- Account dashboard — profile, saved addresses (default/delete), order history
- **Real-time cart** — server actions + optimistic UI, instant nav badge
- **Checkout** — shipping → payment with **Razorpay (online)** and **Cash on Delivery**,
  GST + delivery, prefilled from saved addresses; orders linked to the user
- Order confirmation, instant search, collections, consultation pages
- Motion: page transitions, scroll-reveal/stagger, hero Ken Burns, skeleton loaders
- Fully responsive (verified 375px → desktop), `prefers-reduced-motion` aware

## Local setup

> **Prerequisites:** Node 18+, Docker Desktop **running**.

```bash
cd jr-interiors
npm install
cp .env.example .env          # then edit values (see below)
docker compose up -d          # Postgres on localhost:5433
npx prisma db push            # create tables
npx prisma db seed            # load catalog (17 products) + demo user
npm run dev                   # http://localhost:3000
```

### Demo login (`/account/login`)

```
email:    demo@jrinteriors.in
password: password123
```

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | Postgres connection string |
| `AUTH_SECRET` | yes in prod | Session-cookie signing key. `openssl rand -base64 32`. App refuses to boot in production without it. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Real domain — used for SEO, canonical, sitemap, OG |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | optional | From the Razorpay dashboard. Leave blank → Cash on Delivery only. Test keys = test mode, live keys = live. |

## Payments (Razorpay)

1. Create a Razorpay account → **Settings → API Keys** → generate **test** keys.
2. Put them in `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
3. Online payment appears automatically at checkout. Test card: `4111 1111 1111 1111`,
   any future expiry/CVV; or test UPI `success@razorpay`.
4. Go live: swap in live keys + complete Razorpay KYC. No code change needed.

Payment signatures are verified server-side (`/api/checkout/verify`) before the order
is created — the cart is only cleared on a verified payment.

## Production build

```bash
npm run build && npm start
```

## Deployment

### Option A — VPS + Docker (self-contained)

```bash
cp .env.example .env.production     # fill real values (DATABASE_URL, AUTH_SECRET, domain, Razorpay)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
# first run only — apply schema + seed against the prod DB:
DATABASE_URL=<prod-url> npx prisma db push && npx prisma db seed
```

App listens on `:3000` (standalone Next output). Put Nginx/Caddy in front for TLS, or
host on Hostinger / DigitalOcean / AWS Lightsail. Health probe: `GET /api/health`.

### Option B — Vercel + managed Postgres

1. Push repo to GitHub, import in Vercel.
2. Create Postgres on **Neon** or **Supabase**, copy the connection string.
3. Set env vars in Vercel: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`,
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
4. From your machine: `DATABASE_URL=<neon-url> npx prisma db push && npx prisma db seed`.
5. Deploy.

## Production hardening included

- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy),
  `X-Powered-By` removed
- `AUTH_SECRET` enforced in production; secure cookies over HTTPS
- SEO: dynamic `robots.txt`, `sitemap.xml` (incl. products), OpenGraph/Twitter, manifest, favicon
- Error boundaries (`error.tsx`, `global-error.tsx`), 404 page
- `/api/health` DB readiness probe
- Standalone Docker output, non-root container user

## Project layout

```
prisma/
  schema.prisma       # User, Address, Product, Category, Cart, Order, Review
  seed.ts             # India catalog (₹) + demo user
src/
  app/
    page.tsx furniture/ product/[slug]/ cart/ checkout/{shipping,payment}/
    order/[number]/ collections/ search/ about/ services/ contact/
    account/{,login,register}/
    api/checkout/{razorpay,verify}/  api/health/
    actions.ts auth-actions.ts  robots.ts sitemap.ts manifest.ts
    error.tsx global-error.tsx
  components/          # Navbar, Footer, ProductCard, CartView, ProductView, checkout forms, …
  lib/
    db.ts cart.ts orders.ts commerce.ts (GST/shipping) razorpay.ts
    auth.ts password.ts india.ts format.ts (INR)
Dockerfile  docker-compose.yml (dev)  docker-compose.prod.yml
```
