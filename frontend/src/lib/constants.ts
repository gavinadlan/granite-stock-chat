// Constants to eliminate magic numbers and hardcoded values

export const API_CONSTANTS = {
  TIMEOUTS: {
    DEFAULT: 10000, // 10 seconds
    PREDICTION: 15000, // 15 seconds for AI predictions
    NEWS: 8000, // 8 seconds for news API
  },
  RETRY_ATTEMPTS: 3,
  MAX_NEWS_ARTICLES: 5,
  MAX_DISPLAY_NEWS: 3,
} as const;

export const PREDICTION_CONSTANTS = {
  VOLATILITY: 0.05,
  MIN_PRICE: 100,
  MAX_PRICE: 600,
  MIN_CONFIDENCE: 65,
  MAX_CONFIDENCE: 95,
  DEFAULT_CONFIDENCE: 75,
} as const;

export const TECHNICAL_ANALYSIS_CONSTANTS = {
  DEFAULT_RSI: 50,
  DEFAULT_MACD: 0.5,
  DEFAULT_SIGNAL: 0.3,
  DEFAULT_HISTOGRAM: 0.2,
  DEFAULT_SMA_20: 100,
  DEFAULT_SMA_50: 98,
  DEFAULT_SMA_200: 95,
  DEFAULT_SUPPORT: 95,
  DEFAULT_RESISTANCE: 110,
} as const;

export const STOCK_SYMBOL_CONSTANTS = {
  INDONESIAN_LENGTH: 4,
  MAX_SYMBOL_LENGTH: 5,
  MIN_SYMBOL_LENGTH: 1,
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  SCROLL_BEHAVIOR: 'smooth' as const,
} as const;
