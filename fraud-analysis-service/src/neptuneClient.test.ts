import { storeRelationship } from './neptuneClient';
import { expect } from 'chai';
import sinon from 'sinon';

// Mock Gremlin client
const mockClient = {
  submit: sinon.stub().resolves({})
};

sinon.stub(require('gremlin').driver, 'Client').returns(mockClient);

describe('AWS Neptune Integration', () => {
  it('should store a relationship successfully', async () => {
    const result = await storeRelationship('tx1', 'entity1');
    expect(mockClient.submit.calledOnce).to.be.true;
    expect(result).to.be.an('object');
  });

  it('should handle errors when storing a relationship', async () => {
    mockClient.submit.rejects(new Error('Neptune error'));
    try {
      await storeRelationship('tx2', 'entity2');
    } catch (error) {
      expect(error.message).to.equal('Neptune error');
    }
  });
});
