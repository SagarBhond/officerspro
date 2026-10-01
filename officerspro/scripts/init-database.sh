#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/Officers-pro-backend/officers-pro"
cd "$APP_DIR"

if [[ ! -f .env ]]; then
  printf 'Missing %s/.env; run scripts/run-project.sh first to create it.\n' "$APP_DIR" >&2
  exit 1
fi

docker compose -f compose.yaml up -d mysql

database_name="$(awk -F= '$1 == "DB_NAME" {print $2; exit}' .env)"
if [[ -z "$database_name" ]]; then
  printf 'DB_NAME must be set in %s/.env.\n' "$APP_DIR" >&2
  exit 1
fi

for attempt in $(seq 1 60); do
  status="$(docker compose -f compose.yaml ps --format '{{.Health}}' mysql 2>/dev/null || true)"
  if [[ "$status" == "healthy" ]]; then
    docker compose -f compose.yaml exec -T mysql sh -ec \
      'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --host=127.0.0.1 --user=root' \
      < database/init/01-service-databases.sql
    docker compose -f compose.yaml exec -T mysql sh -ec \
      'MYSQL_PWD="$MYSQL_PASSWORD" mysql --host=127.0.0.1 --user="$MYSQL_USER" "$MYSQL_DATABASE" --batch --skip-column-names --execute="SELECT 1"'
    printf 'Database %s is ready.\n' \
      "$database_name"
    exit 0
  fi
  sleep 2
done

docker compose -f compose.yaml logs --tail=100 mysql >&2
printf 'MySQL did not become healthy within 120 seconds.\n' >&2
exit 1
