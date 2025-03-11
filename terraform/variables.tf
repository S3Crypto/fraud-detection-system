variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "kafka_instance_type" {
  description = "Instance type for Kafka brokers"
  type        = string
  default     = "kafka.t3.small"
}

variable "kafka_broker_nodes" {
  description = "Number of Kafka broker nodes"
  type        = number
  default     = 3
}

variable "ecs_container_insights" {
  description = "Enable CloudWatch Container Insights for ECS"
  type        = bool
  default     = true
}
