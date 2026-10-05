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
      { name = "SERVER_PORT", value = "8080" },
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
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.http, aws_iam_role_policy.task_secrets]
}

resource "aws_cloudwatch_log_group" "complaint_fir" {
  name              = "/ecs/officerspro/complaint-fir"
  retention_in_days = 30
}

resource "aws_service_discovery_http_namespace" "microservices" {
  name        = "officerspro"
  description = "Private ECS Service Connect namespace for OfficersPro services"
}

resource "aws_ecs_task_definition" "complaint_fir" {
  family                   = "officerspro-complaint-fir"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name      = "complaint-fir"
    image     = "${aws_ecr_repository.complaint_fir.repository_url}:latest"
    essential = true
    portMappings = [{
      name          = "http"
      containerPort = 8080
      hostPort      = 8080
      protocol      = "tcp"
    }]
    environment = [
      { name = "SERVER_PORT", value = "8082" },
      { name = "SPRING_CONFIG_IMPORT", value = "optional:configserver:http://127.0.0.1:8888" },
      { name = "SPRING_CLOUD_CONFIG_FAIL_FAST", value = "false" },
      { name = "SPRING_MAIN_ALLOW_BEAN_DEFINITION_OVERRIDING", value = "true" },
      { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${aws_db_instance.main.address}:3306/${local.database_services["complaint-fir"].database}?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC" },
      { name = "SPRING_DATASOURCE_USERNAME", value = local.database_services["complaint-fir"].username },
      { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "update" },
      { name = "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI", value = var.keycloak_issuer_uri },
      { name = "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI", value = "${var.keycloak_issuer_uri}/protocol/openid-connect/certs" },
      { name = "DOCUMENT_SERVICE_URL", value = "http://document-management-service:8080" },
      { name = "SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE", value = "50MB" },
      { name = "SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE", value = "50MB" },
      { name = "EUREKA_CLIENT_REGISTER_WITH_EUREKA", value = "false" },
      { name = "EUREKA_CLIENT_FETCH_REGISTRY", value = "false" }
    ]
    secrets = [
      { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = "${aws_secretsmanager_secret.database_users["complaint-fir"].arn}:password::" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.complaint_fir.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "complaint_fir" {
  name                              = "officerspro-complaint-fir"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.complaint_fir.arn
  desired_count                     = var.microservices_desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 180

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.complaint_fir.arn
    container_name   = "complaint-fir"
    container_port   = 8080
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.microservices.arn

    service {
      port_name      = "http"
      discovery_name = "complaint-fir-service"

      client_alias {
        dns_name = "complaint-fir-service"
        port     = 8080
      }
    }
  }

  depends_on = [
    aws_lb_listener_rule.complaint_fir,
    aws_iam_role_policy.task_secrets,
    aws_iam_role_policy_attachment.task_execution
  ]
}

resource "aws_cloudwatch_log_group" "microservices" {
  for_each          = local.microservices
  name              = "/ecs/officerspro/${each.key}"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "microservices" {
  for_each                 = local.microservices
  family                   = "officerspro-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name      = each.key
    image     = "${aws_ecr_repository.microservices[each.key].repository_url}:latest"
    essential = true
    portMappings = [{
      name          = "http"
      containerPort = each.value.port
      hostPort      = each.value.port
      protocol      = "tcp"
    }]
    environment = concat([
      { name = "SERVER_PORT", value = tostring(each.value.port) },
      { name = "SPRING_CONFIG_IMPORT", value = "optional:configserver:http://127.0.0.1:8888" },
      { name = "SPRING_CLOUD_CONFIG_FAIL_FAST", value = "false" },
      { name = "EUREKA_CLIENT_ENABLED", value = "false" },
      { name = "EUREKA_CLIENT_REGISTER_WITH_EUREKA", value = "false" },
      { name = "EUREKA_CLIENT_FETCH_REGISTRY", value = "false" },
      { name = "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI", value = var.keycloak_issuer_uri },
      { name = "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI", value = "${var.keycloak_issuer_uri}/protocol/openid-connect/certs" },
      { name = "MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE", value = "health,info" }
      ], each.value.database == null ? [] : [
      { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${aws_db_instance.main.address}:3306/${local.database_services[each.value.database].database}?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC" },
      { name = "SPRING_DATASOURCE_USERNAME", value = local.database_services[each.value.database].username },
      { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "update" }
      ], each.key == "investigation-service" ? [
      { name = "SERVICES_FERRIST_URL", value = "http://chargesheet-generator-service:${local.microservices["chargesheet-generator-service"].port}/ferrist" },
      { name = "SERVICES_DOCUMENT_URL", value = "http://document-management-service:${local.microservices["document-management-service"].port}/api/documents" }
      ] : [], each.key == "subscription-payment-service" ? [
      { name = "ADMIN_SERVICE_URL", value = "http://admin-backend:${local.microservices["admin-backend"].port}" },
      { name = "PROFILE_SERVICE_URL", value = "http://profile-service:${local.microservices["profile-service"].port}" }
      ] : [], each.key == "chargesheet-generator-service" ? [
      { name = "EXTERNAL_COURTCASE_BASE_URL", value = "http://court-case-management-service:${local.microservices["court-case-management-service"].port}/courtcases" }
      ] : [], contains(["investigation-service", "profile-service"], each.key) ? [
      { name = "AUTH_SERVICE_BASE_URL", value = "https://${var.application_domain}/api/auth" }
    ] : [])
    secrets = concat(each.value.database == null ? [] : [
      { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = "${aws_secretsmanager_secret.database_users[each.value.database].arn}:password::" }
      ], each.key == "subscription-payment-service" && var.subscription_payment_secret_arn != "" ? [
      { name = "RAZORPAY_KEY_ID", valueFrom = "${var.subscription_payment_secret_arn}:RAZORPAY_KEY_ID::" },
      { name = "RAZORPAY_KEY_SECRET", valueFrom = "${var.subscription_payment_secret_arn}:RAZORPAY_KEY_SECRET::" },
      { name = "RAZORPAY_WEBHOOK_SECRET", valueFrom = "${var.subscription_payment_secret_arn}:RAZORPAY_WEBHOOK_SECRET::" },
      { name = "SPRING_MAIL_USERNAME", valueFrom = "${var.subscription_payment_secret_arn}:SPRING_MAIL_USERNAME::" },
      { name = "SPRING_MAIL_PASSWORD", valueFrom = "${var.subscription_payment_secret_arn}:SPRING_MAIL_PASSWORD::" }
    ] : [])
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.microservices[each.key].name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "microservices" {
  for_each                          = local.microservices
  name                              = "officerspro-${each.key}"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.microservices[each.key].arn
  desired_count                     = var.microservices_desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 180

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.microservices[each.key].arn
    container_name   = each.key
    container_port   = each.value.port
  }

  service_connect_configuration {
    enabled   = true
    namespace = aws_service_discovery_http_namespace.microservices.arn

    service {
      port_name      = "http"
      discovery_name = each.key

      client_alias {
        dns_name = each.key
        port     = each.value.port
      }
    }
  }

  depends_on = [
    aws_lb_listener_rule.microservices,
    aws_iam_role_policy.task_secrets,
    aws_iam_role_policy_attachment.task_execution
  ]
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
