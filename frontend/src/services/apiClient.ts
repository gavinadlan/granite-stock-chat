// Single entry point for calling the StockAI backend.
// Third-party APIs are NEVER called from the browser: keys would leak.
import { fetchAuthSession } from 'aws-amplify/auth';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const DEFAULT_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function authHeader(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function apiGet<T>(
  path: string,
  params: Record<string, string | undefined> = {},
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError('VITE_API_URL is not configured', 'CONFIG', 0);
  }
  const query = new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => typeof e[1] === 'string' && e[1] !== ''),
  ).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json', ...(await authHeader()) }, signal: controller.signal });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'AbortError';
    throw new ApiError(timedOut ? 'The request timed out.' : 'Network error. Check your connection.', timedOut ? 'TIMEOUT' : 'NETWORK', 0);
  } finally {
    clearTimeout(timer);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON body (e.g. gateway error page)
  }
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(err?.message || `Request failed (HTTP ${res.status})`, err?.code || 'HTTP_ERROR', res.status);
  }
  return body as T;
}
