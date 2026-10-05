terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "OfficersPro"
      ManagedBy = "Terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_route53_zone" "public" {
  name         = "sagarbhond.site."
  private_zone = false
}

locals {
  database_services = {
    admin                = { database = "admindb", username = "admin_service" }
    audit                = { database = "auditDB", username = "audit_service" }
    chargesheet          = { database = "chargesheetdb", username = "chargesheet_service" }
    complaint-fir        = { database = "complaintFIR", username = "complaint_fir_service" }
    court-case           = { database = "officersprocourt", username = "court_case_service" }
    document             = { database = "officersprodocument", username = "document_service" }
    help-support         = { database = "helpandsupportfeedback", username = "help_support_service" }
    investigation        = { database = "investigationservice", username = "investigation_service" }
    keycloak             = { database = "keycloak", username = "keycloak_service" }
    officers-pro         = { database = "officerspro", username = "officerspro" }
    profile              = { database = "officersproprofile", username = "profile_service" }
    subscription-payment = { database = "subscription_payment_db", username = "subscription_payment_service" }
  }

  microservices = {
    "admin-backend" = {
      port        = 8081
      database    = "admin"
      priority    = 20
      paths       = ["/api/admin/users*", "/api/admin/plans*", "/api/admin/entitlements*", "/api/public/plans*", "/api/admin/login*"]
      health_path = "/actuator/health"
    }
    "audit-service" = {
      port        = 8086
      database    = "audit"
      priority    = 21
      paths       = ["/api/requests*", "/api/audit*"]
      health_path = "/"
    }
    "chargesheet-generator-service" = {
      port        = 8095
      database    = "chargesheet"
      priority    = 22
      paths       = ["/chargesheet*", "/ferrist*"]
      health_path = "/actuator/health"
    }
    "court-case-management-service" = {
      port        = 8080
      database    = "court-case"
      priority    = 23
      paths       = ["/courtcases*", "/summon*", "/judgement*", "/integration/chargesheets*", "/mock-court-api*"]
      health_path = "/actuator/health"
    }
    "dashboard-service" = {
      port        = 8080
      database    = null
      priority    = 24
      paths       = ["/api/admin/*"]
      health_path = "/actuator/health"
    }
    "document-management-service" = {
      port        = 8080
      database    = "document"
      priority    = 25
      paths       = ["/api/documents*"]
      health_path = "/actuator/health"
    }
    "help-support-feedback-service" = {
      port        = 8080
      database    = "help-support"
      priority    = 26
      paths       = ["/api/helpandsupport*"]
      health_path = "/actuator/health"
    }
    "investigation-service" = {
      port        = 8080
      database    = "investigation"
      priority    = 27
      paths       = ["/api/casediary*", "/api/evidence*", "/api/witnesses*", "/api/investigation*"]
      health_path = "/"
    }
    "profile-service" = {
      port        = 8080
      database    = "profile"
      priority    = 28
      paths       = ["/api/profile*", "/internal/officers*"]
      health_path = "/actuator/health"
    }
    "subscription-payment-service" = {
      port        = 8080
      database    = "subscription-payment"
      priority    = 29
      paths       = ["/api/payments*", "/api/payment-history*", "/api/subscriptions*"]
      health_path = "/actuator/health"
    }
  }

  microservice_ports = toset([
    for service in values(local.microservices) : service.port
  ])
}
