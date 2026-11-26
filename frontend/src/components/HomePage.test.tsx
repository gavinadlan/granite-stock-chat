import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { StockPrice, TechnicalAnalysis } from '@/services/stockMarketAPI';

const getStockPrice = vi.hoisted(() => vi.fn<(symbol: string) => Promise<StockPrice>>());
const getTechnicalAnalysis = vi.hoisted(() => vi.fn<(symbol: string) => Promise<TechnicalAnalysis>>());
const auth = vi.hoisted(() => ({ isAuthenticated: false, isLoading: false, user: null, logout: () => {} }));
vi.mock('@/services/stockMarketAPI', async (importActual) => {
  const actual = await importActual<typeof import('@/services/stockMarketAPI')>();
  return {
    stockMarketAPI: {
      getStockPrice,
      getTechnicalAnalysis,
      extractSymbol: actual.stockMarketAPI.extractSymbol.bind(actual.stockMarketAPI),
    },
  };
});
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));

import HomePage from './HomePage';

// Test data only: production code has no example prices.
const asOf = '2026-01-02T03:04:00Z';
const quote = (symbol: string, over: Partial<StockPrice> = {}): StockPrice => ({
  symbol, name: 'Test Co', price: 1000, change: 10, changePercent: 1, previousClose: 990, volume: 1234567, marketCap: null,
  currency: symbol.endsWith('.JK') || symbol === '^JKSE' ? 'IDR' : 'USD', exchange: 'JKT', source: 'Yahoo Finance',
  asOf, lastUpdated: asOf, delayed: true, ...over,
});
const technicals = (symbol: string): TechnicalAnalysis => ({
  symbol, currency: 'IDR', rsi: 61.98, macd: { macd: 1, signal: 2, histogram: null },
  movingAverages: { sma20: 900, sma50: 1100, sma200: 1200 }, support: 800, resistance: 1100, trend: 'neutral',
  signals: [], warnings: [], candlesUsed: 240, source: 'Yahoo Finance (daily candles)', asOf, lastUpdated: asOf,
});

const renderHome = () => render(<HomePage />, { wrapper: MemoryRouter });
const panel = () => screen.getByText('Live answer, loaded when you opened this page').parentElement as HTMLElement;
const ask = (text: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Ask about a stock' }), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
};

beforeEach(() => {
  auth.isAuthenticated = false;
  getStockPrice.mockReset().mockImplementation(async (s) => quote(s));
  getTechnicalAnalysis.mockReset().mockImplementation(async (s) => technicals(s));
});

describe('ticker strip', () => {
  it('shows every symbol that loaded, IHSG first, with a delayed note', async () => {
    getStockPrice.mockImplementation(async (s) => {
      if (s === 'TSLA') throw new Error('down');
      return quote(s);
    });
    renderHome();
    const strip = await screen.findByRole('region', { name: 'Market quotes' });
    const items = within(strip).getAllByRole('listitem').map((li) => li.textContent);
    expect(items[0]).toMatch(/^IHSG 1\.000 \+1,00%$/);
    expect(items).toHaveLength(8);
    expect(strip).not.toHaveTextContent('TSLA');
    expect(strip).toHaveTextContent(/Delayed, Yahoo Finance, 10:04 WIB/);
  });

  it('is hidden when every quote fails', async () => {
    getStockPrice.mockRejectedValue(new Error('down'));
    getTechnicalAnalysis.mockRejectedValue(new Error('down'));
    renderHome();
    expect(await screen.findByText('Live data unavailable right now.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Market quotes' })).not.toBeInTheDocument();
  });
});

