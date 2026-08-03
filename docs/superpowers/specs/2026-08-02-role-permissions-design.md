# Role permissions (B16) — design

**Date:** 2026-08-02  
**Scope:** Foundation only — DRF permission classes + unit tests  
**Status:** Approved

## Summary

Add `IsOwner`, `IsOwnerOrAdmin`, and `IsAccountantReadOnly` matching the projectfile role matrix, reading `request.user.role` from the DB user (not JWT claims).

## Matrix → classes

| Capability | owner | admin | accountant | Class |
|---|---|---|---|---|
| Manage users / business settings | ✓ | — | — | `IsOwner` |
| Products, stock, customers, sales writes, payments, void | ✓ | ✓ | — | `IsOwnerOrAdmin` |
| Reports / read sales & payments | ✓ | ✓ | ✓ (read) | `IsAccountantReadOnly` |

## Behavior

All classes deny if there is no authenticated user.

1. **`IsOwner`** — allow iff `user.role == User.Role.OWNER`
2. **`IsOwnerOrAdmin`** — allow iff `role in {OWNER, ADMIN}`
3. **`IsAccountantReadOnly`**
   - SAFE methods (`GET`, `HEAD`, `OPTIONS`): allow `OWNER`, `ADMIN`, or `ACCOUNTANT`
   - Unsafe methods: allow `OWNER` or `ADMIN` only

Role is always taken from `request.user.role` (loaded with the user from the DB). Do not trust JWT `role` for authorization.

## Files

| File | Change |
|------|--------|
| `backend/core/permissions.py` | Implement the three classes; keep B15 re-exports |
| `backend/core/tests.py` | Add permission unit tests (or `permissions` test module) |

## Non-goals

- Wiring onto domain ViewSets (E32)
- Object-level IDOR (B18)
- Staff invite (B19)
