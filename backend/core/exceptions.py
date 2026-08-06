"""Consistent API error responses (E36)."""

from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

_TITLE_BY_STATUS = {
    status.HTTP_400_BAD_REQUEST: "Bad Request",
    status.HTTP_401_UNAUTHORIZED: "Unauthorized",
    status.HTTP_403_FORBIDDEN: "Forbidden",
    status.HTTP_404_NOT_FOUND: "Not Found",
    status.HTTP_405_METHOD_NOT_ALLOWED: "Method Not Allowed",
    status.HTTP_429_TOO_MANY_REQUESTS: "Too Many Requests",
    status.HTTP_500_INTERNAL_SERVER_ERROR: "Internal Server Error",
}


def _as_list(value: Any) -> list:
    if isinstance(value, list):
        return [str(v) for v in value]
    return [str(value)]


def _normalize_errors(data: Any) -> tuple[str, dict | None]:
    """
    Return (detail, field_errors_or_None).

    Field errors keep DRF's {field: [messages]} shape under `errors`.
    """
    if isinstance(data, list):
        return "; ".join(str(x) for x in data), None

    if not isinstance(data, dict):
        return str(data), None

    if set(data.keys()) <= {"detail", "code"}:
        detail = data.get("detail", "Request failed.")
        if isinstance(detail, list):
            detail = "; ".join(str(x) for x in detail)
        return str(detail), None

    # Field / nested validation errors
    errors: dict[str, Any] = {}
    for key, value in data.items():
        if isinstance(value, dict):
            errors[key] = {k: _as_list(v) for k, v in value.items()}
        else:
            errors[key] = _as_list(value)

    non_field = errors.pop("non_field_errors", None)
    if non_field and not errors:
        return "; ".join(non_field), None
    detail = "; ".join(non_field) if non_field else "Invalid input."
    return detail, errors or None


def _title_for(status_code: int, exc: Exception) -> str:
    if isinstance(exc, APIException) and status_code == status.HTTP_400_BAD_REQUEST:
        return "Validation Error"
    return _TITLE_BY_STATUS.get(status_code, "Error")


def dokandaftar_exception_handler(exc, context):
    """
    Problem-detail style envelope:

    {
      "status": 400,
      "title": "Validation Error",
      "detail": "Invalid input.",
      "errors": {"email": ["..."]}   # only when field errors exist
    }
    """
    response = exception_handler(exc, context)
    if response is None:
        return None

    detail, errors = _normalize_errors(response.data)
    body: dict[str, Any] = {
        "status": response.status_code,
        "title": _title_for(response.status_code, exc),
        "detail": detail,
    }
    if errors is not None:
        body["errors"] = errors

    response.data = body
    return response
