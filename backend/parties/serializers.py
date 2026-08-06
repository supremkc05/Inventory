from rest_framework import serializers

from parties.models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = (
            "id",
            "name",
            "phone",
            "pan_vat_number",
            "address",
            "current_due_balance",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "current_due_balance",
            "created_at",
            "updated_at",
        )
