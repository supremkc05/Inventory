# TenantScopedViewSet (B15) — design

**Date:** 2026-08-02  
**Scope:** B15 foundation only (not B16 roles, not E32 domain ViewSets)  
**Status:** Approved for implementation (user: perform A)

## Summary

Promote the stub `TenantScopedQuerysetMixin` into a real DRF base that every future business-scoped API inherits, so list/retrieve/create never leak cross-tenant data.

## Context

- Stub lives in `backend/core/permissions.py` (wrong module; permissions ≠ queryset scoping).
- Domain ViewSets (products, customers, sales) do not exist yet (E32).
- Auth already puts `business_id` on JWT claims; B17 requires filtering by `request.user.business` from the DB user, not the claim alone. The mixin already uses `request.user.business`.

## Behavior

1. **`get_queryset`**: start from `super().get_queryset()`, then:
   - If `request.user.business` is `None` → return `qs.none()`
   - Else → `qs.filter(business=request.user.business)`
2. **`perform_create`**: `serializer.save(business=request.user.business)` (caller must ensure user has a business before create succeeds; validation of “no business” can raise on create in a follow-up if needed).
3. **`TenantScopedViewSet`**: `viewsets.ModelViewSet` + mixin — default base for CRUD tenant resources.
4. Keep the **mixin** public so `ReadOnlyModelViewSet` / custom generics can reuse scoping without full CRUD.

## Non-goals (this task)

- Role permission classes (B16)
- Object-level FK IDOR checks (B18)
- Registering product/customer/sale routes (E32)

## File layout

| File | Role |
|------|------|
| `backend/core/viewsets.py` | Mixin + `TenantScopedViewSet` |
| `backend/core/permissions.py` | Re-export mixin for any old imports; role classes land here in B16 |
| `backend/core/tests.py` | Isolation + create-stamp tests using `inventory.Product` |

## Testing

- Two businesses, one product each → user A lists only A’s product.
- User with `business=None` → empty queryset.
- `perform_create` stamps the authenticated user’s business.
