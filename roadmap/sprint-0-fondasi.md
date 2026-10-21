# Sprint 0: Fondasi, Keamanan & Kejujuran Data (Minggu 1–2)

**Tujuan sprint:** aplikasi aman (tidak ada key bocor), jujur (tidak ada data acak), repo rapi, dan setiap PR dicek CI.
**Rilis:** `v0.2.0`

---

## S0-01 🧑 Rotasi semua API key (⏱️ 1 jam)
**Kenapa:** `backend/serverless.yml` menyimpan default key Replicate & RapidAPI; `backend/.env` ter-commit; key `VITE_*` ikut ke bundle publik. Anggap semua key sudah bocor.

**Langkah manual:**
1. Cek visibilitas repo: GitHub → `gavinadlan/granite-stock-chat` → Settings. Kalau publik, pertimbangkan jadikan **private sementara** sampai S0-02 selesai.
2. Buat key baru lalu **revoke key lama** di:
   - Replicate → Account → API tokens
   - RapidAPI → Apps → Security → rotate key
   - NewsAPI → Account (minta key baru, atau buat akun baru jika tidak bisa rotate)
   - Alpha Vantage → minta key baru (key gratis tidak bisa di-revoke; cukup berhenti memakai key lama)
3. Cek AWS: IAM → Users → access key yang dipakai di GitHub Secrets/lokal. Jika pernah ada di file yang ter-commit, **nonaktifkan & buat ulang**.
4. Cek tagihan/usage Replicate & AWS 30 hari terakhir untuk aktivitas aneh.
5. Simpan key baru di password manager. **Belum** dimasukkan ke file mana pun (masuk ke SSM di S0-03).

**Selesai bila:** semua key lama sudah tidak berlaku, key baru tersimpan aman.

---

## S0-02 🤝 Hapus secrets dari repo & git history (⏱️ 2 jam)
**Dependensi:** S0-01

**Kriteria penerimaan:**
- `backend/.env`, `backend/.serverless/`, `.env.local`, `frontend/.env.local` tidak ter-track git
- `serverless.yml` tidak berisi nilai default key
- `.gitignore` root mencakup semua file env & artefak build
- Template env (`.env.example`) hanya berisi nama variabel, tanpa nilai

**PROMPT:**
```text
Task S0-02 (lihat roadmap/sprint-0-fondasi.md). Tujuan: tidak ada secret di repo.
1. Jalankan `git ls-files` dan identifikasi semua file yang berisi secret atau artefak build: backend/.env, backend/.serverless/**, file .env*, dan isi serverless.yml yang punya default key (REPLICATE_API_KEY, RAPIDAPI_KEY, dll).
2. Hapus default value key dari backend/serverless.yml: ganti `${env:X, 'nilai'}` menjadi `${env:X, ''}` untuk sementara (S0-03 akan memindahkannya ke SSM).
3. `git rm --cached` untuk file secret & artefak; perbarui .gitignore root dan backend/.gitignore (buat jika belum ada) agar mencakup: .env, .env.*, !.env.example, .serverless/, dist/, coverage/, *.zip.
4. Satukan template env: buat backend/.env.example dan frontend/.env.example berisi NAMA variabel saja dengan komentar penjelasan. Hapus template duplikat (env.example root, frontend/env-template.txt, env.local.template, env.aws.template) setelah isinya dipindah.
5. Grep seluruh repo (kecuali node_modules) untuk pola key: "r8_", "msh", "apikey=", "apiKey:", "AKIA", "secret". Laporkan temuan dengan path & baris, tapi JANGAN tampilkan nilai key di output.
6. Jangan menulis ulang git history sendiri. Di ringkasan akhir, tuliskan perintah git filter-repo yang harus saya jalankan manual, termasuk file replacements.txt untuk --replace-text dan langkah force-push.
Commit: "chore(security): untrack secrets and build artifacts [S0-02]"
```

