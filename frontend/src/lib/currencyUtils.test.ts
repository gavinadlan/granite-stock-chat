import { describe, expect, it } from 'vitest';
import { detectCurrency, formatChange, formatPrice } from './currencyUtils';

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

describe('formatting', () => {
  it('formats price with the currency symbol', () => {
    expect(formatPrice(9875, 'IDR')).toBe('Rp9875.00');
    expect(formatPrice(1.5, 'USD')).toBe('$1.50');
  });
  it('signs changes', () => {
    expect(formatChange(2, 'USD')).toBe('+$2.00');
    expect(formatChange(-2, 'USD')).toBe('$-2.00');
  });
});
