from django.test import TestCase
from rest_framework import serializers
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import Business, User
from core.viewsets import TenantScopedViewSet
from inventory.models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("id", "sku", "name", "selling_price", "business")
        read_only_fields = ("business",)


class ProductTenantViewSet(TenantScopedViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer


class TenantScopedViewSetTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.biz_a = Business.objects.create(name="Shop A", pan_vat_number="111111111")
        self.biz_b = Business.objects.create(name="Shop B", pan_vat_number="222222222")
        self.user_a = User.objects.create_user(
            username="a@shop.com",
            email="a@shop.com",
            password="Str0ng!pass",
            business=self.biz_a,
            role=User.Role.OWNER,
        )
        self.user_b = User.objects.create_user(
            username="b@shop.com",
            email="b@shop.com",
            password="Str0ng!pass",
            business=self.biz_b,
            role=User.Role.OWNER,
        )
        self.user_none = User.objects.create_user(
            username="none@shop.com",
            email="none@shop.com",
            password="Str0ng!pass",
            business=None,
        )
        self.product_a = Product.objects.create(
            business=self.biz_a,
            sku="A-1",
            name="Product A",
            selling_price="100.00",
        )
        self.product_b = Product.objects.create(
            business=self.biz_b,
            sku="B-1",
            name="Product B",
            selling_price="200.00",
        )
        self.view = ProductTenantViewSet.as_view({"get": "list", "post": "create"})

    def test_list_only_returns_own_business_products(self):
        request = self.factory.get("/products/")
        force_authenticate(request, user=self.user_a)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        ids = {row["id"] for row in response.data["results"]}
        self.assertEqual(ids, {self.product_a.id})

    def test_list_empty_when_user_has_no_business(self):
        request = self.factory.get("/products/")
        force_authenticate(request, user=self.user_none)
        response = self.view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"], [])

    def test_create_stamps_request_user_business(self):
        request = self.factory.post(
            "/products/",
            {
                "sku": "A-2",
                "name": "New A",
                "selling_price": "50.00",
            },
            format="json",
        )
        force_authenticate(request, user=self.user_a)
        response = self.view(request)
        self.assertEqual(response.status_code, 201)
        created = Product.objects.get(sku="A-2")
        self.assertEqual(created.business_id, self.biz_a.id)
        self.assertNotEqual(created.business_id, self.biz_b.id)
