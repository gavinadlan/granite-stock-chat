'use strict';
// Shared HTTP helpers for Lambda handlers: CORS, validation, consistent
// JSON responses and error handling that never leaks stack traces.
const crypto = require('crypto');

class HttpError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} code machine-readable error code, e.g. "NOT_FOUND"
   * @param {string} message safe, user-facing message
   */
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const badRequest = (message) => new HttpError(400, 'BAD_REQUEST', message);
const notFound = (message) => new HttpError(404, 'NOT_FOUND', message);
const unavailable = (message) => new HttpError(503, 'PROVIDER_UNAVAILABLE', message);

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

function corsHeaders(event) {
  const headers = event && event.headers ? event.headers : {};
  const origin = headers.origin || headers.Origin;
  const result = { Vary: 'Origin' };
  if (origin && allowedOrigins().includes(origin)) {
    result['Access-Control-Allow-Origin'] = origin;
    result['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
    result['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
  }
  return result;
}

function json(event, statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(event), ...extraHeaders },
    body: JSON.stringify(body),
  };
}

function log(level, message, fields = {}) {
  // Structured JSON logs (CloudWatch friendly). Never log secrets or tokens.
  console[level === 'error' ? 'error' : 'log'](JSON.stringify({ level, message, ...fields }));
}

function formatZodError(error) {
  return error.issues
    .map((i) => `${i.path.length ? i.path.join('.') : 'query'}: ${i.message}`)
    .join('; ');
}

/**
 * Wrap a handler function.
 * @param {(ctx: {event: any, query: any, requestId: string}) => Promise<{status?: number, body: any, cacheSeconds?: number}>} fn
 * @param {{ querySchema?: import('zod').ZodTypeAny }} [options]
 */
function handler(fn, options = {}) {
  return async (event, context) => {
    const requestId = (context && context.awsRequestId) || crypto.randomUUID();
    const started = Date.now();
    const route = event && (event.resource || event.rawPath || event.path);
    try {
      if (event && event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders(event), body: '' };
      }
      let query = (event && event.queryStringParameters) || {};
      if (options.querySchema) {
        const parsed = options.querySchema.safeParse(query);
        if (!parsed.success) throw badRequest(formatZodError(parsed.error));
        query = parsed.data;
      }
      const result = await fn({ event, query, requestId });
      const extra = result.cacheSeconds
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
      log('error', 'unhandled error', { requestId, route, error: err && err.message, stack: err && err.stack });
      return json(event, 500, { error: { code: 'INTERNAL', message: 'Internal server error' }, requestId });
    }
  };
}

module.exports = { HttpError, badRequest, notFound, unavailable, handler, corsHeaders, log };
