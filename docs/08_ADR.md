# Architectural Decision Records (ADR)

This document tracks major architectural decisions, the context surrounding them, and the consequences of these choices.

---

## ADR-001: Monorepo Workspace Configuration

### Status
Accepted

### Context
JR Interiors operates a customer-facing storefront and a backend management console. These systems must share database models (Prisma schema), typescript data types, and certain utility operations (validations, formatting). Housing them in completely separate repositories leads to out-of-sync models, manual copy-pasting of code, and deployment coordination issues.

### Decision
Implement an NPM workspaces monorepo structure. The root repository orchestrates dependencies, and separate workspaces exist for the storefront (`jr-interiors`) and the admin console (`jr-interiors/jr-admin`).

### Consequences
*   **Benefits**: Shared types database model (Prisma client) updates automatically across workspaces. Consolidates code management and enables single-command workspace builds.
*   **Tradeoffs**: Clean checkouts are larger. Risk of package pollution if developers install dependencies at the root workspace instead of the target project workspace.

---

## ADR-002: Desktop-First UI Design for JR Control

### Status
Accepted

### Context
The users of JR Control (Super Admins, Admins, Sellers) are business professionals who operate from laptops and desktops in a showroom or office environment. They manipulate large data grids, create detailed product quotes, and read audit logs. Designing a mobile-first UI for these workflows results in cramped tables, paging fatigue, and inefficient form layouts.

### Decision
Design the admin interface with a Desktop-First philosophy. Layout structures, density of data tables, sidebar configurations, and keyboard shortcut paths are optimized for desktop resolutions first, with secondary responsive wrapping implemented for mobile readability.

### Consequences
*   **Benefits**: High informational density, rapid keyboard navigation, and streamlined quotation inputs for core business users.
*   **Tradeoffs**: Reduced ease of use for complex quotation compiling when accessed from a mobile phone (viewing-only on mobile is prioritized).

---

## ADR-003: Premium Light-First Visual System vs. Prebuilt Admin Templates

### Status
Accepted

### Context
Pre-built admin templates come packed with generic charts, cards, and styling configurations. They project a low-end, mass-market visual identity. Additionally, dark glass dashboards become tiring for showroom managers and sellers who spend hours entering details.

### Decision
Reject generic dashboard templates. Build a custom light-first design system utilizing warm ivory backgrounds (`#F7F6F2`), white card cards, subtle drop-shadow elevations, Outfit/Inter typography, and warm bronze highlights. This emulates premium tools like Stripe, Linear, and Notion.

### Consequences
*   **Benefits**: Brand alignment. High visibility and readability over hours of continuous usage. Lightweight CSS layouts with zero bloated widget libraries.
*   **Tradeoffs**: Requires custom frontend development instead of drag-and-drop template assembly.

---

## ADR-004: Relational PostgreSQL Database with Prisma ORM

### Status
Accepted

### Context
JR Control handles complex relational data (Sellers upload Products, which belong to Categories; Clients trigger Consultations, which translate to custom Orders containing snapshots of OrderItems, all tracked by an append-only AuditLog). Document-store databases (NoSQL) fail to enforce foreign key constraints, increasing the risk of orphaned data.

### Decision
Standardize on PostgreSQL as the relational database engine, managed via Prisma ORM for schema migration and type generation.

### Consequences
*   **Benefits**: Enforced referential integrity, schema migrations, and automatic typescript type generation matching database entities.
*   **Tradeoffs**: Requires strict migration planning; changes to schemas require regenerating clients and running db push commands.

---

## ADR-005: Stateless Session Tokens with Argon2id Verification

### Status
Accepted

### Context
For security and convenience, sessions must be stored in secure cookies to prevent XSS theft. However, password credentials must be hashed securely using modern collision-resistant algorithms, and standard stateless JWT cookies cannot be revoked instantly if a seller's laptop is stolen or account permissions change.

### Decision
Hash all user credentials using **Argon2id** (iterations=3, memory=64MB, parallelism=4). Store session details in signed, stateless JWT cookies (`HttpOnly`, `Secure`), but validate the token's session-version state against a fast database index or Redis key on every request.

### Consequences
*   **Benefits**: Industry-standard password hashing strength combined with immediate administrative session revocation capabilities.
*   **Tradeoffs**: Adds a minor database/cache check query to the lifecycle of authenticated requests.
