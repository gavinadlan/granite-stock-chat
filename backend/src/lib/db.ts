// DynamoDB access: one DocumentClient per container plus key builders for the single table.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Short timeouts: the cache must never make a request much slower than calling the provider.
export const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({ maxAttempts: 2, requestHandler: { connectionTimeout: 500, requestTimeout: 1000 } }),
);

export type Key = { PK: string; SK: string };

export const keys = {
  /** Cached provider response, e.g. CACHE#quote#AAPL. Bump SK when the payload shape changes. */
  cache: (kind: string, id: string): Key => ({ PK: `CACHE#${kind}#${id}`, SK: 'v1' }),
};
