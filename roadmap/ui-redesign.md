# 🎨 UI Redesign: dari template shadcn ke identitas "Granite"

> Bisa dikerjakan paralel dengan Sprint 1 karena hanya menyentuh `frontend/`.
> Branch: `feat/UI-redesign`. Kerjakan berurutan UI-01 → UI-02 → UI-03, satu sesi Claude Code per task (`/clear` di antaranya).
> Semua task bertanda 🧠: minta rencana dulu, setujui, baru eksekusi.

## Diagnosis (hasil review 25 Nov 2026)
- Hero hanya teks di tengah + 3 tombol; produk tidak terlihat sama sekali.
- Warna & font default shadcn (`--primary: 221 83% 53%`, font sistem). Tidak ada identitas.
- Fitur = 4 kartu identik (ikon di kotak pastel, teks rata tengah, hover shadow) + LogoLoop tech stack. Pola paling generik.
- Setiap section `py-48` (192px atas & bawah): halaman terasa kosong, bukan lega.
- Copy klise ("Powerful Features", "cutting-edge"). Kartu Technical Analysis menyebut **Bollinger Bands** padahal backend tidak menghitungnya.
- Chat: header & input dibungkus `Card`, avatar bulat di tiap pesan, teks mobile `text-xs`.
- `StockCard` selalu memakai ikon `DollarSign`, termasuk untuk saham IDX (IDR).
- 194 class `dark:` manual di komponen, padahal design token sudah ada di `index.css`.

## Arah desain: "Granite"
Terminal riset yang tenang, bukan aplikasi trading yang ramai.

| Token | Nilai | Peran |
|---|---|---|
| `ink` | `#16181B` | teks utama (light), background (dark) |
| `paper` | `#F4F4F2` | background (light) |
| `stone` | `#8B9096` | teks sekunder, border kuat |
| `granite` | `#E3E4E1` / dark `#26292D` | permukaan & border halus |
| `amber` (aksen) | `#E59A1F` | brand, fokus, CTA utama, satu-satunya warna aksen |
| `up` / `down` | `#15803D` / `#C2410C` (light), `#4ADE80` / `#FB923C` (dark) | **hanya** untuk arah harga |

- **Font:** IBM Plex Sans (body, 400/500/600) + IBM Plex Sans Condensed (judul, 600/700), lewat `@fontsource` (self-host, tanpa request ke Google). Semua angka harga/indikator `tabular-nums`.
- **Skala tipe:** 14 / 16 / 20 / 28 / 44 / 64 px. Body minimal 15–16px, termasuk mobile.
- **Radius:** bertingkat sesuai hierarki: 6px kontrol, 10px kartu data, 16px panel besar. Tidak satu radius untuk semua.
- **Bayangan:** hampir tidak ada; pisahkan permukaan dengan warna/border.
- **Hindari:** gradient dekoratif, eyebrow huruf kapital di atas tiap judul, kotak ikon pastel, animasi fade-up per section, panah `→` di semua tombol, menyorot satu kata di judul dengan warna lain.

---

## UI-01 · Fondasi: token, font, bersih-bersih dark mode 🧠

### PROMPT
```
Kerjakan task UI-01 dari roadmap/ui-redesign.md (baca seluruh file itu dulu, termasuk Diagnosis dan Arah desain). Hanya ubah frontend/.

Tujuan: ganti fondasi visual default shadcn dengan design system "Granite", tanpa mengubah layout halaman (layout di UI-02/UI-03).

1. Tambah dependency @fontsource/ibm-plex-sans dan @fontsource/ibm-plex-sans-condensed (alasan: self-host font, tanpa request pihak ketiga). Import weight yang dipakai saja di main.tsx.
2. Tulis ulang CSS variable di src/index.css (light & .dark) sesuai tabel token di roadmap. Petakan ke nama shadcn yang ada (background, foreground, primary=amber, muted, border, dll.) dan tambahkan token baru: --up, --down, --surface-raised. Konversi hex ke format HSL yang dipakai file ini. Cek kontras WCAG AA untuk teks di atas background dan untuk teks di atas amber (pilih foreground yang lolos).
3. tailwind.config.ts: fontFamily sans & display, warna up/down, borderRadius bertingkat (control/card/panel), skala font dari roadmap. Hapus keyframes/animasi marquee yang tidak dipakai lagi setelah UI-02 (catat, jangan hapus dulu jika masih dipakai).
4. Hapus class dark: manual di semua komponen dengan cara mengganti warna hardcode (slate-*, blue-*, green-*, red-*, gray-*) menjadi token semantik (bg-background, text-muted-foreground, text-up, text-down, border-border, dll.). Target: jumlah "dark:" di src turun drastis; sisakan hanya yang memang tidak bisa lewat token, dan sebutkan alasannya di ringkasan.
5. Buat util/komponen kecil src/components/ui/price-change.tsx: menerima change & changePercent (boleh null), menampilkan tanda +/−, warna up/down, tabular-nums, dan "—" jika null. Dengan unit test Vitest.
6. Perbaiki StockCard: hapus ikon DollarSign; simbol mata uang hanya dari formatPrice(currency).

Batasan (dari CLAUDE.md): tidak ada data palsu, TypeScript strict tanpa any, jangan ubah logika fetch/API.
Verifikasi: npm run lint && npm run typecheck && npm test && npm run build dari root. Lalu jalankan npm run dev:web dan periksa halaman /, /login, /chat di light & dark mode serta lebar 375px; laporkan apa yang terlihat rusak.
Buat rencana dulu dan tunggu persetujuan saya sebelum mengubah file.
Commit: style(ui): granite design tokens, IBM Plex type and semantic colors [UI-01]
```

