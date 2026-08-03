from datetime import date
from decimal import Decimal

from django.db import IntegrityError
from django.test import TestCase

from accounts.models import Business, User
from inventory.models import Product
from parties.models import Customer
from sales.models import CreditNote, DocumentCounter, Sale, SaleItem


class SaleSchemaTests(TestCase):
    def setUp(self):
        self.business = Business.objects.create(name="Shop A", pan_vat_number="123456789")
        self.user = User.objects.create_user(
            username="owner1",
            email="owner1@example.com",
            password="pass12345",
            business=self.business,
            role=User.Role.OWNER,
        )
        self.customer = Customer.objects.create(business=self.business, name="Buyer")
        self.product = Product.objects.create(
            business=self.business,
            sku="SKU-1",
            name="Rice",
            selling_price=Decimal("100.00"),
            cost_price=Decimal("80.00"),
            reorder_level=Decimal("5.000"),
        )

    def test_sale_unique_invoice_per_business_fy(self):
        Sale.objects.create(
            business=self.business,
            customer=self.customer,
            bill_type=Sale.BillType.TAX_INVOICE,
            fiscal_year="2081/82",
            invoice_number=1,
            date_ad=date(2025, 7, 16),
            date_bs="2082-04-01",
            created_by=self.user,
        )
        with self.assertRaises(IntegrityError):
            Sale.objects.create(
                business=self.business,
                customer=self.customer,
                bill_type=Sale.BillType.ABBREVIATED,
                fiscal_year="2081/82",
                invoice_number=1,
                date_ad=date(2025, 7, 17),
                date_bs="2082-04-02",
            )

    def test_sale_item_vat_snapshot(self):
        sale = Sale.objects.create(
            business=self.business,
            customer=self.customer,
            bill_type=Sale.BillType.TAX_INVOICE,
            fiscal_year="2081/82",
            invoice_number=2,
            date_ad=date(2025, 7, 16),
            date_bs="2082-04-01",
            subtotal=Decimal("100.00"),
            vat_total=Decimal("13.00"),
            grand_total=Decimal("113.00"),
        )
        item = SaleItem.objects.create(
            business=self.business,
            sale=sale,
            product=self.product,
            product_name=self.product.name,
            product_sku=self.product.sku,
            quantity=Decimal("1.000"),
            unit_price=Decimal("100.00"),
            vat_applicable=True,
            vat_rate=Decimal("13.00"),
            line_subtotal=Decimal("100.00"),
            line_vat=Decimal("13.00"),
            line_total=Decimal("113.00"),
        )
        self.assertEqual(item.vat_rate, Decimal("13.00"))
        self.assertEqual(sale.items.count(), 1)

    def test_credit_note_own_series(self):
        CreditNote.objects.create(
            business=self.business,
            customer=self.customer,
            fiscal_year="2081/82",
            credit_note_number=1,
            date_ad=date(2025, 7, 16),
            date_bs="2082-04-01",
            grand_total=Decimal("50.00"),
        )
        with self.assertRaises(IntegrityError):
            CreditNote.objects.create(
                business=self.business,
                fiscal_year="2081/82",
                credit_note_number=1,
                date_ad=date(2025, 7, 17),
                date_bs="2082-04-02",
            )

    def test_document_counter_allocate_next_locks_and_increments(self):
        n1 = DocumentCounter.allocate_next(
            self.business,
            "2081/82",
            DocumentCounter.DocumentType.INVOICE,
        )
        n2 = DocumentCounter.allocate_next(
            self.business,
            "2081/82",
            DocumentCounter.DocumentType.INVOICE,
        )
        self.assertEqual(n1, 1)
        self.assertEqual(n2, 2)
        counter = DocumentCounter.objects.get(
            business=self.business,
            fiscal_year="2081/82",
            document_type=DocumentCounter.DocumentType.INVOICE,
        )
        self.assertEqual(counter.next_number, 3)

    def test_document_counter_unique(self):
        DocumentCounter.objects.create(
            business=self.business,
            fiscal_year="2081/82",
            document_type=DocumentCounter.DocumentType.CREDIT_NOTE,
            next_number=1,
        )
        with self.assertRaises(IntegrityError):
            DocumentCounter.objects.create(
                business=self.business,
                fiscal_year="2081/82",
                document_type=DocumentCounter.DocumentType.CREDIT_NOTE,
                next_number=9,
            )
