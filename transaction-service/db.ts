import couchbase from 'couchbase';

// Replace with your Couchbase connection details
const cluster = new couchbase.Cluster('couchbase://localhost', {
  username: process.env.COUCHBASE_USERNAME || 'your-username',
  password: process.env.COUCHBASE_PASSWORD || 'your-password'
});
const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET || 'transactions_bucket');
const collection = bucket.defaultCollection();

export async function storeTransaction(transaction: any) {
  try {
    // Use transaction id as the document key
    const result = await collection.upsert(transaction.id, transaction);
    console.log(`Stored transaction ${transaction.id} in Couchbase`);
    return result;
  } catch (error) {
    console.error(`Error storing transaction ${transaction.id}:`, error);
    throw error;
  }
}
