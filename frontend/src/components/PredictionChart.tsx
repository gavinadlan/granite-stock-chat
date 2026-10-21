import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, Target } from 'lucide-react';
import { Prediction } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
import { DataSourceBadge } from './DataSourceBadge';
import { Disclaimer } from './Disclaimer';

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
            <span className="text-base sm:text-lg font-semibold dark:text-white">AI Outlook</span>
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
            <span className="font-semibold text-sm sm:text-base break-all dark:text-white">{formatPrice(prediction.currentPrice, prediction.currency)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Predicted Price</span>
            <span className="font-semibold text-sm sm:text-base break-all dark:text-white">{formatPrice(prediction.predictedPrice, prediction.currency)}</span>
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

        {/* Confidence (as reported by the model, not a statistical guarantee) */}
        {prediction.confidence !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Model-stated confidence</span>
              </div>
              <span className="font-semibold text-xs sm:text-sm dark:text-white">{prediction.confidence.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(prediction.confidence, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">AI Analysis</h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2.5 sm:p-3 rounded-lg leading-relaxed">
            {prediction.reasoning ?? 'The model did not provide an explanation.'}
          </p>
        </div>

        {/* Last Updated */}
        <div className="space-y-1.5 pt-2 border-t dark:border-slate-700">
          <DataSourceBadge source={prediction.source} asOf={prediction.asOf} />
          <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400">
            Generated by a language model from the current price only. It is a scenario, not a forecast you can rely on.
          </p>
          <Disclaimer />
        </div>
      </CardContent>
    </Card>
  );
}