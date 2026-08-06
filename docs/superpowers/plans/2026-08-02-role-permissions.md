# Role permissions (B16) Implementation Plan

> **For agentic workers:** Use TDD; steps use checkbox syntax.

**Goal:** Ship IsOwner / IsOwnerOrAdmin / IsAccountantReadOnly with tests.

**Architecture:** Named BasePermission classes; role from `request.user.role` only.

**Tech Stack:** Django, DRF

---

- [x] Spec written
- [x] Failing tests in `core/test_permissions.py`
- [x] Implement classes in `core/permissions.py`
- [x] Tests green (6 core tests)
- [x] Mark B16 in todo.txt
