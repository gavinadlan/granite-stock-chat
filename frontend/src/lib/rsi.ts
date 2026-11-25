export type RsiZone = 'oversold' | 'neutral' | 'overbought';

export const RSI_OVERSOLD = 30;
export const RSI_OVERBOUGHT = 70;

/** Same inclusive thresholds as the backend signals (backend/src/domain/indicators/index.ts). */
export function rsiZone(rsi: number): RsiZone {
  if (rsi >= RSI_OVERBOUGHT) return 'overbought';
  if (rsi <= RSI_OVERSOLD) return 'oversold';
  return 'neutral';
}

/** Marker position on the 0–100 scale. */
export function rsiPosition(rsi: number): number {
  return Math.max(0, Math.min(rsi, 100));
}
