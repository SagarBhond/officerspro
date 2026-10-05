#!/usr/bin/env bash
set -euo pipefail

: "${KC_BOOTSTRAP_ADMIN_USERNAME:?Keycloak bootstrap admin username is required}"
: "${KC_BOOTSTRAP_ADMIN_PASSWORD:?Keycloak bootstrap admin password is required}"

/opt/keycloak/bin/kc.sh "$@" &
keycloak_pid=$!

cleanup() {
  kill "$keycloak_pid" 2>/dev/null || true
  wait "$keycloak_pid" 2>/dev/null || true
}
trap cleanup EXIT

ready=false
for attempt in $(seq 1 120); do
  if ! kill -0 "$keycloak_pid" 2>/dev/null; then
    wait "$keycloak_pid"
  fi

  if /opt/keycloak/bin/kcadm.sh config credentials \
    --server http://127.0.0.1:8080 \
    --realm master \
    --user "$KC_BOOTSTRAP_ADMIN_USERNAME" \
    --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" \
    >/tmp/keycloak-admin-login.log 2>&1; then
    ready=true
    break
  fi
  sleep 5
done

if [[ "$ready" != true ]]; then
  cat /tmp/keycloak-admin-login.log >&2
  printf 'Keycloak did not become ready for realm client synchronization.\n' >&2
  exit 1
fi

client_id="$(
  /opt/keycloak/bin/kcadm.sh get clients \
    -r OfficerPro \
    -q clientId=officerpro-officer-app |
    sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' |
    head -n 1
)"
if [[ -z "$client_id" ]]; then
  printf 'Could not find the OfficerPro frontend client to synchronize.\n' >&2
  exit 1
fi

/opt/keycloak/bin/kcadm.sh update "clients/$client_id" \
  -r OfficerPro \
  -f /opt/keycloak/conf/officerpro-frontend-client.json

wait "$keycloak_pid"
