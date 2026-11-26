import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { StockPrice } from '@/services/stockMarketAPI';

const getStockPrice = vi.hoisted(() => vi.fn<(symbol: string) => Promise<StockPrice>>());
vi.mock('@/services/stockMarketAPI', () => ({ stockMarketAPI: { getStockPrice } }));

import { TickerStrip } from './TickerStrip';

// Test data only.
const asOf = '2026-01-02T03:04:00Z';
const quote = (symbol: string): StockPrice => ({
  symbol, price: 100, change: 1, changePercent: 1, volume: null, marketCap: null, currency: 'USD',
  source: 'Yahoo Finance', asOf, lastUpdated: asOf, delayed: true,
});

const PAUSED = '[animation-play-state:paused]';
const originalMatchMedia = window.matchMedia;
const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() });
};

beforeEach(() => {
  sessionStorage.clear();
  setReducedMotion(false);
  getStockPrice.mockReset().mockImplementation(async (s) => quote(s));
});
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('TickerStrip', () => {
  it('renders the list twice, with only the first copy exposed to screen readers', async () => {
    render(<TickerStrip />);
    const strip = await screen.findByRole('region', { name: 'Market quotes' });
    const lists = strip.querySelectorAll('ul');
    expect(lists).toHaveLength(2);
    expect(lists[0]).not.toHaveAttribute('aria-hidden');
    expect(lists[1]).toHaveAttribute('aria-hidden', 'true');
    expect(within(strip).getAllByRole('listitem')).toHaveLength(9);
    expect(screen.getByTestId('ticker-track')).toHaveClass('animate-ticker');
  });

  it('pauses and plays with the button, and remembers it for the session', async () => {
    render(<TickerStrip />);
    const button = await screen.findByRole('button', { name: 'Pause ticker' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('ticker-track')).not.toHaveClass(PAUSED);

    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Play ticker' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('ticker-track')).toHaveClass(PAUSED);
    expect(sessionStorage.getItem('ticker_paused')).toBe('1');

    fireEvent.click(screen.getByRole('button', { name: 'Play ticker' }));
    expect(screen.getByTestId('ticker-track')).not.toHaveClass(PAUSED);
  });

  it('starts paused when the visitor paused it earlier in the session', async () => {
    sessionStorage.setItem('ticker_paused', '1');
    render(<TickerStrip />);
    expect(await screen.findByRole('button', { name: 'Play ticker' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('is a static, scrollable strip without a pause button under reduced motion', async () => {
    setReducedMotion(true);
    render(<TickerStrip />);
    const strip = await screen.findByRole('region', { name: 'Market quotes' });
    expect(strip).toHaveClass('overflow-x-auto');
    expect(strip.querySelectorAll('ul')).toHaveLength(1);
    expect(screen.queryByTestId('ticker-track')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps the delayed note outside the moving track', async () => {
    render(<TickerStrip />);
    const note = await screen.findByText(/Delayed, Yahoo Finance/);
    expect(screen.getByTestId('ticker-track')).not.toContainElement(note);
  });
});
