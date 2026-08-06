"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularSwaggerView

from accounts.views import BusinessProfileView
from core.openapi import DokanSpectacularAPIView
from core.views import HealthView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/business/", BusinessProfileView.as_view(), name="business-profile"),
    path("api/v1/health/", HealthView.as_view(), name="health"),
    path("api/v1/schema/", DokanSpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/v1/", include("inventory.urls")),
    path("api/v1/", include("parties.urls")),
    path("api/v1/", include("sales.urls")),
    path("api/v1/", include("payments.urls")),
    path("api/v1/", include("reports.urls")),
]
