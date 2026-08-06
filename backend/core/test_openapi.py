from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class OpenApiEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_schema_json_without_auth(self):
        response = self.client.get(
            "/api/v1/schema/",
            HTTP_ACCEPT="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertIn("openapi", body)
        self.assertEqual(body["info"]["title"], "DokanDaftar API")

    def test_schema_accepts_openapi_json_media_type(self):
        """Swagger UI often sends Accept: application/openapi+json."""
        response = self.client.get(
            "/api/v1/schema/",
            {"format": "json", "lang": "en"},
            HTTP_ACCEPT="application/openapi+json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_ui_loads(self):
        response = self.client.get("/api/v1/docs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
