import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'fraud-analysis-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Initialize Kafka consumer
const kafka = new Kafka({
  clientId: 'fraud-analysis-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const consumer = kafka.consumer({ groupId: 'fraud-analysis-group' });

// ML service integration (placeholder)
async function callMlService(transaction: any): Promise<number> {
  // This will be replaced with actual ML service API call
  logger.info('Calling ML service for fraud scoring', { transactionId: transaction.id });
  
  // Simulate ML scoring (0-100, higher = more likely fraud)
  return Math.random() * 100;
}

// Process transaction
async function processTransaction(transaction: any): Promise<void> {
  try {
    // Get fraud score from ML service
    const fraudScore = await callMlService(transaction);
    
    logger.info('Transaction processed', { 
      transactionId: transaction.id, 
      fraudScore 
    });
    
    // Apply business rules based on fraud score
    if (fraudScore > 80) {
      logger.warn('High fraud risk detected', { 
        transactionId: transaction.id, 
        fraudScore 
      });
      // Here we would trigger alerts, block transaction, etc.
    }
  } catch (error) {
    logger.error('Error processing transaction', { error });
  }
}

// Start the consumer
async function startConsumer() {
  try {
    await consumer.connect();
    logger.info('Connected to Kafka');
    
    await consumer.subscribe({ topic: 'transactions', fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const transaction = JSON.parse(message.value?.toString() || '{}');
          logger.info('Received transaction', { transactionId: transaction.id });
          
          await processTransaction(transaction);
        } catch (error) {
          logger.error('Error processing message', { error });
        }
      },
    });
  } catch (error) {
    logger.error('Failed to start consumer', { error });
    process.exit(1);
  }
}

startConsumer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await consumer.disconnect();
  process.exit(0);
});
