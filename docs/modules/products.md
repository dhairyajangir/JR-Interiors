# Module Spec: Product Catalog & Moderation

## 1. Business Context

The **Product Catalog** manages the luxury items, custom metalwork, wood veneers, and facade surfaces displayed on the storefront. Sellers upload new product configurations, but to preserve showroom curation standards, all seller-uploaded designs enter a moderation queue. An Admin or Super Admin must review and approve these listings before they go live on the storefront.

---

## 2. Product Moderation Lifecycle

```
[ Seller Upload ] ──> Status: PENDING ──┬──> [ Admin Approve ] ──> Status: PUBLISHED (Live)
                                         └──> [ Admin Reject ]  ──> Status: REJECTED (Draft + Note)
```

1.  **PENDING**: Product is saved in the database but hidden from the public storefront search and listings.
2.  **PUBLISHED**: Item is live and indexable on the public showroom.
3.  **REJECTED**: Item is returned to the seller. The administrator's reason is appended to the `reviewNote` field. The seller can edit details and submit again.

---

## 3. Product Editing Workflow

The product editing interface (accessible via `/dashboard/products/new` or `/dashboard/products/[id]/edit`) is organized into six structured sections to manage high-dimensional configurations.

```
┌────────────────────────────────────────────────────────┐
│  Product Editor: [ID: table-luxe]                      │
│  [ Basic Info ]  [ Media ]  [ Variants ]  [ Inventory ]│
├────────────────────────────────────────────────────────┤
│                                                        │
│  Selected Section Panel Content                        │
│                                                        │
├────────────────────────────────────────────────────────┤
│  [ Save Draft ]                      [ Submit Review ] │
└────────────────────────────────────────────────────────┘
```

### Tab 1: Basic Info
*   **Identification**: Product Name, Tagline (e.g., `"Walnut / Linen"`), and Series Selection (e.g., `"Atelier Heritage Collection"`).
*   **Description**: Rich-text textarea documenting the design inspiration, wood patterns, and tolerances.
*   **Classifications**: Room selection (`"Living" | "Office" | "Dining" | "Bedroom" | "Studio"`), Type selection (`"Seating" | "Tables" | "Storage" | "Lighting" | "Decor"`), and Category lookup.

### Tab 2: Media Assets
*   **Primary Showcase Image**: Standard image upload trigger. Serves as the main catalog grid card graphic.
*   **Detail Gallery**: Multi-image file drag-and-drop grid. Stores references inside the `images` array for detail slide-shows.
*   **Optimizations**: Automatically validates image sizes (<2MB) and converts uploads to WebP formats. See [Media Library Spec](../18_MEDIA_LIBRARY.md).

### Tab 3: Variants & Finishes
*   **Finishes JSON Matrix**: Interface to add, edit, or remove swatches. Includes a color hex picker and a text field to name the finish (e.g., name: `"Muted Gold"`, hex: `"#D4AF37"`).
*   **Upholstery & Fabrics**: Text tags input component (e.g., `"Velvet"`, `"Full Grain Leather"`).

### Tab 4: Inventory & Stock Status
*   **Baseline Costs**: Pricing input (in cents).
*   **Availability**: Stock count numeric input, low stock reorder threshold limit, and an `"inStock"` availability boolean toggle.

### Tab 5: SEO Configuration
*   **Slug Editor**: Real-time URL validator. Automatically creates a slug from the product name, verifies it matches URL-safe formatting, and queries the database to ensure it does not conflict with existing entries.
*   **Meta Headers**: Custom meta titles and descriptions for search engine crawlers.

### Tab 6: Publishing & Moderation Control
*   **Audit Note**: Displays history notes if the product was previously rejected.
*   **Moderation Panel (Admins Only)**: If status is `"PENDING"`, displays two buttons:
    *   `Approve & Publish`: Toggles status to `"PUBLISHED"`.
    *   `Reject`: Opens a comment box requiring an audit explanation (saved to `reviewNote`), toggles status to `"REJECTED"`.

---

## 4. Definition of Done

The product catalog editor module is complete when:

*   [ ] **Feature Complete**: Product data parameters, media upload pipelines, finishes swatches, and Admin moderation queues are fully interactive.
*   [ ] **Accessible**: Standard keyboard tab orders run through inputs. Focus trapping is enforced inside modal dialog prompts.
*   [ ] **Responsive**: Form blocks stack vertically on screens `<1024px`. Swatch previews grid is responsive.
*   [ ] **Tested**: Playwright E2E verifies that a Seller can upload a product, an Admin can moderating it, and the item displays correctly on the public storefront.
*   [ ] **Loading State**: Swatch edits and listing changes render skeleton blocks during data fetches.
*   [ ] **Empty State**: Renders empty catalog graphic cards when search queries return zero product results.
*   [ ] **Error State**: Displays red validation boundaries on inputs failing Zod schema checks.
*   [ ] **Audit Logging**: Changes to catalog items, approvals, and rejections are logged to the database `AuditLog`.
*   [ ] **Permission Protected**: Only Admins and Super Admins can publish products or access the moderation panels. Sellers can only edit drafts/rejections they created.
*   [ ] **Performance Verified**: Real-time slug validations query database index columns, executing lookup tasks in under 100ms.
