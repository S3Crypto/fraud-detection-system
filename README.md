# Fraud Detection System

A distributed system for real-time transaction fraud detection using microservices architecture.

## Project Overview

The Real-Time Fraud Detection System is designed to process transactions in real-time, analyze them for potential fraud, and store relevant data for further analysis. It consists of several key components:

- **Transaction Ingestion Service**: Handles incoming transaction data and publishes it to Kafka.
- **Fraud Analysis Service**: Consumes transaction data from Kafka, applies fraud detection algorithms, and interacts with the ML component.
- **Python ML Component**: Provides fraud scoring based on transaction data.
- **Data Storage Integration**: Utilizes Couchbase for transactional storage and AWS Neptune for graph-based analysis.
- **CI/CD Pipeline**: Automates testing and deployment processes using GitHub Actions.

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

## Architecture Diagram

![Architecture Diagram](./architecture-diagram.png)

## Project Structure

```
.
├── transaction-service/     # Transaction ingestion REST API
├── fraud-analysis-service/ # Kafka consumer service
├── ml-component/          # ML model and scoring
├── terraform/            # Infrastructure as Code
└── ci-cd/               # CI/CD configuration
```

## Setup and Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker
- Terraform

### Environment Setup

1. **Transaction Ingestion Service**:
   - Navigate to `transaction-service` and run `npm install`.
   - Set up environment variables in a `.env` file.

2. **Fraud Analysis Service**:
   - Navigate to `fraud-analysis-service` and run `npm install`.
   - Set up environment variables in a `.env` file.

3. **ML Component**:
   - Navigate to `ml-component` and run `pip install -r requirements.txt`.
   - Set up environment variables in a `.env` file.

### Running the Application

- **Transaction Ingestion Service**: Run `npm start` in the `transaction-service` directory.
- **Fraud Analysis Service**: Run `npm start` in the `fraud-analysis-service` directory.
- **ML Component**: Run `python app.py` in the `ml-component` directory.

### CI/CD Pipeline Overview

The CI/CD pipeline is configured using GitHub Actions and includes:
- Linting and testing for Node.js/TypeScript and Python components.
- Building and deployment processes.

### Troubleshooting

- Ensure all environment variables are correctly set.
- Check service logs for error messages.
- Verify network connectivity between services.

## Infrastructure

Infrastructure is managed using Terraform and deployed on cloud infrastructure.

## CI/CD

Continuous Integration and Deployment is handled through GitHub Actions with separate pipelines for each service.
