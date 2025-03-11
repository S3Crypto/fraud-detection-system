# Fraud Detection System

A distributed system for real-time transaction fraud detection using microservices architecture.

## System Architecture

The system consists of three main components:

1. **Transaction Service** (Node.js/TypeScript)
   - REST API for transaction ingestion
   - Kafka producer for async processing

2. **Fraud Analysis Service** (Node.js/TypeScript)
   - Kafka consumer for transaction processing
   - Integration with ML component

3. **ML Component** (Python)
   - Machine learning model for fraud scoring
   - Model training and inference APIs

## Project Structure

```
.
├── transaction-service/     # Transaction ingestion REST API
├── fraud-analysis-service/ # Kafka consumer service
├── ml-component/          # ML model and scoring
├── terraform/            # Infrastructure as Code
└── ci-cd/               # CI/CD configuration
```

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker
- Terraform

### Local Development
Instructions for local development setup will be added as components are implemented.

## Infrastructure

Infrastructure is managed using Terraform and deployed on cloud infrastructure.

## CI/CD

Continuous Integration and Deployment is handled through GitHub Actions with separate pipelines for each service.
