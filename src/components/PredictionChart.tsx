import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface PredictionChartProps {
  current: number;
  predicted: number;
  confidence: number;
  timeframe: string;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  current,
  predicted,
  confidence,
  timeframe
}) => {
  const change = predicted - current;
  const changePercent = (change / current) * 100;
  const isPositive = change >= 0;

  return (
    <Card className="p-4 shadow-financial bg-gradient-chart mt-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>AI Prediction - {timeframe}</span>
          </h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {confidence}% Confidence
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-xl font-bold text-foreground">${current.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Predicted Price</p>
            <p className="text-xl font-bold text-foreground">${predicted.toFixed(2)}</p>
          </div>
        </div>

        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          isPositive ? 'bg-financial-success/10' : 'bg-financial-danger/10'
        }`}>
          {isPositive ? (
            <TrendingUp className={`h-5 w-5 text-financial-success`} />
          ) : (
            <TrendingDown className={`h-5 w-5 text-financial-danger`} />
          )}
          <div>
            <p className={`font-medium ${isPositive ? 'text-financial-success' : 'text-financial-danger'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </p>
            <p className="text-sm text-muted-foreground">
              Expected change over {timeframe}
            </p>
          </div>
        </div>

        {/* Simple visual bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current</span>
            <span>Predicted</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                isPositive ? 'bg-gradient-success' : 'bg-financial-danger'
              }`}
              style={{ width: `${Math.min(100, Math.abs(changePercent * 2) + 30)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};