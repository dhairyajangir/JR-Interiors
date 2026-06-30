# Module Spec: Storefront CMS

## 1. Business Context

The **Storefront CMS Module** gives administrators control over the marketing copy, hero banners, and showroom displays on the public website. By exposing these assets as dynamic parameters in JR Control, the team can run promotions, update seasonal collections, and modify legal documents instantly without requesting code changes or deployment pushes.

---

## 2. Storefront Layout Configurations

The CMS divides page structures into customizable blocks:

*   **Hero Showcase Banner**: Manage the large landing slide. Configures image URL, title, subtitle, and target CTA links (e.g., pointing to custom consultations).
*   **Showroom Highlights**: Controls which collection categories (Atelier Selections, Architectural Facades) are displayed on the main page.
*   **Announcement Bar**: Editable text marquee at the top of the storefront (e.g., "New Showroom open in Jaipur - Book a consultation").

---

## 3. Core System Features

### Showroom Copy Editor
*   An inline, safe-preview rich-text editor for modifying text sections of the website.
*   Enforces design system rules by limiting layout-breaking sizing modifications.

### Legal & Compliance Editor
*   A markdown-oriented editor specifically for writing:
    *   **Terms of Service**
    *   **Privacy & Cookie Policies**
    *   **Shipping & Return Policies**
*   Saves content as structured text in the database, which is fetched dynamically by storefront routes.
*   **Version History Tracker**: Stores a revision history of policy changes, noting which Admin updated the terms and when.

---

## 4. UI Elements & Component States

### Validation Check
*   If an administrator uploads an image with a size exceeding 2MB, the CMS rejects it and triggers an optimization notice (suggesting conversion to WebP format). See [Media Library Spec](../18_MEDIA_LIBRARY.md).
*   Inputs checking: Slugs are validated in real-time to avoid duplicate route collisions.

---

## 5. Definition of Done

The storefront CMS editor module is complete when:

*   [ ] **Feature Complete**: Banner changes, landing copy updates, and markdown legal page publishers are fully operational.
*   [ ] **Accessible**: Layout panels and text forms are keyboard focusable. Focus rings highlight elements during tab cycles.
*   [ ] **Responsive**: CMS editor panels scale down to tablet widths, and preview windows mock mobile screen configurations.
*   [ ] **Tested**: Playwright E2E verifies that editing page banners updates storefront homepages without clearing active layouts.
*   [ ] **Loading State**: Displays skeleton banners during active fetches.
*   [ ] **Empty State**: Banners configuration shows illustrative empty blocks if image assets are removed.
*   [ ] **Error State**: Image upload blocks display crimson boundary rings and error text if file sizes exceed 2MB.
*   [ ] **Audit Logging**: Every banner change, copy edit, and legal document version creation is logged in the `AuditLog` table.
*   [ ] **Permission Protected**: Access is restricted to Admin or Super Admin roles. Modifying legal terms requires Super Admin authentication.
*   [ ] **Performance Verified**: CMS modifications invalidate storefront Edge CDN caches instantly (under 1 second).
