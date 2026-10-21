# Sprint 1: Backend & Data yang Bisa Dipercaya (Minggu 3–4)

**Tujuan sprint:** backend TypeScript yang terstruktur, semua data berasal dari sumber asli lewat satu lapisan provider + cache, indikator teknikal dihitung dengan benar, endpoint terlindungi JWT.
**Rilis:** `v0.3.0`

## Desain Target Sprint Ini

```
backend/
├── serverless.yml
├── src/
│   ├── handlers/            # tipis: parse input → panggil service → response
│   │   ├── quote.ts         GET /v1/quote?symbol=
│   │   ├── history.ts       GET /v1/history?symbol=&range=&interval=
│   │   ├── technicals.ts    GET /v1/technicals?symbol=
│   │   ├── news.ts          GET /v1/news?symbol=|q=
│   │   ├── projection.ts    GET /v1/projection?symbol=&horizon=
│   │   └── health.ts        GET /v1/health (tanpa auth)
│   ├── services/            # logika bisnis (dipakai handler & tool AI di Sprint 2)
│   ├── providers/           # adapter Yahoo, AlphaVantage, NewsAPI, ...
│   ├── domain/indicators/   # fungsi murni: sma, ema, rsi, macd, atr, pivots
│   └── lib/                 # http, cache, db, config, logger, errors
└── test/
packages/shared/src/         # tipe + zod schema response (dipakai frontend & backend)
```

**Kontrak response standar:**
```json
{ "data": { "...": "..." }, "meta": { "source": "yahoo", "asOf": "2026-10-21T10:05:00Z", "cached": true, "delayed": true } }
```
Error: `{ "error": { "code": "PROVIDER_UNAVAILABLE", "message": "..." }, "requestId": "..." }`

---

## S1-01 🤖🧠 Backend → TypeScript + esbuild + struktur baru (⏱️ 6 jam)
**Dependensi:** S0-04, S0-05

**Kriteria penerimaan:**
- Semua handler di `backend/src/handlers/*.ts`, build dengan `serverless-esbuild`
- `tsconfig` strict, `npm run typecheck -w backend` lulus
- Perilaku endpoint lama sama (sementara path lama tetap ada sebagai alias hingga S1-10)
- AWS SDK v3 modular saja

**PROMPT:**
```text
Task S1-01 dari roadmap/sprint-1-backend-data.md (baca bagian "Desain Target"). Buat rencana dulu.
1. Migrasikan backend ke TypeScript: pasang typescript, serverless-esbuild, esbuild, @types/aws-lambda, @types/node. tsconfig strict, target ES2022, module ESNext, moduleResolution Bundler.
2. Buat struktur src/handlers, src/services, src/providers, src/domain, src/lib sesuai desain. Pindahkan logika dari functions/*.js ke service + provider (Yahoo chart endpoint) tanpa mengubah perilaku. Port lib/http.js & lib/validation.js dari S0-05 ke TS.
3. Buat src/lib/config.ts yang membaca & memvalidasi env dengan zod saat cold start (gagal cepat jika env wajib hilang).
4. Pakai fetch native Node 20 (hapus node-fetch & dotenv dari dependencies runtime; dotenv hanya untuk offline/dev).
5. Daftarkan route baru dengan prefix /v1 (quote, technicals, news, projection, health). Pertahankan route lama (/stock-price, /technical-analysis, /market-news, /ai-prediction) yang menunjuk ke handler baru agar frontend tidak rusak sampai S1-10.
6. Gunakan @stockai/shared untuk tipe response; tambahkan zod schema response di packages/shared.
7. Pastikan `npm run offline -w backend`, typecheck, test, dan `npx serverless package --stage dev` berhasil.
8. Update CLAUDE.md (struktur & perintah backend).
Commit: "refactor(api): migrate backend to TypeScript with layered structure [S1-01]"
```

---

## S1-02 🤝🧠 HTTP API + Cognito JWT authorizer + stage (⏱️ 4 jam)
**Dependensi:** S0-07, S1-01

**Kriteria penerimaan:**
- Semua route memakai `httpApi` (API Gateway v2), bukan REST `http`
- Authorizer JWT Cognito aktif untuk semua route kecuali `/v1/health`
- Throttling default stage diset (mis. burst 50, rate 20)
- Stage `dev` & `prod` terpisah; custom domain `api.stockai.gavinadlan.my.id` (prod)

