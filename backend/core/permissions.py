"""DRF permission classes (B16) and tenant viewset re-exports (B15)."""

from rest_framework.permissions import SAFE_METHODS, BasePermission

from accounts.models import User
from core.viewsets import TenantScopedQuerysetMixin, TenantScopedViewSet


def _authenticated_user(request):
    user = getattr(request, "user", None)
    if user is None or not user.is_authenticated:
        return None
    return user


def _role(request) -> str | None:
    """Role from DB-backed user only (do not trust JWT claims)."""
    user = _authenticated_user(request)
    if user is None:
        return None
    return getattr(user, "role", None)


class IsOwner(BasePermission):
    """Owner-only: manage users / business settings."""

    def has_permission(self, request, view):
        return _role(request) == User.Role.OWNER


class IsOwnerOrAdmin(BasePermission):
    """Owner or admin: mutate products, stock, customers, sales, payments."""

    def has_permission(self, request, view):
        return _role(request) in {User.Role.OWNER, User.Role.ADMIN}


class IsAccountantReadOnly(BasePermission):
    """
    All roles may read (SAFE methods).
    Accountant cannot write; owner/admin can.
    """

    def has_permission(self, request, view):
        role = _role(request)
        if role is None:
            return False
        if request.method in SAFE_METHODS:
            return role in {
                User.Role.OWNER,
                User.Role.ADMIN,
                User.Role.ACCOUNTANT,
            }
        return role in {User.Role.OWNER, User.Role.ADMIN}


__all__ = [
    "IsOwner",
    "IsOwnerOrAdmin",
    "IsAccountantReadOnly",
    "TenantScopedQuerysetMixin",
    "TenantScopedViewSet",
]
