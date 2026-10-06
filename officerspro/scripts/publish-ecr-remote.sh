#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AWS_REGION="${AWS_REGION:-ap-south-1}"
BUCKET="${TF_VAR_s3_bucket_name:-}"
PROJECT_NAME="${ECR_CODEBUILD_PROJECT:-officerspro-ecr-image-builder}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
CODEBUILD_MEDIUM_QUOTA_CODE="L-2DC20C30"
SOURCE_KEY="officerspro/codebuild/source-${IMAGE_TAG}.tar.gz"
ARCHIVE="$(mktemp "${TMPDIR:-/tmp}/officerspro-source-XXXXXX.tar.gz")"
UPLOADED=false

cleanup() {
  rm -f "$ARCHIVE"
  if [[ "$UPLOADED" == "true" ]]; then
    aws s3 rm "s3://${BUCKET}/${SOURCE_KEY}" --region "$AWS_REGION" >/dev/null || true
  fi
}
trap cleanup EXIT

if [[ "${DEPLOY_AWS:-}" != "yes" ]]; then
  printf 'This starts a billable AWS CodeBuild build. Set DEPLOY_AWS=yes to confirm.\n' >&2
  exit 2
fi
if [[ -z "$BUCKET" ]]; then
  printf 'Set TF_VAR_s3_bucket_name to the existing source/artifact bucket.\n' >&2
  exit 2
fi
if [[ ! "$IMAGE_TAG" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]]; then
  printf 'IMAGE_TAG contains characters that are not valid for a Docker image tag.\n' >&2
  exit 2
fi

command -v aws >/dev/null || { printf 'AWS CLI is required.\n' >&2; exit 1; }
command -v git >/dev/null || { printf 'Git is required to package the checked-out source.\n' >&2; exit 1; }
command -v tar >/dev/null || { printf 'tar is required to package the checked-out source.\n' >&2; exit 1; }

project_name="$(aws codebuild batch-get-projects \
  --region "$AWS_REGION" \
  --names "$PROJECT_NAME" \
  --query 'projects[0].name' \
  --output text)"
if [[ "$project_name" != "$PROJECT_NAME" ]]; then
  printf 'AWS CodeBuild project %s does not exist in %s. Apply the CodeBuild Terraform resources first.\n' \
    "$PROJECT_NAME" "$AWS_REGION" >&2
  exit 1
fi

build_quota="$(aws service-quotas get-service-quota \
  --region "$AWS_REGION" \
  --service-code codebuild \
  --quota-code "$CODEBUILD_MEDIUM_QUOTA_CODE" \
  --query 'Quota.Value' \
  --output text)"
