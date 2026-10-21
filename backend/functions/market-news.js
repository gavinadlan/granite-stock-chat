'use strict';
// GET /market-news?symbol=AAPL  or  /market-news?query=stock%20market
// Returns real articles from NewsAPI or an error. Never fabricated headlines.
const crypto = require('crypto');
const { handler, unavailable } = require('../lib/http');
const { NewsQuerySchema } = require('../lib/validation');

const TIMEOUT_MS = 6000;

exports.handler = handler(
  async ({ query }) => {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) throw unavailable('News provider is not configured');

    const base = query.symbol ? query.symbol.replace(/\.JK$/, '') : null;
    const q = query.symbol ? `"${base}" AND (stock OR shares OR saham)` : query.query;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=10&sortBy=publishedAt&searchIn=title,description`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let data;
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { 'X-Api-Key': apiKey } });
      data = await res.json();
      if (!res.ok || data.status !== 'ok') throw new Error(data && data.message ? data.message : `HTTP ${res.status}`);
    } catch (err) {
      throw unavailable(`News provider unavailable: ${err.name === 'AbortError' ? 'timeout' : 'request failed'}`);
    } finally {
      clearTimeout(timer);
    }

    const seen = new Set();
    const news = [];
    for (const a of data.articles || []) {
      if (!a || !a.url || !a.title || a.title === '[Removed]') continue;
      const key = a.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (seen.has(key)) continue;
      seen.add(key);
      news.push({
        id: crypto.createHash('sha1').update(a.url).digest('hex').slice(0, 16),
        title: a.title,
        description: a.description || '',
        url: a.url,
        publishedAt: a.publishedAt,
        source: (a.source && a.source.name) || 'Unknown',
      });
    }
    return { body: { news, source: 'NewsAPI', asOf: new Date().toISOString() }, cacheSeconds: 600 };
  },
  { querySchema: NewsQuerySchema },
);
