import { z } from 'zod';
import { HistoryIntervalSchema, HistoryRangeSchema, type HistoryInterval, type HistoryRange } from '@stockai/shared';

/** Ticker symbol, e.g. AAPL, BBCA.JK, BRK-B, ^GSPC, EURUSD=X */
export const SymbolSchema = z
  .string({ required_error: 'symbol is required' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9.\-^=]{1,15}$/, 'symbol must be 1-15 chars: letters, digits, . - ^ =');

const TIMEFRAME_ALIASES: Record<string, string | undefined> = {
  '1d': '1d', '1 day': '1d',
  '1w': '1w', '1 week': '1w',
  '1m': '1m', '1 month': '1m',
  '3m': '3m', '3 months': '3m',
};

export const TimeframeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => TIMEFRAME_ALIASES[v])
  .pipe(z.enum(['1d', '1w', '1m', '3m'], { invalid_type_error: 'timeframe must be one of 1d, 1w, 1m, 3m' }));
export type Timeframe = z.output<typeof TimeframeSchema>;

export const SymbolQuerySchema = z.object({ symbol: SymbolSchema });

export const PredictionQuerySchema = z.object({
  symbol: SymbolSchema,
  timeframe: TimeframeSchema.optional().default('1w'),
});

export const NewsQuerySchema = z
  .object({
    symbol: SymbolSchema.optional(),
    query: z.string().trim().min(2).max(100).optional(),
  })
  .refine((q) => q.symbol || q.query, { message: 'symbol or query is required' });

// Longest range Yahoo serves for each intraday interval; 1d and 1wk accept any range.
const RANGE_ORDER: HistoryRange[] = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y', 'max'];
const MAX_RANGE: Partial<Record<HistoryInterval, HistoryRange>> = { '1m': '5d', '5m': '1mo', '15m': '1mo', '1h': '1y' };

export const allowedRanges = (interval: HistoryInterval): HistoryRange[] => {
  const max = MAX_RANGE[interval];
  return max ? RANGE_ORDER.slice(0, RANGE_ORDER.indexOf(max) + 1) : RANGE_ORDER;
};

export const HistoryQuerySchema = z
  .object({
    symbol: SymbolSchema,
    range: z.string().trim().toLowerCase().pipe(HistoryRangeSchema).optional().default('1mo'),
    interval: z.string().trim().toLowerCase().pipe(HistoryIntervalSchema).optional().default('1d'),
  })
  .superRefine((q, ctx) => {
    const ok = allowedRanges(q.interval);
    if (!ok.includes(q.range)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['range'],
        message: `interval ${q.interval} supports range ${ok.join(', ')} (got ${q.range})`,
      });
    }
  });
export type HistoryQuery = z.output<typeof HistoryQuerySchema>;
