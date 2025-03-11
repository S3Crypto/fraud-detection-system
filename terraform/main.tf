terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Will be configured per environment
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "fraud-detection-system"
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Network Configuration
module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  aws_region  = var.aws_region
}

# Kafka (MSK) Configuration
module "kafka" {
  source = "./modules/kafka"

  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}

# ECS Configuration for Services
module "ecs" {
  source = "./modules/ecs"

  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}
