import { badgeVariants } from '@/components/ui/badge';
import { formatWibDate, formatWibDateTime } from '@/lib/time';

interface DataSourceBadgeProps {
  source: string;
  /** ISO timestamp of when the data was valid. */
  asOf: string;
  /** Bar size of candle data, e.g. "daily": shows the date only plus "daily candles" instead of the bar's open time. */
  candles?: string;
  /** The provider failed and this is older cached data (backend meta.stale). */
  stale?: boolean;
  className?: string;
}

/**
 * Shows where a number came from and how fresh it is: "Source: Yahoo Finance · Nov 27, 2026, 16:10 WIB",
 * or for candle data "Source: Yahoo Finance · Nov 27, 2026 · daily candles".
 */
export function DataSourceBadge({ source, asOf, candles, stale, className = '' }: DataSourceBadgeProps) {
  const when = candles ? formatWibDate(asOf) : formatWibDateTime(asOf);
  return (
    <p className={`text-sm text-muted-foreground [overflow-wrap:anywhere] ${className}`}>
      Source: {source}
      {when && <> · <time dateTime={asOf}>{when}</time></>}
      {candles && ` · ${candles} candles`}
      {stale && (
        <>
          {' '}
          <span
            className={badgeVariants({ variant: 'outline', className: 'font-medium text-muted-foreground' })}
            title="The data provider is unavailable; showing the last cached data from the time above."
          >
            Data tertunda (cache)
          </span>
        </>
      )}
    </p>
  );
}
