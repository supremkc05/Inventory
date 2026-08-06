from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Business, User
from inventory.models import Product, Stock
from parties.models import Customer
from sales.models import Sale


class StockAdjustApiTests(APITestCase):
    def setUp(self):
        self.biz = Business.objects.create(name="Shop A", pan_vat_number="111111111")
        self.owner = User.objects.create_user(
            username="own@a.com",
            email="own@a.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.OWNER,
        )
        self.accountant = User.objects.create_user(
            username="acc@a.com",
            email="acc@a.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.ACCOUNTANT,
        )
        self.product = Product.objects.create(
            business=self.biz,
            sku="A-1",
            name="Rice",
            selling_price=Decimal("100.00"),
        )
        Stock.objects.create(business=self.biz, product=self.product, quantity=Decimal("5"))
        self.url = reverse("stock-adjust")

    def test_owner_can_adjust_stock(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(
            self.url,
            {
                "product_id": self.product.id,
                "quantity_delta": "3",
                "reason": "adjustment",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["quantity"], "8.000")

    def test_accountant_cannot_adjust(self):
        self.client.force_authenticate(self.accountant)
        r = self.client.post(
            self.url,
            {
                "product_id": self.product.id,
                "quantity_delta": "1",
                "reason": "adjustment",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)


class CustomerApiTests(APITestCase):
    def setUp(self):
        self.biz = Business.objects.create(name="Shop A", pan_vat_number="111111111")
        self.owner = User.objects.create_user(
            username="own@a.com",
            email="own@a.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.OWNER,
        )
        self.url = reverse("customer-list")

    def test_create_and_soft_archive_customer(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(
            self.url,
            {"name": "Ram", "phone": "9800000000"},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        customer_id = r.data["id"]
        d = self.client.delete(reverse("customer-detail", args=[customer_id]))
        self.assertEqual(d.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Customer.objects.get(pk=customer_id).is_active)


class SalePaymentApiTests(APITestCase):
    def setUp(self):
        self.biz = Business.objects.create(name="Shop A", pan_vat_number="111111111")
        self.owner = User.objects.create_user(
            username="own@a.com",
            email="own@a.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.OWNER,
        )
        self.product = Product.objects.create(
            business=self.biz,
            sku="A-1",
            name="Rice",
            selling_price=Decimal("100.00"),
            vat_applicable=True,
            vat_rate=Decimal("13.00"),
        )
        Stock.objects.create(business=self.biz, product=self.product, quantity=Decimal("10"))
        self.customer = Customer.objects.create(business=self.biz, name="Buyer")

    def test_create_sale_and_payment(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(
            reverse("sale-list"),
            {
                "bill_type": "abbreviated",
                "customer_id": self.customer.id,
                "lines": [{"product_id": self.product.id, "quantity": "1"}],
                "amount_paid": "0",
                "date_ad": "2024-07-16",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)
        self.assertEqual(r.data["invoice_number"], 1)
        self.assertEqual(r.data["grand_total"], "113.00")
        sale_id = r.data["id"]

        pay = self.client.post(
            reverse("payment-list"),
            {
                "sale_id": sale_id,
                "amount": "40.00",
                "method": "cash",
                "paid_on_ad": "2024-07-17",
            },
            format="json",
        )
        self.assertEqual(pay.status_code, status.HTTP_201_CREATED, pay.data)
        sale = Sale.objects.get(pk=sale_id)
        self.assertEqual(sale.amount_paid, Decimal("40.00"))
        self.assertEqual(sale.amount_due, Decimal("73.00"))
