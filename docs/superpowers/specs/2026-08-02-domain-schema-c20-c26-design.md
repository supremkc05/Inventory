# Domain schema MVP (C20–C26) — design

**Date:** 2026-08-02  
**Status:** Approved (user: perform all)

## Scope

Lean MVP tables only (no Vendor/Purchase/Warehouse):

| ID | Model |
|----|--------|
| C20 | `Customer` (parties) |
| C21 | `Sale`, `SaleItem` (sales) |
| C22 | `CreditNote`, `CreditNoteItem` (sales) |
| C23 | `Payment` → Sale (payments) |
| C24 | `DocumentCounter` (sales) |
| C25 | Product `cost_price`, `reorder_level`; StockMovement reasons unchanged (already aligned) |
| C26 | Indexes + unique constraints per projectfile |

## Rules

- Money: `DecimalField(max_digits=12, decimal_places=2)` (qty up to 3 dp where needed)
- Soft archive: `Customer.is_active`, `Product.is_active`
- VAT snapshots on line items
- No discount fields
- `DocumentCounter` unique `(business, fiscal_year, document_type)` for `select_for_update` later (D29)

## Non-goals

- SalesService / PaymentService (D27–D30)
- API ViewSets (E32)
