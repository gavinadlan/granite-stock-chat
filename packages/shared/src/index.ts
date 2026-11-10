// Shared response contracts between frontend and backend (zod schema + inferred type).
// Dates are ISO-8601 strings on the wire; convert at the edges.
//
// Each endpoint has a *data* schema (the payload) and a *response* schema (what is on
// the wire today). Responses are still flat: provenance fields sit next to the data.
// When the `{ data, meta }` envelope lands (S1-04) only the response schemas change;
// the data schemas stay as they are.
import { z } from 'zod';

/** Provenance attached to every data response so the UI can show where numbers came from. */
export const DataMetaSchema = z.object({
  /** Provider that produced the data, e.g. "Yahoo Finance", "NewsAPI". */
  source: z.string(),
  /** ISO timestamp of when the data was valid (provider time, not request time). */
  asOf: z.string(),
  /** True when quotes may be delayed (e.g. 15 min for free data). */
  delayed: z.boolean().optional(),
  /** Caveats about the data, e.g. not enough history for an indicator. */
  warnings: z.array(z.string()).optional(),
});
export type DataMeta = z.infer<typeof DataMetaSchema>;

// Older frontend code reads `lastUpdated`; it always equals `asOf`.
const LegacyTimestampSchema = z.object({ lastUpdated: z.string() });

export const QuoteSchema = z.object({
  symbol: z.string(),
  name: z.string().nullable(),
  price: z.number(),
  change: z.number().nullable(),
  changePercent: z.number().nullable(),
  previousClose: z.number().nullable(),
  open: z.number().nullable(),
  high: z.number().nullable(),
  low: z.number().nullable(),
  volume: z.number().nullable(),
  marketCap: z.number().nullable(),
  currency: z.string(),
  exchange: z.string().nullable(),
});
export type Quote = z.infer<typeof QuoteSchema>;
export const QuoteResponseSchema = QuoteSchema.merge(DataMetaSchema).merge(LegacyTimestampSchema);
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

export const TechnicalSignalSchema = z.object({
  id: z.string(),
  severity: z.enum(['bullish', 'bearish']),
  label: z.string(),
});
export type TechnicalSignal = z.infer<typeof TechnicalSignalSchema>;

export const TechnicalsSchema = z.object({
  symbol: z.string(),
  currency: z.string().nullable(),
  price: z.number().nullable(),
  rsi: z.number().nullable(),
  macd: z.object({ macd: z.number().nullable(), signal: z.number().nullable(), histogram: z.number().nullable() }),
  movingAverages: z.object({ sma20: z.number().nullable(), sma50: z.number().nullable(), sma200: z.number().nullable() }),
  support: z.number().nullable(),
  resistance: z.number().nullable(),
  trend: z.enum(['bullish', 'bearish', 'neutral']),
  signals: z.array(TechnicalSignalSchema),
  candlesUsed: z.number(),
  method: z.string(),
});
export type Technicals = z.infer<typeof TechnicalsSchema>;
export const TechnicalsResponseSchema = TechnicalsSchema.merge(DataMetaSchema).merge(LegacyTimestampSchema);
export type TechnicalsResponse = z.infer<typeof TechnicalsResponseSchema>;

export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  source: z.string(),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;
export const NewsSchema = z.object({ news: z.array(NewsItemSchema) });
export type News = z.infer<typeof NewsSchema>;
export const NewsResponseSchema = NewsSchema.merge(DataMetaSchema);
export type NewsResponse = z.infer<typeof NewsResponseSchema>;

/** Qualitative LLM outlook on top of the real price. No price target or confidence (CLAUDE.md rule 4). */
export const ProjectionSchema = z.object({
  symbol: z.string(),
  current: z.number(),
  currency: z.string(),
  timeframe: z.string(),
  reasoning: z.string(),
  risks: z.string().nullable(),
  method: z.literal('llm-explanation'),
  model: z.string(),
});
export type Projection = z.infer<typeof ProjectionSchema>;
export const ProjectionResponseSchema = ProjectionSchema.merge(DataMetaSchema);
export type ProjectionResponse = z.infer<typeof ProjectionResponseSchema>;

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  stage: z.string(),
  time: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ApiErrorBodySchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
  requestId: z.string().optional(),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>;