**Langkah manual setelah prompt (hati-hati, menulis ulang history):**
```bash
pip install git-filter-repo
# backup dulu
cp -r granite-stock-chat-68dfe4c3 granite-stock-chat-backup
git filter-repo --path backend/.env --path backend/.serverless --invert-paths
git filter-repo --replace-text replacements.txt   # file dari ringkasan Claude: key lama -> ***REMOVED***
git remote add origin https://github.com/gavinadlan/granite-stock-chat.git
git push --force --all && git push --force --tags
```
Kalau repo publik, key lama tetap harus dianggap bocor (fork/cache GitHub). Karena itu S0-01 wajib dikerjakan dulu.

---

## S0-03 🤝 Secrets ke SSM Parameter Store (⏱️ 2 jam)
**Dependensi:** S0-02

**Langkah manual dulu:**
```bash
for STAGE in dev prod; do
  aws ssm put-parameter --name "/stockai/$STAGE/replicate-api-key" --type SecureString --value "<KEY>" --overwrite
  aws ssm put-parameter --name "/stockai/$STAGE/news-api-key"      --type SecureString --value "<KEY>" --overwrite
  aws ssm put-parameter --name "/stockai/$STAGE/alpha-vantage-key" --type SecureString --value "<KEY>" --overwrite
  aws ssm put-parameter --name "/stockai/$STAGE/rapidapi-key"      --type SecureString --value "<KEY>" --overwrite
done
```

**PROMPT:**
```text
Task S0-03. Secrets sudah saya simpan di SSM Parameter Store dengan path /stockai/{stage}/replicate-api-key, news-api-key, alpha-vantage-key, rapidapi-key (SecureString, region us-east-1).
1. Ubah backend/serverless.yml agar environment Lambda dibaca dari SSM: ${ssm:/stockai/${sls:stage}/replicate-api-key}, dst. Hapus pembacaan key dari ${env:...}.
2. Tambahkan IAM statement minimal: ssm:GetParameter(s) pada arn:aws:ssm:us-east-1:*:parameter/stockai/${sls:stage}/* dan kms:Decrypt untuk key alias/aws/ssm.
3. Untuk `npm run offline` lokal, dukung fallback dari backend/.env (dotenv sudah ada) dan dokumentasikan di backend/.env.example.
4. Tambahkan bagian "Secrets" di docs/DEPLOYMENT.md: daftar parameter, cara menambah/rotasi, dan catatan bahwa nilai SSM di-resolve saat deploy (nilai terlihat di konfigurasi Lambda). Catat bahwa di S1-09 kita bisa beralih ke fetch runtime via Powertools Parameters.
5. Jalankan `npx serverless print --stage dev` untuk memastikan konfigurasi valid (boleh gagal jika kredensial AWS tidak ada; laporkan saja).
Commit: "chore(security): load secrets from SSM Parameter Store [S0-03]"
```
**Verifikasi:** `npm run deploy:dev`, lalu panggil `/stock-price?symbol=AAPL` dan `/market-news`, keduanya harus berhasil.

---

## S0-04 🤖 Bersih-bersih repo + npm workspaces (⏱️ 3 jam)
**Kriteria penerimaan:**
- Root `package.json` menjadi workspace root (`frontend`, `backend`, `packages/*`), bukan duplikat app
- Satu package manager (npm), satu lockfile di root
- File sampah dihapus, dokumentasi lama dipindah ke `docs/legacy/`
- Script deploy lama dipindah ke `scripts/legacy/` (dihapus total di S5-03)

