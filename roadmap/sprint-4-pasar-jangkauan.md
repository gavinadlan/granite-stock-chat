# Sprint 4: Pasar Indonesia & Jangkauan (Minggu 9–10)

**Tujuan sprint:** StockAI terasa "lokal" (saham IDX + Bahasa Indonesia), punya fitur analisis lanjutan, dan bisa dipasang seperti aplikasi.
**Rilis:** `v0.6.0`

---

## S4-01 🤖 Dukungan saham IDX (⏱️ 6 jam)
**Hal yang perlu diverifikasi manual dari idx.co.id sebelum/ sesudah prompt:** jam sesi perdagangan terbaru (berbeda untuk hari Jumat), tabel fraksi harga (tick size), dan daftar hari libur bursa tahun berjalan.

**PROMPT:**
```text
Task S4-01. Buat StockAI mendukung Bursa Efek Indonesia dengan baik.
1. packages/shared/src/markets/idx.ts sebagai data/konfigurasi (bukan logika tersebar): sesi perdagangan per hari (Senin–Kamis & Jumat berbeda), zona Asia/Jakarta, ukuran lot 100 lembar, tabel fraksi harga per rentang harga, batas auto rejection jika ingin ditampilkan. Beri komentar "verifikasi dengan idx.co.id, terakhir dicek: <tanggal>" dan TODO hari libur (struktur array tanggal per tahun).
2. Integrasikan ke market-hours (S1-04) sehingga TTL cache & evaluasi alert memahami jam IDX + hari libur.
3. Normalisasi simbol: "BBCA" / "bbca" / "BBCA.JK" → "BBCA.JK" bila defaultMarket user IDX atau symbol ada di daftar emiten IDX. Buat daftar emiten (kode, nama, sektor) sebagai JSON di packages/shared/data/idx-listings.json + script scripts/update-idx-listings.ts (sumber publik yang diizinkan; jika tidak ada sumber otomatis yang jelas, buat format & isi 100 emiten likuid secara manual dan tandai TODO). Gunakan juga untuk autocomplete & tool search_symbol.
4. Format: Rupiah tanpa desimal (Rp9.875), volume dalam lot, perubahan dalam poin & %, singkatan triliun/miliar (T/M) untuk market cap. Perbarui currencyUtils & komponen kartu.
5. Berita IDX: query NewsAPI bahasa id + nama emiten; siapkan adapter sumber berita lokal (RSS) sebagai TODO.
6. Halaman landing & chat: contoh pertanyaan IDX ("Bagaimana teknikal BBRI?", "Bandingkan BBCA dan BMRI").
7. Test: normalisasi simbol, fraksi harga, jam sesi (Jumat, istirahat siang, di luar jam).
Commit: "feat: first-class Indonesia Stock Exchange (IDX) support [S4-01]"
```

---

## S4-02 🤖 i18n Indonesia/Inggris (⏱️ 4 jam)
**PROMPT:**
```text
Task S4-02.
1. Pasang i18next + react-i18next + i18next-browser-languagedetector. Resource di frontend/src/locales/{id,en}/{common,chat,stock,portfolio,alerts,settings,landing}.json.
2. Ekstrak SEMUA string UI ke key i18n (gunakan namespace). Default bahasa: profile.locale (S3-05) → deteksi browser → 'id'.
3. Format angka/tanggal/mata uang melalui helper berbasis Intl yang menerima locale aktif.
4. Pemilih bahasa di header & Settings (menyimpan ke profile).
5. Email (alert/briefing) memakai locale user di backend (template id/en).
6. Tambahkan test sederhana yang memastikan key id & en sama (tidak ada key hilang) dan jalankan di CI.
Commit: "feat(web): Indonesian and English localization [S4-02]"
```

---

## S4-03 🤖 Perbandingan saham (⏱️ 3 jam)
**PROMPT:**
```text
Task S4-03.
1. services/compare.ts: untuk 2–4 symbol ambil quote, return 1M/3M/1Y/YTD (dari history), volatilitas 60d, RSI, posisi terhadap SMA200, dan fundamental dasar jika tersedia (S4-04, optional field). Seri harga ternormalisasi (=100 di awal periode) untuk chart.
2. GET /v1/compare?symbols=&range= dan tool AI compare_symbols yang menghasilkan card "comparison".
3. Komponen ComparisonCard: tabel metrik (highlight terbaik per baris tanpa memberi label "pilih ini") + line chart ternormalisasi (recharts). Halaman /compare dengan input multi-symbol.
4. Saham beda mata uang: tampilkan return dalam %, harga dalam mata uang asli.
Commit: "feat: stock comparison tool and view [S4-03]"
```

---

