# Module Spec: Category Taxonomy

## 1. Business Context

The **Category Taxonomy** manages how products are grouped, sorted, and filtered on the public storefront. Because JR Interiors showcases custom design items rather than standard stock retail goods, the categories are partitioned into different classification "kinds" (Rooms, Collections, and Types) to optimize customer exploration.

---

## 2. Taxonomy Kinds

Categories are classified using the `kind` field to determine their location in the storefront navigation hierarchy:

*   **Rooms (`kind = "room"`)**: Core spaces that host designs (e.g., `"Living"`, `"Office"`, `"Dining"`).
*   **Collections (`kind = "collection"`)**: Curated designer lines spanning multiple product categories (e.g., `"Atelier Signage"`, `"Architectural Facades"`, `"Atelier Selections"`).
*   **Types (`kind = "type"`)**: Functional product groupings (e.g., `"Seating"`, `"Tables"`, `"Lighting"`, `"Storage"`).

---

## 3. Category Attributes & Validation Rules

*   **Name**: Display name of the category (e.g., `"Fine Metalwork"`).
*   **Slug**: URL-safe, lowercase identifier (e.g., `"fine-metalwork"`). Automatically generated from the name but editable before saving. Must be unique.
*   **Image URL**: High-resolution cover photo depicting the category's signature look. See [Media Library Spec](../18_MEDIA_LIBRARY.md).
*   **Sort Order**: Integer used to position the category inside navigation menus. Lower numbers float to the top.
*   **Item Count**: Cached counter showing how many active `PUBLISHED` products reference this category, recalculated on product state mutations to avoid database stress.

---

## 4. Key Interface Actions

### Taxonomy Manager Grid
*   A dense list structured by `kind`. Displays category image, name, slug, count of attached items, and sort order.
*   **Reorder Tool**: Simple drag-and-drop or up/down arrow buttons to change `sortOrder` values instantly.
*   **Create Dialog**: Quick popup modal to add a new category, requesting name, kind selection, description, and cover image.
*   **Recalculation Action**: A button to trigger a system-wide count recount to sync `itemCount` caches across database schemas.

---

## 5. Definition of Done

The category taxonomy module is complete when:

*   [ ] **Feature Complete**: Creating new categories, assigning kind selectors, and rearranging sorting orders are fully functional.
*   [ ] **Accessible**: Keyboard reordering triggers using `Ctrl + ArrowUp` and `Ctrl + ArrowDown` rearrange items in the list.
*   [ ] **Responsive**: Grid and list layouts adjust to fit mobile viewport widths `<768px`.
*   [ ] **Tested**: Playwright E2E verifies that changing the category sort order modifies the public storefront navigation listings order.
*   [ ] **Loading State**: Updates and recalculations trigger visual skeleton outlines.
*   [ ] **Empty State**: Displays informational text if a particular category kind (e.g. Collections) contains zero records.
*   [ ] **Error State**: Validation displays error alerts if unique slug constraint check fails.
*   [ ] **Audit Logging**: Creating, modifying, and sorting category items are logged to the `AuditLog` table.
*   [ ] **Permission Protected**: Read-only access for Sellers/Support. Modifying properties or triggers requires Admin or Super Admin privileges.
*   [ ] **Performance Verified**: Item count recount queries execute in under 3 seconds using cached table updates.
