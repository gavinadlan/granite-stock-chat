import { Badge } from '@/components/ui/badge';
import { PriceChange } from '@/components/ui/price-change';
import { StockPrice } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
import { DataCard, DataCardFooter, DataRow } from './DataCard';
import { DataSourceBadge } from './DataSourceBadge';

/** Display names for Yahoo exchange codes; unknown codes are shown as they are. */
const EXCHANGE_NAMES: Record<string, string> = {
  NMS: 'NASDAQ',
  NGM: 'NASDAQ',
  NCM: 'NASDAQ',
  NYQ: 'NYSE',
  PCX: 'NYSE Arca',
  JKT: 'IDX',
};

export function StockCard({ stockPrice }: { stockPrice: StockPrice }) {
  const { symbol, name, exchange, currency, price, change, changePercent, volume, marketCap } = stockPrice;
  const subtitle = [name, exchange && (EXCHANGE_NAMES[exchange] ?? exchange), currency].filter(Boolean).join(' · ');

  return (
    <DataCard label={`${symbol} price`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-semibold">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="secondary">{stockPrice.delayed ? 'Delayed' : 'Live'}</Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="text-heading font-semibold tabular-nums [overflow-wrap:anywhere] sm:text-display">{formatPrice(price, currency)}</p>
          <PriceChange change={change} changePercent={changePercent} currency={currency} className="font-medium" />
        </div>
        {/* TODO(S1-06): sparkline goes in this second column once the history endpoint exists. */}
      </div>

      <dl className="space-y-1.5 border-t pt-3">
        <DataRow label="Volume">{volume === null ? '—' : volume.toLocaleString('en-US')}</DataRow>
        <DataRow label="Market cap">{marketCap ?? '—'}</DataRow>
      </dl>

      <DataCardFooter>
        <DataSourceBadge source={stockPrice.source} asOf={stockPrice.asOf} />
      </DataCardFooter>
    </DataCard>
  );
}
