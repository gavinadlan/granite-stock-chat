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
  const changeColorDark = isPositive ? 'dark:text-green-400' : 'dark:text-red-400';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
  const bgColorDark = isPositive ? 'dark:bg-green-900/30' : 'dark:bg-red-900/30';

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="text-base sm:text-lg font-semibold dark:text-white">AI Prediction</span>
          </div>
          <Badge variant="secondary" className="text-[10px] sm:text-xs dark:bg-slate-700 dark:text-slate-200">
            {prediction.timeframe}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {/* Current vs Predicted Price */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Current Price</span>
            <span className="font-semibold text-sm sm:text-base break-all dark:text-white">${prediction.currentPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Predicted Price</span>
            <span className="font-semibold text-sm sm:text-base break-all dark:text-white">${prediction.predictedPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Change */}
        <div className={`flex items-center justify-center space-x-2 ${bgColor} ${bgColorDark} p-2.5 sm:p-3 rounded-lg`}>
          {changeIcon === TrendingUp ? (
            <TrendingUp className={`h-4 w-4 sm:h-5 sm:w-5 ${changeColor} ${changeColorDark} flex-shrink-0`} />
          ) : (
            <TrendingDown className={`h-4 w-4 sm:h-5 sm:w-5 ${changeColor} ${changeColorDark} flex-shrink-0`} />
          )}
          <span className={`font-bold text-base sm:text-lg ${changeColor} ${changeColorDark}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Confidence</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm dark:text-white">{(prediction.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(prediction.confidence * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">AI Analysis</h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2.5 sm:p-3 rounded-lg leading-relaxed">
            {prediction.reasoning}
          </p>
        </div>

        {/* Last Updated */}
        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-700">
          Last updated: {new Date(prediction.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}