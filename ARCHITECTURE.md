# System Architecture

## Overview

The Real-Time Fraud Detection System is designed to process transactions in real-time, analyze them for potential fraud, and store relevant data for further analysis. It consists of several key components:

- **Transaction Ingestion Service**: Handles incoming transaction data and publishes it to Kafka.
- **Fraud Analysis Service**: Consumes transaction data from Kafka, applies fraud detection algorithms, and interacts with the ML component.
- **Python ML Component**: Provides fraud scoring based on transaction data.
- **Data Storage Integration**: Utilizes Couchbase for transactional storage and AWS Neptune for graph-based analysis.
- **CI/CD Pipeline**: Automates testing and deployment processes using GitHub Actions.

## Architecture Diagram

![Architecture Diagram](./architecture-diagram.png)

## Component Interactions

1. **Transaction Flow**:
   - Transactions are ingested by the Transaction Ingestion Service and published to Kafka.
   - The Fraud Analysis Service subscribes to Kafka, processes transactions, and calls the ML component for fraud scoring.
   - Results are stored in Couchbase, and relationships are stored in AWS Neptune for flagged transactions.

2. **Data Flow**:
   - Transaction data flows from ingestion through analysis to storage, enabling real-time fraud detection and historical analysis.

3. **CI/CD Pipeline**:
   - The pipeline ensures code quality and functionality through automated tests and builds.
