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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold">Technical Analysis</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {technicalAnalysis.symbol}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">RSI (14)</span>
            <span className={`font-semibold ${getRSIColor(technicalAnalysis.rsi)}`}>
              {technicalAnalysis.rsi.toFixed(1)}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${technicalAnalysis.rsi}%` }}
            />
          </div>
        </div>

        {/* MACD */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">MACD</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-slate-600">MACD</p>
              <p className="font-semibold">{technicalAnalysis.macd.macd.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Signal</p>
              <p className="font-semibold">{technicalAnalysis.macd.signal.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Histogram</p>
              <p className="font-semibold">{technicalAnalysis.macd.histogram.toFixed(3)}</p>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Moving Averages</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-slate-600">SMA 20</p>
              <p className="font-semibold">${technicalAnalysis.movingAverages.sma20.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">SMA 50</p>
              <p className="font-semibold">${technicalAnalysis.movingAverages.sma50.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">SMA 200</p>
              <p className="font-semibold">${technicalAnalysis.movingAverages.sma200.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Support & Resistance */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Support & Resistance</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-slate-600">Support</p>
              <p className="font-semibold text-green-600">${technicalAnalysis.support.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Resistance</p>
              <p className="font-semibold text-red-600">${technicalAnalysis.resistance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-center space-x-2 p-3 bg-slate-50 rounded-lg">
          {getTrendIcon(technicalAnalysis.trend)}
          <span className={`font-semibold ${getTrendColor(technicalAnalysis.trend)}`}>
            {technicalAnalysis.trend.toUpperCase()}
          </span>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-slate-500 pt-2 border-t">
          Last updated: {new Date(technicalAnalysis.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}