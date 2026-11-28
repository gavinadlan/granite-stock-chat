import { formatWibDateTime } from '@/lib/time';

interface DataSourceBadgeProps {
  source: string;
  /** ISO timestamp of when the data was valid. */
  asOf: string;
  className?: string;
}

/** Shows where a number came from and how fresh it is, e.g. "Source: Yahoo Finance · Nov 27, 2026, 16:10 WIB". */
export function DataSourceBadge({ source, asOf, className = '' }: DataSourceBadgeProps) {
  const when = formatWibDateTime(asOf);
  return (
    <p className={`text-sm text-muted-foreground [overflow-wrap:anywhere] ${className}`}>
      Source: {source}
      {when && <> · <time dateTime={asOf}>{when}</time></>}
    </p>
  );
}
