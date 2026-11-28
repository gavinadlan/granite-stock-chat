import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

vi.mock('../src/lib/config', async (original) => {
  const mod = await original<typeof import('../src/lib/config')>();
  return { ...mod, config: { ...mod.config, TABLE_NAME: 'stockai-test' } };
});

import { getOrSet, STALE_SECONDS } from '../src/lib/cache';
import { keys } from '../src/lib/db';
import { notFound, unavailable } from '../src/lib/http';

const ddb = mockClient(DynamoDBDocumentClient);
const NOW = Date.UTC(2026, 10, 27, 15, 0);
const key = keys.cache('quote', 'AAPL');
const item = (value: unknown, expiresAt: number) => ({ Item: { ...key, payload: JSON.stringify(value), expiresAt, ttl: 0 } });

beforeEach(() => {
  ddb.reset();
  ddb.on(GetCommand).resolves({});
  ddb.on(PutCommand).resolves({});
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('getOrSet', () => {
  it('builds single-table cache keys', () => {
    expect(key).toEqual({ PK: 'CACHE#quote#AAPL', SK: 'v1' });
  });

  it('miss: calls the loader and stores expiresAt plus a DynamoDB ttl 24 h later', async () => {
    const loader = vi.fn(async () => ({ price: 1 }));
    expect(await getOrSet(key, 30, loader)).toEqual({ value: { price: 1 }, cached: false, stale: false });
    expect(loader).toHaveBeenCalledOnce();
    const put = ddb.commandCalls(PutCommand)[0].args[0].input;
    expect(put.TableName).toBe('stockai-test');
    expect(put.Item).toEqual({
      PK: 'CACHE#quote#AAPL', SK: 'v1', payload: '{"price":1}', expiresAt: NOW + 30_000, ttl: NOW / 1000 + 30 + STALE_SECONDS,
    });
  });

  it('hit: serves a fresh entry without calling the loader', async () => {
    ddb.on(GetCommand).resolves(item({ price: 2 }, NOW + 1));
    const loader = vi.fn(async () => ({ price: 3 }));
    expect(await getOrSet(key, 30, loader)).toEqual({ value: { price: 2 }, cached: true, stale: false });
    expect(loader).not.toHaveBeenCalled();
    expect(ddb.commandCalls(PutCommand)).toHaveLength(0);
  });

  it('expired: reloads and overwrites the entry', async () => {
    ddb.on(GetCommand).resolves(item({ price: 2 }, NOW - 1));
    expect(await getOrSet(key, 30, async () => ({ price: 3 }))).toEqual({ value: { price: 3 }, cached: false, stale: false });
    expect(ddb.commandCalls(PutCommand)).toHaveLength(1);
  });

  it('takes the ttl from the value; 0 does not store it', async () => {
    await getOrSet(key, (v: number[]) => (v.length ? 60 : 0), async () => []);
    expect(ddb.commandCalls(PutCommand)).toHaveLength(0);
    await getOrSet(key, (v: number[]) => (v.length ? 60 : 0), async () => [1]);
    expect(ddb.commandCalls(PutCommand)[0].args[0].input.Item?.expiresAt).toBe(NOW + 60_000);
  });

  it('stale-while-error: serves an entry expired less than 24 h ago when the provider fails', async () => {
    ddb.on(GetCommand).resolves(item({ price: 2 }, NOW - 3600_000));
    const res = await getOrSet(key, 30, async () => Promise.reject(unavailable('Yahoo down')));
    expect(res).toEqual({ value: { price: 2 }, cached: true, stale: true });
    expect(ddb.commandCalls(PutCommand)).toHaveLength(0);
  });

  it('does not serve entries expired 24 h or more ago', async () => {
    ddb.on(GetCommand).resolves(item({ price: 2 }, NOW - STALE_SECONDS * 1000));
    await expect(getOrSet(key, 30, async () => Promise.reject(unavailable('Yahoo down')))).rejects.toThrow('Yahoo down');
  });

  it('does not hide client errors (e.g. 404) behind stale data, nor when staleWhileError is off', async () => {
    ddb.on(GetCommand).resolves(item({ price: 2 }, NOW - 1));
    await expect(getOrSet(key, 30, async () => Promise.reject(notFound('Unknown symbol')))).rejects.toThrow('Unknown symbol');
    await expect(getOrSet(key, 30, async () => Promise.reject(new Error('down')), { staleWhileError: false })).rejects.toThrow('down');
  });

  it('DynamoDB down: read and write failures are logged and the loader still answers', async () => {
    ddb.on(GetCommand).rejects(new Error('ResourceNotFoundException'));
    ddb.on(PutCommand).rejects(new Error('ProvisionedThroughputExceeded'));
    expect(await getOrSet(key, 30, async () => ({ price: 4 }))).toEqual({ value: { price: 4 }, cached: false, stale: false });
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('treats a corrupt entry as a miss', async () => {
    ddb.on(GetCommand).resolves({ Item: { ...key, payload: '{oops', expiresAt: NOW + 1 } });
    expect((await getOrSet(key, 30, async () => 5)).value).toBe(5);
  });

  it('coalesces parallel calls for the same key into one load', async () => {
    let release!: (v: number) => void;
    const loader = vi.fn(() => new Promise<number>((r) => (release = r)));
    const calls = [getOrSet(key, 30, loader), getOrSet(key, 30, loader), getOrSet(keys.cache('quote', 'MSFT'), 30, async () => 9)];
    await vi.waitFor(() => expect(loader).toHaveBeenCalledOnce());
    release(7);
    const [a, b, c] = await Promise.all(calls);
    expect([a.value, b.value, c.value]).toEqual([7, 7, 9]);
    expect(ddb.commandCalls(GetCommand)).toHaveLength(2);
    // The next call after the load finished starts a new one.
    await getOrSet(key, 30, async () => 8);
    expect(ddb.commandCalls(GetCommand)).toHaveLength(3);
  });
});