**PROMPT:**
```text
Task S1-02.
1. Ubah semua events di serverless.yml dari `http` ke `httpApi`. Hapus resource ApiGatewayRestApi custom.
2. Konfigurasi provider.httpApi: cors dari ALLOWED_ORIGINS per stage; authorizers.cognitoJwt type jwt, identitySource $request.header.Authorization, issuerUrl https://cognito-idp.us-east-1.amazonaws.com/<UserPoolId via !Ref/Fn::Sub>, audience [UserPoolClientId].
3. Pasang authorizer di semua route kecuali GET /v1/health.
4. Throttling: atur default route settings stage HTTP API (ThrottlingBurstLimit 50, ThrottlingRateLimit 20). Jika Serverless v3 tidak mendukung langsung, gunakan resources.extensions / override pada AWS::ApiGatewayV2::Stage, dan jelaskan caranya.
5. Di handler, ambil userId dari event.requestContext.authorizer.jwt.claims.sub lewat helper getUserId(event) di src/lib/auth.ts.
6. Tambahkan custom.stages config (dev/prod) untuk ALLOWED_ORIGINS, LOG_LEVEL, dll.
7. Siapkan konfigurasi custom domain prod memakai plugin serverless-domain-manager (domain api.stockai.gavinadlan.my.id) tapi jangan deploy. Tulis langkah manual (sertifikat ACM us-east-1, DNS) di docs/DEPLOYMENT.md.
8. Update frontend VITE_API_URL di .env.example.
Commit: "feat(api): HTTP API with Cognito JWT authorizer and stage config [S1-02]"
```
**Manual:** request sertifikat ACM untuk `api.stockai.gavinadlan.my.id`, validasi DNS, `npx serverless create_domain --stage prod`, deploy. Uji: request tanpa token → 401, dengan token → 200.

---

## S1-03 🤖 Provider adapter + retry + circuit breaker (⏱️ 6 jam)
**Dependensi:** S1-01

**Kriteria penerimaan:**
- Interface `MarketDataProvider` { getQuote, getHistory, searchSymbols? } & `NewsProvider` { getNews }
- `YahooProvider` (utama) dan `AlphaVantageProvider` (fallback quote/history)
- Timeout per request (default 4 dtk), retry 1x dengan backoff + jitter untuk 5xx/timeout, **tanpa** retry untuk 4xx
- Circuit breaker sederhana di memori per provider (buka setelah 5 gagal beruntun, half-open setelah 30 dtk)
- `ProviderChain` mencoba provider berurutan dan mencatat provider mana yang berhasil di `meta.source`
- Unit test dengan fetch di-mock (sukses, timeout, 5xx → fallback, 404 symbol → NOT_FOUND tanpa fallback)

**PROMPT:**
```text
Task S1-03.
1. Di backend/src/providers buat types.ts: interface MarketDataProvider { name; getQuote(symbol): Promise<Quote>; getHistory(symbol, {range, interval}): Promise<Candle[]> } dan NewsProvider { name; getNews({symbol?, query?, limit}): Promise<NewsArticle[]> }. Tipe Quote, Candle, NewsArticle didefinisikan di packages/shared dengan zod.
2. src/lib/http-client.ts: fetchJson(url, {timeoutMs, retries, headers}) dengan AbortController, retry + exponential backoff + jitter hanya untuk network error/5xx/429, error bertipe (ProviderError dengan kind: 'timeout'|'rate_limited'|'not_found'|'bad_response'|'upstream').
3. src/lib/circuit-breaker.ts: state closed/open/half-open per nama provider (in-memory, cukup per container Lambda).
4. providers/yahoo.ts: quote & history dari https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=..&interval=.. (User-Agent wajar), parse aman (validasi dengan zod; null di array candle dibuang). Dukung simbol berakhiran .JK dan currency dari meta.currency.
5. providers/alpha-vantage.ts: GLOBAL_QUOTE & TIME_SERIES_DAILY sebagai fallback; deteksi pesan rate limit ("Note"/"Information") → ProviderError rate_limited.
6. providers/newsapi.ts untuk NewsProvider.
7. services/market-data.ts: ProviderChain([yahoo, alphaVantage]) dengan circuit breaker; not_found tidak memicu fallback.
8. Unit test Vitest untuk http-client, circuit-breaker, yahoo parser (pakai fixture JSON di test/fixtures, ambil contoh respons asli lalu potong), dan chain fallback.
Commit: "feat(api): market data provider adapters with retry and circuit breaker [S1-03]"
```

