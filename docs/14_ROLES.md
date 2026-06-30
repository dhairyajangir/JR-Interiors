# Role-Based Access Control (RBAC): JR Control

This document defines the roles, privilege hierarchies, and permission matrix applied across JR Control. RBAC checks are executed at the Edge (Next.js middleware), inside Next.js Server Components, and within Server Actions before database writes.

---

## 1. System Role Definitions

*   **Super Admin**: The business owner or system administrator. Inherits unrestricted read/write access. Can override price boundaries, adjust SMTP credentials, view company financial dashboards, and manage employee accounts.
*   **Admin**: Operations and showroom managers. Responsible for catalog moderation, lead assignments, and CMS content updates. Cannot edit system integration keys or delete seller profiles.
*   **Seller**: Sales representatives. Focused on the CRM Kanban board, editing customer notes, and compiling custom quotation drafts. Can only view catalog items and their assigned leads/quotes.
*   **Designer**: Design coordinators. Access to product upload forms and media libraries to configure wood veneer maps, finishes, and CAD layout files.
*   **Accountant**: Financial auditor. Access to payment ledgers, invoice logs, completed order metrics, tax summaries, and margins. No write access to CRM or catalog assets.
*   **Support / Installer**: Read-only field agents. Access to site address records, client phone numbers, and design measurements checklists on delivery dates.

---

## 2. Feature & Permission Matrix

| Feature Module | Super Admin | Admin | Seller | Designer | Accountant | Support |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **User Directory (Promote/Demote)** | Write | Denied | Denied | Denied | Denied | Denied |
| **System Settings (SMTP/MFA Keys)** | Write | Denied | Denied | Denied | Denied | Denied |
| **Financial Dashboards (Margins)** | Read | Denied | Denied | Denied | Read | Denied |
| **Audit Logs Viewer** | Read | Denied | Denied | Denied | Denied | Denied |
| **Approve Catalog Uploads** | Write | Write | Denied | Denied | Denied | Denied |
| **Upload Product Drafts** | Write | Write | Write | Write | Denied | Denied |
| **Assign CRM Leads** | Write | Write | Denied | Denied | Denied | Denied |
| **Log CRM Notes / Pipeline Drag** | Write | Write | Write* | Denied | Denied | Denied |
| **Override Quote Margin Bounds**| Write | Denied | Denied | Denied | Denied | Denied |
| **Draft Quotations** | Write | Write | Write | Denied | Denied | Denied |
| **Override Payment Status** | Write | Write | Denied | Denied | Write | Denied |
| **Read Inventory Stocks** | Read | Read | Read | Read | Read | Read |
| **Adjust Stock Count Ledger** | Write | Write | Denied | Denied | Denied | Denied |
| **Read Client Address / Specs** | Read | Read | Read | Read | Read | Read |

*\*Note: Sellers can only edit CRM notes and drag pipeline cards for leads explicitly assigned to their User ID.*

---

## 3. Enforcement Policies & Validation Layers

To prevent authorization bypass exploits, checks are executed at multiple layers:

### Layer 1: Next.js Edge Middleware
*   Evaluates the user's role cached inside the secure session cookie.
*   Intercepts requests and immediately redirects unauthorized access attempts to a `/403` forbidden screen.

### Layer 2: Server Component Rendering
*   Determines UI availability based on active role profile. For example, the settings sidebar link or "Approve Product" buttons are omitted from the DOM when rendered for a Seller.

### Layer 3: Server Action Verification (Critical Boundary)
Every database mutation check must query the user's session role on the server before writing changes:

```typescript
// Example verification inside Server Action
export async function approveProductAction(productId: string) {
  const session = await getSession();
  
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    throw new Error("Unauthorized action. Mutation rejected.");
  }

  return db.product.update({
    where: { id: productId },
    data: { status: 'PUBLISHED' }
  });
}
```
