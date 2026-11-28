import type { Candle } from './indicators';

const finite = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

/** Drop bars with a missing o/h/l/c, sort by time and keep one bar per timestamp (the last seen). */
export function cleanCandles(candles: Candle[]): Candle[] {
  const byTime = new Map<number, Candle>();
  for (const c of candles) {
    if (finite(c.t) && finite(c.o) && finite(c.h) && finite(c.l) && finite(c.c)) {
      byTime.set(c.t, { ...c, v: finite(c.v) ? c.v : null });
    }
  }
  return [...byTime.values()].sort((a, b) => a.t - b.t);
}

/**
 * Merge consecutive bars into at most `max` buckets. Each bucket keeps the true
 * open/high/low/close of its bars, so extremes survive. Expects cleaned, ascending input.
 */
export function downsample(candles: Candle[], max: number): Candle[] {
  if (candles.length <= max) return candles;
  const size = Math.ceil(candles.length / max);
  const out: Candle[] = [];
  for (let i = 0; i < candles.length; i += size) {
    const bucket = candles.slice(i, i + size);
    const volumes = bucket.map((c) => c.v).filter(finite);
    out.push({
      t: bucket[0].t,
      o: bucket[0].o,
      h: Math.max(...bucket.map((c) => c.h)),
      l: Math.min(...bucket.map((c) => c.l)),
      c: bucket[bucket.length - 1].c,
      v: volumes.length ? volumes.reduce((a, b) => a + b, 0) : null,
    });
  }
  return out;
}
