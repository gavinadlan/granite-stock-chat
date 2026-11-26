import { formatNumber } from '@/lib/currencyUtils';
import { RSI_OVERBOUGHT, RSI_OVERSOLD, rsiPosition, rsiZone } from '@/lib/rsi';
import { cn } from '@/lib/utils';

const ZONE_LABEL = { oversold: 'Oversold', neutral: 'Neutral', overbought: 'Overbought' } as const;

interface RsiMeterProps {
  rsi: number | null;
  /** Number locale follows the stock's currency (IDR: "61,98"). */
  currency?: string;
  /** Landing panel: two decimals, no zone word, thin ink marker. */
  compact?: boolean;
}

/** RSI on a 0–100 scale with the 30/70 zones marked. Neutral colors: RSI is not a price direction. */
export function RsiMeter({ rsi, currency = 'USD', compact = false }: RsiMeterProps) {
  if (rsi === null) {
    return (
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground">RSI (14)</span>
        <span className="font-medium">—</span>
      </div>
    );
  }

  const zone = ZONE_LABEL[rsiZone(rsi)];
  const value = formatNumber(rsi, currency, compact ? 2 : 1);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground">RSI (14)</span>
        <span className={cn('tabular-nums', compact ? 'font-semibold' : 'font-medium')}>
          {value}
          {!compact && ` · ${zone}`}
        </span>
      </div>
      <div
        role="meter"
        aria-label="RSI (14)"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rsiPosition(rsi)}
        aria-valuetext={`${value}, ${zone.toLowerCase()}`}
        className="relative mt-3 h-2"
      >
        <div className="flex h-full gap-0.5" aria-hidden="true">
          <div className="rounded-l-sm bg-input/40" style={{ width: `${RSI_OVERSOLD}%` }} />
          <div className="bg-muted" style={{ width: `${RSI_OVERBOUGHT - RSI_OVERSOLD}%` }} />
          <div className="flex-1 rounded-r-sm bg-input/40" />
        </div>
        <div
          aria-hidden="true"
          className={cn(
            'absolute -top-1 h-4 -translate-x-1/2 rounded-sm',
            compact ? 'w-1 bg-foreground' : 'w-2 border border-foreground bg-primary',
          )}
          style={{ left: `${rsiPosition(rsi)}%` }}
        />
      </div>
      <div className="relative mt-2 h-5 text-sm tabular-nums text-muted-foreground" aria-hidden="true">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${RSI_OVERSOLD}%` }}>{RSI_OVERSOLD}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${RSI_OVERBOUGHT}%` }}>{RSI_OVERBOUGHT}</span>
        <span className="absolute right-0">100</span>
      </div>
    </div>
  );
}
