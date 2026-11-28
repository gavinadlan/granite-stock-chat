import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { PriceChange } from '@/components/ui/price-change';
import { StockPrice } from '@/services/stockMarketAPI';
import { formatPrice, formatVolume } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';
import { DataCard, DataCardFooter, DataRow } from './DataCard';
import { DataSourceBadge } from './DataSourceBadge';
import { Sparkline } from './Sparkline';

/** Display names for Yahoo exchange codes; unknown codes are shown as they are. */
const EXCHANGE_NAMES: Record<string, string> = {
  NMS: 'NASDAQ',
  NGM: 'NASDAQ',
  NCM: 'NASDAQ',
  NYQ: 'NYSE',
  PCX: 'NYSE Arca',
  JKT: 'IDX',
};

interface StockCardProps {
  stockPrice: StockPrice;
  /**
   * `chat`: links to the detail page and shows a 1M sparkline. `detail`: same card on /stock/:symbol, without both.
   * `compact`: landing answer panel; volume and previous close, source shown by the panel.
   */
  variant?: 'chat' | 'detail' | 'compact';
  className?: string;
}

export function StockCard({ stockPrice, variant = 'chat', className }: StockCardProps) {
  const { symbol, name, exchange, currency, price, change, changePercent, volume, marketCap, previousClose } = stockPrice;
  const parts = [name, exchange && (EXCHANGE_NAMES[exchange] ?? exchange), currency].filter(Boolean);

  if (variant === 'compact') {
    return (
      <DataCard label={`${symbol} price`} className={cn('max-w-none', className)}>
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold">{symbol}</h3>
            <p className="text-sm text-muted-foreground">{parts.join(', ')}</p>
          </div>
          <Badge variant="secondary">{stockPrice.delayed ? 'Delayed' : 'Live'}</Badge>
        </header>
        <div className="space-y-2">
          <p className="font-display text-section font-bold leading-none tabular-nums [overflow-wrap:anywhere]">{formatPrice(price, currency, symbol)}</p>
          <PriceChange change={change} changePercent={changePercent} currency={currency} symbol={symbol} className="text-[15px] font-semibold" />
        </div>
        <dl className="space-y-1.5 border-t pt-3 text-sm">
          <DataRow label="Volume">{formatVolume(volume, currency)}</DataRow>
          {previousClose != null && <DataRow label="Previous close">{formatPrice(previousClose, currency, symbol)}</DataRow>}
        </dl>
      </DataCard>
    );
  }

  const subtitle = parts.join(' · ');

  return (
    <DataCard label={`${symbol} price`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-semibold">
            {variant === 'chat' ? (
              <Link
                to={`/stock/${encodeURIComponent(symbol)}`}
                aria-label={`${symbol}, open chart`}
                className="rounded-control underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {symbol}
              </Link>
            ) : (
              symbol
            )}
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="secondary">{stockPrice.delayed ? 'Delayed' : 'Live'}</Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="text-heading font-semibold tabular-nums [overflow-wrap:anywhere] sm:text-display">{formatPrice(price, currency, symbol)}</p>
          <PriceChange change={change} changePercent={changePercent} currency={currency} symbol={symbol} className="font-medium" />
        </div>
        {variant === 'chat' && <Sparkline symbol={symbol} />}
      </div>

      <dl className="space-y-1.5 border-t pt-3">
        <DataRow label="Volume">{formatVolume(volume, currency)}</DataRow>
        <DataRow label="Market cap">{marketCap ?? '—'}</DataRow>
      </dl>

      <DataCardFooter>
        <DataSourceBadge source={stockPrice.source} asOf={stockPrice.asOf} />
      </DataCardFooter>
    </DataCard>
  );
}
