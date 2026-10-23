import { describe, expect, it } from 'vitest';
import mod from '../functions/ai-prediction.js';

describe('parseAnswer', () => {
  it('parses factors and risks', () => {
    const p = mod._parseAnswer('FACTORS: Earnings next week. Rates matter.\nRISKS: Guidance may disappoint.');
    expect(p).toEqual({ reasoning: 'Earnings next week. Rates matter.', risks: 'Guidance may disappoint.' });
  });
  it('returns nulls instead of inventing values', () => {
    expect(mod._parseAnswer('I cannot help.')).toEqual({ reasoning: null, risks: null });
  });
  it('never exposes a price target or confidence', () => {
    const p = mod._parseAnswer('PREDICTED_PRICE: $999\nCONFIDENCE: 99%\nFACTORS: x\nRISKS: y');
    expect(p).not.toHaveProperty('predicted');
    expect(p).not.toHaveProperty('confidence');
  });
});
