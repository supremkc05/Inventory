# Multi-tenancy & authorization — summary (B15–B19)

**Date:** 2026-08-02

## What we built

| ID | Deliverable |
|----|-------------|
| **B15** | `TenantScopedQuerysetMixin` + `TenantScopedViewSet` — list/retrieve scoped to `request.user.business`; create stamps that business |
| **B16** | `IsOwner`, `IsOwnerOrAdmin`, `IsAccountantReadOnly` — projectfile role matrix; role from DB user |
| **B17** | `get_user_business` / `get_user_business_id` in `core/tenancy.py`; viewsets use helpers (never JWT claims for tenant) |
| **B18** | `get_tenant_object(qs, pk, business)` — raises if FK targets another tenant |
| **B19** | `POST /api/v1/auth/invite/` — owner-only; creates admin/accountant under inviter’s business; ignores client `business_id` |

## How to use on future ViewSets (E32+)

```python
from core.viewsets import TenantScopedViewSet
from core.permissions import IsOwnerOrAdmin, IsAccountantReadOnly
from core.tenancy import get_tenant_object, get_user_business

class ProductViewSet(TenantScopedViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    ...

# In a serializer validate_*:
product = get_tenant_object(Product.objects.all(), value, get_user_business(request.user))
```

## Still later

- Wire ViewSets (E32) and apply permissions per endpoint
- Domain schema C20+ / services D27+
- Soft-delete / audit policies as APIs grow
