// AWS Lambda service for frontend integration
export interface AWSStockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  yield?: number;
}

export interface AWSPrediction {
  symbol: string;
  current: number;
  predicted: number;
  confidence: number;
  timeframe: string;
  change: number;
  changePercent: number;
  reasoning?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  recommendation?: 'buy' | 'sell' | 'hold';
}

export interface AWSTechnicalAnalysis {
  symbol: string;
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  support: number;
  resistance: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  analysis: {
    summary: string;
    recommendation: string;
  };
}

export interface AWSNewsItem {
  title: string;
  source: string;
  time: string;
  url?: string;
  description?: string;
}

class AWSLambdaService {
  private baseUrl: string;

  constructor() {
    // Use environment variable for API Gateway URL, fallback to local development
    this.baseUrl = import.meta.env.VITE_AWS_API_URL || 'http://localhost:3000';
  }

  // Get stock price from AWS Lambda
  async getStockPrice(symbol: string): Promise<AWSStockPrice> {
    try {
      const response = await fetch(`${this.baseUrl}/stock-price?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock price from AWS:', error);
      throw error;
    }
  }

  // Get AI prediction from AWS Lambda
  async getAIPrediction(symbol: string, timeframe: string = '1 week'): Promise<AWSPrediction> {
    try {
      const response = await fetch(`${this.baseUrl}/ai-prediction?symbol=${symbol}&timeframe=${encodeURIComponent(timeframe)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI prediction from AWS:', error);
      throw error;
    }
  }

  // Get technical analysis from AWS Lambda
  async getTechnicalAnalysis(symbol: string): Promise<AWSTechnicalAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/technical-analysis?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching technical analysis from AWS:', error);
      throw error;
    }
  }

  // Get market news from AWS Lambda
  async getMarketNews(query: string = 'stock market', symbol?: string): Promise<AWSNewsItem[]> {
    try {
      const params = new URLSearchParams({ query });
      if (symbol) {
        params.append('symbol', symbol);
      }
      
      const response = await fetch(`${this.baseUrl}/market-news?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market news from AWS:', error);
      throw error;
    }
  }

  // Check if AWS Lambda service is available
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/stock-price?symbol=AAPL`, {
        method: 'HEAD'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const awsLambdaService = new AWSLambdaService();
