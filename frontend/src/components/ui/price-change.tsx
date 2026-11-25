import { formatPrice } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';

interface PriceChangeProps {
  change: number | null;
  changePercent: number | null;
  currency: string;
  className?: string;
}

const MINUS = '\u2212';

function signed(value: number, format: (abs: number) => string) {
  const sign = value > 0 ? '+' : value < 0 ? MINUS : '';
  return `${sign}${format(Math.abs(value))}`;
}

/** Price move with sign and direction color. Place on `background` or `card` only (AA contrast). */
export function PriceChange({ change, changePercent, currency, className }: PriceChangeProps) {
  const direction = change ?? changePercent ?? 0;
  const color = direction > 0 ? 'text-up' : direction < 0 ? 'text-down' : 'text-muted-foreground';
  const amount = change === null ? null : signed(change, (v) => formatPrice(v, currency));
  const percent = changePercent === null ? null : signed(changePercent, (v) => `${v.toFixed(2)}%`);
  const text = amount && percent ? `${amount} (${percent})` : amount ?? percent ?? '—';

  return <span className={cn('tabular-nums', color, className)}>{text}</span>;
}
