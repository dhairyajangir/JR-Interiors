# Accessibility (a11y) Standards: JR Control

Accessibility is a core requirement, not an afterthought. JR Control must remain fully usable by team members who navigate using keyboard inputs, screen readers, or assistive software. All components must target **WCAG 2.1 Level AA** compliance.

---

## 1. Keyboard Navigation & Focus Management

A user must be able to complete all admin functions (modifying catalog items, assigning leads, calculating quotes) using only a keyboard.

*   **Focus Ring Indicator**: Focusable elements (buttons, inputs, links) must render a distinct focus ring when navigated via keyboard. Disabling the browser's default outline without replacing it is prohibited. Use: `focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none`.
*   **Logical Focus Flow**: Focus transitions must follow the natural page order (top-to-bottom, left-to-right).
*   **Escape Key Escape**: Any overlay components (Side Drawers, Modals, Dropdown Menus) must listen to the `Escape` keyboard event to close the overlay instantly, returning focus to the trigger element that opened it.
*   **Focus Trapping**: Modals and side drawers must implement a focus trap. When active, focus cannot escape the boundaries of the overlay. Navigating using `Tab` must cycle focus only through elements inside the active container.

---

## 2. ARIA Landmarks & Roles

Using correct HTML5 elements is the foundation of structural clarity. Supplement markup with ARIA rules when using custom interactive widgets:

*   **Page Landmarks**: Wrap main layouts inside `<nav>`, `<main>`, `<header>`, and `<footer>` tags.
*   **Custom Widgets**:
    *   *Tabs*: The selector container must use `role="tablist"`. Each tab trigger must use `role="tab"`, specifying `aria-selected` and `aria-controls` pointing to the corresponding tab panel. The content panels must use `role="tabpanel"`.
    *   *Modals*: Modal containers must specify `role="dialog"` or `role="alertdialog"` (for danger prompts), with `aria-modal="true"`.
*   **Dynamic State Tracking**: Update elements to reflect active states using `aria-expanded="true/false"` (for collapsing sidebars or drawers) and `aria-hidden="true/false"` (for background components).

---

## 3. Contrast Standards (WCAG AA/AAA)

To ensure readability under various showroom and office lighting conditions:

*   **Text Contrast**: A minimum contrast ratio of `4.5:1` is maintained for normal body text, and `3:1` for large heading text against white panel backdrops.
*   **Active Accents**: The brand accent elements used for text links or buttons must meet the contrast criteria. Text inside Gold-filled buttons must be high-contrast Black (`#000000`).
*   **Focus Visuals**: Border lines indicating active input focus must stand out clearly against panel backgrounds.

---

## 4. Screen Reader Optimization

*   **Image Alternate Text**: Every image on the storefront and CMS editor must include a descriptive `alt` attribute (e.g., `alt="American Walnut veneer sample showing fine wood grains"`). Decorative-only icons use `aria-hidden="true"`.
*   **Form Association**: Every form input element must have an attached `<label>` element. The association must be declared explicitly using matching `id` and `for` attributes:
    ```html
    <label for="product-price">Product Price (in Cents)</label>
    <input id="product-price" type="number" ... />
    ```
*   **Descriptive Input Errors**: Form fields showing validation errors must append `aria-invalid="true"` and use `aria-describedby` pointing to the specific error text block ID, ensuring screen readers announce the failure when the user moves focus back to the input.
