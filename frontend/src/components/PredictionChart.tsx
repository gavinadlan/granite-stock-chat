import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, Target } from 'lucide-react';
import { Prediction } from '@/services/stockMarketAPI';

interface PredictionChartProps {
  prediction: Prediction;
}

export function PredictionChart({ prediction }: PredictionChartProps) {
  const isPositive = prediction.predictedPrice >= prediction.currentPrice;
  const changePercent = ((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice) * 100;
  const changeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-semibold">AI Prediction</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {prediction.timeframe}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current vs Predicted Price */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Current Price</span>
            <span className="font-semibold">${prediction.currentPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Predicted Price</span>
            <span className="font-semibold">${prediction.predictedPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Change */}
        <div className={`flex items-center justify-center space-x-2 ${bgColor} p-3 rounded-lg`}>
          {changeIcon === TrendingUp ? (
            <TrendingUp className={`h-5 w-5 ${changeColor}`} />
          ) : (
            <TrendingDown className={`h-5 w-5 ${changeColor}`} />
          )}
          <span className={`font-bold text-lg ${changeColor}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-600">Confidence</span>
            </div>
            <span className="font-semibold text-sm">{(prediction.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(prediction.confidence * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">AI Analysis</h4>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            {prediction.reasoning}
          </p>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-slate-500 pt-2 border-t">
          Last updated: {new Date(prediction.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}