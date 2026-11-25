// Indonesian stock detection utilities

import { STOCK_SYMBOL_CONSTANTS } from './constants';

/**
 * IDX tickers that can be typed without the .JK suffix. Guessing from the first
 * letters sent US tickers such as INTC and ADBE to the wrong exchange, so this is
 * an explicit list; tickers also used in the US (CTRA, ESSA, BIRD, ...) are left
 * out and need an explicit ".JK". S4-01 replaces this with full IDX symbol data.
 */
const IDX_TICKERS = new Set(
  `AALI ADHI ADMR ADRO AKRA AMMN AMRT ANTM ARTO ASII ASSA BBCA BBNI BBRI BBTN BBYB BDMN BJBR BJTM BMRI
   BNGA BNLI BREN BRIS BRPT BSDE BTPS BUKA BUMI CMRY CPIN CUAN DMAS DSNG EMTK ERAA EXCL GGRM GIAA GOTO
   HMSP HRUM ICBP INCO INDF INKP INTP ISAT ITMG JPFA JSMR KAEF KLBF LPKR LPPF LSIP MAPA MAPI MBMA MDKA
   MEDC MIKA MNCN MYOR NCKL NISP PGAS PGEO PNBN PTBA PTPP PWON SCMA SIDO SMGR SMRA SRTG SSMS TAPG TBIG
   TINS TKIM TLKM TOWR TPIA ULTJ UNTR UNVR WIKA WSKT`.split(/\s+/),
);

/** True for known IDX tickers written without an exchange suffix. */
export function isIndonesianStock(symbol: string): boolean {
  return IDX_TICKERS.has(symbol.toUpperCase());
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
  
  if (isIndonesianStock(cleanSymbol)) {
    return `${cleanSymbol}.JK`;
  }
  
  return cleanSymbol;
}
