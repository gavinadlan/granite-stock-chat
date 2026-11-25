// Handlers return exactly the shapes declared in @stockai/shared (no extra or missing fields).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HealthResponseSchema, QuoteResponseSchema, TechnicalsResponseSchema } from '@stockai/shared';
import { handler as health } from '../src/handlers/health';
import { handler as quote } from '../src/handlers/quote';
import { handler as technicals } from '../src/handlers/technicals';

// Deterministic Yahoo chart payload: 250 daily candles on a straight line.
const DAY = 86400;
const n = 250;
const ts = Array.from({ length: n }, (_, i) => 1_700_000_000 + i * DAY);
const close = ts.map((_, i) => 100 + i);
const chart = {
  chart: {
    result: [{
      meta: { symbol: 'AAPL', currency: 'USD', exchangeName: 'NMS', regularMarketPrice: 349, regularMarketTime: ts[n - 1], regularMarketVolume: 1000 },
      timestamp: ts,
      indicators: { quote: [{ open: close, high: close.map((c) => c + 1), low: close.map((c) => c - 1), close, volume: close.map(() => 1000) }] },
    }],
    error: null,
  },
};

afterEach(() => vi.unstubAllGlobals());

const call = (h: typeof quote, symbol?: string) =>
  h({ queryStringParameters: symbol ? { symbol } : null, headers: {} }, {}).then((r) => ({ status: r.statusCode, body: JSON.parse(r.body) }));

describe('response contracts', () => {
  it('quote', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(chart))));
    const { status, body } = await call(quote, 'aapl');
    expect(status).toBe(200);
    expect(QuoteResponseSchema.parse(body)).toEqual(body);
    expect(body.previousClose).toBe(348);
  });
  it('technicals', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(chart))));
    const { status, body } = await call(technicals, 'AAPL');
    expect(status).toBe(200);
    expect(TechnicalsResponseSchema.parse(body)).toEqual(body);
  });
  it('health', async () => {
    const { body } = await call(health);
    expect(HealthResponseSchema.parse(body)).toEqual(body);
  });
});
