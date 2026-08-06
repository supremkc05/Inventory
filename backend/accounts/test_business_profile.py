from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Business, User


class BusinessProfileApiTests(APITestCase):
    def setUp(self):
        self.biz = Business.objects.create(
            name="Shop A",
            pan_vat_number="123456789",
            address="Kathmandu",
            phone="9800000000",
            default_vat_rate=Decimal("13.00"),
        )
        self.other = Business.objects.create(
            name="Shop B",
            pan_vat_number="987654321",
        )
        self.owner = User.objects.create_user(
            username="own@a.com",
            email="own@a.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.OWNER,
        )
        self.admin = User.objects.create_user(
            username="adm@a.com",
            email="adm@a.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.ADMIN,
        )
        self.url = reverse("business-profile")

    def test_owner_can_get_and_patch_profile(self):
        self.client.force_authenticate(self.owner)
        get_r = self.client.get(self.url)
        self.assertEqual(get_r.status_code, status.HTTP_200_OK)
        self.assertEqual(get_r.data["name"], "Shop A")
        self.assertEqual(get_r.data["pan_vat_number"], "123456789")

        patch_r = self.client.patch(
            self.url,
            {
                "name": "Shop A Pvt",
                "address": "Lalitpur",
                "phone": "9811111111",
                "default_vat_rate": "13.00",
            },
            format="json",
        )
        self.assertEqual(patch_r.status_code, status.HTTP_200_OK, patch_r.data)
        self.biz.refresh_from_db()
        self.assertEqual(self.biz.name, "Shop A Pvt")
        self.assertEqual(self.biz.address, "Lalitpur")

    def test_admin_can_read_but_not_update(self):
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_200_OK)
        r = self.client.patch(self.url, {"name": "Hacked"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)
        self.biz.refresh_from_db()
        self.assertEqual(self.biz.name, "Shop A")

    def test_pan_must_be_unique_when_changed(self):
        self.client.force_authenticate(self.owner)
        r = self.client.patch(
            self.url,
            {"pan_vat_number": "987654321"},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
