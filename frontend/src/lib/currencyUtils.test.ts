import { describe, expect, it } from 'vitest';
import { detectCurrency, formatChange, formatPercent, formatPrice, formatVolume } from './currencyUtils';

describe('detectCurrency', () => {
  it.each([
    ['BBCA.JK', 'IDR'],
    ['VOD.L', 'GBP'],
    ['SHOP.TO', 'CAD'],
    ['7203.T', 'JPY'],
    ['AAPL', 'USD'],
  ])('%s -> %s', (symbol, currency) => {
    expect(detectCurrency(symbol)).toBe(currency);
  });
});

const MINUS = '\u2212';

describe('formatPrice', () => {
  it('IDR: id-ID, no decimals, dot thousands', () => {
    expect(formatPrice(5900, 'IDR')).toBe('Rp5.900');
    expect(formatPrice(9875.6, 'IDR')).toBe('Rp9.876');
  });
  it('USD and others: en-US, 2 decimals, comma thousands', () => {
    expect(formatPrice(1234.56, 'USD')).toBe('$1,234.56');
    expect(formatPrice(1.5, 'USD')).toBe('$1.50');
    expect(formatPrice(1234.5, 'EUR')).toBe('€1,234.50');
  });
  it('negative and null', () => {
    expect(formatPrice(-5, 'USD')).toBe(`${MINUS}$5.00`);
    expect(formatPrice(null, 'IDR')).toBe('—');
    expect(formatPrice(undefined, 'USD')).toBe('—');
  });
});

describe('formatChange', () => {
  it('signs changes', () => {
    expect(formatChange(75, 'IDR')).toBe('+Rp75');
    expect(formatChange(-1250, 'IDR')).toBe(`${MINUS}Rp1.250`);
    expect(formatChange(2, 'USD')).toBe('+$2.00');
    expect(formatChange(-2, 'USD')).toBe(`${MINUS}$2.00`);
    expect(formatChange(0, 'USD')).toBe('$0.00');
    expect(formatChange(null, 'USD')).toBe('—');
  });
});

describe('formatPercent', () => {
  it('uses the currency locale', () => {
    expect(formatPercent(1.2893, 'IDR')).toBe('+1,29%');
    expect(formatPercent(-2, 'USD')).toBe(`${MINUS}2.00%`);
    expect(formatPercent(0, 'IDR')).toBe('0,00%');
    expect(formatPercent(null, 'USD')).toBe('—');
  });
});

describe('formatVolume', () => {
  it('uses the currency locale, whole numbers', () => {
    expect(formatVolume(133232200, 'IDR')).toBe('133.232.200');
    expect(formatVolume(1234567, 'USD')).toBe('1,234,567');
    expect(formatVolume(null, 'IDR')).toBe('—');
  });
});
