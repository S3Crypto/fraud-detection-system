// Mock in-memory database implementation
class MockDatabase {
  private store: Map<string, any>;

  constructor() {
    this.store = new Map();
  }

  async upsert(key: string, value: any): Promise<any> {
    this.store.set(key, value);
    return {
      cas: Date.now(), // Simulate CAS value
      token: undefined
    };
  }

  async get(key: string): Promise<any> {
    const value = this.store.get(key);
    if (!value) {
      throw new Error('Document not found');
    }
    return {
      content: value,
      cas: Date.now()
    };
  }
}

// Create singleton instance
const mockDb = new MockDatabase();

export async function storeTransaction(transaction: any) {
  try {
    // Use transaction id as the document key
    const result = await mockDb.upsert(transaction.id, transaction);
    console.log(`Stored transaction ${transaction.id} in mock database`);
    return result;
  } catch (error) {
    console.error(`Error storing transaction ${transaction.id}:`, error);
    throw error;
  }
}

export async function getTransaction(id: string) {
  try {
    const result = await mockDb.get(id);
    return result.content;
  } catch (error) {
    console.error(`Error retrieving transaction ${id}:`, error);
    throw error;
  }
}
