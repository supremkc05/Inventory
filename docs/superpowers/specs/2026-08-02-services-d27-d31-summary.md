# Services layer (D27–D31) — summary

**Date:** 2026-08-02  
**Status:** Done  
**Tests:** `python manage.py test sales.test_vat sales.test_services payments.test_services core.test_money core.test_dates -v 2` → **15 OK**

## Deliverables

| ID | Module | Behavior |
|----|--------|----------|
| **D27** | `sales/vat.py` | `line_amounts` — qty×price, VAT `ROUND_HALF_UP` 2dp, exempt=0 |
| **D28** | `core/dates.py` | AD↔BS via `nepali-datetime`; FY label Shrawan 1–Ashad 31 (`2081/82`) |
| **D29** | `sales/services.py` | `SalesService.create_sale` atomic: stock → invoice lock → items → movements → dues |
| **D30** | `payments/services.py` | `PaymentService.record_payment` — reject overpay; update sale + customer due |
| **D31** | `core/money.py` | `to_decimal` / `to_money` / `to_qty` — **reject float** |

## Usage

```python
from sales.services import SalesService
from payments.services import PaymentService

sale = SalesService.create_sale(
    business=business,
    created_by=user,
    bill_type="abbreviated",
    customer=customer,
    lines=[{"product_id": product.id, "quantity": Decimal("2")}],
    amount_paid=Decimal("0"),
)

PaymentService.record_payment(
    business=business,
    sale=sale,
    amount=Decimal("40.00"),
    method="cash",
    paid_on_ad=date.today(),
    created_by=user,
)
```

## Out of scope

- Credit-note service (later with API)
- ViewSets / OpenAPI (E32+)

## Spec / plan

- `docs/superpowers/specs/2026-08-02-services-d27-d31-design.md`
- `docs/superpowers/plans/2026-08-02-services-d27-d31.md`
