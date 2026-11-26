import { stockMarketAPI } from '@/services/stockMarketAPI';
import { formatSymbol } from './symbolUtils';

/** Ticker strip on the landing page, in display order. */
export const STRIP_SYMBOLS = ['^JKSE', 'BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'TLKM.JK', 'GOTO.JK', 'NVDA', 'MSFT', 'TSLA'];

/** "^JKSE" → "IHSG", "BBCA.JK" → "BBCA", "NVDA" → "NVDA". */
export function tickerLabel(symbol: string): string {
  if (symbol === '^JKSE') return 'IHSG';
  return symbol.replace(/\.JK$/, '');
}

const ONE_TICKER = /^\^?[A-Z]{1,5}(?:[.-][A-Z]{1,2})?$/;

/**
 * Ticker from what a visitor typed: a single ticker-like word in any case ("aapl", "^jkse"),
 * else the first capitalised ticker in a sentence ("Technical analysis BBCA.JK"). Null when none.
 */
export function parseTicker(input: string): string | null {
  const one = input.trim().replace(/[?!.,]+$/, '').toUpperCase();
  if (ONE_TICKER.test(one)) return formatSymbol(one);
  const found = stockMarketAPI.extractSymbol(input);
  return found ? formatSymbol(found) : null;
}

/** News and AI outlook need an account; prices and indicators do not. */
export function isAccountQuestion(input: string): boolean {
  return /news|berita|outlook|predict|forecast|prediksi|proyeksi/i.test(input);
}

/** "Yahoo Finance (daily candles)" + 240 → "Yahoo Finance daily candles (240 sessions)". */
export function indicatorSource(source: string, candlesUsed: number | null | undefined): string {
  const plain = source.replace(/\s*\((.+)\)$/, ' $1');
  return candlesUsed ? `${plain} (${candlesUsed} sessions)` : plain;
}
