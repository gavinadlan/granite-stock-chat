// Real articles from NewsAPI or an error. Never fabricated headlines.
import { createHash } from 'node:crypto';
import type { NewsItem, NewsResponse } from '@stockai/shared';
import { cacheMeta, getOrSet } from '../lib/cache';
import { config } from '../lib/config';
import { keys } from '../lib/db';
import { unavailable } from '../lib/http';
import { searchNews } from '../providers/newsapi';

type NewsQuery = { symbol?: string; query?: string };

export async function news(q: NewsQuery): Promise<NewsResponse> {
  // S: and Q: keep a ticker and a free-text query with the same letters apart.
  const id = q.symbol ? `S:${q.symbol}` : `Q:${q.query}`;
  // An empty list is not cached, so new articles show up on the next request.
  const result = await getOrSet(keys.cache('news', id), (r: NewsResponse) => (r.news.length ? 15 * 60 : 0), () => load(q));
  return { ...result.value, ...cacheMeta(result) };
}

async function load({ symbol, query }: NewsQuery): Promise<NewsResponse> {
  const apiKey = config.NEWS_API_KEY;
  if (!apiKey) throw unavailable('News provider is not configured');

  // The query schema guarantees one of symbol/query is set.
  const q = symbol ? `"${symbol.replace(/\.JK$/, '')}" AND (stock OR shares OR saham)` : String(query);
  const articles = await searchNews(apiKey, q);

  const seen = new Set<string>();
  const items: NewsItem[] = [];
  for (const a of articles) {
    if (!a || !a.url || !a.title || a.title === '[Removed]') continue;
    const key = a.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      id: createHash('sha1').update(a.url).digest('hex').slice(0, 16),
      title: a.title,
      description: a.description || '',
      url: a.url,
      publishedAt: a.publishedAt,
      source: a.source?.name || 'Unknown',
    });
  }
  return { news: items, source: 'NewsAPI', asOf: new Date().toISOString() };
}
