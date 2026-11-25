interface DataSourceBadgeProps {
  source: string;
  /** ISO timestamp of when the data was valid. */
  asOf: string;
  className?: string;
}

const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** Shows where a number came from and how fresh it is, e.g. "Source: Yahoo Finance · 21 Oct 2026, 17:05". */
export function DataSourceBadge({ source, asOf, className = '' }: DataSourceBadgeProps) {
  const date = new Date(asOf);
  const when = Number.isNaN(date.getTime()) ? null : formatter.format(date);
  return (
    <p className={`text-sm text-muted-foreground [overflow-wrap:anywhere] ${className}`}>
      Source: {source}
      {when && <> · <time dateTime={asOf}>{when}</time></>}
    </p>
  );
}
