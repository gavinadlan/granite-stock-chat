import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TechnicalAnalysis } from '@/services/stockMarketAPI';

interface TechnicalAnalysisCardProps {
  technicalAnalysis: TechnicalAnalysis;
}

export function TechnicalAnalysisCard({ technicalAnalysis }: TechnicalAnalysisCardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'bullish':
        return 'text-green-600';
      case 'bearish':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-600';
    if (rsi < 30) return 'text-green-600';
    return 'text-slate-600';
  };

  const getRSIColorDark = (rsi: number) => {
    if (rsi > 70) return 'text-red-400';
    if (rsi < 30) return 'text-green-400';
    return 'text-slate-300';
  };

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-base sm:text-lg font-semibold dark:text-white">Technical Analysis</span>
          </div>
          <Badge variant="secondary" className="text-[10px] sm:text-xs dark:bg-slate-700 dark:text-slate-200">
            {technicalAnalysis.symbol}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">RSI (14)</span>
            <span className={`font-semibold text-xs sm:text-sm ${getRSIColor(technicalAnalysis.rsi)} dark:${getRSIColorDark(technicalAnalysis.rsi)}`}>
              {technicalAnalysis.rsi.toFixed(1)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${technicalAnalysis.rsi}%` }}
            />
          </div>
        </div>

        {/* MACD */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">MACD</h4>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">MACD</p>
              <p className="font-semibold text-xs sm:text-sm break-all dark:text-white">{technicalAnalysis.macd.macd.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">Signal</p>
              <p className="font-semibold text-xs sm:text-sm break-all dark:text-white">{technicalAnalysis.macd.signal.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">Histogram</p>
              <p className="font-semibold text-xs sm:text-sm break-all dark:text-white">{technicalAnalysis.macd.histogram.toFixed(3)}</p>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Moving Averages</h4>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">SMA 20</p>
              <p className="font-semibold text-xs sm:text-sm break-all dark:text-white">${technicalAnalysis.movingAverages.sma20.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">SMA 50</p>
              <p className="font-semibold text-xs sm:text-sm break-all dark:text-white">${technicalAnalysis.movingAverages.sma50.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">SMA 200</p>
              <p className="font-semibold text-xs sm:text-sm break-all dark:text-white">${technicalAnalysis.movingAverages.sma200.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Support & Resistance */}
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">Support & Resistance</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">Support</p>
              <p className="font-semibold text-green-600 dark:text-green-400 text-xs sm:text-sm break-all">${technicalAnalysis.support.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">Resistance</p>
              <p className="font-semibold text-red-600 dark:text-red-400 text-xs sm:text-sm break-all">${technicalAnalysis.resistance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-center space-x-2 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          {getTrendIcon(technicalAnalysis.trend)}
          <span className={`font-semibold text-xs sm:text-sm ${getTrendColor(technicalAnalysis.trend)} ${
            technicalAnalysis.trend.toLowerCase() === 'bullish' ? 'dark:text-green-400' : 
            technicalAnalysis.trend.toLowerCase() === 'bearish' ? 'dark:text-red-400' : 
            'dark:text-slate-300'
          }`}>
            {technicalAnalysis.trend.toUpperCase()}
          </span>
        </div>

        {/* Last Updated */}
        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-700">
          Last updated: {new Date(technicalAnalysis.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}