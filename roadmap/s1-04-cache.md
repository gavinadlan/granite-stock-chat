# S1-04a: DynamoDB single-table + read-through cache (scoped)

Versi S1-04 yang disesuaikan dengan kode saat ini. Desain tabel & TTL mengikuti `roadmap/sprint-1-backend-data.md` (bagian S1-04).
Beda dari versi asli: S1-03 (adapter/retry/circuit breaker) belum ada, jadi cache dipasang di `backend/src/services/*` yang ada
(`quote`, `history`, `technicals`, `news`). Tidak ada `market-data.ts`. Retry/circuit breaker tetap di S1-03.

## PROMPT
```text
Task S1-04a. Baca CLAUDE.md dan roadmap/s1-04-cache.md, lalu roadmap/sprint-1-backend-data.md bagian S1-04 (desain tabel + tabel TTL). Kerjakan di branch feat/S1-04-cache dari main terbaru. Tampilkan rencana singkat dulu, lalu langsung kerjakan.

Lingkup:
1. serverless.yml: tabel DynamoDB `stockai-${sls:stage}` (PK, SK, GSI1PK, GSI1SK, GSI1, TTL atribut `ttl`, PAY_PER_REQUEST, PITR hanya prod) + IAM minimal (GetItem, PutItem, UpdateItem, DeleteItem, Query, BatchGetItem pada tabel & index). Tambah env TABLE_NAME. JANGAN hapus tabel StockChatUsers dan JANGAN ubah DeletionPolicy-nya; cukup catat di ringkasan bahwa penghapusannya jadi langkah manual terpisah setelah dicek kosong.
2. src/lib/db.ts: DynamoDBDocumentClient (SDK v3) singleton + key builders (keys.cache(kind, id)).
3. src/lib/cache.ts: getOrSet<T>(key, ttl | (value)=>ttl, loader, { staleWhileError: true }). Simpan expiresAt terpisah dari ttl DynamoDB (ttl = expiresAt + 24 jam). Jika loader gagal dan ada entri kedaluwarsa < 24 jam, kembalikan data lama dengan meta.stale = true. Coalescing in-memory agar request paralel di container yang sama tidak memanggil provider berkali-kali. Kegagalan DynamoDB (baca/tulis) TIDAK boleh menggagalkan request: log lalu lanjut ke loader.
4. src/lib/market-hours.ts: isMarketOpen(exchange, now) untuk US (NYSE 09:30-16:00 America/New_York, Senin-Jumat) dan IDX (sesi sebagai data konfigurasi; tandai TODO verifikasi jam dari idx.co.id, tanpa daftar libur dulu).
5. Bungkus services quote, history, technicals, news dengan cache sesuai tabel TTL (quote 30 dtk saat bursa buka / 15 menit saat tutup; history 1d: 6 jam, intraday: 2 menit; technicals 5 menit; news 15 menit). Key cache memuat symbol ter-normalisasi + parameter (range/interval) supaya tidak bentrok. Response meta menambah cached: boolean dan stale?: boolean; waktu data (asOf) tetap waktu data asli dari provider, BUKAN waktu cache dibuat.
6. Jangan cache respons error/kosong. Jangan cache projection/Replicate di task ini.
7. Frontend: bila meta.stale true, tampilkan badge kecil "Data tertunda (cache)" di DataSourceBadge dengan teks jujur; tidak ada perubahan lain.
8. Test (Vitest + aws-sdk-client-mock): cache hit, miss, expired, stale-while-error, DynamoDB down tetap melayani dari loader, coalescing, market-hours untuk beberapa timestamp (termasuk batas buka/tutup dan akhir pekan, zona DST US).
9. Update docs/API.md (meta.cached/stale), roadmap/README.md (S1-04 -> 🟡 dengan catatan "scoped, S1-03 menyusul"), dan tandai UI-01..04 serta S3-02a sesuai status sebenarnya.

Aturan: tidak ada Math.random() data, tidak ada secret baru, TypeScript strict. Dependency baru hanya @aws-sdk/lib-dynamodb dan @aws-sdk/client-dynamodb (sebut alasannya) serta aws-sdk-client-mock (dev).
Commit terpisah per bagian, format: feat(api): ... [S1-04].
JANGAN deploy dan JANGAN merge. Jalankan lint, typecheck, test, build di Node 20. Buka PR.
Ringkasan akhir: file diubah, cara test manual, dan langkah manual tersisa (deploy dev dengan profil admin, cek item di tabel, hapus StockChatUsers nanti).
```

## Verifikasi manual (oleh saya + developer)
1. Deploy dev dengan profil admin, panggil `/v1/quote?symbol=AAPL` dua kali: panggilan kedua `meta.cached = true`, latensi turun.
2. DynamoDB console: item `CACHE#quote#AAPL` ada dengan atribut `ttl`.
3. Cek `asOf` pada respons cache tetap waktu data asli, bukan waktu request.
