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
