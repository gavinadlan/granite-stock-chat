import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { HistoryResponse } from '@stockai/shared';
import { ApiError } from '@/services/apiClient';

// jsdom has no canvas: replace the chart library with a recorder.
const chartApi = vi.hoisted(() => {
  const series = () => ({ setData: vi.fn(), applyOptions: vi.fn(), priceScale: () => ({ applyOptions: vi.fn() }) });
  return {
    createChart: vi.fn(() => ({
      addSeries: vi.fn(series),
      applyOptions: vi.fn(),
      priceScale: () => ({ applyOptions: vi.fn() }),
      timeScale: () => ({ fitContent: vi.fn() }),
      subscribeCrosshairMove: vi.fn(),
      unsubscribeCrosshairMove: vi.fn(),
      remove: vi.fn(),
    })),
  };
});
vi.mock('lightweight-charts', () => ({
  createChart: chartApi.createChart,
  CandlestickSeries: 'Candlestick',
  HistogramSeries: 'Histogram',
  ColorType: { Solid: 'solid' },
  TickMarkType: { Year: 0, Month: 1, DayOfMonth: 2, Time: 3, TimeWithSeconds: 4 },
}));

const getHistory = vi.hoisted(() => vi.fn());
vi.mock('@/services/stockMarketAPI', () => ({ stockMarketAPI: { getHistory } }));

import { PriceChart } from './PriceChart';

// Test data only. 2026-11-27 09:00 UTC = 16:00 WIB.
const T = Date.UTC(2026, 10, 27, 9) / 1000;
const history = (warnings: string[] = []): HistoryResponse => ({
  data: {
    symbol: 'BBCA.JK', currency: 'IDR', exchangeTimezone: 'Asia/Jakarta', range: '6mo', interval: '1d',
    candles: [
      { t: T - 86400, o: 100, h: 110, l: 90, c: 105, v: 10 },
      { t: T, o: 105, h: 120, l: 95, c: 118, v: 20 },
    ],
  },
  meta: { source: 'Yahoo Finance', asOf: new Date(T * 1000).toISOString(), delayed: true, warnings },
});

beforeEach(() => {
  getHistory.mockReset().mockResolvedValue(history());
  chartApi.createChart.mockClear();
});

describe('PriceChart', () => {
  it('loads 6M by default and requests the agreed pair for each range', async () => {
    render(<PriceChart symbol="BBCA.JK" />);
    expect(getHistory).toHaveBeenLastCalledWith('BBCA.JK', '6mo', '1d');
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => (r as HTMLInputElement).value)).toEqual(['1D', '5D', '1M', '6M', '1Y', '5Y']);
    expect(screen.getByRole('radio', { name: '6M' })).toBeChecked();

    const expected: Record<string, [string, string]> = {
      '1D': ['1d', '5m'], '5D': ['5d', '15m'], '1M': ['1mo', '1d'], '1Y': ['1y', '1d'], '5Y': ['5y', '1wk'],
    };
    for (const [label, [range, interval]] of Object.entries(expected)) {
      fireEvent.click(screen.getByRole('radio', { name: label }));
      expect(getHistory).toHaveBeenLastCalledWith('BBCA.JK', range, interval);
    }
    expect(chartApi.createChart).toHaveBeenCalledTimes(1);
  });

  it('describes the data in the image label and shows warnings and the data table', async () => {
    getHistory.mockResolvedValue(history(['Downsampled 5540 candles to 1847']));
    render(<PriceChart symbol="BBCA.JK" />);
    expect(await screen.findByRole('img', { name: 'BBCA.JK price chart, 6M: from Rp100 to Rp118, high Rp120, low Rp90, 2 candles' })).toBeInTheDocument();
    expect(screen.getByText('Downsampled 5540 candles to 1847')).toBeInTheDocument();
    expect(screen.getByText('Show data table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('shows an index in points in the legend, table and label', async () => {
    const h = history();
    getHistory.mockResolvedValue({ ...h, data: { ...h.data, symbol: '^JKSE' } });
    render(<PriceChart symbol="^JKSE" />);
    expect(await screen.findByRole('img', { name: '^JKSE price chart, 6M: from 100,00 to 118,00, high 120,00, low 90,00, 2 candles' })).toBeInTheDocument();
    expect(screen.getByText('C').nextSibling).toHaveTextContent('118,00');
    expect(screen.queryByText(/Rp/)).not.toBeInTheDocument();
  });

  it('dates daily candles without an open time, and keeps the time for intraday bars', async () => {
    const h = history();
    getHistory.mockResolvedValueOnce(h).mockResolvedValueOnce({ ...h, data: { ...h.data, range: '1d', interval: '5m' } });
    render(<PriceChart symbol="BBCA.JK" />);
    expect(await screen.findByText('Source: Yahoo Finance, delayed · Nov 27, 2026 · daily candles')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '1D' }));
    expect(await screen.findByText('Source: Yahoo Finance, delayed · Nov 27, 2026, 16:00 WIB')).toBeInTheDocument();
  });

  it('names the session of the last candle for 1D', async () => {
    render(<PriceChart symbol="BBCA.JK" />);
    fireEvent.click(screen.getByRole('radio', { name: '1D' }));
    expect(await screen.findByText('Session of Fri, Nov 27 · WIB')).toBeInTheDocument();
  });

  it('shows an honest error with a working retry', async () => {
    getHistory.mockRejectedValueOnce(new ApiError('Network error. Check your connection.', 'NETWORK', 0));
    render(<PriceChart symbol="AAPL" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Price history is unavailable right now. Network error.');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(getHistory).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole('img', { name: /from Rp100 to Rp118/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
