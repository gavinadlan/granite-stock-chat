import type { QuoteResponse } from '@stockai/shared';
import { cacheMeta, getOrSet } from '../lib/cache';
import { keys } from '../lib/db';
import { exchangeOf, isMarketOpen } from '../lib/market-hours';
import { getQuote, type QuoteWithMeta } from '../providers/yahoo';

// 30 s while the exchange trades, 15 min when closed; unknown markets keep the short TTL.
const quoteTtl = (q: QuoteWithMeta) => {
  const exchange = exchangeOf(q.symbol, q.exchange);
  return exchange && !isMarketOpen(exchange) ? 15 * 60 : 30;
};

export async function quote(symbol: string): Promise<QuoteResponse> {
  const result = await getOrSet(keys.cache('quote', symbol), quoteTtl, () => getQuote(symbol));
  return { ...result.value, lastUpdated: result.value.asOf, ...cacheMeta(result) };
}
