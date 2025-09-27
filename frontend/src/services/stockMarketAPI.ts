import { awsLambdaService } from './awsLambdaService';
import { yahooFinanceService } from './yahooFinanceService';
import { ibmGraniteService } from './ibmGraniteService';

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | null;
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
  private formatSymbol(symbol: string): string {
    const cleanSymbol = symbol.toUpperCase().trim();
    
    // If already has exchange suffix, return as is
    if (cleanSymbol.includes('.')) {
      return cleanSymbol;
    }
    
    // Smart detection for Indonesian stocks
    // Indonesian stocks typically have 4 characters and follow certain patterns
    const isIndonesianStock = this.detectIndonesianStock(cleanSymbol);
    
    if (isIndonesianStock) {
      return `${cleanSymbol}.JK`;
    }
    
    return cleanSymbol;
  }

  private detectIndonesianStock(symbol: string): boolean {
    // Indonesian stocks typically have 4 characters
    if (symbol.length !== 4) {
      return false;
    }
    
    // Common Indonesian stock patterns
    const indonesianPatterns = [
      // Banking patterns (BB, BM, BN, etc.)
      /^BB[A-Z]{2}$/,  // BBCA, BBRI, BMRI, BNGA, BBNI
      /^BC[A-Z]{2}$/,  // BCA variants
      /^BR[A-Z]{2}$/,  // BRI variants
      /^MA[A-Z]{2}$/,  // MANDIRI variants
      /^BN[A-Z]{2}$/,  // BNI variants
      /^CI[A-Z]{2}$/,  // CIMB variants
      
      // Telco patterns
      /^TL[A-Z]{2}$/,  // TLKM
      /^IS[A-Z]{2}$/,  // ISAT
      /^EX[A-Z]{2}$/,  // EXCL
      /^FR[A-Z]{2}$/,  // FREN
      
      // Consumer patterns
      /^UN[A-Z]{2}$/,  // UNVR
      /^IN[A-Z]{2}$/,  // INDF, INCO, INTP
      /^IC[A-Z]{2}$/,  // ICBP
      /^WI[A-Z]{2}$/,  // WIKA
      /^AD[A-Z]{2}$/,  // ADHI, ADRO
      /^JS[A-Z]{2}$/,  // JSMR
      /^PG[A-Z]{2}$/,  // PGAS
      /^AN[A-Z]{2}$/,  // ANTM
      /^AS[A-Z]{2}$/,  // ASII
      /^SM[A-Z]{2}$/,  // SMGR
      /^KL[A-Z]{2}$/,  // KLBF
      /^GG[A-Z]{2}$/,  // GGRM
      /^CP[A-Z]{2}$/,  // CPIN
      /^TK[A-Z]{2}$/,  // TKIM
      /^HM[A-Z]{2}$/,  // HMSP
      /^AU[A-Z]{2}$/,  // AUTO
      /^CD[A-Z]{2}$/,  // CDIA
      /^BU[A-Z]{2}$/,  // BUKA
    ];
    
    // Check if symbol matches any Indonesian pattern
    return indonesianPatterns.some(pattern => pattern.test(symbol));
  }

  async getStockPrice(symbol: string): Promise<StockPrice | null> {
    const cleanSymbol = symbol.toUpperCase().trim();
    console.log(`🎯 Starting stock price search for: ${symbol} (cleaned: ${cleanSymbol})`);
    
    // Universal approach: try all possible formats
    const formatsToTry = this.generateAllFormats(cleanSymbol);
    console.log(`📋 Will try these formats:`, formatsToTry);
    
    for (const format of formatsToTry) {
      console.log(`🔄 Trying format: ${format}`);
      const result = await this.tryStockPriceAPIs(format);
      if (result) {
        console.log(`✅ Found stock data for ${format}`);
        return result;
      }
      console.log(`❌ No data found for ${format}`);
    }
    
    console.error('❌ All stock price APIs failed for symbol:', symbol);
    return null;
  }

  private generateAllFormats(symbol: string): string[] {
    const formats = [symbol]; // Original format
    console.log(`🔧 generateAllFormats input: ${symbol}`);
    
    // If it's a 4-character symbol without exchange suffix
    if (symbol.length === 4 && !symbol.includes('.')) {
      console.log(`🔧 Adding suffixes for 4-char symbol: ${symbol}`);
      // Add common exchange suffixes
      formats.push(`${symbol}.JK`);  // Indonesia
      formats.push(`${symbol}.TO`);  // Toronto
      formats.push(`${symbol}.L`);   // London
      formats.push(`${symbol}.HK`);  // Hong Kong
      formats.push(`${symbol}.SG`);  // Singapore
      formats.push(`${symbol}.AX`);  // Australia
      formats.push(`${symbol}.T`);   // Tokyo
      formats.push(`${symbol}.DE`);  // Germany
      formats.push(`${symbol}.PA`);  // Paris
      formats.push(`${symbol}.MC`);  // Madrid
    }
    
    // If it already has a suffix, also try without suffix
    if (symbol.includes('.')) {
      const baseSymbol = symbol.split('.')[0];
      console.log(`🔧 Symbol has suffix, base symbol: ${baseSymbol}`);
      if (baseSymbol.length === 4) {
        formats.push(baseSymbol); // Try without suffix
        console.log(`🔧 Added base symbol: ${baseSymbol}`);
      }
    }
    
    console.log(`🔧 Final formats:`, formats);
    return formats;
  }

  private async tryStockPriceAPIs(symbol: string): Promise<StockPrice | null> {
    // Try Yahoo Finance first (now with correct API key)
    try {
      console.log(`🔄 Trying Yahoo Finance for: ${symbol}`);
      const yahooData = await yahooFinanceService.getStockPrice(symbol);
      if (yahooData) {
        console.log(`✅ Yahoo Finance success for: ${symbol}`);
        return yahooData;
      }
    } catch (error) {
      console.warn('❌ Yahoo Finance stock price failed:', error);
    }

    // Try Alpha Vantage as fallback
    try {
      console.log(`🔄 Trying Alpha Vantage for: ${symbol}`);
      const alphaData = await this.getAlphaVantageStockPrice(symbol);
      if (alphaData) {
        console.log(`✅ Alpha Vantage success for: ${symbol}`);
        return alphaData;
      }
    } catch (error) {
      console.warn('❌ Alpha Vantage stock price failed:', error);
    }

    // Try AWS Lambda as final fallback
    try {
      console.log(`🔄 Trying AWS Lambda for: ${symbol}`);
      const awsData = await awsLambdaService.getStockPrice(symbol);
      if (awsData) {
        console.log(`✅ AWS Lambda success for: ${symbol}`);
        return this.convertAWSToStockPrice(awsData);
      }
    } catch (error) {
      console.warn('❌ AWS Lambda stock price failed:', error);
    }

    return null;
  }

  async getStockPrediction(symbol: string, timeframe: string = '1 week'): Promise<Prediction | null> {
    const formattedSymbol = this.formatSymbol(symbol);
    // Try AWS Lambda first
    try {
      const awsData = await awsLambdaService.getAIPrediction(formattedSymbol, timeframe);
      if (awsData) {
        return awsData;
      }
    } catch (error) {
      console.warn('AWS Lambda prediction failed:', error);
    }

    // Fallback to IBM Granite
    try {
      const graniteData = await ibmGraniteService.getPrediction(formattedSymbol, timeframe);
      if (graniteData) {
        return graniteData;
      }
    } catch (error) {
      console.warn('IBM Granite prediction failed:', error);
    }

    // No fallback - return null if all APIs fail
    console.error('All prediction APIs failed for symbol:', symbol);
    return null;
  }

  async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis | null> {
    const formattedSymbol = this.formatSymbol(symbol);
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
    const formattedSymbol = this.formatSymbol(symbol);
    // Try AWS Lambda first
    try {
      const awsData = await awsLambdaService.getMarketNews(formattedSymbol);
      if (awsData && awsData.length > 0) {
        return awsData;
      }
    } catch (error) {
      console.warn('AWS Lambda news failed:', error);
    }

    // Fallback to News API
    try {
      const newsData = await this.getNewsAPIData(formattedSymbol);
      if (newsData && newsData.length > 0) {
        return newsData;
      }
    } catch (error) {
      console.warn('News API failed:', error);
    }

    // No fallback - return empty array if all APIs fail
    console.error('All news APIs failed for symbol:', symbol);
    return [];
  }

  async processMessage(message: string): Promise<ChatMessage> {
    const messageId = Date.now().toString();
    const timestamp = new Date();

    // Simple keyword detection
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('stock')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
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
    }

    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
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
    }

    if (lowerMessage.includes('technical') || lowerMessage.includes('analysis')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
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
    }

    if (lowerMessage.includes('news')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
        const news = await this.getMarketNews(symbol);
        if (news && news.length > 0) {
          return {
            id: messageId,
            content: `Here's the latest news for ${symbol}:`,
            isUser: false,
            timestamp,
            data: { news }
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
    }

    // Default response
    return {
      id: messageId,
      content: "I can help you with stock prices, predictions, technical analysis, and news. Try asking about a specific stock like 'What's the price of AAPL?' or 'Predict TSLA stock'.",
      isUser: false,
      timestamp
    };
  }

  private extractSymbol(message: string): string | null {
    // Extract stock symbols from message
    const symbolMatch = message.match(/\b([A-Z]{1,5})\b/g);
    if (symbolMatch) {
      return symbolMatch[0];
    }
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
        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          marketCap: null,
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
    const apiKey = import.meta.env?.VITE_NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('News API key not found');
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${apiKey}&sortBy=publishedAt&pageSize=5`
      );
      const data = await response.json();
      
      if (data.articles) {
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
      throw error;
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
      lastUpdated: new Date(awsData.lastUpdated)
    };
  }

}

export const stockMarketAPI = new StockMarketAPI();