"""OpenAPI schema helpers (E35)."""

from drf_spectacular.renderers import (
    OpenApiJsonRenderer,
    OpenApiJsonRenderer2,
    OpenApiYamlRenderer,
    OpenApiYamlRenderer2,
)
from drf_spectacular.views import SpectacularAPIView


class OpenApiJsonCompatRenderer(OpenApiJsonRenderer):
    """Swagger UI often requests application/openapi+json (406 without this)."""

    media_type = "application/openapi+json"


class DokanSpectacularAPIView(SpectacularAPIView):
    renderer_classes = [
        OpenApiJsonCompatRenderer,
        OpenApiJsonRenderer,
        OpenApiJsonRenderer2,
        OpenApiYamlRenderer,
        OpenApiYamlRenderer2,
    ]
