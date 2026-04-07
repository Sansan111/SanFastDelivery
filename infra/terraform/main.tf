terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

/*
  This Terraform is intentionally a minimal scaffold.
  Next step: add modules/resources for VPC, ECS, ALB, RDS, etc.
*/

