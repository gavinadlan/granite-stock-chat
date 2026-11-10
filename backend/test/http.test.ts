import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/lib/config';
import { handler } from '../src/lib/http';
import { SymbolQuerySchema, TimeframeSchema } from '../src/lib/validation';

// ALLOWED_ORIGINS for these tests is set in vitest.config.ts (config is read at import).

describe('handler wrapper', () => {
  const h = handler(async ({ query }) => ({ body: { symbol: query.symbol } }), { querySchema: SymbolQuerySchema });

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
    expect(ok.headers?.['Access-Control-Allow-Origin']).toBe('https://stockai.gavinadlan.my.id');
    expect(bad.headers?.['Access-Control-Allow-Origin']).toBeUndefined();
  });
  it('never leaks stack traces', async () => {
    const boom = handler(async () => { throw new Error('secret internals'); });
    const res = await boom({ headers: {} }, { awsRequestId: 'req-1' });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain('secret internals');
    expect(JSON.parse(res.body).requestId).toBe('req-1');
  });
});

describe('timeframe', () => {
  it('accepts long and short forms', () => {
    expect(TimeframeSchema.parse('1 week')).toBe('1w');
    expect(TimeframeSchema.parse('3m')).toBe('3m');
    expect(TimeframeSchema.safeParse('5y').success).toBe(false);
  });
});

describe('config', () => {
  it('splits origins and treats empty secrets as missing', () => {
    const c = loadConfig({ STAGE: 'dev', ALLOWED_ORIGINS: 'https://a.example, https://b.example', NEWS_API_KEY: '' });
    expect(c.ALLOWED_ORIGINS).toEqual(['https://a.example', 'https://b.example']);
    expect(c.NEWS_API_KEY).toBeUndefined();
    expect(c.LLM_MODEL).toBe('ibm-granite/granite-3.3-8b-instruct');
  });
  it('fails fast without leaking values', () => {
    expect(() => loadConfig({ STAGE: 'dev', NEWS_API_KEY: 123 as unknown as string })).toThrow(
      'Invalid environment configuration: ALLOWED_ORIGINS, NEWS_API_KEY',
    );
  });
});
