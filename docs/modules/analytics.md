# Module Spec: Business Intelligence & Analytics

## 1. Business Context

The **Analytics Module** compiles raw transaction logs, CRM updates, and catalog views into actionable business intelligence. It allows the owner (Super Admin) to monitor revenue trends, track individual seller closing performance, and identify which furniture collections generate the highest design interest.

---

## 2. Access Privilege Matrix (Security Guard)

To preserve sensitive financial data, dashboard metrics are filtered by user role:

*   **Super Admin**: Access to all financial statistics, profit margin margins, revenue runs, and complete seller conversion dashboards. See [RBAC Matrix](../14_ROLES.md).
*   **Admin**: Access to lead volumes, storefront traffic metrics, and product views.
*   **Seller**: Restricted view. Sellers can access only their personal performance statistics (leads assigned vs. closed, total value of quotes drafted, personal sales target progress).

---

## 3. Core Features & Analytics Reports

### Sales Revenue Report
*   **Interactive Line Graph**: Plotting daily, weekly, or monthly sales revenue.
*   **Filters**: Date range selectors (e.g., "Last 30 Days", "Current Quarter", "Custom Range").
*   **Payment Breakdown**: Segregates revenue by payment method (Razorpay vs. Cash on Delivery).

### Lead Conversion funnel
*   Visualizes conversion leaks:
    ```
    Incoming Leads (100%) ──> Contacted (80%) ──> Showroom Visit (50%) ──> Quoted (30%) ──> Paid Order (15%)
    ```
*   **SLA Tracking**: Reports average response times (how many hours it takes to move a lead from `NEW` to `CONTACTED`).

### Product Interest Index
*   Combines storefront page views, cart additions, and wishlist frequencies to rank items. Helps production managers prioritize inventory stocking.

---

## 4. Operational Actions

*   **Export Ledger (CSV)**: Export raw transactions, customer records, or audit lists matching the filtered date range. See [API Spec](../12_API.md).
*   **Print Summary**: Styled layout to download clean, executive dashboard PDF reports.

---

## 5. Definition of Done

The business intelligence analytics module is complete when:

*   [ ] **Feature Complete**: Interactive metrics line charts, date-range filters, conversion funnels, and CSV exporters function correctly.
*   [ ] **Accessible**: Charts data elements contain aria-labels and descriptions. Date range selector dropdowns are keyboard-navigable.
*   [ ] **Responsive**: Graphs and tables scale dynamically, adjusting to fit layout containers on mobile devices.
*   [ ] **Tested**: Playwright E2E verifies that a Seller cannot view Admin financials, and checks date filter changes.
*   [ ] **Loading State**: Displays loading skeleton placeholders for charts during API fetches.
*   [ ] **Empty State**: Renders empty state containers if the chosen date range contains zero records.
*   [ ] **Error State**: Displays helpful error alerts if date selection configurations are malformed.
*   [ ] **Audit Logging**: Exporting transactional ledgers or auditing log files are logged to the `AuditLog` table.
*   [ ] **Permission Protected**: access is enforced strictly via session token checks. Sellers are blocked from querying corporate metrics.
*   [ ] **Performance Verified**: Date range filter queries return metrics and render charts in under 1 second.
