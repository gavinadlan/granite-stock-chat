// Pure helpers for the price chart and sparkline. Every number they print comes from the candles passed in.
import type { Candle, HistoryGranularity, HistoryInterval, HistoryRange } from '@stockai/shared';
import { formatPrice } from './currencyUtils';

export const CHART_RANGES = [
  { label: '1D', range: '1d', interval: '5m' },
  { label: '5D', range: '5d', interval: '15m' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '6M', range: '6mo', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1d' },
  { label: '5Y', range: '5y', interval: '1wk' },
] as const satisfies readonly { label: string; range: HistoryRange; interval: HistoryInterval }[];

export type ChartRange = (typeof CHART_RANGES)[number]['label'];
export const DEFAULT_CHART_RANGE: ChartRange = '6M';

/** Query pair sent to /v1/history for a range button. */
export function rangeQuery(label: ChartRange): { range: HistoryRange; interval: HistoryInterval } {
  const { range, interval } = CHART_RANGES.find((r) => r.label === label) ?? CHART_RANGES[3];
  return { range, interval };
}

const DAILY_OR_LONGER = new Set<HistoryInterval>(['1d', '1wk']);
export const isIntraday = (label: ChartRange) => !DAILY_OR_LONGER.has(rangeQuery(label).interval);

// Indonesian zones only get WIB/WITA/WIT from the id-ID locale; en-US prints "GMT+7".
const INDONESIAN_ZONES = new Set(['Asia/Jakarta', 'Asia/Pontianak', 'Asia/Makassar', 'Asia/Jayapura']);

const formatters = new Map<string, Intl.DateTimeFormat>();
function dtf(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, f);
  }
  return f;
}

/** Valid IANA zone or UTC (the API may send null; an unknown zone would throw in Intl). */
export function safeTimeZone(tz: string | null | undefined): string {
  if (!tz) return 'UTC';
  try {
    dtf('en-US', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

/** Short zone name at a given instant: "WIB" for Asia/Jakarta, "EST"/"EDT" for America/New_York, "UTC". */
export function timeZoneLabel(tz: string, at: Date): string {
  const locale = INDONESIAN_ZONES.has(tz) ? 'id-ID' : 'en-US';
  const part = dtf(locale, { timeZone: tz, timeZoneName: 'short' }).formatToParts(at).find((p) => p.type === 'timeZoneName');
  return part?.value ?? tz;
}

const date = (t: number) => new Date(t * 1000);

/** Crosshair/legend time of a bar in the exchange zone: "Nov 27, 2026, 14:35 WIB" (intraday) or "Nov 27, 2026". */
export function formatBarTime(t: number, tz: string, intraday: boolean): string {
  const d = date(t);
  if (!intraday) return dtf('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  const text = dtf('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  return `${text} ${timeZoneLabel(tz, d)}`;
}

export type TickKind = 'year' | 'month' | 'day' | 'time';

/** Time-axis label in the exchange zone: "2026", "Nov", "27", "14:35". */
export function formatTick(t: number, tz: string, kind: TickKind): string {
  const options: Record<TickKind, Intl.DateTimeFormatOptions> = {
    year: { year: 'numeric' },
    month: { month: 'short' },
    day: { day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
  };
  return dtf('en-US', { timeZone: tz, ...options[kind] }).format(date(t));
}

/** "Session of Fri, Nov 27" from the last candle, for the 1D range. */
export function sessionLabel(candles: Candle[], tz: string): string | null {
  const last = candles[candles.length - 1];
  return last ? `Session of ${dtf('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(date(last.t))}` : null;
}

const CANDLE_NAMES: Partial<Record<HistoryGranularity, string>> = { '1d': 'daily', '1wk': 'weekly', '1mo': 'monthly', '3mo': 'quarterly' };

/** "daily", "weekly", ... for bars of a day or longer; null for intraday bars, which keep their time. */
export function candleName(interval: HistoryGranularity): string | null {
  return CANDLE_NAMES[interval] ?? null;
}

/** Text alternative for the chart canvas, built from the data. */
export function chartSummary(symbol: string, label: ChartRange, candles: Candle[], currency: string): string {
  if (!candles.length) return `${symbol} price chart, ${label}: no data`;
  const first = candles[0];
  const last = candles[candles.length - 1];
  const high = Math.max(...candles.map((c) => c.h));
  const low = Math.min(...candles.map((c) => c.l));
  const p = (v: number) => formatPrice(v, currency, symbol);
  return `${symbol} price chart, ${label}: from ${p(first.o)} to ${p(last.c)}, high ${p(high)}, low ${p(low)}, ${candles.length} candles`;
}

/** SVG path for a line through `values`, scaled into width x height with `pad` px inside. Empty when fewer than 2 points. */
export function sparklinePath(values: number[], width: number, height: number, pad = 1): string {
  const points = values.filter(Number.isFinite);
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const span = Math.max(...points) - min;
  const stepX = (width - 2 * pad) / (points.length - 1);
  const round = (n: number) => Math.round(n * 100) / 100;
  return points
    .map((v, i) => {
      // A flat series sits in the middle instead of dividing by zero.
      const y = span === 0 ? height / 2 : pad + (1 - (v - min) / span) * (height - 2 * pad);
      return `${i ? 'L' : 'M'}${round(pad + i * stepX)},${round(y)}`;
    })
    .join('');
}
