# UX Guidelines: JR Control

To maintain a consistent, high-fidelity experience across JR Control, all interfaces must comply with these strict User Experience (UX) guidelines. They establish how users navigate, submit data, recover from errors, and manipulate items.

---

## 1. Interaction Rules & Conventions

### Tables Always Open Drawers, Never Navigate
When a user clicks on a row in a data-dense grid (e.g., Lead list, Product list, Orders table):
*   **Behavior**: A slide-over drawer transitions in from the right viewport edge.
*   **Reasoning**: Users must not lose their active search queries, scroll position, or pagination filters. Full-page navigation for simple detail checks is prohibited.

### Navigation Hierarchy Limits
The system strictly enforces a maximum of **three navigation levels** to prevent user disorientation:
1.  **Level 1 (Sidebar Navigation)**: Global route changes (e.g. Catalog, CRM, Settings).
2.  **Level 2 (Page Tabs)**: Segments workspaces within a single route (e.g. Products list vs. Moderation Queue).
3.  **Level 3 (Filter Options)**: Multi-select tags or dropdown groupings that alter listing datasets.

### Spotlight Search Base
Every primary listing page or dashboard grid must render a search bar at its top-left baseline. Users should be able to query the list immediately upon load.

---

## 2. Buttons & Actions Standards

### The Single Primary Action Rule
Only **one primary button** (Atelier Gold background fill) is permitted per viewport page.
*   **Placement**: Positioned strictly in the top-right Action Zone of the header.
*   **Alternative Paths**: Secondary options (e.g. "Cancel", "Export CSV") must be rendered using outlines or text-link buttons.

### Safe Overlay Limits
To avoid modal visual fatigue, JR Control prohibits nesting modals:
*   **Constraint**: No overlay dialog (modal) may spawn a secondary modal on top of itself.
*   **Implementation**: If a modal action requires secondary confirmation (e.g., confirming a deletion inside an edit modal), display an inline caution alert banner with a checkbox check directly inside the active modal instead of popping up a new window.

### Destructive Deletion Verification
All destructive, non-recoverable actions (deleting catalog drafts, removing custom integrations) require a center-positioned confirmation dialog. The button that executes the action must be labeled explicitly (e.g., `"Yes, Delete Draft"`) and colored in Danger Crimson.

---

## 3. Form States & Auto-saving

*   **Autosave Drafts**: Long-form editors (e.g., compiling quotations, writing CMS policies) must automatically save progress to local storage or an asynchronous database draft state every 30 seconds. If a user accidentally closes their browser tab or clicks away, the form reloads their draft on return, showing a banner: `"Restored from unsaved draft."`
*   **Form Errors**: Validation checks run instantly on field focus loss (`onBlur`). Do not wait for the user to click the final submit button to announce that a field format is invalid.

---

## 4. Keyboard Shortcuts

Power users (Sellers, Admins) must be able to perform regular tasks rapidly using keyboard shortcuts:

| Shortcut Trigger | Action Executed | Scope |
| :--- | :--- | :--- |
| `Ctrl+K` / `Cmd+K` | Open Spotlight Command Palette | Global |
| `Esc` | Close active modal, drawer, or dropdown menu | Global |
| `Ctrl+S` / `Cmd+S` | Trigger manual draft save | Active Form |
| `Alt+N` | Create new item (e.g. Log Lead, New Product) | Active Module |
