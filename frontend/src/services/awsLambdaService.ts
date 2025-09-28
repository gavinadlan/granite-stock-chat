// AWS Lambda Service
export interface AWSStockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | null;
  currency: string;
  lastUpdated: Date;
}

export interface AWSPrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  lastUpdated: Date;
}

export interface AWSTechnicalAnalysis {
  symbol: string;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  support: number;
  resistance: number;
  trend: string;
  lastUpdated: Date;
}

export interface AWSNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  source: string;
}

class AWSLambdaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env?.VITE_AWS_API_URL || 'https://qgh9r6vaol.execute-api.us-east-1.amazonaws.com';
  }

  async getStockPrice(symbol: string): Promise<AWSStockPrice | null> {
    try {
      console.log(`🔍 Trying AWS Lambda for symbol: ${symbol}`);
      console.log(`🌐 API URL: ${this.baseUrl}/dev/stock-price`);
      
      const response = await fetch(`${this.baseUrl}/dev/stock-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ AWS Lambda success for ${symbol}:`, data);
      
      return data;
    } catch (error) {
      console.error('❌ AWS Lambda stock price error:', error);
      return null;
    }
  }

  async getAIPrediction(symbol: string, timeframe: string = '1 week'): Promise<AWSPrediction | null> {
    try {
      console.log(`🔍 Trying AWS Lambda AI prediction for: ${symbol}`);
      console.log(`🌐 API URL: ${this.baseUrl}/dev/ai-prediction`);
      
      const response = await fetch(`${this.baseUrl}/dev/ai-prediction?symbol=${symbol}&timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ AWS Lambda AI prediction success for ${symbol}:`, data);
      
      // Convert backend response format to frontend format
      return {
        symbol: data.symbol,
        currentPrice: data.current,
        predictedPrice: data.predicted,
        confidence: data.confidence,
        timeframe: data.timeframe,
        reasoning: data.reasoning,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ AWS Lambda AI prediction error:', error);
      return null;
    }
  }

  async getTechnicalAnalysis(symbol: string): Promise<AWSTechnicalAnalysis | null> {
    try {
      const response = await fetch(`${this.baseUrl}/dev/technical-analysis?symbol=${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AWS Lambda technical analysis error:', error);
      return null;
    }
  }

  async getMarketNews(symbol: string): Promise<AWSNewsItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dev/market-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.news || [];
    } catch (error) {
      console.error('AWS Lambda market news error:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/dev/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const awsLambdaService = new AWSLambdaService();