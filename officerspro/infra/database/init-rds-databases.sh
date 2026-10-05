#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${RDS_ADMIN_SECRET_ARN:?Set RDS_ADMIN_SECRET_ARN to the RDS-managed master secret ARN}"
: "${RDS_HOST:?Set RDS_HOST to the private RDS endpoint}"

for command in aws mysql jq openssl; do
  command -v "$command" >/dev/null || {
    printf 'Required command not found: %s\n' "$command" >&2
    exit 1
  }
done

master_secret="$(aws secretsmanager get-secret-value \
  --region "$AWS_REGION" \
  --secret-id "$RDS_ADMIN_SECRET_ARN" \
  --query SecretString \
  --output text)"
master_user="$(jq -r '.username' <<<"$master_secret")"
master_password="$(jq -r '.password' <<<"$master_secret")"
if [[ -z "$master_user" || "$master_user" == null || -z "$master_password" || "$master_password" == null ]]; then
  printf 'The RDS secret is missing its username or password fields.\n' >&2
  exit 1
fi

temporary_dir="$(mktemp -d)"
chmod 700 "$temporary_dir"
trap 'rm -rf "$temporary_dir"' EXIT
export MYSQL_PWD="$master_password"

services=(
  "admin:admindb:admin_service"
  "audit:auditDB:audit_service"
  "chargesheet:chargesheetdb:chargesheet_service"
  "complaint-fir:complaintFIR:complaint_fir_service"
  "court-case:officersprocourt:court_case_service"
  "document:officersprodocument:document_service"
  "help-support:helpandsupportfeedback:help_support_service"
  "investigation:investigationservice:investigation_service"
  "keycloak:keycloak:keycloak_service"
  "officers-pro:officerspro:officerspro"
  "profile:officersproprofile:profile_service"
  "subscription-payment:subscription_payment_db:subscription_payment_service"
)

for service in "${services[@]}"; do
  IFS=: read -r service_name database_name db_user <<<"$service"
  secret_name="/officerspro/database/$service_name"
  secret_exists=false
  if aws secretsmanager describe-secret --region "$AWS_REGION" --secret-id "$secret_name" >/dev/null 2>&1; then
    secret_exists=true
    version_stages="$(aws secretsmanager describe-secret \
      --region "$AWS_REGION" \
      --secret-id "$secret_name" \
      --query VersionIdsToStages \
      --output json)"
    if [[ "$version_stages" == "null" || "$version_stages" == "{}" ]]; then
      app_password="$(openssl rand -hex 32)"
    else
      app_secret="$(aws secretsmanager get-secret-value \
        --region "$AWS_REGION" \
        --secret-id "$secret_name" \
        --query SecretString \
        --output text)"
      app_password="$(jq -r '.password' <<<"$app_secret")"
      if [[ -z "$app_password" || "$app_password" == null ]]; then
        printf 'Database secret %s is missing its password; refusing to overwrite it.\n' "$secret_name" >&2
        exit 1
      fi
    fi
  else
    version_stages="null"
    app_password="$(openssl rand -hex 32)"
  fi

  secret_file="$temporary_dir/${service_name}.json"
  jq -n \
    --arg username "$db_user" \
    --arg password "$app_password" \
    --arg database "$database_name" \
    --arg host "$RDS_HOST" \
    '{username: $username, password: $password, database: $database, host: $host}' >"$secret_file"
  chmod 600 "$secret_file"

  if [[ "$secret_exists" == true ]] && { [[ "$version_stages" == "null" ]] || [[ "$version_stages" == "{}" ]]; }; then
    aws secretsmanager put-secret-value \
      --region "$AWS_REGION" \
      --secret-id "$secret_name" \
      --secret-string "file://$secret_file" \
      --output text \
      --query ARN >/dev/null
  elif [[ "$secret_exists" == false ]]; then
    aws secretsmanager create-secret \
      --region "$AWS_REGION" \
      --name "$secret_name" \
      --description "Least-privilege MySQL credentials for OfficersPro $service_name" \
      --secret-string "file://$secret_file" \
      --output text \
      --query ARN >/dev/null
  fi

  MYSQL_PWD="$master_password" mysql \
    --host="$RDS_HOST" \
    --user="$master_user" \
    --ssl \
    --batch \
    --execute="CREATE DATABASE IF NOT EXISTS \`$database_name\`;
CREATE USER IF NOT EXISTS '$db_user'@'%' IDENTIFIED BY '$app_password';
ALTER USER '$db_user'@'%' IDENTIFIED BY '$app_password';
GRANT ALL PRIVILEGES ON \`$database_name\`.* TO '$db_user'@'%';"
  printf 'Provisioned schema and scoped database user for %s.\n' "$service_name"
done

printf 'RDS schemas are ready. Service passwords are stored in Secrets Manager under /officerspro/database/.\n'
