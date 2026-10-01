output "application_url" {
  description = "Frontend URL. Configure an ACM certificate to enable HTTPS."
  value       = "${var.certificate_arn == "" ? "http" : "https"}://${aws_lb.main.dns_name}"
}

output "load_balancer_dns_name" {
  description = "DNS name of the application load balancer."
  value       = aws_lb.main.dns_name
}

output "github_actions_role_arn" {
  description = "Set this value as the AWS_DEPLOY_ROLE_ARN GitHub Actions secret."
  value       = aws_iam_role.github_actions.arn
}

output "ecs_cluster_name" {
  description = "Set this value as the ECS_CLUSTER GitHub Actions variable."
  value       = aws_ecs_cluster.main.name
}

output "database_endpoint" {
  description = "Private RDS endpoint, reachable only by ECS tasks."
  value       = aws_db_instance.main.address
}

output "database_credentials_secret_arn" {
  description = "RDS-managed master credentials; only the SSM database-bootstrap instance reads this secret."
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
}

output "backend_ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "frontend_github_actions_role_arn" {
  description = "Set as AWS_ECR_PUSH_ROLE_ARN in Config-Server-LLP/officer-pro-frontend."
  value       = aws_iam_role.github_frontend.arn
}

output "frontend_instance_id" {
  description = "Set as the FRONTEND_EC2_INSTANCE_ID Actions variable in the frontend repository."
  value       = aws_instance.frontend.id
}

output "frontend_instance_public_dns" {
  description = "Frontend EC2 public DNS; production traffic should use the load balancer."
  value       = aws_instance.frontend.public_dns
}

output "database_bootstrap_instance_id" {
  description = "SSM-only EC2 ID used to initialize the RDS service schemas."
  value       = aws_instance.database_bootstrap.id
}

output "database_service_secret_arns" {
  description = "Per-service MySQL credentials stored in Secrets Manager after running the RDS initializer."
  value       = { for service, secret in aws_secretsmanager_secret.database_users : service => secret.arn }
}
