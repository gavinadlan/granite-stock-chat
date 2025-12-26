import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { StockPrice } from '@/services/stockMarketAPI';
import { formatPrice, formatChange } from '@/lib/currencyUtils';

interface StockCardProps {
  stockPrice: StockPrice;
}

export function StockCard({ stockPrice }: StockCardProps) {
  const isPositive = stockPrice.change >= 0;
  const changeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-semibold">{stockPrice.symbol}</span>
          <Badge variant="secondary" className="text-[10px] sm:text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
        {/* Price */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 flex-shrink-0" />
          <span className="text-xl sm:text-2xl font-bold text-slate-900 break-all">
            {formatPrice(stockPrice.price, stockPrice.currency)}
          </span>
        </div>

        {/* Change */}
        <div className={`flex items-center space-x-2 ${bgColor} p-2 sm:p-2.5 rounded-lg`}>
          {changeIcon === TrendingUp ? (
            <TrendingUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${changeColor} flex-shrink-0`} />
          ) : (
            <TrendingDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${changeColor} flex-shrink-0`} />
          )}
          <span className={`font-semibold text-sm sm:text-base ${changeColor} break-all`}>
            {formatChange(stockPrice.change, stockPrice.currency)}
          </span>
          <span className={`text-xs sm:text-sm ${changeColor} whitespace-nowrap`}>
            ({isPositive ? '+' : ''}{stockPrice.changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-start space-x-1.5 sm:space-x-2">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-slate-600 text-[10px] sm:text-xs">Volume</p>
              <p className="font-semibold text-xs sm:text-sm break-all">{stockPrice.volume.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start space-x-1.5 sm:space-x-2">
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-slate-600 text-[10px] sm:text-xs">Market Cap</p>
              <p className="font-semibold text-xs sm:text-sm break-all">{stockPrice.marketCap || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-[10px] sm:text-xs text-slate-500 pt-2 border-t">
          Last updated: {new Date(stockPrice.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}