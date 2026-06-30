# Project Charter: JR Control

## 1. Product Vision

**JR Control** is the central Business Operating System (BOS) for **JR Interiors**. It is not a simple admin dashboard built as an afterthought; it is a custom-engineered enterprise application designed to operate the entire lifecycle of JR Interiors' high-end custom millwork, furniture, and luxury showroom operations.

Ultimately, every business transaction, catalog adjustment, lead communication, quotation creation, and deployment coordination should occur inside JR Control. By digitizing workflows that traditionally reside in disparate spreadsheets, PDF specs, and WhatsApp chat histories, JR Control establishes a single source of truth for the organization.

---

## 2. Product Philosophy

To ensure the long-term integrity of the codebase and product, all development must adhere to these unyielding principles:

1.  **Simplicity Over Complexity**: Build features that solve business needs directly. Avoid unnecessary technical scaffolding.
2.  **Security by Default**: Enterprise security is non-negotiable. Data containing client details, project specifications, and quotation margins must be sealed.
3.  **Every Feature Solves a Business Problem**: We do not write code for code's sake. Every interface, database field, and service must map back to an operational efficiency.
4.  **Performance Over Excess Animations**: Interactions must feel lightning-fast. Subtle, elegant micro-animations are encouraged; heavy, distracting canvas or scroll effects are banned.
5.  **Reuse Before Creating**: Leverage existing components, utility functions, and shared types. Do not duplicate business logic.
6.  **Enterprise Quality Over Short-term Speed**: If a feature cannot be built cleanly and securely in this sprint, we re-scope it rather than deploying technical debt.
7.  **Desktop First, Mobile Usable**: The operational staff (admins, sellers) run their business from desktops. The UI must be highly optimized for dense data tables, keyboard shortcuts, and complex forms on desktop, while remaining responsive and readable on mobile.

---

## 3. Core Bounded Contexts (BOS Framework)

JR Control operates as a consolidated Business Operating System partitioned into ten distinct **Bounded Contexts**. All user roles and external portals (Sellers, Designers, Installers, and Customers) interact with these identical core business domains, with access controlled via the security permissions matrix:

```
                          ┌──────────────────────────┐
                          │    JR Control (BOS)      │
                          └─────────────┬────────────┘
         ┌──────────────┬───────────────┼───────────────┬──────────────┐
  ┌──────┴──────┐┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐┌──────┴──────┐
  │  Identity   ││   Catalog   │ │     CRM     │ │  Quotations ││   Orders    │
  └─────────────┘└─────────────┘ └─────────────┘ └─────────────┘└─────────────┘
  ┌──────┴──────┐┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐┌──────┴──────┐
  │  Inventory  ││     CMS     │ │  Analytics  │ │  Security   ││  Settings   │
  └─────────────┘└─────────────┘ └─────────────┘ └─────────────┘└─────────────┘
```

1.  **Identity**: Handles user profiles, password hashing, and Multi-Factor Authentication (MFA) validation.
2.  **Catalog**: Manages luxury product metadata, structural wood categories, finishes (swatches), and seller moderation review queues.
3.  **CRM**: Tracks prospective customer consultation requests, schedules showroom visits, and assigns leads to sellers.
4.  **Quotations**: Compiles physical dimensions, material costs, and margin markup formulas to generate client-facing specification PDFs.
5.  **Orders**: Syncs checkout purchases from the public storefront, manages order statuses, and logs transaction milestones.
6.  **Inventory**: Records material counts, physical warehouse stocks, low-stock threshold warning states, and vendor contact registries.
7.  **CMS**: Edits storefront banners, home layout order lists, and versions compliance/legal documents.
8.  **Analytics**: Processes revenues, lead conversion speeds, and individual seller closing metrics.
9.  **Security**: Manages the append-only audit trail logs and active session version revocations.
10. **Settings**: Configures global integration parameters (SMTP mail, WhatsApp gateways, Razorpay keys).

---

## 4. Platform Definition Matrix

To prevent feature creep, we draw strict boundaries around the platform's scope.

### What JR Control IS:
*   **Enterprise Resource Planning (ERP)**: Custom order management, inventory tracking, raw material costing, and supplier records.
*   **Customer Relationship Management (CRM)**: Client profiles, notes on design consultations, quotation status tracking, and seller assignments.
*   **Showroom Content Management System (CMS)**: Fine-grained configuration of the customer-facing storefront's products, details, and legal compliance.
*   **Quotation Engine**: Rules-based mathematical system to calculate material costs, sizing markups, custom modifications, and tax rates.

### What JR Control IS NOT:
*   **Shopify clone**: We do not support self-serve automated retail checkout for random users. The buying process for custom millwork and facades involves consultation, specification, quoting, and deposit-based invoicing.
*   **WordPress clone**: This is not a blogging platform or generic plugin-based CMS. The data schema is relational, highly structured, and custom-tuned.
*   **A pre-built template dashboard**: We do not load heavy third-party admin themes. The interface is custom-designed using clean design primitives.
*   **A simple CRUD prototype**: Every page must handle validations, audit logging, authorization checks, and network failures.

---

## 5. Portals & Access Matrix

Instead of building separate, disconnected portals for designers, installers, and customers, the system uses a single unified database layer. Access permissions shape the interface context dynamically:

*   **Seller Portal**: Interfaces directly with the CRM, Quotations, and Catalog domains.
*   **Designer Portal**: Accesses the Catalog and Media Library to upload CAD specifications and configure material swatches.
*   **Installer Portal**: Accesses the Orders and CRM modules to view measurements, input on-site verification lists, and upload completion photos.
*   **Customer Portal**: Client-facing workspace to view quote PDFs, digitally sign design approvals, make payments, and view fabrication status.

For a granular permissions map, see the [RBAC Matrix](./14_ROLES.md).
