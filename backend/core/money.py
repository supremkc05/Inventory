from decimal import ROUND_HALF_UP, Decimal
from typing import Union

NumberLike = Union[Decimal, int, str]

_MONEY = Decimal("0.01")
_QTY = Decimal("0.001")


def to_decimal(value: NumberLike) -> Decimal:
    if isinstance(value, float):
        raise TypeError("float is not allowed; use Decimal for money/quantity")
    if isinstance(value, Decimal):
        return value
    return Decimal(value)


def to_money(value: NumberLike) -> Decimal:
    return to_decimal(value).quantize(_MONEY, rounding=ROUND_HALF_UP)


def to_qty(value: NumberLike) -> Decimal:
    return to_decimal(value).quantize(_QTY, rounding=ROUND_HALF_UP)
