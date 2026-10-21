# Sprint 3: Fitur yang Membuat User Kembali (Minggu 7–8)

**Tujuan sprint:** watchlist, chart interaktif, price alert, portfolio tracker, preferensi user.
**Rilis:** `v0.5.0`

---

## S3-01 🤖 Watchlist (⏱️ 5 jam)
**Kriteria penerimaan:**
- CRUD watchlist (maks 50 symbol di free tier), urutan bisa diatur (drag)
- Sidebar/halaman watchlist menampilkan harga & % perubahan (batch fetch, refresh 30 dtk)
- Tool AI `get_watchlist` & `add_to_watchlist` ("tambahkan BBCA ke watchlist saya")
- Tombol ⭐ di StockCard

**PROMPT:**
```text
Task S3-01.
Backend:
1. Item: PK USER#<sub>, SK WATCH#<symbol>, atribut symbol, addedAt, position (number), note?.
2. services/watchlist.ts: list (Query begins_with WATCH#, urut position), add (validasi symbol ada via get_quote/search, batas 50 → 409 LIMIT_REACHED), remove, reorder(symbols[]) (batch update position).
3. GET /v1/quotes?symbols=AAPL,MSFT,BBCA.JK (maks 50): ambil quote paralel dengan cache (BatchGetItem cache dulu, sisanya ke provider dengan konkurensi 5).
4. Endpoint httpApi + JWT: GET/POST/DELETE /v1/watchlist, PUT /v1/watchlist/order.
5. Tools AI get_watchlist & add_to_watchlist/remove_from_watchlist (pakai service yang sama; argumen divalidasi).
Frontend:
6. features/watchlist: useWatchlist (TanStack Query + optimistic update), WatchlistPanel (di sidebar chat & halaman /watchlist), drag reorder dengan @dnd-kit/sortable, harga dari useQuotes(symbols) refetch 30 dtk saat tab aktif, warna naik/turun + aria-label.
7. Tombol ⭐ toggle di StockCard.
8. Klik item watchlist → isi composer "Analisis <symbol>" atau buka halaman detail (S3-02).
Test: service watchlist (limit, duplikat), komponen WatchlistPanel (render, optimistic remove).
Commit: "feat: watchlist with live quotes and AI tools [S3-01]"
```

---

## S3-02 🤖 Halaman detail saham + chart candlestick (⏱️ 5 jam)
**PROMPT:**
```text
Task S3-02. Halaman /stock/:symbol.
1. Pakai library lightweight-charts (TradingView, Apache-2.0; cek versi stabil terbaru & API-nya di dokumentasi resmi karena v4 dan v5 berbeda). Komponen PriceChart({symbol}) dengan: candlestick + volume histogram, pilihan range (1D,5D,1M,6M,1Y,5Y) yang memetakan ke range/interval /v1/history, overlay toggle SMA20/50/200 & Bollinger (dihitung di backend: tambahkan opsi ?overlays=sma20,sma50 ke /v1/technicals yang mengembalikan seri), panel RSI & MACD kecil di bawah.
2. Tema mengikuti dark/light mode, resize responsif (ResizeObserver), crosshair tooltip OHLC.
3. Header halaman: nama, harga live (useQuote), perubahan, tombol ⭐ watchlist, tombol "Tanya AI tentang saham ini" (buka chat dengan prompt terisi).
4. Tab: Ringkasan (StockCard + sinyal teknikal), Proyeksi (PredictionChart fan chart), Berita (NewsCard).
5. Lazy-load halaman ini (React.lazy) supaya library chart tidak masuk bundle awal.
6. Di chat, card "history" menampilkan mini chart yang bisa diklik menuju halaman ini.
Commit: "feat(web): stock detail page with candlestick chart and indicators [S3-02]"
```

---

## S3-03 🤝🧠 Price alerts + scheduler + email (⏱️ 8 jam)
**Desain:**
- Tipe alert: `price_above`, `price_below`, `pct_change_day` (±X%), `rsi_above`, `rsi_below`
- Item: PK `USER#<sub>` SK `ALERT#<id>`; GSI1PK `ALERT#ACTIVE#<symbol>` GSI1SK `<userId>#<id>`
- EventBridge Scheduler tiap 5 menit → Lambda `evaluateAlerts`: query GSI per symbol aktif, ambil quote (cache), evaluasi, kirim notifikasi, set `triggeredAt` & nonaktifkan (atau cooldown untuk recurring)
- Notifikasi: email via **Amazon SES** (fase awal), Web Push di S4-06

**Manual dulu:**
1. SES (us-east-1) → verifikasi domain `gavinadlan.my.id` (DKIM via DNS) → buat identity `alerts@stockai.gavinadlan.my.id`.
2. Ajukan **production access** SES (keluar dari sandbox). Saat sandbox, email hanya bisa ke alamat terverifikasi.

