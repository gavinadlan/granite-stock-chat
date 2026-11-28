# S3-02a: Halaman detail saham + chart candlestick (versi yang bisa dikerjakan sekarang)

> Versi sempit dari S3-02 di sprint-3-fitur-user.md. Bagian yang bergantung pada task lain DITUNDA (lihat "Ditunda").
> Prasyarat: PR #4 (S1-06, GET /v1/history) sudah di-merge dan backend dev sudah di-deploy.
> Branch: feat/S3-02-stock-detail-chart (dari main terbaru).

## PROMPT
```text
Baca CLAUDE.md, roadmap/ui-redesign.md, dan file ini. Kerjakan S3-02a. Hanya ubah frontend/ (dan docs/roadmap). Jalankan nvm use dulu. Cek dengan curl ke VITE_API_URL (frontend/.env.local) bahwa /v1/history sudah aktif; kalau belum, berhenti dan beri tahu saya.

Tujuan: halaman publik /stock/:symbol dengan chart candlestick dari data asli, plus sparkline di kartu harga.

1. API client: tambah getHistory(symbol, range, interval) di lapisan service yang ada (stockMarketAPI/apiClient), tipe dari @stockai/shared (HistoryResponse). Respons backend berbentuk {data, meta}; tangani meta.warnings (mis. data di-downsample) dengan catatan kecil di bawah chart. Gagal → pesan jujur + Try again; tidak ada data cadangan atau palsu.
2. Library: lightweight-charts (TradingView, Apache-2.0). Cek versi stabil terbaru dan API resminya (v4 dan v5 berbeda), jangan menebak. Sebutkan alasan dan ukuran bundle di ringkasan. Muat lewat React.lazy dan dynamic import: landing dan chat tidak boleh membesar. Bandingkan ukuran bundle awal sebelum dan sesudah.
3. Komponen PriceChart({symbol}):
   - Candlestick + histogram volume. Pilihan range: 1D, 5D, 1M, 6M, 1Y, 5Y dengan pemetaan: 1D→1d/5m, 5D→5d/15m, 1M→1mo/1d, 6M→6mo/1d, 1Y→1y/1d, 5Y→5y/1wk. Default 6M.
   - Warna candle naik/turun dari token --up/--down (ini memang arah harga, jadi sah). lightweight-charts tidak membaca CSS variable: baca nilai terhitung dari getComputedStyle, ubah ke warna yang diterima library, dan terapkan ulang saat dark mode berganti. Latar, grid, dan teks dari token yang sama; tanpa class dark: manual.
   - Sumbu waktu memakai exchangeTimezone dari respons (fallback UTC) lewat Intl.DateTimeFormat; jam IDX harus tampil WIB.
   - Crosshair dengan keterangan OHLC + volume (format angka lewat formatPrice/formatVolume yang sudah ada, locale mata uang).
   - Responsif lewat ResizeObserver, dibersihkan saat unmount (chart.remove()). Hormati prefers-reduced-motion.
   - Aksesibilitas: wadah chart role="img" dengan aria-label berisi ringkasan teks (simbol, range, harga awal → akhir, tertinggi/terendah) yang dibuat oleh kode dari data; tombol range berupa radio group yang bisa dipakai keyboard; sediakan tabel data tersembunyi atau tombol "Show data table" untuk 10 candle terakhir.
4. Halaman /stock/:symbol (PUBLIK, tanpa ProtectedRoute, React.lazy):
   - Header: nama + simbol, harga, PriceChange, badge Delayed, sumber + waktu (WIB), tombol "Ask AI about this stock" yang membuka /chat?q=Technical analysis <symbol> (query ?q= sudah didukung).
   - Isi: PriceChart, lalu dua tab: Summary (StockCard + TechnicalAnalysisCard yang sudah ada) dan News (NewsCard; kalau news memerlukan login atau key, tampilkan keadaan kosong yang jujur).
   - Simbol tidak valid / tidak ditemukan → state "Symbol not found" dengan tautan kembali, bukan halaman kosong.
   - Judul halaman dinamis (document.title) sesuai simbol.
5. Sparkline: isi slot TODO(S1-06) di StockCard.tsx dengan sparkline SVG sederhana (tanpa library) dari history 1mo/1d. Data dimuat malas dan gagal diam-diam (kartu tetap tampil tanpa sparkline, tanpa error). Dekoratif: aria-hidden, warna mengikuti arah harga.
6. Tautan: kartu harga di chat dan item TickerStrip di landing menjadi link ke /stock/:symbol (TickerStrip: link tidak boleh merusak jeda saat hover/fokus). Pastikan formatSymbol/URL-encode benar untuk ^JKSE, BBCA.JK, BRK-B.
7. Test: fungsi murni (pemetaan range→interval, ringkasan aria-label, pembuat sparkline path) wajib diuji; komponen: tombol range memanggil getHistory dengan pasangan yang benar, state gagal + retry, simbol tidak valid. Mock modul chart di jsdom.
8. Dokumen: roadmap/README.md baris S3-02 menjadi 🟡 (a selesai, overlay/RSI/MACD/⭐/proyeksi ditunda). Tambahkan struktur baru ke CLAUDE.md bila perlu.

Ditunda (jangan dikerjakan, jangan dibuat placeholder palsu; cukup TODO dengan ID):
- Overlay SMA/Bollinger, panel RSI/MACD → S3-02b, butuh backend /v1/technicals?overlays= (seri indikator dari kode backend, bukan dihitung ulang di browser).
- Tombol ⭐ watchlist → S3-01.
- Tab Proyeksi / fan chart → S1-08 (proyeksi kuantitatif).
- Mini chart di kartu chat → setelah S2-06.

Tunjukkan rencana dan wireframe ASCII dulu (desktop 1280 dan mobile 375, light dan dark), daftar file, dan hasil pengecekan API lightweight-charts. Tunggu persetujuan saya; jangan anggap pesan lain sebagai persetujuan.
Setelah selesai: lint, typecheck, test, build; cek 375 dan 1280, light dan dark, dengan backend dev asli dan dengan backend mati; coba AAPL, BBCA.JK, ^JKSE dan simbol ngawur. Commit: feat(web): stock detail page with candlestick chart and sparkline [S3-02a]. Push, buka PR, jangan merge. Akhiri dengan ringkasan dan path screenshot.
```
