import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  TickMarkType,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle, HistoryResponse } from '@stockai/shared';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ApiError } from '@/services/apiClient';
import { stockMarketAPI } from '@/services/stockMarketAPI';
import {
  CHART_RANGES,
  chartSummary,
  DEFAULT_CHART_RANGE,
  formatBarTime,
  formatTick,
  isIntraday,
  rangeQuery,
  safeTimeZone,
  sessionLabel,
  timeZoneLabel,
  type ChartRange,
  type TickKind,
} from '@/lib/chart';
import { formatNumber, formatPrice, formatVolume, priceDecimals } from '@/lib/currencyUtils';
import { formatWibDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; history: HistoryResponse };

/**
 * Resolve a Granite token to a color lightweight-charts can parse. The library draws on canvas and cannot
 * read CSS variables, so a probe element lets the browser compute `hsl(var(--token))` into rgb().
 */
function tokenColor(token: string, alpha = 1): string {
  const probe = document.createElement('span');
  probe.style.color = `hsl(var(--${token}) / ${alpha})`;
  probe.style.display = 'none';
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || 'transparent';
}

function themeColors() {
  return {
    background: tokenColor('card'),
    text: tokenColor('muted-foreground'),
    grid: tokenColor('border'),
    up: tokenColor('up'),
    down: tokenColor('down'),
    volume: tokenColor('muted-foreground', 0.35),
  };
}

const TICK_KIND: Partial<Record<TickMarkType, TickKind>> = {
  [TickMarkType.Year]: 'year',
  [TickMarkType.Month]: 'month',
  [TickMarkType.DayOfMonth]: 'day',
  [TickMarkType.Time]: 'time',
  [TickMarkType.TimeWithSeconds]: 'time',
};

const seconds = (time: Time) => (typeof time === 'number' ? time : 0);

