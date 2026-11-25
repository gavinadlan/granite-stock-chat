// GET /v1/health (alias /health, no auth): liveness probe for monitoring and CI smoke tests.
import type { HealthResponse } from '@stockai/shared';
import { config } from '../lib/config';
import { handler as httpHandler } from '../lib/http';

export const handler = httpHandler(async () => ({
  body: { status: 'ok', stage: config.STAGE, time: new Date().toISOString() } satisfies HealthResponse,
}));
