#!/usr/bin/env bash
# Local “complete check” before opening a PR.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Frontend: lint"
(cd frontend && npm run lint)

echo "==> Frontend: build"
(cd frontend && npm run build)

echo "==> Backend: Django check"
(
  cd backend
  export DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-local-verify-secret}"
  export DJANGO_DEBUG="${DJANGO_DEBUG:-True}"
  export DJANGO_ALLOWED_HOSTS="${DJANGO_ALLOWED_HOSTS:-localhost,127.0.0.1}"
  export POSTGRES_DB="${POSTGRES_DB:-dokandaftar}"
  export POSTGRES_USER="${POSTGRES_USER:-dokandaftar}"
  export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-dokandaftar}"
  export POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
  export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  export DEFAULT_VAT_RATE="${DEFAULT_VAT_RATE:-13.00}"
  if [[ -d ../.venv ]]; then
    # shellcheck disable=SC1091
    source ../.venv/bin/activate
  fi
  python manage.py check
)

echo "==> All checks passed"
