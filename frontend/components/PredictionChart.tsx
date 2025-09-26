import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Brain, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredictionChartProps {
  current: number;
  predicted: number;
  confidence: number;
  timeframe: string;
  reasoning?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  recommendation?: 'buy' | 'sell' | 'hold';
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  current,
  predicted,
  confidence,
  timeframe,
  reasoning,
  riskLevel,
  recommendation
}) => {
  const change = predicted - current;
  const changePercent = (change / current) * 100;
  const isPositive = change >= 0;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-financial-success/10 text-financial-success border-financial-success/20';
      case 'high': return 'bg-financial-danger/10 text-financial-danger border-financial-danger/20';
      default: return 'bg-financial-warning/10 text-financial-warning border-financial-warning/20';
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy': return 'bg-financial-success/10 text-financial-success border-financial-success/20';
      case 'sell': return 'bg-financial-danger/10 text-financial-danger border-financial-danger/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'buy': return <CheckCircle className="h-4 w-4" />;
      case 'sell': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-4 shadow-financial bg-gradient-chart mt-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Prediction - {timeframe}</span>
          </h3>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {confidence}% Confidence
            </Badge>
            {riskLevel && (
              <Badge className={`${getRiskColor(riskLevel)} flex items-center space-x-1`}>
                <AlertTriangle className="h-3 w-3" />
                <span>{riskLevel.toUpperCase()}</span>
              </Badge>
            )}
          </div>
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

        {/* AI Recommendation */}
        {recommendation && (
          <div className={`p-4 rounded-lg border ${getRecommendationColor(recommendation)}`}>
            <div className="flex items-center space-x-2 mb-2">
              {getRecommendationIcon(recommendation)}
              <h4 className="font-semibold">AI Recommendation</h4>
            </div>
            <p className="text-sm">
              <span className="font-medium">{recommendation.toUpperCase()}</span> - 
              Based on AI analysis of market conditions and technical indicators
            </p>
          </div>
        )}

        {/* AI Reasoning */}
        {reasoning && (
          <div className="p-4 bg-card rounded-lg border">
            <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Analysis</span>
            </h4>
            <p className="text-sm text-muted-foreground">{reasoning}</p>
          </div>
        )}
      </div>
    </Card>
  );
};