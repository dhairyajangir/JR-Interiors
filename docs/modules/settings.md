# Module Spec: System Configuration & Audit Settings

## 1. Business Context

The **Settings Module** manages global parameters, integration API keys, employee directories, and security profiles. Accessible only by the Super Admin, this panel contains critical configurations that affect the monorepo's mailers, SMS gateways, and operational access parameters.

---

## 2. Admin Settings Categories

### A. Team Access & Account Directory
*   **Employee Grid**: View list of all users with roles `"SELLER"` or `"ADMIN"`. See [RBAC Matrix](../14_ROLES.md).
*   **Privilege Toggles**: Promote/demote user roles. Can instantly revoke user access by toggling status to `"suspended"`.
*   **MFA Management**: Reset user TOTP keys if an employee loses their authenticator device. See [Security Spec](../03_SECURITY.md).

### B. Audit Trail Log (Inspector)
*   **Activity Ledger**: Dense list showing logs from `AuditLog` table.
*   **Filters**: Sort by User, Action type (e.g., `AUTH_LOGIN_FAIL`), and Date window.
*   **Details Drawer**: Clicking a log item shows a visual diff of the modification payload. See [UX Guidelines](../10_UX_GUIDELINES.md).

### C. System Integration Gateways
Forms to configure API tokens and configurations:
*   **Mail Server (SMTP)**: Host, Port, Username, Password, and Sender Email used to dispatch invoice PDFs and verification codes.
*   **WhatsApp CRM API**: Integration key to automate dispatch of consultation follow-ups. See [Notifications Spec](../17_NOTIFICATIONS.md).
*   **Razorpay Credentials**: Live/Test keys and webhook validation secrets.

---

## 3. UI Elements & Validation

*   **Safety Overrides**: Modifying SMTP keys, Razorpay secrets, or toggling user roles requires entering the current user's password to prevent session-hijack exploits.
*   **Immediate Revocation**: De-activating an account immediately triggers a database update clearing active session versions, invalidating existing JWT tokens at the Edge.

---

## 4. Definition of Done

The system settings configuration module is complete when:

*   [ ] **Feature Complete**: Employee account rosters, API gateway settings forms, password lock overrides, and audit trail search grids function correctly.
*   [ ] **Accessible**: Sensitive credential inputs use hidden bullet characters with "Show/Hide" toggle buttons. Form elements are keyboard focusable.
*   [ ] **Responsive**: Form grids align nicely, wrapping to fit vertical columns on screens `<768px`.
*   [ ] **Tested**: Playwright E2E verifies that changing settings requires password re-entry and immediately invalidates active sessions for modified users.
*   [ ] **Loading State**: Displays skeleton inputs when settings configurations are fetched.
*   [ ] **Empty State**: Displays clear visual placeholders if the search query for the audit log returns zero logs.
*   [ ] **Error State**: Displays error message overlays when credential testing hooks fail.
*   [ ] **Audit Logging**: Every role promote/demote action, account suspension, key update, or audit search is logged in the `AuditLog` table.
*   [ ] **Permission Protected**: Access is restricted strictly to Super Admin roles. Other roles are immediately blocked at the Edge.
*   [ ] **Performance Verified**: Audit log filters return matching rows in under 1 second.
