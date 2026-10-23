// Stock data access + (temporary) keyword-based chat routing.
// All data comes from our backend (see apiClient.ts). When data is unavailable
// we say so; we never fabricate prices, indicators, predictions or news.
// The keyword router is replaced by the LLM orchestrator in Sprint 2 (S2-06).
import { apiGet, ApiError } from './apiClient';
import { formatSymbol } from '@/lib/symbolUtils';
import { API_CONSTANTS } from '@/lib/constants';

/** Where a piece of data came from and when it was valid. */
export interface DataProvenance {
  source: string;
  asOf: string;
  delayed?: boolean;
}

export interface StockPrice extends DataProvenance {
  symbol: string;
  name?: string | null;
  price: number;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: string | null;
  currency: string;
  lastUpdated: string;
}

export interface Prediction extends DataProvenance {
  symbol: string;
  currentPrice: number;
  currency: string;
  timeframe: string;
  /** Qualitative factors written by the model. No price target, no confidence number. */
  reasoning: string;
  risks: string | null;
  model?: string;
  lastUpdated: string;
}

export interface TechnicalSignal {
  id: string;
  severity: 'bullish' | 'bearish' | 'info';
  label: string;
}

export interface TechnicalAnalysis extends DataProvenance {
  symbol: string;
  currency: string | null;
  rsi: number | null;
  macd: { macd: number | null; signal: number | null; histogram: number | null };
  movingAverages: { sma20: number | null; sma50: number | null; sma200: number | null };
  support: number | null;
  resistance: number | null;
  trend: string;
  signals: TechnicalSignal[];
  warnings: string[];
  lastUpdated: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface NewsResult extends DataProvenance {
  news: NewsItem[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  /** Set when the request failed; the UI offers a retry with `retryText`. */
  error?: { message: string; retryText: string };
  data?: {
    stockPrice?: StockPrice;
    prediction?: Prediction;
    technicalAnalysis?: TechnicalAnalysis;
    news?: NewsItem[];
    newsMeta?: DataProvenance;
  };
}

interface BackendPrediction extends DataProvenance {
  symbol: string;
  current: number;
  currency: string;
  timeframe: string;
  reasoning: string;
  risks: string | null;
  model?: string;
}

class StockMarketAPI {
  getStockPrice(symbol: string): Promise<StockPrice> {
    return apiGet<StockPrice>('/stock-price', { symbol: formatSymbol(symbol) });
  }

  async getStockPrediction(symbol: string, timeframe = '1w'): Promise<Prediction> {
    const p = await apiGet<BackendPrediction>('/ai-prediction', { symbol: formatSymbol(symbol), timeframe });
    return {
      symbol: p.symbol,
      currentPrice: p.current,
      currency: p.currency,
      timeframe: p.timeframe,
      reasoning: p.reasoning,
      risks: p.risks,
      model: p.model,
      source: p.source,
      asOf: p.asOf,
      lastUpdated: p.asOf,
    };
  }

  getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis> {
    return apiGet<TechnicalAnalysis>('/technical-analysis', { symbol: formatSymbol(symbol) });
  }

  getMarketNews(symbol: string): Promise<NewsResult> {
    return apiGet<NewsResult>('/market-news', { symbol: formatSymbol(symbol) });
  }

  async processMessage(message: string): Promise<ChatMessage> {
    const base = { id: `${Date.now()}`, isUser: false, timestamp: new Date() };
    const lower = message.toLowerCase();
    const symbol = this.extractSymbol(message);

    if (!symbol) {
      return {
        ...base,
        content:
          "I can help with stock prices, AI outlooks, technical analysis and news. Mention a ticker in capitals, e.g. 'What's the price of AAPL?' or 'Technical analysis BBCA'.",
      };
    }

    const fail = (what: string, err: unknown): ChatMessage => {
      const reason = err instanceof ApiError ? err.message : 'Unexpected error.';
      return {
        ...base,
        content: `Sorry, I couldn't get ${what} for ${symbol}. ${reason}`,
        error: { message: reason, retryText: message },
      };
    };

    try {
      if (/predict|forecast|prediksi|proyeksi/.test(lower)) {
        const prediction = await this.getStockPrediction(symbol);
        return { ...base, content: `Here's an AI outlook for ${prediction.symbol}:`, data: { prediction } };
      }
      if (/news|berita/.test(lower)) {
        const result = await this.getMarketNews(symbol);
        if (!result.news.length) return { ...base, content: `No recent news found for ${symbol}.` };
        return {
          ...base,
          content: `Here's the latest news for ${symbol}:`,
          data: { news: result.news.slice(0, API_CONSTANTS.MAX_DISPLAY_NEWS), newsMeta: result },
        };
      }
      if (/technical|analysis|analisis|teknikal|rsi|macd/.test(lower)) {
        const technicalAnalysis = await this.getTechnicalAnalysis(symbol);
        return { ...base, content: `Here's the technical analysis for ${technicalAnalysis.symbol}:`, data: { technicalAnalysis } };
      }
      const stockPrice = await this.getStockPrice(symbol);
      return { ...base, content: `Here's the current price for ${stockPrice.symbol}:`, data: { stockPrice } };
    } catch (err) {
      const what = /predict|forecast|prediksi|proyeksi/.test(lower)
        ? 'an AI outlook'
        : /news|berita/.test(lower)
          ? 'news'
          : /technical|analysis|analisis|teknikal|rsi|macd/.test(lower)
            ? 'technical analysis'
            : 'the price';
      return fail(what, err);
    }
  }

  /** Extracts the first ticker-looking token (e.g. AAPL, BBCA, BBCA.JK, BRK-B). */
  extractSymbol(message: string): string | null {
    const NOT_TICKERS = new Set(['I', 'A', 'AI', 'RSI', 'MACD', 'SMA', 'EMA', 'USD', 'IDR', 'IDX', 'OK']);
    for (const m of message.matchAll(/\b([A-Z]{1,5}(?:[.-][A-Z]{1,2})?)\b/g)) {
      if (!NOT_TICKERS.has(m[1])) return m[1];
    }
    return null;
  }
}

export const stockMarketAPI = new StockMarketAPI();
