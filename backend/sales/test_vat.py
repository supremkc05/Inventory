from decimal import Decimal

from django.test import SimpleTestCase

from sales.vat import line_amounts


class VatServiceTests(SimpleTestCase):
    def test_taxable_line_rounds_vat_to_2dp(self):
        result = line_amounts(
            quantity=Decimal("3"),
            unit_price=Decimal("10.00"),
            vat_applicable=True,
            vat_rate=Decimal("13.00"),
        )
        self.assertEqual(result.subtotal, Decimal("30.00"))
        self.assertEqual(result.vat, Decimal("3.90"))
        self.assertEqual(result.total, Decimal("33.90"))

    def test_exempt_line_vat_zero(self):
        result = line_amounts(
            quantity=Decimal("2"),
            unit_price=Decimal("50.00"),
            vat_applicable=False,
            vat_rate=Decimal("13.00"),
        )
        self.assertEqual(result.subtotal, Decimal("100.00"))
        self.assertEqual(result.vat, Decimal("0.00"))
        self.assertEqual(result.total, Decimal("100.00"))

    def test_rejects_float_inputs(self):
        with self.assertRaises(TypeError):
            line_amounts(1.0, Decimal("10"), True, Decimal("13"))
