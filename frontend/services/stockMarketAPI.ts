// API service layer for stock market data
import { ibmGraniteService, GranitePrediction, GraniteAnalysis } from './ibmGraniteService';
import { yahooFinanceService, YahooStockData } from './yahooFinanceService';
import { awsLambdaService, AWSStockPrice, AWSPrediction, AWSTechnicalAnalysis, AWSNewsItem } from './awsLambdaService';
export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface StockPrediction {
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

export interface NewsItem {
  title: string;
  source: string;
  time: string;
  url?: string;
  description?: string;
}

export interface TechnicalAnalysis {
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
  aiAnalysis?: GraniteAnalysis;
}

class StockMarketAPI {
  private alphaVantageApiKey: string;
  private newsApiKey: string;
  private replicateApiKey: string;
  private rapidApiKey: string;

  constructor() {
    this.alphaVantageApiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';
    this.newsApiKey = import.meta.env.VITE_NEWS_API_KEY || '';
    this.replicateApiKey = import.meta.env.VITE_REPLICATE_API_KEY || '';
    this.rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY || '';
  }

  // Get real-time stock price with AWS Lambda as primary source
  async getStockPrice(symbol: string): Promise<StockPrice> {
    try {
      // Try AWS Lambda first
      const isAWSAvailable = await awsLambdaService.isAvailable();
      if (isAWSAvailable) {
        try {
          const awsData = await awsLambdaService.getStockPrice(symbol);
          return this.convertAWSToStockPrice(awsData);
        } catch (error) {
          console.warn('AWS Lambda failed, trying fallback sources:', error);
        }
      }

      // Try Yahoo Finance via RapidAPI
      if (this.rapidApiKey) {
        try {
          const yahooData = await yahooFinanceService.getStockData(symbol);
          return this.convertYahooToStockPrice(yahooData);
        } catch (error) {
          console.warn('Yahoo Finance failed, trying Alpha Vantage:', error);
        }
      }

      // Try Alpha Vantage as fallback
      if (this.alphaVantageApiKey) {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageApiKey}`
        );
        
        const data = await response.json();
        
        if (data['Error Message']) {
          throw new Error(data['Error Message']);
        }

        const quote = data['Global Quote'];
        if (!quote || !quote['01. symbol']) {
          throw new Error('Invalid symbol or no data available');
        }

        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          open: parseFloat(quote['02. open']),
          previousClose: parseFloat(quote['08. previous close'])
        };
      }

      // Try direct Yahoo Finance scraping as last resort
      try {
        const yahooData = await yahooFinanceService.getStockDataDirect(symbol);
        return this.convertYahooToStockPrice(yahooData);
      } catch (error) {
        console.warn('Direct Yahoo Finance failed:', error);
      }

      // Fallback to mock data
      return this.getMockStockPrice(symbol);
    } catch (error) {
      console.error('Error fetching stock price:', error);
      // Fallback to mock data
      return this.getMockStockPrice(symbol);
    }
  }

  // Get stock prediction using IBM Granite AI
  async getStockPrediction(symbol: string, timeframe: string = '1 week'): Promise<StockPrediction> {
    try {
      // Get current stock price first
      const currentPrice = await this.getStockPrice(symbol);
      
      // Use IBM Granite for AI prediction
      const granitePrediction = await ibmGraniteService.generateStockPrediction(
        symbol, 
        currentPrice.price, 
        timeframe
      );

      return {
        symbol: granitePrediction.symbol,
        current: granitePrediction.currentPrice,
        predicted: granitePrediction.predictedPrice,
        confidence: granitePrediction.confidence,
        timeframe: granitePrediction.timeframe,
        change: granitePrediction.predictedPrice - granitePrediction.currentPrice,
        changePercent: ((granitePrediction.predictedPrice - granitePrediction.currentPrice) / granitePrediction.currentPrice) * 100,
        reasoning: granitePrediction.reasoning,
        riskLevel: granitePrediction.riskLevel,
        recommendation: granitePrediction.recommendation
      };
    } catch (error) {
      console.error('Error generating prediction:', error);
      throw error;
    }
  }

  // Get market news from News API
  async getMarketNews(query: string = 'stock market'): Promise<NewsItem[]> {
    try {
      if (!this.newsApiKey) {
        // Return mock news if no API key
        return this.getMockNews();
      }

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${this.newsApiKey}&pageSize=10&sortBy=publishedAt`
      );
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.message || 'Failed to fetch news');
      }

      return data.articles.map((article: any) => ({
        title: article.title,
        source: article.source.name,
        time: this.formatTimeAgo(new Date(article.publishedAt)),
        url: article.url,
        description: article.description
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to mock news
      return this.getMockNews();
    }
  }

  // Get technical analysis with AI insights
  async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis> {
    try {
      const stockPrice = await this.getStockPrice(symbol);
      
      // Generate mock technical analysis
      const sma20 = stockPrice.price * (0.98 + Math.random() * 0.04);
      const sma50 = stockPrice.price * (0.96 + Math.random() * 0.08);
      const sma200 = stockPrice.price * (0.90 + Math.random() * 0.20);
      
      const rsi = 30 + Math.random() * 40; // RSI between 30-70
      const macd = (Math.random() - 0.5) * 2;
      const signal = macd * (0.8 + Math.random() * 0.4);
      
      const support = stockPrice.price * (0.92 + Math.random() * 0.04);
      const resistance = stockPrice.price * (1.04 + Math.random() * 0.04);
      
      const trend = stockPrice.change > 0 ? 'bullish' : stockPrice.change < -0.02 ? 'bearish' : 'neutral';

      // Get AI analysis from IBM Granite
      let aiAnalysis: GraniteAnalysis | undefined;
      try {
        aiAnalysis = await ibmGraniteService.generateStockAnalysis(symbol, stockPrice.price);
      } catch (error) {
        console.warn('Failed to get AI analysis, using technical indicators only:', error);
      }

      return {
        symbol: symbol.toUpperCase(),
        movingAverages: {
          sma20: parseFloat(sma20.toFixed(2)),
          sma50: parseFloat(sma50.toFixed(2)),
          sma200: parseFloat(sma200.toFixed(2))
        },
        rsi: parseFloat(rsi.toFixed(2)),
        macd: {
          macd: parseFloat(macd.toFixed(4)),
          signal: parseFloat(signal.toFixed(4)),
          histogram: parseFloat((macd - signal).toFixed(4))
        },
        support: parseFloat(support.toFixed(2)),
        resistance: parseFloat(resistance.toFixed(2)),
        trend,
        aiAnalysis
      };
    } catch (error) {
      console.error('Error generating technical analysis:', error);
      throw error;
    }
  }

  // Convert AWS Lambda data to StockPrice format
  private convertAWSToStockPrice(awsData: AWSStockPrice): StockPrice {
    return {
      symbol: awsData.symbol,
      price: awsData.price,
      change: awsData.change,
      changePercent: awsData.changePercent,
      volume: awsData.volume,
      high: awsData.high,
      low: awsData.low,
      open: awsData.open,
      previousClose: awsData.previousClose
    };
  }

  // Convert Yahoo Finance data to StockPrice format
  private convertYahooToStockPrice(yahooData: YahooStockData): StockPrice {
    return {
      symbol: yahooData.symbol,
      price: yahooData.price,
      change: yahooData.change,
      changePercent: yahooData.changePercent,
      volume: yahooData.volume,
      high: yahooData.high,
      low: yahooData.low,
      open: yahooData.open,
      previousClose: yahooData.previousClose
    };
  }

  // Mock data methods
  private getMockStockPrice(symbol: string): StockPrice {
    const mockPrices: Record<string, StockPrice> = {
      AAPL: { symbol: 'AAPL', price: 189.75, change: 2.34, changePercent: 1.25, volume: 45000000, high: 191.20, low: 188.50, open: 189.10, previousClose: 187.41 },
      TSLA: { symbol: 'TSLA', price: 248.50, change: -3.12, changePercent: -1.24, volume: 32000000, high: 252.80, low: 247.20, open: 251.62, previousClose: 251.62 },
      MSFT: { symbol: 'MSFT', price: 378.85, change: 5.67, changePercent: 1.52, volume: 28000000, high: 380.20, low: 375.10, open: 376.50, previousClose: 373.18 },
      GOOGL: { symbol: 'GOOGL', price: 142.56, change: 1.89, changePercent: 1.34, volume: 22000000, high: 143.80, low: 141.20, open: 142.10, previousClose: 140.67 },
      AMZN: { symbol: 'AMZN', price: 155.20, change: -1.45, changePercent: -0.93, volume: 18000000, high: 157.80, low: 154.50, open: 156.65, previousClose: 156.65 },
      META: { symbol: 'META', price: 485.30, change: 8.92, changePercent: 1.87, volume: 15000000, high: 487.50, low: 480.20, open: 482.10, previousClose: 476.38 }
    };

    return mockPrices[symbol.toUpperCase()] || {
      symbol: symbol.toUpperCase(),
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 50000000),
      high: 100 + Math.random() * 200,
      low: 100 + Math.random() * 200,
      open: 100 + Math.random() * 200,
      previousClose: 100 + Math.random() * 200
    };
  }

  private getMockNews(): NewsItem[] {
    return [
      { title: "Apple Reports Strong Q4 Earnings Beat Expectations", source: "Bloomberg", time: "2h ago" },
      { title: "Tesla Announces New Gigafactory in Mexico", source: "Reuters", time: "4h ago" },
      { title: "Microsoft Azure Revenue Surges 30% in Latest Quarter", source: "CNBC", time: "6h ago" },
      { title: "Google's AI Investments Drive Stock Price Higher", source: "Wall Street Journal", time: "8h ago" },
      { title: "Amazon Web Services Sees Record Growth", source: "Financial Times", time: "10h ago" },
      { title: "Meta's Reality Labs Division Shows Promising Results", source: "TechCrunch", time: "12h ago" }
    ];
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }
}

export const stockMarketAPI = new StockMarketAPI();
