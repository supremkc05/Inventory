from datetime import date
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from core.money import to_money
from parties.models import Customer
from payments.models import Payment
from sales.models import Sale


class OverpaymentError(Exception):
    pass


class PaymentService:
    @classmethod
    @transaction.atomic
    def record_payment(
        cls,
        *,
        business,
        sale: Sale,
        amount,
        method: str,
        paid_on_ad: date,
        created_by=None,
        notes: str = "",
    ) -> Payment:
        sale = Sale.objects.select_for_update().get(pk=sale.pk, business=business)
        pay_amount = to_money(amount)

        if pay_amount <= 0:
            raise ValueError("Payment amount must be positive")
        if pay_amount > sale.amount_due:
            raise OverpaymentError(
                f"Payment {pay_amount} exceeds amount due {sale.amount_due}"
            )

        customer = sale.customer
        payment = Payment.objects.create(
            business=business,
            sale=sale,
            customer=customer,
            amount=pay_amount,
            method=method,
            paid_on_ad=paid_on_ad,
            notes=notes,
            created_by=created_by,
        )

        Sale.objects.filter(pk=sale.pk).update(
            amount_paid=F("amount_paid") + pay_amount,
            amount_due=F("amount_due") - pay_amount,
        )

        if customer is not None:
            Customer.objects.filter(pk=customer.pk, business=business).update(
                current_due_balance=F("current_due_balance") - pay_amount,
            )

        return payment
