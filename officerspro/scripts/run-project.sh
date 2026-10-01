#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/Officers-pro-backend/officers-pro"
cd "$APP_DIR"

command="${1:-up}"
env_file=.env
if [[ ! -f "$env_file" ]]; then
  case "$command" in
    up|start|db|config)
      cp .env.example .env
      printf 'Created %s/.env. Replace every placeholder before starting the services.\n' "$APP_DIR"
      exit 1
      ;;
    *)
      env_file=.env.example
      ;;
  esac
fi

compose=(docker compose --env-file "$env_file" -f compose.yaml)
if [[ "$command" == "up" || "$command" == "start" || "$command" == "db" || "$command" == "config" ]]; then
  required_vars=(DB_PASSWORD MYSQL_ROOT_PASSWORD AES_ENCRYPTION_KEY KEYCLOAK_ISSUER_URI KEYCLOAK_SERVER_URL KEYCLOAK_CLIENT_SECRET AWS_S3_BUCKET)
  for name in "${required_vars[@]}"; do
    value="$(awk -F= -v key="$name" '$1 == key {sub(/^[^=]*=/, ""); print; exit}' "$env_file")"
    if [[ -z "$value" || "$value" == *replace-* || "$value" == *change-this-* ]]; then
      printf 'Set a real value for %s in %s/.env before continuing.\n' "$name" "$APP_DIR" >&2
      exit 1
    fi
  done
fi

case "$command" in
  up|start)
    "${compose[@]}" up --build -d
    "$ROOT_DIR/scripts/init-database.sh"
    printf 'Frontend: http://localhost:%s\nBackend:  http://localhost:%s/swagger-ui/index.html\n' \
      "$(awk -F= '$1 == \"FRONTEND_PORT\" {print $2; exit}' .env)" \
      "$(awk -F= '$1 == \"BACKEND_PORT\" {print $2; exit}' .env)"
    ;;
  db)
    "$ROOT_DIR/scripts/init-database.sh"
    ;;
  stop|down)
    "${compose[@]}" down
    ;;
  logs)
    if [[ -n "${2:-}" ]]; then
      "${compose[@]}" logs -f --tail=100 "$2"
    else
      "${compose[@]}" logs -f --tail=100
    fi
    ;;
  status|ps)
    "${compose[@]}" ps
    ;;
  config)
    "${compose[@]}" config --quiet
    ;;
  *)
    printf 'Usage: %s {up|stop|db|logs [service]|status|config}\n' "$0" >&2
    exit 2
    ;;
esac
