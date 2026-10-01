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
    officers-pro         = { database = "officerspro", username = "officerspro" }
    profile              = { database = "officersproprofile", username = "profile_service" }
    subscription-payment = { database = "subscription_payment_db", username = "subscription_payment_service" }
  }
}
