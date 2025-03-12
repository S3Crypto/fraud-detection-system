import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import winston from 'winston';
import { config } from './config';
import { storeTransaction, getTransaction } from './db';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: config.logging.level,
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

// Mock Kafka producer for development
const mockProducer = {
  connect: async () => {
    logger.info('Mock Kafka producer connected');
  },
  send: async ({ topic, messages }: { topic: string, messages: any[] }) => {
    logger.info('Mock Kafka producer sent message', { topic, messages });
  },
  disconnect: async () => {
    logger.info('Mock Kafka producer disconnected');
  }
};

const producer = mockProducer;

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Get transaction by ID endpoint
app.get('/transaction/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const transaction = await getTransaction(id);
    res.status(200).json(transaction);
  } catch (error) {
    logger.error('Error retrieving transaction', { error, transactionId: id });
    if ((error as Error).message === 'Document not found') {
      res.status(404).json({ error: 'Transaction not found' });
    } else {
      res.status(500).json({ error: 'Failed to retrieve transaction' });
    }
  }
});

// Transaction ingestion endpoint
app.post('/transaction', async (req: Request, res: Response) => {
  const transaction = req.body;
  
  // Basic validation for required fields
  if (!transaction.id || !transaction.amount || !transaction.timestamp) {
    logger.warn('Invalid transaction data received', { transaction });
    return res.status(400).json({ error: 'Missing required transaction fields: id, amount, timestamp' });
  }
  
  try {
    // Send transaction to mock Kafka for processing
    await producer.send({
      topic: config.kafka.topic,
      messages: [
        { value: JSON.stringify(transaction) },
      ],
    });
    
    logger.info('Transaction sent to Kafka', { transactionId: transaction.id });

    // Store transaction in mock database
    await storeTransaction(transaction);
    
    res.status(200).json({
      status: 'Transaction received and published.',
      transactionId: transaction.id,
    });
  } catch (error) {
    logger.error('Error processing transaction', { error, transaction });
    res.status(500).json({ error: 'Failed to process transaction.' });
  }
});

// Start the server
async function startServer() {
  try {
    await producer.connect();
    logger.info('Mock services initialized');
    
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`Transaction service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await producer.disconnect();
  process.exit(0);
});

export { app }; // Export for testing
