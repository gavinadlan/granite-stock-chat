# Sprint 5: Kualitas, Keamanan & Public Launch (Minggu 11–12)

**Tujuan sprint:** cepat, teruji end-to-end, deploy otomatis yang aman, terpantau, siap dipromosikan.
**Rilis:** `v1.0.0` 🎉

---

## S5-01 🤖 Performa frontend (⏱️ 4 jam)
**Target:** Lighthouse mobile Performance ≥ 90, LCP < 2,5 dtk, JS awal (gzip) < 200 KB di landing page.

**PROMPT:**
```text
Task S5-01.
1. Ukur dulu: build dengan rollup-plugin-visualizer, catat ukuran bundle per chunk di docs/PERFORMANCE.md (sebelum).
2. Code splitting per route dengan React.lazy + Suspense (landing, chat, stock detail, portfolio, alerts, settings). Landing page tidak boleh memuat Amplify UI, recharts, lightweight-charts.
3. Hapus dependency tidak terpakai (cek dengan knip atau depcheck): kemungkinan banyak @radix-ui/*, embla, vaul, input-otp, react-day-picker, cmdk, lovable-tagger. Hapus komponen ui/* yang tidak dipakai.
4. Gambar: konversi PNG logo/brand di assets ke WebP/AVIF dengan ukuran tepat, width/height eksplisit, loading="lazy" di bawah fold. LogoLoop: pastikan animasi CSS, bukan JS per frame.
5. Font: preload & font-display swap; self-host bila memakai Google Fonts.
6. CloudFront: pastikan cache-control immutable untuk /assets/* (hash) dan no-cache untuk index.html; aktifkan kompresi Brotli. Tulis perintah/konfigurasinya di docs.
7. Ukur ulang & catat (sesudah) di docs/PERFORMANCE.md.
Commit: "perf(web): route-level code splitting and dependency cleanup [S5-01]"
```

---

## S5-02 🤖 E2E Playwright (⏱️ 5 jam)
**PROMPT:**
```text
Task S5-02. Pasang Playwright di workspace baru e2e/.
1. Mode mock: jalankan frontend dengan VITE_API_URL ke server mock (MSW node atau mock server sederhana berbasis fixture) dan auth di-bypass via flag build khusus test (VITE_E2E=1 → AuthProvider palsu). Pastikan flag ini tidak bisa aktif di build produksi (cek di vite config).
2. Skenario: landing → login (mock) → chat kirim pertanyaan → card quote muncul → tambah ke watchlist → buka detail saham → chart render → buat alert → lihat portfolio kosong → tambah transaksi → ringkasan benar → ganti bahasa ke English → logout.
3. Skenario error: provider 503 → pesan error + coba lagi; kuota habis → banner.
4. Smoke test terhadap environment dev asli (opsional, akun test dari secret CI) untuk login + quote saja.
5. Jalankan di CI (job terpisah, upload trace saat gagal).
Commit: "test(e2e): Playwright end-to-end coverage for core flows [S5-02]"
```

---

## S5-03 🤝 CI/CD penuh + OIDC (⏱️ 4 jam)
**Manual dulu:**
1. AWS IAM → Identity providers → tambah `token.actions.githubusercontent.com` (audience `sts.amazonaws.com`).
2. Buat role `stockai-gha-deploy-dev` & `stockai-gha-deploy-prod` dengan trust policy terbatas ke repo `gavinadlan/granite-stock-chat` (prod: hanya `ref:refs/tags/v*` atau environment `production`), plus izin deploy (CloudFormation, Lambda, API GW, DynamoDB, S3 bucket frontend, CloudFront invalidation, IAM PassRole terbatas, SSM read).
3. GitHub → Environments: `development` dan `production` (required reviewer: Anda).
4. Hapus AWS access key lama dari GitHub Secrets setelah pipeline baru berjalan.

**PROMPT:**
```text
Task S5-03. Role OIDC sudah saya buat: arn dev = <ARN_DEV>, arn prod = <ARN_PROD>. Bucket frontend dev/prod & CloudFront distribution id ada di GitHub environment variables (S3_BUCKET, CF_DISTRIBUTION_ID, VITE_* publik).
1. .github/workflows/deploy.yml: 
   - on push ke main → job deploy-dev (environment development): npm ci, test, deploy backend `serverless deploy --stage dev`, build frontend dengan env dev, s3 sync (assets immutable, index.html no-cache), invalidation index.html saja.
   - on push tag v* → job deploy-prod (environment production, butuh approval) dengan langkah sama untuk prod + smoke test (curl /v1/health) + rollback instruksi bila gagal.
   - permissions: id-token: write, contents: read; aws-actions/configure-aws-credentials dengan role-to-assume.
2. Job eval AI (S2-08) berjalan manual (workflow_dispatch) dan sebelum deploy prod bila file di backend/src/ai berubah.
3. Hapus scripts/legacy/* dan aws-*.yml lama; update docs/DEPLOYMENT.md menjadi satu panduan yang ringkas.
4. Tambahkan .github/dependabot.yml (npm mingguan, grouped minor/patch; github-actions bulanan).
Commit: "ci: automated dev/prod deployments with GitHub OIDC [S5-03]"
```

