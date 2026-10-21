// Shared types between frontend and backend.
// Dates are ISO-8601 strings on the wire; convert at the edges.

/** Metadata attached to every data response so the UI can show provenance. */
export interface DataMeta {
  /** Provider that produced the data, e.g. "yahoo", "newsapi". */
  source: string;
  /** ISO timestamp of when the data was valid (provider time, not request time). */
  asOf: string;
  /** True when quotes may be delayed (e.g. 15 min for free data). */
  delayed?: boolean;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | null;
  currency: string;
  lastUpdated: string;
  source?: string;
}

export interface Prediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  lastUpdated: string;
}

export interface TechnicalAnalysis {
  symbol: string;
  rsi: number | null;
  macd: { macd: number | null; signal: number | null; histogram: number | null };
  movingAverages: { sma20: number | null; sma50: number | null; sma200: number | null };
  support: number | null;
  resistance: number | null;
  trend: string;
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

export interface ApiErrorBody {
  error: { code: string; message: string };
  requestId?: string;
}
