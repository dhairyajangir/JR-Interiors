# Module Spec: Material & Stock Inventory

## 1. Business Context

The **Inventory Module** monitors physical stock levels, hardware quantities, and fabric yardages available in JR Interiors' workshops and showroom. It connects sales orders directly to material availability, ensuring sellers do not commit to unrealistic lead times for out-of-stock custom materials.

---

## 2. Inventory Ledger & Properties

The database tracks inventory via explicit product counts and custom material properties:

*   **Retail Stock (`Product.stock`)**: Direct inventory count for completed showroom items (e.g., chairs, decor items).
*   **Material Stock**: Yardage or square-footage tracking for custom millwork finishes (e.g., Solid Walnut wood, brushed brass hardware, specific fabric roles).
*   **Reorder Limit**: The warning threshold level. When stock dips below this value, the item triggers warning notifications.
*   **Status**: Calculated indicator: `"IN_STOCK"` (above reorder limit), `"LOW_STOCK"` (at or below reorder limit), or `"OUT_OF_STOCK"` (`stock = 0`).

---

## 3. Key Interface Actions

### Inventory Dashboard
*   **Compact Stock Grid**: List showing item name, category, current quantity, unit indicator (e.g., "pcs", "meters"), and status badge.
*   **Filter Bar**: Quick filter views to isolate "Low Stock" and "Out of Stock" items.
*   **Adjustment Panel**: A dialog box enabling sellers or admins to manually increment/decrement counts. Requires a mandatory audit reason log (e.g., "damaged in transport", "received vendor supply").

### Supplier Registry
*   **Supplier Directory**: Profile records for material vendors (names, emails, phones, material classifications).
*   **Procurement Records**: Log tracking incoming purchase orders, pending delivery dates, and cost cents per unit to recalculate pricing matrices dynamically.

---

## 4. Definition of Done

The inventory manager module is complete when:

*   [ ] **Feature Complete**: Tracking product counts, material stock yardages, reorder alerts, and supplier profiles is fully functional.
*   [ ] **Accessible**: Adjustment popup modals trap keyboard focus. Data grid columns are keyboard focusable.
*   [ ] **Responsive**: Tables use horizontal scrolling panels on mobile screens `<768px`.
*   [ ] **Tested**: Playwright E2E verifies that decrementing stock below reorder limits triggers alert notifications.
*   [ ] **Loading State**: Displays skeleton grid rows during fetch operations.
*   [ ] **Empty State**: Renders empty ledger illustrations if search queries return zero material items.
*   [ ] **Error State**: Validation displays error alerts if manual stock adjustment inputs are negative.
*   [ ] **Audit Logging**: Stock level adjustments require selecting a reason code and writing notes, logging records to the `AuditLog` table.
*   [ ] **Permission Protected**: Incremental stock adjustments and supplier detail creations are restricted to Admins and Super Admins.
*   [ ] **Performance Verified**: Ledger lists render virtualized row listings for datasets exceeding 100 entries.
