import { describe, expect, it } from 'vitest';
import { formatSymbol, isIndonesianStock } from './symbolUtils';

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
  it('does not add .JK to US tickers', () => {
    expect(formatSymbol('MSFT')).toBe('MSFT');
  });
});

describe('isIndonesianStock', () => {
  it('requires exactly 4 characters', () => {
    expect(isIndonesianStock('BBC')).toBe(false);
    expect(isIndonesianStock('BBCA')).toBe(true);
  });
});
