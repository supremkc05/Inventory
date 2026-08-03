from decimal import Decimal

from django.test import TestCase

from accounts.models import Business
from inventory.models import Product, StockMovement


class ProductGapTests(TestCase):
    def setUp(self):
        self.business = Business.objects.create(name="Shop A", pan_vat_number="123456789")

    def test_product_has_cost_and_reorder(self):
        product = Product.objects.create(
            business=self.business,
            sku="SKU-1",
            name="Oil",
            selling_price=Decimal("200.00"),
            cost_price=Decimal("150.00"),
            reorder_level=Decimal("10.000"),
        )
        self.assertEqual(product.cost_price, Decimal("150.00"))
        self.assertEqual(product.reorder_level, Decimal("10.000"))

    def test_stock_movement_reasons_aligned(self):
        expected = {"sale", "credit_note", "adjustment", "damage"}
        self.assertEqual(set(StockMovement.Reason.values), expected)
