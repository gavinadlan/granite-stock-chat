import { describe, expect, it } from 'vitest';
import mod from '../functions/ai-prediction.js';

describe('parseAnswer', () => {
  it('parses a well-formed answer', () => {
    const p = mod._parseAnswer('PREDICTED_PRICE: $1,234.50\nCONFIDENCE: 62%\nREASONING: Earnings next week.');
    expect(p).toEqual({ predicted: 1234.5, confidence: 62, reasoning: 'Earnings next week.' });
  });
  it('returns nulls instead of inventing values', () => {
    expect(mod._parseAnswer('I cannot predict prices.')).toEqual({ predicted: null, confidence: null, reasoning: null });
  });
});