describe('answer panel', () => {
  it('loads BBCA.JK with a code-written summary, both cards and the source line', async () => {
    renderHome();
    expect(screen.getByText('Fetching data…')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: 'BBCA.JK price' })).toHaveTextContent('Previous close');
    expect(screen.getByRole('article', { name: 'BBCA.JK indicators' })).toHaveTextContent('61,98');
    expect(screen.getByText(/BBCA\.JK is trading at Rp1\.000, up 1,00% today\. RSI is 62/)).toBeInTheDocument();
    expect(screen.getByText(/Yahoo Finance daily candles \(240 sessions\), calculated by StockAI/)).toHaveTextContent(
      'Not financial advice.',
    );
    expect(getTechnicalAnalysis).toHaveBeenCalledWith('BBCA.JK');
  });

  it('answers a typed ticker and updates the question bubble', async () => {
    renderHome();
    await screen.findByRole('article', { name: 'BBCA.JK price' });
    ask('nvda');
    expect(await screen.findByRole('article', { name: 'NVDA price' })).toBeInTheDocument();
    expect(within(panel()).getByText('nvda')).toBeInTheDocument();
    expect(getStockPrice).toHaveBeenCalledWith('NVDA');
  });

  it('shows the part that loaded when the other request fails', async () => {
    getTechnicalAnalysis.mockRejectedValue(new Error('down'));
    renderHome();
    expect(await screen.findByRole('article', { name: 'BBCA.JK price' })).toBeInTheDocument();
    expect(screen.getByText('Indicators unavailable right now.')).toBeInTheDocument();
  });

  it('says so honestly when everything fails, and can retry', async () => {
    getStockPrice.mockRejectedValue(new Error('down'));
    getTechnicalAnalysis.mockRejectedValueOnce(new Error('down'));
    renderHome();
    expect(await screen.findByText('Live data unavailable right now.')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/(Rp|\$)\s?\d/);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('article', { name: 'BBCA.JK indicators' })).toBeInTheDocument();
  });

  it('rejects input that is not a ticker, and sends news questions to sign up', async () => {
    renderHome();
    await screen.findByRole('article', { name: 'BBCA.JK price' });
    ask('what should I buy');
    expect(await screen.findByText(/does not look like a ticker/)).toBeInTheDocument();
    ask('News about TSLA');
    expect(await screen.findByText(/News and AI explanations need a free account/)).toBeInTheDocument();
    expect(within(panel()).getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register');
    expect(getTechnicalAnalysis).not.toHaveBeenCalledWith('TSLA');
  });

  it('announces answers politely', () => {
    renderHome();
    expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();
  });
});

describe('HomePage', () => {
  it('has the disclaimer in both languages', async () => {
    renderHome();
    await screen.findByRole('article', { name: 'BBCA.JK price' });
    expect(screen.getAllByText(/not financial advice/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bukan nasihat keuangan/i).length).toBeGreaterThan(0);
  });

  it('makes none of the removed or unprovable claims', async () => {
    renderHome();
    await screen.findByRole('article', { name: 'BBCA.JK price' });
    expect(document.body.textContent).not.toMatch(
      /thousands|no registration|bollinger|powerful|cutting-edge|comprehensive|advanced|professional|real-time|alpha vantage|free to use|secure|reliable|guarantee/i,
    );
  });

  it('keeps headings in order', async () => {
    renderHome();
    await screen.findByRole('article', { name: 'BBCA.JK price' });
    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => expect(level - levels[i]).toBeLessThanOrEqual(1));
  });

  it('sends visitors to sign up from the question chips and the CTA', async () => {
    renderHome();
    await screen.findByRole('article', { name: 'BBCA.JK price' });
    expect(screen.getByRole('link', { name: 'Outlook for MSFT' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Create a free account' })).toHaveAttribute('href', '/register');
  });

  it('sends signed-in users to the chat with the question filled in', async () => {
    auth.isAuthenticated = true;
    renderHome();
    await screen.findByRole('article', { name: 'BBCA.JK price' });
    expect(screen.getByRole('link', { name: 'Technical analysis BBCA.JK' })).toHaveAttribute(
      'href',
      '/chat?q=Technical%20analysis%20BBCA.JK',
    );
    for (const link of screen.getAllByRole('link', { name: 'Open chat' })) expect(link).toHaveAttribute('href', '/chat');
    expect(screen.queryByRole('link', { name: 'Create a free account' })).not.toBeInTheDocument();
  });
});
