from django.db import transaction
from django.db.models import Count, F, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.filters import ProductFilter
from core.permissions import IsAccountantReadOnly, IsOwnerOrAdmin
from core.tenancy import get_user_business
from core.viewsets import TenantScopedViewSet
from inventory.models import Category, Product, Stock, StockMovement
from inventory.serializers import (
    CategorySerializer,
    ProductSerializer,
    StockAdjustSerializer,
)


class CategoryViewSet(TenantScopedViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAccountantReadOnly]
    search_fields = ["name"]
    filterset_fields = ["is_active"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.annotate(
            product_count=Count(
                "products",
                filter=Q(products__is_active=True),
            )
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class ProductViewSet(TenantScopedViewSet):
    queryset = Product.objects.select_related("stock", "category").all().order_by("name")
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAccountantReadOnly]
    filterset_class = ProductFilter
    search_fields = ["name", "sku"]
    ordering_fields = ["name", "sku", "selling_price", "created_at"]
    ordering = ["name"]

    def perform_create(self, serializer):
        business = get_user_business(self.request.user)
        with transaction.atomic():
            product = serializer.save(business=business)
            Stock.objects.get_or_create(
                business=business,
                product=product,
                defaults={"quantity": 0},
            )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class StockAdjustView(APIView):
    """POST /api/v1/stock/adjust/ — owner/admin only."""

    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    @transaction.atomic
    def post(self, request):
        serializer = StockAdjustSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        business = get_user_business(request.user)
        product = Product.objects.get(
            pk=serializer.validated_data["product_id"],
            business=business,
        )
        delta = serializer.validated_data["quantity_delta"]
        reason = serializer.validated_data["reason"]
        notes = serializer.validated_data.get("notes", "")

        stock, _ = Stock.objects.select_for_update().get_or_create(
            business=business,
            product=product,
            defaults={"quantity": 0},
        )
        new_qty = stock.quantity + delta
        if new_qty < 0:
            return Response(
                {"detail": "Stock quantity cannot go below zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        Stock.objects.filter(pk=stock.pk).update(quantity=F("quantity") + delta)
        movement = StockMovement.objects.create(
            business=business,
            product=product,
            quantity_delta=delta,
            reason=reason,
            reference_type="manual_adjust",
            notes=notes,
            created_by=request.user,
        )
        stock.refresh_from_db()
        return Response(
            {
                "product_id": product.id,
                "quantity": str(stock.quantity),
                "movement_id": movement.id,
            },
            status=status.HTTP_200_OK,
        )
