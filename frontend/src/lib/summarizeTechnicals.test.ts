import { describe, expect, it } from 'vitest';
import type { StockPrice, TechnicalAnalysis } from '@/services/stockMarketAPI';
import { summarizeTechnicals } from './summarizeTechnicals';

// Test data only.
const asOf = '2026-01-02T03:04:00Z';
const quote = (over: Partial<StockPrice> = {}): StockPrice => ({
  symbol: 'BBCA.JK', price: 5875, change: 50, changePercent: 0.86, volume: null, marketCap: null,
  currency: 'IDR', source: 'Yahoo Finance', asOf, lastUpdated: asOf, ...over,
});
const ta = (over: Partial<TechnicalAnalysis> = {}): TechnicalAnalysis => ({
  symbol: 'BBCA.JK', currency: 'IDR', rsi: 61.98, macd: { macd: null, signal: null, histogram: null },
  movingAverages: { sma20: null, sma50: 6000, sma200: 6200 }, support: null, resistance: null,
  trend: 'neutral', signals: [], warnings: [], source: 'Yahoo Finance (daily candles)', asOf, lastUpdated: asOf, ...over,
});
const rsiOnly = (rsi: number) => summarizeTechnicals(null, ta({ rsi }));

describe('summarizeTechnicals', () => {
  it('matches the mockup sentence', () => {
    expect(summarizeTechnicals(quote(), ta())).toBe(
      'BBCA.JK is trading at Rp5.875, up 0,86% today. RSI is 62, so momentum is positive but not overbought. The price is still below its 50 and 200 day averages.',
    );
  });

  it('describes falls, flat days and missing change in the currency locale', () => {
    expect(summarizeTechnicals(quote({ symbol: 'MSFT', currency: 'USD', price: 489.93, changePercent: -1.25 }), null)).toBe(
      'MSFT is trading at $489.93, down 1.25% today.',
    );
    expect(summarizeTechnicals(quote({ changePercent: 0 }), null)).toBe('BBCA.JK is trading at Rp5.875, unchanged today.');
    expect(summarizeTechnicals(quote({ changePercent: null }), null)).toBe('BBCA.JK is trading at Rp5.875.');
  });

  it.each([
    [25, 'RSI is 25, in the oversold zone (30 or below).'],
    [30, 'RSI is 30, in the oversold zone (30 or below).'],
    [30.4, 'RSI is 30, in the oversold zone (30 or below).'],
    [30.6, 'RSI is 31, so momentum is weak.'],
    [49.4, 'RSI is 49, so momentum is weak.'],
    [49.5, 'RSI is 50, so momentum is positive but not overbought.'],
    [50, 'RSI is 50, so momentum is positive but not overbought.'],
    [69.4, 'RSI is 69, so momentum is positive but not overbought.'],
    [69.5, 'RSI is 70, in the overbought zone (70 or above).'],
    [70, 'RSI is 70, in the overbought zone (70 or above).'],
    [75, 'RSI is 75, in the overbought zone (70 or above).'],
  ])('RSI %s', (rsi, text) => {
    expect(rsiOnly(rsi)).toBe(text);
  });

  it('places the price against SMA 50 and 200', () => {
    const sma = (sma50: number | null, sma200: number | null) =>
      summarizeTechnicals(quote({ changePercent: null }), ta({ rsi: null, movingAverages: { sma20: null, sma50, sma200 } }))?.replace(
        'BBCA.JK is trading at Rp5.875. ',
        '',
      );
    expect(sma(5000, 5500)).toBe('The price is above its 50 and 200 day averages.');
    expect(sma(5000, 6000)).toBe('The price is above its 50 day average and below its 200 day average.');
    expect(sma(6000, 5000)).toBe('The price is below its 50 day average and above its 200 day average.');
    expect(sma(5000, null)).toBe('The price is above its 50 day average.');
    expect(sma(null, 6000)).toBe('The price is below its 200 day average.');
    expect(sma(null, null)).toBe('BBCA.JK is trading at Rp5.875.');
  });

  it('skips what is missing and returns null when nothing is known', () => {
    expect(summarizeTechnicals(null, ta({ rsi: null }))).toBeNull();
    expect(summarizeTechnicals(null, null)).toBeNull();
  });
});
