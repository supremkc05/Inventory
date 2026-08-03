"""Tenant helpers: always use DB-backed user business, never JWT claims (B17/B18)."""

from __future__ import annotations

from typing import Any

from django.db.models import Model, QuerySet
from rest_framework.exceptions import ValidationError


def get_user_business(user) -> Any:
    """Return the user's Business from the DB user row (or None)."""
    if user is None or not getattr(user, "is_authenticated", False):
        return None
    return getattr(user, "business", None)


def get_user_business_id(user) -> int | None:
    """Return business_id from the DB user row (or None)."""
    if user is None or not getattr(user, "is_authenticated", False):
        return None
    return getattr(user, "business_id", None)


def get_tenant_object(queryset: QuerySet, pk, business, *, pk_field: str = "pk") -> Model:
    """
    Load an object that belongs to `business`, or raise ValidationError (B18).

    Use for FK IDs in payloads so clients cannot reference another tenant's rows.
    """
    if business is None:
        raise ValidationError("Business context is required.")
    try:
        return queryset.get(**{pk_field: pk, "business": business})
    except queryset.model.DoesNotExist as exc:
        raise ValidationError("Object not found for this business.") from exc
