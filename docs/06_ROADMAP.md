# Product Roadmap: JR Control

The development of JR Control is split into sequential phases. Each phase represents a group of related features, designed to deliver functional value to JR Interiors while keeping technical debt minimal.

---

## Phase 1: Infrastructure & Security (Current Sprint)
*Focus: Establish a secure, high-performance base for the administration system.*

*   **Setup**: Reconstruct the `jr-admin` Next.js monorepo workspace.
*   **Authentication**: Integrate Supabase Auth and configure strict, stateless token validation.
*   **Security Policies**: Configure multi-factor authentication (MFA/TOTP) setup and validation middleware. See [Security Architecture](./03_SECURITY.md).
*   **Session Management**: Set up secure HTTP-only cookies, inactivity logouts, and remote session revocations.
*   **Auditing**: Implement the append-only `AuditLog` framework to capture critical user mutations.

---

## Phase 2: Catalog & Content Management (CMS)
*Focus: Take control of the public showroom content and product listings.*

*   **Catalog Moderator**: Build product management forms, finish/swatch picker, and image uploaders. See [Products Spec](./modules/products.md).
*   **Workflow Moderation**: Implement the Admin review pipeline (Approved, Rejected with note, Draft).
*   **Storefront CMS**: Build layout panels to modify homepage banners, product showcases, and legal policies. See [CMS Spec](./modules/cms.md).
*   **Media Library**: Set up a CDN media explorer to upload, organize, and optimize showroom photography. See [Media Library Spec](./18_MEDIA_LIBRARY.md).

---

## Phase 3: Lead Tracking & CRM
*Focus: Eliminate email and WhatsApp-based customer tracking.*

*   **Consultation Intake**: Sync contact forms on the public website directly with the JR Control database.
*   **Lead Pipeline**: Build a Kanban board tracking leads from discovery (`NEW`) to booking (`COMPLETED`). See [CRM Spec](./modules/crm.md).
*   **Seller Assignment**: Create controls to delegate incoming leads to specific sellers.
*   **Interaction Notes**: Allow sellers to write rich-text logs of client meetings, wishlist favorites, and preferences.

---

## Phase 4: Custom Quotation Engine
*Focus: Digitize the custom quotation and pricing spreadsheets.*

*   **Price Modeling**: Implement a dynamic calculator factoring in material margins, dimensions, finishes, and custom design markups. See [Quotations Spec](./modules/quotations.md).
*   **Document Generator**: Create a system that converts completed digital quotes into premium, client-facing PDF specification sheets automatically.
*   **Status Workflows**: Enable sellers to draft quotes, submit them for Admin approval, send them to clients, and log client signatures.

---

## Phase 5: Order & Inventory Management
*Focus: Bridge the sales funnel with fabrication operations.*

*   **Checkout Tracking**: Log completed public website transactions directly in the admin dashboard.
*   **Status Milestones**: Implement order processing stages: `Confirmed` ➔ `In Production` ➔ `Ready for Dispatch` ➔ `Delivered`.
*   **Inventory Ledger**: Track stock counts and material yardages, setting up alerts when counts fall below restock limits. See [Inventory Spec](./modules/inventory.md).
*   **Vendor Registry**: Manage contact details, pricing lists, and delivery timelines for raw material and fabric suppliers.

---

## Phase 6: Extended Collaboration Portals
*Focus: Extend JR Control to partners and clients.*

*   **Designer Portal**: Create a workspace for external interior designers to submit CAD files, map textures, and review custom millwork tolerances.
*   **Installer Portal**: Design a mobile-optimized interface for on-site installers to view dimensions, upload completion photos, and complete verification checklists.
*   **Client Dashboard**: A client portal where customers can check production progress, download invoice PDFs, and approve design changes.
