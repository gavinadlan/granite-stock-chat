// GET /v1/history?symbol=AAPL&range=1mo&interval=1d (public, no auth)
import { handler as httpHandler } from '../lib/http';
import { HistoryQuerySchema } from '../lib/validation';
import { history } from '../services/history';

const INTRADAY = new Set(['1m', '5m', '15m', '1h']);

export const handler = httpHandler(
  async ({ query }) => ({ body: await history(query), cacheSeconds: INTRADAY.has(query.interval) ? 60 : 300 }),
  { querySchema: HistoryQuerySchema },
);
