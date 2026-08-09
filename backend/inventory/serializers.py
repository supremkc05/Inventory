from rest_framework import serializers

from core.tenancy import get_tenant_object, get_user_business
from inventory.models import Category, Product

MAX_IMAGE_BYTES = 2 * 1024 * 1024


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "parent",
            "is_active",
            "product_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "product_count",
            "created_at",
            "updated_at",
        )


class ProductSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
        allow_null=True,
        required=False,
    )
    clear_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "unit",
            "category",
            "category_name",
            "cost_price",
            "selling_price",
            "reorder_level",
            "vat_applicable",
            "vat_rate",
            "is_active",
            "stock_quantity",
            "image",
            "image_url",
            "clear_image",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "stock_quantity",
            "image_url",
            "category_name",
            "is_active",
        )
        extra_kwargs = {
            "image": {"required": False, "allow_null": True},
            "category": {"required": False, "allow_null": True},
        }

    def to_internal_value(self, data):
        # Multipart forms send empty string for cleared nullable FKs.
        if hasattr(data, "copy"):
            data = data.copy()
            if data.get("category") == "":
                data["category"] = None
            clear = data.get("clear_image")
            if isinstance(clear, str) and clear.lower() in ("true", "1", "yes"):
                data["clear_image"] = True
        return super().to_internal_value(data)

    def get_stock_quantity(self, obj):
        stock = getattr(obj, "stock", None)
        if stock is None:
            return None
        return stock.quantity

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def validate_category(self, category):
        if category is None:
            return category
        request = self.context["request"]
        return get_tenant_object(
            Category.objects.filter(is_active=True),
            category.pk,
            get_user_business(request.user),
        )

    def validate_image(self, image):
        if image is None:
            return image
        if getattr(image, "size", 0) > MAX_IMAGE_BYTES:
            raise serializers.ValidationError("Image must be 2 MB or smaller.")
        return image

    def update(self, instance, validated_data):
        clear_image = validated_data.pop("clear_image", False)
        image = validated_data.get("image", serializers.empty)
        if clear_image and image is serializers.empty:
            if instance.image:
                instance.image.delete(save=False)
            validated_data["image"] = None
        return super().update(instance, validated_data)

    def create(self, validated_data):
        validated_data.pop("clear_image", None)
        return super().create(validated_data)


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
