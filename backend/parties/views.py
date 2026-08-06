from rest_framework.permissions import IsAuthenticated

from core.filters import CustomerFilter
from core.permissions import IsAccountantReadOnly
from core.viewsets import TenantScopedViewSet
from parties.models import Customer
from parties.serializers import CustomerSerializer


class CustomerViewSet(TenantScopedViewSet):
    queryset = Customer.objects.all().order_by("name")
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAccountantReadOnly]
    filterset_class = CustomerFilter
    search_fields = ["name", "phone", "pan_vat_number"]
    ordering_fields = ["name", "current_due_balance", "created_at"]
    ordering = ["name"]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
