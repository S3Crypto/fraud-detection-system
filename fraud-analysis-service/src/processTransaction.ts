import axios, { AxiosError } from 'axios';
import winston from 'winston';
import { config } from './config';
import { storeRelationship } from './neptuneClient';

// Initialize logger
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

/**
 * Transaction interface defining the expected structure of transaction data
 */
export interface Transaction {
  id: string;
  amount: number;
  timestamp: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Response from the ML service
 */
interface MlServiceResponse {
  fraudScore: number;
  explanation?: string;
}

/**
 * Process a transaction by validating it and sending it to the ML service for fraud scoring
 * 
 * @param transaction The transaction to process
 * @returns The fraud score (0-1, higher means more likely fraud)
 */
export async function processTransaction(transaction: any): Promise<number | null> {
  try {
    // Validate required fields
    if (!transaction.id || !transaction.amount || !transaction.timestamp) {
      logger.error('Incomplete transaction data', { transaction });
      return null;
    }

    logger.info('Processing transaction', { transactionId: transaction.id });

    // Call ML service for fraud scoring
    const response = await axios.post<MlServiceResponse>(
      `${config.mlService.url}${config.mlService.scoreEndpoint}`,
      transaction,
      { timeout: config.mlService.timeout }
    );

    const fraudScore = response.data.fraudScore;
    logger.info(`Transaction ${transaction.id} scored ${fraudScore}`);

    // Flag the transaction if fraud score exceeds threshold
    if (fraudScore >= config.fraudDetection.threshold) {
      logger.warn(`Transaction ${transaction.id} flagged as potentially fraudulent`, {
        transactionId: transaction.id,
        fraudScore,
        threshold: config.fraudDetection.threshold,
        explanation: response.data.explanation
      });
      
      // Store relationship in AWS Neptune
      await storeRelationship(transaction.id, 'suspected-entity');
      
      // Here you would typically:
      // 1. Store the flagged transaction in a database
      // 2. Send an alert to a monitoring system
      // 3. Possibly publish to another Kafka topic for further processing
    }

    return fraudScore;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      logger.error('Error calling ML service', {
        transactionId: transaction?.id,
        status: axiosError.response?.status,
        message: axiosError.message
      });
    } else {
      logger.error('Unexpected error processing transaction', {
        transactionId: transaction?.id,
        error: (error as Error).message
      });
    }
    return null;
  }
}
