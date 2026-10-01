# OfficersPro database and deployment

This checkout contains separate applications and Git submodules. The infrastructure provisions the primary backend, a frontend EC2 host, and one MySQL RDS instance with separate schemas and users for each database-backed service found in the checked-in source/configuration. It does not make missing service source runnable: `profile-service`, `subscription-payment-service`, and `notification-center-service` do not contain usable application builds here, and the Config Server Git submodule is empty. The frontend also calls APIs belonging to services beyond the primary backend.

## Database inventory

The repository does not use a consistent DB naming convention today: for example Compose overrides several services to share the `officerspro` schema, while Config Server or each service's own properties specify different schemas. The RDS bootstrap below creates a separate schema and a dedicated user per service, using this normalized inventory:

| Service | Schema | Database user |
| --- | --- | --- |
| Admin | `admindb` | `admin_service` |
| Audit | `auditDB` | `audit_service` |
| Chargesheet | `chargesheetdb` | `chargesheet_service` |
| Complaint/FIR | `complaintFIR` | `complaint_fir_service` |
| Court case | `officersprocourt` | `court_case_service` |
| Document management | `officersprodocument` | `document_service` |
| Help/support/feedback | `helpandsupportfeedback` | `help_support_service` |
| Investigation | `investigationservice` | `investigation_service` |
| Primary Officers Pro backend | `officerspro` | `officerspro` |
| Profile | `officersproprofile` | `profile_service` |
| Subscription/payment | `subscription_payment_db` | `subscription_payment_service` |

Dashboard, mock server, API gateway, discovery, Keycloak, auth, and Zipkin had no MySQL schema defined in the inspected configuration. Do not create databases for them unless their service owners confirm a new persistence requirement. The service and Config Server owners must update each runtime JDBC URL/username to use the matching Secrets Manager entry under `/officerspro/database/`; schema creation alone does not override stale `root` credentials or Config Server values.

### Local MySQL credentials

Local Docker Compose uses the values you supplied:

```text
MySQL root username: root
MySQL root password: localroot
Primary database: officerspro
Primary app username/password: officerspro / localroot
```

These are local-development credentials only. Do not use them in RDS, a shared host, or a public service. Compose runs SQL from `Officers-pro-backend/officers-pro/database/init/` when MySQL is first initialized; the database check script reapplies it idempotently on later starts. Each local service user uses the requested development password `localroot`.

Start the primary local stack from a Bash shell in the `officerspro` backend folder:

```bash
cp Officers-pro-backend/officers-pro/.env.example Officers-pro-backend/officers-pro/.env
# Edit the remaining Keycloak, AES and S3 placeholders.
./scripts/run-project.sh up
./scripts/run-project.sh status
./scripts/run-project.sh logs backend
./scripts/run-project.sh db
./scripts/run-project.sh stop
```

MySQL binds only to `127.0.0.1:3306`; its data persists in a Docker volume. Connect from the host with `mysql -h 127.0.0.1 -P 3306 -u root -p` and enter `localroot` at the prompt. The launcher refuses to start while required Keycloak/AES/S3 placeholders remain. Create and configure the external Keycloak realm/client and S3 bucket before expecting authenticated/file-upload features to work.

## RDS Terraform and schema bootstrap

`infra/terraform` creates encrypted private MySQL RDS with initial schema `officerspro`, a random AWS-managed master password, and empty per-service Secrets Manager entries. It also creates an SSM-only database-bootstrap EC2 host inside the VPC; that instance has no inbound ports and is the only host (besides backend ECS tasks) allowed to connect to RDS. The bootstrap script generates separate random per-service passwords and stores them in Secrets Manager. The app database accounts do **not** use the RDS administrator/master password.

Before first deployment, create an AWS Secrets Manager JSON secret containing `AES_ENCRYPTION_KEY` (a newly generated 32-byte key) and `KEYCLOAK_CLIENT_SECRET`; verify that the S3 bucket and Keycloak client already exist. Run from the `officerspro` backend folder after AWS CLI credentials and Docker are configured:

