from datetime import date
from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Business, User
from inventory.models import Product, Stock
from parties.models import Customer
from sales.models import Sale
from sales.services import SalesService


class ReportsApiTests(APITestCase):
    def setUp(self):
        self.biz = Business.objects.create(name="Shop A", pan_vat_number="111111111")
        self.other = Business.objects.create(name="Shop B", pan_vat_number="222222222")
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
        self.other_owner = User.objects.create_user(
            username="own@b.com",
            email="own@b.com",
            password="Str0ng!pass",
            business=self.other,
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
        Stock.objects.create(business=self.biz, product=self.product, quantity=Decimal("20"))
        self.exempt = Product.objects.create(
            business=self.biz,
            sku="A-2",
            name="Exempt",
            selling_price=Decimal("50.00"),
            vat_applicable=False,
            vat_rate=Decimal("13.00"),
        )
        Stock.objects.create(business=self.biz, product=self.exempt, quantity=Decimal("20"))
        self.customer = Customer.objects.create(business=self.biz, name="Buyer")

        SalesService.create_sale(
            business=self.biz,
            created_by=self.owner,
            bill_type=Sale.BillType.ABBREVIATED,
            customer=self.customer,
            lines=[
                {"product_id": self.product.id, "quantity": Decimal("1")},
                {"product_id": self.exempt.id, "quantity": Decimal("2")},
            ],
            amount_paid=Decimal("0"),
            date_ad=date(2024, 7, 16),
        )

    def test_accountant_daily_sales(self):
        self.client.force_authenticate(self.accountant)
        url = reverse("reports-daily-sales")
        r = self.client.get(url, {"date": "2024-07-16"})
        self.assertEqual(r.status_code, status.HTTP_200_OK, r.data)
        self.assertEqual(r.data["date"], "2024-07-16")
        self.assertEqual(r.data["sale_count"], 1)
        self.assertEqual(r.data["subtotal"], "200.00")  # 100 + 100
        self.assertEqual(r.data["vat_total"], "13.00")
        self.assertEqual(r.data["grand_total"], "213.00")

    def test_vat_summary_range(self):
        self.client.force_authenticate(self.owner)
        url = reverse("reports-vat-summary")
        r = self.client.get(
            url,
            {"date_from": "2024-07-01", "date_to": "2024-07-31"},
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK, r.data)
        self.assertEqual(r.data["taxable_subtotal"], "100.00")
        self.assertEqual(r.data["exempt_subtotal"], "100.00")
        self.assertEqual(r.data["vat_total"], "13.00")

    def test_other_tenant_sales_excluded(self):
        other_product = Product.objects.create(
            business=self.other,
            sku="B-1",
            name="Other",
            selling_price=Decimal("999.00"),
        )
        Stock.objects.create(business=self.other, product=other_product, quantity=Decimal("5"))
        SalesService.create_sale(
            business=self.other,
            created_by=self.other_owner,
            bill_type=Sale.BillType.ABBREVIATED,
            lines=[{"product_id": other_product.id, "quantity": Decimal("1")}],
            amount_paid=Decimal("0"),
            date_ad=date(2024, 7, 16),
        )
        self.client.force_authenticate(self.accountant)
        r = self.client.get(reverse("reports-daily-sales"), {"date": "2024-07-16"})
        self.assertEqual(r.data["sale_count"], 1)
        self.assertEqual(r.data["grand_total"], "213.00")
