from datetime import date
from decimal import Decimal

from django.test import TestCase

from accounts.models import Business, User
from inventory.models import Product, Stock
from parties.models import Customer
from payments.services import OverpaymentError, PaymentService
from sales.models import Sale
from sales.services import SalesService


class PaymentServiceTests(TestCase):
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
        self.sale = SalesService.create_sale(
            business=self.business,
            created_by=self.user,
            bill_type=Sale.BillType.ABBREVIATED,
            customer=self.customer,
            lines=[{"product_id": self.product.id, "quantity": Decimal("1")}],
            amount_paid=Decimal("0"),
            date_ad=date(2024, 7, 16),
        )

    def test_record_payment_updates_balances(self):
        payment = PaymentService.record_payment(
            business=self.business,
            sale=self.sale,
            amount=Decimal("40.00"),
            method="cash",
            paid_on_ad=date(2024, 7, 17),
            created_by=self.user,
        )
        self.sale.refresh_from_db()
        self.customer.refresh_from_db()
        self.assertEqual(payment.amount, Decimal("40.00"))
        self.assertEqual(self.sale.amount_paid, Decimal("40.00"))
        self.assertEqual(self.sale.amount_due, Decimal("73.00"))
        self.assertEqual(self.customer.current_due_balance, Decimal("73.00"))

    def test_rejects_overpayment(self):
        with self.assertRaises(OverpaymentError):
            PaymentService.record_payment(
                business=self.business,
                sale=self.sale,
                amount=Decimal("999.00"),
                method="cash",
                paid_on_ad=date(2024, 7, 17),
                created_by=self.user,
            )
        self.sale.refresh_from_db()
        self.assertEqual(self.sale.amount_paid, Decimal("0.00"))
