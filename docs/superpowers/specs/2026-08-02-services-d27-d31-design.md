# Services layer (D27–D31) — design

**Date:** 2026-08-02  
**Status:** Approved (user: “need this”)  
**Scope:** Sale create only (no credit-note service)

## Layout

| ID | Module |
|----|--------|
| D27 | `sales/vat.py` |
| D28 | `core/dates.py` |
| D29 | `sales/services.py` (`SalesService`) |
| D30 | `payments/services.py` (`PaymentService`) |
| D31 | `core/money.py` — Decimal-only helpers used by all |

## Rules

- VAT: `subtotal = qty × price` → `vat = ROUND_HALF_UP(subtotal × rate, 2)`; exempt → 0
- FY: Shrawan 1 (BS month 4) – Ashad 31 (BS month 3); label `"YYYY/YY"`
- Sale atomic: stock check → invoice lock → Sale/Items → StockMovement + Stock → dues
- Payment: never amount > `sale.amount_due`; update sale + customer due atomically
- Reject `float` for money/qty inputs
