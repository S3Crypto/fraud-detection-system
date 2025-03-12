/**
 * Configuration for the Transaction Service
 * 
 * This file centralizes all configuration parameters for the service.
 * In a production environment, these would typically be loaded from
 * environment variables.
 */

export const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
  },
  
  // Kafka configuration
  kafka: {
    clientId: 'transaction-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topic: process.env.KAFKA_TOPIC || 'transactions',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};