**PROMPT:**
```text
Task S0-04: rapikan repo dan jadikan npm workspaces. Buat rencana dulu (daftar file yang dihapus/dipindah), tunggu persetujuan saya.
Konteks: root package.json saat ini adalah duplikat dependency frontend (name "vite_react_shadcn_ts"). Ada bun.lockb dan package-lock.json di root, frontend, backend; banyak .yarnrc* di frontend; test.html, test-apis.js; ~10 shell script deploy di root; ~8 file .md setup di root.
Lakukan:
1. Root package.json baru: { "name": "stockai", "private": true, "workspaces": ["frontend", "backend", "packages/*"] } dengan script: dev:web, dev:api, build, lint, typecheck, test (menjalankan per workspace dengan --workspaces --if-present).
2. Buat packages/shared (TypeScript, name "@stockai/shared", main/types ke src/index.ts) berisi tipe dasar yang sekarang ada di frontend/src/services/stockMarketAPI.ts (StockPrice, TechnicalAnalysis, NewsItem, Prediction). Belum perlu dipakai backend.
3. Hapus: bun.lockb, semua .yarnrc*, package-lock.json di frontend & backend (diganti satu lockfile root), test.html, frontend/dist dari git, eslint.config.js root jika duplikat.
4. Pindahkan: AWS_*.md, CUSTOM_DOMAIN_SETUP.md, DEPLOYMENT.md, FRONTEND-GUARANTEE.md, IBM_GRANITE_SETUP.md, YAHOO_FINANCE_SETUP.md → docs/legacy/. Shell script deploy/fix/upload & aws-*.yml di root → scripts/legacy/. test-apis.js → scripts/.
5. Jalankan npm install di root, lalu pastikan `npm run build -w frontend` dan `npm run lint -w frontend` jalan.
6. Perbaiki link di README.md yang menunjuk ke file yang dipindah.
7. Update CLAUDE.md bagian Struktur & Perintah.
Commit: "chore(repo): convert to npm workspaces and clean up legacy files [S0-04]"
```

---

## S0-05 🤖 Middleware backend: CORS, error handler, validasi (⏱️ 3 jam)
**Kriteria penerimaan:**
- Header CORS & format response tidak lagi copy-paste di tiap handler
- `Access-Control-Allow-Origin` hanya dari `ALLOWED_ORIGINS`
- Error 500 tidak membawa `stack`/`message` internal; ada `requestId`
- Query param divalidasi zod (`symbol`: huruf/angka/titik/strip, 1–15 char, uppercase)

**PROMPT:**
```text
Task S0-05. Di backend/functions/*.js setiap handler meng-copy header CORS dan bentuk response, CORS memakai "*", dan ai-prediction.js mengirim error.stack ke client.
1. Tambahkan dependency @middy/core, @middy/http-cors, @middy/http-error-handler, @middy/http-json-body-parser, http-errors, zod di backend.
2. Buat backend/lib/http.js: helper ok(body, {cacheSeconds}), badRequest, notFound, dan wrapper `handler(fn, {schema})` yang memasang middy + CORS (origin dari env ALLOWED_ORIGINS, dipisah koma) + error handler yang mengembalikan { error: { code, message }, requestId } tanpa stack (stack hanya di console.error).
3. Buat backend/lib/validation.js: SymbolSchema (regex ^[A-Z0-9.\-^=]{1,15}$ setelah uppercase/trim), TimeframeSchema (enum '1d','1w','1m','3m'), QuerySchema untuk news.
4. Refactor stock-price, technical-analysis, ai-prediction, market-news memakai wrapper ini. Jangan ubah logika bisnis (mock dihapus di S0-06).
5. Tambahkan ALLOWED_ORIGINS ke serverless.yml per stage (dev: http://localhost:5173,http://localhost:8080; prod: https://stockai.gavinadlan.my.id) dan sesuaikan konfigurasi cors serverless.
6. Uji lokal dengan `npm run offline`: symbol valid, symbol kosong (400), symbol "AAPL;DROP" (400).
Commit: "refactor(api): shared middleware for cors, errors and validation [S0-05]"
```

---

## S0-06 🤖🧠 Frontend hanya lewat backend, hapus semua mock (⏱️ 5 jam)
**Dependensi:** S0-05
**Kriteria penerimaan:**
- Tidak ada `fetch` ke replicate.com, newsapi.org, alphavantage.co, rapidapi, allorigins, yahoo dari frontend
- Tidak ada `VITE_*_API_KEY`
- Tidak ada `Math.random()` untuk data (frontend & backend `technical-analysis.js`, `ai-prediction.js`, `market-news.js`)
- Saat data gagal: UI menampilkan pesan error yang jujur + tombol coba lagi

