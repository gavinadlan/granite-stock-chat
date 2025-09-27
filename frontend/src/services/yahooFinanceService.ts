// Yahoo Finance Service via RapidAPI
export interface YahooStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | null;
  lastUpdated: Date;
}

class YahooFinanceService {
  private apiKey: string;
  private baseUrl = 'https://yahoo-finance-real-time1.p.rapidapi.com';

  constructor() {
    this.apiKey = import.meta.env?.VITE_RAPIDAPI_KEY || '';
  }

  async getStockPrice(symbol: string): Promise<YahooStockData | null> {
    if (!this.apiKey) {
      console.warn('RapidAPI key not provided');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/stock/get-detail?symbol=${symbol}&lang=en-US&region=US`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'yahoo-finance-real-time1.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.price) {
        return {
          symbol: symbol.toUpperCase(),
          price: data.price.regularMarketPrice || 0,
          change: data.price.regularMarketChange || 0,
          changePercent: data.price.regularMarketChangePercent || 0,
          volume: data.price.regularMarketVolume || 0,
          marketCap: this.formatMarketCap(data.price.marketCap || 0),
          lastUpdated: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Yahoo Finance API error:', error);
      return null;
    }
  }

  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}

export const yahooFinanceService = new YahooFinanceService();