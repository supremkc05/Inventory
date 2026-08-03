from datetime import date
from decimal import Decimal

from django.test import TestCase

from accounts.models import Business, User
from inventory.models import Product, Stock, StockMovement
from parties.models import Customer
from sales.models import DocumentCounter, Sale
from sales.services import InsufficientStockError, SalesService


class SalesServiceTests(TestCase):
    def setUp(self):
        self.business = Business.objects.create(name="Shop A", pan_vat_number="123456789")
        self.user = User.objects.create_user(
            username="owner1",
            email="owner1@example.com",
            password="pass12345",
            business=self.business,
            role=User.Role.OWNER,
        )
        self.customer = Customer.objects.create(business=self.business, name="Buyer")
        self.product = Product.objects.create(
            business=self.business,
            sku="SKU-1",
            name="Rice",
            selling_price=Decimal("100.00"),
            vat_applicable=True,
            vat_rate=Decimal("13.00"),
        )
        Stock.objects.create(business=self.business, product=self.product, quantity=Decimal("10.000"))

    def test_create_sale_atomic_happy_path(self):
        sale = SalesService.create_sale(
            business=self.business,
            created_by=self.user,
            bill_type=Sale.BillType.TAX_INVOICE,
            customer=self.customer,
            lines=[{"product_id": self.product.id, "quantity": Decimal("2")}],
            amount_paid=Decimal("0"),
            date_ad=date(2024, 7, 16),
        )
        self.assertEqual(sale.invoice_number, 1)
        self.assertEqual(sale.fiscal_year, "2081/82")
        self.assertEqual(sale.date_bs, "2081-04-01")
        self.assertEqual(sale.subtotal, Decimal("200.00"))
        self.assertEqual(sale.vat_total, Decimal("26.00"))
        self.assertEqual(sale.grand_total, Decimal("226.00"))
        self.assertEqual(sale.amount_due, Decimal("226.00"))
        self.assertEqual(sale.items.count(), 1)

        stock = Stock.objects.get(product=self.product)
        self.assertEqual(stock.quantity, Decimal("8.000"))
        self.assertEqual(
            StockMovement.objects.filter(
                product=self.product,
                reason=StockMovement.Reason.SALE,
            ).count(),
            1,
        )
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.current_due_balance, Decimal("226.00"))
        counter = DocumentCounter.objects.get(
            business=self.business,
            fiscal_year="2081/82",
            document_type=DocumentCounter.DocumentType.INVOICE,
        )
        self.assertEqual(counter.next_number, 2)

    def test_insufficient_stock_raises(self):
        with self.assertRaises(InsufficientStockError):
            SalesService.create_sale(
                business=self.business,
                created_by=self.user,
                bill_type=Sale.BillType.ABBREVIATED,
                lines=[{"product_id": self.product.id, "quantity": Decimal("99")}],
                amount_paid=Decimal("0"),
                date_ad=date(2024, 7, 16),
            )
        self.assertEqual(Sale.objects.count(), 0)
        self.assertEqual(Stock.objects.get(product=self.product).quantity, Decimal("10.000"))

    def test_partial_payment_reduces_due(self):
        sale = SalesService.create_sale(
            business=self.business,
            created_by=self.user,
            bill_type=Sale.BillType.ABBREVIATED,
            customer=self.customer,
            lines=[{"product_id": self.product.id, "quantity": Decimal("1")}],
            amount_paid=Decimal("50.00"),
            date_ad=date(2024, 7, 16),
        )
        self.assertEqual(sale.grand_total, Decimal("113.00"))
        self.assertEqual(sale.amount_paid, Decimal("50.00"))
        self.assertEqual(sale.amount_due, Decimal("63.00"))
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.current_due_balance, Decimal("63.00"))
