import { Badge } from '@/components/ui/badge';
import { Prediction } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
import { DataCard, DataCardFooter, DataRow } from './DataCard';
import { DataSourceBadge } from './DataSourceBadge';
import { Disclaimer } from './Disclaimer';

/**
 * Qualitative AI outlook. It deliberately shows no predicted price, percentage
 * or confidence figure: a language model cannot produce those from one price.
 */
export function PredictionCard({ prediction }: { prediction: Prediction }) {
  return (
    <DataCard label={`${prediction.symbol} AI explanation`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-semibold">{prediction.symbol}</h3>
          <p className="text-sm text-muted-foreground">Outlook · {prediction.timeframe}</p>
        </div>
        <Badge variant="outline">AI explanation</Badge>
      </header>

      <dl>
        <DataRow label="Current price (market data)">{formatPrice(prediction.currentPrice, prediction.currency)}</DataRow>
      </dl>

      <section className="space-y-1.5 border-t pt-3">
        <h4 className="font-medium">Factors to watch</h4>
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{prediction.reasoning}</p>
      </section>

      {prediction.risks && (
        <section className="space-y-1.5 border-t pt-3">
          <h4 className="font-medium">Main uncertainties</h4>
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{prediction.risks}</p>
        </section>
      )}

      <DataCardFooter>
        <p className="text-sm">
          Written by a language model without access to news or financials. It describes general factors only: no price target, no forecast.
        </p>
        <DataSourceBadge source={prediction.source} asOf={prediction.asOf} />
        <Disclaimer />
      </DataCardFooter>
    </DataCard>
  );
}