---

## S1-04 🤖 DynamoDB single-table + cache (⏱️ 4 jam)
**Dependensi:** S1-03

**Desain tabel `stockai-{stage}`** (PK/SK string, TTL attribute `ttl`, PAY_PER_REQUEST):
| Entitas | PK | SK | Catatan |
|---|---|---|---|
| Cache | `CACHE#quote#AAPL` | `v1` | `payload`, `ttl`, `source`, `asOf` |
| User profile | `USER#<sub>` | `PROFILE` | Sprint 3 |
| Watchlist item | `USER#<sub>` | `WATCH#AAPL` | Sprint 3 |
| Conversation | `USER#<sub>` | `CONV#<ts>#<id>` | Sprint 2 |
| Message | `CONV#<id>` | `MSG#<ts>#<id>` | Sprint 2 |
| Alert | `USER#<sub>` | `ALERT#<id>` | + GSI1 `GSI1PK=ALERT#ACTIVE#<symbol>` |
| Quota | `USER#<sub>` | `QUOTA#<yyyy-mm-dd>` | Sprint 2 |

**TTL cache:** quote 30 dtk (jam bursa) / 15 menit (di luar jam bursa), history 1d interval 6 jam, intraday 2 menit, technicals 5 menit, news 15 menit, fundamentals 24 jam.

**PROMPT:**
```text
Task S1-04. Gunakan desain tabel di roadmap/sprint-1-backend-data.md.
1. Tambah resource DynamoDB `stockai-${sls:stage}` (PK, SK, GSI1PK, GSI1SK, GSI1, TTL di atribut ttl, PAY_PER_REQUEST, PointInTimeRecovery untuk prod) + IAM minimal (GetItem, PutItem, UpdateItem, DeleteItem, Query, BatchGetItem pada tabel & index-nya). Hapus tabel StockChatUsers lama jika masih ada.
2. src/lib/db.ts: DynamoDBDocumentClient (SDK v3) singleton + helper key builders (keys.cache(kind, id), keys.user(sub), ...).
3. src/lib/cache.ts: getOrSet<T>(key, ttlSeconds | (value)=>ttl, loader, {staleWhileError: true}). Jika loader gagal dan ada entri kedaluwarsa < 24 jam (simpan expiresAt terpisah dari ttl DynamoDB, ttl = expiresAt + 24 jam), kembalikan data lama dengan meta.stale = true. Tambahkan coalescing in-memory agar request paralel di container yang sama tidak memanggil provider berkali-kali.
4. src/lib/market-hours.ts: isMarketOpen(exchange, now) untuk US (NYSE 09:30–16:00 America/New_York, Senin–Jumat) dan IDX (konfigurasi sesi sebagai data; tandai TODO verifikasi jam dari idx.co.id). Tanpa daftar hari libur dulu (TODO).
5. Bungkus services/market-data.ts dengan cache sesuai tabel TTL. Response meta.cached = true/false.
6. Test: cache hit, miss, stale-while-error (mock db dengan aws-sdk-client-mock), market-hours untuk beberapa timestamp.
Commit: "feat(api): DynamoDB single-table design with read-through cache [S1-04]"
```

---

## S1-05 🤖 Indikator teknikal asli (⏱️ 5 jam)
**Dependensi:** S1-04

**Kriteria penerimaan:**
- Fungsi murni di `domain/indicators`: `sma`, `ema`, `rsi` (Wilder, 14), `macd` (12,26,9), `bollinger` (20,2), `atr` (14), `supportResistance` (swing pivot 60 candle terakhir), `trend` (harga vs SMA50/SMA200 + slope)
- Hasil diuji terhadap nilai referensi yang diketahui (fixture data + nilai pembanding dari library `technicalindicators` di devDependencies **hanya untuk test**)
- `/v1/technicals` memakai history 1 tahun harian dari cache, mengembalikan nilai + `signals[]` berbasis aturan (bukan LLM)

