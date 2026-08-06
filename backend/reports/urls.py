from django.urls import path

from reports.views import DailySalesReportView, VatSummaryReportView

urlpatterns = [
    path(
        "reports/daily-sales/",
        DailySalesReportView.as_view(),
        name="reports-daily-sales",
    ),
    path(
        "reports/vat-summary/",
        VatSummaryReportView.as_view(),
        name="reports-vat-summary",
    ),
]