export function PriceChart({ symbol }: { symbol: string }) {
  const [label, setLabel] = useState<ChartRange>(DEFAULT_CHART_RANGE);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ status: 'loading' });
  const [hovered, setHovered] = useState<Candle | null>(null);
  const reduceMotion = useReducedMotion();

  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);
  const byTime = useRef(new Map<number, Candle>());

  // Fetch on symbol, range or retry.
  useEffect(() => {
    let stale = false;
    setState({ status: 'loading' });
    setHovered(null);
    const { range, interval } = rangeQuery(label);
    stockMarketAPI.getHistory(symbol, range, interval).then(
      (history) => !stale && setState({ status: 'ready', history }),
      (err: unknown) =>
        !stale && setState({ status: 'error', message: err instanceof ApiError ? err.message : 'Unexpected error.' }),
    );
    return () => {
      stale = true;
    };
  }, [symbol, label, attempt]);

  // Create the chart once; autoSize follows the container through the library's own ResizeObserver.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const c = createChart(el, { autoSize: true, layout: { attributionLogo: true } });
    candleSeries.current = c.addSeries(CandlestickSeries, { borderVisible: false });
    candleSeries.current.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.25 } });
    volumeSeries.current = c.addSeries(HistogramSeries, { priceScaleId: '', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false });
    c.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    const onMove = (param: MouseEventParams) => setHovered(param.time ? byTime.current.get(seconds(param.time)) ?? null : null);
    c.subscribeCrosshairMove(onMove);

    const applyTheme = () => {
      const t = themeColors();
      c.applyOptions({
        layout: { background: { type: ColorType.Solid, color: t.background }, textColor: t.text, fontFamily: getComputedStyle(el).fontFamily },
        grid: { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
        rightPriceScale: { borderColor: t.grid },
        timeScale: { borderColor: t.grid },
      });
      candleSeries.current?.applyOptions({ upColor: t.up, downColor: t.down, wickUpColor: t.up, wickDownColor: t.down });
      volumeSeries.current?.applyOptions({ color: t.volume });
    };
    applyTheme();
    // Dark mode is a class on <html>; recolor when it changes.
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    chart.current = c;
    return () => {
      themeObserver.disconnect();
      c.unsubscribeCrosshairMove(onMove);
      c.remove();
      chart.current = null;
      candleSeries.current = null;
      volumeSeries.current = null;
    };
  }, []);

  useEffect(() => {
    chart.current?.applyOptions({ kineticScroll: { touch: !reduceMotion, mouse: false } });
  }, [reduceMotion]);

  const history = state.status === 'ready' ? state.history : null;
  const candles = useMemo(() => history?.data.candles ?? [], [history]);
  const currency = history?.data.currency || 'USD';
  const tz = safeTimeZone(history?.data.exchangeTimezone);
  const intraday = isIntraday(label);

  // Push data and formatters when a response arrives.
  useEffect(() => {
    const c = chart.current;
    if (!c || !history) return;
    const decimals = priceDecimals(currency, history.data.symbol);
    byTime.current = new Map(candles.map((k) => [k.t, k]));
    c.applyOptions({
      localization: {
        timeFormatter: (time: Time) => formatBarTime(seconds(time), tz, intraday),
        priceFormatter: (p: number) => formatNumber(p, currency, decimals),
      },
      timeScale: {
        timeVisible: intraday,
        secondsVisible: false,
        tickMarkFormatter: (time: Time, type: TickMarkType) => formatTick(seconds(time), tz, TICK_KIND[type] ?? 'day'),
      },
    });
    candleSeries.current?.applyOptions({ priceFormat: { type: 'price', precision: decimals, minMove: 1 / 10 ** decimals } });
    candleSeries.current?.setData(candles.map((k) => ({ time: k.t as UTCTimestamp, open: k.o, high: k.h, low: k.l, close: k.c })));
    volumeSeries.current?.setData(candles.flatMap((k) => (k.v == null ? [] : [{ time: k.t as UTCTimestamp, value: k.v }])));
    c.timeScale().fitContent();
  }, [history, candles, currency, tz, intraday]);

  const shown = hovered ?? candles[candles.length - 1] ?? null;
  const zone = shown ? timeZoneLabel(tz, new Date(shown.t * 1000)) : null;
  const summary = history
    ? chartSummary(history.data.symbol, label, candles, currency)
    : `${symbol} price chart, ${label}: ${state.status === 'error' ? 'unavailable' : 'loading'}`;
  const lastTen = candles.slice(-10).reverse();

  return (
    <section aria-label={`${symbol} price chart`} className="space-y-3 rounded-card border bg-card p-4 text-card-foreground sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset>
          <legend className="sr-only">Chart range</legend>
          <div className="flex gap-1">
            {CHART_RANGES.map((r) => (
              <label key={r.label} className="relative">
                <input
                  type="radio"
                  name={`range-${symbol}`}
                  value={r.label}
                  checked={label === r.label}
                  onChange={() => setLabel(r.label)}
                  className="peer sr-only"
                />
                <span className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-control px-2 text-sm font-medium text-muted-foreground hover:text-foreground peer-checked:bg-secondary peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  {r.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {shown && (
          <dl className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm tabular-nums" aria-live="off">
            {[
              ['O', formatPrice(shown.o, currency)],
              ['H', formatPrice(shown.h, currency)],
              ['L', formatPrice(shown.l, currency)],
              ['C', formatPrice(shown.c, currency)],
              ['V', formatVolume(shown.v, currency)],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-1">
                <dt className="text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {shown && (
        <p className="text-sm text-muted-foreground">
          {label === '1D' && !hovered ? `${sessionLabel(candles, tz)} · ${zone}` : formatBarTime(shown.t, tz, intraday)}
        </p>
      )}

      <div className="relative h-[300px] sm:h-[420px]">
        <div ref={container} role="img" aria-label={summary} className={cn('h-full w-full', state.status !== 'ready' && 'invisible')} />
        {state.status === 'loading' && <div className="absolute inset-0 rounded-control bg-muted motion-safe:animate-pulse" aria-hidden="true" />}
        {state.status === 'error' && (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-sm text-muted-foreground">Price history is unavailable right now. {state.message}</p>
            <Button variant="outline" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </Button>
          </div>
        )}
      </div>

      {history && (
        <div className="space-y-2 text-sm text-muted-foreground">
          {history.meta.warnings?.map((w) => <p key={w}>{w}</p>)}
          <p>
            Source: {history.meta.source}
            {history.meta.delayed && ', delayed'} · {formatWibDateTime(history.meta.asOf) ?? history.meta.asOf}
          </p>
          {lastTen.length > 0 && (
            <details>
              <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-control text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Show data table
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left tabular-nums">
                  <caption className="sr-only">Last {lastTen.length} candles, newest first</caption>
                  <thead>
                    <tr className="text-muted-foreground">
                      {['Time', 'Open', 'High', 'Low', 'Close', 'Volume'].map((h) => (
                        <th key={h} scope="col" className="py-1 pr-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {lastTen.map((k) => (
                      <tr key={k.t} className="border-t">
                        <td className="py-1 pr-3">{formatBarTime(k.t, tz, intraday)}</td>
                        <td className="py-1 pr-3">{formatPrice(k.o, currency)}</td>
                        <td className="py-1 pr-3">{formatPrice(k.h, currency)}</td>
                        <td className="py-1 pr-3">{formatPrice(k.l, currency)}</td>
                        <td className="py-1 pr-3">{formatPrice(k.c, currency)}</td>
                        <td className="py-1 pr-3">{formatVolume(k.v, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      )}
      {/* TODO(S3-02b): SMA/Bollinger overlays and RSI/MACD panes from backend series (/v1/technicals?overlays=). */}
    </section>
  );
}

export default PriceChart;
