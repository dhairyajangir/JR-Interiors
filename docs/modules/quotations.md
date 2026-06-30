# Module Spec: Custom Quotations Engine

## 1. Business Context

Bespoke millwork, modular kitchens, and custom metal fixtures cannot be priced at flat retail rates. The **Quotation Engine** replaces traditional Excel calculation models with a type-safe digital compiler. It calculates material costs, sizing multipliers, customization markups, and shipping overheads, ensuring sellers generate accurate, approved margin quotes.

---

## 2. Interactive Quotation Compiler

The quotation compiler is a multi-step wizard interface designed for desktop use:

### Step 1: Base Configuration
*   Select target customer profile (CRM lookup).
*   Add baseline product configuration from catalog.

### Step 2: Dimensions & Calculations
*   Sellers input physical specs: **Width**, **Height**, and **Depth** (in millimeters).
*   Select base **Material** (e.g., MDF, Plywood, Solid Oak) and **Finish** (Veneer, PU Paint, Metal powder-coating).

### Step 3: Margin Adjustments & Costing Matrix
```
Total Price = [Base Product Price + (Volume Multiplier * Material Cost) + Custom Modification Markup] * Seller Margin Multiplier + Tax + Shipping
```
*   **Base Material Costs**: Managed dynamically by system configuration.
*   **Sizing Multipliers**: Calculates price increases based on total surface area or volume compared to catalog defaults.
*   **Custom Adjustments**: Manual cost overrides (e.g., adding brass hardware) with mandatory documentation notes.
*   **Seller Margin Rules**: Sellers can apply margin adjustments within predefined boundaries (e.g., +10% to +35%). Adjustments outside this range trigger warning prompts requiring Admin override keys.

---

## 3. PDF Specification Sheet Standards

The generated PDF is the client-facing sales document. It must adhere to luxury brand presentation guidelines:

*   **Header**: High-resolution JR Interiors brand logo, invoice/quote tracking number, expiration date, and assigned seller contact details.
*   **Itemized Specifications**: Clean table detailing sizing dimensions, selected finishes, fabric swatches, and item costs.
*   **Visual Board**: Embeds primary product catalog images and finish hex swatches directly in the PDF.
*   **Legal terms**: Integrates standard deposit rules (e.g., "50% advance to start production, 50% prior to dispatch"), lead-time estimates, and warranty conditions. See [CMS Spec](./cms.md).

---

## 4. Definition of Done

The custom quotation engine module is complete when:

*   [ ] **Feature Complete**: Dynamic dimensional matrix inputs recalculate prices on the client. Generates a download-ready PDF spec sheet.
*   [ ] **Accessible**: Multi-step configuration forms are keyboard focusable. Form inputs have labels.
*   [ ] **Responsive**: Form blocks stack cleanly on tablet displays, and calculations panel remains readable.
*   [ ] **Tested**: Jest/Vitest unit tests verify 100% of calculations, multipliers, margins, and tax logic in `lib/quotations.ts`. Playwright E2E verifies PDF generation.
*   [ ] **Loading State**: Displays loading overlays when generating and compiling PDF layouts.
*   [ ] **Empty State**: Renders clear visual placeholders if custom adjustments lists contain zero items.
*   [ ] **Error State**: Triggers error tags if dimension inputs exceed limits (e.g., width > 6000mm) or margin override prompts if margins exceed limits.
*   [ ] **Audit Logging**: Generating quotes, downloading PDFs, and applying margin override keys are logged to the `AuditLog` table.
*   [ ] **Permission Protected**: Configuring raw base material costs is restricted to Super Admins. Compiling drafts is accessible to Admins and Sellers.
*   [ ] **Performance Verified**: PDF specifications compile and download in under 3 seconds.
