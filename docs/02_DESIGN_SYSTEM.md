# Design System: JR Control

## 1. Visual Philosophy & Theme

JR Control is styled as a **premium, light-first digital atelier**. Rather than mimicking generic dark-mode dashboards, it emulates the clean, bright, and physical showroom experience of JR Interiors. The visual tone is inspired by software leaders like Stripe, Linear, and Notion—clean, highly legible, structurally balanced, and elegant.

The design utilizes a **Warm Ivory Canvas** background with **Pure White Card Panels**, defined by clean borders, subtle shadows, and warm metallic accents (bronze and gold) that highlight active states. A secondary dark mode is optional, but the default, verified theme is Light.

---

## 2. Color Palette (HSL System)

The light-first color variables are defined to enforce visual continuity and contrast safety:

### Core Canvas & Panels
*   **Showroom Ivory (`--bg-base`)**: `hsl(40, 20%, 97%)` / `#F7F6F2`. The foundational canvas background.
*   **Atelier White (`--bg-panel`)**: `hsl(0, 0%, 100%)` / `#FFFFFF`. Used for card layers, table surfaces, and sidebar panels.
*   **Muted Separator (`--border-muted`)**: `hsl(40, 10%, 90%)` / `#EAE7E1`. Used for card margins and column lines.
*   **Heavy Divider (`--border-heavy`)**: `hsl(40, 10%, 82%)` / `#D4CECE`. Used for form input borders and headers.

### Brand Metal Accents
*   **Showroom Bronze (`--color-bronze`)**: `hsl(28, 38%, 43%)` / `#9C6644`. The primary brand visual color used for secondary borders, text links, and icons.
*   **Atelier Gold (`--color-gold`)**: `hsl(43, 60%, 53%)` / `#D4AF37`. Used to highlight active nav selection tags, active filters, and positive ratings.

### Text Hierarchy Colors
*   **Carbon Primary (`--text-primary`)**: `hsl(0, 0%, 12%)` / `#1F1F1F`. Standard body copy, labels, and table inputs.
*   **Slate Secondary (`--text-secondary`)**: `hsl(0, 0%, 45%)` / `#737373`. Used for helper texts and column headers.

### Status Indicators
*   **Success (Emerald)**: Text `hsl(142, 60%, 35%)`, Border `hsl(142, 60%, 82%)`, Background `hsla(142, 60%, 96%, 0.5)`.
*   **Warning (Amber)**: Text `hsl(38, 92%, 40%)`, Border `hsl(38, 92%, 82%)`, Background `hsla(38, 92%, 96%, 0.5)`.
*   **Error (Crimson)**: Text `hsl(0, 84%, 50%)`, Border `hsl(0, 84%, 85%)`, Background `hsla(0, 84%, 97%, 0.5)`.

---

## 3. Typography & Hierarchy

Font selections emphasize geometry and readability:

*   **Display / Headings**: `Outfit`, sans-serif. Sleek, high-end architectural layout.
*   **Body / Data**: `Inter`, sans-serif. Highly legible at small font sizes inside data grids.

```css
h1 { font-family: 'Outfit', sans-serif; font-size: 2.00rem; font-weight: 600; letter-spacing: -0.01em; color: var(--text-primary); }
h2 { font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 500; color: var(--text-primary); }
body { font-family: 'Inter', sans-serif; font-size: 0.875rem; font-weight: 400; line-height: 1.5; color: var(--text-primary); }
```

---

## 4. Cards & Drop Elevations

Instead of relying on borders alone, elements are structured using subtle drop-shadow elevations against the Showroom Ivory base:

*   **Card Primitives**:
    *   Background: Pure White (`#FFFFFF`).
    *   Border: `1px solid var(--border-muted)`.
    *   Corners: Border radius is fixed at `6px` (`rounded-md`).
*   **Shadow Elevation**:
    *   `token.shadow.sm` (Standard card): `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);`
    *   `token.shadow.md` (Active popups/drawers): `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03), 0 10px 15px -3px rgba(0, 0, 0, 0.05);`

---

## 5. UI Layout Conventions

*   **Page Intent Zone**: Every page starts with a clear description and title, paired with a right-aligned Primary action.
*   **Sidebar Navigation**: Left-aligned, collapsible sidebar set in an Ivory-tint panel (`#F4F2EB`).
*   **Detail Drawer**: Standardized right slide-over panel. Triggers on table row clicks, keeping context intact without full page re-routings. See [UX Guidelines](./10_UX_GUIDELINES.md) for behavior specifications.
