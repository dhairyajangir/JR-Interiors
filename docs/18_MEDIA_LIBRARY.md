# Media Library & File System: JR Control

JR Control stores high-resolution showroom photography, client-signed quotation PDFs, fabrication measurements, and custom CAD drawings. This document defines the folder taxonomy, file upload constraints, format compression pipeline, and CDN integration standards.

---

## 1. Media Folder Taxonomy

All digital assets are organized within a structured folder hierarchy inside the Cloudinary or S3 CDN buckets:

```
cdn-root/
│
├── catalog/                       # PUBLIC SHOWROOM IMAGES
│   ├── products/                  # High-res product grid assets
│   └── swatches/                  # Texture swatches (Wood, Metal, Fabric)
│
├── leads/                         # CRM CLIENT ATTACHMENTS
│   ├── [lead-id]/                 # Client room photos, mood boards
│   └── site-measurements/         # On-site verification photos
│
├── specifications/                # INVOICES & DRAWINGS (SECURED)
│   ├── quotations/                # Generated quote PDFs
│   └── cad-designs/               # Architectural CAD drawings (DWG/DXF/PDF)
│
└── system/                        # CORE BRANDING ASSETS
    └── showroom-branding/         # Logo variations, site banners
```

---

## 2. Upload Pipeline & Validation Rules

To prevent server storage exhaustion and keep image loading speeds fast, all files uploaded via the `MediaUploader` component must pass these validation rules:

| Asset Classification | Mimetype Whitelist | Max File Size | Validation Action |
| :--- | :--- | :--- | :--- |
| **Catalog Photos** | `image/jpeg`, `image/png`, `image/webp` | `2 MB` | Auto-resized & converted to WebP/AVIF. |
| **Swatches (Textures)** | `image/png`, `image/webp` | `500 KB` | Checked for aspect ratio (must be 1:1 square). |
| **Client PDFs** | `application/pdf` | `10 MB` | Scanned for malformed file structures. |
| **CAD Documentation** | `application/octet-stream`, `application/dxf` | `25 MB` | Restricted: Upload only allowed by Designer roles. |

---

## 3. Format Compression & Optimization

The upload pipeline executes optimization tasks on the client or via serverless cloud triggers before placing files in storage:

*   **Format Transformation**: Convert all raw images (`.jpg`, `.png`) to `.webp` or `.avif` to reduce file sizes by up to 70%.
*   **Dimensional Constraints**: Max image width for product pages is capped at `1920px`. Images exceeding this limit are scaled down.
*   **Metadata Stripping**: Strip EXIF location and camera tags from uploaded files to ensure security compliance.

---

## 4. Hash-Based File Deduplication

To prevent duplicate uploads from cluttering the CDN, the upload handler runs a deduplication check:
1.  Generate a **SHA-256 hash** of the incoming file buffer on the client or server.
2.  Query the database `MediaAsset` table for a matching file hash.
3.  If a match exists, skip the CDN upload and return the existing asset's storage URL. If no match exists, proceed with the upload and save the new hash record.

---

## 5. Storage Security & CDN Integrations

We split storage into public and private buckets:

### Public CDN (Cloudinary / S3 Public)
*   **Path**: `/catalog/`, `/system/`
*   **Access**: Unrestricted read permissions. Files are cached globally by the CDN network.

### Private Secured S3 Bucket
*   **Path**: `/specifications/`, `/leads/`
*   **Access**: Read operations are forbidden by default. Access is restricted using **signed URLs** with a short expiration lifetime (e.g., 15 minutes). Only authenticated users with matching RBAC roles (Admin, Seller, Accountant) can generate these URLs.
