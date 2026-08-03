# Domain schema MVP (C20–C26) — summary

**Date:** 2026-08-02  
**Status:** Done  
**Tests:** `python manage.py test parties sales payments inventory -v 2` → **10 OK**

## Deliverables

| ID | What shipped |
|----|----------------|
| **C20** | `parties.Customer` — name, phone, optional PAN, address, `current_due_balance`, soft archive `is_active` |
| **C21** | `sales.Sale` + `SaleItem` — bill type, FY, invoice #, AD/BS dates, money totals, line VAT snapshots |
| **C22** | `sales.CreditNote` + `CreditNoteItem` — own FY number series + VAT snapshots |
| **C23** | `payments.Payment` — FK → `Sale` (+ optional customer), amount, method, `paid_on_ad` |
| **C24** | `sales.DocumentCounter` — unique `(business, fiscal_year, document_type)` + `allocate_next()` with `select_for_update` |
| **C25** | `Product.cost_price`, `Product.reorder_level`; `StockMovement` reasons already `sale` / `credit_note` / `adjustment` / `damage` |
| **C26** | Indexes on business + hot filters; uniques on Sale invoice, CreditNote number, DocumentCounter |

## Migrations

- `parties/0001_initial.py`
- `sales/0001_initial.py`
- `payments/0001_initial.py`, `0002_initial.py`
- `inventory/0002_product_cost_price_product_reorder_level_and_more.py`

## Key constraints

- Sale: unique `(business, fiscal_year, invoice_number)` — Tax Invoice & Abbreviated share one sequence
- CreditNote: unique `(business, fiscal_year, credit_note_number)`
- DocumentCounter: unique `(business, fiscal_year, document_type)` (`invoice` | `credit_note`)

## Money / tenancy notes

- All money fields: `DecimalField(max_digits=12, decimal_places=2)` (qty: 3 dp)
- Domain models carry `business` FK for tenant scoping (same pattern as inventory)
- Soft archive: Customer / Product via `is_active` (no hard delete of parties with history)

## Explicitly not in this slice

- `SalesService` / `PaymentService` / VAT rounding helpers → **D27–D31**
- ViewSets / OpenAPI → **E32+**

## Files

- Models: `backend/parties/models.py`, `backend/sales/models.py`, `backend/payments/models.py`, `backend/inventory/models.py`
- Design: `docs/superpowers/specs/2026-08-02-domain-schema-c20-c26-design.md`
