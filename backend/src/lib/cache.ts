// Read-through cache on DynamoDB with stale-while-error and in-container request coalescing.
// DynamoDB problems never fail a request: they are logged and the loader is used instead.
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { config } from './config';
import { db, type Key } from './db';
import { HttpError, log } from './http';

/** How long an expired entry may still be served when the provider fails. */
export const STALE_SECONDS = 24 * 3600;

export interface Cached<T> {
  value: T;
  /** Served from the table instead of the provider. */
  cached: boolean;
  /** Expired entry served because the provider failed. */
  stale: boolean;
}

/** Seconds to keep a value; 0 means do not store it (e.g. an empty result). */
export type Ttl<T> = number | ((value: T) => number);

interface Entry {
  value: unknown;
  /** Epoch ms after which the entry is stale. DynamoDB `ttl` (epoch s) deletes it 24 h later. */
  expiresAt: number;
}

const inflight = new Map<string, Promise<Cached<unknown>>>();

// Client errors (bad symbol, not found) are answers, not outages: never hide them behind stale data.
const isOutage = (err: unknown) => !(err instanceof HttpError && err.status < 500);

async function read(key: Key, table: string): Promise<Entry | undefined> {
  try {
    const { Item } = await db.send(new GetCommand({ TableName: table, Key: key }));
    if (!Item || typeof Item.payload !== 'string' || typeof Item.expiresAt !== 'number') return undefined;
    return { value: JSON.parse(Item.payload), expiresAt: Item.expiresAt };
  } catch (err) {
    log('error', 'cache read failed', { key: key.PK, error: err instanceof Error ? err.message : String(err) });
    return undefined;
  }
}

async function write(key: Key, table: string, value: unknown, seconds: number, now: number): Promise<void> {
  const expiresAt = now + seconds * 1000;
  try {
    await db.send(
      new PutCommand({
        TableName: table,
        Item: { ...key, payload: JSON.stringify(value), expiresAt, ttl: Math.ceil(expiresAt / 1000) + STALE_SECONDS },
      }),
    );
  } catch (err) {
    log('error', 'cache write failed', { key: key.PK, error: err instanceof Error ? err.message : String(err) });
  }
}

async function load<T>(key: Key, ttl: Ttl<T>, loader: () => Promise<T>, staleWhileError: boolean): Promise<Cached<T>> {
  const table = config.TABLE_NAME;
  if (!table) return { value: await loader(), cached: false, stale: false };

  const entry = await read(key, table);
  if (entry && entry.expiresAt > Date.now()) return { value: entry.value as T, cached: true, stale: false };

  let value: T;
  try {
    value = await loader();
  } catch (err) {
    // DynamoDB deletes expired items lazily, so check the age ourselves.
    if (staleWhileError && entry && Date.now() - entry.expiresAt < STALE_SECONDS * 1000 && isOutage(err)) {
      log('info', 'serving stale cache', { key: key.PK, error: err instanceof Error ? err.message : String(err) });
      return { value: entry.value as T, cached: true, stale: true };
    }
    throw err;
  }
  const seconds = typeof ttl === 'function' ? ttl(value) : ttl;
  if (seconds > 0) await write(key, table, value, seconds, Date.now());
  return { value, cached: false, stale: false };
}

/** Response meta fields for a cached result: `stale` only when true. */
export const cacheMeta = ({ cached, stale }: Cached<unknown>) => ({ cached, ...(stale && { stale: true }) });

/** Value for `key` from the table, else from `loader` (stored for `ttl` seconds). Parallel calls share one load. */
export function getOrSet<T>(key: Key, ttl: Ttl<T>, loader: () => Promise<T>, { staleWhileError = true } = {}): Promise<Cached<T>> {
  const id = `${key.PK}|${key.SK}`;
  const pending = inflight.get(id);
  if (pending) return pending as Promise<Cached<T>>;
  const promise = load(key, ttl, loader, staleWhileError).finally(() => inflight.delete(id));
  inflight.set(id, promise);
  return promise;
}
