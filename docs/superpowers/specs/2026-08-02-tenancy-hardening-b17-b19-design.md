# Multi-tenancy hardening (B17–B19) — design

**Date:** 2026-08-02  
**Status:** Approved (complete through B19)

## B17 — Never trust JWT `business_id` alone

- Helpers `get_user_business` / `get_user_business_id` read only from the authenticated DB user.
- `TenantScopedQuerysetMixin` uses those helpers.
- JWT may still *carry* claims for the client; authorization/scoping never reads the token payload for tenant id.

## B18 — Object-level tenant FK checks

- `get_tenant_object(queryset, pk, business)` returns the row or raises `ValidationError` if missing / other tenant.
- Serializers/services call this for FKs (product, customer, sale, …) before use.

## B19 — Owner invites staff

- `POST /api/v1/auth/invite/` — `IsAuthenticated` + `IsOwner`.
- Body: `email`, `password`, `full_name`, `role` (`admin` | `accountant` only).
- New user always gets `business=request.user.business`; cannot set another business.
- Reject if inviter has no business; reject duplicate email.

## Non-goals

- Full user-management CRUD UI
- Email-send invite links (password set in-request for MVP)
