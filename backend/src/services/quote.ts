import type { QuoteResponse } from '@stockai/shared';
import { getQuote } from '../providers/yahoo';

export async function quote(symbol: string): Promise<QuoteResponse> {
  const q = await getQuote(symbol);
  return { ...q, lastUpdated: q.asOf };
}
