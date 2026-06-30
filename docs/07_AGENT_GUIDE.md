# Developer & AI Agent Handbook: JR Control

This handbook is the operational constitution for developers and AI agents working on the JR Interiors monorepo. It ensures that all contributions maintain strict coding standards, visual consistency, and architectural integrity.

---

## 1. Project Philosophy

*   **JR Control is a Business Operating System**: Do not write superficial mock dashboards or generic CRUD pages. Every feature must support core bounded contexts: catalog curation, CRM lead nurture, pricing margin calculation, or audit tracking. See [Project Charter](./00_PROJECT_CHARTER.md) for domain contexts.
*   **Aesthetics Are Non-Negotiable**: The interface is a premium digital atelier. Adhere strictly to the **Ivory Light-First Design** (Warm Ivory canvas background `#F7F6F2`, white cards, warm bronze text highlights, and Outfit/Inter typography). Default browser styling is prohibited. Optional dark modes are secondary.
*   **Security & Traceability**: Every database mutation must check user privileges and log data diffs to the append-only `AuditLog` table. All user passwords must be hashed using **Argon2id**.

---

## 2. Coding Standards & Strict TypeScript

*   **Zero TypeScript Errors**: TypeScript is configured with strict compiler flags. Code submissions that introduce type compiler warnings or build failures will be rejected.
*   **Explicit Typing Required**:
    *   Do not use `any` (either explicit or implicit).
    *   Do not use type assertions (`as Type`) to override compiler alerts. Fix the underlying type signature.
    *   Properly type all API response payloads and Server Action return values.
*   **Composition Over Inheritance**: Keep components lightweight and modular. Do not build massive, nested base classes. Leverage React child composition.

---

## 3. Architecture & Folder Rules

*   **Workspace Separation**: Keep code scopes separate. Retail storefront code resides in `jr-interiors/src/app`, and admin panel code in `jr-interiors/jr-admin/src/app`.
*   **Prisma Client Single Source**: Do not create separate Prisma files. All models reside inside the shared schema file at `../prisma/schema.prisma`.
*   **Feature-Based Directories**: Group components, types, and services by feature domain inside the workspace:
    ```
    src/
    ├── app/                     # App router routing pages (RSC)
    ├── components/
    │   ├── ui/                  # Shared primitive library (buttons, inputs)
    │   └── crm/                 # CRM-specific widgets (KanbanBoard, Notes)
    ├── lib/
    │   ├── auth/                # Security and session managers
    │   └── crm/                 # Lead CRM operations
    └── types/                   # Module type files
    ```
*   **Presentation Layer Separation**: UI files must only render components. Move network fetch calls and database mutation operations into Server Actions or core libraries under `lib/`.

---

## 4. Visual Component & Naming Rules

*   **Reuse Core Primitives**: Before coding any visual elements, check **[Component Catalog](./11_COMPONENTS.md)**. You must import Button, Input, Table, and Drawer components from the catalog rather than writing custom HTML structure.
*   **Tailwind Guidelines**: Avoid styling items using arbitrary pixel margins (e.g. `mt-[19px]`). Adhere strictly to the modular 4px grid spacing.
*   **Naming Conventions**:
    *   *Components*: PascalCase (e.g., `ProductForm.tsx`, `KanbanBoard.tsx`).
    *   *Files & Folders*: kebab-case (e.g., `api-standards.md`, `two-factor-settings/`).
    *   *Variables & Functions*: camelCase (e.g., `validateSessionToken()`).
    *   *Database columns*: camelCase in Prisma models (e.g., `priceCents`).
    *   *Environment constants*: UPPER_SNAKE_CASE (e.g., `WHATSAPP_API_TOKEN`).

---

## 5. Git & PR Workflow Guidelines

*   **Branch Naming Convention**:
    *   Features: `feature/module-name` (e.g., `feature/crm-kanban`).
    *   Fixes: `fix/bug-title` (e.g., `fix/mfa-redirect`).
    *   Refactors: `refactor/target-area`.
*   **Commit Message Standards**: Use descriptive, structured commit messages:
    *   `feat(crm): implement lead assignment dropdown with audit logging`
    *   `fix(auth): resolve session token expiration check middleware bug`

---

## 6. Definition of Done Checklist

Before approving any Pull Request or marking a feature as complete, verify that:

*   [ ] **Zero Compiler Warnings**: Running `npm run build:all` compiles without warnings.
*   [ ] **Validation Checked**: Every client input is parsed using Zod schemas on API entry point. See [API Spec](./12_API.md).
*   [ ] **Role Protection Verified**: Strict role checks are executed inside all new endpoints and Server Actions.
*   [ ] **MFA Checked**: Route access blocks users who haven't completed the active MFA session verification.
*   [ ] **Keyboard Accessible**: Modals trap focus, Escape closes overlays, and all actions trigger via keyboard keys. See [Accessibility Spec](./16_ACCESSIBILITY.md).
*   [ ] **States Handled**: Skeletons load during fetches, empty lists display action suggestions, and API errors display recovery retry keys.
*   [ ] **CLS Score Clean**: Layout heights are preserved during loads to prevent visual layout shifts.
*   [ ] **Audit Log Triggered**: Database mutations trigger append-only audit records containing data diffs.
