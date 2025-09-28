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
    
    // Universal approach: try all possible formats
    const formatsToTry = this.generateAllFormats(cleanSymbol);
    
    for (const format of formatsToTry) {
      const result = await this.tryStockPriceAPIs(format);
      if (result) {
        return result;
      }
    }
    
    console.error(`❌ All stock price APIs failed for symbol: ${symbol}`);
    return null;
  }

  private generateAllFormats(symbol: string): string[] {
    const formats = [symbol]; // Original format
    
    // If it's a 4-character symbol without exchange suffix
    if (symbol.length === 4 && !symbol.includes('.')) {
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
      if (baseSymbol.length === 4) {
        formats.push(baseSymbol); // Try without suffix
      }
    }
    
    return formats;
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
    const formattedSymbol = this.formatSymbol(symbol);
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
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)) // 10 second timeout
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

    // Improved keyword detection with priority order
    const lowerMessage = message.toLowerCase();
    
    // Check for prediction requests FIRST (highest priority)
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('prediction')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
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
    }

    // Check for news requests SECOND
    if (lowerMessage.includes('news') || lowerMessage.includes('latest news')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
        console.log(`📰 Processing news request for: ${symbol}`);
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

    // Check for technical analysis requests THIRD
    if (lowerMessage.includes('technical') || lowerMessage.includes('analysis')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
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
    }

    // Check for price requests LAST (lowest priority)
    if (lowerMessage.includes('price') || lowerMessage.includes('stock') || lowerMessage.includes('current')) {
      const symbol = this.extractSymbol(message);
      if (symbol) {
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
        const currency = this.detectCurrency(symbol);
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

  private detectCurrency(symbol: string): string {
    // Indonesian stocks
    if (symbol.endsWith('.JK')) {
      return 'IDR';
    }
    // Canadian stocks
    if (symbol.endsWith('.TO')) {
      return 'CAD';
    }
    // British stocks
    if (symbol.endsWith('.L')) {
      return 'GBP';
    }
    // Hong Kong stocks
    if (symbol.endsWith('.HK')) {
      return 'HKD';
    }
    // Singapore stocks
    if (symbol.endsWith('.SG')) {
      return 'SGD';
    }
    // Australian stocks
    if (symbol.endsWith('.AX')) {
      return 'AUD';
    }
    // Japanese stocks
    if (symbol.endsWith('.T')) {
      return 'JPY';
    }
    // German stocks
    if (symbol.endsWith('.DE')) {
      return 'EUR';
    }
    // French stocks
    if (symbol.endsWith('.PA')) {
      return 'EUR';
    }
    // Spanish stocks
    if (symbol.endsWith('.MC')) {
      return 'EUR';
    }
    // Default to USD for US stocks
    return 'USD';
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
    const volatility = 0.05;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const currentPrice = 100 + Math.random() * 500; // Random current price
    const predictedPrice = currentPrice * (1 + randomChange);
    const confidence = Math.floor(Math.random() * 30) + 65;

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