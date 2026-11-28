import { formatWibDate, formatWibDateTime } from '@/lib/time';

interface DataSourceBadgeProps {
  source: string;
  /** ISO timestamp of when the data was valid. */
  asOf: string;
  /** Bar size of candle data, e.g. "daily": shows the date only plus "daily candles" instead of the bar's open time. */
  candles?: string;
  className?: string;
}

/**
 * Shows where a number came from and how fresh it is: "Source: Yahoo Finance · Nov 27, 2026, 16:10 WIB",
 * or for candle data "Source: Yahoo Finance · Nov 27, 2026 · daily candles".
 */
export function DataSourceBadge({ source, asOf, candles, className = '' }: DataSourceBadgeProps) {
  const when = candles ? formatWibDate(asOf) : formatWibDateTime(asOf);
  return (
    <p className={`text-sm text-muted-foreground [overflow-wrap:anywhere] ${className}`}>
      Source: {source}
      {when && <> · <time dateTime={asOf}>{when}</time></>}
      {candles && ` · ${candles} candles`}
    </p>
  );
}
