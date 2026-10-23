'use strict';
const { z } = require('zod');

/** Ticker symbol, e.g. AAPL, BBCA.JK, BRK-B, ^GSPC, EURUSD=X */
const SymbolSchema = z
  .string({ required_error: 'symbol is required' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9.\-^=]{1,15}$/, 'symbol must be 1-15 chars: letters, digits, . - ^ =');

const TIMEFRAME_ALIASES = {
  '1d': '1d', '1 day': '1d',
  '1w': '1w', '1 week': '1w',
  '1m': '1m', '1 month': '1m',
  '3m': '3m', '3 months': '3m',
};

const TimeframeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => TIMEFRAME_ALIASES[v])
  .pipe(z.enum(['1d', '1w', '1m', '3m'], { invalid_type_error: 'timeframe must be one of 1d, 1w, 1m, 3m' }));

const SymbolQuerySchema = z.object({ symbol: SymbolSchema });

const PredictionQuerySchema = z.object({
  symbol: SymbolSchema,
  timeframe: TimeframeSchema.optional().default('1w'),
});

const NewsQuerySchema = z
  .object({
    symbol: SymbolSchema.optional(),
    query: z.string().trim().min(2).max(100).optional(),
  })
  .refine((q) => q.symbol || q.query, { message: 'symbol or query is required' });

module.exports = { SymbolSchema, TimeframeSchema, SymbolQuerySchema, PredictionQuerySchema, NewsQuerySchema };