**PROMPT:**
```text
Task S1-05. Ganti analisis teknikal palsu dengan perhitungan asli.
1. Di backend/src/domain/indicators buat fungsi murni (input number[] atau Candle[], output array sejajar dengan NaN/null di awal): sma, ema, rsiWilder(period=14), macd(12,26,9) → {macd, signal, histogram}, bollinger(20,2), atr(14), swingPivots(candles, lookback=60, window=5) → {supports[], resistances[]} (ambil 2 level terdekat di bawah/atas harga terakhir), trend(close, sma50, sma200, slope20).
2. services/technicals.ts: ambil history range=1y interval=1d (cached), hitung semua indikator, kembalikan nilai TERAKHIR + seri 60 hari terakhir untuk chart kecil, + signals rule-based, misalnya: RSI>70 "overbought", RSI<30 "oversold", MACD cross up/down dalam 3 candle terakhir, golden/death cross SMA50/200 dalam 10 candle, harga di luar Bollinger. Setiap signal: { id, label, severity: 'info'|'bullish'|'bearish', explanation }.
3. Jika candle < 200, kembalikan SMA200 null dan catat di meta.warnings.
4. Handler /v1/technicals + alias lama /technical-analysis. Format response juga memenuhi interface TechnicalAnalysis frontend (lihat packages/shared).
5. Test: fixture 300 candle (simpan JSON di test/fixtures/aapl-1y.json dari respons Yahoo asli), bandingkan output dengan library technicalindicators (devDependency khusus test) dengan toleransi 1e-6; edge case array pendek, harga konstan (RSI=50 / NaN tertangani).
6. Frontend TechnicalAnalysisCard: tampilkan signals dan nilai null dengan "—".
Commit: "feat(api): real technical indicators computed from price history [S1-05]"
```

---

## S1-06 🤖 Endpoint history (candle) (⏱️ 2 jam)
**PROMPT:**
```text
Task S1-06. Buat GET /v1/history?symbol=&range=&interval=.
- range: 1d,5d,1mo,3mo,6mo,1y,5y,max; interval: 1m,5m,15m,1h,1d,1wk. Validasi kombinasi (mis. 1m hanya untuk range 1d/5d) dengan zod refine, error 400 yang jelas.
- Gunakan services/market-data.getHistory dengan TTL cache sesuai interval (lihat tabel S1-04).
- Response: { data: { symbol, currency, exchangeTimezone, candles: [{t, o, h, l, c, v}] }, meta }. t = epoch detik UTC.
- Batasi jumlah candle maksimal 2000 (downsample jika lebih) dan pasang header Cache-Control publik singkat.
- Test handler dengan provider di-mock.
Commit: "feat(api): price history endpoint [S1-06]"
```

---

## S1-07 🤖 Endpoint news nyata + cache (⏱️ 3 jam)
**PROMPT:**
```text
Task S1-07. Tulis ulang endpoint news: GET /v1/news?symbol=AAPL atau ?q=...&limit=10.
1. Gunakan NewsProvider (NewsAPI) dari S1-03; untuk symbol, bangun query dari nama perusahaan (ambil longName dari quote meta Yahoo, cache 7 hari) + ticker, bahasa en (id untuk .JK).
2. Dedupe berdasarkan URL kanonik & judul mirip (normalisasi lowercase, buang tanda baca, Jaccard > 0.8).
3. Skor relevansi sederhana: ticker/nama di judul (+3), di deskripsi (+1), recency (decay per jam). Urutkan.
4. Cache 15 menit per (symbol|q).
5. Jika provider gagal dan tidak ada cache → 503 PROVIDER_UNAVAILABLE (tidak ada berita palsu).
6. Catatan lisensi: NewsAPI free tier hanya untuk development. Tambahkan TODO di docs dan opsi provider alternatif (Finnhub company-news / Marketaux) sebagai adapter kedua yang bisa diaktifkan via env NEWS_PROVIDERS.
7. Test dedupe & scoring.
Commit: "feat(api): real news endpoint with dedupe, relevance and caching [S1-07]"
```

---

## S1-08 🤖 Proyeksi kuantitatif (ganti "prediksi AI" acak) (⏱️ 4 jam)
**Prinsip:** angka berasal dari statistik yang bisa dijelaskan; LLM (Sprint 2) hanya menarasikan.

