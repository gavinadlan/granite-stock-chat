import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('keeps custom font sizes next to text colors', () => {
    expect(cn('text-title', 'text-muted-foreground')).toBe('text-title text-muted-foreground');
  });

  it('lets later custom sizes and radii override built-in ones', () => {
    expect(cn('text-sm rounded-lg', 'text-heading rounded-card')).toBe('text-heading rounded-card');
  });
});
