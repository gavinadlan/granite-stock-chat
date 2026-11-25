import { Clock } from 'lucide-react';

interface DataSourceBadgeProps {
  source: string;
  /** ISO timestamp of when the data was valid. */
  asOf: string;
  delayed?: boolean;
  className?: string;
}

const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** Shows where a number came from and how fresh it is, e.g. "Source: Yahoo Finance · 21 Oct 2026, 17:05". */
export function DataSourceBadge({ source, asOf, delayed, className = '' }: DataSourceBadgeProps) {
  const date = new Date(asOf);
  const when = Number.isNaN(date.getTime()) ? null : formatter.format(date);
  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground ${className}`}>
      <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      <span>
        Source: {source}
        {when && <> · <time dateTime={asOf}>{when}</time></>}
      </span>
      {delayed && (
        <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
          Delayed
        </span>
      )}
    </div>
  );
}
