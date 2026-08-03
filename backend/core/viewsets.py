"""Tenant-scoped DRF view bases.

Every business-owned resource ViewSet should inherit TenantScopedViewSet
(or TenantScopedQuerysetMixin on a custom generic) so list/retrieve never
leak cross-tenant data and creates stamp request.user.business from the DB.
"""

from rest_framework import viewsets

from core.tenancy import get_user_business


class TenantScopedQuerysetMixin:
    """Filter queryset by request.user.business; stamp business on create."""

    def get_queryset(self):
        qs = super().get_queryset()
        business = get_user_business(self.request.user)
        if business is None:
            return qs.none()
        return qs.filter(business=business)

    def perform_create(self, serializer):
        serializer.save(business=get_user_business(self.request.user))


class TenantScopedViewSet(TenantScopedQuerysetMixin, viewsets.ModelViewSet):
    """Default CRUD base for models with a `business` FK."""

    pass
