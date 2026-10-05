#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_DIR="$ROOT_DIR/infra/terraform"
AWS_REGION="${AWS_REGION:-ap-south-1}"

if [[ "${DEPLOY_AWS:-}" != "yes" ]]; then
  printf 'This provisions billable AWS resources. Set DEPLOY_AWS=yes to confirm.\n' >&2
  exit 2
fi
if [[ -z "${TF_VAR_s3_bucket_name:-}" || -z "${TF_VAR_app_runtime_secret_arn:-}" ]]; then
  printf 'Set TF_VAR_s3_bucket_name and TF_VAR_app_runtime_secret_arn before deploying.\n' >&2
  exit 2
fi
if [[ ! "$TF_VAR_app_runtime_secret_arn" =~ ^arn:aws(-[a-z]+)?:secretsmanager:[a-z0-9-]+:[0-9]{12}:secret:.+$ ]]; then
  printf 'TF_VAR_app_runtime_secret_arn must be a Secrets Manager ARN; DEPLOY_AWS=yes is only the deployment confirmation flag.\n' >&2
  exit 2
fi

command -v terraform >/dev/null || { printf 'terraform is required.\n' >&2; exit 1; }
command -v aws >/dev/null || { printf 'AWS CLI is required.\n' >&2; exit 1; }

terraform -chdir="$TF_DIR" init
terraform -chdir="$TF_DIR" validate

# Provision ECR and the AWS-hosted builder before publishing images.
terraform -chdir="$TF_DIR" apply \
  -target=aws_ecr_repository.backend \
  -target=aws_ecr_repository.frontend \
  -target=aws_ecr_repository.keycloak \
  -target=aws_ecr_repository.complaint_fir \
  -target=aws_ecr_repository.microservices \
  -target=aws_iam_role_policy.github_deploy \
  -target=aws_codebuild_project.ecr_builder \
  -target=aws_iam_role_policy.github_deploy_codebuild \
  -var="aws_region=$AWS_REGION" \
  -var="s3_bucket_name=$TF_VAR_s3_bucket_name" \
  -var="app_runtime_secret_arn=$TF_VAR_app_runtime_secret_arn" \
  -auto-approve

AWS_REGION="$AWS_REGION" bash "$ROOT_DIR/scripts/publish-ecr-remote.sh"

# Create the network and database before starting any application tasks.
terraform -chdir="$TF_DIR" apply \
  -var="aws_region=$AWS_REGION" \
  -var="s3_bucket_name=$TF_VAR_s3_bucket_name" \
  -var="app_runtime_secret_arn=$TF_VAR_app_runtime_secret_arn" \
  -var="backend_desired_count=0" \
  -var="microservices_desired_count=0" \
  -var="keycloak_desired_count=0" \
  -auto-approve

database_bootstrap_instance_id="$(terraform -chdir="$TF_DIR" output -raw database_bootstrap_instance_id)"
aws ssm wait instance-online \
  --region "$AWS_REGION" \
  --instance-id "$database_bootstrap_instance_id"
database_init_command_id="$(aws ssm send-command \
  --region "$AWS_REGION" \
  --instance-ids "$database_bootstrap_instance_id" \
  --document-name AWS-RunShellScript \
  --comment "Initialize OfficersPro MySQL schemas and service accounts" \
  --parameters 'commands=["cloud-init status --wait","/usr/local/bin/init-officerspro-databases"]' \
  --query 'Command.CommandId' \
  --output text)"

database_init_status=""
for attempt in $(seq 1 180); do
  database_init_status="$(aws ssm get-command-invocation \
    --region "$AWS_REGION" \
    --command-id "$database_init_command_id" \
    --instance-id "$database_bootstrap_instance_id" \
    --query Status \
    --output text 2>/dev/null || true)"
  case "$database_init_status" in
    Success) break ;;
    Failed|Cancelled|TimedOut|Undeliverable|Terminated|DeliveryTimedOut|ExecutionTimedOut)
      aws ssm get-command-invocation \
        --region "$AWS_REGION" \
        --command-id "$database_init_command_id" \
        --instance-id "$database_bootstrap_instance_id" \
        --query '{Status:Status,Output:StandardOutputContent,Error:StandardErrorContent}' \
        --output json || true
      exit 1
      ;;
  esac
  sleep 10
done
if [[ "$database_init_status" != "Success" ]]; then
  printf 'Timed out waiting for the RDS database initialization command.\n' >&2
  exit 1
fi

aws ssm get-command-invocation \
  --region "$AWS_REGION" \
  --command-id "$database_init_command_id" \
  --instance-id "$database_bootstrap_instance_id" \
  --query '{Status:Status,Output:StandardOutputContent}' \
  --output json

terraform -chdir="$TF_DIR" apply \
  -var="aws_region=$AWS_REGION" \
  -var="s3_bucket_name=$TF_VAR_s3_bucket_name" \
  -var="app_runtime_secret_arn=$TF_VAR_app_runtime_secret_arn" \
  -var="backend_desired_count=1" \
  -var="microservices_desired_count=1" \
  -var="keycloak_desired_count=1" \
  -auto-approve

printf 'All backend images, ECS services, and databases are ready. Configure the frontend OIDC role and instance variable before deploying the frontend.\n'