**PROMPT:**
```text
Task S0-06. Buat rencana dulu, tunggu persetujuan.
Masalah: frontend/src/services memanggil API pihak ketiga langsung (ibmGraniteService.ts → Replicate, stockMarketAPI.ts → Alpha Vantage & NewsAPI via api.allorigins.win, yahooFinanceService.ts → RapidAPI) dengan key VITE_* yang ikut ke bundle. Selain itu ada generator data palsu: stockMarketAPI.ts (template berita acak, harga/prediksi acak), backend technical-analysis.js (RSI/MACD/SMA dari Math.random), ai-prediction.js generateMockPrediction, market-news.js mock news.
Lakukan:
1. Frontend: hapus ibmGraniteService.ts dan yahooFinanceService.ts; stockMarketAPI.ts hanya memakai awsLambdaService.ts. Ganti base URL ke VITE_API_URL (hapus hardcode "/dev" di path; stage masuk ke base URL).
2. Hapus semua VITE_*_API_KEY dari kode, .env.example, dan dokumentasi. Hapus dependency "replicate" & "sharp" dari frontend jika tidak dipakai lagi.
3. Hapus semua generator data palsu di frontend & backend. technical-analysis.js: sementara kembalikan 501 { error: { code: "NOT_IMPLEMENTED", message: "Technical analysis is being upgraded" } } (diganti di S1-05). ai-prediction.js: jika LLM gagal, kembalikan 503, bukan prediksi acak. market-news.js: jika NewsAPI gagal, kembalikan 503.
4. Di ChatInterface / kartu-kartu: tampilkan state error yang jelas (pesan + tombol "Coba lagi"), bukan data palsu.
5. Setelah selesai, buktikan dengan grep: "Math.random" (hanya boleh untuk id/animasi UI, sebutkan mana saja), "VITE_.*KEY", "allorigins", "replicate.com", "newsapi.org", "alphavantage" di frontend/src → harus kosong.
6. Build & lint frontend harus lulus.
Commit: "fix: route all data through backend and remove fabricated data [S0-06]"
```

---

## S0-07 🤖🧠 Konsolidasi auth: Cognito via Amplify (⏱️ 4 jam)
**Kriteria penerimaan:**
- Satu sumber kebenaran auth di frontend (`useAuth` di atas Amplify `aws-amplify/auth`)
- Lambda `auth` & `UserTable` lama dihapus dari serverless.yml (user pool & client tetap)
- Alur: register → kode verifikasi email → login → refresh token otomatis → logout → lupa password
- Request ke backend membawa `Authorization: Bearer <accessToken>` (authorizer dipasang di S1-02)

**PROMPT:**
```text
Task S0-07. Buat rencana dulu.
Konteks: ada 3 implementasi auth paralel di frontend (services/authService.ts, services/cognitoAuthService.ts, hooks/useAuth.tsx) dan Lambda backend/functions/auth.js yang memakai aws-sdk v2 (tidak tersedia di runtime nodejs20.x), tidak punya izin IAM Cognito, dan memakai ADMIN_NO_SRP_AUTH yang tidak diaktifkan di user pool client. Register memakai adminCreateUser tapi verify memakai confirmSignUp (tidak konsisten).
Lakukan:
1. Pakai Amplify v6 (aws-amplify/auth: signUp, confirmSignUp, resendSignUpCode, signIn, signOut, fetchAuthSession, getCurrentUser, resetPassword, confirmResetPassword, updateUserAttributes) sebagai satu-satunya jalur auth. Konfigurasi dari frontend/src/lib/aws-config.ts (VITE_USER_POOL_ID, VITE_USER_POOL_CLIENT_ID, VITE_AWS_REGION; ini bukan secret).
2. Tulis ulang hooks/useAuth.tsx: state { user, status: 'loading'|'authenticated'|'unauthenticated' }, aksi register/confirm/login/logout/forgotPassword/updateName, listener Hub untuk event auth. Hapus authService.ts & cognitoAuthService.ts dan perbarui semua pemakaiannya.
3. Halaman Register: tambah langkah input kode verifikasi + kirim ulang kode. Login: tautan lupa password (halaman baru /forgot-password).
4. awsLambdaService: sisipkan header Authorization dari fetchAuthSession().tokens.accessToken.
5. Backend: hapus functions/auth.js, event /auth/{action}, resource UserTable; pertahankan UserPool & UserPoolClient (tambah Outputs CloudFormation UserPoolId & UserPoolClientId). ExplicitAuthFlows tetap SRP + refresh.
6. Petakan error Cognito ke pesan ramah (UsernameExistsException, CodeMismatchException, NotAuthorizedException, UserNotConfirmedException → arahkan ke verifikasi).
Commit: "refactor(auth): single Cognito auth flow via Amplify, remove auth lambda [S0-07]"
```
**Verifikasi manual:** daftar akun baru dengan email asli → terima kode → login → refresh halaman tetap login → logout → lupa password.

