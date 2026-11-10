// Minimal Yahoo Finance chart client (unofficial endpoint).
// S1-03 replaces this with a provider adapter + fallback chain.
import type { DataMeta, Quote } from '@stockai/shared';
import type { Candle } from '../domain/indicators';
import { notFound, unavailable } from '../lib/http';

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const TIMEOUT_MS = 5000;

type Column = (number | null)[];

export interface ChartMeta {
  symbol?: string;
  longName?: string;
  shortName?: string;
  currency?: string;
  exchangeName?: string;
  regularMarketPrice?: number;
  regularMarketTime?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  previousClose?: number;
  chartPreviousClose?: number;
}

export interface ChartResult {
  meta?: ChartMeta;
  timestamp?: number[];
  indicators?: { quote?: { open?: Column; high?: Column; low?: Column; close?: Column; volume?: Column }[] };
}

interface ChartBody {
  chart?: { result?: ChartResult[] | null; error?: { code?: string } | null };
}

export async function fetchChart(symbol: string, { range = '1d', interval = '1d' } = {}): Promise<ChartResult> {
  const url = `${BASE}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StockAI/0.2; +https://stockai.gavinadlan.my.id)' },
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    throw unavailable(`Market data provider unreachable (${timedOut ? 'timeout' : 'network'})`);
  } finally {
    clearTimeout(timer);
  }
  let body: ChartBody | null;
  try {
    body = (await res.json()) as ChartBody | null; // shape checked field by field below
  } catch {
    throw unavailable(`Market data provider returned an invalid response (HTTP ${res.status})`);
  }
  const chart = body?.chart;
  if (res.status === 404 || (chart?.error && /not found/i.test(chart.error.code || ''))) {
    throw notFound(`Symbol ${symbol} not found`);
  }
  if (!res.ok || !chart?.result?.length) {
    throw unavailable(`Market data provider error (HTTP ${res.status})`);
  }
  return chart.result[0];
}

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

/** Parse candles, dropping incomplete rows (Yahoo returns nulls for gaps). */
export function toCandles(result: ChartResult): Candle[] {
  const ts = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const candles: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    if (isNum(o) && isNum(h) && isNum(l) && isNum(c)) candles.push({ t: ts[i], o, h, l, c, v: q.volume?.[i] ?? null });
  }
  return candles;
}

export type QuoteWithMeta = Quote & DataMeta;

export async function getQuote(symbol: string): Promise<QuoteWithMeta> {
  const result = await fetchChart(symbol, { range: '5d', interval: '1d' });
  const meta = result.meta || {};
  const price = meta.regularMarketPrice;
  if (typeof price !== 'number') throw unavailable(`No price available for ${symbol}`);
  // previousClose is only present for range=1d; derive it from the candles otherwise.
  const candles = toCandles(result);
  const lastTradeDay = meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString().slice(0, 10) : null;
  const prior = candles.filter((c) => new Date(c.t * 1000).toISOString().slice(0, 10) !== lastTradeDay);
  const previousClose = meta.previousClose || (prior.length ? prior[prior.length - 1].c : meta.chartPreviousClose);
  const change = typeof previousClose === 'number' ? price - previousClose : null;
  return {
    symbol: meta.symbol || symbol,
    name: meta.longName || meta.shortName || null,
    price,
    change,
    changePercent: change !== null && previousClose ? (change / previousClose) * 100 : null,
    previousClose: previousClose || null,
    open: candles.length ? candles[candles.length - 1].o : null,
    high: meta.regularMarketDayHigh ?? null,
    low: meta.regularMarketDayLow ?? null,
    volume: meta.regularMarketVolume ?? null,
    marketCap: null, // not available from the chart endpoint
    currency: meta.currency || 'USD',
    exchange: meta.exchangeName || null,
    asOf: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
    source: 'Yahoo Finance',
    delayed: true,
  };
}

export async function getDailyHistory(symbol: string, range = '1y'): Promise<{ meta: ChartMeta; candles: Candle[] }> {
  const result = await fetchChart(symbol, { range, interval: '1d' });
  return { meta: result.meta || {}, candles: toCandles(result) };
}