## S4-04 🤖 Fundamental + kalender earnings/dividen (⏱️ 5 jam)
**Catatan:** endpoint fundamental Yahoo tidak resmi dan sering membutuhkan cookie/crumb. Pertimbangkan provider berlisensi (Financial Modeling Prep, Finnhub, Alpha Vantage OVERVIEW) lewat adapter.

**PROMPT:**
```text
Task S4-04.
1. Interface FundamentalsProvider { getProfile(symbol) (nama, sektor, industri, deskripsi singkat, website), getKeyStats(symbol) (marketCap, P/E ttm, forward P/E, P/B, EPS, dividend yield, ROE, debt/equity, 52w high/low, beta), getEvents(symbol) (tanggal earnings berikutnya, ex-dividend, dividen terakhir) }.
2. Implementasi awal AlphaVantage (OVERVIEW, EARNINGS) + slot provider lain via env FUNDAMENTALS_PROVIDER. Field yang tidak tersedia → null, jangan diisi tebakan. Cache 24 jam.
3. GET /v1/fundamentals?symbol= dan tool get_fundamentals (card "fundamentals"). Komponen FundamentalsCard dengan penjelasan singkat tiap metrik (tooltip, ditujukan untuk investor pemula).
4. Kalender: GET /v1/calendar?scope=watchlist → event earnings/dividen 30 hari ke depan untuk saham di watchlist; tampilkan di halaman /calendar dan widget kecil di sidebar.
5. Test parser provider dengan fixture.
Commit: "feat: fundamentals and earnings/dividend calendar [S4-04]"
```

---

## S4-05 🤝 Daily briefing email (⏱️ 4 jam)
**PROMPT:**
```text
Task S4-05.
1. Fungsi dailyBriefing terjadwal (EventBridge Scheduler) jam 07:30 Asia/Jakarta hari bursa: untuk setiap user dengan profile.dailyBriefing = true (query sparse GSI1PK = BRIEFING#ON), kumpulkan: perubahan watchlist kemarin (top gainer/loser), sinyal teknikal baru, event kalender hari ini, 3 berita teratas.
2. Ringkasan naratif singkat (≤ 150 kata) dibuat LLM dari data tersebut dengan prompt khusus (tanpa rekomendasi beli/jual), bahasa sesuai locale.
3. Kirim email via SES (template HTML responsif, tautan unsubscribe satu klik dengan token bertanda tangan HMAC → endpoint publik GET /v1/unsubscribe?token=).
4. Proses dalam batch (fan-out ke SQS jika user > 100: satu pesan per user, Lambda consumer konkurensi terbatas) agar tidak timeout dan tidak melebihi rate SES.
5. Toggle di Settings + pratinjau "Kirim contoh ke email saya".
Commit: "feat: personalized daily briefing email [S4-05]"
```
**Manual:** pastikan SES sudah production access; cek kuota kirim SES.

---

## S4-06 🤖 PWA (⏱️ 3 jam)
**PROMPT:**
```text
Task S4-06.
1. Pasang vite-plugin-pwa: manifest (nama StockAI, ikon 192/512 + maskable dari logo yang ada, theme color), service worker strategi: app shell precache, API → NetworkOnly (data finansial tidak boleh basi tanpa label), font/gambar → CacheFirst.
2. Prompt "Pasang aplikasi" yang tidak mengganggu (setelah 2 kunjungan), halaman offline sederhana.
3. Web Push untuk alert (opsional dalam task ini jika waktu cukup): VAPID key di SSM, endpoint POST /v1/push/subscribe, simpan subscription di DynamoDB, services/notify kirim push via library web-push sebagai kanal kedua selain email; toggle di Settings.
4. Uji Lighthouse PWA checklist.
Commit: "feat(web): installable PWA with optional web push for alerts [S4-06]"
```

---

## S4-07 🤖 Share insight link (⏱️ 3 jam)
**PROMPT:**
```text
Task S4-07. User bisa membagikan satu jawaban AI.
1. POST /v1/shares { conversationId, messageId } → buat snapshot (teks + cards + waktu data) di S3 bucket privat atau item DynamoDB SHARE#<id> (id acak 12 char), kembalikan URL https://stockai.gavinadlan.my.id/s/<id>. Hapus share: DELETE /v1/shares/{id}.
2. GET /v1/shares/{id} publik (tanpa auth), rate-limit via throttling, tidak memuat data pribadi (nama/email user tidak ditampilkan; portfolio card tidak boleh dibagikan → tolak).
3. Halaman /s/:id read-only menampilkan snapshot dengan label "Snapshot data per <waktu>", disclaimer, dan CTA "Coba StockAI".
4. Meta tag Open Graph dasar (judul, deskripsi) via halaman statis; catat bahwa OG dinamis butuh Lambda@Edge/CloudFront Function (TODO).
Commit: "feat: shareable read-only insight snapshots [S4-07]"
```

**Penutup sprint:** prompt "Penutup sprint", deploy, tag `v0.6.0`.
