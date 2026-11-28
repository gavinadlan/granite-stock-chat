import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ApiError } from '@/services/apiClient';
import type { StockPrice } from '@/services/stockMarketAPI';

const api = vi.hoisted(() => ({
  getStockPrice: vi.fn(),
  getTechnicalAnalysis: vi.fn(),
  getMarketNews: vi.fn(),
  getHistory: vi.fn(),
}));
vi.mock('@/services/stockMarketAPI', () => ({ stockMarketAPI: api }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: false, isLoading: false }) }));
vi.mock('@/components/PriceChart', () => ({ default: ({ symbol }: { symbol: string }) => <div>chart {symbol}</div> }));

import StockDetail from './StockDetail';

// Test data only.
const quote = (symbol: string): StockPrice => ({
  symbol, name: 'Test Co', price: 100, change: 1, changePercent: 1, volume: 5, marketCap: null, currency: 'USD',
  source: 'Yahoo Finance', asOf: '2026-11-27T09:00:00Z', lastUpdated: '2026-11-27T09:00:00Z', delayed: true,
});

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/stock/:symbol" element={<><StockDetail /><Where /></>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  api.getStockPrice.mockReset().mockImplementation(async (s: string) => quote(s));
  api.getTechnicalAnalysis.mockReset().mockRejectedValue(new ApiError('Not enough history', 'PROVIDER_UNAVAILABLE', 503));
  api.getMarketNews.mockReset();
  api.getHistory.mockReset();
});

describe('StockDetail', () => {
  it('decodes ^JKSE from the URL and sets the title', async () => {
    renderAt('/stock/%5EJKSE');
    expect(await screen.findByText('chart ^JKSE')).toBeInTheDocument();
    expect(api.getStockPrice).toHaveBeenCalledWith('^JKSE');
    expect(document.title).toBe('^JKSE price chart · StockAI');
    expect(screen.getByTestId('where')).toHaveTextContent('/stock/%5EJKSE');
    expect(screen.getByRole('link', { name: 'Ask AI about this stock' })).toHaveAttribute('href', '/chat?q=Technical%20analysis%20%5EJKSE');
    // Index header in points: no "$" in front of the level or the change.
    expect(await screen.findAllByText('100.00')).not.toHaveLength(0);
    expect(screen.getAllByText('+1.00 (+1.00%)')).not.toHaveLength(0);
    expect(screen.queryByText(/\$100/)).not.toBeInTheDocument();
  });

  it('replaces a non-canonical URL: /stock/bbca → /stock/BBCA.JK', async () => {
    renderAt('/stock/bbca');
    expect(await screen.findByText('chart BBCA.JK')).toBeInTheDocument();
    expect(screen.getByTestId('where')).toHaveTextContent('/stock/BBCA.JK');
    expect(api.getStockPrice).toHaveBeenCalledTimes(1);
  });

  it('keeps BRK-B as is', async () => {
    renderAt('/stock/BRK-B');
    expect(await screen.findByText('chart BRK-B')).toBeInTheDocument();
    expect(api.getStockPrice).toHaveBeenCalledWith('BRK-B');
  });

  it('shows "Symbol not found" for an invalid symbol without calling the API', async () => {
    renderAt('/stock/AAPL%3BDROP');
    expect(screen.getByRole('heading', { name: 'Symbol not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
    expect(api.getStockPrice).not.toHaveBeenCalled();
    expect(document.title).toBe('Symbol not found · StockAI');
  });

  it('shows "Symbol not found" when the API answers 404', async () => {
    api.getStockPrice.mockRejectedValue(new ApiError('Symbol ZZZZQQ not found', 'NOT_FOUND', 404));
    renderAt('/stock/ZZZZQQ');
    expect(await screen.findByRole('heading', { name: 'Symbol not found' })).toBeInTheDocument();
    expect(screen.queryByText(/chart ZZZZQQ/)).not.toBeInTheDocument();
    expect(document.title).toBe('Symbol not found · StockAI');
  });

  it('shows technicals failure honestly and no sparkline on the detail card', async () => {
    renderAt('/stock/AAPL');
    expect(await screen.findByText(/Technical analysis is unavailable right now. Not enough history/)).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'AAPL price' })).toBeInTheDocument();
    expect(api.getHistory).not.toHaveBeenCalled();
  });
});
