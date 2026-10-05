resource "aws_ecs_cluster" "main" {
  name = "officerspro"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/officerspro/backend"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "officerspro-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${aws_ecr_repository.backend.repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 8082
      hostPort      = 8082
      protocol      = "tcp"
    }]
    environment = [
      { name = "SERVER_PORT", value = "8082" },
      { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${aws_db_instance.main.address}:3306/${local.database_services["officers-pro"].database}" },
      { name = "SPRING_DATASOURCE_USERNAME", value = local.database_services["officers-pro"].username },
      { name = "AWS_REGION", value = var.aws_region },
      { name = "AWS_S3_BUCKET", value = var.s3_bucket_name },
      { name = "KEYCLOAK_SERVER_URL", value = var.keycloak_server_url },
      { name = "KEYCLOAK_ISSUER_URI", value = var.keycloak_issuer_uri },
      { name = "KEYCLOAK_REALM", value = var.keycloak_realm }
    ]
    secrets = [
      { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = "${aws_secretsmanager_secret.database_users["officers-pro"].arn}:password::" },
      { name = "AES_ENCRYPTION_KEY", valueFrom = "${var.app_runtime_secret_arn}:AES_ENCRYPTION_KEY::" },
      { name = "KEYCLOAK_CLIENT_SECRET", valueFrom = "${var.app_runtime_secret_arn}:KEYCLOAK_CLIENT_SECRET::" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.backend.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "officerspro-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8082
  }

  depends_on = [aws_lb_listener.http, aws_iam_role_policy.task_secrets]
}

resource "aws_cloudwatch_log_group" "keycloak" {
  name              = "/ecs/officerspro/keycloak"
  retention_in_days = 30
}

resource "aws_secretsmanager_secret" "keycloak_admin" {
  name                    = "/officerspro/keycloak/admin"
  description             = "Initial Keycloak administrator login"
  recovery_window_in_days = 30
}

resource "aws_ecs_task_definition" "keycloak" {
  family                   = "officerspro-keycloak"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "keycloak"
    image     = "${aws_ecr_repository.keycloak.repository_url}:latest"
    essential = true
    portMappings = [{
      containerPort = 8080
      hostPort      = 8080
      protocol      = "tcp"
    }]
    environment = [
      { name = "KC_DB", value = "mysql" },
      { name = "KC_DB_URL_HOST", value = aws_db_instance.main.address },
      { name = "KC_DB_URL_PORT", value = "3306" },
      { name = "KC_DB_URL_DATABASE", value = local.database_services["keycloak"].database },
      { name = "KC_DB_USERNAME", value = local.database_services["keycloak"].username },
      { name = "KC_HTTP_ENABLED", value = "true" },
      { name = "KC_HOSTNAME", value = "https://${var.keycloak_domain}" },
      { name = "KC_PROXY_HEADERS", value = "xforwarded" },
      { name = "KC_HEALTH_ENABLED", value = "true" }
    ]
    secrets = [
      { name = "KC_DB_PASSWORD", valueFrom = "${aws_secretsmanager_secret.database_users["keycloak"].arn}:password::" },
      { name = "KC_BOOTSTRAP_ADMIN_USERNAME", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:username::" },
      { name = "KC_BOOTSTRAP_ADMIN_PASSWORD", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:password::" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.keycloak.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "keycloak" {
  name                              = "officerspro-keycloak"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.keycloak.arn
  desired_count                     = var.keycloak_desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 300

  deployment_circuit_breaker {
    enable   = true
    rollback = false
  }

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.keycloak.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.keycloak.arn
    container_name   = "keycloak"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy.task_secrets,
    aws_iam_role_policy_attachment.task_execution
  ]
}
