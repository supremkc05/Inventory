from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Business, User
from inventory.models import Product, Stock


class ProductApiTests(APITestCase):
    def setUp(self):
        self.biz_a = Business.objects.create(name="Shop A", pan_vat_number="111111111")
        self.biz_b = Business.objects.create(name="Shop B", pan_vat_number="222222222")
        self.owner = User.objects.create_user(
            username="own@a.com",
            email="own@a.com",
            password="Str0ng!pass",
            business=self.biz_a,
            role=User.Role.OWNER,
        )
        self.accountant = User.objects.create_user(
            username="acc@a.com",
            email="acc@a.com",
            password="Str0ng!pass",
            business=self.biz_a,
            role=User.Role.ACCOUNTANT,
        )
        self.other_owner = User.objects.create_user(
            username="own@b.com",
            email="own@b.com",
            password="Str0ng!pass",
            business=self.biz_b,
            role=User.Role.OWNER,
        )
        self.product_a = Product.objects.create(
            business=self.biz_a,
            sku="A-1",
            name="Rice",
            selling_price=Decimal("100.00"),
        )
        Stock.objects.create(business=self.biz_a, product=self.product_a, quantity=Decimal("5"))
        self.product_b = Product.objects.create(
            business=self.biz_b,
            sku="B-1",
            name="Oil",
            selling_price=Decimal("200.00"),
        )
        self.list_url = reverse("product-list")

    def test_list_only_own_business(self):
        self.client.force_authenticate(self.owner)
        r = self.client.get(self.list_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = {row["id"] for row in r.data["results"]}
        self.assertEqual(ids, {self.product_a.id})

    def test_accountant_can_read_not_write(self):
        self.client.force_authenticate(self.accountant)
        self.assertEqual(self.client.get(self.list_url).status_code, status.HTTP_200_OK)
        r = self.client.post(
            self.list_url,
            {
                "sku": "A-2",
                "name": "Sugar",
                "selling_price": "50.00",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_creates_product_and_stock(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(
            self.list_url,
            {
                "sku": "A-2",
                "name": "Sugar",
                "selling_price": "50.00",
                "cost_price": "40.00",
                "reorder_level": "2",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(sku="A-2", business=self.biz_a)
        self.assertEqual(product.business_id, self.biz_a.id)
        self.assertTrue(Stock.objects.filter(product=product, quantity=0).exists())

    def test_soft_archive_on_delete(self):
        self.client.force_authenticate(self.owner)
        url = reverse("product-detail", args=[self.product_a.id])
        r = self.client.delete(url)
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.product_a.refresh_from_db()
        self.assertFalse(self.product_a.is_active)
        self.assertTrue(Product.objects.filter(pk=self.product_a.pk).exists())

    def test_cannot_retrieve_other_tenant_product(self):
        self.client.force_authenticate(self.owner)
        url = reverse("product-detail", args=[self.product_b.id])
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
