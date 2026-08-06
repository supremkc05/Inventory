from datetime import date
from decimal import Decimal
from uuid import uuid4

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Business, User
from inventory.models import Product, Stock
from sales.models import Sale


class SaleIdempotencyApiTests(APITestCase):
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
        Stock.objects.create(business=self.biz, product=self.product, quantity=Decimal("20"))
        self.url = reverse("sale-list")
        self.payload = {
            "bill_type": "abbreviated",
            "lines": [{"product_id": self.product.id, "quantity": "1"}],
            "amount_paid": "0",
            "date_ad": "2024-07-16",
        }
        self.client.force_authenticate(self.owner)

    def test_same_idempotency_key_returns_same_sale(self):
        key = str(uuid4())
        r1 = self.client.post(
            self.url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY=key,
        )
        r2 = self.client.post(
            self.url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY=key,
        )
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED, r1.data)
        self.assertEqual(r2.status_code, status.HTTP_200_OK, r2.data)
        self.assertEqual(r1.data["id"], r2.data["id"])
        self.assertEqual(r1.data["invoice_number"], r2.data["invoice_number"])
        self.assertEqual(Sale.objects.filter(business=self.biz).count(), 1)

    def test_different_keys_create_two_sales(self):
        r1 = self.client.post(
            self.url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY=str(uuid4()),
        )
        r2 = self.client.post(
            self.url,
            {**self.payload, "date_ad": "2024-07-17"},
            format="json",
            HTTP_IDEMPOTENCY_KEY=str(uuid4()),
        )
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(r1.data["id"], r2.data["id"])
        self.assertEqual(Sale.objects.filter(business=self.biz).count(), 2)
