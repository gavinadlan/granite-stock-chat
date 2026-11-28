import { afterEach, describe, expect, it, vi } from 'vitest';
import { HistoryResponseSchema } from '@stockai/shared';
import { cleanCandles, downsample } from '../src/domain/candles';
import type { Candle } from '../src/domain/indicators';
import { handler } from '../src/handlers/history';
import { HistoryQuerySchema } from '../src/lib/validation';

const bar = (t: number, c: number, v: number | null = 10): Candle => ({ t, o: c, h: c + 1, l: c - 1, c, v });

describe('cleanCandles', () => {
  it('drops incomplete bars, sorts ascending and dedupes timestamps', () => {
    const out = cleanCandles([bar(3, 3), { ...bar(2, 2), c: NaN }, bar(1, 1), bar(3, 33)]);
    expect(out.map((c) => [c.t, c.c])).toEqual([[1, 1], [3, 33]]);
  });
});

describe('downsample', () => {
  it('returns input untouched when under the limit', () => {
    const input = [bar(1, 1), bar(2, 2)];
    expect(downsample(input, 5)).toBe(input);
  });
  it('merges buckets keeping open, extremes, close and summed volume', () => {
    const input = [bar(1, 5), bar(2, 9), bar(3, 1, null), bar(4, 4), bar(5, 7)];
    const out = downsample(input, 2);
    expect(out).toEqual([
      { t: 1, o: 5, h: 10, l: 0, c: 1, v: 20 },
      { t: 4, o: 4, h: 8, l: 3, c: 7, v: 20 },
    ]);
  });
  it('never exceeds max', () => {
    const input = Array.from({ length: 10_001 }, (_, i) => bar(i, 100));
    expect(downsample(input, 2000).length).toBeLessThanOrEqual(2000);
  });
});

describe('HistoryQuerySchema (Yahoo limits)', () => {
  const ok = (range: string, interval: string) => HistoryQuerySchema.safeParse({ symbol: 'AAPL', range, interval }).success;
  it.each([
    ['5d', '1m'], ['1mo', '5m'], ['1mo', '15m'], ['1y', '1h'], ['max', '1d'], ['max', '1wk'],
  ])('accepts range %s with interval %s', (r, i) => expect(ok(r, i)).toBe(true));
  it.each([
    ['1mo', '1m'], ['3mo', '5m'], ['3mo', '15m'], ['5y', '1h'],
  ])('rejects range %s with interval %s', (r, i) => expect(ok(r, i)).toBe(false));
  it('defaults to 1mo / 1d', () => {
    expect(HistoryQuerySchema.parse({ symbol: 'aapl' })).toEqual({ symbol: 'AAPL', range: '1mo', interval: '1d' });
  });
});

// Yahoo chart payload helper.
const chart = (timestamp: number[], close: (number | null)[], meta: Record<string, unknown> = {}) => ({
  chart: {
    result: [{
      meta: { symbol: 'AAPL', currency: 'USD', exchangeTimezoneName: 'America/New_York', ...meta },
      timestamp,
      indicators: { quote: [{ open: close, high: close, low: close, close, volume: close.map(() => 5) }] },
    }],
    error: null,
  },
});

const stubYahoo = (body: unknown) => {
  const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () => new Response(JSON.stringify(body)));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};
const call = (q: Record<string, string>) =>
  handler({ queryStringParameters: q, headers: {} }, {}).then((r) => ({ status: r.statusCode, headers: r.headers, body: JSON.parse(r.body) }));

afterEach(() => vi.unstubAllGlobals());

