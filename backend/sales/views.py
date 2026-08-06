from django.db import IntegrityError, transaction
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.filters import CreditNoteFilter, SaleFilter
from core.permissions import IsAccountantReadOnly
from core.tenancy import get_user_business
from core.viewsets import TenantScopedQuerysetMixin
from sales.models import CreditNote, IdempotencyRecord, Sale
from sales.serializers import CreditNoteSerializer, SaleCreateSerializer, SaleSerializer
from sales.services import InsufficientStockError

IDEMPOTENCY_HEADER = "Idempotency-Key"


class SaleViewSet(
    TenantScopedQuerysetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Sale.objects.prefetch_related("items").select_related("customer").all()
    permission_classes = [IsAuthenticated, IsAccountantReadOnly]
    filterset_class = SaleFilter
    search_fields = ["notes", "fiscal_year"]
    ordering_fields = ["date_ad", "invoice_number", "grand_total", "created_at"]
    ordering = ["-date_ad", "-invoice_number"]

    def get_serializer_class(self):
        if self.action == "create":
            return SaleCreateSerializer
        return SaleSerializer

    def create(self, request, *args, **kwargs):
        business = get_user_business(request.user)
        raw_key = request.headers.get(IDEMPOTENCY_HEADER, "").strip()

        if raw_key and business is not None:
            existing = (
                IdempotencyRecord.objects.select_related("sale")
                .filter(business=business, key=raw_key)
                .first()
            )
            if existing is not None:
                out = SaleSerializer(existing.sale, context={"request": request})
                return Response(out.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                sale = serializer.save()
                if raw_key and business is not None:
                    IdempotencyRecord.objects.create(
                        business=business,
                        key=raw_key,
                        sale=sale,
                    )
        except InsufficientStockError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            # Concurrent request won the unique (business, key) race.
            record = IdempotencyRecord.objects.select_related("sale").get(
                business=business,
                key=raw_key,
            )
            out = SaleSerializer(record.sale, context={"request": request})
            return Response(out.data, status=status.HTTP_200_OK)

        out = SaleSerializer(sale, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)


class CreditNoteViewSet(
    TenantScopedQuerysetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Read-only until CreditNoteService ships."""

    queryset = CreditNote.objects.prefetch_related("items").select_related(
        "customer", "sale"
    ).all()
    serializer_class = CreditNoteSerializer
    permission_classes = [IsAuthenticated, IsAccountantReadOnly]
    filterset_class = CreditNoteFilter
    ordering_fields = ["date_ad", "credit_note_number", "created_at"]
    ordering = ["-date_ad", "-credit_note_number"]
