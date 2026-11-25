import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceChange } from '@/components/ui/price-change';
import { StockPrice } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
import { DataSourceBadge } from './DataSourceBadge';

interface StockCardProps {
  stockPrice: StockPrice;
}

export function StockCard({ stockPrice }: StockCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-semibold">{stockPrice.symbol}</span>
          <Badge variant="secondary">{stockPrice.delayed ? 'Delayed' : 'Live'}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
        <p className="text-xl sm:text-2xl font-semibold tabular-nums break-all">
          {formatPrice(stockPrice.price, stockPrice.currency)}
        </p>
        <PriceChange
          change={stockPrice.change}
          changePercent={stockPrice.changePercent}
          currency={stockPrice.currency}
          className="block font-medium"
        />

        <dl className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Volume</dt>
            <dd className="font-medium tabular-nums break-all">{stockPrice.volume === null ? '—' : stockPrice.volume.toLocaleString()}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Market cap</dt>
            <dd className="font-medium tabular-nums break-all">{stockPrice.marketCap ?? '—'}</dd>
          </div>
        </dl>

        <DataSourceBadge
          source={stockPrice.source}
          asOf={stockPrice.asOf}
          delayed={stockPrice.delayed}
          className="pt-2 border-t"
        />
      </CardContent>
    </Card>
  );
}