describe('GET /v1/history', () => {
  it('drops null bars and sorts before responding', async () => {
    stubYahoo(chart([300, 100, 200, 400], [3, 1, null, 4]));
    const { status, body } = await call({ symbol: 'AAPL', range: '5d', interval: '1d' });
    expect(status).toBe(200);
    expect(body.data.candles.map((c: Candle) => c.t)).toEqual([100, 300, 400]);
    expect(body.meta.asOf).toBe(new Date(400_000).toISOString());
  });
  it('maps 1h to Yahoo 60m and sets a short public cache', async () => {
    const fetchMock = stubYahoo(chart([1], [1]));
    const { status, headers } = await call({ symbol: 'AAPL', range: '1mo', interval: '1h' });
    expect(status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toContain('range=1mo&interval=60m');
    expect(headers?.['Cache-Control']).toBe('public, max-age=60');
  });
  it('downsamples above 2000 candles and warns', async () => {
    const ts = Array.from({ length: 5000 }, (_, i) => i * 86400);
    stubYahoo(chart(ts, ts.map(() => 10)));
    const { body } = await call({ symbol: 'AAPL', range: 'max', interval: '1d' });
    expect(body.data.candles.length).toBeLessThanOrEqual(2000);
    expect(body.meta.warnings[0]).toMatch(/Downsampled 5000/);
  });
  it('returns null exchangeTimezone when Yahoo omits it', async () => {
    stubYahoo(chart([1], [1], { exchangeTimezoneName: undefined }));
    const { status, body } = await call({ symbol: 'AAPL' });
    expect(status).toBe(200);
    expect(body.data.exchangeTimezone).toBeNull();
    expect(HistoryResponseSchema.parse(body)).toEqual(body);
  });
  it('answers 503 instead of an empty series when no bar survives cleaning', async () => {
    stubYahoo(chart([1, 2], [null, null]));
    const { status, body } = await call({ symbol: 'AAPL' });
    expect(status).toBe(503);
    expect(body.error.code).toBe('PROVIDER_UNAVAILABLE');
  });
  it('asks Yahoo for an explicit period on range=max (range=max coarsens bars)', async () => {
    const fetchMock = stubYahoo(chart([1], [1], { dataGranularity: '1d' }));
    const { body } = await call({ symbol: 'BBCA.JK', range: 'max', interval: '1d' });
    const url = fetchMock.mock.calls[0][0];
    expect(url).toMatch(/period1=0&period2=\d+&interval=1d$/);
    expect(url).not.toContain('range=');
    expect(body.data.interval).toBe('1d');
    expect(body.meta.warnings).toEqual([]);
  });
  it('reports the coarser granularity Yahoo served and warns', async () => {
    stubYahoo(chart([1, 2], [1, 2], { dataGranularity: '3mo' }));
    const { status, body } = await call({ symbol: 'AAPL', range: 'max', interval: '1d' });
    expect(status).toBe(200);
    expect(body.data.interval).toBe('3mo');
    expect(body.meta.warnings).toContain('Provider returned 3mo bars instead of the requested 1d');
    expect(HistoryResponseSchema.parse(body)).toEqual(body);
  });
  it('treats Yahoo 60m as the requested 1h', async () => {
    stubYahoo(chart([1], [1], { dataGranularity: '60m' }));
    const { body } = await call({ symbol: 'AAPL', range: '5d', interval: '1h' });
    expect(body.data.interval).toBe('1h');
    expect(body.meta.warnings).toEqual([]);
  });
  it.each(['5y', '1y', '6mo'])('keeps daily bars for range %s/1d', async (range) => {
    const fetchMock = stubYahoo(chart([1], [1], { dataGranularity: '1d' }));
    const { body } = await call({ symbol: 'AAPL', range, interval: '1d' });
    expect(fetchMock.mock.calls[0][0]).toContain(`range=${range}&interval=1d`);
    expect(body.data.interval).toBe('1d');
    expect(body.meta.warnings).toEqual([]);
  });
  it('rejects unsupported combinations with the allowed ranges', async () => {
    const fetchMock = stubYahoo(chart([1], [1]));
    const { status, body } = await call({ symbol: 'AAPL', range: '1y', interval: '1m' });
    expect(status).toBe(400);
    expect(body.error.message).toContain('interval 1m supports range 1d, 5d (got 1y)');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
