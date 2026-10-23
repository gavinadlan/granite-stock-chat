'use strict';
// GET /stock-price?symbol=AAPL
const { handler } = require('../lib/http');
const { SymbolQuerySchema } = require('../lib/validation');
const { getQuote } = require('../lib/yahoo');

exports.handler = handler(
  async ({ query }) => {
    const quote = await getQuote(query.symbol);
    return { body: { ...quote, lastUpdated: quote.asOf }, cacheSeconds: 30 };
  },
  { querySchema: SymbolQuerySchema },
);
