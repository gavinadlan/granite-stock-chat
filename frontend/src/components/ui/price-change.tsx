import { formatChange, formatPercent } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';

interface PriceChangeProps {
  change: number | null;
  changePercent: number | null;
  currency: string;
  /** Index symbols (^JKSE) show the change in points. */
  symbol?: string;
  className?: string;
}

/** Price move with sign and direction color. Place on `background` or `card` only (AA contrast). */
export function PriceChange({ change, changePercent, currency, symbol, className }: PriceChangeProps) {
  const direction = change ?? changePercent ?? 0;
  const color = direction > 0 ? 'text-up' : direction < 0 ? 'text-down' : 'text-muted-foreground';
  const amount = change === null ? null : formatChange(change, currency, symbol);
  const percent = changePercent === null ? null : formatPercent(changePercent, currency);
  const text = amount && percent ? `${amount} (${percent})` : amount ?? percent ?? '—';

  return <span className={cn('tabular-nums', color, className)}>{text}</span>;
}
