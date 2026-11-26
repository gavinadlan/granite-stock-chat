import { describe, expect, it } from 'vitest';
import { indicatorSource, isAccountQuestion, parseTicker, tickerLabel } from './landing';

describe('tickerLabel', () => {
  it.each([
    ['^JKSE', 'IHSG'],
    ['BBCA.JK', 'BBCA'],
    ['NVDA', 'NVDA'],
  ])('%s -> %s', (s, label) => expect(tickerLabel(s)).toBe(label));
});

describe('parseTicker', () => {
  it.each([
    ['aapl', 'AAPL'],
    [' tlkm ', 'TLKM.JK'],
    ['bbca.jk', 'BBCA.JK'],
    ['^jkse', '^JKSE'],
    ['NVDA?', 'NVDA'],
    ['Technical analysis BBCA.JK', 'BBCA.JK'],
    ["What's the price of AAPL?", 'AAPL'],
  ])('%s -> %s', (input, symbol) => expect(parseTicker(input)).toBe(symbol));

  it.each(['', 'what should I buy', 'technical analysis bbca', '12345'])('rejects %j', (input) => {
    expect(parseTicker(input)).toBeNull();
  });
});

describe('isAccountQuestion', () => {
  it('flags news and outlook questions only', () => {
    expect(isAccountQuestion('News about TSLA')).toBe(true);
    expect(isAccountQuestion('Outlook for MSFT')).toBe(true);
    expect(isAccountQuestion('berita BBCA')).toBe(true);
    expect(isAccountQuestion('AAPL')).toBe(false);
  });
});

describe('indicatorSource', () => {
  it('adds the session count when known', () => {
    expect(indicatorSource('Yahoo Finance (daily candles)', 240)).toBe('Yahoo Finance daily candles (240 sessions)');
    expect(indicatorSource('Yahoo Finance (daily candles)', null)).toBe('Yahoo Finance daily candles');
  });
});
