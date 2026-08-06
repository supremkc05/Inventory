# TenantScopedViewSet (B15) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a tested `TenantScopedViewSet` base that filters by `request.user.business` and stamps business on create.

**Architecture:** Move queryset mixin into `core/viewsets.py`, subclass `ModelViewSet`, cover isolation with `Product` fixtures.

**Tech Stack:** Django 6, DRF, existing `accounts.Business` / `inventory.Product`

---

### Task 1: Failing tests

**Files:**
- Modify: `backend/core/tests.py`

- [x] Write tests for list isolation, empty business, perform_create stamp
- [x] Run tests — expect ImportError / fail until viewsets exist

### Task 2: Implement viewsets

**Files:**
- Create: `backend/core/viewsets.py`
- Modify: `backend/core/permissions.py` (re-export)

- [x] Implement mixin + `TenantScopedViewSet`
- [x] Re-export from permissions for compatibility
- [x] Run tests — all green

### Task 3: Mark todo

**Files:**
- Modify: `todo.txt`

- [x] Mark B15 done