**PROMPT:**
```text
Task S3-03. Buat rencana dulu. Gunakan desain di roadmap/sprint-3-fitur-user.md.
Backend:
1. services/alerts.ts: create (validasi: maks 20 alert aktif per user, symbol valid, threshold masuk akal), list, update (aktif/nonaktif), delete. Item + GSI1 sesuai desain; saat nonaktif hapus atribut GSI1PK agar keluar dari index (sparse index).
2. Endpoint httpApi + JWT: GET/POST /v1/alerts, PATCH/DELETE /v1/alerts/{id}.
3. Fungsi evaluateAlerts dengan event schedule rate(5 minutes) (EventBridge Scheduler/schedule event). Hanya jalan jika market terkait buka (market-hours) kecuali alert pct_change_day. Ambil daftar symbol aktif (scan GSI1 terbatas atau simpan set symbol aktif di item META#ALERT_SYMBOLS), kelompokkan per symbol, satu quote per symbol, evaluasi semua alert-nya.
4. Idempotensi: update alert dengan ConditionExpression attribute_not_exists(triggeredAt) sebelum kirim email agar tidak ganda.
5. services/notify.ts: kirim email via @aws-sdk/client-sesv2 dengan template HTML sederhana (subjek "🔔 AAPL di atas $250", isi harga, waktu, tautan ke /stock/AAPL, tautan kelola alert, disclaimer). Alamat email diambil dari Cognito (AdminGetUser, perlu IAM) atau disimpan di profile saat login.
6. Tool AI create_price_alert ("ingatkan saya kalau BBCA di bawah 9000") → konfirmasi di jawaban.
7. Metric AlertsEvaluated, AlertsTriggered; alarm jika evaluateAlerts error.
Frontend:
8. Halaman /alerts: daftar, buat (form: symbol autocomplete, tipe, nilai), toggle aktif, hapus, riwayat triggered. Tombol "Buat alert" di halaman detail saham.
Test: evaluasi kondisi tiap tipe, idempotensi, batas jumlah.
Commit: "feat: price alerts with scheduled evaluation and email notifications [S3-03]"
```

---

## S3-04 🤖🧠 Portfolio tracker (⏱️ 8 jam)
**Desain:** transaksi adalah sumber kebenaran; posisi dihitung (metode **average cost**, sesuai praktik umum di Indonesia).
- Transaksi: PK `USER#<sub>` SK `TX#<portfolioId>#<date>#<id>`: `type` (BUY/SELL/DIVIDEND/FEE), `symbol`, `quantity` (lembar), `price`, `fee`, `currency`, `date`, `note`
- Portfolio: PK `USER#<sub>` SK `PORTFOLIO#<id>`: `name`, `baseCurrency` (IDR/USD)

**PROMPT:**
```text
Task S3-04. Buat rencana dulu. Gunakan desain di roadmap/sprint-3-fitur-user.md.
1. packages/shared/src/portfolio.ts: fungsi murni computePositions(transactions, quotes, fxRates) → per symbol: quantity, avgCost, costBasis, marketValue, unrealizedPL, unrealizedPLPct, realizedPL, dividends; total portfolio + alokasi %. Metode average cost; SELL melebihi kepemilikan → error validasi. Semua perhitungan uang dalam integer sen/unit terkecil atau decimal.js untuk menghindari floating error.
2. Unit test ekstensif: beli bertahap, jual sebagian, jual habis lalu beli lagi, dividen, fee, multi currency (USD saham US, IDR saham .JK) dengan kurs dari provider (Yahoo "USDIDR=X", cache 1 jam).
3. Backend CRUD: /v1/portfolios, /v1/portfolios/{id}/transactions (POST/GET/DELETE), GET /v1/portfolios/{id}/summary (hitung server-side dengan quote ter-cache).
4. Import CSV transaksi (kolom: date,type,symbol,quantity,price,fee,currency) dengan validasi per baris & laporan error.
5. Frontend /portfolio: kartu ringkasan (nilai, P/L hari ini, P/L total), tabel posisi (sortable), donut alokasi (recharts), riwayat transaksi, form tambah transaksi (untuk .JK input dalam lot dan dikonversi ke lembar ×100), import CSV.
6. Tool AI get_portfolio_summary ("bagaimana kinerja portofolio saya?"). AI hanya menjelaskan, tidak menyarankan beli/jual pasti.
Commit: "feat: portfolio tracker with average-cost P/L and CSV import [S3-04]"
```

---

## S3-05 🤖 Preferensi user (⏱️ 3 jam)
**PROMPT:**
```text
Task S3-05. Item profile PK USER#<sub> SK PROFILE: displayName, locale ('id'|'en'), defaultMarket ('US'|'IDX'), baseCurrency ('IDR'|'USD'), timezone (default dari browser), emailAlerts (bool), dailyBriefing (bool, dipakai S4-05), createdAt.
1. GET/PUT /v1/me/profile (buat default saat pertama kali GET).
2. Ubah SettingsPage agar memakai endpoint ini (hapus penyimpanan localStorage untuk data yang kini di server; localStorage hanya untuk tema).
3. Orchestrator membaca locale & defaultMarket untuk system prompt (mis. "BBCA" tanpa suffix → .JK jika defaultMarket IDX).
4. Tombol "Hapus akun & data": hapus semua item USER#<sub> + percakapan + Cognito user (endpoint DELETE /v1/me, perlu IAM cognito-idp:AdminDeleteUser), dengan konfirmasi ketik "HAPUS".
Commit: "feat: user preferences and account deletion [S3-05]"
```

**Penutup sprint:** prompt "Penutup sprint", deploy, tag `v0.5.0`.
