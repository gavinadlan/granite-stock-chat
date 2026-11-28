import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { HistoryResponse } from '@stockai/shared';
import type { Prediction, StockPrice, TechnicalAnalysis } from '@/services/stockMarketAPI';
import { NewsCard } from './NewsCard';
import { PredictionCard } from './PredictionCard';
import { StockCard } from './StockCard';

const getHistory = vi.hoisted(() => vi.fn<() => Promise<HistoryResponse>>());
vi.mock('@/services/stockMarketAPI', () => ({ stockMarketAPI: { getHistory } }));
import { TechnicalAnalysisCard } from './TechnicalAnalysisCard';

// Round fixture values: test data only, never shown in the app.
const asOf = '2026-01-02T03:04:00Z';

const price: StockPrice = {
  symbol: 'BBCA.JK', name: 'Test Bank', price: 1000, change: -10, changePercent: -1, volume: null, marketCap: null,
  currency: 'IDR', exchange: 'JKT', source: 'Yahoo Finance', asOf, lastUpdated: asOf, delayed: true,
};

const ta: TechnicalAnalysis = {
  symbol: 'BBCA.JK', currency: 'IDR', rsi: 70, macd: { macd: 1, signal: null, histogram: null },
  movingAverages: { sma20: 1000, sma50: null, sma200: null }, support: 900, resistance: 1100, trend: 'neutral',
  signals: [{ id: 'a', severity: 'bearish', label: 'RSI 70.0 is above 70 (overbought)' }],
  warnings: ['SMA200 unavailable'], method: 'RSI(14, Wilder)', source: 'Yahoo Finance (daily candles)', asOf, lastUpdated: asOf,
};

const prediction: Prediction = {
  symbol: 'MSFT', currentPrice: 100, currency: 'USD', timeframe: '1w', reasoning: 'Factors', risks: null,
  source: 'Yahoo Finance + granite', asOf, lastUpdated: asOf,
};

const expectProvenance = (source: string) => {
  expect(screen.getByText(new RegExp(`Source: ${source.replace(/[()+]/g, '\\$&')}`))).toBeInTheDocument();
  expect(document.querySelector('time')).toHaveAttribute('datetime', asOf);
};

const renderCard = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);
const closes = (values: number[]): HistoryResponse => ({
  data: {
    symbol: 'BBCA.JK', currency: 'IDR', exchangeTimezone: 'Asia/Jakarta', range: '1mo', interval: '1d',
    candles: values.map((c, i) => ({ t: i, o: c, h: c, l: c, c, v: null })),
  },
  meta: { source: 'Yahoo Finance', asOf, warnings: [] },
});

