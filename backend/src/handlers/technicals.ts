// GET /v1/technicals?symbol=AAPL (alias /technical-analysis until S1-10)
import { handler as httpHandler } from '../lib/http';
import { SymbolQuerySchema } from '../lib/validation';
import { technicals } from '../services/technicals';

export const handler = httpHandler(
  async ({ query }) => ({ body: await technicals(query.symbol), cacheSeconds: 300 }),
  { querySchema: SymbolQuerySchema },
);