---

## S5-04 🤝 Security hardening (⏱️ 4 jam)
**PROMPT:**
```text
Task S5-04. Lakukan review keamanan dan perbaiki temuan. Buat laporan di docs/SECURITY_REVIEW.md.
Checklist:
1. Authz: setiap endpoint dengan resource user memeriksa kepemilikan (watchlist, alerts, portfolio, conversations, shares). Tulis test negatif untuk masing-masing.
2. Input: semua handler memakai zod; batas ukuran body (mis. 16KB, chat message ≤ 2000 karakter); batas panjang array.
3. Header keamanan di CloudFront (Response Headers Policy): Content-Security-Policy (default-src 'self'; connect-src API & Function URL & Cognito; img-src self data: https:), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Tulis konfigurasinya (CloudFormation/CLI) di docs.
4. Markdown rendering chat tanpa raw HTML; link eksternal rel="noopener noreferrer nofollow".
5. LLM: prompt injection dari berita sudah dibungkus (S2-07); pastikan tool tidak bisa mengakses data user lain (ctx.userId dari JWT, bukan dari argumen LLM).
6. IAM least privilege per fungsi (serverless-iam-roles-per-function) alih-alih satu role besar.
7. AWS WAF di depan CloudFront/API (managed rule set Common + rate-based rule 1000 req/5 menit per IP) bila biaya dapat diterima; jika tidak, catat sebagai rekomendasi.
8. Secrets: tidak ada di repo (jalankan gitleaks di CI).
9. npm audit --omit=dev tanpa high/critical.
10. Kebijakan privasi & syarat penggunaan (draf halaman /privacy dan /terms: data yang disimpan, retensi, hapus akun, bukan nasihat keuangan, sumber data).
Commit: "sec: security hardening and review report [S5-04]"
```

---

## S5-05 🤝 Monitoring frontend + dashboard operasional (⏱️ 3 jam)
**PROMPT:**
```text
Task S5-05.
1. Error tracking frontend: integrasikan Sentry (@sentry/react) ATAU CloudWatch RUM (pilih satu, jelaskan trade-off singkat; default Sentry free tier). Source map diupload di CI, PII di-scrub, sample rate trace 0.1.
2. Analytics produk ringan & ramah privasi (Plausible/Umami self-host atau PostHog) untuk event: sign_up, chat_message_sent, card_viewed(type), watchlist_add, alert_created, portfolio_tx_added, share_created. Tanpa mengirim isi pesan.
3. CloudWatch Dashboard via resources: request & error per route, p95 latency, cache hit ratio, provider error per provider, LLM latency & token, chat per hari, alerts triggered, biaya estimasi (link ke Cost Explorer).
4. docs/RUNBOOK.md: apa yang dilakukan jika provider Yahoo down, LLM lambat/mahal, SES bounce tinggi, lonjakan biaya, rotasi key.
Commit: "feat(ops): frontend error tracking, product analytics and ops dashboard [S5-05]"
```

---

## S5-06 🤝 Landing page, dokumentasi, CV & launch (⏱️ 4 jam)
**PROMPT:**
```text
Task S5-06.
1. Perbarui landing page sesuai fitur nyata: hero (chat AI saham US & IDX), demo GIF/screenshot (placeholder path yang akan saya isi), fitur (chat + data asli, watchlist & alert, portfolio, analisis teknikal transparan), bagian "Bagaimana data kami bekerja" (sumber, delay, disclaimer), FAQ, CTA daftar. Tanpa klaim akurasi prediksi.
2. README.md utama ditulis ulang: deskripsi, screenshot, arsitektur (mermaid), fitur, tech stack, cara menjalankan lokal, deploy, struktur repo, roadmap link, lisensi.
3. docs/ARCHITECTURE.md dengan diagram & keputusan desain (ADR singkat: single-table DynamoDB, Function URL untuk streaming, LLM menjelaskan bukan menebak, average cost).
4. Perbarui CV_PROJECT_DESCRIPTION.md (bahasa Inggris, bullet berorientasi dampak dengan angka yang bisa saya isi: jumlah user, p95 latency, cache hit ratio, cakupan test) dan buat versi Bahasa Indonesia.
5. Buat docs/LAUNCH_CHECKLIST.md: domain & SSL, SES production, budget alarm, backup PITR, halaman privacy/terms, uji di mobile (iOS Safari, Android Chrome), akun demo, pengumuman (LinkedIn, komunitas investor, Product Hunt), formulir feedback.
Commit: "docs: launch-ready landing page, README and architecture docs [S5-06]"
```
**Manual:** isi screenshot/GIF, jalankan checklist launch, tag `v1.0.0`, umumkan.
