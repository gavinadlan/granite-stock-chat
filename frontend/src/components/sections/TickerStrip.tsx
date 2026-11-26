import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { stockMarketAPI, StockPrice } from '@/services/stockMarketAPI';
import { formatNumber, formatPercent, priceDecimals } from '@/lib/currencyUtils';
import { STRIP_SYMBOLS, tickerLabel } from '@/lib/landing';
import { formatWibTime, latestIso } from '@/lib/time';
import { cn } from '@/lib/utils';

const shell = 'bg-band text-[13px]';
const SPEED_PX_PER_S = 50;
const PAUSE_KEY = 'ticker_paused';
// Soft edges: fade in on the left, fade out before the pause button and label.
const FADE = '[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-40px),transparent)]';

function QuoteList({ quotes, hidden = false }: { quotes: StockPrice[]; hidden?: boolean }) {
  return (
    // pr-7 equals the gap, so the second copy starts exactly one gap after the first: -50% loops without a jump.
    <ul className="flex flex-none gap-7 pr-7" aria-hidden={hidden || undefined}>
      {quotes.map((q) => {
        const pct = q.changePercent;
        const color = pct == null || pct === 0 ? 'text-muted-foreground' : pct > 0 ? 'text-up' : 'text-down';
        return (
          <li key={q.symbol}>
            <span className="font-semibold">{tickerLabel(q.symbol)}</span> {formatNumber(q.price, q.currency, priceDecimals(q.currency, q.symbol))}{' '}
            <span className={color}>{formatPercent(pct, q.currency)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Dark strip of live quotes that scrolls right to left at a constant speed (static and scrollable with
 * reduced motion). Symbols that fail are left out; when all fail the strip is not shown.
 * Its content uses the .dark tokens in both themes so up/down stay readable on the band.
 * TODO(S1-04): one batch endpoint behind the server cache instead of nine requests per visitor,
 * then refresh every 60 seconds.
 */
export function TickerStrip() {
  const [quotes, setQuotes] = useState<StockPrice[] | null>(null);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(() => sessionStorage.getItem(PAUSE_KEY) === '1');
  const [duration, setDuration] = useState<number | null>(null);
  const firstCopy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stale = false;
    Promise.allSettled(STRIP_SYMBOLS.map((s) => stockMarketAPI.getStockPrice(s))).then((results) => {
      if (!stale) setQuotes(results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])));
    });
    return () => {
      stale = true;
    };
  }, []);

  // Duration from the width of one copy keeps the speed constant whatever the number of symbols or font load.
  useEffect(() => {
    const el = firstCopy.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setDuration(el.offsetWidth / SPEED_PX_PER_S));
    ro.observe(el);
    return () => ro.disconnect();
  }, [quotes, reduceMotion]);

  const togglePaused = () => {
    setPaused((p) => {
      sessionStorage.setItem(PAUSE_KEY, p ? '0' : '1');
      return !p;
    });
  };

  // Keep the strip's height while loading so the page does not jump.
  if (quotes === null) return <div className={cn(shell, 'h-[39px]')} aria-hidden="true" />;
  if (quotes.length === 0) return null;

  const latest = latestIso(quotes.map((q) => q.asOf));
  const sources = [...new Set(quotes.map((q) => q.source))].join(', ');
  const time = latest && formatWibTime(latest);
  const delayed = quotes.some((q) => q.delayed);
  // Below sm the source is left out to give the moving quotes room; every card and the footer still name it.
  const note = (
    <p className="flex-none text-muted-foreground">
      {delayed && 'Delayed'}
      <span className="hidden sm:inline">
        {delayed && ', '}
        {sources}
      </span>
      {latest && time && (
        <>
          {delayed ? ', ' : <span className="hidden sm:inline">, </span>}
          <time dateTime={latest}>{time}</time>
        </>
      )}
    </p>
  );

  if (reduceMotion) {
    return (
      <section aria-label="Market quotes" className={cn(shell, 'overflow-x-auto')}>
        <div className="dark mx-auto flex max-w-[1248px] items-center gap-7 whitespace-nowrap px-4 py-2.5 tabular-nums text-foreground sm:px-6">
          <QuoteList quotes={quotes} />
          <div className="ml-auto">{note}</div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Market quotes" className={cn(shell, 'group')}>
      <div className="dark flex items-center gap-3 whitespace-nowrap py-2.5 pr-4 tabular-nums text-foreground sm:pr-6">
        <div className={cn('min-w-0 flex-1 overflow-hidden', FADE)}>
          <div
            data-testid="ticker-track"
            className={cn(
              'flex w-max animate-ticker group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]',
              paused && '[animation-play-state:paused]',
            )}
            style={duration ? ({ '--ticker-duration': `${duration}s` } as React.CSSProperties) : undefined}
          >
            <div ref={firstCopy} className="flex flex-none">
              <QuoteList quotes={quotes} />
            </div>
            <QuoteList quotes={quotes} hidden />
          </div>
        </div>
        <button
          type="button"
          onClick={togglePaused}
          aria-label="Pause ticker"
          aria-pressed={paused}
          className="flex h-6 w-6 flex-none items-center justify-center rounded-control text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
        {note}
      </div>
    </section>
  );
}