if [[ ! "$build_quota" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  printf 'Could not read the CodeBuild Linux/Medium concurrent-build quota (received %s).\n' \
    "$build_quota" >&2
  exit 1
fi
if [[ "$build_quota" == "0" || "$build_quota" == 0.* ]]; then
  printf 'AWS CodeBuild Linux/Medium concurrent-build quota is %s in %s; AWS will reject every build until this quota is increased.\n' \
    "$build_quota" "$AWS_REGION" >&2
  printf 'Request one concurrent build with:\naws service-quotas request-service-quota-increase --region %s --service-code codebuild --quota-code %s --desired-value 1\n' \
    "$AWS_REGION" "$CODEBUILD_MEDIUM_QUOTA_CODE" >&2
  exit 1
fi

for path in \
  officerspro/Officers-pro-backend/officers-pro/officers-pro-backend \
  officerspro/Officers-pro-backend/Admin-Backend-v2/admin-backend \
  officerspro/Officers-pro-backend/audit-service \
  officerspro/Officers-pro-backend/chargesheet-generator-service \
  officerspro/Officers-pro-backend/complaint-fir-service \
  officerspro/Officers-pro-backend/court-case-management-service \
  officerspro/Officers-pro-backend/dashboard-service \
  officerspro/Officers-pro-backend/document-management-service \
  officerspro/Officers-pro-backend/help-support-feedback-service \
  officerspro/Officers-pro-backend/investigation-service \
  officerspro/Officers-pro-backend/profile-service \
  officerspro/Officers-pro-backend/subscription-payment-service \
  officerspro/Officerspro-Microservices-Infrastructure/officerspro-keycloak \
  officerspro/infra/keycloak \
  officerspro/scripts/publish-all-services.sh; do
  if [[ ! -e "$ROOT_DIR/$path" ]]; then
    printf 'Required source path is missing: %s\n' "$path" >&2
    printf 'Initialize repository submodules before starting the remote build.\n' >&2
    exit 1
  fi
done

printf 'Packaging application sources for AWS CodeBuild (Docker will run in AWS).\n'
tar -czf "$ARCHIVE" \
  --wildcards \
  --wildcards-match-slash \
  --exclude-vcs \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='**/.env' \
  --exclude='**/.env.*' \
  --exclude='**/target' \
  --exclude='**/target/**' \
  --exclude='**/node_modules/**' \
  --exclude='**/.idea/**' \
  --exclude='*.log' \
  -C "$ROOT_DIR" \
  officerspro/Officers-pro-backend/officers-pro/officers-pro-backend \
  officerspro/Officers-pro-backend/Admin-Backend-v2/admin-backend \
  officerspro/Officers-pro-backend/audit-service \
  officerspro/Officers-pro-backend/chargesheet-generator-service \
  officerspro/Officers-pro-backend/complaint-fir-service \
  officerspro/Officers-pro-backend/court-case-management-service \
  officerspro/Officers-pro-backend/dashboard-service \
  officerspro/Officers-pro-backend/document-management-service \
  officerspro/Officers-pro-backend/help-support-feedback-service \
  officerspro/Officers-pro-backend/investigation-service \
  officerspro/Officers-pro-backend/profile-service \
  officerspro/Officers-pro-backend/subscription-payment-service \
  officerspro/Officerspro-Microservices-Infrastructure/officerspro-keycloak \
  officerspro/infra/keycloak \
  officerspro/scripts/publish-all-services.sh

if ! aws s3 cp "$ARCHIVE" "s3://${BUCKET}/${SOURCE_KEY}" \
  --region "$AWS_REGION" \
  --sse AES256; then
  printf 'Could not upload source archive to s3://%s/%s.\n' "$BUCKET" "$SOURCE_KEY" >&2
  exit 1
fi
UPLOADED=true

if ! build_id="$(aws codebuild start-build \
    --region "$AWS_REGION" \
    --project-name "$PROJECT_NAME" \
    --source-type-override S3 \
    --source-location-override "${BUCKET}/${SOURCE_KEY}" \
    --environment-variables-override \
      "name=IMAGE_TAG,value=${IMAGE_TAG},type=PLAINTEXT" \
      "name=AWS_REGION,value=${AWS_REGION},type=PLAINTEXT" \
    --query 'build.id' \
    --output text 2>&1)"; then
  printf '%s\n' "$build_id" >&2
  printf 'Could not start CodeBuild project %s.\n' "$PROJECT_NAME" >&2
  if [[ "$build_id" == *AccountLimitExceededException* ]]; then
    printf 'Request one Linux/Medium concurrent build with:\naws service-quotas request-service-quota-increase --region %s --service-code codebuild --quota-code %s --desired-value 1\n' \
      "$AWS_REGION" "$CODEBUILD_MEDIUM_QUOTA_CODE" >&2
  fi
  exit 1
fi

printf 'Started AWS CodeBuild: %s\n' "$build_id"
while true; do
  status="$(aws codebuild batch-get-builds \
    --region "$AWS_REGION" \
    --ids "$build_id" \
    --query 'builds[0].buildStatus' \
    --output text)"
  case "$status" in
    SUCCEEDED)
      printf 'All backend images were built in AWS and pushed to ECR (tag %s).\n' "$IMAGE_TAG"
      exit 0
      ;;
    FAILED|FAULT|STOPPED|TIMED_OUT)
      log_url="$(aws codebuild batch-get-builds \
        --region "$AWS_REGION" \
        --ids "$build_id" \
        --query 'builds[0].logs.deepLink' \
        --output text)"
      printf 'AWS CodeBuild finished with status %s. Build logs: %s\n' "$status" "$log_url" >&2
      exit 1
      ;;
    *)
      printf 'AWS CodeBuild status: %s\n' "$status"
      sleep 15
      ;;
  esac
done
