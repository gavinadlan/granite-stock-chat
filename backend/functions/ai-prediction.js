'use strict';
// GET /ai-prediction?symbol=AAPL&timeframe=1w
// Returns a qualitative outlook written by IBM Granite (via Replicate) on top of the
// real current price. The model is NOT asked for a price target or a confidence
// number: those would be invented figures (CLAUDE.md rule 4). Sprint 1 (S1-08)
// adds a statistical projection computed from real data; the LLM only explains it.
const { handler, HttpError, unavailable } = require('../lib/http');
const { PredictionQuerySchema } = require('../lib/validation');
const { getQuote } = require('../lib/yahoo');

const MODEL = process.env.LLM_MODEL || 'ibm-granite/granite-3.3-8b-instruct';
// Lambda timeout is 28s. The quote fetch takes up to 5s, so the LLM budget is 18s
// which leaves headroom and lets us return a proper JSON error with CORS headers.
const DEADLINE_MS = 18000;
const TIMEFRAME_LABEL = { '1d': '1 day', '1w': '1 week', '1m': '1 month', '3m': '3 months' };

function buildPrompt(symbol, price, currency, timeframe) {
  return `You are a cautious financial educator. The current price of ${symbol} is ${price} ${currency}.
Describe, for a beginner, the kinds of factors that could influence this stock over the next ${timeframe}.
Rules: do NOT give a price target, a percentage forecast, a probability or a buy/sell/hold recommendation. Do not invent news or numbers.

Reply in exactly this format and nothing else:
FACTORS: <two or three sentences about general factors that could matter>
RISKS: <one or two sentences about the main uncertainties>`;
}

async function callReplicate(prompt, signal) {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) throw unavailable('AI provider is not configured');
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  let res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'wait=12' },
    body: JSON.stringify({ input: { prompt, max_tokens: 256, temperature: 0.3 } }),
    signal,
  });
  if (!res.ok) throw unavailable(`AI provider error (HTTP ${res.status})`);
  let prediction = await res.json();

  while (prediction.status === 'starting' || prediction.status === 'processing') {
    await new Promise((r) => setTimeout(r, 1000));
    res = await fetch(prediction.urls.get, { headers, signal });
    if (!res.ok) throw unavailable(`AI provider error (HTTP ${res.status})`);
    prediction = await res.json();
  }
  if (prediction.status !== 'succeeded') throw unavailable('AI provider could not complete the request');
  return Array.isArray(prediction.output) ? prediction.output.join('') : String(prediction.output || '');
}

const firstLine = (s) => s.trim().split('\n')[0].trim();

/** Parse the model answer. Returns nulls instead of inventing values. */
function parseAnswer(text) {
  const factors = text.match(/FACTORS:\s*([\s\S]*?)(?=\n\s*RISKS:|$)/i);
  const risks = text.match(/RISKS:\s*([\s\S]+)/i);
  return {
    reasoning: factors && factors[1].trim() ? factors[1].trim() : null,
    risks: risks && firstLine(risks[1]) ? firstLine(risks[1]) : null,
  };
}

exports.handler = handler(
  async ({ query }) => {
    const quote = await getQuote(query.symbol);
    const timeframe = TIMEFRAME_LABEL[query.timeframe];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEADLINE_MS);
    let text;
    try {
      text = await callReplicate(buildPrompt(quote.symbol, quote.price, quote.currency, timeframe), controller.signal);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw unavailable(err.name === 'AbortError' ? 'AI provider timed out' : 'AI provider request failed');
    } finally {
      clearTimeout(timer);
    }

    const parsed = parseAnswer(text);
    if (parsed.reasoning === null) {
      throw new HttpError(502, 'AI_BAD_RESPONSE', 'The AI model returned an answer we could not use. Please try again.');
    }
    return {
      body: {
        symbol: quote.symbol,
        current: quote.price,
        currency: quote.currency,
        timeframe,
        reasoning: parsed.reasoning,
        risks: parsed.risks,
        method: 'llm-explanation',
        model: MODEL,
        source: `${quote.source} + ${MODEL}`,
        asOf: quote.asOf,
      },
    };
  },
  { querySchema: PredictionQuerySchema },
);

exports._parseAnswer = parseAnswer; // exported for unit tests
