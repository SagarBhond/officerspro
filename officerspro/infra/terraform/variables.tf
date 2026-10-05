variable "aws_region" {
  description = "AWS region for the deployment."
  type        = string
  default     = "ap-south-1"
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the deployment role, in owner/name format."
  type        = string
  default     = "SagarBhond/officerspro"
}

variable "github_owner_id" {
  description = "Immutable GitHub owner ID used in GitHub Actions OIDC subject claims."
  type        = string
  default     = "123446256"
}

variable "github_repository_id" {
  description = "Immutable GitHub backend repository ID used in OIDC subject claims."
  type        = string
  default     = "1394778224"
}

variable "frontend_github_repository" {
  description = "GitHub repository that builds the frontend and deploys it to the frontend EC2 instance."
  type        = string
  default     = "SagarBhond/officer-pro-frontend"
}

variable "frontend_github_repository_id" {
  description = "Immutable GitHub frontend repository ID used in OIDC subject claims."
  type        = string
  default     = "1394776617"
}

variable "vpc_cidr" {
  description = "CIDR range for the application VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "allowed_web_cidrs" {
  description = "IPv4 CIDRs allowed to access the load balancer. Use 0.0.0.0/0 for a public site."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "database_instance_class" {
  description = "RDS MySQL instance size."
  type        = string
  default     = "db.t4g.micro"
}

variable "database_bootstrap_instance_type" {
  description = "Small SSM-managed EC2 host used to create RDS schemas and per-service users."
  type        = string
  default     = "t3.micro"
}

variable "frontend_instance_type" {
  description = "EC2 instance size used to run the frontend container."
  type        = string
  default     = "t3.small"
}

variable "backend_desired_count" {
  description = "Backend ECS tasks; keep at 0 until the database initialization script has run."
  type        = number
  default     = 1

  validation {
    condition     = var.backend_desired_count >= 0
    error_message = "backend_desired_count must be zero or greater."
  }
}

variable "microservices_desired_count" {
  description = "Desired count for complaint/FIR and auxiliary backend services during staged deployment."
  type        = number
  default     = 1

  validation {
    condition     = var.microservices_desired_count >= 0
    error_message = "microservices_desired_count must be zero or greater."
  }
}

variable "database_multi_az" {
  description = "Enable Multi-AZ RDS availability (increases cost)."
  type        = bool
  default     = false
}

variable "database_deletion_protection" {
  description = "Protect the database from accidental Terraform deletion."
  type        = bool
  default     = true
}

variable "app_runtime_secret_arn" {
  description = "Secrets Manager secret ARN containing AES_ENCRYPTION_KEY and KEYCLOAK_CLIENT_SECRET JSON fields."
  type        = string
}

variable "subscription_payment_secret_arn" {
  description = "Optional Secrets Manager secret ARN containing payment and mail credentials for the subscription service."
  type        = string
  default     = ""
}

variable "s3_bucket_name" {
  description = "Existing S3 bucket used by the backend."
  type        = string
}

variable "keycloak_server_url" {
  description = "Public Keycloak base URL."
  type        = string
  default     = "https://auth.sagarbhond.site/"
}

variable "keycloak_issuer_uri" {
  description = "Public Keycloak realm issuer URL."
  type        = string
  default     = "https://auth.sagarbhond.site/realms/OfficerPro"
}

variable "keycloak_realm" {
  description = "Keycloak realm name."
  type        = string
  default     = "OfficerPro"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS on demo.sagarbhond.site."
  type        = string
  default     = "arn:aws:acm:ap-south-1:882040517001:certificate/7c86f363-09d3-4d58-b645-c41bd7287298"
}

variable "application_domain" {
  description = "Public DNS name routed to the application load balancer."
  type        = string
  default     = "demo.sagarbhond.site"
}

variable "keycloak_domain" {
  description = "Public hostname for the Keycloak service."
  type        = string
  default     = "auth.sagarbhond.site"
}

variable "keycloak_desired_count" {
  description = "Number of Keycloak tasks. Use zero until the image and runtime secrets are ready."
  type        = number
  default     = 1

  validation {
    condition     = var.keycloak_desired_count >= 0
    error_message = "keycloak_desired_count must be zero or greater."
  }
}
