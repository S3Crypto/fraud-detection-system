output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "kafka_bootstrap_brokers" {
  description = "Kafka bootstrap broker connection string"
  value       = module.kafka.bootstrap_brokers
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "transaction_service_url" {
  description = "URL for the transaction service"
  value       = module.ecs.transaction_service_url
}

output "fraud_analysis_service_log_group" {
  description = "CloudWatch log group for the fraud analysis service"
  value       = module.ecs.fraud_analysis_service_log_group
}
