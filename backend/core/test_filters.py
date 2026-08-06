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


class FilterPaginationApiTests(APITestCase):
    def setUp(self):
        self.biz = Business.objects.create(name="Shop A", pan_vat_number="111111111")
        self.owner = User.objects.create_user(
            username="own@a.com",
            email="own@a.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.OWNER,
        )
        self.client.force_authenticate(self.owner)
        self.p1 = Product.objects.create(
            business=self.biz,
            sku="RICE-1",
            name="Basmati Rice",
            selling_price=Decimal("100.00"),
            is_active=True,
        )
        self.p2 = Product.objects.create(
            business=self.biz,
            sku="OIL-1",
            name="Mustard Oil",
            selling_price=Decimal("200.00"),
            is_active=False,
        )
        Stock.objects.create(business=self.biz, product=self.p1, quantity=Decimal("10"))
        Stock.objects.create(business=self.biz, product=self.p2, quantity=Decimal("10"))
        self.customer = Customer.objects.create(
            business=self.biz,
            name="Ram",
            current_due_balance=Decimal("50.00"),
        )
        Customer.objects.create(
            business=self.biz,
            name="Sita",
            current_due_balance=Decimal("0.00"),
        )
        SalesService.create_sale(
            business=self.biz,
            created_by=self.owner,
            bill_type=Sale.BillType.ABBREVIATED,
            customer=self.customer,
            lines=[{"product_id": self.p1.id, "quantity": Decimal("1")}],
            amount_paid=Decimal("0"),
            date_ad=date(2024, 7, 16),
        )
        SalesService.create_sale(
            business=self.biz,
            created_by=self.owner,
            bill_type=Sale.BillType.TAX_INVOICE,
            customer=self.customer,
            lines=[{"product_id": self.p1.id, "quantity": Decimal("1")}],
            amount_paid=Decimal("0"),
            date_ad=date(2024, 8, 1),
        )

    def test_product_search_and_is_active_filter(self):
        r = self.client.get(reverse("product-list"), {"search": "Basmati"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data["results"]), 1)
        self.assertEqual(r.data["results"][0]["sku"], "RICE-1")

        r2 = self.client.get(reverse("product-list"), {"is_active": "true"})
        skus = {row["sku"] for row in r2.data["results"]}
        self.assertEqual(skus, {"RICE-1"})

    def test_customer_has_due_filter(self):
        r = self.client.get(reverse("customer-list"), {"has_due": "true"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data["results"]), 1)
        self.assertEqual(r.data["results"][0]["name"], "Ram")

    def test_sale_date_range_and_bill_type(self):
        # Without date range, both sales exist for this customer
        all_sales = self.client.get(reverse("sale-list"))
        self.assertEqual(all_sales.data["count"], 2)

        r = self.client.get(
            reverse("sale-list"),
            {
                "date_from": "2024-07-01",
                "date_to": "2024-07-31",
            },
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["count"], 1)
        self.assertEqual(r.data["results"][0]["date_ad"], "2024-07-16")

        r2 = self.client.get(
            reverse("sale-list"),
            {"bill_type": "tax_invoice"},
        )
        self.assertEqual(r2.data["count"], 1)
        self.assertEqual(r2.data["results"][0]["bill_type"], "tax_invoice")

    def test_page_size_capped(self):
        for i in range(110):
            Product.objects.create(
                business=self.biz,
                sku=f"X-{i}",
                name=f"Extra {i}",
                selling_price=Decimal("10.00"),
            )
        r = self.client.get(reverse("product-list"), {"page_size": "9999"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data["results"]), 100)  # max_page_size
        self.assertEqual(r.data["count"], 112)  # 2 seed + 110
