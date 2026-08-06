from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.filters import PaymentFilter
from core.permissions import IsAccountantReadOnly
from core.viewsets import TenantScopedQuerysetMixin
from payments.models import Payment
from payments.serializers import PaymentCreateSerializer, PaymentSerializer
from payments.services import OverpaymentError


class PaymentViewSet(
    TenantScopedQuerysetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Payment.objects.select_related("sale", "customer").all()
    permission_classes = [IsAuthenticated, IsAccountantReadOnly]
    filterset_class = PaymentFilter
    ordering_fields = ["paid_on_ad", "amount", "created_at"]
    ordering = ["-paid_on_ad", "-id"]

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentCreateSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payment = serializer.save()
        except OverpaymentError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        out = PaymentSerializer(payment, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)
