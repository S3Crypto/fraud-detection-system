import gremlin from 'gremlin';
const { driver } = gremlin;

// Initialize the Neptune client using environment variables for flexibility
const client = new driver.Client(
  process.env.NEPTUNE_ENDPOINT || 'wss://your-neptune-endpoint:8182/gremlin',
  { traversalSource: 'g' }
);

/**
 * Stores a relationship in AWS Neptune between a transaction and a related entity.
 * @param transactionId - The ID of the transaction.
 * @param relatedEntity - The identifier or name of the related entity.
 */
export async function storeRelationship(transactionId: string, relatedEntity: string) {
  try {
    // Build a Gremlin query to add a transaction vertex and an entity vertex,
    // and create an edge between them.
    const query = `
      g.addV('transaction').property('id', '${transactionId}')
       .as('t')
       .addV('entity').property('name', '${relatedEntity}')
       .addE('related').from('t')
    `;
    const result = await client.submit(query);
    console.log(`Stored relationship in AWS Neptune for transaction ${transactionId}`);
    return result;
  } catch (error: any) {
    console.error(`Error storing relationship for transaction ${transactionId}:`, error);
    throw error;
  }
}