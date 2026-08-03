from django.conf import settings
from django.db import models, transaction

from accounts.models import Business
from core.models import TimeStampedModel
from inventory.models import Product
from parties.models import Customer


class DocumentCounter(models.Model):
    """Per-business FY sequence lock target (C24)."""

    class DocumentType(models.TextChoices):
        INVOICE = "invoice", "Invoice"
        CREDIT_NOTE = "credit_note", "Credit note"

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="document_counters",
    )
    fiscal_year = models.CharField(max_length=20)
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    next_number = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["business", "fiscal_year", "document_type"],
                name="uniq_document_counter_business_fy_type",
            ),
        ]
        indexes = [
            models.Index(fields=["business", "fiscal_year"]),
        ]

    def __str__(self):
        return f"{self.business_id} {self.fiscal_year} {self.document_type}→{self.next_number}"

    @classmethod
    @transaction.atomic
    def allocate_next(cls, business, fiscal_year, document_type):
        """Lock row and return the next document number (select_for_update)."""
        counter, _ = cls.objects.get_or_create(
            business=business,
            fiscal_year=fiscal_year,
            document_type=document_type,
            defaults={"next_number": 1},
        )
        counter = cls.objects.select_for_update().get(pk=counter.pk)
        number = counter.next_number
        counter.next_number = number + 1
        counter.save(update_fields=["next_number"])
        return number


class Sale(TimeStampedModel):
    """Invoice header (C21)."""

    class BillType(models.TextChoices):
        TAX_INVOICE = "tax_invoice", "Tax Invoice"
        ABBREVIATED = "abbreviated", "Abbreviated Bill"

    class Status(models.TextChoices):
        COMPLETED = "completed", "Completed"
        VOIDED = "voided", "Voided"

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="sales",
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="sales",
        null=True,
        blank=True,
    )
    bill_type = models.CharField(max_length=20, choices=BillType.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.COMPLETED,
    )
    fiscal_year = models.CharField(max_length=20)
    invoice_number = models.PositiveIntegerField()
    date_ad = models.DateField()
    date_bs = models.CharField(max_length=20)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_created",
    )

    class Meta:
        ordering = ["-date_ad", "-invoice_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["business", "fiscal_year", "invoice_number"],
                name="uniq_sale_business_fy_invoice",
            ),
        ]
        indexes = [
            models.Index(fields=["business", "date_ad"]),
            models.Index(fields=["business", "date_bs"]),
            models.Index(fields=["business", "invoice_number"]),
            models.Index(fields=["business", "customer"]),
            models.Index(fields=["business", "status"]),
        ]

    def __str__(self):
        return f"INV-{self.fiscal_year}-{self.invoice_number}"


class SaleItem(models.Model):
    """Invoice line with VAT snapshot (C21). No discount fields."""

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="sale_items",
    )
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="sale_items",
    )
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    vat_applicable = models.BooleanField(default=True)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=13.00)
    line_subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    line_vat = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=["business", "sale"]),
            models.Index(fields=["business", "product"]),
        ]

    def __str__(self):
        return f"{self.product_sku} x {self.quantity}"


class CreditNote(TimeStampedModel):
    """Credit note header (C22). Own number series per FY."""

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="credit_notes",
    )
    sale = models.ForeignKey(
        Sale,
        on_delete=models.PROTECT,
        related_name="credit_notes",
        null=True,
        blank=True,
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="credit_notes",
        null=True,
        blank=True,
    )
    fiscal_year = models.CharField(max_length=20)
    credit_note_number = models.PositiveIntegerField()
    date_ad = models.DateField()
    date_bs = models.CharField(max_length=20)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="credit_notes_created",
    )

    class Meta:
        ordering = ["-date_ad", "-credit_note_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["business", "fiscal_year", "credit_note_number"],
                name="uniq_credit_note_business_fy_number",
            ),
        ]
        indexes = [
            models.Index(fields=["business", "date_ad"]),
            models.Index(fields=["business", "date_bs"]),
            models.Index(fields=["business", "credit_note_number"]),
            models.Index(fields=["business", "customer"]),
            models.Index(fields=["business", "sale"]),
        ]

    def __str__(self):
        return f"CN-{self.fiscal_year}-{self.credit_note_number}"


class CreditNoteItem(models.Model):
    """Credit note line with VAT snapshot (C22)."""

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="credit_note_items",
    )
    credit_note = models.ForeignKey(
        CreditNote,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="credit_note_items",
    )
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    vat_applicable = models.BooleanField(default=True)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=13.00)
    line_subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    line_vat = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=["business", "credit_note"]),
            models.Index(fields=["business", "product"]),
        ]

    def __str__(self):
        return f"CN item {self.product_sku} x {self.quantity}"