describe('StockCard', () => {
  beforeEach(() => {
    getHistory.mockReset().mockRejectedValue(new Error('offline'));
  });

  it('shows exchange, currency, change, provenance and honest blanks', () => {
    renderCard(<StockCard stockPrice={price} />);
    expect(screen.getByText('Test Bank · IDX · IDR')).toBeInTheDocument();
    expect(screen.getByText('Rp1.000')).toBeInTheDocument();
    expect(screen.getByText('−Rp10 (−1,00%)')).toHaveClass('text-down');
    expect(screen.getByText('Delayed')).toBeInTheDocument();
    expect(screen.getByText('Market cap').nextSibling).toHaveTextContent('—');
    expect(screen.getByText('Volume').nextSibling).toHaveTextContent('—');
    expectProvenance('Yahoo Finance');
  });

  it('shows unknown exchange codes unchanged', () => {
    renderCard(<StockCard stockPrice={{ ...price, exchange: 'XYZ', name: null, delayed: false }} />);
    expect(screen.getByText('XYZ · IDR')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('links the chat card to the detail page and draws a neutral 1M sparkline', async () => {
    getHistory.mockResolvedValue(closes([10, 12, 11]));
    const { container } = renderCard(<StockCard stockPrice={price} />);
    expect(screen.getByRole('link', { name: 'BBCA.JK, open chart' })).toHaveAttribute('href', '/stock/BBCA.JK');
    expect(await screen.findByText('1M')).toBeInTheDocument();
    expect(getHistory).toHaveBeenCalledWith('BBCA.JK', '1mo', '1d');
    const spark = container.querySelector('svg path')?.closest('[aria-hidden="true"]');
    expect(spark).toHaveClass('text-muted-foreground');
  });

  it('encodes index symbols in the link', () => {
    renderCard(<StockCard stockPrice={{ ...price, symbol: '^JKSE' }} />);
    expect(screen.getByRole('link', { name: '^JKSE, open chart' })).toHaveAttribute('href', '/stock/%5EJKSE');
  });

  it('shows an index in points, without a currency symbol', () => {
    renderCard(<StockCard stockPrice={{ ...price, symbol: '^JKSE', previousClose: 1010 }} variant="compact" />);
    expect(screen.getByText('1.000,00')).toBeInTheDocument();
    expect(screen.getByText('\u221210,00 (\u22121,00%)')).toHaveClass('text-down');
    expect(screen.getByText('Previous close').nextSibling).toHaveTextContent('1.010,00');
    expect(screen.queryByText(/Rp/)).not.toBeInTheDocument();
  });

  it('keeps the card without a sparkline when history fails', async () => {
    renderCard(<StockCard stockPrice={price} />);
    await vi.waitFor(() => expect(getHistory).toHaveBeenCalled());
    expect(screen.queryByText('1M')).not.toBeInTheDocument();
    expect(screen.getByText('Rp1.000')).toBeInTheDocument();
  });

  it('has no link or sparkline in the compact and detail variants', () => {
    renderCard(<StockCard stockPrice={price} variant="compact" />);
    renderCard(<StockCard stockPrice={price} variant="detail" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(getHistory).not.toHaveBeenCalled();
  });
});

describe('TechnicalAnalysisCard', () => {
  it('shows the RSI meter with the backend zone', () => {
    render(<TechnicalAnalysisCard technicalAnalysis={ta} />);
    const meter = screen.getByRole('meter', { name: 'RSI (14)' });
    expect(meter).toHaveAttribute('aria-valuenow', '70');
    expect(meter).toHaveAttribute('aria-valuetext', 'RSI 70 out of 100, overbought zone');
    expect(screen.getByText('70,0 · Overbought')).toBeInTheDocument();
  });

  it('shows signals, warnings, method, provenance and disclaimer', () => {
    render(<TechnicalAnalysisCard technicalAnalysis={ta} />);
    expect(screen.getByText(/is above 70/)).toBeInTheDocument();
    expect(screen.getByText('SMA200 unavailable')).toBeInTheDocument();
    expect(screen.getByText('Method: RSI(14, Wilder)')).toBeInTheDocument();
    expect(screen.getByText(/bukan nasihat keuangan/i)).toBeInTheDocument();
    expectProvenance('Yahoo Finance (daily candles)');
  });

  it('shows a dash and no meter without RSI data', () => {
    render(<TechnicalAnalysisCard technicalAnalysis={{ ...ta, rsi: null }} />);
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
    expect(screen.getByText('RSI (14)').nextSibling).toHaveTextContent('—');
  });
});

describe('PredictionCard', () => {
  it('is labelled as AI and shows provenance and disclaimer', () => {
    render(<PredictionCard prediction={prediction} />);
    expect(screen.getByText('AI explanation')).toBeInTheDocument();
    expect(screen.getByText('Current price (market data)').nextSibling).toHaveTextContent('$100.00');
    expect(screen.getByText(/bukan nasihat keuangan/i)).toBeInTheDocument();
    expectProvenance('Yahoo Finance + granite');
  });
});

describe('NewsCard', () => {
  const item = { id: '1', title: 'Headline', description: '', url: 'https://example.com/a', publishedAt: asOf, source: 'Example' };

  it('links out safely', () => {
    render(<NewsCard newsItem={item} />);
    const link = screen.getByRole('link', { name: /Headline/ });
    expect(link).toHaveAttribute('href', 'https://example.com/a');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('never links to non-http URLs and shows no time when the date is invalid', () => {
    render(<NewsCard newsItem={{ ...item, url: 'javascript:alert(1)', publishedAt: '' }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(document.querySelector('time')).toBeNull();
  });
});
