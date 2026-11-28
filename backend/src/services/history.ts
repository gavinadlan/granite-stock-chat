// Price history (OHLCV candles) straight from Yahoo; no synthetic bars.
// TODO(S1-04): read through the DynamoDB cache (TTL: intraday 2 min, daily 6 h).
import type { HistoryResponse } from '@stockai/shared';
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
  const candles = downsample(cleaned, MAX_CANDLES);
  const warnings = candles.length < cleaned.length
    ? [`Downsampled ${cleaned.length} candles to ${candles.length} (each bar merges consecutive ${interval} bars)`]
    : [];
  return {
    data: {
      symbol: meta.symbol || symbol,
      currency: meta.currency || null,
      exchangeTimezone: meta.exchangeTimezoneName || null,
      range,
      interval,
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
