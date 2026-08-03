from datetime import date
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from core.dates import fiscal_year_for_ad, pair_dates_from_ad
from core.money import to_money, to_qty
from inventory.models import Product, Stock, StockMovement
from parties.models import Customer
from sales.models import DocumentCounter, Sale, SaleItem
from sales.vat import line_amounts


class InsufficientStockError(Exception):
    pass


class SalesService:
    @classmethod
    @transaction.atomic
    def create_sale(
        cls,
        *,
        business,
        created_by,
        bill_type: str,
        lines: list[dict],
        amount_paid=Decimal("0"),
        customer: Customer | None = None,
        date_ad: date | None = None,
        notes: str = "",
    ) -> Sale:
        if not lines:
            raise ValueError("Sale requires at least one line")

        date_ad = date_ad or date.today()
        date_ad, date_bs = pair_dates_from_ad(date_ad)
        fiscal_year = fiscal_year_for_ad(date_ad)
        paid = to_money(amount_paid)

        prepared = []
        subtotal = Decimal("0.00")
        vat_total = Decimal("0.00")
        grand_total = Decimal("0.00")

        for raw in lines:
            product_id = raw["product_id"]
            qty = to_qty(raw["quantity"])
            if qty <= 0:
                raise ValueError("Line quantity must be positive")

            product = Product.objects.select_for_update().get(
                pk=product_id,
                business=business,
                is_active=True,
            )
            unit_price = to_money(raw.get("unit_price", product.selling_price))
            amounts = line_amounts(
                quantity=qty,
                unit_price=unit_price,
                vat_applicable=product.vat_applicable,
                vat_rate=product.vat_rate,
            )

            try:
                stock = Stock.objects.select_for_update().get(
                    business=business,
                    product=product,
                )
            except Stock.DoesNotExist as exc:
                raise InsufficientStockError(
                    f"No stock record for product {product.sku}"
                ) from exc

            if stock.quantity < qty:
                raise InsufficientStockError(
                    f"Insufficient stock for {product.sku}: "
                    f"have {stock.quantity}, need {qty}"
                )

            prepared.append(
                {
                    "product": product,
                    "stock": stock,
                    "quantity": qty,
                    "unit_price": unit_price,
                    "amounts": amounts,
                }
            )
            subtotal += amounts.subtotal
            vat_total += amounts.vat
            grand_total += amounts.total

        subtotal = to_money(subtotal)
        vat_total = to_money(vat_total)
        grand_total = to_money(grand_total)

        if paid < 0:
            raise ValueError("amount_paid cannot be negative")
        if paid > grand_total:
            raise ValueError("amount_paid cannot exceed grand_total")

        amount_due = to_money(grand_total - paid)
        invoice_number = DocumentCounter.allocate_next(
            business,
            fiscal_year,
            DocumentCounter.DocumentType.INVOICE,
        )

        sale = Sale.objects.create(
            business=business,
            customer=customer,
            bill_type=bill_type,
            status=Sale.Status.COMPLETED,
            fiscal_year=fiscal_year,
            invoice_number=invoice_number,
            date_ad=date_ad,
            date_bs=date_bs,
            subtotal=subtotal,
            vat_total=vat_total,
            grand_total=grand_total,
            amount_paid=paid,
            amount_due=amount_due,
            notes=notes,
            created_by=created_by,
        )

        for row in prepared:
            product = row["product"]
            qty = row["quantity"]
            amounts = row["amounts"]
            SaleItem.objects.create(
                business=business,
                sale=sale,
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                quantity=qty,
                unit_price=row["unit_price"],
                vat_applicable=product.vat_applicable,
                vat_rate=product.vat_rate,
                line_subtotal=amounts.subtotal,
                line_vat=amounts.vat,
                line_total=amounts.total,
            )
            Stock.objects.filter(pk=row["stock"].pk).update(
                quantity=F("quantity") - qty,
            )
            StockMovement.objects.create(
                business=business,
                product=product,
                quantity_delta=-qty,
                reason=StockMovement.Reason.SALE,
                reference_type="sale",
                reference_id=sale.id,
                created_by=created_by,
            )

        if customer is not None and amount_due > 0:
            Customer.objects.filter(pk=customer.pk, business=business).update(
                current_due_balance=F("current_due_balance") + amount_due,
            )

        return sale
