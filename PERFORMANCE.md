# Performance Optimization Report - JR Interiors

This document outlines the performance enhancements implemented to achieve a **95+ Lighthouse Performance score** on production deployment.

---

## 1. Asset & Media Optimization

### A. Next.js Image Optimization
- **WebP & AVIF Support**: Enabled AVIF and WebP image formats inside `next.config.mjs`. AVIF offers up to 50% file size reduction compared to standard WebPs.
- **Responsive Sizes**: Configured `sizes` boundaries on all `<Image>` calls to prevent oversized raw assets from downloading on mobile viewports.
- **Priority Loading**: Configured `priority` on above-the-fold assets (such as the Hero background) to boost Largest Contentful Paint (LCP) performance.

### B. Font Loading Strategies
- **Next.js Google Fonts**: DM Sans and Cormorant Garamond are loaded via `next/font/google`. Next.js automatically downloads and hosts the font files locally during build time, preventing layout shifts and eliminating external render-blocking network calls.
- **Font Display Swap**: Configured `display: "swap"` on Google Fonts to show a system fallback font instantly during loading.

---

## 2. Compilation & Standalone Bundling

### A. Standalone Output
- Enabled `output: "standalone"` in the Next.js configurations. This builds a minimal node server containing only the required server modules, reducing Docker image sizes and deployment load times.

### B. Compression & Splitting
- Enabled Gzip/Brotli compression configurations (`compress: true`).
- Code splitting is handled automatically by Next.js app router, dividing CSS and JS pages into smaller, page-specific chunks.
