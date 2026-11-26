import { describe, expect, it } from 'vitest';
import { formatSymbol, isIndonesianStock } from './symbolUtils';
import { US_STOCKS } from './usStocks';

describe('formatSymbol', () => {
  it('uppercases and trims', () => {
    expect(formatSymbol('  aapl ')).toBe('AAPL');
  });
  it('adds .JK to known Indonesian tickers', () => {
    expect(formatSymbol('bbca')).toBe('BBCA.JK');
    expect(formatSymbol('TLKM')).toBe('TLKM.JK');
  });
  it('keeps an explicit exchange suffix', () => {
    expect(formatSymbol('BBCA.JK')).toBe('BBCA.JK');
    expect(formatSymbol('vod.l')).toBe('VOD.L');
  });
  it.each(['MSFT', 'INTC', 'ADBE', 'ANET', 'SMCI', 'ADSK', 'INTU', 'MA', 'CTRA'])('does not add .JK to US ticker %s', (t) => {
    expect(formatSymbol(t)).toBe(t);
  });
  it('leaves every symbol in the US stock list unchanged', () => {
    for (const { symbol } of US_STOCKS) expect(formatSymbol(symbol)).toBe(symbol);
  });
  it.each(['BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'UNVR', 'ICBP', 'INDF', 'ANTM', 'GOTO', 'ADRO', 'INTP'])('adds .JK to IDX ticker %s', (t) => {
    expect(formatSymbol(t)).toBe(`${t}.JK`);
  });
});

describe('isIndonesianStock', () => {
  it('only matches known tickers', () => {
    expect(isIndonesianStock('BBC')).toBe(false);
    expect(isIndonesianStock('BBCA')).toBe(true);
    expect(isIndonesianStock('INTC')).toBe(false);
  });

  it('leaves index symbols such as ^JKSE untouched', () => {
    expect(formatSymbol('^JKSE')).toBe('^JKSE');
    expect(formatSymbol('^jkse')).toBe('^JKSE');
  });
});
