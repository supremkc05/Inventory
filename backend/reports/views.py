from datetime import date
from decimal import Decimal

from django.db.models import Count, DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.tenancy import get_user_business
from sales.models import Sale, SaleItem

ZERO = Value(Decimal("0.00"), output_field=DecimalField(max_digits=12, decimal_places=2))


def _money(value) -> str:
    return f"{Decimal(value or 0):.2f}"


def _require_business(request):
    business = get_user_business(request.user)
    if business is None:
        raise NotFound("No business associated with this user.")
    return business


def _parse_date(value, field_name):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValidationError({field_name: "Use YYYY-MM-DD."}) from exc


class DailySalesReportView(APIView):
    """GET /api/v1/reports/daily-sales/?date=YYYY-MM-DD"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        business = _require_business(request)
        day = _parse_date(request.query_params.get("date"), "date") or date.today()

        qs = Sale.objects.filter(
            business=business,
            date_ad=day,
            status=Sale.Status.COMPLETED,
        )
        agg = qs.aggregate(
            sale_count=Count("id"),
            subtotal=Coalesce(Sum("subtotal"), ZERO),
            vat_total=Coalesce(Sum("vat_total"), ZERO),
            grand_total=Coalesce(Sum("grand_total"), ZERO),
            amount_paid=Coalesce(Sum("amount_paid"), ZERO),
            amount_due=Coalesce(Sum("amount_due"), ZERO),
        )
        return Response(
            {
                "date": day.isoformat(),
                "sale_count": agg["sale_count"],
                "subtotal": _money(agg["subtotal"]),
                "vat_total": _money(agg["vat_total"]),
                "grand_total": _money(agg["grand_total"]),
                "amount_paid": _money(agg["amount_paid"]),
                "amount_due": _money(agg["amount_due"]),
            }
        )


class VatSummaryReportView(APIView):
    """GET /api/v1/reports/vat-summary/?date_from=&date_to="""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        business = _require_business(request)
        date_from = _parse_date(request.query_params.get("date_from"), "date_from")
        date_to = _parse_date(request.query_params.get("date_to"), "date_to")
        if date_from is None or date_to is None:
            raise ValidationError(
                {"detail": "Both date_from and date_to are required (YYYY-MM-DD)."}
            )
        if date_from > date_to:
            raise ValidationError({"detail": "date_from must be on or before date_to."})

        items = SaleItem.objects.filter(
            business=business,
            sale__date_ad__gte=date_from,
            sale__date_ad__lte=date_to,
            sale__status=Sale.Status.COMPLETED,
        )
        agg = items.aggregate(
            taxable_subtotal=Coalesce(
                Sum("line_subtotal", filter=Q(vat_applicable=True)),
                ZERO,
            ),
            exempt_subtotal=Coalesce(
                Sum("line_subtotal", filter=Q(vat_applicable=False)),
                ZERO,
            ),
            vat_total=Coalesce(Sum("line_vat"), ZERO),
        )
        return Response(
            {
                "date_from": date_from.isoformat(),
                "date_to": date_to.isoformat(),
                "taxable_subtotal": _money(agg["taxable_subtotal"]),
                "exempt_subtotal": _money(agg["exempt_subtotal"]),
                "vat_total": _money(agg["vat_total"]),
            }
        )
