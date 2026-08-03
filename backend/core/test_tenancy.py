from django.test import TestCase
from rest_framework.exceptions import ValidationError

from accounts.models import Business, User
from core.tenancy import get_tenant_object, get_user_business, get_user_business_id
from inventory.models import Product


class TenancyHelperTests(TestCase):
    def setUp(self):
        self.biz_a = Business.objects.create(name="A", pan_vat_number="444444444")
        self.biz_b = Business.objects.create(name="B", pan_vat_number="555555555")
        self.user_a = User.objects.create_user(
            username="ta@shop.com",
            email="ta@shop.com",
            password="Str0ng!pass",
            business=self.biz_a,
        )
        self.user_none = User.objects.create_user(
            username="tn@shop.com",
            email="tn@shop.com",
            password="Str0ng!pass",
            business=None,
        )
        self.product_a = Product.objects.create(
            business=self.biz_a,
            sku="TA-1",
            name="A prod",
            selling_price="10.00",
        )
        self.product_b = Product.objects.create(
            business=self.biz_b,
            sku="TB-1",
            name="B prod",
            selling_price="20.00",
        )

    def test_get_user_business_from_db_user(self):
        self.assertEqual(get_user_business(self.user_a), self.biz_a)
        self.assertEqual(get_user_business_id(self.user_a), self.biz_a.id)
        self.assertIsNone(get_user_business(self.user_none))
        self.assertIsNone(get_user_business_id(self.user_none))

    def test_get_tenant_object_same_tenant(self):
        obj = get_tenant_object(Product.objects.all(), self.product_a.id, self.biz_a)
        self.assertEqual(obj.id, self.product_a.id)

    def test_get_tenant_object_rejects_other_tenant(self):
        with self.assertRaises(ValidationError):
            get_tenant_object(Product.objects.all(), self.product_b.id, self.biz_a)

    def test_get_tenant_object_rejects_missing_business(self):
        with self.assertRaises(ValidationError):
            get_tenant_object(Product.objects.all(), self.product_a.id, None)
