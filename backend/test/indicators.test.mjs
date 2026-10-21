import { describe, expect, it } from 'vitest';
import ind from '../lib/indicators.js';
const { sma, ema, rsi, macd, summarize } = ind;

describe('sma/ema', () => {
  it('sma averages a sliding window', () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });
  it('ema of a linear series lags by (period-1)/2', () => {
    const out = ema([1, 2, 3, 4, 5, 6], 3);
    expect(out.slice(0, 2)).toEqual([null, null]);
    expect(out[5]).toBeCloseTo(5, 10);
  });
});

describe('rsi (Wilder)', () => {
  // Classic reference series (StockCharts example). The published table uses closes with
  // more decimals than shown here, so allow ±0.15 against its 70.53 / 66.32 values.
  const closes = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.0];
  it('matches the reference values', () => {
    const r = rsi(closes, 14);
    expect(r[13]).toBeNull();
    expect(Math.abs(r[14] - 70.53)).toBeLessThan(0.15);
    expect(Math.abs(r[15] - 66.32)).toBeLessThan(0.15);
  });
  it('is 100 for a strictly rising series and 50 for a flat one', () => {
    expect(rsi([...Array(20).keys()], 14)[19]).toBe(100);
    expect(rsi(Array(20).fill(10), 14)[19]).toBe(50);
  });
});

describe('macd', () => {
  it('is zero for a constant series', () => {
    const m = macd(Array(60).fill(100));
    expect(m.macd[59]).toBeCloseTo(0, 10);
    expect(m.histogram[59]).toBeCloseTo(0, 10);
  });
});

describe('summarize', () => {
  const candles = Array.from({ length: 250 }, (_, i) => ({ t: i, o: 100 + i, h: 101 + i, l: 99 + i, c: 100 + i, v: 1 }));
  it('detects a bullish trend and overbought RSI on a steady uptrend', () => {
    const s = summarize(candles);
    expect(s.trend).toBe('bullish');
    expect(s.rsi).toBe(100);
    expect(s.signals.map((x) => x.id)).toContain('rsi_overbought');
    expect(s.support).toBe(99 + 230);
    expect(s.resistance).toBe(101 + 249);
  });
  it('returns null SMA200 with short history', () => {
    expect(summarize(candles.slice(0, 60)).movingAverages.sma200).toBeNull();
  });
});
