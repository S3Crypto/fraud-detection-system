# Integration Testing

## Overview

Integration testing ensures that all components of the Real-Time Fraud Detection System work together as expected. This includes verifying transaction processing, fraud analysis, and data storage.

## Test Environment Setup

- **Services**: Ensure all services (Transaction Ingestion, Fraud Analysis, ML Component) are running.
- **Docker Compose**: Optionally use Docker Compose to set up a local environment with Kafka, Couchbase, and simulated AWS Neptune.
- **Configuration**: Use environment variables or a configuration file for test-specific settings.

## Test Cases

### Transaction Flow Test

- **Objective**: Verify end-to-end transaction processing.
- **Steps**:
  1. Send a valid transaction to the Transaction Ingestion Service.
  2. Confirm propagation through Kafka.
  3. Verify processing by the Fraud Analysis Service and ML Component.
  4. Check storage in Couchbase and AWS Neptune.

### Error Flow Test

- **Objective**: Ensure proper handling of malformed transactions.
- **Steps**:
  1. Send a transaction with missing fields.
  2. Verify a 400 error response and no further processing.

## Manual Testing

1. Start all services.
2. Send a sample transaction using cURL or Postman.
3. Verify logs and data storage.

## Running Tests in CI/CD

- Extend the GitHub Actions workflow to include integration tests.
- Ensure the environment is correctly configured for testing.
