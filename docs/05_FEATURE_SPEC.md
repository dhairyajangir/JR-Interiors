# Feature Specifications: JR Control

## 1. Product Quality Standards

To make JR Control feel like a premium, production-grade SaaS product rather than a generic boilerplate dashboard, every interface must pass these quality filters before being marked as complete:

*   **Page Intent**: Is it immediately clear what this screen is for?
*   **Primary Action**: Is there one obvious, primary button or call to action?
*   **Three-Click Rule**: Can the user accomplish their primary goal on this screen in under three clicks?
*   **Hierarchy of Importance**: Is critical information displayed above the fold, with secondary options hidden behind tabs or collapse panels?
*   **Scale Testing**: Does this layout work equally well with 10 rows of data and with 100,000 rows? (Requires virtualized lists or paginated servers).
*   **Keyboard Accessibility**: Can a user navigate the entire screen, trigger buttons, and submit forms using only `Tab`, `Enter`, `Space`, and Arrow keys? See [Accessibility Spec](./16_ACCESSIBILITY.md).
*   **Low Latency**: Does the page render fully interactive in under 1 second on standard laptop hardware? See [Performance Spec](./15_PERFORMANCE.md).
*   **Definition of Done Mandatory**: Does this view have a corresponding custom skeleton loader (Loading), a descriptive explanation (Empty), and an action-recovering error message (Error)?

---

## 2. Core Functional Modules

JR Control is structured as a collection of feature-focused modules. Below are the functional specifications for each module:

### A. Operations Dashboard (`/dashboard`)
*   **Purpose**: Command center showing real-time business health metrics and urgent tasks. See [Dashboard Module Spec](./modules/dashboard.md).
*   **Key Components**:
    *   **KPI Scorecards**: Sales Revenue, Active Lead Count, Storefront Traffic, Inventory Alert Flags.
    *   **Urgent Attention Queue**: Lists new consultation requests that haven't been contacted, pending catalog uploads, and failed payments.
    *   **Recent Activity Stream**: A chronological timeline feeding from the `AuditLog` table.

### B. Catalog Moderator (`/dashboard/products` & `/dashboard/categories`)
*   **Purpose**: Control active items, surface finishes, and collections shown on the public luxury storefront. See [Products Module Spec](./modules/products.md) and [Categories Module Spec](./modules/categories.md).
*   **Key Components**:
    *   **Moderation Queue**: A dedicated tab listing items in `"PENDING"` status uploaded by Sellers, allowing Admins to click "Approve" (publishing them live) or "Reject" (requiring input of a `reviewNote`).
    *   **Grid Editor**: Quick-edit price cents, stock count, and stock status indicators.
    *   **Finish Swatch Manager**: Interface to input finish JSON data, choosing color hex codes and names.

### C. Client Relationship Manager (`/dashboard/crm`)
*   **Purpose**: Log client consultations, showroom visits, and communication history. See [CRM Module Spec](./modules/crm.md).
*   **Key Components**:
    *   **Consultation Kanban Board**: Visual drag-and-drop board tracking leads from `NEW` ➔ `CONTACTED` ➔ `SCHEDULED` ➔ `COMPLETED`.
    *   **Lead Profile View**: Complete history of client contacts, wishlist items, past orders, and custom notes typed by sellers.
    *   **Seller Assignment Tool**: Allows administrators to delegate incoming consultations to specific sellers.

### D. Quotation Engine & Orders (`/dashboard/orders` & `/dashboard/quotations`)
*   **Purpose**: Generate itemized custom quotes and manage e-commerce orders. See [Quotations Module Spec](./modules/quotations.md) and [Orders Module Spec](./modules/orders.md) (Note: orders/quotations modules are separated).
*   **Key Components**:
    *   **Quotation Compiler**: Interactive builder where sellers input materials, size dimensions, finishes, and markups to calculate dynamic quotes, producing high-fidelity PDF specifications.
    *   **Order Grid**: Detailed list tracking order status (`confirmed`, `shipped`, etc.) and payment indicators. Includes a button to manually toggle Razorpay payment confirmations.

### E. Showroom CMS (`/dashboard/cms`)
*   **Purpose**: Manage storefront marketing content without triggering redeployments. See [CMS Module Spec](./modules/cms.md).
*   **Key Components**:
    *   **Showroom Page Layout Editor**: Interface to re-order product grids, edit hero banners, upload text blocks, and update brand details (phone numbers, addresses).
    *   **Legal & Policy Editor**: Markdown editor for shipping rules, privacy policies, and terms of service.

### F. Systems & Security Settings (`/dashboard/settings`)
*   **Purpose**: Operational settings and security trace viewing. See [Settings Module Spec](./modules/settings.md).
*   **Key Components**:
    *   **User Directory**: List of user accounts, enabling admins to promote/demote roles (`CUSTOMER`, `SELLER`, `ADMIN`) or suspend accounts.
    *   **Audit Trail Viewer**: Append-only log inspector showing timestamped events, IP addresses, user agents, and mutation diffs.
    *   **MFA Configuration Panel**: Portal to reset TOTP secrets or configure mandatory user authentication setups.
