import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Prediction, StockPrice, TechnicalAnalysis } from '@/services/stockMarketAPI';
import { NewsCard } from './NewsCard';
import { PredictionCard } from './PredictionCard';
import { StockCard } from './StockCard';
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

describe('StockCard', () => {
  it('shows exchange, currency, change, provenance and honest blanks', () => {
    render(<StockCard stockPrice={price} />);
    expect(screen.getByText('Test Bank · IDX · IDR')).toBeInTheDocument();
    expect(screen.getByText('Rp1.000')).toBeInTheDocument();
    expect(screen.getByText('−Rp10 (−1,00%)')).toHaveClass('text-down');
    expect(screen.getByText('Delayed')).toBeInTheDocument();
    expect(screen.getByText('Market cap').nextSibling).toHaveTextContent('—');
    expect(screen.getByText('Volume').nextSibling).toHaveTextContent('—');
    expectProvenance('Yahoo Finance');
  });

  it('shows unknown exchange codes unchanged', () => {
    render(<StockCard stockPrice={{ ...price, exchange: 'XYZ', name: null, delayed: false }} />);
    expect(screen.getByText('XYZ · IDR')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});

describe('TechnicalAnalysisCard', () => {
  it('shows the RSI meter with the backend zone', () => {
    render(<TechnicalAnalysisCard technicalAnalysis={ta} />);
    const meter = screen.getByRole('meter', { name: 'RSI (14)' });
    expect(meter).toHaveAttribute('aria-valuenow', '70');
    expect(meter).toHaveAttribute('aria-valuetext', '70.0, overbought');
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
