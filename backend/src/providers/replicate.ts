// Replicate client for IBM Granite. Polls until the prediction finishes or `signal` aborts.
import { unavailable } from '../lib/http';

interface ReplicatePrediction {
  status?: string;
  output?: unknown;
  urls?: { get?: string };
}

export async function runPrediction(
  { apiKey, model, prompt }: { apiKey: string; model: string; prompt: string },
  signal: AbortSignal,
): Promise<string> {
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  let res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'wait=12' },
    body: JSON.stringify({ input: { prompt, max_tokens: 256, temperature: 0.3 } }),
    signal,
  });
  if (!res.ok) throw unavailable(`AI provider error (HTTP ${res.status})`);
  let prediction = (await res.json()) as ReplicatePrediction;

  while (prediction.status === 'starting' || prediction.status === 'processing') {
    await new Promise((r) => setTimeout(r, 1000));
    res = await fetch(String(prediction.urls?.get), { headers, signal });
    if (!res.ok) throw unavailable(`AI provider error (HTTP ${res.status})`);
    prediction = (await res.json()) as ReplicatePrediction;
  }
  if (prediction.status !== 'succeeded') throw unavailable('AI provider could not complete the request');
  return Array.isArray(prediction.output) ? prediction.output.join('') : String(prediction.output || '');
}
