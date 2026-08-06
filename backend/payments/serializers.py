from rest_framework import serializers

from core.tenancy import get_tenant_object, get_user_business
from payments.models import Payment
from payments.services import PaymentService
from sales.models import Sale


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "id",
            "sale",
            "customer",
            "amount",
            "method",
            "paid_on_ad",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class PaymentCreateSerializer(serializers.Serializer):
    sale_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    method = serializers.ChoiceField(choices=Payment.Method.choices)
    paid_on_ad = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_sale_id(self, sale_id):
        request = self.context["request"]
        return get_tenant_object(
            Sale.objects.all(),
            sale_id,
            get_user_business(request.user),
        ).pk

    def create(self, validated_data):
        request = self.context["request"]
        business = get_user_business(request.user)
        sale = Sale.objects.get(pk=validated_data["sale_id"], business=business)
        return PaymentService.record_payment(
            business=business,
            sale=sale,
            amount=validated_data["amount"],
            method=validated_data["method"],
            paid_on_ad=validated_data["paid_on_ad"],
            created_by=request.user,
            notes=validated_data.get("notes", ""),
        )
