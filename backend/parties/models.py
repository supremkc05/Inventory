from django.db import models

from accounts.models import Business
from core.models import TimeStampedModel


class Customer(TimeStampedModel):
    """Buyer / udhaaro party (C20). Soft-archive via is_active."""

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="customers",
    )
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    pan_vat_number = models.CharField(max_length=9, blank=True)
    address = models.TextField(blank=True)
    current_due_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["business", "name"]),
            models.Index(fields=["business", "phone"]),
            models.Index(fields=["business", "is_active"]),
        ]

    def __str__(self):
        return self.name
