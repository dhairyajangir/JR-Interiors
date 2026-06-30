# Performance Standards: JR Control

This document defines performance SLA thresholds and code optimization strategies. Developers and AI agents must write code that complies with these standards to ensure the interface operates quickly on average user hardware.

---

## 1. Page Load & Interaction SLAs

Both public and administrative applications must target these core performance limits under normal network conditions:

*   **Time to First Byte (TTFB)**: `<250ms` (Serverless compute functions must return headers instantly).
*   **First Contentful Paint (FCP)**: `<1.0s`.
*   **Time to Interactive (TTI)**: `<1.5s` (Users must be able to scroll, click, or search within 1.5 seconds of route load).
*   **Interaction to Next Paint (INP)**: `<100ms` (Form inputs, click triggers, and modal launches must render visual feedback within 100 milliseconds).

---

## 2. Bundle Optimization & Lazy Loading

Unnecessary client-side JavaScript is the leading cause of slow page loads.

*   **First Load JS Limit**: Max `150kb` per page. Total bundle size for all static layouts must remain below this threshold.
*   **Dynamic Code Splitting**: Heavy components that are not immediately visible above the fold must be dynamically imported using Next.js `dynamic()` lazy loading:
    *   **Side drawers** (e.g., product editors).
    *   **Modal dialogs** (e.g., delete confirmation alerts).
    *   **Charts & Visual Graphs** (e.g., Recharts graphs in the Analytics module).
    *   **Rich Text Editors** (e.g., CMS layout content boxes).
*   **Dependency Audit**: Never install a third-party package if the feature can be implemented in under 50 lines of clean vanilla code.

---

## 3. Database Query & Retrieval Strategies

To prevent PostgreSQL CPU spikes, follow these strict Prisma retrieval rules:

*   **No Wildcard Selects**: Never query using raw default models. Always use Prisma's `select` statement to fetch only the database columns required for the interface:
    ```typescript
    // Correct query layout
    const products = await db.product.findMany({
      select: { id: true, name: true, priceCents: true }
    });
    ```
*   **Cursor Pagination**: Avoid using high offset limits (`skip: 5000`) for large lists, as this forces database scans. Use cursor-based pagination (`take: 25`, `cursor: { id: lastId }`) for tables.
*   **Relation Batching**: Avoid the `N+1` query pattern (firing nested queries inside a loop). Fetch related models in a single query using `include` statement or joint SQL executions.

---

## 4. Virtualized Dense Tables

*   When rendering lists or grids exceeding 100 rows, the DOM tree grows and slows down the browser.
*   **Mandatory Virtualization**: Standard tables with large datasets must use a virtualizer library (e.g., `@tanstack/react-virtual` or `react-window`). Only rows visible in the active viewport window are rendered to the DOM, reducing layout calculation times.

---

## 5. Image & Static Asset Optimization

*   **Next.js Image Wrapper**: All product images and banners must use the Next.js `<Image>` component. Direct raw `<img>` tags are prohibited.
*   **Modern Formats**: The image pipeline must convert all assets to **WebP** or **AVIF** formats.
*   **Explicit Sizing**: Specify exact aspect ratios and sizing boundaries to prevent layout shifts (CLS).
*   **CDN Caching**: Static assets must be served from Edge cache locations with a cache header set to `public, max-age=31536000, immutable`.
