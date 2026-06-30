# Testing Strategy: JR Control

To ensure system reliability, prevent regression bugs, and secure transactional pricing logic, JR Control enforces a multi-layered testing strategy. All Pull Requests must pass automated CI pipelines before merging.

---

## 1. Testing Classifications

```
┌────────────────────────────────────────────────────────┐
│  E2E Tests (Playwright: Critical Workflows)            │
├────────────────────────────────────────────────────────┤
│  Integration Tests (API routes, DB constraints)        │
├────────────────────────────────────────────────────────┤
│  Unit Tests (Pricing formulas, Zod schemas)            │
└────────────────────────────────────────────────────────┘
```

### Unit Tests
*   **Target Scope**: Stateless helper functions, Zod schema validations, and calculations.
*   **Mandatory Focus**: The Custom Quotation calculation module (`lib/quotations.ts`). Since this calculations engine dictates product prices and business margins, it must maintain **100% test coverage**.
*   **Tooling**: Jest or Vitest.

### Integration Tests
*   **Target Scope**: Database queries, relations validation, and Next.js Server Actions.
*   **Behavior**: Tests execute queries against a test PostgreSQL instance (mocked locally using Docker or Supabase) to verify foreign keys and audit logging actions.
*   **Tooling**: Vitest with Prisma transaction rollbacks.

### End-to-End (E2E) Tests
*   **Target Scope**: Full user journeys spanning client-to-server operations.
*   **Critical Paths**:
    1.  *Authentication*: User enters credentials ➔ MFA prompt appears ➔ input valid TOTP ➔ redirects to dashboard.
    2.  *Catalog Moderation*: Seller uploads product draft ➔ Admin opens moderation panel ➔ clicks Approve ➔ product appears on public storefront listings.
    3.  *Quotation PDF Generation*: Seller inputs dimensions ➔ calculates markup ➔ downloads PDF.
*   **Tooling**: Playwright.

---

## 2. Automated Quality Gates & Thresholds

Our CI pipeline enforces these quality barriers on every build:

| Metric | Target Gates | Enforcement Action |
| :--- | :--- | :--- |
| **Global Code Coverage** | `>80%` Line coverage | Build fails if coverage dips. |
| **Quotation Engine Coverage**| `100%` Line & Branch coverage | Mandatory block. |
| **Accessibility Audit** | Zero WCAG AA violations | Checked via `@axe-core/playwright` on all views. |
| **TypeScript Compilation** | Zero build warnings or errors | Verified via `tsc --noEmit`. |

---

## 3. Playwright E2E Mocking & Setup

*   **Database Seeding**: Before launching E2E tests, the test environment runs a seed script creating standard roles (`TEST_SUPER_ADMIN`, `TEST_SELLER`, `TEST_CUSTOMER`).
*   **MFA Bypass (Test Mode)**: During E2E test runs, a mock environment variable (`E2E_BYPASS_MFA=true`) allows Playwright to supply a static verification token (`000000`) to bypass MFA SMS/authenticator delays.
