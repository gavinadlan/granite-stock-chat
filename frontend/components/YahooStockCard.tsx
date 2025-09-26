import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Target } from 'lucide-react';

interface YahooStockCardProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  yield?: number;
}

export const YahooStockCard: React.FC<YahooStockCardProps> = ({ 
  symbol, 
  price, 
  change, 
  changePercent,
  volume,
  high,
  low,
  open,
  previousClose,
  marketCap,
  pe,
  eps,
  dividend,
  yield
}) => {
  const isPositive = change >= 0;

  const formatMarketCap = (cap?: number) => {
    if (!cap) return 'N/A';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toFixed(0)}`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toString();
  };

  return (
    <Card className="p-6 shadow-card bg-gradient-chart mt-3">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{symbol}</h3>
              <p className="text-sm text-muted-foreground">Yahoo Finance Data</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <BarChart3 className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Price</p>
            <p className="text-2xl font-bold text-foreground">${price.toFixed(2)}</p>
            <div className={`flex items-center justify-center space-x-1 mt-1 ${
              isPositive ? 'text-financial-success' : 'text-financial-danger'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Volume</p>
            <p className="text-lg font-semibold text-foreground">{formatVolume(volume)}</p>
            <p className="text-xs text-muted-foreground">Shares traded</p>
          </div>

          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Day Range</p>
            <p className="text-sm font-semibold text-foreground">
              ${low.toFixed(2)} - ${high.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Low - High</p>
          </div>

          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Previous Close</p>
            <p className="text-lg font-semibold text-foreground">${previousClose.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Yesterday's close</p>
          </div>
        </div>

        {/* Additional Metrics */}
        {(marketCap || pe || eps || dividend || yield) && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Additional Metrics</span>
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {marketCap && (
                <div className="p-3 bg-card rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-lg font-semibold text-foreground">{formatMarketCap(marketCap)}</p>
                </div>
              )}
              
              {pe && (
                <div className="p-3 bg-card rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-lg font-semibold text-foreground">{pe.toFixed(2)}</p>
                </div>
              )}
              
              {eps && (
                <div className="p-3 bg-card rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">EPS</p>
                  <p className="text-lg font-semibold text-foreground">${eps.toFixed(2)}</p>
                </div>
              )}
              
              {dividend && yield && (
                <div className="p-3 bg-card rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Dividend</p>
                  <p className="text-lg font-semibold text-foreground">${dividend.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">({(yield * 100).toFixed(2)}% yield)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="p-4 bg-card rounded-lg border-l-4 border-primary">
          <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Performance Summary</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Open</p>
              <p className="font-semibold">${open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Change</p>
              <p className={`font-semibold ${
                isPositive ? 'text-financial-success' : 'text-financial-danger'
              }`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
