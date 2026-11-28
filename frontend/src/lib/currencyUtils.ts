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

/**
 * The one place signs are added: "+"/"−" (U+2212, as in PriceChange) before an already formatted absolute value.
 * No sign when the value rounds to zero, so a tiny negative never shows as "−0,00".
 */
function withSign(value: number, absText: string, plus = ''): string {
  if (!/[1-9]/.test(absText)) return absText;
  return `${value > 0 ? plus : value < 0 ? MINUS : ''}${absText}`;
}

type Num = number | null | undefined;

/** Index symbols (^JKSE, ^GSPC) are quoted in points, not money. */
export const isIndexSymbol = (symbol = '') => symbol.startsWith('^');

/** Points for an index: 2 decimals in the currency's locale, no currency symbol ("5.338,46", "6,012.30"). */
const points = (value: number, currency: string) =>
  new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value));

/** "Rp5.900", "$1,234.56", "−$5.00"; indices in points ("5.338,46"); null → "—". */
export function formatPrice(price: Num, currency: string, symbol = ''): string {
  if (price == null) return DASH;
  if (isIndexSymbol(symbol)) return withSign(price, points(price, currency));
  return withSign(price, `${formatCurrencySymbol(currency)}${numberFormat(currency).format(Math.abs(price))}`);
}

/** Signed money change: "+Rp75", "−$1.50", "$0.00"; indices in points ("+28,07"); null → "—". */
export function formatChange(change: Num, currency: string, symbol = ''): string {
  if (change == null) return DASH;
  if (isIndexSymbol(symbol)) return withSign(change, points(change, currency), '+');
  return withSign(change, `${formatCurrencySymbol(currency)}${numberFormat(currency).format(Math.abs(change))}`, '+');
}

/** Signed percent in the currency's locale, always 2 decimals: "+1,29%" (IDR), "−2.00%" (USD). */
export function formatPercent(percent: Num, currency: string): string {
  if (percent == null) return DASH;
  const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
  const abs = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(percent));
  return withSign(percent, `${abs}%`, '+');
}

/** Whole-number volume in the currency's locale: "133.232.200" (IDR), "1,234,567" (USD). */
export function formatVolume(volume: Num, currency: string): string {
  return volume == null ? DASH : numberFormat(currency, 0).format(volume);
}

/**
 * Plain number in the currency's locale with exactly `decimals` digits and no symbol
 * (ticker strip, indicators): "5.412" (IDR, 0), "89,74" (IDR, 2), "149.30" (USD, 2), "−3.50".
 */
export function formatNumber(value: Num, currency: string, decimals = 2): string {
  if (value == null) return DASH;
  const abs = new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
  return withSign(value, abs);
}

/** Decimals for price-like numbers without a symbol: IDR stocks are whole rupiah, indices and other currencies 2. */
export function priceDecimals(currency: string, symbol = ''): number {
  return currency === 'IDR' && !isIndexSymbol(symbol) ? 0 : 2;
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
