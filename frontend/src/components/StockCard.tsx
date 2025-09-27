import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { StockPrice } from '@/services/stockMarketAPI';

interface StockCardProps {
  stockPrice: StockPrice;
}

export function StockCard({ stockPrice }: StockCardProps) {
  const isPositive = stockPrice.change >= 0;
  const changeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{stockPrice.symbol}</span>
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Price */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-slate-600" />
          <span className="text-2xl font-bold text-slate-900">
            {stockPrice.currency === 'IDR' ? 'Rp' : stockPrice.currency === 'EUR' ? '€' : stockPrice.currency === 'GBP' ? '£' : stockPrice.currency === 'JPY' ? '¥' : '$'}{stockPrice.price.toFixed(2)}
          </span>
        </div>

        {/* Change */}
        <div className={`flex items-center space-x-2 ${bgColor} p-2 rounded-lg`}>
          {changeIcon === TrendingUp ? (
            <TrendingUp className={`h-4 w-4 ${changeColor}`} />
          ) : (
            <TrendingDown className={`h-4 w-4 ${changeColor}`} />
          )}
          <span className={`font-semibold ${changeColor}`}>
            {isPositive ? '+' : ''}{stockPrice.currency === 'IDR' ? 'Rp' : stockPrice.currency === 'EUR' ? '€' : stockPrice.currency === 'GBP' ? '£' : stockPrice.currency === 'JPY' ? '¥' : '$'}{stockPrice.change.toFixed(2)}
          </span>
          <span className={`text-sm ${changeColor}`}>
            ({isPositive ? '+' : ''}{stockPrice.changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-slate-600" />
            <div>
              <p className="text-slate-600">Volume</p>
              <p className="font-semibold">{stockPrice.volume.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-slate-600" />
            <div>
              <p className="text-slate-600">Market Cap</p>
              <p className="font-semibold">{stockPrice.marketCap}</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-slate-500 pt-2 border-t">
          Last updated: {new Date(stockPrice.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}