---

## S0-08 🤖 Disclaimer + badge sumber data (⏱️ 2 jam)
**PROMPT:**
```text
Task S0-08. Tambahkan transparansi data di UI:
1. Komponen DataSourceBadge({ source, asOf, delayed? }) yang menampilkan mis. "Sumber: Yahoo Finance · 21 Okt 2026 17:05 WIB" (format waktu lokal user via Intl.DateTimeFormat) dan label "Delayed" bila delayed.
2. Pasang di StockCard, TechnicalAnalysisCard, PredictionChart, NewsCard. Backend: pastikan setiap response menyertakan field source dan asOf (ISO string); tambahkan di handler yang ada.
3. Komponen Disclaimer kecil di bawah kartu prediksi & analisis: "Informasi ini bukan nasihat keuangan. Lakukan riset sendiri sebelum berinvestasi." Tambahkan juga di footer landing page dan halaman /chat.
4. Ubah copy yang menjanjikan berlebihan di landing page (cek HeroSection, FeaturesSection) agar tidak mengklaim akurasi prediksi.
Commit: "feat(ui): data source badges and financial disclaimer [S0-08]"
```

---

## S0-09 🤖 CI dasar + Vitest (⏱️ 3 jam)
**Kriteria penerimaan:**
- Satu workflow `ci.yml` aktif di `pull_request` & `push` ke main: install → lint → typecheck → test → build
- Workflow lama yang tidak dipakai dihapus
- Vitest terpasang di frontend, backend, shared, dengan test yang bermakna

**PROMPT:**
```text
Task S0-09.
1. Pasang Vitest di frontend (jsdom + @testing-library/react), backend, dan packages/shared. Tambahkan script "test" dan "typecheck" (tsc --noEmit) di setiap workspace.
2. Tulis test bermakna untuk: frontend/src/lib/symbolUtils.ts, frontend/src/lib/currencyUtils.ts (detectCurrency untuk .JK, .L, tanpa suffix), backend/lib/validation.js (symbol valid/invalid).
3. Tulis ulang .github/workflows/ci.yml: trigger pull_request & push ke main; Node 20; cache npm; langkah lint, typecheck, test, build untuk semua workspace (npm run X --workspaces --if-present). Tambahkan concurrency cancel-in-progress.
4. Hapus workflow: debug-build.yml, test-build.yml, test.yml, deploy-s3.yml, simple-deploy.yml. Pertahankan deploy.yml (diganti di S5-03), pastikan hanya workflow_dispatch.
5. Tambahkan badge CI di README.md.
Commit: "ci: single CI pipeline with lint, typecheck, test and build [S0-09]"
```
**Manual:** GitHub → Settings → Branches → aktifkan branch protection `main`: wajib PR + CI hijau.

---

## S0-10 🤝 Verifikasi sprint, deploy, tag v0.2.0 (⏱️ 2 jam)
**PROMPT:**
```text
Sprint 0 selesai. Verifikasi task S0-02 s/d S0-09 di roadmap/sprint-0-fondasi.md terhadap kode saat ini:
- grep pola secret, Math.random untuk data, VITE_*KEY, CORS "*", "error.stack" di response
- jalankan lint, typecheck, test, build untuk semua workspace
- pastikan docs & CLAUDE.md up to date
Laporkan checklist lulus/gagal. Lalu buat CHANGELOG.md (format Keep a Changelog) dengan entri v0.2.0.
```
**Manual:** `npm run deploy:dev -w backend` → uji di browser → deploy frontend → `git tag v0.2.0 && git push --tags`.
