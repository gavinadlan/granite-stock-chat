import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TechnicalAnalysis } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
import { DataSourceBadge } from './DataSourceBadge';
import { Disclaimer } from './Disclaimer';

interface TechnicalAnalysisCardProps {
  technicalAnalysis: TechnicalAnalysis;
}

const DASH = '—';

function trendStyle(trend: string) {
  switch (trend.toLowerCase()) {
    case 'bullish':
      return { Icon: TrendingUp, cls: 'text-up' };
    case 'bearish':
      return { Icon: TrendingDown, cls: 'text-down' };
    default:
      return { Icon: Minus, cls: 'text-muted-foreground' };
  }
}

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="text-center">
      <p className="text-muted-foreground text-[10px] sm:text-xs">{label}</p>
      <p className={`font-semibold text-xs sm:text-sm break-all ${className}`}>{value}</p>
    </div>
  );
}

export function TechnicalAnalysisCard({ technicalAnalysis: ta }: TechnicalAnalysisCardProps) {
  const currency = ta.currency || 'USD';
  const money = (v: number | null) => (v === null ? DASH : formatPrice(v, currency));
  const num = (v: number | null, digits = 3) => (v === null ? DASH : v.toFixed(digits));
  const { Icon, cls } = trendStyle(ta.trend);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-base sm:text-lg font-semibold">Technical Analysis</span>
          </div>
          <Badge variant="secondary" className="text-[10px] sm:text-xs">
            {ta.symbol}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">RSI (14)</span>
            <span className={`font-semibold text-xs sm:text-sm`}>{num(ta.rsi, 1)}</span>
          </div>
          {ta.rsi !== null && (
            <div className="w-full bg-muted rounded-full h-2" aria-hidden="true">
              <div
                className="bg-foreground h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(ta.rsi, 100))}%` }}
              />
            </div>
          )}
        </div>

        {/* MACD */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground">MACD (12, 26, 9)</h4>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Stat label="MACD" value={num(ta.macd.macd)} />
            <Stat label="Signal" value={num(ta.macd.signal)} />
            <Stat label="Histogram" value={num(ta.macd.histogram)} />
          </div>
        </div>

        {/* Moving Averages */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground">Moving Averages</h4>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Stat label="SMA 20" value={money(ta.movingAverages.sma20)} />
            <Stat label="SMA 50" value={money(ta.movingAverages.sma50)} />
            <Stat label="SMA 200" value={money(ta.movingAverages.sma200)} />
          </div>
        </div>

        {/* Support & Resistance (20-session range) */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground">20-session range</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <Stat label="Support (low)" value={money(ta.support)} />
            <Stat label="Resistance (high)" value={money(ta.resistance)} />
          </div>
        </div>

        {/* Signals */}
        {ta.signals?.length > 0 && (
          <ul className="space-y-1.5">
            {ta.signals.map((s) => (
              <li key={s.id} className={`text-xs sm:text-sm rounded-md px-2.5 py-1.5 bg-muted text-foreground`}>
                {s.label}
              </li>
            ))}
          </ul>
        )}

        {/* Trend */}
        <div className="flex items-center justify-center space-x-2 p-2.5 sm:p-3 bg-muted rounded-lg">
          <Icon className={`h-4 w-4 ${cls}`} />
          <span className={`font-semibold text-xs sm:text-sm ${cls}`}>{ta.trend.toUpperCase()}</span>
        </div>

        {ta.warnings?.length > 0 && (
          <p className="text-[10px] sm:text-xs text-foreground">{ta.warnings.join(' · ')}</p>
        )}

        <div className="space-y-1.5 pt-2 border-t">
          <DataSourceBadge source={ta.source} asOf={ta.asOf} />
          <Disclaimer />
        </div>
      </CardContent>
    </Card>
  );
}
