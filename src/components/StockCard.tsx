import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockCardProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const StockCard: React.FC<StockCardProps> = ({ 
  symbol, 
  price, 
  change, 
  changePercent 
}) => {
  const isPositive = change >= 0;

  return (
    <Card className="p-4 shadow-card bg-gradient-chart mt-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{symbol}</h3>
          <p className="text-2xl font-bold text-foreground">${price.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <div className={`flex items-center space-x-1 ${isPositive ? 'text-financial-success' : 'text-financial-danger'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}{change.toFixed(2)}
            </span>
          </div>
          <div className={`text-sm ${isPositive ? 'text-financial-success' : 'text-financial-danger'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </Card>
  );
};