import { AlertTriangle, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TechnicalAnalysis, TechnicalSignal } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
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

export function TechnicalAnalysisCard({ technicalAnalysis: ta }: { technicalAnalysis: TechnicalAnalysis }) {
  const currency = ta.currency || 'USD';
  const money = (v: number | null) => (v === null ? DASH : formatPrice(v, currency));
  const num = (v: number | null) => (v === null ? DASH : v.toFixed(3));
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

      <RsiMeter rsi={ta.rsi} />

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
        <DataSourceBadge source={ta.source} asOf={ta.asOf} />
        <Disclaimer />
      </DataCardFooter>
    </DataCard>
  );
}
