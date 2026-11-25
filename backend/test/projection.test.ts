import { describe, expect, it } from 'vitest';
import { parseAnswer } from '../src/services/projection';

describe('parseAnswer', () => {
  it('parses factors and risks', () => {
    const p = parseAnswer('FACTORS: Earnings next week. Rates matter.\nRISKS: Guidance may disappoint.');
    expect(p).toEqual({ reasoning: 'Earnings next week. Rates matter.', risks: 'Guidance may disappoint.' });
  });
  it('returns nulls instead of inventing values', () => {
    expect(parseAnswer('I cannot help.')).toEqual({ reasoning: null, risks: null });
  });
  it('never exposes a price target or confidence', () => {
    const p = parseAnswer('PREDICTED_PRICE: $999\nCONFIDENCE: 99%\nFACTORS: x\nRISKS: y');
    expect(p).not.toHaveProperty('predicted');
    expect(p).not.toHaveProperty('confidence');
  });
});
