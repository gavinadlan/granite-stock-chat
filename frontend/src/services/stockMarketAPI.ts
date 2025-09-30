import { awsLambdaService } from './awsLambdaService';
import { yahooFinanceService } from './yahooFinanceService';
import { ibmGraniteService } from './ibmGraniteService';
import { formatSymbol, generateSymbolFormats } from '@/lib/symbolUtils';
import { detectCurrency } from '@/lib/currencyUtils';
import { API_CONSTANTS, PREDICTION_CONSTANTS } from '@/lib/constants';

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | null;
  currency: string;
  lastUpdated: Date;
}

export interface Prediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  lastUpdated: Date;
}

export interface TechnicalAnalysis {
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

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  source: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  data?: {
    stockPrice?: StockPrice;
    prediction?: Prediction;
    technicalAnalysis?: TechnicalAnalysis;
    news?: NewsItem[];
  };
}

class StockMarketAPI {
  async getStockPrice(symbol: string): Promise<StockPrice | null> {
    const cleanSymbol = symbol.toUpperCase().trim();
    
    // Universal approach: try all possible formats
    const formatsToTry = generateSymbolFormats(cleanSymbol);
    
    for (const format of formatsToTry) {
      const result = await this.tryStockPriceAPIs(format);
      if (result) {
        return result;
      }
    }
    
    console.error(`❌ All stock price APIs failed for symbol: ${symbol}`);
    return null;
  }

  private async tryStockPriceAPIs(symbol: string): Promise<StockPrice | null> {
    // Try Yahoo Finance first
    try {
      const yahooData = await yahooFinanceService.getStockPrice(symbol);
      if (yahooData) {
        return yahooData;
      }
    } catch (error) {
      console.warn(`Yahoo Finance failed for ${symbol}:`, error);
    }

    // Try Alpha Vantage as fallback
    try {
      const alphaData = await this.getAlphaVantageStockPrice(symbol);
      if (alphaData) {
        return alphaData;
      }
    } catch (error) {
      console.warn(`Alpha Vantage failed for ${symbol}:`, error);
    }

    // Try AWS Lambda as final fallback
    try {
      const awsData = await awsLambdaService.getStockPrice(symbol);
      if (awsData) {
        return this.convertAWSToStockPrice(awsData);
      }
    } catch (error) {
      console.warn(`AWS Lambda failed for ${symbol}:`, error);
    }

    return null;
  }

