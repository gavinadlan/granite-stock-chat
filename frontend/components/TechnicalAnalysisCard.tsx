import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, Brain, Lightbulb } from 'lucide-react';
import { TechnicalAnalysis } from '@/services/stockMarketAPI';

interface TechnicalAnalysisCardProps {
  analysis: TechnicalAnalysis;
}

export const TechnicalAnalysisCard: React.FC<TechnicalAnalysisCardProps> = ({ analysis }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-financial-success" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-financial-danger" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return 'bg-financial-success/10 text-financial-success border-financial-success/20';
      case 'bearish':
        return 'bg-financial-danger/10 text-financial-danger border-financial-danger/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-financial-danger';
    if (rsi < 30) return 'text-financial-success';
    return 'text-muted-foreground';
  };

  return (
    <Card className="p-6 shadow-card bg-gradient-chart mt-3">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Technical Analysis - {analysis.symbol}</span>
          </h3>
          <Badge className={`${getTrendColor(analysis.trend)} flex items-center space-x-1`}>
            {getTrendIcon(analysis.trend)}
            <span>{analysis.trend.toUpperCase()}</span>
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">RSI (14)</p>
            <p className={`text-2xl font-bold ${getRSIColor(analysis.rsi)}`}>
              {analysis.rsi}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.rsi > 70 ? 'Overbought' : analysis.rsi < 30 ? 'Oversold' : 'Neutral'}
            </p>
          </div>

          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">MACD</p>
            <p className="text-lg font-bold text-foreground">
              {analysis.macd.macd > 0 ? '+' : ''}{analysis.macd.macd.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Signal: {analysis.macd.signal.toFixed(4)}
            </p>
          </div>

          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Support</p>
            <p className="text-lg font-bold text-financial-success">
              ${analysis.support.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Key Support Level</p>
          </div>

          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Resistance</p>
            <p className="text-lg font-bold text-financial-danger">
              ${analysis.resistance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Key Resistance Level</p>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Moving Averages</span>
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-card rounded-lg text-center">
              <p className="text-sm text-muted-foreground">SMA 20</p>
              <p className="text-lg font-semibold text-foreground">
                ${analysis.movingAverages.sma20.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg text-center">
              <p className="text-sm text-muted-foreground">SMA 50</p>
              <p className="text-lg font-semibold text-foreground">
                ${analysis.movingAverages.sma50.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg text-center">
              <p className="text-sm text-muted-foreground">SMA 200</p>
              <p className="text-lg font-semibold text-foreground">
                ${analysis.movingAverages.sma200.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* MACD Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">MACD Analysis</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-2 bg-card rounded">
              <p className="text-muted-foreground">MACD Line</p>
              <p className="font-medium">{analysis.macd.macd.toFixed(4)}</p>
            </div>
            <div className="p-2 bg-card rounded">
              <p className="text-muted-foreground">Signal Line</p>
              <p className="font-medium">{analysis.macd.signal.toFixed(4)}</p>
            </div>
            <div className="p-2 bg-card rounded">
              <p className="text-muted-foreground">Histogram</p>
              <p className={`font-medium ${
                analysis.macd.histogram > 0 ? 'text-financial-success' : 'text-financial-danger'
              }`}>
                {analysis.macd.histogram > 0 ? '+' : ''}{analysis.macd.histogram.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        {analysis.aiAnalysis && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">AI Market Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 bg-card">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold">Market Sentiment</h4>
                </div>
                <Badge className={`${getTrendColor(analysis.aiAnalysis.sentiment)} mb-2`}>
                  {analysis.aiAnalysis.sentiment.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {analysis.aiAnalysis.marketOutlook}
                </p>
              </Card>

              <Card className="p-4 bg-card">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold">AI Recommendation</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.aiAnalysis.recommendation}
                </p>
              </Card>
            </div>

            <Card className="p-4 bg-card">
              <h4 className="font-semibold mb-3">Key Market Factors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.aiAnalysis.keyFactors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">{factor}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-card border-l-4 border-primary">
              <h4 className="font-semibold mb-2">Risk Assessment</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.aiAnalysis.riskAssessment}
              </p>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
};