### Kriteria penerimaan
- [ ] Tidak ada lagi warna biru default shadcn; aksen tunggal amber.
- [ ] Font Plex termuat dari bundle sendiri (cek tab Network: tidak ada fonts.googleapis.com).
- [ ] Jumlah `dark:` di `frontend/src` < 20.
- [ ] Hijau/merah hanya muncul untuk arah harga.
- [ ] Ikon `$` hilang dari kartu IDX.

---

## UI-02 · Landing page 🧠

### PROMPT
```
Kerjakan task UI-02 dari roadmap/ui-redesign.md (baca seluruh file, UI-01 sudah selesai). Hanya ubah frontend/.

Tujuan: landing page yang menunjukkan produknya, bukan template.

1. Hero (HeroSection.tsx), rata kiri, dua kolom di desktop, satu kolom di mobile:
   - Kiri: judul Plex Condensed besar, satu kalimat penjelas, satu CTA utama (amber) dan satu tautan sekunder. Copy pendek, kalimat biasa (sentence case), contoh arah: judul "Tanya pasar saham, dapat jawaban dengan sumbernya." (boleh disempurnakan, tetap Inggris sebagai bahasa utama jika UI masih Inggris; ikuti bahasa UI yang ada).
   - Kanan: "demo hidup" berbentuk potongan percakapan: satu bubble pertanyaan user (mis. "How is BBCA.JK doing today?") lalu satu kartu jawaban yang memakai komponen kartu harga ASLI dengan data dari backend kita (stockMarketAPI.getStockPrice). Tampilkan sumber + timestamp + label delayed. Jika request gagal atau sedang loading, tampilkan skeleton/empty state jujur ("Live data unavailable right now"), JANGAN angka contoh atau hardcode.
   - Hapus badge kecil di atas judul dan tombol "Learn More".
2. Fitur (FeaturesSection.tsx): ganti 4 kartu ikon dengan 3 baris bergantian (teks di satu sisi, contoh output di sisi lain) untuk harga, analisis teknikal, dan berita. Contoh output harus berupa ilustrasi struktural tanpa angka (garis/blok skeleton bertema) ATAU data live dari backend dengan sumber & timestamp; tidak boleh angka buatan. Perbaiki klaim: hapus "Bollinger Bands"; sebut hanya RSI(14), MACD(12,26,9), SMA 20/50/200, dan support/resistance 20 sesi.
3. Hapus TechStackSection beserta LogoLoop/marquee jika tidak dipakai di tempat lain (dan CSS-nya). Ganti dengan satu baris kecil "Data: Yahoo Finance, NewsAPI · AI: IBM Granite" di footer atau dekat disclaimer.
4. HowItWorks: pertahankan hanya jika memang langkah berurutan; maksimal 3 langkah, tanpa kartu.
5. Jarak section: ganti py-48 dengan ritme konsisten (mis. py-20 md:py-28). Lebar teks maksimal ~65ch.
6. Header: tipis, logo + 2–3 tautan + tombol masuk/daftar; aksen amber hanya di satu tombol.
7. Copy: hapus frasa marketing ("Powerful", "cutting-edge", "Comprehensive", "advanced"). Setiap teks menjelaskan apa yang dilakukan, dengan kata kerja biasa.
8. Motion: maksimal satu animasi saat halaman dimuat (hero), hormati prefers-reduced-motion. Tidak ada fade-up per section.

Aksesibilitas: fokus keyboard terlihat (ring amber), kontras AA, semua gambar punya alt, heading berurutan.
Batasan: tidak ada data palsu (aturan 2 CLAUDE.md), disclaimer "Bukan nasihat keuangan"/"Not financial advice" tetap terlihat di hero.
Verifikasi: lint, typecheck, test, build. Jalankan dev:web, cek / di 375px, 768px, 1280px, light & dark, dan saat backend mati (hero harus menampilkan empty state jujur).
Buat rencana dulu (sertakan wireframe ASCII hero & fitur) dan tunggu persetujuan saya.
Commit: feat(ui): product-first landing page with live quote demo [UI-02]
```

