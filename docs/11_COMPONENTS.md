# Component Catalog: JR Control

All views inside JR Control are assembled from these reusable components. This catalog lists the specifications, layout expectations, and visual behaviors of these blocks.

---

## 1. Data & Navigation Display

### DataTable
*   **Purpose**: Renders database records in a dense grid format.
*   **Visual Layout**: Sticky header, thin gray separator borders (`border-b border-neutral-200`), compact vertical padding (`py-2.5`). Clicking rows highlights them and launches a details drawer.
*   **Props**: Columns array, data source, sort key state, loading skeleton triggers.

### Timeline
*   **Purpose**: Visual chronological logs (e.g. lead communication logs, order fulfillment steps).
*   **Visual Layout**: Left-aligned vertical bronze timeline indicator linking circular nodes containing initials and descriptions.

### Kanban Board
*   **Purpose**: Drag-and-drop board for CRM lead pipeline stages.
*   **Visual Layout**: Horizontal columns matching stages (`NEW`, `CONTACTED`, `SCHEDULED`, `COMPLETED`). Custom scrollbars on long lists.

---

## 2. Metrics & Layout

### MetricCard (StatCard)
*   **Purpose**: Renders key performance metrics and sales statistics.
*   **Visual Layout**: White card backdrop, subtle shadow, bronze highlight header label, Outfit display font for primary numbers, and small comparison status labels (e.g. `+12% vs last month` in green text).

### Side Drawer
*   **Purpose**: The default right-aligned slide-out detail view.
*   **Visual Layout**: Slides smoothly from right edge (`translate-x-0`). Locks focus inside the container while open. Click overlay triggers close.

### EmptyState
*   **Purpose**: Visual container displayed when grids or drawers contain no data.
*   **Visual Layout**: Centered icon in Showroom Bronze, bold description, and a clear secondary button trigger (e.g., `"+ Create a Draft"`).

---

## 3. Media & Editors

### ImageUploader
*   **Purpose**: Interactive uploader for catalog swatches and product photos.
*   **Visual Layout**: Dotted border box. Dragging files overlays a gold highlight boundary, showing upload status bar loaders.

### ColorPicker
*   **Purpose**: Finish swatch picker.
*   **Visual Layout**: Selects hex values, rendering immediate swatch previews paired with editable text name fields.

### RichEditor
*   **Purpose**: Text editor for showroom CMS banners and policy pages.
*   **Visual Layout**: Floating formatting bar (Bold, Italic, Lists) that matches visual styles.

### QuoteBuilder
*   **Purpose**: Complex custom calculation layout interface.
*   **Visual Layout**: Splitted workspace: inputs on the left (materials, sizes), dynamic price calculations on the right.

### MediaPicker
*   **Purpose**: Directory-based image selection overlay modal.
*   **Visual Layout**: Grid view of folders and assets, allowing sellers to choose images directly from the Cloudinary CDN.
