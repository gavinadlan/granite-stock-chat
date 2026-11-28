// Price history (OHLCV candles) straight from Yahoo; no synthetic bars.
// TODO(S1-04): read through the DynamoDB cache (TTL: intraday 2 min, daily 6 h).
import { HistoryGranularitySchema, type HistoryResponse } from '@stockai/shared';
import { cleanCandles, downsample } from '../domain/candles';
import { unavailable } from '../lib/http';
import type { HistoryQuery } from '../lib/validation';
import { fetchChart, toCandles } from '../providers/yahoo';

export const MAX_CANDLES = 2000;

// Yahoo names the hourly interval 60m.
const YAHOO_INTERVAL: Record<HistoryQuery['interval'], string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '1h': '60m', '1d': '1d', '1wk': '1wk',
};

export async function history({ symbol, range, interval }: HistoryQuery): Promise<HistoryResponse> {
  const result = await fetchChart(symbol, { range, interval: YAHOO_INTERVAL[interval] });
  const meta = result.meta || {};
  const cleaned = cleanCandles(toCandles(result));
  if (!cleaned.length) throw unavailable(`No price history for ${symbol} (range ${range}, interval ${interval})`);
  const warnings: string[] = [];
  // Report the bar size Yahoo really served; unknown values keep the requested one.
  const served = meta.dataGranularity === '60m' ? '1h' : meta.dataGranularity;
  const actual = HistoryGranularitySchema.safeParse(served).data ?? interval;
  if (actual !== interval) warnings.push(`Provider returned ${actual} bars instead of the requested ${interval}`);
  const candles = downsample(cleaned, MAX_CANDLES);
  if (candles.length < cleaned.length) {
    warnings.push(`Downsampled ${cleaned.length} candles to ${candles.length} (each bar merges consecutive ${actual} bars)`);
  }
  return {
    data: {
      symbol: meta.symbol || symbol,
      currency: meta.currency || null,
      exchangeTimezone: meta.exchangeTimezoneName || null,
      range,
      interval: actual,
      candles,
    },
    meta: {
      source: 'Yahoo Finance',
      asOf: new Date(cleaned[cleaned.length - 1].t * 1000).toISOString(),
      delayed: true,
      warnings,
    },
  };
}
