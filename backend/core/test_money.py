from decimal import Decimal

from django.test import SimpleTestCase

from core.money import to_decimal, to_money, to_qty


class MoneyHelperTests(SimpleTestCase):
    def test_rejects_float(self):
        with self.assertRaises(TypeError):
            to_money(1.5)
        with self.assertRaises(TypeError):
            to_qty(1.5)
        with self.assertRaises(TypeError):
            to_decimal(0.1)

    def test_money_quantizes_half_up(self):
        self.assertEqual(to_money(Decimal("1.005")), Decimal("1.01"))
        self.assertEqual(to_money("10"), Decimal("10.00"))

    def test_qty_three_dp(self):
        self.assertEqual(to_qty("1.2345"), Decimal("1.235"))
