import { describe, expect, it } from 'vitest';
import { detectCurrency, formatChange, formatNumber, formatPercent, formatPrice, formatVolume, priceDecimals } from './currencyUtils';

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
  it('indices: points with 2 decimals in the currency locale, no currency symbol', () => {
    expect(formatPrice(5338.456, 'IDR', '^JKSE')).toBe('5.338,46');
    expect(formatPrice(6012.3, 'USD', '^GSPC')).toBe('6,012.30');
    expect(formatPrice(5338.456, 'IDR', 'BBCA.JK')).toBe('Rp5.338');
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
  it('indices: signed points without currency', () => {
    expect(formatChange(28.07, 'IDR', '^JKSE')).toBe('+28,07');
    expect(formatChange(-12.5, 'USD', '^GSPC')).toBe(`${MINUS}12.50`);
    expect(formatChange(0.001, 'IDR', '^JKSE')).toBe('0,00');
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

describe('formatNumber', () => {
  it('keeps exactly the requested decimals in the currency locale', () => {
    expect(formatNumber(5412.75, 'IDR', 0)).toBe('5.413');
    expect(formatNumber(89.7, 'IDR', 2)).toBe('89,70');
    expect(formatNumber(5233.143, 'IDR', 2)).toBe('5.233,14');
    expect(formatNumber(149.3, 'USD')).toBe('149.30');
    expect(formatNumber(null, 'USD')).toBe('—');
  });
  it('uses the U+2212 minus and no sign for values that round to zero', () => {
    expect(formatNumber(-3.5, 'USD')).toBe('\u22123.50');
    expect(formatNumber(-12.345, 'IDR', 2)).toBe('\u221212,35');
    expect(formatNumber(-0.001, 'USD')).toBe('0.00');
    expect(formatPrice(-0.001, 'USD')).toBe('$0.00');
    expect(formatPercent(-0.004, 'IDR')).toBe('0,00%');
  });
});

describe('priceDecimals', () => {
  it('whole rupiah for IDR stocks, 2 for indices and other currencies', () => {
    expect(priceDecimals('IDR', 'BBCA.JK')).toBe(0);
    expect(priceDecimals('IDR', '^JKSE')).toBe(2);
    expect(priceDecimals('USD', 'NVDA')).toBe(2);
  });
});
