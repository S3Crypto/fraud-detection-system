import { storeTransaction } from './db';
import { expect } from 'chai';
import sinon from 'sinon';

// Mock Couchbase collection
const mockCollection = {
  upsert: sinon.stub().resolves({})
};

// Mock Couchbase bucket
const mockBucket = {
  defaultCollection: sinon.stub().returns(mockCollection)
};

// Mock Couchbase cluster
const mockCluster = {
  bucket: sinon.stub().returns(mockBucket)
};

sinon.stub(require('couchbase'), 'Cluster').returns(mockCluster);

describe('Couchbase Integration', () => {
  it('should store a transaction successfully', async () => {
    const transaction = { id: 'tx1', amount: 100, timestamp: '2023-01-01T00:00:00Z' };
    const result = await storeTransaction(transaction);
    expect(mockCollection.upsert.calledOnce).to.be.true;
    expect(result).to.be.an('object');
  });

  it('should handle errors when storing a transaction', async () => {
    mockCollection.upsert.rejects(new Error('Couchbase error'));
    const transaction = { id: 'tx2', amount: 200, timestamp: '2023-01-01T00:00:00Z' };
    try {
      await storeTransaction(transaction);
    } catch (error: any) {
      expect(error.message).to.equal('Couchbase error');
    }
  });
});
