from decimal import Decimal

from django.test import TestCase

from accounts.models import Business
from parties.models import Customer


class CustomerModelTests(TestCase):
    def setUp(self):
        self.business = Business.objects.create(name="Shop A", pan_vat_number="123456789")

    def test_customer_optional_pan_and_due_default(self):
        customer = Customer.objects.create(
            business=self.business,
            name="Ram",
            phone="9800000000",
        )
        self.assertEqual(customer.pan_vat_number, "")
        self.assertEqual(customer.current_due_balance, Decimal("0"))
        self.assertTrue(customer.is_active)

    def test_soft_archive(self):
        customer = Customer.objects.create(business=self.business, name="Sita")
        customer.is_active = False
        customer.save(update_fields=["is_active"])
        self.assertFalse(Customer.objects.get(pk=customer.pk).is_active)
