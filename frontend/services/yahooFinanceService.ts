// Yahoo Finance API service using RapidAPI
export interface YahooStockData {
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

export interface YahooQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  marketCap: number;
  trailingPE: number;
  trailingEPS: number;
  dividendRate: number;
  dividendYield: number;
}

class YahooFinanceService {
  private rapidApiKey: string;
  private rapidApiHost: string;

  constructor() {
    this.rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY || '';
    this.rapidApiHost = 'yahoo-finance15.p.rapidapi.com';
  }

  // Get stock data from Yahoo Finance via RapidAPI
  async getStockData(symbol: string): Promise<YahooStockData> {
    try {
      if (!this.rapidApiKey) {
        // Fallback to mock data if no API key
        return this.getMockYahooData(symbol);
      }

      const response = await fetch(
        `https://${this.rapidApiHost}/api/v1/markets/stock/quotes?ticker=${symbol}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': this.rapidApiHost
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.body && data.body.length > 0) {
        const quote = data.body[0];
        return this.parseYahooQuote(quote);
      } else {
        throw new Error('No data found for symbol');
      }
    } catch (error) {
      console.error('Error fetching Yahoo Finance data:', error);
      // Fallback to mock data
      return this.getMockYahooData(symbol);
    }
  }

  // Get multiple stock quotes
  async getMultipleStockData(symbols: string[]): Promise<YahooStockData[]> {
    try {
      if (!this.rapidApiKey) {
        return symbols.map(symbol => this.getMockYahooData(symbol));
      }

      const response = await fetch(
        `https://${this.rapidApiHost}/api/v1/markets/stock/quotes?ticker=${symbols.join(',')}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': this.rapidApiHost
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.body && data.body.length > 0) {
        return data.body.map((quote: any) => this.parseYahooQuote(quote));
      } else {
        throw new Error('No data found for symbols');
      }
    } catch (error) {
      console.error('Error fetching multiple Yahoo Finance data:', error);
      // Fallback to mock data
      return symbols.map(symbol => this.getMockYahooData(symbol));
    }
  }

  // Parse Yahoo Finance quote data
  private parseYahooQuote(quote: any): YahooStockData {
    return {
      symbol: quote.symbol || '',
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      open: quote.regularMarketOpen || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      marketCap: quote.marketCap,
      pe: quote.trailingPE,
      eps: quote.trailingEPS,
      dividend: quote.dividendRate,
      yield: quote.dividendYield
    };
  }

  // Alternative method using direct Yahoo Finance scraping (unofficial)
  async getStockDataDirect(symbol: string): Promise<YahooStockData> {
    try {
      // This is a simplified approach - in production, you'd want to use a proper proxy
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.chart && data.chart.result && data.chart.result.length > 0) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        
        return {
          symbol: meta.symbol,
          price: meta.regularMarketPrice || 0,
          change: meta.regularMarketChange || 0,
          changePercent: meta.regularMarketChangePercent || 0,
          volume: meta.regularMarketVolume || 0,
          high: meta.regularMarketDayHigh || 0,
          low: meta.regularMarketDayLow || 0,
          open: meta.regularMarketOpen || 0,
          previousClose: meta.previousClose || 0,
          marketCap: meta.marketCap,
          pe: meta.trailingPE,
          eps: meta.trailingEPS,
          dividend: meta.dividendRate,
          yield: meta.dividendYield
        };
      } else {
        throw new Error('No data found for symbol');
      }
    } catch (error) {
      console.error('Error fetching direct Yahoo Finance data:', error);
      // Fallback to mock data
      return this.getMockYahooData(symbol);
    }
  }

  // Mock data for fallback
  private getMockYahooData(symbol: string): YahooStockData {
    const mockData: Record<string, YahooStockData> = {
      AAPL: {
        symbol: 'AAPL',
        price: 189.75,
        change: 2.34,
        changePercent: 1.25,
        volume: 45000000,
        high: 191.20,
        low: 188.50,
        open: 189.10,
        previousClose: 187.41,
        marketCap: 3000000000000,
        pe: 28.5,
        eps: 6.66,
        dividend: 0.96,
        yield: 0.51
      },
      TSLA: {
        symbol: 'TSLA',
        price: 248.50,
        change: -3.12,
        changePercent: -1.24,
        volume: 32000000,
        high: 252.80,
        low: 247.20,
        open: 251.62,
        previousClose: 251.62,
        marketCap: 790000000000,
        pe: 45.2,
        eps: 5.50,
        dividend: 0,
        yield: 0
      },
      MSFT: {
        symbol: 'MSFT',
        price: 378.85,
        change: 5.67,
        changePercent: 1.52,
        volume: 28000000,
        high: 380.20,
        low: 375.10,
        open: 376.50,
        previousClose: 373.18,
        marketCap: 2800000000000,
        pe: 32.1,
        eps: 11.81,
        dividend: 3.00,
        yield: 0.79
      },
      GOOGL: {
        symbol: 'GOOGL',
        price: 142.56,
        change: 1.89,
        changePercent: 1.34,
        volume: 22000000,
        high: 143.80,
        low: 141.20,
        open: 142.10,
        previousClose: 140.67,
        marketCap: 1800000000000,
        pe: 25.8,
        eps: 5.52,
        dividend: 0,
        yield: 0
      },
      AMZN: {
        symbol: 'AMZN',
        price: 155.20,
        change: -1.45,
        changePercent: -0.93,
        volume: 18000000,
        high: 157.80,
        low: 154.50,
        open: 156.65,
        previousClose: 156.65,
        marketCap: 1600000000000,
        pe: 52.3,
        eps: 2.97,
        dividend: 0,
        yield: 0
      },
      META: {
        symbol: 'META',
        price: 485.30,
        change: 8.92,
        changePercent: 1.87,
        volume: 15000000,
        high: 487.50,
        low: 480.20,
        open: 482.10,
        previousClose: 476.38,
        marketCap: 1200000000000,
        pe: 24.6,
        eps: 19.72,
        dividend: 2.00,
        yield: 0.41
      }
    };

    return mockData[symbol.toUpperCase()] || {
      symbol: symbol.toUpperCase(),
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 50000000),
      high: 100 + Math.random() * 200,
      low: 100 + Math.random() * 200,
      open: 100 + Math.random() * 200,
      previousClose: 100 + Math.random() * 200,
      marketCap: Math.floor(Math.random() * 1000000000000),
      pe: 15 + Math.random() * 30,
      eps: 1 + Math.random() * 10,
      dividend: Math.random() * 5,
      yield: Math.random() * 3
    };
  }
}

export const yahooFinanceService = new YahooFinanceService();
