from django.conf import settings
from django.db import models
from core.models import TimeStampedModel
from accounts.models import Business

class Category(TimeStampedModel):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "categories"
        unique_together = ("business", "name")

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="products")
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    sku = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=30, default="pcs")
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    vat_applicable = models.BooleanField(default=True)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=13.00)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("business", "sku")
        indexes = [
            models.Index(fields=["business", "name"]),
            models.Index(fields=["business", "is_active"]),
            models.Index(fields=["business", "sku"]),
        ]

    def __str__(self):
        return f"{self.sku} — {self.name}"


class Stock(TimeStampedModel):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="stocks")
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="stock")
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0)

    class Meta:
        unique_together = ("business", "product")

    def __str__(self):
        return f"{self.product} = {self.quantity}"


class StockMovement(models.Model):
    class Reason(models.TextChoices):
        SALE = "sale", "Sale"
        CREDIT_NOTE = "credit_note", "Credit note"
        ADJUSTMENT = "adjustment", "Adjustment"
        DAMAGE = "damage", "Damage"

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="stock_movements")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="movements")
    quantity_delta = models.DecimalField(max_digits=12, decimal_places=3)
    reason = models.CharField(max_length=20, choices=Reason.choices)
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["business", "created_at"]),
            models.Index(fields=["business", "product"]),
            models.Index(fields=["product", "created_at"]),
        ]

    def __str__(self):
        return f"{self.product_id} {self.quantity_delta} ({self.reason})"
