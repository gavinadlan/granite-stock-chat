import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('aws-amplify/auth', () => ({ fetchAuthSession: vi.fn().mockResolvedValue({}) }));

// apiClient reads VITE_API_URL at import time, so pin it before importing (overrides any .env.local).
vi.stubEnv('VITE_API_URL', 'https://api.test');
const { stockMarketAPI } = await import('./stockMarketAPI');

describe('extractSymbol', () => {
  it.each([
    ["What's the price of AAPL?", 'AAPL'],
    ['Can I see RSI for MSFT', 'MSFT'],
    ['Technical analysis BBCA.JK', 'BBCA.JK'],
    ['harga BRK-B hari ini', 'BRK-B'],
  ])('%s -> %s', (msg, symbol) => {
    expect(stockMarketAPI.extractSymbol(msg)).toBe(symbol);
  });

  it('returns null when there is no ticker', () => {
    expect(stockMarketAPI.extractSymbol('what should I buy?')).toBeNull();
  });
});

describe('processMessage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an honest error with retry info when the API fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network'));
    vi.stubGlobal('fetch', fetchMock);
    const reply = await stockMarketAPI.processMessage('price of AAPL');
    expect(reply.error?.retryText).toBe('price of AAPL');
    expect(reply.data).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\/api\.test\//), expect.anything());
  });
});
