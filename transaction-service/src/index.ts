import express from 'express';
import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'transaction-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Initialize Kafka producer
const kafka = new Kafka({
  clientId: 'transaction-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Transaction ingestion endpoint
app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = req.body;
    
    // Validate transaction data (to be implemented)
    
    // Send transaction to Kafka for processing
    await producer.send({
      topic: 'transactions',
      messages: [
        { value: JSON.stringify(transaction) },
      ],
    });
    
    logger.info('Transaction sent to Kafka', { transactionId: transaction.id });
    
    res.status(202).json({
      message: 'Transaction accepted for processing',
      transactionId: transaction.id,
    });
  } catch (error) {
    logger.error('Error processing transaction', { error });
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// Start the server
async function startServer() {
  try {
    await producer.connect();
    logger.info('Connected to Kafka');
    
    app.listen(port, () => {
      logger.info(`Transaction service listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await producer.disconnect();
  process.exit(0);
});
