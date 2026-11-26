import type { StockPrice, TechnicalAnalysis } from '@/services/stockMarketAPI';
import { formatPercent, formatPrice } from './currencyUtils';
import { RSI_OVERBOUGHT, RSI_OVERSOLD } from './rsi';

function priceSentence(q: StockPrice): string {
  const base = `${q.symbol} is trading at ${formatPrice(q.price, q.currency)}`;
  const pct = q.changePercent;
  if (pct == null) return `${base}.`;
  if (pct === 0) return `${base}, unchanged today.`;
  return `${base}, ${pct > 0 ? 'up' : 'down'} ${formatPercent(Math.abs(pct), q.currency).replace(/^\+/, '')} today.`;
}

/** Classifies the rounded value, so the words always match the number shown. */
function rsiSentence(rsi: number): string {
  const r = Math.round(rsi);
  if (r <= RSI_OVERSOLD) return `RSI is ${r}, in the oversold zone (${RSI_OVERSOLD} or below).`;
  if (r >= RSI_OVERBOUGHT) return `RSI is ${r}, in the overbought zone (${RSI_OVERBOUGHT} or above).`;
  if (r < 50) return `RSI is ${r}, so momentum is weak.`;
  return `RSI is ${r}, so momentum is positive but not overbought.`;
}

function smaSentence(price: number, sma50: number | null, sma200: number | null): string | null {
  const side = (sma: number) => (price >= sma ? 'above' : 'below');
  if (sma50 != null && sma200 != null) {
    const a = side(sma50);
    const b = side(sma200);
    if (a === b) return `The price is ${a === 'below' ? 'still below' : 'above'} its 50 and 200 day averages.`;
    return `The price is ${a} its 50 day average and ${b} its 200 day average.`;
  }
  if (sma50 != null) return `The price is ${side(sma50)} its 50 day average.`;
  if (sma200 != null) return `The price is ${side(sma200)} its 200 day average.`;
  return null;
}

/**
 * Plain-language summary written by code from backend numbers (never by the LLM).
 * Sentences whose data is missing are left out; null when nothing can be said.
 */
export function summarizeTechnicals(quote: StockPrice | null, ta: TechnicalAnalysis | null): string | null {
  const parts = [
    quote && priceSentence(quote),
    ta?.rsi != null ? rsiSentence(ta.rsi) : null,
    quote && ta ? smaSentence(quote.price, ta.movingAverages.sma50, ta.movingAverages.sma200) : null,
  ].filter((p): p is string => Boolean(p));
  return parts.length ? parts.join(' ') : null;
}
