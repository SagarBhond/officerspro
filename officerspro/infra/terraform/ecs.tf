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
