# Module Spec: Client Relationship Management (CRM)

## 1. Business Context

Unlike standard e-commerce sites where users checkout self-serve, JR Interiors' custom fabrications require high-touch design consultations. The **CRM Module** acts as the digital intake and management interface for these leads, replacing scattered email alerts and WhatsApp threads. It enables sellers to nurture prospective clients from consultation request to active project.

---

## 2. Lead Status Pipeline

Leads are tracked using the `Consultation` model and transition through a defined lifecycle:

```
[ NEW ] ──> [ CONTACTED ] ──> [ SCHEDULED ] ──> [ COMPLETED ]
```

*   **NEW**: Fresh submission from the storefront consultation form. Needs immediate seller assignment (target SLA: <4 hours).
*   **CONTACTED**: Seller has initiated contact via phone, email, or WhatsApp.
*   **SCHEDULED**: Design meeting or showroom visit booked.
*   **COMPLETED**: Consultation completed. Client profile is updated, and the flow moves to custom quotation drafting.

---

## 3. CRM Interface Views

### Kanban Board
*   A classic multi-column layout on desktop: columns represent the four pipeline stages.
*   Cards display: Lead name, project type (e.g., "Modular Wardrobes"), date submitted, and assigned seller.
*   **Drag-and-Drop Action**: Moving cards between columns triggers an API call that updates `Consultation.status` and logs an audit log trail.

### Lead Detail Drawer (Slide-Over)
Clicking a lead card opens a dense slide-out panel containing:
*   **Contact Quick Action Bar**: Clickable buttons to trigger direct phone calls (`tel:` links), send emails (`mailto:` links), or pre-populate a WhatsApp template containing the client's design request. See [UX Guidelines](../10_UX_GUIDELINES.md).
*   **Seller Assignment Dropdown**: Permitted for Admin roles to re-assign the lead to a seller.
*   **Notes Section**: A chronological text stream where sellers can save consultation details, measurements, and architectural constraints.
*   **Client Storefront Activity**: Displays the user's wishlist items and past purchases if the email matches a registered `User` account.

---

## 4. Definition of Done

The CRM lead tracking module is complete when:

*   [ ] **Feature Complete**: Dragging lead cards between columns updates `Consultation.status`. Detail drawer displays contact triggers, notes fields, and seller reassignments.
*   [ ] **Accessible**: Keyboard navigation allows users to focus on cards, click `Space` to select, and use `Left`/`Right` arrow keys to move cards between columns.
*   [ ] **Responsive**: Toggles to a linear scrollable list view on viewport widths `<768px`.
*   [ ] **Tested**: Playwright E2E verifies lead card updates and notes saving without page reloads.
*   [ ] **Loading State**: Displays skeleton card shapes when CRM boards initialize.
*   [ ] **Empty State**: Renders empty lane placeholder cards when columns contain zero leads.
*   [ ] **Error State**: Gracefully handles network disconnects by returning cards to their previous columns with error alerts.
*   [ ] **Audit Logging**: Drag-and-drop status changes, notes attachments, and lead assignments are logged to the database `AuditLog`.
*   [ ] **Permission Protected**: Sellers can only view and update leads explicitly assigned to their accounts. Admins can view all leads and re-assign owners.
*   [ ] **Performance Verified**: Action drawers load client profiles, wishlists, and order histories in under 500ms.
