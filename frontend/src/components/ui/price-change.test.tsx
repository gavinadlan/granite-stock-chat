import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceChange } from './price-change';

describe('PriceChange', () => {
  it.each([
    { name: 'gain', change: 1.5, pct: 2, text: '+$1.50 (+2.00%)', cls: 'text-up' },
    { name: 'loss', change: -1.5, pct: -2, text: '\u2212$1.50 (\u22122.00%)', cls: 'text-down' },
    { name: 'flat', change: 0, pct: 0, text: '$0.00 (0.00%)', cls: 'text-muted-foreground' },
    { name: 'unknown', change: null, pct: null, text: '—', cls: 'text-muted-foreground' },
    { name: 'percent only', change: null, pct: -3, text: '\u22123.00%', cls: 'text-down' },
    { name: 'amount only', change: 2, pct: null, text: '+$2.00', cls: 'text-up' },
  ])('renders $name', ({ change, pct, text, cls }) => {
    render(<PriceChange change={change} changePercent={pct} currency="USD" />);
    const el = screen.getByText(text);
    expect(el).toHaveClass(cls, 'tabular-nums');
  });

  it('uses the currency of the stock', () => {
    render(<PriceChange change={-50} changePercent={null} currency="IDR" />);
    expect(screen.getByText('\u2212Rp50.00')).toBeInTheDocument();
  });
});
