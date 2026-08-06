import django_filters

from inventory.models import Product
from parties.models import Customer
from payments.models import Payment
from sales.models import CreditNote, Sale


class ProductFilter(django_filters.FilterSet):
    class Meta:
        model = Product
        fields = {
            "is_active": ["exact"],
            "vat_applicable": ["exact"],
            "category": ["exact"],
        }


class CustomerFilter(django_filters.FilterSet):
    has_due = django_filters.BooleanFilter(method="filter_has_due")

    class Meta:
        model = Customer
        fields = {
            "is_active": ["exact"],
        }

    def filter_has_due(self, queryset, name, value):
        if value is True:
            return queryset.filter(current_due_balance__gt=0)
        if value is False:
            return queryset.filter(current_due_balance__lte=0)
        return queryset


class SaleFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="date_ad", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date_ad", lookup_expr="lte")
    payment_status = django_filters.CharFilter(method="filter_payment_status")

    class Meta:
        model = Sale
        fields = {
            "bill_type": ["exact"],
            "status": ["exact"],
            "customer": ["exact"],
            "fiscal_year": ["exact"],
            "date_ad": ["exact"],
        }

    def filter_payment_status(self, queryset, name, value):
        value = (value or "").lower()
        if value == "paid":
            return queryset.filter(amount_due=0)
        if value == "unpaid":
            return queryset.filter(amount_paid=0, amount_due__gt=0)
        if value == "partial":
            return queryset.filter(amount_paid__gt=0, amount_due__gt=0)
        return queryset


class CreditNoteFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="date_ad", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date_ad", lookup_expr="lte")

    class Meta:
        model = CreditNote
        fields = {
            "customer": ["exact"],
            "sale": ["exact"],
            "fiscal_year": ["exact"],
            "date_ad": ["exact"],
        }


class PaymentFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="paid_on_ad", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="paid_on_ad", lookup_expr="lte")

    class Meta:
        model = Payment
        fields = {
            "sale": ["exact"],
            "customer": ["exact"],
            "method": ["exact"],
            "paid_on_ad": ["exact"],
        }
