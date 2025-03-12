import dotenv from 'dotenv';
import { Kafka, EachMessagePayload } from 'kafkajs';
import winston from 'winston';
import { processTransaction } from './processTransaction';
import { config } from './config';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: config.logging.level,
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
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

const consumer = kafka.consumer({ groupId: config.kafka.groupId });

// Start the consumer
async function startConsumer() {
  try {
    await consumer.connect();
    logger.info('Connected to Kafka', { brokers: config.kafka.brokers });
    
    await consumer.subscribe({ topic: config.kafka.topic, fromBeginning: false });
    logger.info(`Subscribed to topic: ${config.kafka.topic}`);
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        try {
          // Parse the message value
          const messageValue = message.value?.toString() || '{}';
          const transaction = JSON.parse(messageValue);
          
          logger.info('Received transaction', { 
            transactionId: transaction.id,
            topic,
            partition,
            offset: message.offset
          });
          
          // Process the transaction
          await processTransaction(transaction);
        } catch (error) {
          logger.error('Error processing message', { 
            error: (error as Error).message,
            stack: (error as Error).stack
          });
        }
      },
    });
  } catch (error) {
    logger.error('Failed to start consumer', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    process.exit(1);
  }
}

// Start the consumer
logger.info('Starting Fraud Analysis Service');
startConsumer().catch(error => {
  logger.error('Unhandled error', { 
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await consumer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await consumer.disconnect();
  process.exit(0);
});
