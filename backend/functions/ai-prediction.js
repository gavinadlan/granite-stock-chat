'use strict';
// GET /ai-prediction?symbol=AAPL&timeframe=1w
// Asks IBM Granite (via Replicate) for a short-horizon outlook on top of the real
// current price. If the model is unavailable or its answer cannot be parsed we
// return an error: we never substitute a random "prediction".
// NOTE: Sprint 1 (S1-08) replaces the LLM-generated price with a statistical
// projection and keeps the LLM only for the explanation.
const { handler, HttpError, unavailable } = require('../lib/http');
const { PredictionQuerySchema } = require('../lib/validation');
const { getQuote } = require('../lib/yahoo');

const MODEL = process.env.LLM_MODEL || 'ibm-granite/granite-3.3-8b-instruct';
const DEADLINE_MS = 24000; // stay below the 29s API Gateway limit
const TIMEFRAME_LABEL = { '1d': '1 day', '1w': '1 week', '1m': '1 month', '3m': '3 months' };

function buildPrompt(symbol, price, currency, timeframe) {
  return `You are a cautious financial analyst. The current price of ${symbol} is ${price} ${currency}.
Give a short outlook for the next ${timeframe}. Be realistic and conservative.

Reply in exactly this format and nothing else:
PREDICTED_PRICE: <number>
CONFIDENCE: <0-100>%
REASONING: <one or two sentences, mention the main uncertainty>`;
}

async function callReplicate(prompt, signal) {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) throw unavailable('AI provider is not configured');
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  let res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'wait=20' },
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

/** Parse the model answer. Returns null fields instead of inventing values. */
function parseAnswer(text) {
  const price = text.match(/PREDICTED_PRICE:\s*\$?\s*([\d,]+(?:\.\d+)?)/i);
  const conf = text.match(/CONFIDENCE:\s*(\d{1,3})\s*%/i);
  const reasoning = text.match(/REASONING:\s*([\s\S]+)/i);
  return {
    predicted: price ? Number(price[1].replace(/,/g, '')) : null,
    confidence: conf ? Math.min(100, Number(conf[1])) : null,
    reasoning: reasoning ? reasoning[1].trim().split('\n')[0] : null,
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
    // Reject unparseable or implausible answers (> ±50% move) rather than showing them.
    if (parsed.predicted === null || Math.abs(parsed.predicted / quote.price - 1) > 0.5) {
      throw new HttpError(502, 'AI_BAD_RESPONSE', 'The AI model returned an answer we could not use. Please try again.');
    }
    const change = parsed.predicted - quote.price;
    return {
      body: {
        symbol: quote.symbol,
        current: quote.price,
        predicted: Number(parsed.predicted.toFixed(4)),
        currency: quote.currency,
        confidence: parsed.confidence,
        timeframe,
        change: Number(change.toFixed(4)),
        changePercent: Number(((change / quote.price) * 100).toFixed(2)),
        reasoning: parsed.reasoning,
        method: 'llm',
        model: MODEL,
        source: `${quote.source} + ${MODEL}`,
        asOf: quote.asOf,
      },
    };
  },
  { querySchema: PredictionQuerySchema },
);

exports._parseAnswer = parseAnswer; // exported for unit tests
