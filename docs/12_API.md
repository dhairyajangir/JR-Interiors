# API Design Standards: JR Control

All client-server communications inside JR Control—whether executing through standard Next.js API Routes (RESTful) or React Server Actions—must follow these design standards to ensure consistency, type-safety, and predictable error handling.

---

## 1. RESTful API Routes (`/api/v1/...`)

REST routes are used for data exports, third-party integrations (e.g., webhook listeners), or file upload streams.

### HTTP Verb Usage
*   `GET`: Fetch resources. Safe and idempotent. Must not modify database state.
*   `POST`: Create new resources (e.g., `/api/v1/leads`).
*   `PATCH`: Partial updates. Used to toggle status attributes or adjust single columns.
*   `DELETE`: Hard or soft deletion of database resources.

### Pagination Parameters
All API routes returning arrays must support pagination.
*   **Request Query Parameters**: `page` (default: `1`), `limit` (default: `25`, max: `100`).
*   **Standard Envelope with Pagination**:
    ```json
    {
      "success": true,
      "data": [...],
      "pagination": {
        "total": 1420,
        "page": 1,
        "limit": 25,
        "pages": 57
      },
      "error": null
    }
    ```

---

## 2. Next.js Server Actions Standards

Server Actions are preferred for form submissions and direct database write operations in Next.js.

### Standard Response Envelope
All Server Actions must return a standardized object containing either a typed result or a serialized error object. Raising uncaught exceptions directly to the client is prohibited.

```typescript
export type ActionResponse<T> = 
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string; details?: any } };
```

### Action Implementation Pattern
```typescript
export async function updateProductStockAction(
  productId: string, 
  newStock: number
): Promise<ActionResponse<Product>> {
  try {
    // 1. Authenticate & Authorize
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return {
        success: false,
        data: null,
        error: { code: "UNAUTHORIZED", message: "Privileged action. Update rejected." }
      };
    }

    // 2. Validate Inputs
    const validatedData = z.number().nonnegative().parse(newStock);

    // 3. Database operation
    const product = await db.product.update({
      where: { id: productId },
      data: { stock: validatedData }
    });

    // 4. Log Action
    await logAuditAction(session.userId, "CATALOG_PRODUCT_STOCK_UPDATE", "Product", productId);

    return { success: true, data: product, error: null };
  } catch (error) {
    return serializeError(error);
  }
}
```

---

## 3. Standard System Error Catalog

To enable precise frontend error handling, the system uses standardized error codes:

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | Invalid or expired session cookie. |
| `FORBIDDEN` | 403 | User role lacks sufficient permissions. |
| `INVALID_PAYLOAD` | 422 | Zod schema parse failed during validation check. |
| `ENTITY_NOT_FOUND` | 404 | Database lookup failed for target CUID ID. |
| `RATE_LIMIT_EXCEEDED`| 429 | IP limit pool depleted in Redis. |
| `CONFLICT` | 409 | Duplicate unique constraint collision (e.g. slug). |
| `INTERNAL_ERROR` | 500 | Unhandled database or API exception. |
