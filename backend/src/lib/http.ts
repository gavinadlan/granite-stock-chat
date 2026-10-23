// Shared HTTP helpers for Lambda handlers: CORS, validation, consistent
// JSON responses and error handling that never leaks stack traces.
import { randomUUID } from 'node:crypto';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import type { z } from 'zod';
import { config } from './config';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    /** machine-readable error code, e.g. "NOT_FOUND" */
    readonly code: string,
    /** safe, user-facing message */
    message: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new HttpError(400, 'BAD_REQUEST', message);
export const notFound = (message: string) => new HttpError(404, 'NOT_FOUND', message);
export const unavailable = (message: string) => new HttpError(503, 'PROVIDER_UNAVAILABLE', message);

/** The parts of an API Gateway event we read (REST v1 today, rawPath for HTTP API v2). */
export type HttpEvent = Partial<
  Pick<APIGatewayProxyEvent, 'headers' | 'queryStringParameters' | 'httpMethod' | 'resource' | 'path'>
> & { rawPath?: string };

type Headers = Record<string, string>;

export function corsHeaders(event: HttpEvent | undefined): Headers {
  const headers = event?.headers ?? {};
  const origin = headers.origin || headers.Origin;
  const result: Headers = { Vary: 'Origin' };
  if (origin && config.ALLOWED_ORIGINS.includes(origin)) {
    result['Access-Control-Allow-Origin'] = origin;
    result['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
    result['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
  }
  return result;
}

function json(event: HttpEvent, statusCode: number, body: unknown, extraHeaders: Headers = {}): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(event), ...extraHeaders },
    body: JSON.stringify(body),
  };
}

export function log(level: 'info' | 'error', message: string, fields: Record<string, unknown> = {}): void {
  // Structured JSON logs (CloudWatch friendly). Never log secrets or tokens.
  console[level === 'error' ? 'error' : 'log'](JSON.stringify({ level, message, ...fields }));
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.length ? i.path.join('.') : 'query'}: ${i.message}`).join('; ');
}

export interface HandlerResult {
  status?: number;
  body: unknown;
  cacheSeconds?: number;
}

type QueryParams = Record<string, string | undefined>;

export type LambdaHandler = (event: HttpEvent, context?: Partial<Context>) => Promise<APIGatewayProxyResult>;

/** Wrap a handler function: CORS, query validation, logging and safe error bodies. */
export function handler<S extends z.ZodTypeAny = z.ZodType<QueryParams>>(
  fn: (ctx: { event: HttpEvent; query: z.output<S>; requestId: string }) => Promise<HandlerResult>,
  options: { querySchema?: S } = {},
): LambdaHandler {
  return async (event, context) => {
    const requestId = context?.awsRequestId || randomUUID();
    const started = Date.now();
    const route = event?.resource || event?.rawPath || event?.path;
    try {
      if (event?.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders(event), body: '' };
      }
      const raw: QueryParams = event?.queryStringParameters ?? {};
      let query = raw as z.output<S>; // no schema: the raw query string map is the query
      if (options.querySchema) {
        const parsed = options.querySchema.safeParse(raw);
        if (!parsed.success) throw badRequest(formatZodError(parsed.error));
        query = parsed.data;
      }
      const result = await fn({ event, query, requestId });
      const extra: Headers = result.cacheSeconds
        ? { 'Cache-Control': `public, max-age=${result.cacheSeconds}` }
        : { 'Cache-Control': 'no-store' };
      log('info', 'request', { requestId, route, status: result.status || 200, ms: Date.now() - started });
      return json(event, result.status || 200, result.body, extra);
    } catch (err) {
      if (err instanceof HttpError) {
        log(err.status >= 500 ? 'error' : 'info', 'request failed', {
          requestId, route, status: err.status, code: err.code, error: err.message, ms: Date.now() - started,
        });
        return json(event, err.status, { error: { code: err.code, message: err.message }, requestId });
      }
      const e = err instanceof Error ? err : undefined;
      log('error', 'unhandled error', { requestId, route, error: e?.message, stack: e?.stack });
      return json(event, 500, { error: { code: 'INTERNAL', message: 'Internal server error' }, requestId });
    }
  };
}
