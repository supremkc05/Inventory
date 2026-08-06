from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import NotAuthenticated, ValidationError
from rest_framework.test import APIRequestFactory, APITestCase

from core.exceptions import dokandaftar_exception_handler


class ExceptionHandlerTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_validation_error_has_problem_shape_and_field_errors(self):
        request = self.factory.post("/api/v1/x/")
        response = dokandaftar_exception_handler(
            ValidationError({"email": ["Enter a valid email."]}),
            {"request": request, "view": None},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.data
        self.assertEqual(body["status"], 400)
        self.assertEqual(body["title"], "Validation Error")
        self.assertEqual(body["detail"], "Invalid input.")
        self.assertEqual(body["errors"]["email"], ["Enter a valid email."])

    def test_auth_error_problem_shape(self):
        request = self.factory.get("/api/v1/x/")
        response = dokandaftar_exception_handler(
            NotAuthenticated(),
            {"request": request, "view": None},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["status"], 401)
        self.assertEqual(response.data["title"], "Unauthorized")
        self.assertIn("detail", response.data)
        self.assertNotIn("errors", response.data)


class ExceptionHandlerApiTests(APITestCase):
    def test_unauthenticated_business_uses_problem_shape(self):
        r = self.client.get(reverse("business-profile"))
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r.data["status"], 401)
        self.assertEqual(r.data["title"], "Unauthorized")
        self.assertIn("detail", r.data)
        self.assertNotIn("traceback", r.data)
        self.assertNotIn("exc_info", r.data)

    @override_settings(DEBUG=False)
    def test_debug_false_still_returns_json_problem_not_html(self):
        r = self.client.get(reverse("business-profile"))
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(r["Content-Type"].split(";")[0], "application/json")
        self.assertEqual(r.data["title"], "Unauthorized")
