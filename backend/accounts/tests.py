from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from accounts.models import Business, User

class AuthApiTests(APITestCase):
    def setUp(self):
        self.signup = reverse("auth-signup")
        self.login = reverse("auth-login")
        self.me = reverse("auth-me")

    def _signup(self, email="a@b.com", pan="123456789"):
        return self.client.post(self.signup, {
            "business_name": "Shop", "full_name": "Owner One",
            "email": email, "password": "Str0ng!pass",
            "confirm_password": "Str0ng!pass", "pan_vat_number": pan,
        }, format="json")

    def test_signup_no_tokens(self):
        r = self._signup()
        self.assertEqual(r.status_code, 201)
        self.assertIn("user", r.data)
        self.assertNotIn("access", r.data)

    def test_login_generic_error(self):
        self._signup()
        r = self.client.post(self.login, {"email": "a@b.com", "password": "wrong"}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("detail", r.data)

    def test_me_requires_auth(self):
        self.assertEqual(self.client.get(self.me).status_code, 401)

    def test_inactive_business_rejected(self):
        self._signup()
        u = User.objects.get(email="a@b.com")
        u.business.is_active = False
        u.business.save()
        r = self.client.post(self.login, {"email": "a@b.com", "password": "Str0ng!pass"}, format="json")
        self.assertEqual(r.status_code, 400)
