# Module Spec: Operations Dashboard

## 1. Business Context

The **Operations Dashboard** is the first screen a team member sees upon completing the MFA validation step. It provides a real-time status display of JR Interiors' operational flow, surface orders, custom consultations, and inventory alerts. It functions as a command hub rather than a passive list of numbers, guiding admins and sellers to items requiring immediate attention.

---

## 2. Interface Wireframe & Layout

```
┌────────────────────────────────────────────────────────┐
│  Stats Cards:                                          │
│  [ Revenue ]    [ Active Leads ]  [ Pending Catalog ]  │
├───────────────────────┬────────────────────────────────┤
│                       │                                │
│  Urgent Attention     │  Activity Feed                 │
│  - Lead #102: New     │  - Seller John updated Lead #2 │
│  - Payment Failed: #9 │  - Admin approved Product #40  │
│  - Failed login: 192.168.1.1   │
│                       │                                │
└───────────────────────┴────────────────────────────────┘
```

The screen uses a 3-column layout on desktop:
1.  **Top Row (Stats Cards)**: Gold-bordered panels displaying key indicators with sparkline indicators.
2.  **Left Column (Urgent Attention Queue)**: Dense list highlighting items with active SLAs (e.g., leads untouched for >4 hours).
3.  **Right Column (Recent Activity Feed)**: A live streaming feed from the `AuditLog` database table.

---

## 3. Core Features & User Actions

### KPI Metrics (Dynamic Cards)
*   **Monthly Revenue**: Sum of all orders with `paymentStatus = "paid"` in the current calendar month.
*   **Open consultations**: Count of rows in the `Consultation` table where `status = "NEW"`.
*   **Pending moderation**: Count of products in the catalog where `status = "PENDING"`.
*   **Low Stock Alerts**: Count of products where `inStock = true` and `stock <= 5`.

### The Urgent Attention Queue
*   Shows a list of card items sorted by urgency:
    *   **Failed Payments**: Orders marked `status = "confirmed"` but `paymentStatus = "failed"`. Provides a quick link to contact details and order details.
    *   **New Consultation Requests**: Leads in `status = "NEW"`. Features a quick action button to "Assign to Seller".
    *   **Pending Approvals**: Custom seller product uploads needing administrator verification. Shows an "Approve" button directly on hover.

---

## 4. UI Elements & Component States

### Loading State
*   KPI cards use skeleton blocks (`h-24 w-full bg-neutral-900 animate-pulse rounded-lg`).
*   Attention lists render 3 skeleton card templates with shimmering gradients.

### Empty State
*   If no items require urgent attention:
    *   Renders a central graphic element in warm bronze (`hsl(28, 38%, 43%)`).
    *   Displays text: `"System Secured and Up to Date. No urgent actions required."`

### Error State
*   If data fetching fails, the dashboard cards display `--` and an inline toast notification displays the error message with a "Reconnect" action.

---

## 5. Definition of Done

The operations dashboard module is complete when:

*   [ ] **Feature Complete**: Stats cards, urgent attention queue, and audit log activity feed display real-time database values.
*   [ ] **Accessible**: Keyboard navigation focus ring is visible on interactive cards and action buttons. Screen readers announce status updates.
*   [ ] **Responsive**: Formats as a single-column layout on viewport width `<768px`.
*   [ ] **Tested**: Playwright E2E verifies dashboard page loading and redirects on unauthenticated sessions.
*   [ ] **Loading State**: Skeleton containers load during active fetches with no component layout shifting.
*   [ ] **Empty State**: Displays warm-bronze secured checkmark illustration when the attention queue is empty.
*   [ ] **Error State**: Displays retry buttons on API network timeouts.
*   [ ] **Audit Logging**: Manual statistics refresh requests are logged to the `AuditLog` table.
*   [ ] **Permission Protected**: Restricted to verified authenticated roles (Super Admin, Admin, Seller, Accountant).
*   [ ] **Performance Verified**: Page becomes interactive in under 1.5 seconds on desktop.
