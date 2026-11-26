import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RsiMeter } from './RsiMeter';

const meter = () => screen.getByRole('meter', { name: 'RSI (14)' });

describe('RsiMeter', () => {
  it('shows one decimal in the currency locale, compact and full', () => {
    const { rerender } = render(<RsiMeter rsi={61.98} currency="IDR" compact />);
    expect(screen.getByText('62,0')).toBeInTheDocument();
    rerender(<RsiMeter rsi={61.98} currency="USD" />);
    expect(screen.getByText('62.0 · Neutral')).toBeInTheDocument();
  });

  it.each([
    [61.98, 'RSI 62 out of 100, neutral zone'],
    [75, 'RSI 75 out of 100, overbought zone'],
    [69.5, 'RSI 70 out of 100, overbought zone'],
    [30.4, 'RSI 30 out of 100, oversold zone'],
    [30.6, 'RSI 31 out of 100, neutral zone'],
    [25, 'RSI 25 out of 100, oversold zone'],
  ])('rsi %s reads as "%s"', (rsi, text) => {
    render(<RsiMeter rsi={rsi} currency="IDR" />);
    expect(meter()).toHaveAttribute('aria-valuetext', text);
  });
});
