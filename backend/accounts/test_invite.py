from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Business, User


class InviteStaffApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.url = reverse("auth-invite")
        self.biz = Business.objects.create(name="Invite Co", pan_vat_number="666666666")
        self.other = Business.objects.create(name="Other Co", pan_vat_number="777777777")
        self.owner = User.objects.create_user(
            username="own@inv.com",
            email="own@inv.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.OWNER,
        )
        self.admin = User.objects.create_user(
            username="adm@inv.com",
            email="adm@inv.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.ADMIN,
        )

    def _payload(self, **overrides):
        data = {
            "email": "staff@inv.com",
            "password": "Str0ng!pass",
            "full_name": "Staff User",
            "role": "admin",
        }
        data.update(overrides)
        return data

    def test_owner_can_invite_admin_to_own_business(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        staff = User.objects.get(email="staff@inv.com")
        self.assertEqual(staff.business_id, self.biz.id)
        self.assertEqual(staff.role, User.Role.ADMIN)
        self.assertEqual(staff.username, "staff@inv.com")

    def test_owner_can_invite_accountant(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(
            self.url, self._payload(role="accountant", email="acct@inv.com"), format="json"
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(email="acct@inv.com").role, User.Role.ACCOUNTANT)

    def test_cannot_invite_as_owner_role(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(self.url, self._payload(role="owner"), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_cannot_invite(self):
        self.client.force_authenticate(self.admin)
        r = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_ignores_client_supplied_business_id(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post(
            self.url,
            self._payload(business_id=self.other.id, email="forced@inv.com"),
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(email="forced@inv.com").business_id, self.biz.id)

    def test_unauthenticated_rejected(self):
        r = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
