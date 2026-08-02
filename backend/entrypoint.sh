#!/bin/sh
set -e

# Wait for Postgres (simple retry loop; no extra packages).
if [ -n "$POSTGRES_HOST" ]; then
  echo "Waiting for Postgres at $POSTGRES_HOST:${POSTGRES_PORT:-5432}..."
  i=0
  until python -c "import socket; s=socket.create_connection(('${POSTGRES_HOST}', int('${POSTGRES_PORT:-5432}')), 2); s.close()" 2>/dev/null; do
    i=$((i + 1))
    if [ "$i" -ge 30 ]; then
      echo "Postgres not ready after 30 attempts" >&2
      exit 1
    fi
    sleep 1
  done
fi

python manage.py migrate --noinput

exec "$@"
