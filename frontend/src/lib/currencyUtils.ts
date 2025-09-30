// Currency utilities to eliminate code duplication

export interface CurrencyInfo {
  symbol: string;
  code: string;
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  'IDR': { symbol: 'Rp', code: 'IDR' },
  'USD': { symbol: '$', code: 'USD' },
  'EUR': { symbol: '€', code: 'EUR' },
  'GBP': { symbol: '£', code: 'GBP' },
  'JPY': { symbol: '¥', code: 'JPY' },
  'CAD': { symbol: 'C$', code: 'CAD' },
  'AUD': { symbol: 'A$', code: 'AUD' },
  'SGD': { symbol: 'S$', code: 'SGD' },
  'HKD': { symbol: 'HK$', code: 'HKD' },
};

/**
 * Detects currency based on stock symbol exchange suffix
 */
export function detectCurrency(symbol: string): string {
  const exchangeMap: Record<string, string> = {
    '.JK': 'IDR',  // Indonesia
    '.TO': 'CAD',  // Toronto
    '.L': 'GBP',   // London
    '.HK': 'HKD',  // Hong Kong
    '.SG': 'SGD',  // Singapore
    '.AX': 'AUD',  // Australia
    '.T': 'JPY',   // Tokyo
    '.DE': 'EUR',  // Germany
    '.PA': 'EUR',  // Paris
    '.MC': 'EUR',  // Madrid
  };

  for (const [suffix, currency] of Object.entries(exchangeMap)) {
    if (symbol.endsWith(suffix)) {
      return currency;
    }
  }

  // Default to USD for US stocks
  return 'USD';
}

/**
 * Formats currency symbol for display
 */
export function formatCurrencySymbol(currency: string): string {
  return CURRENCY_MAP[currency]?.symbol || '$';
}

/**
 * Formats price with currency symbol
 */
export function formatPrice(price: number, currency: string): string {
  const symbol = formatCurrencySymbol(currency);
  return `${symbol}${price.toFixed(2)}`;
}

/**
 * Formats change with currency symbol
 */
export function formatChange(change: number, currency: string): string {
  const symbol = formatCurrencySymbol(currency);
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${symbol}${change.toFixed(2)}`;
}

/**
 * Formats market cap with appropriate suffix
 */
export function formatMarketCap(marketCap: number): string {
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