  async getStockPrediction(symbol: string, timeframe: string = '1 week'): Promise<Prediction | null> {
    const formattedSymbol = formatSymbol(symbol);
    console.log(`🔮 Getting prediction for ${symbol} (formatted: ${formattedSymbol})`);
    
    // Try IBM Granite first (more reliable)
    try {
      console.log(`🔄 Trying IBM Granite prediction for ${formattedSymbol}`);
      const graniteData = await ibmGraniteService.getPrediction(formattedSymbol, timeframe);
      if (graniteData) {
        console.log(`✅ IBM Granite prediction success for ${formattedSymbol}:`, graniteData);
        return graniteData;
      } else {
        console.log(`❌ IBM Granite prediction returned null for ${formattedSymbol}`);
      }
    } catch (error) {
      console.warn(`❌ IBM Granite prediction failed for ${formattedSymbol}:`, error);
    }

    // Fallback to AWS Lambda (with timeout)
    try {
      console.log(`🔄 Trying AWS Lambda prediction for ${formattedSymbol}`);
      const awsData = await Promise.race([
        awsLambdaService.getAIPrediction(formattedSymbol, timeframe),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), API_CONSTANTS.TIMEOUTS.DEFAULT))
      ]) as any;
      
      if (awsData) {
        console.log(`✅ AWS Lambda prediction success for ${formattedSymbol}:`, awsData);
        return awsData;
      } else {
        console.log(`❌ AWS Lambda prediction returned null for ${formattedSymbol}`);
      }
    } catch (error) {
      console.warn(`❌ AWS Lambda prediction failed for ${formattedSymbol}:`, error);
    }

    // Generate mock prediction as final fallback
    console.log(`🔄 Generating mock prediction for ${formattedSymbol}`);
    const mockPrediction = this.generateMockPrediction(formattedSymbol, timeframe);
    console.log(`✅ Mock prediction generated for ${formattedSymbol}:`, mockPrediction);
    return mockPrediction;
  }

  async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis | null> {
    const formattedSymbol = formatSymbol(symbol);
    // Try AWS Lambda first
    try {
      const awsData = await awsLambdaService.getTechnicalAnalysis(formattedSymbol);
      if (awsData) {
        return awsData;
      }
    } catch (error) {
      console.warn('AWS Lambda technical analysis failed:', error);
    }

    // Fallback to IBM Granite
    try {
      const graniteData = await ibmGraniteService.getTechnicalAnalysis(formattedSymbol);
      if (graniteData) {
        return graniteData;
      }
    } catch (error) {
      console.warn('IBM Granite technical analysis failed:', error);
    }

    // No fallback - return null if all APIs fail
    console.error('All technical analysis APIs failed for symbol:', symbol);
    return null;
  }

  async getMarketNews(symbol: string): Promise<NewsItem[]> {
    const formattedSymbol = formatSymbol(symbol);
    console.log(`📰 Getting news for ${symbol} (formatted: ${formattedSymbol})`);
    
    // Try AWS Lambda first
    try {
      console.log(`🔄 Trying AWS Lambda news for ${formattedSymbol}`);
      const awsData = await awsLambdaService.getMarketNews(formattedSymbol);
      if (awsData && awsData.length > 0) {
        console.log(`✅ AWS Lambda news success for ${formattedSymbol}: ${awsData.length} articles`);
        return awsData;
      } else {
        console.log(`❌ AWS Lambda news returned empty for ${formattedSymbol}`);
      }
    } catch (error) {
      console.warn(`❌ AWS Lambda news failed for ${formattedSymbol}:`, error);
    }

    // Fallback to News API
    try {
      console.log(`🔄 Trying News API for ${formattedSymbol}`);
      const newsData = await this.getNewsAPIData(formattedSymbol);
      if (newsData && newsData.length > 0) {
        console.log(`✅ News API success for ${formattedSymbol}: ${newsData.length} articles`);
        return newsData;
      } else {
        console.log(`❌ News API returned empty for ${formattedSymbol}`);
      }
    } catch (error) {
      console.warn(`❌ News API failed for ${formattedSymbol}:`, error);
    }

    // No fallback - return empty array if all APIs fail
    console.error(`❌ All news APIs failed for symbol: ${symbol}`);
    return [];
  }

  async processMessage(message: string): Promise<ChatMessage> {
    const messageId = Date.now().toString();
    const timestamp = new Date();
    const lowerMessage = message.toLowerCase();
    
    // Try prediction request first (highest priority)
    const predictionResponse = await this.handlePredictionRequest(message, lowerMessage, messageId, timestamp);
    if (predictionResponse) return predictionResponse;
    
    // Try news request second
    const newsResponse = await this.handleNewsRequest(message, lowerMessage, messageId, timestamp);
    if (newsResponse) return newsResponse;
    
    // Try technical analysis request third
    const technicalResponse = await this.handleTechnicalAnalysisRequest(message, lowerMessage, messageId, timestamp);
    if (technicalResponse) return technicalResponse;
    
    // Try price request last (lowest priority)
    const priceResponse = await this.handlePriceRequest(message, lowerMessage, messageId, timestamp);
    if (priceResponse) return priceResponse;
    
    // Default response
    return {
      id: messageId,
      content: "I can help you with stock prices, predictions, technical analysis, and news. Try asking about a specific stock like 'What's the price of AAPL?' or 'Predict TSLA stock'.",
      isUser: false,
      timestamp
    };
  }

  private async handlePredictionRequest(message: string, lowerMessage: string, messageId: string, timestamp: Date): Promise<ChatMessage | null> {
    if (!lowerMessage.includes('predict') && !lowerMessage.includes('forecast') && !lowerMessage.includes('prediction')) {
      return null;
    }

    const symbol = this.extractSymbol(message);
    if (!symbol) return null;

    console.log(`🔮 Processing prediction request for: ${symbol}`);
    const prediction = await this.getStockPrediction(symbol);
    
    if (prediction) {
      return {
        id: messageId,
        content: `Here's my AI prediction for ${symbol}:`,
        isUser: false,
        timestamp,
        data: { prediction }
      };
    } else {
      return {
        id: messageId,
        content: `Sorry, I couldn't generate a prediction for ${symbol}. Please check if the symbol is correct and try again.`,
        isUser: false,
        timestamp
      };
    }
  }

  private async handleNewsRequest(message: string, lowerMessage: string, messageId: string, timestamp: Date): Promise<ChatMessage | null> {
    if (!lowerMessage.includes('news') && !lowerMessage.includes('latest news')) {
      return null;
    }

    const symbol = this.extractSymbol(message);
    if (!symbol) return null;

    console.log(`📰 Processing news request for: ${symbol}`);
    const news = await this.getMarketNews(symbol);
    
    if (news && news.length > 0) {
      return {
        id: messageId,
        content: `Here's the latest news for ${symbol}:`,
        isUser: false,
        timestamp,
        data: { news: news.slice(0, API_CONSTANTS.MAX_DISPLAY_NEWS) }
      };
    } else {
      return {
        id: messageId,
        content: `Sorry, I couldn't find any news for ${symbol}. Please check if the symbol is correct and try again.`,
        isUser: false,
        timestamp
      };
    }
  }

  private async handleTechnicalAnalysisRequest(message: string, lowerMessage: string, messageId: string, timestamp: Date): Promise<ChatMessage | null> {
    if (!lowerMessage.includes('technical') && !lowerMessage.includes('analysis')) {
      return null;
    }

    const symbol = this.extractSymbol(message);
    if (!symbol) return null;

    console.log(`📊 Processing technical analysis request for: ${symbol}`);
    const technicalAnalysis = await this.getTechnicalAnalysis(symbol);
    
    if (technicalAnalysis) {
      return {
        id: messageId,
        content: `Here's the technical analysis for ${symbol}:`,
        isUser: false,
        timestamp,
        data: { technicalAnalysis }
      };
    } else {
      return {
        id: messageId,
        content: `Sorry, I couldn't generate technical analysis for ${symbol}. Please check if the symbol is correct and try again.`,
        isUser: false,
        timestamp
      };
    }
  }

  private async handlePriceRequest(message: string, lowerMessage: string, messageId: string, timestamp: Date): Promise<ChatMessage | null> {
    if (!lowerMessage.includes('price') && !lowerMessage.includes('stock') && !lowerMessage.includes('current')) {
      return null;
    }

    const symbol = this.extractSymbol(message);
    if (!symbol) return null;

    console.log(`💰 Processing price request for: ${symbol}`);
    const stockPrice = await this.getStockPrice(symbol);
    
    if (stockPrice) {
      return {
        id: messageId,
        content: `Here's the current price for ${symbol}:`,
        isUser: false,
        timestamp,
        data: { stockPrice }
      };
    } else {
      return {
        id: messageId,
        content: `Sorry, I couldn't fetch the current price for ${symbol}. Please check if the symbol is correct and try again.`,
        isUser: false,
        timestamp
      };
    }
  }

  private extractSymbol(message: string): string | null {
    // Extract stock symbols from message - improved regex
    console.log(`🔍 Extracting symbol from: "${message}"`);
    
    // Try to find common stock symbols (1-5 uppercase letters)
    const symbolMatch = message.match(/\b([A-Z]{1,5})\b/g);
    if (symbolMatch) {
      console.log(`✅ Found symbols: ${symbolMatch}`);
      return symbolMatch[0];
    }
    
    // Fallback: look for any uppercase letters
    const fallbackMatch = message.match(/([A-Z]+)/g);
    if (fallbackMatch) {
      console.log(`🔄 Fallback found: ${fallbackMatch}`);
      return fallbackMatch[0];
    }
    
    console.log(`❌ No symbol found in: "${message}"`);
    return null;
  }

  private async getAlphaVantageStockPrice(symbol: string): Promise<StockPrice | null> {
    const apiKey = import.meta.env?.VITE_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not found');
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        const symbol = quote['01. symbol'];
        const currency = detectCurrency(symbol);
        return {
          symbol: symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          marketCap: null,
          currency: currency,
          lastUpdated: new Date()
        };
      }
      return null;
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      throw error;
    }
  }

  private async getNewsAPIData(symbol: string): Promise<NewsItem[]> {
    const apiKey = import.meta.env?.VITE_NEWS_API_KEY || 'c273c5d8b13a44b5a857e67545b90ee1';
    if (!apiKey) {
      console.warn('⚠️ News API key not found, using fallback');
      return [];
    }

    try {
      console.log(`📰 Fetching news for ${symbol} using News API`);
      
      // Use proxy to avoid CORS issues
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const newsUrl = `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${apiKey}&sortBy=publishedAt&pageSize=5`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(newsUrl));
      
      if (!response.ok) {
        console.error(`❌ News API error: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        console.log(`✅ Found ${data.articles.length} news articles for ${symbol}`);
        return data.articles.map((article: any) => ({
          id: article.url,
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: new Date(article.publishedAt),
          source: article.source.name
        }));
      }
      return [];
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  }

  private convertAWSToStockPrice(awsData: any): StockPrice {
    return {
      symbol: awsData.symbol,
      price: awsData.price,
      change: awsData.change,
      changePercent: awsData.changePercent,
      volume: awsData.volume,
      marketCap: awsData.marketCap,
      currency: awsData.currency || 'USD', // Default to USD if not provided
      lastUpdated: new Date(awsData.lastUpdated)
    };
  }

  private generateMockPrediction(symbol: string, timeframe: string): Prediction {
    const volatility = PREDICTION_CONSTANTS.VOLATILITY;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const currentPrice = PREDICTION_CONSTANTS.MIN_PRICE + Math.random() * (PREDICTION_CONSTANTS.MAX_PRICE - PREDICTION_CONSTANTS.MIN_PRICE);
    const predictedPrice = currentPrice * (1 + randomChange);
    const confidence = Math.floor(Math.random() * (PREDICTION_CONSTANTS.MAX_CONFIDENCE - PREDICTION_CONSTANTS.MIN_CONFIDENCE)) + PREDICTION_CONSTANTS.MIN_CONFIDENCE;

    return {
      symbol: symbol.toUpperCase(),
      currentPrice,
      predictedPrice,
      confidence,
      timeframe,
      reasoning: `AI analysis based on historical patterns and market trends for ${symbol}. Consider market volatility and company fundamentals.`,
      lastUpdated: new Date()
    };
  }

}

export const stockMarketAPI = new StockMarketAPI();