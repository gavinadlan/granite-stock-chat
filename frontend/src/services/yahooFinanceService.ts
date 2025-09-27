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
    this.apiKey = import.meta.env?.VITE_RAPIDAPI_KEY || '024887c011msh588fd1cec974e2bp16266djsn1b16f80bcfe9';
    console.log('🔑 Yahoo Finance API Key loaded:', this.apiKey ? '✅ Present' : '❌ Missing');
  }

  async getStockPrice(symbol: string): Promise<YahooStockData | null> {
    if (!this.apiKey) {
      console.warn('RapidAPI key not provided');
      return null;
    }

    try {
      console.log(`🔍 Yahoo Finance API call for: ${symbol}`);
      console.log(`🌐 URL: ${this.baseUrl}/stock/get-options?symbol=${symbol}&lang=en-US&region=US`);
      
      const response = await fetch(`${this.baseUrl}/stock/get-options?symbol=${symbol}&lang=en-US&region=US`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'yahoo-finance-real-time1.p.rapidapi.com'
        }
      });

      console.log(`📡 Yahoo Finance response status: ${response.status}`);
      console.log(`📡 Yahoo Finance response ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Yahoo Finance HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 Yahoo Finance data received:`, data);
      
      // Parse data from options endpoint - data is in optionChain.result[0].quote
      if (data.optionChain && data.optionChain.result && data.optionChain.result[0] && data.optionChain.result[0].quote) {
        const quote = data.optionChain.result[0].quote;
        return {
          symbol: symbol.toUpperCase(),
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          marketCap: this.formatMarketCap(quote.marketCap || 0),
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