```bash
export TF_VAR_s3_bucket_name=your-existing-bucket
export TF_VAR_app_runtime_secret_arn=arn:aws:secretsmanager:ap-south-1:123456789012:secret:officerspro/runtime-AbCdEf
DEPLOY_AWS=yes ./scripts/deploy-aws.sh
```

The guarded script creates ECR, pushes the initial backend image, provisions the RDS/SSM hosts with the backend stopped, initializes schemas/users over SSM, then starts the backend. The frontend GitHub workflow builds and runs the initial frontend image after `FRONTEND_EC2_INSTANCE_ID` and its OIDC role secret have been set. Inspect AWS costs and Terraform's plan/state protection before applying; configure encrypted remote Terraform state before a shared or production deployment.

RDS is private, encrypted, has backups enabled, and is protected from deletion by default. Production usernames/passwords are random and separate from `root/localroot`. The database bootstrap script is at `infra/database/init-rds-databases.sh`. The RDS master secret ARN and per-service secret ARNs are Terraform outputs. Re-running the script preserves existing service passwords and repairs schema grants; rotate a service password by rotating/updating its Secrets Manager secret and restarting that service.

Set `certificate_arn` and narrow `allowed_web_cidrs` for production. Without an ACM certificate the ALB uses HTTP; do not send credentials or personal data over that endpoint. ECS backend tasks and frontend EC2 use separate security groups/IAM roles. The frontend host has no SSH port open and receives deployments through AWS Systems Manager.

## GitHub Actions

### Primary backend repository

The workflow at the project root, `.github/workflows/deploy.yml`, tests and deploys the backend to ECS. It stays at the project root because GitHub Actions only discovers workflows in the root `.github/workflows` directory. Set:

| GitHub setting | Value |
| --- | --- |
| Secret `AWS_DEPLOY_ROLE_ARN` | Terraform output `github_actions_role_arn`. OIDC role ARN; not an AWS username/password. |
| Secret `SUBMODULES_READ_TOKEN` | Fine-grained token with read-only Contents access to private submodules required by checkout. |
| Variable `AWS_REGION` | Terraform AWS region, such as `ap-south-1`. |
| Variable `ECS_CLUSTER` | `officerspro` (or Terraform output `ecs_cluster_name`). |

### Standalone frontend repository (`Config-Server-LLP/officer-pro-frontend`)

The frontend repository workflow `.github/workflows/frontend-ecr.yml` builds/pushes a commit-tagged image. On `main`, it sends the included `scripts/deploy-frontend-on-instance.sh` script to the frontend EC2 host using SSM. That remote script pulls the image, tests it on a temporary port, swaps it into port 80, checks health, and restores the previous image if the new one fails.

Set these frontend repository settings:

| GitHub setting | Value |
| --- | --- |
| Secret `AWS_ECR_PUSH_ROLE_ARN` | Terraform output `frontend_github_actions_role_arn` (trusts the frontend repo `main` branch). |
| Variable `FRONTEND_EC2_INSTANCE_ID` | Terraform output `frontend_instance_id`. |
| Variable `AWS_REGION` | Same region where the ECR repository and EC2 instance were created. |

The frontend OIDC role can push only to its ECR repo and send an SSM command only to the frontend instance. The frontend instance IAM role can pull that image and register with SSM. There are no AWS usernames/passwords or SSH private keys in GitHub. `VITE_*` frontend variables are public build-time values; never put credentials in them.

## Remaining integration and checks

Local Compose and RDS now provide separate schemas, but central Config Server files and the service-specific Compose overrides still contain conflicting schema/user defaults. Update each service's `SPRING_DATASOURCE_URL`, username and password secret together before deploying that microservice; doing so changes actual runtime configuration and requires checking each service's expected migration/schema. The missing/empty submodules listed above also prevent validation of a complete application deployment.

Changes inside `officer-pro-frontend` and `officers-pro` are changes to separate repositories nested in this checkout. Commit/push each nested repository's files first, then update the parent Git submodule pointer. Inspect the status of each repository before pushing; other submodules may already have local work.
