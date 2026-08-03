from dataclasses import dataclass
from decimal import Decimal

from core.money import to_decimal, to_money, to_qty


@dataclass(frozen=True)
class LineAmounts:
    subtotal: Decimal
    vat: Decimal
    total: Decimal


def line_amounts(
    quantity,
    unit_price,
    vat_applicable: bool,
    vat_rate,
) -> LineAmounts:
    """qty × price → round VAT only to 2dp; exempt lines = 0."""
    qty = to_qty(quantity)
    price = to_money(unit_price)
    rate = to_decimal(vat_rate)

    subtotal = to_money(qty * price)
    if not vat_applicable:
        vat = Decimal("0.00")
    else:
        # rate stored as percent (13.00), not fraction
        vat = to_money(subtotal * rate / Decimal("100"))
    total = to_money(subtotal + vat)
    return LineAmounts(subtotal=subtotal, vat=vat, total=total)
