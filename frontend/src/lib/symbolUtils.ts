// Indonesian stock detection utilities

import { STOCK_SYMBOL_CONSTANTS } from './constants';

/**
 * Indonesian stock patterns organized by category
 */
const INDONESIAN_STOCK_PATTERNS = {
  BANKING: ['BB', 'BC', 'BR', 'MA', 'BN', 'CI'],
  TELCO: ['TL', 'IS', 'EX', 'FR'],
  CONSUMER: ['UN', 'IN', 'IC', 'WI', 'AD', 'JS', 'PG', 'AN', 'AS', 'SM', 'KL', 'GG', 'CP', 'TK', 'HM', 'AU', 'CD', 'BU'],
} as const;

/**
 * Checks if a symbol matches Indonesian stock patterns
 */
export function isIndonesianStock(symbol: string): boolean {
  // Must be exactly 4 characters
  if (symbol.length !== STOCK_SYMBOL_CONSTANTS.INDONESIAN_LENGTH) {
    return false;
  }

  // Extract first 2 characters as prefix
  const prefix = symbol.substring(0, 2);
  
  // Check against known Indonesian patterns
  const allPatterns = [
    ...INDONESIAN_STOCK_PATTERNS.BANKING,
    ...INDONESIAN_STOCK_PATTERNS.TELCO,
    ...INDONESIAN_STOCK_PATTERNS.CONSUMER,
  ];
  
  return allPatterns.includes(prefix);
}

/**
 * Generates all possible symbol formats for a given symbol
 */
export function generateSymbolFormats(symbol: string): string[] {
  const formats = [symbol]; // Original format
  
  // If it's a 4-character symbol without exchange suffix
  if (symbol.length === STOCK_SYMBOL_CONSTANTS.INDONESIAN_LENGTH && !symbol.includes('.')) {
    // Add common exchange suffixes
    const exchangeSuffixes = ['.JK', '.TO', '.L', '.HK', '.SG', '.AX', '.T', '.DE', '.PA', '.MC'];
    formats.push(...exchangeSuffixes.map(suffix => `${symbol}${suffix}`));
  }
  
  // If it already has a suffix, also try without suffix
  if (symbol.includes('.')) {
    const baseSymbol = symbol.split('.')[0];
    if (baseSymbol.length === STOCK_SYMBOL_CONSTANTS.INDONESIAN_LENGTH) {
      formats.push(baseSymbol);
    }
  }
  
  return formats;
}

/**
 * Formats symbol with appropriate exchange suffix
 */
export function formatSymbol(symbol: string): string {
  const cleanSymbol = symbol.toUpperCase().trim();
  
  // If already has exchange suffix, return as is
  if (cleanSymbol.includes('.')) {
    return cleanSymbol;
  }
  
  // Smart detection for Indonesian stocks
  if (isIndonesianStock(cleanSymbol)) {
    return `${cleanSymbol}.JK`;
  }
  
  return cleanSymbol;
}
