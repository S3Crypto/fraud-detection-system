/**
 * Configuration for the Fraud Analysis Service
 * 
 * This file centralizes all configuration parameters for the service.
 * In a production environment, these would typically be loaded from
 * environment variables.
 */

export const config = {
  // Kafka configuration
  kafka: {
    clientId: 'fraud-analysis-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topic: process.env.KAFKA_TOPIC || 'transactions',
    groupId: 'fraud-analysis-group',
  },
  
  // ML service configuration
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:5000',
    scoreEndpoint: process.env.ML_SCORE_ENDPOINT || '/score',
    timeout: parseInt(process.env.ML_SERVICE_TIMEOUT || '5000', 10),
  },
  
  // Fraud detection configuration
  fraudDetection: {
    threshold: parseFloat(process.env.FRAUD_THRESHOLD || '0.8'),
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};
