import { AlertTriangle, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TechnicalAnalysis, TechnicalSignal } from '@/services/stockMarketAPI';
import { formatNumber, formatPrice, priceDecimals } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';
import { DataCard, DataCardFooter, DataRow } from './DataCard';
import { DataSourceBadge } from './DataSourceBadge';
import { Disclaimer } from './Disclaimer';
import { RsiMeter } from './RsiMeter';

const DASH = '—';

const SIGNAL_ICON: Record<TechnicalSignal['severity'], typeof Info> = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  info: Info,
};

const TREND_ICON: Record<string, typeof Info> = { bullish: TrendingUp, bearish: TrendingDown };

interface TechnicalAnalysisCardProps {
  technicalAnalysis: TechnicalAnalysis;
  /** `compact`: landing answer panel; one indicator grid, source shown by the panel. */
  variant?: 'chat' | 'compact';
  className?: string;
}

function CompactTechnicals({ ta, currency, className }: { ta: TechnicalAnalysis; currency: string; className?: string }) {
  const n = (v: number | null, decimals: number) => formatNumber(v, currency, decimals);
  const level = (v: number | null) => n(v, priceDecimals(currency, ta.symbol));
  const range =
    ta.support === null || ta.resistance === null ? DASH : `${level(ta.support)} to ${level(ta.resistance)}`;
  const rows: [string, string][] = [
    ['MACD', n(ta.macd.macd, 2)],
    ['Signal', n(ta.macd.signal, 2)],
    ['SMA 20', level(ta.movingAverages.sma20)],
    ['SMA 50', level(ta.movingAverages.sma50)],
    ['SMA 200', level(ta.movingAverages.sma200)],
    ['20-day range', range],
  ];
  return (
    <DataCard label={`${ta.symbol} indicators`} className={cn('max-w-none', className)}>
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-[17px] font-semibold">Indicators</h3>
        <Badge variant="secondary">Trend: {ta.trend}</Badge>
      </header>
      <RsiMeter rsi={ta.rsi} currency={currency} compact />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t pt-3.5 text-sm tabular-nums sm:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="[overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      {ta.warnings?.length > 0 && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {ta.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </DataCard>
  );
}

export function TechnicalAnalysisCard({ technicalAnalysis: ta, variant = 'chat', className }: TechnicalAnalysisCardProps) {
  const currency = ta.currency || 'USD';
  if (variant === 'compact') return <CompactTechnicals ta={ta} currency={currency} className={className} />;
  const money = (v: number | null) => (v === null ? DASH : formatPrice(v, currency, ta.symbol));
  const num = (v: number | null) => formatNumber(v, currency, 2);
  const TrendIcon = TREND_ICON[ta.trend] ?? Minus;

  return (
    <DataCard label={`${ta.symbol} technical analysis`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-semibold">{ta.symbol}</h3>
          <p className="text-sm text-muted-foreground">Technical analysis{ta.currency && ` · ${ta.currency}`}</p>
        </div>
        <Badge variant="secondary" className="gap-1 capitalize">
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {ta.trend}
        </Badge>
      </header>

      <RsiMeter rsi={ta.rsi} currency={currency} />

      <section className="space-y-1.5 border-t pt-3">
        <h4 className="font-medium">MACD (12, 26, 9)</h4>
        <dl className="space-y-1.5">
          <DataRow label="MACD">{num(ta.macd.macd)}</DataRow>
          <DataRow label="Signal">{num(ta.macd.signal)}</DataRow>
          <DataRow label="Histogram">{num(ta.macd.histogram)}</DataRow>
        </dl>
      </section>

      <section className="space-y-1.5 border-t pt-3">
        <h4 className="font-medium">Moving averages</h4>
        <dl className="space-y-1.5">
          <DataRow label="SMA 20">{money(ta.movingAverages.sma20)}</DataRow>
          <DataRow label="SMA 50">{money(ta.movingAverages.sma50)}</DataRow>
          <DataRow label="SMA 200">{money(ta.movingAverages.sma200)}</DataRow>
        </dl>
      </section>

      <section className="space-y-1.5 border-t pt-3">
        <h4 className="font-medium">20-session range</h4>
        <dl className="space-y-1.5">
          <DataRow label="Support (low)">{money(ta.support)}</DataRow>
          <DataRow label="Resistance (high)">{money(ta.resistance)}</DataRow>
        </dl>
      </section>

      {ta.signals?.length > 0 && (
        <section className="space-y-1.5 border-t pt-3">
          <h4 className="font-medium">Signals</h4>
          <ul className="space-y-1.5">
            {ta.signals.map((s) => {
              const Icon = SIGNAL_ICON[s.severity] ?? Info;
              return (
                <li key={s.id} className="flex items-start gap-2">
                  <Icon className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                  {s.label}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {ta.warnings?.length > 0 && (
        <ul className="space-y-1 border-t pt-3 text-sm">
          {ta.warnings.map((w) => (
            <li key={w} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {w}
            </li>
          ))}
        </ul>
      )}

      <DataCardFooter>
        {ta.method && <p className="text-sm text-muted-foreground">Method: {ta.method}</p>}
        {/* Indicators come from daily candles; the badge says so, so drop the backend's own "(daily candles)" suffix. */}
        <DataSourceBadge source={ta.source.replace(/\s*\(daily candles\)$/, '')} asOf={ta.asOf} candles="daily" stale={ta.stale} />
        <Disclaimer />
      </DataCardFooter>
    </DataCard>
  );
}
