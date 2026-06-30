# JR Control Documentation Suite

Welcome to the documentation suite for **JR Control**—the central Business Operating System and Administration Console for JR Interiors. This documentation defines the vision, architecture, and specifications of the platform to serve as the single source of truth for engineering teams and AI agents.

---

## Document Directory

Navigate the core platform specifications using the relative links below:

### 1. Core Platform Guidelines

*   **[00_PROJECT_CHARTER.md](./00_PROJECT_CHARTER.md)**: Product vision, brand philosophy, Bounded Contexts, users, positioning, and target alignment (what JR Control IS and IS NOT).
*   **[01_ARCHITECTURE.md](./01_ARCHITECTURE.md)**: Technical stack, Next.js monorepo workspaces, shared types, compilation configurations, database topology, and Vercel infrastructure.
*   **[02_DESIGN_SYSTEM.md](./02_DESIGN_SYSTEM.md)**: Luxury brand visual guidelines. Details the default Light Ivory visual theme, Outfit/Inter typography, card elevations, and status indicators.
*   **[03_SECURITY.md](./03_SECURITY.md)**: Security specifications, multi-factor authentication (MFA/TOTP), session lifecycles, Argon2id password hashing, and Edge route protections.
*   **[04_DATA_MODEL.md](./04_DATA_MODEL.md)**: Prisma database schema, domain-level entities (Catalog, Lead, Order, Session, Log), relationships, and scale optimization.
*   **[05_FEATURE_SPEC.md](./05_FEATURE_SPEC.md)**: Product standards for admin screens, visual intent, and loading/empty/error states.
*   **[06_ROADMAP.md](./06_ROADMAP.md)**: Phased development plan spanning initial auth and catalog setup to integration with designers, installers, and client portals.
*   **[07_AGENT_GUIDE.md](./07_AGENT_GUIDE.md)**: Developer & AI Agent Handbook. Code quality directives, conventions, naming rules, and PR review checklists.
*   **[08_ADR.md](./08_ADR.md)**: Architecture Decision Records (ADRs) explaining the context and rationale behind major technical decisions.
*   **[09_PROGRESS.md](./09_PROGRESS.md)**: Current sprint status tracker, listing completed, in-progress, and planned engineering tasks.

### 2. Core SaaS Foundation Specifications

*   **[10_UX_GUIDELINES.md](./10_UX_GUIDELINES.md)**: Interface rules specifying drawer-first layouts, button placements, modal limits, autosaves, and keyboard shortcuts.
*   **[11_COMPONENTS.md](./11_COMPONENTS.md)**: Design system component inventory detailing DataTable, MetricCard, Drawer, Kanban board, and ColorPicker inputs.
*   **[12_API.md](./12_API.md)**: RESTful query standards, Server Action response envelopes, pagination parameters, and system error catalogs.
*   **[13_TESTING.md](./13_TESTING.md)**: Testing strategy outlining Vitest unit coverages, mock databases, Playwright E2E flows, CI gates, and a11y audits.
*   **[14_ROLES.md](./14_ROLES.md)**: Granular privilege tables mapping features to role profiles (Super Admin, Seller, Designer, Support).
*   **[15_PERFORMANCE.md](./15_PERFORMANCE.md)**: Target load times (SLAs), lazy loading code-splits, virtualized table rendering, and image formats.
*   **[16_ACCESSIBILITY.md](./16_ACCESSIBILITY.md)**: Keyboard focus management, Escape key triggers, custom widget ARIA specs, and screen reader configurations.
*   **[17_NOTIFICATIONS.md](./17_NOTIFICATIONS.md)**: Multi-channel event relays (Toasts, SMTP Mail, WhatsApp Templates) and transactional outbox queue models.
*   **[18_MEDIA_LIBRARY.md](./18_MEDIA_LIBRARY.md)**: File folder taxonomies, size bounds, upload optimization, SHA-256 deduplication, and Cloudinary CDN configurations.

### 3. Functional Modules

Deep dives into specific modules and screens located under [docs/modules/](./modules/):

*   **[dashboard.md](./modules/dashboard.md)**: High-level analytics and day-to-day operations hub.
*   **[products.md](./modules/products.md)**: Premium catalog management, visual editor tabs, and moderation review pipelines.
*   **[categories.md](./modules/categories.md)**: Nested product taxonomy kinds and reordering tools.
*   **[crm.md](./modules/crm.md)**: Consultation Kanban board, lead assignment dropdowns, and client detail logs.
*   **[quotations.md](./modules/quotations.md)**: Custom pricing engine, calculation multipliers, and spec sheet PDFs.
*   **[inventory.md](./modules/inventory.md)**: Real-time stock status, warning thresholds, and supplier logs.
*   **[cms.md](./modules/cms.md)**: Showroom page layouts, hero banner configs, and legal terms editor.
*   **[analytics.md](./modules/analytics.md)**: Business intelligence, performance graphs, role visibility filters, and CSV reporting.
*   **[settings.md](./modules/settings.md)**: System configs, roles, audit trails, and SMTP/WhatsApp integrations.

---

## Developer Onboarding

### Local Monorepo Setup

1.  **Clone and Install**:
    ```bash
    npm install
    ```
2.  **Initialize Database**:
    Make sure a local PostgreSQL instance is running or configure Supabase, then run:
    ```bash
    npm run setup
    ```
3.  **Run Development Servers**:
    *   **Storefront**: `npm run dev:store` (runs Next.js on `localhost:3000`)
    *   **Admin Console**: `npm run dev:admin` (runs Next.js on `localhost:3001`)

### AI Developer Guideline

Before creating any branch, writing code, or running migrations:
1.  Read **[07_AGENT_GUIDE.md](./07_AGENT_GUIDE.md)** to align with rules.
2.  Confirm design patterns via **[02_DESIGN_SYSTEM.md](./02_DESIGN_SYSTEM.md)**.
3.  Ensure database entity usage corresponds to **[04_DATA_MODEL.md](./04_DATA_MODEL.md)**.
