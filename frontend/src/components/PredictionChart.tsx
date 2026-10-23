import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle } from 'lucide-react';
import { Prediction } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
import { DataSourceBadge } from './DataSourceBadge';
import { Disclaimer } from './Disclaimer';

interface PredictionChartProps {
  prediction: Prediction;
}

/**
 * Qualitative AI outlook. It deliberately shows no predicted price, percentage
 * or confidence figure: a language model cannot produce those from one price.
 */
export function PredictionChart({ prediction }: PredictionChartProps) {
  return (
    <Card className="w-full max-w-md mx-auto dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="text-base sm:text-lg font-semibold dark:text-white">AI Outlook · {prediction.symbol}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] sm:text-xs dark:bg-slate-700 dark:text-slate-200">
            {prediction.timeframe}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Current Price</span>
          <span className="font-semibold text-sm sm:text-base break-all dark:text-white">
            {formatPrice(prediction.currentPrice, prediction.currency)}
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Factors to watch</h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2.5 sm:p-3 rounded-lg leading-relaxed">
            {prediction.reasoning}
          </p>
        </div>

        {prediction.risks && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Main uncertainties
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2.5 sm:p-3 rounded-lg leading-relaxed">
              {prediction.risks}
            </p>
          </div>
        )}

        <div className="space-y-1.5 pt-2 border-t dark:border-slate-700">
          <DataSourceBadge source={prediction.source} asOf={prediction.asOf} />
          <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400">
            Written by a language model without access to news or financials. It describes general factors only: no price target, no forecast.
          </p>
          <Disclaimer />
        </div>
      </CardContent>
    </Card>
  );
}
