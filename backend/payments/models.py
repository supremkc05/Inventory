from django.conf import settings
from django.db import models

from accounts.models import Business
from core.models import TimeStampedModel
from parties.models import Customer
from sales.models import Sale


class Payment(TimeStampedModel):
    """Payment against a Sale (C23). Append-only in business logic."""

    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        BANK = "bank", "Bank"
        OTHER = "other", "Other"

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name="payments")
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="payments",
        null=True,
        blank=True,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CASH)
    paid_on_ad = models.DateField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments_created",
    )

    class Meta:
        ordering = ["-paid_on_ad", "-id"]
        indexes = [
            models.Index(fields=["business", "paid_on_ad"]),
            models.Index(fields=["business", "sale"]),
            models.Index(fields=["business", "customer"]),
        ]

    def __str__(self):
        return f"Payment {self.amount} for sale {self.sale_id}"
