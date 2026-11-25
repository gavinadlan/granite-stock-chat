import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { StockPrice } from '@/services/stockMarketAPI';

const getStockPrice = vi.hoisted(() => vi.fn<(symbol: string) => Promise<StockPrice>>());
const auth = vi.hoisted(() => ({ isAuthenticated: false, isLoading: false, user: null, logout: () => {} }));
vi.mock('@/services/stockMarketAPI', () => ({ stockMarketAPI: { getStockPrice } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));

import HomePage from './HomePage';

// Test data only: production code has no example prices.
const asOf = '2026-01-02T03:04:00Z';
const price: StockPrice = {
  symbol: 'BBCA.JK', name: 'Test Bank', price: 1000, change: 10, changePercent: 1, volume: null, marketCap: null,
  currency: 'IDR', exchange: 'JKT', source: 'Yahoo Finance', asOf, lastUpdated: asOf, delayed: true,
};

const renderHome = () => render(<HomePage />, { wrapper: MemoryRouter });

beforeEach(() => {
  auth.isAuthenticated = false;
  getStockPrice.mockReset().mockResolvedValue(price);
});

describe('hero demo', () => {
  it('shows a skeleton, then the live quote with source, time and delayed label', async () => {
    renderHome();
    expect(screen.getByText('Fetching data…')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: 'BBCA.JK price' })).toHaveTextContent('Source: Yahoo Finance');
    expect(screen.getByText('Delayed')).toBeInTheDocument();
    expect(document.querySelector(`time[datetime="${asOf}"]`)).not.toBeNull();
    expect(getStockPrice).toHaveBeenCalledWith('BBCA.JK');
  });

  it('shows an honest empty state without any price, and can retry', async () => {
    getStockPrice.mockRejectedValueOnce(new Error('down'));
    renderHome();
    expect(await screen.findByText('Live data unavailable right now.')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/(Rp|\$)\s?\d/);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('article', { name: 'BBCA.JK price' })).toBeInTheDocument();
  });
});

describe('HomePage', () => {
  it('has the disclaimer in both languages', async () => {
    renderHome();
    await screen.findByRole('article');
    expect(screen.getAllByText(/not financial advice/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bukan nasihat keuangan/i).length).toBeGreaterThan(0);
  });

  it('makes none of the removed or unprovable claims', async () => {
    renderHome();
    await screen.findByRole('article');
    expect(document.body.textContent).not.toMatch(
      /thousands|no registration|bollinger|powerful|cutting-edge|comprehensive|advanced|professional|real-time|alpha vantage|free to use|secure|reliable|guarantee/i,
    );
  });

  it('keeps headings in order', async () => {
    renderHome();
    await screen.findByRole('article');
    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => expect(level - levels[i]).toBeLessThanOrEqual(1));
  });

  it('sends signed-in users to the chat', async () => {
    auth.isAuthenticated = true;
    renderHome();
    await screen.findByRole('article');
    for (const link of screen.getAllByRole('link', { name: 'Open chat' })) expect(link).toHaveAttribute('href', '/chat');
    expect(screen.queryByRole('link', { name: 'Create an account' })).not.toBeInTheDocument();
  });
});
