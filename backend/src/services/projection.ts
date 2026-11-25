// Qualitative outlook written by IBM Granite (via Replicate) on top of the real
// current price. The model is NOT asked for a price target or a confidence number:
// those would be invented figures (CLAUDE.md rule 4). S1-08 replaces this with a
// statistical projection computed from real data; the LLM only explains it.
import type { ProjectionResponse } from '@stockai/shared';
import { config } from '../lib/config';
import { HttpError, unavailable } from '../lib/http';
import type { Timeframe } from '../lib/validation';
import { runPrediction } from '../providers/replicate';
import { getQuote } from '../providers/yahoo';

// Lambda timeout is 28s. The quote fetch takes up to 5s, so the LLM budget is 18s
// which leaves headroom and lets us return a proper JSON error with CORS headers.
const DEADLINE_MS = 18000;
const TIMEFRAME_LABEL: Record<Timeframe, string> = { '1d': '1 day', '1w': '1 week', '1m': '1 month', '3m': '3 months' };

function buildPrompt(symbol: string, price: number, currency: string, timeframe: string): string {
  return `You are a cautious financial educator. The current price of ${symbol} is ${price} ${currency}.
Describe, for a beginner, the kinds of factors that could influence this stock over the next ${timeframe}.
Rules: do NOT give a price target, a percentage forecast, a probability or a buy/sell/hold recommendation. Do not invent news or numbers.

Reply in exactly this format and nothing else:
FACTORS: <two or three sentences about general factors that could matter>
RISKS: <one or two sentences about the main uncertainties>`;
}

const firstLine = (s: string) => s.trim().split('\n')[0].trim();

/** Parse the model answer. Returns nulls instead of inventing values. */
export function parseAnswer(text: string): { reasoning: string | null; risks: string | null } {
  const factors = text.match(/FACTORS:\s*([\s\S]*?)(?=\n\s*RISKS:|$)/i);
  const risks = text.match(/RISKS:\s*([\s\S]+)/i);
  return {
    reasoning: factors && factors[1].trim() ? factors[1].trim() : null,
    risks: risks && firstLine(risks[1]) ? firstLine(risks[1]) : null,
  };
}

export async function projection(symbol: string, tf: Timeframe): Promise<ProjectionResponse> {
  const quote = await getQuote(symbol);
  const timeframe = TIMEFRAME_LABEL[tf];
  const model = config.LLM_MODEL;
  const apiKey = config.REPLICATE_API_KEY;
  if (!apiKey) throw unavailable('AI provider is not configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEADLINE_MS);
  let text: string;
  try {
    const prompt = buildPrompt(quote.symbol, quote.price, quote.currency, timeframe);
    text = await runPrediction({ apiKey, model, prompt }, controller.signal);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    const timedOut = err instanceof Error && err.name === 'AbortError';
    throw unavailable(timedOut ? 'AI provider timed out' : 'AI provider request failed');
  } finally {
    clearTimeout(timer);
  }

  const parsed = parseAnswer(text);
  if (parsed.reasoning === null) {
    throw new HttpError(502, 'AI_BAD_RESPONSE', 'The AI model returned an answer we could not use. Please try again.');
  }
  return {
    symbol: quote.symbol,
    current: quote.price,
    currency: quote.currency,
    timeframe,
    reasoning: parsed.reasoning,
    risks: parsed.risks,
    method: 'llm-explanation',
    model,
    source: `${quote.source} + ${model}`,
    asOf: quote.asOf,
  };
}
