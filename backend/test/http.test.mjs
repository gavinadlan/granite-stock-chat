import { describe, expect, it, beforeEach } from 'vitest';
import http from '../lib/http.js';
import validation from '../lib/validation.js';

beforeEach(() => { process.env.ALLOWED_ORIGINS = 'https://stockai.gavinadlan.my.id'; });

describe('handler wrapper', () => {
  const h = http.handler(async ({ query }) => ({ body: { symbol: query.symbol } }), { querySchema: validation.SymbolQuerySchema });

  it('validates and normalises the symbol', async () => {
    const res = await h({ queryStringParameters: { symbol: ' bbca.jk ' }, headers: {} }, {});
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).symbol).toBe('BBCA.JK');
  });
  it('rejects invalid symbols with 400', async () => {
    const res = await h({ queryStringParameters: { symbol: 'AAPL;DROP' }, headers: {} }, {});
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe('BAD_REQUEST');
  });
  it('only echoes allowed origins', async () => {
    const ok = await h({ queryStringParameters: { symbol: 'A' }, headers: { origin: 'https://stockai.gavinadlan.my.id' } }, {});
    const bad = await h({ queryStringParameters: { symbol: 'A' }, headers: { origin: 'https://evil.example' } }, {});
    expect(ok.headers['Access-Control-Allow-Origin']).toBe('https://stockai.gavinadlan.my.id');
    expect(bad.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
  it('never leaks stack traces', async () => {
    const boom = http.handler(async () => { throw new Error('secret internals'); });
    const res = await boom({ headers: {} }, { awsRequestId: 'req-1' });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain('secret internals');
    expect(JSON.parse(res.body).requestId).toBe('req-1');
  });
});

describe('timeframe', () => {
  it('accepts long and short forms', () => {
    expect(validation.TimeframeSchema.parse('1 week')).toBe('1w');
    expect(validation.TimeframeSchema.parse('3m')).toBe('3m');
    expect(validation.TimeframeSchema.safeParse('5y').success).toBe(false);
  });
});
