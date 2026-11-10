// GET /v1/quote?symbol=AAPL (alias /stock-price until S1-10)
import { handler as httpHandler } from '../lib/http';
import { SymbolQuerySchema } from '../lib/validation';
import { quote } from '../services/quote';

export const handler = httpHandler(
  async ({ query }) => ({ body: await quote(query.symbol), cacheSeconds: 30 }),
  { querySchema: SymbolQuerySchema },
);
