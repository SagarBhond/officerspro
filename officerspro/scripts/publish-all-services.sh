#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AWS_REGION="${AWS_REGION:-ap-south-1}"
IMAGE_TAG="${IMAGE_TAG:-${GITHUB_SHA:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}}"

command -v aws >/dev/null || { printf 'AWS CLI is required.\n' >&2; exit 1; }
command -v docker >/dev/null || { printf 'Docker is required.\n' >&2; exit 1; }
docker buildx version >/dev/null || { printf 'Docker Buildx is required.\n' >&2; exit 1; }

account_id="$(aws sts get-caller-identity --region "$AWS_REGION" --query Account --output text)"
registry="${account_id}.dkr.ecr.${AWS_REGION}.amazonaws.com"
aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$registry"

services=(
  "officerspro/backend|officerspro/Officers-pro-backend/officers-pro/officers-pro-backend|officerspro/Officers-pro-backend/officers-pro/officers-pro-backend/dockerfile"
  "officerspro/keycloak|officerspro|officerspro/infra/keycloak/Dockerfile"
  "officerspro/complaint-fir|officerspro/Officers-pro-backend/complaint-fir-service|officerspro/Officers-pro-backend/complaint-fir-service/Dockerfile"
  "officerspro/admin-backend|officerspro/Officers-pro-backend/Admin-Backend-v2/admin-backend|officerspro/Officers-pro-backend/Admin-Backend-v2/admin-backend/Dockerfile"
  "officerspro/audit-service|officerspro/Officers-pro-backend/audit-service|officerspro/Officers-pro-backend/audit-service/Dockerfile"
  "officerspro/chargesheet-generator-service|officerspro/Officers-pro-backend/chargesheet-generator-service|officerspro/Officers-pro-backend/chargesheet-generator-service/Dockerfile"
  "officerspro/court-case-management-service|officerspro/Officers-pro-backend/court-case-management-service|officerspro/Officers-pro-backend/court-case-management-service/Dockerfile"
  "officerspro/dashboard-service|officerspro/Officers-pro-backend/dashboard-service|officerspro/Officers-pro-backend/dashboard-service/Dockerfile"
  "officerspro/document-management-service|officerspro/Officers-pro-backend/document-management-service|officerspro/Officers-pro-backend/document-management-service/Dockerfile"
  "officerspro/help-support-feedback-service|officerspro/Officers-pro-backend/help-support-feedback-service|officerspro/Officers-pro-backend/help-support-feedback-service/Dockerfile"
  "officerspro/investigation-service|officerspro/Officers-pro-backend/investigation-service|officerspro/Officers-pro-backend/investigation-service/Dockerfile"
  "officerspro/profile-service|officerspro/Officers-pro-backend/profile-service|officerspro/Officers-pro-backend/profile-service/Dockerfile"
  "officerspro/subscription-payment-service|officerspro/Officers-pro-backend/subscription-payment-service|officerspro/Officers-pro-backend/subscription-payment-service/Dockerfile"
)

for definition in "${services[@]}"; do
  IFS='|' read -r repository context dockerfile <<<"$definition"
  if [[ ! -d "$ROOT_DIR/$context" || ! -f "$ROOT_DIR/$dockerfile" ]]; then
    printf 'Missing build context or Dockerfile for %s (%s, %s).\n' \
      "$repository" "$context" "$dockerfile" >&2
    exit 1
  fi
  if ! aws ecr describe-repositories \
    --region "$AWS_REGION" \
    --repository-names "$repository" >/dev/null; then
    printf 'ECR repository %s is missing; apply Terraform before publishing images.\n' \
      "$repository" >&2
    exit 1
  fi

  printf 'Building and publishing %s:%s\n' "$repository" "$IMAGE_TAG"
  docker buildx build \
    --platform linux/amd64 \
    --push \
    --tag "$registry/$repository:$IMAGE_TAG" \
    --tag "$registry/$repository:latest" \
    --file "$ROOT_DIR/$dockerfile" \
    "$ROOT_DIR/$context"
done
