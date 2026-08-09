# Per-store product categories + single product image

**Date:** 2026-08-09  
**Status:** Approved for implementation  
**Goal:** Each business manages its own product categories and can attach one optional photo per product.

## Decisions

| Topic | Choice |
|-------|--------|
| Category management | Quick-add on product form **and** Manage Categories page |
| Images | One optional photo per product (upload / replace / remove) |
| Category required? | No — products may be Uncategorized |
| Storage | Django `ImageField` + local `MEDIA` (S3 later) |

## Data & API

### Categories
- Existing tenant-scoped `Category` (`business` + unique `name`). Soft-archive via `is_active`.
- Endpoints: `GET/POST /api/v1/categories/`, `PATCH/DELETE …/{id}/` (DELETE soft-archives).
- List includes `product_count`. Archived categories hidden from product form picker; still visible on manage page.

### Products — image
- Add nullable `image` (`ImageField`, upload_to `products/<business_id>/…`).
- Accept JPEG/PNG/WebP, max 2 MB.
- Create/update support `multipart/form-data`. JSON still works when no file.
- Response field `image_url` (absolute URL). Clear with `clear_image=true` (multipart) or empty.
- Dev: `MEDIA_URL` + Vite proxy `/media` → Django.

### Product ↔ category
- `category` optional FK id (or null).
- Form “new category”: `POST /categories/` then attach id on save.

## UI

### Product form
- Category select: Uncategorized + active store categories + “+ New category…”
- Image: preview, choose/replace/remove.
- Filters/table use live categories; thumbnail column.

### Manage categories (`/categories`)
- Nav entry near Products.
- List name, product count, status; add / rename / archive.
- Owner/admin write; same permission pattern as products.

### Sales
- Unchanged for this pass.

## Errors & limits
- Duplicate category name → field error on `name`.
- Oversized / wrong type image → 400 with clear detail.
- Cross-tenant category id rejected by existing tenant validation.

## Out of scope
- Multi-image gallery, image CDN/S3, nested category trees in UI, category required for tax invoices.
