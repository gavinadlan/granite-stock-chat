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

const DASH = '—';
const MINUS = '\u2212';

/** IDR: id-ID, no decimals ("5.900"). Everything else: en-US, 2 decimals ("1,234.56"). */
function numberFormat(currency: string, decimals = 2): Intl.NumberFormat {
  return currency === 'IDR'
    ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
    : new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function sign(value: number, plus: string): string {
  return value > 0 ? plus : value < 0 ? MINUS : '';
}

type Num = number | null | undefined;

/** "Rp5.900", "$1,234.56", "−$5.00"; null → "—". */
export function formatPrice(price: Num, currency: string): string {
  if (price == null) return DASH;
  return `${sign(price, '')}${formatCurrencySymbol(currency)}${numberFormat(currency).format(Math.abs(price))}`;
}

/** Signed money change: "+Rp75", "−$1.50", "$0.00"; null → "—". */
export function formatChange(change: Num, currency: string): string {
  if (change == null) return DASH;
  return `${sign(change, '+')}${formatCurrencySymbol(currency)}${numberFormat(currency).format(Math.abs(change))}`;
}

/** Signed percent in the currency's locale, always 2 decimals: "+1,29%" (IDR), "−2.00%" (USD). */
export function formatPercent(percent: Num, currency: string): string {
  if (percent == null) return DASH;
  const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
  const abs = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(percent));
  return `${sign(percent, '+')}${abs}%`;
}

/** Whole-number volume in the currency's locale: "133.232.200" (IDR), "1,234,567" (USD). */
export function formatVolume(volume: Num, currency: string): string {
  return volume == null ? DASH : numberFormat(currency, 0).format(volume);
}

/**
 * Plain number in the currency's locale, no symbol (ticker strip, indicators).
 * IDR drops trailing zeros up to `decimals` ("5.875", "5.233,14"); other currencies keep exactly `decimals`.
 */
export function formatNumber(value: Num, currency: string, decimals = 2): string {
  if (value == null) return DASH;
  const options =
    currency === 'IDR'
      ? { minimumFractionDigits: 0, maximumFractionDigits: decimals }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', options).format(value);
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
