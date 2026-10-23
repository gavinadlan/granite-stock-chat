# Sprint 6 (Opsional): Kecerdasan Lanjut & Bisnis (Minggu 13+)

Kerjakan setelah v1.0.0 berjalan dan ada data pemakaian nyata. Prioritaskan berdasarkan metrik (retensi, permintaan user).

---

## S6-01 🤖🧠 RAG berita & dokumen (⏱️ 8 jam)
**PROMPT:**
```text
Task S6-01. Buat rencana dulu, termasuk estimasi biaya bulanan tiap opsi vector store.
Tujuan: jawaban AI bisa mengutip berita/dokumen dengan sumber.
1. Pipeline ingest terjadwal (tiap jam): ambil berita untuk semua symbol di watchlist user + 50 saham populer (US & IDX), bersihkan, potong (chunk ~500 token, overlap 50), buat embedding (pilih: Amazon Bedrock Titan/Cohere embed, atau model embedding IBM Granite), simpan ke vector store.
2. Pilihan vector store (bandingkan & rekomendasikan): Postgres pgvector (Neon/Supabase serverless), OpenSearch Serverless (mahal minimum), Amazon S3 Vectors bila tersedia di region, atau LanceDB di S3. Pertimbangkan biaya minimum bulanan.
3. Tool search_news_context(symbol?, query, days) → top-k chunk dengan URL, judul, tanggal. Orchestrator wajib menyertakan sitasi [1], [2] yang dirender UI sebagai tautan.
4. Retensi 90 hari, dedupe berdasarkan URL kanonik.
5. Tambah kasus eval (S2-08) untuk pertanyaan "kenapa saham X turun minggu ini?" yang harus mengutip sumber.
Commit: "feat(ai): retrieval-augmented answers with cited news sources [S6-01]"
```

---

## S6-02 🤖 Tier & kuota berbayar (⏱️ 5 jam)
| Tier | Chat/hari | Watchlist | Alert aktif | Portfolio | Briefing | Data |
|---|---|---|---|---|---|---|
| Free | 30 | 20 | 5 | 1 | ✗ | delay |
| Pro | 300 | 200 | 100 | 10 | ✓ | real-time (jika lisensi) |

**PROMPT:**
```text
Task S6-02. Implementasikan entitlements.
1. packages/shared/src/plans.ts: definisi tier & limit (tabel di roadmap/sprint-6-opsional-bisnis.md) sebagai satu sumber kebenaran.
2. Profile menyimpan plan & planExpiresAt; services/entitlements.ts: getLimits(userId), assertWithinLimit(kind).
3. Ganti angka limit hardcode di quota, watchlist, alerts, portfolio, briefing dengan entitlements.
4. UI: badge plan di header, halaman /pricing, pesan upgrade yang sopan saat limit tercapai.
5. Test setiap batas untuk free & pro.
Commit: "feat: plan-based entitlements and pricing page [S6-02]"
```

---

## S6-03 🤝🧠 Pembayaran (⏱️ 8 jam)
**Manual dulu:** daftar merchant **Midtrans** atau **Xendit** (butuh legalitas usaha/NPWP untuk produksi), ambil sandbox keys, simpan di SSM.

**PROMPT:**
```text
Task S6-03. Buat rencana dulu. Provider pembayaran: <Midtrans/Xendit>, mode sandbox.
1. POST /v1/billing/checkout {plan, period: monthly|yearly} → buat transaksi (Snap token / invoice) dengan order_id unik tersimpan di DynamoDB (status PENDING).
2. Webhook publik POST /v1/billing/webhook: verifikasi signature sesuai dokumentasi provider, idempoten (ConditionExpression pada status), update plan & planExpiresAt saat settlement/paid; tangani expire/cancel/refund.
3. Recurring: jika provider tidak mendukung langganan otomatis untuk metode tertentu, kirim email pengingat perpanjangan H-3 & H-0 (scheduler) dan turunkan ke Free saat kedaluwarsa.
4. Halaman /billing: status plan, riwayat pembayaran, tombol perpanjang.
5. Test webhook dengan payload contoh (signature valid/invalid, duplikat).
Commit: "feat(billing): subscription checkout and webhook handling [S6-03]"
```

---

## S6-04 🧑 Lisensi data & legal (⏱️ 4 jam, non-kode)
Sebelum menerima pembayaran:
- [ ] **Data harga:** endpoint Yahoo Finance tidak untuk penggunaan komersial. Evaluasi provider berlisensi: Polygon.io, Finnhub, Twelve Data, EODHD, dan untuk IDX: data vendor resmi BEI/IDX Data Services. Bandingkan harga, cakupan IDX, delay, hak redistribusi tampilan.
- [ ] **Berita:** NewsAPI free tier hanya untuk development; pilih plan berbayar atau provider lain (Marketaux, Finnhub news) yang mengizinkan tampilan komersial.
- [ ] **LLM:** cek ketentuan penggunaan komersial model Granite (lisensi model Apache 2.0) & ketentuan Replicate/watsonx.
- [ ] **Regulasi:** konsultasi singkat terkait ketentuan **OJK** untuk layanan yang memberikan informasi/analisis investasi (pastikan posisi sebagai alat edukasi/informasi, bukan penasihat investasi berizin). Konsultasikan ke profesional hukum.
- [ ] **Privasi:** kepatuhan **UU PDP** (UU 27/2022): dasar pemrosesan, hak hapus data (sudah ada S3-05), pemberitahuan privasi.
- [ ] Badan usaha & NPWP untuk merchant pembayaran.
