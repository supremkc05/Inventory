# Product Categories + Images Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Per-store categories (form + manage page) and one optional product image upload.

**Architecture:** Extend existing tenant `Category` API; add `Product.image` with MEDIA serving; wire Products UI + new Categories page; multipart-aware `apiFetch`.

**Tech Stack:** Django/DRF, React/Vite, local MEDIA + Vite `/media` proxy.

---

### Task 1: Backend image + media settings
### Task 2: Category product_count + soft archive
### Task 3: Frontend API clients (categories, multipart products)
### Task 4: Product form + table + filters
### Task 5: Categories page + nav/route
### Task 6: Verify typecheck + API smoke
