import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';
import { LogoMark } from './LogoMark';

describe('LogoMark', () => {
  it('is an image named StockAI', () => {
    render(<LogoMark />);
    expect(screen.getByRole('img', { name: 'StockAI' })).toBeInTheDocument();
  });

  it('uses its own mask when rendered more than once', () => {
    const { container } = render(<><LogoMark /><LogoMark /></>);
    const ids = [...container.querySelectorAll('mask')].map((m) => m.id);
    const refs = [...container.querySelectorAll('path')].map((p) => p.getAttribute('mask'));
    expect(new Set(ids).size).toBe(2);
    expect(refs).toEqual(ids.map((id) => `url(#${id})`));
  });
});

describe('Logo', () => {
  it('exposes one image and hides its parts', () => {
    const { container } = render(<Logo />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img')).toHaveAccessibleName('StockAI');
    for (const svg of container.querySelectorAll('svg')) expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws the wordmark as a path, not text', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('text')).toBeNull();
  });
});
