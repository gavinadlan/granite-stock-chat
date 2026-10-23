'use strict';
// GET /technical-analysis?symbol=AAPL
// Indicators are computed from one year of real daily candles (no random data).
const { handler, unavailable } = require('../lib/http');
const { SymbolQuerySchema } = require('../lib/validation');
const { getDailyHistory } = require('../lib/yahoo');
const { summarize } = require('../lib/indicators');

exports.handler = handler(
  async ({ query }) => {
    const { meta, candles } = await getDailyHistory(query.symbol, '1y');
    if (candles.length < 30) throw unavailable(`Not enough price history for ${query.symbol} to compute indicators`);
    const summary = summarize(candles);
    const asOf = new Date(candles[candles.length - 1].t * 1000).toISOString();
    const warnings = [];
    if (summary.movingAverages.sma200 === null) warnings.push('Less than 200 sessions of history: SMA200 unavailable');
    return {
      body: {
        symbol: meta.symbol || query.symbol,
        currency: meta.currency || null,
        ...summary,
        lastUpdated: asOf,
        asOf,
        source: 'Yahoo Finance (daily candles)',
        method: 'RSI(14, Wilder), MACD(12,26,9), SMA 20/50/200, 20-session range for support/resistance',
        warnings,
      },
      cacheSeconds: 300,
    };
  },
  { querySchema: SymbolQuerySchema },
);
