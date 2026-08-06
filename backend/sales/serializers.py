from rest_framework import serializers

from core.tenancy import get_tenant_object, get_user_business
from inventory.models import Product
from parties.models import Customer
from sales.models import CreditNote, CreditNoteItem, Sale, SaleItem
from sales.services import SalesService


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "quantity",
            "unit_price",
            "vat_applicable",
            "vat_rate",
            "line_subtotal",
            "line_vat",
            "line_total",
        )
        read_only_fields = fields


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = (
            "id",
            "customer",
            "bill_type",
            "status",
            "fiscal_year",
            "invoice_number",
            "date_ad",
            "date_bs",
            "subtotal",
            "vat_total",
            "grand_total",
            "amount_paid",
            "amount_due",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class SaleLineWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    unit_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
    )


class SaleCreateSerializer(serializers.Serializer):
    bill_type = serializers.ChoiceField(choices=Sale.BillType.choices)
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    lines = SaleLineWriteSerializer(many=True)
    amount_paid = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        default="0",
    )
    date_ad = serializers.DateField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_lines(self, lines):
        if not lines:
            raise serializers.ValidationError("At least one line is required.")
        return lines

    def validate_customer_id(self, customer_id):
        if customer_id is None:
            return None
        request = self.context["request"]
        return get_tenant_object(
            Customer.objects.filter(is_active=True),
            customer_id,
            get_user_business(request.user),
        ).pk

    def create(self, validated_data):
        request = self.context["request"]
        business = get_user_business(request.user)
        customer = None
        customer_id = validated_data.get("customer_id")
        if customer_id is not None:
            customer = Customer.objects.get(pk=customer_id, business=business)

        lines = []
        for line in validated_data["lines"]:
            get_tenant_object(
                Product.objects.filter(is_active=True),
                line["product_id"],
                business,
            )
            row = {
                "product_id": line["product_id"],
                "quantity": line["quantity"],
            }
            if "unit_price" in line:
                row["unit_price"] = line["unit_price"]
            lines.append(row)

        kwargs = {
            "business": business,
            "created_by": request.user,
            "bill_type": validated_data["bill_type"],
            "customer": customer,
            "lines": lines,
            "amount_paid": validated_data.get("amount_paid", 0),
            "notes": validated_data.get("notes", ""),
        }
        if "date_ad" in validated_data:
            kwargs["date_ad"] = validated_data["date_ad"]
        return SalesService.create_sale(**kwargs)


class CreditNoteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditNoteItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "quantity",
            "unit_price",
            "vat_applicable",
            "vat_rate",
            "line_subtotal",
            "line_vat",
            "line_total",
        )
        read_only_fields = fields


class CreditNoteSerializer(serializers.ModelSerializer):
    items = CreditNoteItemSerializer(many=True, read_only=True)

    class Meta:
        model = CreditNote
        fields = (
            "id",
            "sale",
            "customer",
            "fiscal_year",
            "credit_note_number",
            "date_ad",
            "date_bs",
            "subtotal",
            "vat_total",
            "grand_total",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
