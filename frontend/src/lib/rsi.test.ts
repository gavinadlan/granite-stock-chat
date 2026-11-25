import { describe, expect, it } from 'vitest';
import { rsiPosition, rsiZone } from './rsi';

describe('rsiZone', () => {
  it.each([
    [0, 'oversold'],
    [30, 'oversold'],
    [30.1, 'neutral'],
    [50, 'neutral'],
    [69.9, 'neutral'],
    [70, 'overbought'],
    [100, 'overbought'],
  ])('%s is %s', (rsi, zone) => {
    expect(rsiZone(rsi)).toBe(zone);
  });
});

describe('rsiPosition', () => {
  it.each([
    [-5, 0],
    [45.2, 45.2],
    [120, 100],
  ])('clamps %s to %s', (rsi, pos) => {
    expect(rsiPosition(rsi)).toBe(pos);
  });
});
