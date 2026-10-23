// Indicators are computed from one year of real daily candles (no random data).
import type { TechnicalsResponse } from '@stockai/shared';
import { summarize } from '../domain/indicators';
import { unavailable } from '../lib/http';
import { getDailyHistory } from '../providers/yahoo';

export async function technicals(symbol: string): Promise<TechnicalsResponse> {
  const { meta, candles } = await getDailyHistory(symbol, '1y');
  if (candles.length < 30) throw unavailable(`Not enough price history for ${symbol} to compute indicators`);
  const summary = summarize(candles);
  const asOf = new Date(candles[candles.length - 1].t * 1000).toISOString();
  const warnings: string[] = [];
  if (summary.movingAverages.sma200 === null) warnings.push('Less than 200 sessions of history: SMA200 unavailable');
  return {
    symbol: meta.symbol || symbol,
    currency: meta.currency || null,
    ...summary,
    lastUpdated: asOf,
    asOf,
    source: 'Yahoo Finance (daily candles)',
    method: 'RSI(14, Wilder), MACD(12,26,9), SMA 20/50/200, 20-session range for support/resistance',
    warnings,
  };
}
