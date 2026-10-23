// Smoke-test the providers the backend actually uses.
// Usage: node --env-file=backend/.env scripts/test-apis.js
const MODEL = process.env.LLM_MODEL || 'ibm-granite/granite-3.3-8b-instruct';

async function check(name, fn) {
  try {
    console.log(`${(await fn()) ? 'OK  ' : 'FAIL'} ${name}`);
  } catch (e) {
    console.log(`ERR  ${name}: ${e.message}`);
  }
}

console.log('Testing provider connections...\n');

await check('Yahoo Finance chart (AAPL)', async () => {
  const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=1d&interval=1d', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  return r.ok;
});

await check('NewsAPI', async () => {
  const r = await fetch(`https://newsapi.org/v2/everything?q=AAPL&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`);
  return r.ok;
});

await check(`Replicate model ${MODEL}`, async () => {
  const r = await fetch(`https://api.replicate.com/v1/models/${MODEL}`, {
    headers: { Authorization: `Bearer ${process.env.REPLICATE_API_KEY}` },
  });
  return r.ok;
});

console.log('\nDone.');
