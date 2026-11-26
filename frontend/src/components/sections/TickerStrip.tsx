import { useEffect, useState } from 'react';
import { stockMarketAPI, StockPrice } from '@/services/stockMarketAPI';
import { formatNumber, formatPercent, priceDecimals } from '@/lib/currencyUtils';
import { STRIP_SYMBOLS, tickerLabel } from '@/lib/landing';
import { formatWibTime, latestIso } from '@/lib/time';
import { cn } from '@/lib/utils';

const shell = 'bg-band text-[13px]';

/**
 * Dark strip of live quotes. Symbols that fail are left out; when all fail the strip is not shown.
 * Its content uses the .dark tokens in both themes so up/down stay readable on the band.
 * TODO(S1-04): replace the nine requests per visitor with one batch endpoint behind the server cache.
 */
export function TickerStrip() {
  const [quotes, setQuotes] = useState<StockPrice[] | null>(null);

  useEffect(() => {
    let stale = false;
    Promise.allSettled(STRIP_SYMBOLS.map((s) => stockMarketAPI.getStockPrice(s))).then((results) => {
      if (!stale) setQuotes(results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])));
    });
    return () => {
      stale = true;
    };
  }, []);

  // Keep the strip's height while loading so the page does not jump.
  if (quotes === null) return <div className={cn(shell, 'h-[39px]')} aria-hidden="true" />;
  if (quotes.length === 0) return null;

  const latest = latestIso(quotes.map((q) => q.asOf));
  const sources = [...new Set(quotes.map((q) => q.source))].join(', ');
  const label = [quotes.some((q) => q.delayed) && 'Delayed', sources].filter(Boolean).join(', ');
  const time = latest && formatWibTime(latest);

  return (
    <section aria-label="Market quotes" className={cn(shell, 'overflow-x-auto')}>
      <div className="dark mx-auto flex max-w-[1248px] items-center gap-7 whitespace-nowrap px-4 py-2.5 tabular-nums text-foreground sm:px-6">
        <ul className="flex gap-7">
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
        <p className="ml-auto text-muted-foreground">
          {label}
          {latest && time && (
            <>
              , <time dateTime={latest}>{time}</time>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
