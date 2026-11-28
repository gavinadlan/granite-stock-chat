// Services read through the cache: keys carry the parameters, asOf stays the provider's time.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

vi.mock('../src/lib/config', async (original) => {
  const mod = await original<typeof import('../src/lib/config')>();
  return { ...mod, config: { ...mod.config, TABLE_NAME: 'stockai-test', NEWS_API_KEY: 'test-key' } };
});

import { history } from '../src/services/history';
import { news } from '../src/services/news';
import { quote } from '../src/services/quote';

// In-memory table behind the mocked DocumentClient.
const ddb = mockClient(DynamoDBDocumentClient);
const table = new Map<string, Record<string, unknown>>();
const id = (k: Record<string, unknown> | undefined) => `${k?.PK}|${k?.SK}`;

const marketTime = Date.UTC(2026, 10, 27, 21, 0) / 1000; // Fri 16:00 New York: market closed
const chart = (meta: Record<string, unknown> = {}) => ({
  chart: {
    result: [{
      meta: { symbol: 'AAPL', currency: 'USD', exchangeName: 'NMS', regularMarketPrice: 2, regularMarketTime: marketTime, ...meta },
      timestamp: [marketTime - 86400, marketTime],
      indicators: { quote: [{ open: [1, 2], high: [1, 2], low: [1, 2], close: [1, 2], volume: [5, 5] }] },
    }],
    error: null,
  },
});

const fetchMock = vi.fn(async () => new Response(JSON.stringify(chart())));

beforeEach(() => {
  table.clear();
  ddb.reset();
  ddb.on(GetCommand).callsFake(({ Key }) => ({ Item: table.get(id(Key)) }));
  ddb.on(PutCommand).callsFake(({ Item }) => void table.set(id(Item), Item));
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.useFakeTimers({ now: Date.UTC(2026, 10, 27, 22, 0), toFake: ['Date'] }); // Fri 17:00 New York
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const put = () => ddb.commandCalls(PutCommand).at(-1)!.args[0].input.Item!;

describe('quote through the cache', () => {
  it('second call is cached and keeps the provider asOf', async () => {
    const first = await quote('AAPL');
    const second = await quote('AAPL');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(first.cached).toBe(false);
    expect(second).toEqual({ ...first, cached: true });
    expect(second.asOf).toBe(new Date(marketTime * 1000).toISOString());
    expect(second).not.toHaveProperty('stale');
    expect(put().PK).toBe('CACHE#quote#AAPL');
  });

  it('keeps 15 min while the market is closed and 30 s while it trades', async () => {
    await quote('AAPL');
    expect(put().expiresAt).toBe(Date.now() + 15 * 60_000);
    vi.setSystemTime(Date.UTC(2026, 10, 30, 15, 0)); // Mon 10:00 New York
    table.clear();
    await quote('AAPL');
    expect(put().expiresAt).toBe(Date.now() + 30_000);
  });

  it('serves the old quote marked stale when Yahoo fails after expiry', async () => {
    await quote('AAPL');
    vi.setSystemTime(Date.now() + 60 * 60_000);
    fetchMock.mockImplementationOnce(async () => new Response('down', { status: 503 }));
    const res = await quote('AAPL');
    expect(res).toMatchObject({ cached: true, stale: true, price: 2 });
  });
});

describe('history through the cache', () => {
  it('keys by symbol, range and interval with the interval TTL', async () => {
    await history({ symbol: 'AAPL', range: '1mo', interval: '1d' });
    expect(put().PK).toBe('CACHE#history#AAPL#1mo#1d');
    expect(put().expiresAt).toBe(Date.now() + 6 * 3600_000);
    const intraday = await history({ symbol: 'AAPL', range: '5d', interval: '15m' });
    expect(put().PK).toBe('CACHE#history#AAPL#5d#15m');
    expect(put().expiresAt).toBe(Date.now() + 2 * 60_000);
    expect(intraday.meta.cached).toBe(false);
    expect((await history({ symbol: 'AAPL', range: '1mo', interval: '1d' })).meta.cached).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not cache an error', async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify(chart({})).replace(/"close":\[1,2\]/, '"close":[null,null]')));
    await expect(history({ symbol: 'AAPL', range: '1mo', interval: '1d' })).rejects.toThrow('No price history');
    expect(ddb.commandCalls(PutCommand)).toHaveLength(0);
  });
});

describe('news through the cache', () => {
  const newsApi = (articles: unknown[]) => vi.fn(async () => new Response(JSON.stringify({ status: 'ok', articles })));

  it('does not store an empty list', async () => {
    vi.stubGlobal('fetch', newsApi([]));
    expect((await news({ symbol: 'AAPL' })).news).toEqual([]);
    expect(ddb.commandCalls(PutCommand)).toHaveLength(0);
  });

  it('keeps tickers and free-text queries apart', async () => {
    vi.stubGlobal('fetch', newsApi([{ title: 'A', url: 'https://example.com/a', publishedAt: '2026-11-27T00:00:00Z' }]));
    await news({ symbol: 'AAPL' });
    expect(put().PK).toBe('CACHE#news#S:AAPL');
    await news({ query: 'AAPL' });
    expect(put().PK).toBe('CACHE#news#Q:AAPL');
  });
});
