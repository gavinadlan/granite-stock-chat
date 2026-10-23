// NewsAPI "everything" search. S1-03 turns this into a NewsProvider adapter.
import { unavailable } from '../lib/http';

const TIMEOUT_MS = 6000;

export interface NewsApiArticle {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  publishedAt: string;
  source?: { name?: string | null } | null;
}

interface NewsApiBody {
  status?: string;
  message?: string;
  articles?: (NewsApiArticle | null)[];
}

export async function searchNews(apiKey: string, q: string): Promise<(NewsApiArticle | null)[]> {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=10&sortBy=publishedAt&searchIn=title,description`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'X-Api-Key': apiKey } });
    const data = (await res.json()) as NewsApiBody | null; // fields checked before use
    if (!res.ok || data?.status !== 'ok') throw new Error(data?.message ? data.message : `HTTP ${res.status}`);
    return data.articles || [];
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    throw unavailable(`News provider unavailable: ${timedOut ? 'timeout' : 'request failed'}`);
  } finally {
    clearTimeout(timer);
  }
}
