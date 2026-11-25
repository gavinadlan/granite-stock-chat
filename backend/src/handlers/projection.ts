// GET /v1/projection?symbol=AAPL&timeframe=1w (alias /ai-prediction until S1-10)
import { handler as httpHandler } from '../lib/http';
import { PredictionQuerySchema } from '../lib/validation';
import { projection } from '../services/projection';

export const handler = httpHandler(
  async ({ query }) => ({ body: await projection(query.symbol, query.timeframe) }),
  { querySchema: PredictionQuerySchema },
);
