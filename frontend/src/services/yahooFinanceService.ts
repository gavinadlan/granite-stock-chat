// Yahoo Finance Service via RapidAPI
import { detectCurrency, formatMarketCap } from '@/lib/currencyUtils';

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
        const currency = detectCurrency(finalSymbol);
        return {
          symbol: finalSymbol, // Use API symbol if available
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          marketCap: formatMarketCap(quote.marketCap || 0),
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


  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}

export const yahooFinanceService = new YahooFinanceService();