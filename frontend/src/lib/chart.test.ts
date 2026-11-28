import { describe, expect, it } from 'vitest';
import type { Candle } from '@stockai/shared';
import {
  CHART_RANGES, chartSummary, formatBarTime, formatTick, isIntraday, rangeQuery, safeTimeZone, sessionLabel, sparklinePath, timeZoneLabel,
} from './chart';

// Test data only.
const bar = (t: number, o: number, h: number, l: number, c: number): Candle => ({ t, o, h, l, c, v: 1000 });
// 2026-11-27 09:00 UTC = 16:00 WIB = 04:00 EST, a Friday.
const FRI = Date.UTC(2026, 10, 27, 9) / 1000;

describe('range mapping', () => {
  it('maps each button to the agreed range/interval pair', () => {
    expect(CHART_RANGES.map((r) => `${r.label}=${r.range}/${r.interval}`)).toEqual([
      '1D=1d/5m', '5D=5d/15m', '1M=1mo/1d', '6M=6mo/1d', '1Y=1y/1d', '5Y=5y/1wk',
    ]);
    expect(rangeQuery('6M')).toEqual({ range: '6mo', interval: '1d' });
  });
  it('knows which ranges are intraday', () => {
    expect(['1D', '5D'].every((l) => isIntraday(l as '1D'))).toBe(true);
    expect(['1M', '6M', '1Y', '5Y'].some((l) => isIntraday(l as '1M'))).toBe(false);
  });
});

describe('time zones', () => {
  it('labels Asia/Jakarta as WIB, not GMT+7', () => {
    expect(timeZoneLabel('Asia/Jakarta', new Date(FRI * 1000))).toBe('WIB');
  });
  it('labels America/New_York with EST in winter and EDT in summer', () => {
    expect(timeZoneLabel('America/New_York', new Date(FRI * 1000))).toBe('EST');
    expect(timeZoneLabel('America/New_York', new Date(Date.UTC(2026, 6, 1)))).toBe('EDT');
  });
  it('falls back to UTC for a missing or unknown zone', () => {
    expect(safeTimeZone(null)).toBe('UTC');
    expect(safeTimeZone('Mars/Olympus')).toBe('UTC');
    expect(safeTimeZone('Asia/Jakarta')).toBe('Asia/Jakarta');
  });
  it('formats bar times in the exchange zone', () => {
    expect(formatBarTime(FRI, 'Asia/Jakarta', true)).toBe('Nov 27, 2026, 16:00 WIB');
    expect(formatBarTime(FRI, 'America/New_York', true)).toBe('Nov 27, 2026, 04:00 EST');
    expect(formatBarTime(FRI, 'Asia/Jakarta', false)).toBe('Nov 27, 2026');
    expect(formatTick(FRI, 'Asia/Jakarta', 'time')).toBe('16:00');
    expect(formatTick(FRI, 'UTC', 'time')).toBe('09:00');
    expect(formatTick(FRI, 'Asia/Jakarta', 'month')).toBe('Nov');
  });
  it('names the session from the last candle, in the exchange zone', () => {
    // 2026-11-27 20:00 UTC is already Saturday in Jakarta.
    const late = Date.UTC(2026, 10, 27, 20) / 1000;
    expect(sessionLabel([bar(FRI - 3600, 1, 1, 1, 1), bar(FRI, 1, 1, 1, 1)], 'Asia/Jakarta')).toBe('Session of Fri, Nov 27');
    expect(sessionLabel([bar(late, 1, 1, 1, 1)], 'Asia/Jakarta')).toBe('Session of Sat, Nov 28');
    expect(sessionLabel([], 'UTC')).toBeNull();
  });
});

describe('chartSummary', () => {
  it('describes first open, last close and extremes from the data', () => {
    const candles = [bar(1, 100, 110, 95, 105), bar(2, 105, 120, 90, 118)];
    expect(chartSummary('AAPL', '6M', candles, 'USD')).toBe('AAPL price chart, 6M: from $100.00 to $118.00, high $120.00, low $90.00, 2 candles');
  });
  it('uses the currency locale', () => {
    expect(chartSummary('BBCA.JK', '1D', [bar(1, 9800, 9900, 9750, 9875)], 'IDR')).toContain('from Rp9.800 to Rp9.875');
  });
  it('says so when there is no data', () => {
    expect(chartSummary('AAPL', '1Y', [], 'USD')).toBe('AAPL price chart, 1Y: no data');
  });
});

describe('sparklinePath', () => {
  it('scales the series into the box, highest value at the top', () => {
    expect(sparklinePath([1, 3, 2], 100, 50, 0)).toBe('M0,50L50,0L100,25');
  });
  it('keeps padding inside the box', () => {
    expect(sparklinePath([0, 10], 10, 10, 1)).toBe('M1,9L9,1');
  });
  it('draws a flat series in the middle', () => {
    expect(sparklinePath([5, 5, 5], 10, 20, 0)).toBe('M0,10L5,10L10,10');
  });
  it('returns nothing for fewer than two finite points', () => {
    expect(sparklinePath([], 10, 10)).toBe('');
    expect(sparklinePath([1, NaN], 10, 10)).toBe('');
  });
});