**PROMPT:**
```text
Task S1-08. Ganti /ai-prediction dengan GET /v1/projection?symbol=&horizon=5d|1mo|3mo.
1. services/projection.ts: dari history harian 1-2 tahun, hitung log return, volatilitas historis (annualized, 20d & 60d), drift (rata-rata log return 1 tahun, di-shrink 50% ke 0 agar konservatif).
2. Proyeksikan rentang harga untuk horizon dengan asumsi lognormal: median, band 68% dan 95% (p2.5, p16, p50, p84, p97.5). Sertakan juga "historical analog" sederhana: distribusi return horizon yang sama dalam 2 tahun terakhir (persentil empiris).
3. Response: { data: { symbol, current, horizonDays, method: 'lognormal-hv', bands: {...}, empirical: {...}, volatility: {...} }, meta }. TIDAK ada field "recommendation buy/sell".
4. Alias lama /ai-prediction dipetakan ke sini; frontend PredictionChart diubah menampilkan fan chart (band 68/95) alih-alih satu titik prediksi, plus teks "Rentang ini berdasarkan volatilitas historis, bukan jaminan."
5. Test: fungsi statistik dengan data sintetis deterministik (return konstan, volatilitas diketahui).
Commit: "feat(api): statistical price projection replaces random prediction [S1-08]"
```

---

## S1-09 🤝 Observability (⏱️ 3 jam)
**PROMPT:**
```text
Task S1-09.
1. Pasang @aws-lambda-powertools/logger, metrics, tracer (dan parameters jika ingin fetch SSM saat runtime). Integrasikan ke wrapper handler: log terstruktur JSON dengan requestId, userId (hash), route, latency, cache hit; metric kustom namespace StockAI: ProviderLatency, ProviderError (dimensi provider, kind), CacheHit, CacheMiss.
2. Aktifkan tracing X-Ray di serverless.yml (provider.tracing.lambda & apiGateway sesuai dukungan HTTP API).
3. Set log retention 14 hari (dev) / 30 hari (prod).
4. Tambahkan CloudWatch Alarm via resources: error rate Lambda > 5% 5 menit, p95 latency /v1/quote > 2 dtk, ProviderError > 20/5 menit. Target SNS topic stockai-alerts-${stage} dengan subscription email dari env ALERT_EMAIL.
5. Ganti console.log lama dengan logger. Jangan log token/PII.
Commit: "feat(ops): structured logging, metrics, tracing and alarms [S1-09]"
```
**Manual:** konfirmasi email subscription SNS; AWS Billing → Budgets → buat budget bulanan (mis. USD 20) dengan alert 50/80/100%.

---

## S1-10 🤖 Frontend API client + TanStack Query (⏱️ 4 jam)
**Dependensi:** S1-02 s/d S1-08

**PROMPT:**
```text
Task S1-10.
1. Buat frontend/src/api/client.ts: apiFetch<T>(path, {query, schema}) yang menambahkan Authorization (Amplify fetchAuthSession), base URL VITE_API_URL, parsing { data, meta } dan error { error: {code, message} } menjadi ApiError bertipe, validasi response dengan zod schema dari @stockai/shared.
2. Buat hooks TanStack Query: useQuote(symbol), useHistory(symbol, range, interval), useTechnicals(symbol), useNews({symbol|q}), useProjection(symbol, horizon) dengan staleTime yang selaras dengan TTL backend, retry hanya untuk error jaringan/5xx, refetchInterval quote 30 dtk saat tab aktif.
3. Pasang QueryClientProvider di App.tsx bila belum ada.
4. Refactor StockCard, TechnicalAnalysisCard, PredictionChart, NewsCard agar bisa menerima data dari hooks (props tetap didukung untuk dipakai chat).
5. Hapus awsLambdaService.ts & bagian fetch di stockMarketAPI.ts yang tergantikan (keyword routing chat tetap dulu, diganti di S2-06).
6. Hapus route alias lama di backend (/stock-price, /technical-analysis, /market-news, /ai-prediction) setelah frontend tidak memakainya.
Commit: "feat(web): typed API client with TanStack Query hooks [S1-10]"
```

**Penutup sprint:** jalankan prompt "Penutup sprint" dari `README.md`, deploy dev → prod, tag `v0.3.0`.
