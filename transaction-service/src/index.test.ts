import request from 'supertest';
import { app } from './index';
import { Kafka } from 'kafkajs';

// Mock the Kafka module
jest.mock('kafkajs', () => {
  // Create a mock producer
  const mockProducer = {
    connect: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };

  return {
    Kafka: jest.fn().mockImplementation(() => {
      return {
        producer: jest.fn().mockReturnValue(mockProducer),
      };
    }),
  };
});

// Mock winston to prevent logging during tests
jest.mock('winston', () => {
  return {
    format: {
      colorize: jest.fn(),
      combine: jest.fn(),
      json: jest.fn(),
      simple: jest.fn(),
    },
    createLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
    transports: {
      Console: jest.fn(),
    },
  };
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Transaction Service API', () => {
  describe('POST /transaction', () => {
    it('should return 400 if transaction data is incomplete (missing id)', async () => {
      const response = await request(app)
        .post('/transaction')
        .send({ amount: 100, timestamp: new Date().toISOString() });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required transaction fields');
    });

    it('should return 400 if transaction data is incomplete (missing amount)', async () => {
      const response = await request(app)
        .post('/transaction')
        .send({ id: 'tx123', timestamp: new Date().toISOString() });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required transaction fields');
    });

    it('should return 400 if transaction data is incomplete (missing timestamp)', async () => {
      const response = await request(app)
        .post('/transaction')
        .send({ id: 'tx123', amount: 100 });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required transaction fields');
    });

    it('should return 200 if transaction data is complete', async () => {
      const transaction = {
        id: 'tx123',
        amount: 100,
        timestamp: new Date().toISOString(),
        cardNumber: '1234-5678-9012-3456',
        merchantId: 'merchant123',
        location: 'New York'
      };

      const response = await request(app)
        .post('/transaction')
        .send(transaction);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('Transaction received and published.');
      expect(response.body.transactionId).toBe('tx123');
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
