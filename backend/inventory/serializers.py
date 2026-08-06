from rest_framework import serializers

from core.tenancy import get_tenant_object, get_user_business
from inventory.models import Category, Product, Stock


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "parent", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class ProductSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "unit",
            "category",
            "cost_price",
            "selling_price",
            "reorder_level",
            "vat_applicable",
            "vat_rate",
            "is_active",
            "stock_quantity",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "stock_quantity")

    def get_stock_quantity(self, obj):
        stock = getattr(obj, "stock", None)
        if stock is None:
            return None
        return stock.quantity

    def validate_category(self, category):
        if category is None:
            return category
        request = self.context["request"]
        return get_tenant_object(
            Category.objects.all(),
            category.pk,
            get_user_business(request.user),
        )


class StockAdjustSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity_delta = serializers.DecimalField(max_digits=12, decimal_places=3)
    reason = serializers.ChoiceField(
        choices=["adjustment", "damage"],
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_product_id(self, product_id):
        request = self.context["request"]
        return get_tenant_object(
            Product.objects.filter(is_active=True),
            product_id,
            get_user_business(request.user),
        ).pk