### Kriteria penerimaan
- [ ] Hero menampilkan data live dari backend sendiri (atau empty state jujur), tanpa angka hardcode (`grep` angka harga di komponen).
- [ ] Tidak ada lagi kotak ikon pastel, LogoLoop, dan `py-48`.
- [ ] Klaim fitur sesuai implementasi backend.
- [ ] Lighthouse accessibility ≥ 95 untuk `/`.

---

## UI-03 · Chat & kartu data 🧠

### PROMPT
```
Kerjakan task UI-03 dari roadmap/ui-redesign.md (baca seluruh file, UI-01 & UI-02 sudah selesai). Hanya ubah frontend/. Jangan ubah logika pemrosesan pesan di stockMarketAPI.ts (akan diganti di Sprint 2), hanya tampilannya.

Tujuan: tampilan chat modern ala ChatGPT/Claude, data tetap jadi bintangnya.

1. Layout halaman Chat: tinggi penuh (100dvh), tanpa Card pembungkus header/input. Header tipis: logo, judul percakapan/"New chat", toggle daftar saham, menu user. Area pesan lebar maks ~760px di tengah.
2. Pesan:
   - User: bubble halus (bg-muted), rata kanan, tanpa avatar.
   - Assistant: tanpa bubble dan tanpa avatar bulat; teks biasa ukuran 15–16px (mobile juga), lalu kartu data di bawahnya.
   - Timestamp hanya saat hover/fokus atau dikelompokkan; tombol retry tetap ada untuk pesan gagal.
3. Composer: mengambang di bawah (sticky), textarea yang tumbuh otomatis (Enter kirim, Shift+Enter baris baru), tombol kirim amber, disclaimer satu baris kecil di bawahnya.
4. Empty state (belum ada pesan): judul singkat + 4 contoh pertanyaan sebagai chip yang bisa diklik (campuran saham US & IDX). Chip hilang setelah pesan pertama. Hapus deretan tombol quick action yang selalu tampil.
5. Kartu data, desain ulang dengan satu bahasa visual (radius card, border halus, tanpa shadow):
   - StockCard: simbol + nama bursa/mata uang, harga besar tabular-nums, PriceChange (dari UI-01), volume & market cap sebagai pasangan label/nilai, badge Delayed/Live, DataSourceBadge.
   - TechnicalAnalysisCard: RSI sebagai meter 0–100 dengan zona 30/70, MACD & SMA sebagai baris label/nilai, sinyal sebagai daftar singkat; tetap tampilkan metode, sumber, timestamp, warnings.
   - NewsCard: judul, sumber, waktu relatif, tautan keluar; tanpa gambar placeholder.
   - Prediction (AI outlook): jelas berlabel "AI explanation", teks naratif, harga saat ini dari data, disclaimer.
   - Jangan tambahkan sparkline/chart sekarang: belum ada endpoint history (S1-06). Sisakan slot kosong di desain kartu harga dan tulis TODO dengan ID S1-06.
6. Loading: ganti TypingIndicator dengan skeleton kartu atau indikator halus; hormati prefers-reduced-motion.
7. Panel daftar saham (StockSymbolTable): jadikan sheet/drawer samping di desktop dan bottom sheet di mobile, dengan pencarian.
8. Halaman Login/Register/ForgotPassword/Settings/Profile: samakan dengan token baru (form satu kolom, lebar ~400px, tanpa kartu bergradien).

Aksesibilitas: area pesan pakai aria-live="polite", composer berlabel, fokus kembali ke composer setelah kirim, navigasi keyboard pada chip & drawer.
Update test yang ada (MessageBubble.test.tsx dll.) dan tambah test untuk PriceChange/RSI meter (fungsi murni wajib ditest).
Verifikasi: lint, typecheck, test, build. Jalankan dev:web, login, coba "AAPL price", "technical analysis BBCA.JK", "news TSLA", "predict MSFT" di 375px & 1280px, light & dark, dan satu kasus error (backend mati). Laporkan screenshot/temuan.
Buat rencana dulu (wireframe ASCII chat & StockCard) dan tunggu persetujuan saya.
Commit: feat(chat): full-height chat layout and redesigned data cards [UI-03]
```

### Kriteria penerimaan
- [ ] Tidak ada `Card` pembungkus header/composer; tidak ada avatar bulat.
- [ ] Teks pesan ≥ 15px di mobile.
- [ ] Semua kartu menampilkan sumber + timestamp + disclaimer bila analisis/prediksi.
- [ ] Composer bisa dipakai penuh dengan keyboard.

---

## Setelah selesai
- Update tabel progres di `roadmap/README.md` (tambah baris UI-01..UI-03) dan bagian Stack/Struktur di `CLAUDE.md` bila ada perubahan (font, folder komponen).
- Deploy frontend (S0-10) supaya situs live ikut berubah.
