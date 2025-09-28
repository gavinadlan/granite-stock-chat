// Yahoo Finance Service via RapidAPI
export interface YahooStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | null;
  currency: string;
  lastUpdated: Date;
}

class YahooFinanceService {
  private apiKey: string;
  private baseUrl = 'https://yahoo-finance-real-time1.p.rapidapi.com';

  constructor() {
    this.apiKey = import.meta.env?.VITE_RAPIDAPI_KEY || '024887c011msh588fd1cec974e2bp16266djsn1b16f80bcfe9';
    if (!this.apiKey) {
      console.warn('⚠️ Yahoo Finance API key not found, using fallback');
    }
  }

  async getStockPrice(symbol: string): Promise<YahooStockData | null> {
    if (!this.apiKey) {
      console.warn('RapidAPI key not provided');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/stock/get-options?symbol=${symbol}&lang=en-US&region=US`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'yahoo-finance-real-time1.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        console.error(`❌ Yahoo Finance API error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse data from options endpoint - data is in optionChain.result[0].quote
      if (data.optionChain && data.optionChain.result && data.optionChain.result[0] && data.optionChain.result[0].quote) {
        const quote = data.optionChain.result[0].quote;
        const finalSymbol = quote.symbol || symbol.toUpperCase();
        const currency = this.detectCurrency(finalSymbol);
        return {
          symbol: finalSymbol, // Use API symbol if available
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          marketCap: this.formatMarketCap(quote.marketCap || 0),
          currency: currency,
          lastUpdated: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Yahoo Finance API error:', error);
      return null;
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