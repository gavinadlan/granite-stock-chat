// GET /v1/news?symbol=AAPL or ?query=stock%20market (alias /market-news until S1-10)
import { handler as httpHandler } from '../lib/http';
import { NewsQuerySchema } from '../lib/validation';
import { news } from '../services/news';

export const handler = httpHandler(
  async ({ query }) => ({ body: await news(query), cacheSeconds: 600 }),
  { querySchema: NewsQuerySchema },
);
