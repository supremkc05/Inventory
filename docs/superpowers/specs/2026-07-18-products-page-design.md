# Products page (frontend) — design

**Date:** 2026-07-18  
**Scope:** Frontend-only mock (Approach A + UI Approach 1)  
**Status:** Approved for implementation

## Summary

Products catalog page at `/products` using `DashboardShell`, searchable/filterable table, and overlays for create/edit, adjust stock, and delete/archive — local mock state (same pattern as Sales).

## Layout

1. Toolbar: search + category / VAT / stock / status filters + Add product
2. Table: name, category, SKU, cost, sale, VAT, stock, status, row actions
3. Overlays: ProductForm (create/edit), AdjustStock, DeleteProductDialog

## Rules

- Stock not editable on product form; initial stock on create → movement; Adjust Stock for later changes
- Delete → hard-delete if `!hasTransactions`, else archive (`isActive = false`)
- Mock roles: `owner` | `admin` can mutate; `accountant` read-only
- Single-location stock only (no warehouse breakdown)

## Components

`ProductsPage`, `ProductFilters`, `ProductTable`, `ProductFormOverlay`, `AdjustStockOverlay`, `DeleteProductDialog`  
+ `types/products.ts`, `constants/products.ts`
