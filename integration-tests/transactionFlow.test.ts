import request from 'supertest';

// Assume the Transaction Ingestion Service is running at http://localhost:3000
describe('Integration Test: Transaction Processing Flow', () => {
  it('should process a valid transaction end-to-end', async () => {
    const transaction = {
      id: 'tx123',
      amount: 750,
      timestamp: new Date().toISOString()
    };

    // Send transaction to ingestion service
    const ingestionResponse = await request('http://localhost:3000')
      .post('/transaction')
      .send(transaction);
    expect(ingestionResponse.status).toBe(200);
    expect(ingestionResponse.body.status).toMatch(/received/);

    // Optionally, add logic to wait and then verify results in Couchbase or via Kafka monitoring.
    // This part can be customized based on available test endpoints or database query methods.
  });
});
