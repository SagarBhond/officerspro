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

variable "frontend_github_repository" {
  description = "GitHub repository that builds the frontend and deploys it to the frontend EC2 instance."
  type        = string
  default     = "SagarBhond/officer-pro-frontend"
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

variable "s3_bucket_name" {
  description = "Existing S3 bucket used by the backend."
  type        = string
}

variable "keycloak_server_url" {
  description = "Externally managed Keycloak base URL."
  type        = string
  default     = "https://dev-keycloak.officerspro.in/"
}

variable "keycloak_issuer_uri" {
  description = "Externally managed Keycloak realm issuer URL."
  type        = string
  default     = "https://dev-keycloak.officerspro.in/realms/officers-pro"
}

variable "keycloak_realm" {
  description = "Keycloak realm name."
  type        = string
  default     = "officers-pro"
}

variable "certificate_arn" {
  description = "Optional ACM certificate ARN for HTTPS. Without it, the ALB serves HTTP."
  type        = string
  default     = ""
}
