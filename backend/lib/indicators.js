'use strict';
// Pure technical-indicator functions. Every function returns an array aligned
// with the input (null where there is not enough data yet).
// Sprint 1 (S1-05) ports these to TypeScript and adds more indicators.

function sma(values, period) {
  const out = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

/** EMA seeded with the SMA of the first `period` values. Nulls in input are skipped at the start. */
function ema(values, period) {
  const out = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  const start = values.findIndex((v) => v !== null && v !== undefined);
  if (start < 0 || values.length - start < period) return out;
  let seed = 0;
  for (let i = start; i < start + period; i++) seed += values[i];
  let prev = seed / period;
  out[start + period - 1] = prev;
  for (let i = start + period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

/** RSI with Wilder's smoothing (the standard definition). */
function rsi(closes, period = 14) {
  const out = new Array(closes.length).fill(null);
  if (closes.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  const value = () => (avgLoss === 0 ? (avgGain === 0 ? 50 : 100) : 100 - 100 / (1 + avgGain / avgLoss));
  out[period] = value();
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = value();
  }
  return out;
}

function macd(closes, fast = 12, slow = 26, signalPeriod = 9) {
  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);
  const line = closes.map((_, i) => (fastEma[i] !== null && slowEma[i] !== null ? fastEma[i] - slowEma[i] : null));
  const signal = ema(line, signalPeriod);
  const histogram = line.map((v, i) => (v !== null && signal[i] !== null ? v - signal[i] : null));
  return { macd: line, signal, histogram };
}

const last = (arr) => (arr.length ? arr[arr.length - 1] : null);
const round = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? null : Number(v.toFixed(d)));

/**
 * Summarise the latest indicator values from daily candles.
 * Support/resistance = lowest low / highest high of the last `lookback` sessions (simple range levels).
 */
function summarize(candles, { lookback = 20 } = {}) {
  const closes = candles.map((c) => c.c);
  const price = last(closes);
  const s20 = last(sma(closes, 20));
  const s50 = last(sma(closes, 50));
  const s200 = last(sma(closes, 200));
  const r = last(rsi(closes, 14));
  const m = macd(closes);
  const recent = candles.slice(-lookback);
  const support = recent.length ? Math.min(...recent.map((c) => c.l)) : null;
  const resistance = recent.length ? Math.max(...recent.map((c) => c.h)) : null;

  let trend = 'neutral';
  if (price !== null && s50 !== null) {
    if (price > s50 && (s200 === null || s50 > s200)) trend = 'bullish';
    else if (price < s50 && (s200 === null || s50 < s200)) trend = 'bearish';
  }

  const signals = [];
  if (r !== null && r >= 70) signals.push({ id: 'rsi_overbought', severity: 'bearish', label: `RSI ${r.toFixed(1)} is above 70 (overbought)` });
  if (r !== null && r <= 30) signals.push({ id: 'rsi_oversold', severity: 'bullish', label: `RSI ${r.toFixed(1)} is below 30 (oversold)` });
  const h = m.histogram;
  const n = h.length;
  if (n >= 2 && h[n - 1] !== null && h[n - 2] !== null) {
    if (h[n - 2] < 0 && h[n - 1] >= 0) signals.push({ id: 'macd_cross_up', severity: 'bullish', label: 'MACD crossed above its signal line' });
    if (h[n - 2] > 0 && h[n - 1] <= 0) signals.push({ id: 'macd_cross_down', severity: 'bearish', label: 'MACD crossed below its signal line' });
  }

  return {
    price: round(price),
    rsi: round(r),
    macd: { macd: round(last(m.macd), 4), signal: round(last(m.signal), 4), histogram: round(last(h), 4) },
    movingAverages: { sma20: round(s20), sma50: round(s50), sma200: round(s200) },
    support: round(support),
    resistance: round(resistance),
    trend,
    signals,
    candlesUsed: candles.length,
  };
}

module.exports = { sma, ema, rsi, macd, summarize };
