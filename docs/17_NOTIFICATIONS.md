# Notification System: JR Control

JR Control communicates with sellers, administrators, and clients via distinct channels. This document details the notification types, integration gateways, and failure queue guidelines.

---

## 1. Notification Types & Channels

```
                 ┌──> In-App Toast (Immediate UI feedback)
                 ├──> System Email (Invoices, Approvals, Admin Alerts)
[ Event Trigger ]├──> WhatsApp Template (Seller CRM alerts, Client reminders)
                 └──> Audit Log Log (Append-only security trace)
```

### In-App Toasts (UI Notifications)
Toasts provide immediate feedback on user actions (e.g., `"Product published successfully"`, `"Quotation compilation failed"`).
*   **Aesthetics**: Positioned in the top-right corner. Toast blocks have soft light backgrounds with colored left borders (green, yellow, red) corresponding to status.
*   **Behavior**: Non-blocking. Toast alerts disappear automatically after 4000ms. If an error toast is spawned, a close button (`x`) is included to let users dismiss it manually.

### System Emails
System emails handle transactional workflows (sending invoice PDFs, dispatching password reset links, notifying admins of low inventory stock).
*   **Mailer Service**: Handled via standard SMTP connections routed to a delivery service.
*   **HTML Styling**: Email templates use responsive HTML with inline CSS, utilizing JR Interiors' luxury color scheme (gold headers, slate gray highlights, Inter typography).

### Automated WhatsApp Alerts
WhatsApp is the primary CRM channel for customer engagement.
*   **Sellers Alert**: When a new lead is assigned to a seller, the system dispatches a WhatsApp notification containing the client's name, project details, and a click-to-open link.
*   **Client Reminders**: Automatic follow-up templates are dispatched to clients to confirm scheduled consultation slots or send links to sign custom quotation PDFs.
*   **Compliance Rules**: All WhatsApp outbound templates must be pre-approved inside the WhatsApp Business Manager portal before being hooked to the backend code.

---

## 2. Integration Gateways Configuration

All notification keys and connection targets are configured inside the Super Admin Settings dashboard, mapping back to these environment variables:

| Gateway | Env Parameter | Purpose |
| :--- | :--- | :--- |
| **SMTP Mailer**| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Relays system transactional emails and PDF spec sheets. |
| **WhatsApp API**| `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_ID` | Sends templates to customers and assign notifications to sellers. |
| **Webhooks** | `NOTIFICATION_WEBHOOK_URL` | Optional Slack or Discord feed listener to log daily sales dashboards. |

---

## 3. Failure Handling & Outbox Pattern

To prevent notification failures (e.g., SMTP server timeouts, WhatsApp API rate limits) from blocking database transactions:

1.  **Non-Blocking Execution**: Outbound notifications are executed asynchronously using server background workers (e.g., Vercel background tasks or message queues) rather than blocking the active HTTP response thread.
2.  **Transactional Outbox Pattern**: When a notification event occurs, the record is saved to an internal `Outbox` table within the same database transaction. A cron runner polls the outbox, dispatches the messages, and updates status flags (`PENDING` ➔ `SENT`). If a delivery attempt fails, the runner retry-schedules the task with exponential backoff up to 3 times before logging a critical error.
