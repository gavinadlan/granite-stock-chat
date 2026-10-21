'use strict';
// Minimal Yahoo Finance chart client (unofficial endpoint).
// Sprint 1 (S1-03) replaces this with a provider adapter + fallback chain.
const { notFound, unavailable } = require('./http');

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const TIMEOUT_MS = 5000;

async function fetchChart(symbol, { range = '1d', interval = '1d' } = {}) {
  const url = `${BASE}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StockAI/0.2; +https://stockai.gavinadlan.my.id)' },
    });
  } catch (err) {
    throw unavailable(`Market data provider unreachable (${err.name === 'AbortError' ? 'timeout' : 'network'})`);
  } finally {
    clearTimeout(timer);
  }
  let body;
  try {
    body = await res.json();
  } catch {
    throw unavailable(`Market data provider returned an invalid response (HTTP ${res.status})`);
  }
  const chart = body && body.chart;
  if (res.status === 404 || (chart && chart.error && /not found/i.test(chart.error.code || ''))) {
    throw notFound(`Symbol ${symbol} not found`);
  }
  if (!res.ok || !chart || !chart.result || !chart.result.length) {
    throw unavailable(`Market data provider error (HTTP ${res.status})`);
  }
  return chart.result[0];
}

/** Parse candles, dropping incomplete rows (Yahoo returns nulls for gaps). */
function toCandles(result) {
  const ts = result.timestamp || [];
  const q = (result.indicators && result.indicators.quote && result.indicators.quote[0]) || {};
  const candles = [];
  for (let i = 0; i < ts.length; i++) {
    const c = { t: ts[i], o: q.open && q.open[i], h: q.high && q.high[i], l: q.low && q.low[i], c: q.close && q.close[i], v: q.volume && q.volume[i] };
    if ([c.o, c.h, c.l, c.c].every((x) => typeof x === 'number' && Number.isFinite(x))) candles.push(c);
  }
  return candles;
}

async function getQuote(symbol) {
  const result = await fetchChart(symbol, { range: '5d', interval: '1d' });
  const meta = result.meta || {};
  const price = meta.regularMarketPrice;
  if (typeof price !== 'number') throw unavailable(`No price available for ${symbol}`);
  // previousClose is only present for range=1d; derive it from the candles otherwise.
  const candles = toCandles(result);
  const lastTradeDay = meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString().slice(0, 10) : null;
  const prior = candles.filter((c) => new Date(c.t * 1000).toISOString().slice(0, 10) !== lastTradeDay);
  const previousClose = meta.previousClose || (prior.length ? prior[prior.length - 1].c : meta.chartPreviousClose);
  const change = typeof previousClose === 'number' ? price - previousClose : null;
  return {
    symbol: meta.symbol || symbol,
    name: meta.longName || meta.shortName || null,
    price,
    change,
    changePercent: change !== null && previousClose ? (change / previousClose) * 100 : null,
    previousClose: previousClose || null,
    open: candles.length ? candles[candles.length - 1].o : null,
    high: meta.regularMarketDayHigh ?? null,
    low: meta.regularMarketDayLow ?? null,
    volume: meta.regularMarketVolume ?? null,
    marketCap: null, // not available from the chart endpoint
    currency: meta.currency || 'USD',
    exchange: meta.exchangeName || null,
    asOf: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
    source: 'Yahoo Finance',
    delayed: true,
  };
}

async function getDailyHistory(symbol, range = '1y') {
  const result = await fetchChart(symbol, { range, interval: '1d' });
  return { meta: result.meta || {}, candles: toCandles(result) };
}

module.exports = { fetchChart, toCandles, getQuote, getDailyHistory };
