from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from accounts.models import Business, User
from core.permissions import IsAccountantReadOnly, IsOwner, IsOwnerOrAdmin


class RolePermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.biz = Business.objects.create(name="Shop", pan_vat_number="333333333")
        self.owner = User.objects.create_user(
            username="owner@shop.com",
            email="owner@shop.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.OWNER,
        )
        self.admin = User.objects.create_user(
            username="admin@shop.com",
            email="admin@shop.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.ADMIN,
        )
        self.accountant = User.objects.create_user(
            username="acct@shop.com",
            email="acct@shop.com",
            password="Str0ng!pass",
            business=self.biz,
            role=User.Role.ACCOUNTANT,
        )
        self.view = object()

    def _check(self, perm, user, method):
        request = getattr(self.factory, method.lower())("/")
        request.user = user if user is not None else AnonymousUser()
        return perm.has_permission(request, self.view)

    def test_is_owner(self):
        perm = IsOwner()
        self.assertTrue(self._check(perm, self.owner, "GET"))
        self.assertTrue(self._check(perm, self.owner, "POST"))
        self.assertFalse(self._check(perm, self.admin, "GET"))
        self.assertFalse(self._check(perm, self.accountant, "POST"))
        self.assertFalse(self._check(perm, None, "GET"))

    def test_is_owner_or_admin(self):
        perm = IsOwnerOrAdmin()
        self.assertTrue(self._check(perm, self.owner, "POST"))
        self.assertTrue(self._check(perm, self.admin, "POST"))
        self.assertFalse(self._check(perm, self.accountant, "POST"))
        self.assertFalse(self._check(perm, self.accountant, "GET"))
        self.assertFalse(self._check(perm, None, "GET"))

    def test_is_accountant_read_only(self):
        perm = IsAccountantReadOnly()
        # SAFE: all three roles
        self.assertTrue(self._check(perm, self.owner, "GET"))
        self.assertTrue(self._check(perm, self.admin, "GET"))
        self.assertTrue(self._check(perm, self.accountant, "GET"))
        self.assertTrue(self._check(perm, self.accountant, "HEAD"))
        # Unsafe: owner/admin only
        self.assertTrue(self._check(perm, self.owner, "POST"))
        self.assertTrue(self._check(perm, self.admin, "DELETE"))
        self.assertFalse(self._check(perm, self.accountant, "POST"))
        self.assertFalse(self._check(perm, self.accountant, "PUT"))
        self.assertFalse(self._check(perm, None, "GET"))
