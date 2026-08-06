from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Liveness/readiness: ping DB. Public — no auth (E39)."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            connection.ensure_connection()
        except Exception:
            return Response({"status": "error"}, status=503)
        return Response({"status": "ok"})
