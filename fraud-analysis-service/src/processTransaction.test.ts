import axios, { AxiosError } from 'axios';
import winston from 'winston';
import { processTransaction, Transaction } from './processTransaction';
import { config } from './config';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Properly type the isAxiosError function
jest.spyOn(axios, 'isAxiosError').mockImplementation((error: any): error is AxiosError => {
  return error.isAxiosError === true;
});

// Mock winston logger
jest.mock('winston', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    createLogger: jest.fn(() => mockLogger),
    format: {
      json: jest.fn(),
      colorize: jest.fn(),
      simple: jest.fn(),
      combine: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
    },
  };
});

describe('processTransaction', () => {
  // Sample transaction data
  const validTransaction: Transaction = {
    id: 'tx123',
    amount: 500,
    timestamp: new Date().toISOString(),
    userId: 'user456',
    merchantId: 'merchant789'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return null for incomplete transaction data (missing id)', async () => {
    const incompleteTransaction = { 
      amount: 500, 
      timestamp: new Date().toISOString() 
    };
    
    const result = await processTransaction(incompleteTransaction);
    
    expect(result).toBeNull();
  });

  it('should return null for incomplete transaction data (missing amount)', async () => {
    const incompleteTransaction = { 
      id: 'tx123', 
      timestamp: new Date().toISOString() 
    };
    
    const result = await processTransaction(incompleteTransaction);
    
    expect(result).toBeNull();
  });

  it('should return null for incomplete transaction data (missing timestamp)', async () => {
    const incompleteTransaction = { 
      id: 'tx123', 
      amount: 500 
    };
    
    const result = await processTransaction(incompleteTransaction);
    
    expect(result).toBeNull();
  });

  it('should call ML service and return fraud score for valid transaction', async () => {
    // Mock the axios.post response
    mockedAxios.post.mockResolvedValueOnce({
      data: { fraudScore: 0.2 }
    });

    const result = await processTransaction(validTransaction);

    // Verify ML service was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${config.mlService.url}${config.mlService.scoreEndpoint}`,
      validTransaction,
      { timeout: config.mlService.timeout }
    );
    
    // Verify the returned fraud score
    expect(result).toBe(0.2);
  });

  it('should flag transaction as fraudulent when score is above threshold', async () => {
    // Mock the axios.post response with high fraud score
    mockedAxios.post.mockResolvedValueOnce({
      data: { 
        fraudScore: 0.9,
        explanation: 'Unusual transaction pattern'
      }
    });

    const result = await processTransaction(validTransaction);

    // Verify ML service was called
    expect(mockedAxios.post).toHaveBeenCalled();
    
    // Verify the returned fraud score
    expect(result).toBe(0.9);
    
    // Verify warning was logged
    const loggerInstance = winston.createLogger();
    expect(loggerInstance.warn).toHaveBeenCalledWith(
      expect.stringContaining('flagged as potentially fraudulent'),
      expect.objectContaining({
        transactionId: validTransaction.id,
        fraudScore: 0.9,
        threshold: config.fraudDetection.threshold,
        explanation: 'Unusual transaction pattern'
      })
    );
  });

  it('should handle axios errors gracefully', async () => {
    // Create a proper Axios error
    const axiosError = new Error('Network error') as AxiosError;
    axiosError.isAxiosError = true;
    axiosError.response = { status: 500 } as any;
    
    // Mock axios.post to throw the error
    mockedAxios.post.mockRejectedValueOnce(axiosError);

    const result = await processTransaction(validTransaction);

    // Verify error was logged
    const loggerInstance = winston.createLogger();
    expect(loggerInstance.error).toHaveBeenCalledWith(
      'Error calling ML service',
      expect.objectContaining({
        transactionId: validTransaction.id,
        status: 500
      })
    );
    
    // Verify null is returned on error
    expect(result).toBeNull();
  });

  it('should handle unexpected errors gracefully', async () => {
    // Mock axios.post to throw a non-axios error
    mockedAxios.post.mockRejectedValueOnce(new Error('Unexpected error'));

    const result = await processTransaction(validTransaction);

    // Verify error was logged
    const loggerInstance = winston.createLogger();
    expect(loggerInstance.error).toHaveBeenCalledWith(
      'Unexpected error processing transaction',
      expect.objectContaining({
        transactionId: validTransaction.id,
        error: 'Unexpected error'
      })
    );
    
    // Verify null is returned on error
    expect(result).toBeNull();
  });
});
