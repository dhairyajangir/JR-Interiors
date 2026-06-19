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

## Multi-vendor seller platform

A built-in marketplace layer — sellers list products, admin curates.

- **Invite-only sellers**: admin creates seller accounts at `/admin/sellers` (no public seller signup)
- **Seller Studio** (`/seller`): sellers manage their own products (create / edit / delete, ₹ pricing, images, stock) and see orders containing their items (`/seller/orders`) to mark fulfilled
- **Admin moderation** (`/admin/listings`): every new/edited listing enters a PENDING queue; admin approves → goes live, or rejects with a reason shown to the seller
- Storefront only ever shows `PUBLISHED` products; product pages show **"Sold by {brand}"**
- Order items snapshot their seller, so per-seller order routing survives product edits/deletes

Roles: `CUSTOMER` (default) · `SELLER` · admin (via `ADMIN_EMAIL` or role `ADMIN`).

### Demo seller (after seeding)
```
email:    seller@studiooak.in
password: password123
```
Comes with one published + one pending listing to demo the moderation flow.

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
| `DATABASE_URL` | yes | Postgres connection string (e.g. Supabase direct connection URL) |
| `AUTH_SECRET` | yes in prod | Session-cookie signing key. `openssl rand -base64 32`. App refuses to boot in production without it. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Real domain — used for SEO, canonical, sitemap, OG |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | optional | From the Razorpay dashboard. Leave blank → Cash on Delivery only. |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | URL of your Supabase hosted instance |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable API key from your Supabase dashboard |

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

### Option B — Vercel + Supabase (Recommended)

1. Push the repository to GitHub, and import it into **Vercel**.
2. Set the following Environment Variables in your Vercel project settings:
   * `DATABASE_URL`: Ensure this points to the hosted Supabase connection string.
     ```
     postgresql://new_admin:SupabasePassword123!@db.jhzqywcmzaevfyzgezym.supabase.co:5432/postgres?schema=public&sslmode=require
     ```
   * `AUTH_SECRET`: A long random security key (e.g., generated with `openssl rand -base64 32`).
   * `NEXT_PUBLIC_SITE_URL`: Your Vercel production domain (e.g., `https://jrinteriors.vercel.app`).
   * `NEXT_PUBLIC_SUPABASE_URL`: `https://jhzqywcmzaevfyzgezym.supabase.co`
   * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_NWF-TlVW9HKayGl6tIBZ3Q_m2IOhjHo`
   * `ADMIN_EMAIL`: `demo@jrinteriors.in` (and Razorpay credentials if active).
3. Push your code. Vercel will automatically build and deploy the project.
4. If you encounter the **"A moment of pause"** layout error page, verify that:
   * The `DATABASE_URL` and `AUTH_SECRET` are properly configured in Vercel.
   * You've run `npx prisma db push` to push the database schema to the Supabase instance.

---

## 6. Checkout Authentication & Simulated Tracking
* **Checkout Security**: Guests can no longer check out. Both `/checkout/shipping` and `/checkout/payment` check for an active user session. Unauthenticated users are redirected to login, returning to checkout upon successful authentication.
* **Live Notifications**: Dispatches simulated tracking templates for both SMS and Email to the console. Live dispatch templates can also be viewed in real-time on the Order Confirmation page (`/order/[number]`).
* **Branding Updates**: Custom vector SVG Instagram icon (crisp, adaptive coloring matching the theme) used on footer and contact pages. Navigation bar icons are fully aligned in consistent flex wrappers.

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
