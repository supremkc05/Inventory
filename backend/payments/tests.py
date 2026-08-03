from datetime import date
from decimal import Decimal

from django.test import TestCase

from accounts.models import Business, User
from parties.models import Customer
from payments.models import Payment
from sales.models import Sale


class PaymentModelTests(TestCase):
    def setUp(self):
        self.business = Business.objects.create(name="Shop A", pan_vat_number="123456789")
        self.user = User.objects.create_user(
            username="owner1",
            email="owner1@example.com",
            password="pass12345",
            business=self.business,
            role=User.Role.OWNER,
        )
        self.customer = Customer.objects.create(
            business=self.business,
            name="Buyer",
            current_due_balance=Decimal("100.00"),
        )
        self.sale = Sale.objects.create(
            business=self.business,
            customer=self.customer,
            bill_type=Sale.BillType.ABBREVIATED,
            fiscal_year="2081/82",
            invoice_number=1,
            date_ad=date(2025, 7, 16),
            date_bs="2082-04-01",
            grand_total=Decimal("100.00"),
            amount_due=Decimal("100.00"),
        )

    def test_payment_against_sale(self):
        payment = Payment.objects.create(
            business=self.business,
            sale=self.sale,
            customer=self.customer,
            amount=Decimal("40.00"),
            method=Payment.Method.CASH,
            paid_on_ad=date(2025, 7, 16),
            created_by=self.user,
        )
        self.assertEqual(payment.sale_id, self.sale.id)
        self.assertEqual(self.sale.payments.count(), 1)
