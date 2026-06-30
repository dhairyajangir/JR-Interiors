# Search Engine Optimization (SEO) Architecture - JR Interiors

This document outlines the SEO configuration and indexing strategies implemented to target a **100/100 Lighthouse SEO score**.

---

## 1. Technical SEO Configuration

### A. Dynamic Metadata Architecture
- **Global Metadata**: Defined in the root `layout.tsx`, implementing brand templates, descriptions, keywords, alternates (canonical tag), and viewport configurations.
- **OpenGraph & Twitter Cards**: Native integration for Facebook and Twitter sharing configurations, referencing the brand OG banner `/og-image-1200x630.jpg`.
- **Dynamic Site Map (`sitemap.ts`)**: Serves an XML sitemap at `/sitemap.xml` listing static pages, product catalog routes fetched directly from the database, and new legal pages dynamically.
- **Robots Rules (`robots.ts`)**: Directs search engine crawlers, allowing root indexing while blocking access to sensitive directories (like `/admin`, `/api/`, `/checkout/confirmation`).

---

## 2. Semantic Markup & Hierarchy
- **Single H1 Tag**: Enforced on every page (homepage, about, contact, services, product detail) to establish clean document hierarchy.
- **Accessible Headings**: Header tags (`<h2>`, `<h3>`) flow sequentially without skipping levels.
- **Alternative Text**: Image alt annotations are dynamically mapped using `getAltText` utilities (`lib/altText.ts`) to describe timber materials, design types, and room setups to search engines and screen readers.

---

## 3. Structured Data (JSON-LD Schemas)
Integrated within the `StructuredData.tsx` component to provide rich search snippets:
1. **Organization Schema**: Defines the official brand name, logo (`/logo.png`), contact points, and social profiles.
2. **LocalBusiness Schema**: Declares geo-coordinates, address (Jaipur, India), phone (+91 94603 00750), operating hours, pricing range (₹₹₹), and ratings for search listings.
3. **FAQ Schema**: Provides answers to frequently asked questions (e.g. materials, bespoke services, delivery timelines, showrooms) to claim larger search engine result page (SERP) real estate.
4. **Product Schema**: Generates rich product snippets on individual detail pages including pricing, ratings, and stock status.
