# CLAUDE.md: Konteks Project StockAI

File ini dibaca otomatis oleh Claude Code CLI. Isinya konteks dan aturan main project.
**Update bagian "Struktur" & "Perintah" setiap kali struktur project berubah.**

## Apa ini
StockAI adalah asisten chat pasar saham berbasis AI (IBM Granite) dengan data harga real-time, analisis teknikal, berita, watchlist, dan alert.
- Live: https://stockai.gavinadlan.my.id (frontend di S3 + CloudFront)
- Repo: github.com/gavinadlan/granite-stock-chat
- Roadmap aktif: `roadmap/README.md`. Kerjakan task berdasarkan ID (mis. `S1-03`).

## Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind, shadcn/Radix, TanStack Query, AWS Amplify (Cognito), React Router.
- **Backend**: AWS Lambda (Node.js 20), Serverless Framework v3, API Gateway, DynamoDB, Cognito, region `us-east-1`.
- **Data**: Yahoo Finance (chart endpoint), Alpha Vantage, NewsAPI. **AI**: IBM Granite via Replicate.

## Struktur (kondisi saat ini, update setelah S0-04 / S1-01)
```
frontend/            React app (src/components, pages, services, hooks, lib)
backend/             Lambda functions (functions/*.js) + serverless.yml
docs/                Dokumentasi
roadmap/             Roadmap & prompt eksekusi
```
Target setelah Sprint 1: npm workspaces `frontend/`, `backend/`, `packages/shared/` (tipe & schema zod bersama).

## Perintah
- Frontend: `cd frontend && npm run dev | build | lint`
- Backend: `cd backend && npm run offline` (port 3001) · `npm run deploy:dev`
- (setelah S0-09) Test: `npm test` di masing-masing workspace

## Aturan WAJIB
1. **Tidak ada secret di kode/frontend.** Semua API key hanya di backend, dibaca dari env yang diisi SSM Parameter Store. Jangan pernah membuat variabel `VITE_*` untuk API key pihak ketiga.
2. **Tidak ada data palsu.** Dilarang memakai `Math.random()` atau template untuk menghasilkan harga, indikator, prediksi, atau berita. Jika data tidak tersedia, kembalikan error/state kosong yang jujur.
3. **Frontend hanya memanggil backend kita** (base URL dari `VITE_API_URL`), bukan API pihak ketiga langsung.
4. **Angka dihitung oleh kode, LLM hanya menjelaskan.** LLM tidak boleh mengarang angka harga/target; angka berasal dari tool/endpoint.
5. Setiap output analisis/prediksi menampilkan **sumber data, timestamp, dan disclaimer "Bukan nasihat keuangan"**.
6. Validasi semua input endpoint dengan **zod**. Error ke client tidak boleh berisi stack trace.
7. CORS hanya untuk origin yang diizinkan (env `ALLOWED_ORIGINS`), bukan `*`.
8. TypeScript `strict`. Hindari `any`; jika terpaksa, beri komentar alasan.
9. Fungsi murni (indikator, parser, formatter) **wajib ada unit test** (Vitest).
10. Jangan menambah dependency besar tanpa menyebut alasannya di ringkasan akhir.

## Konvensi
- Branch: `feat/S1-03-provider-adapter`, `fix/...`, `chore/...`
- Commit: Conventional Commits berbahasa Inggris, sertakan ID task: `feat(api): add market data provider adapter [S1-03]`
- Nama file: kebab-case untuk backend, PascalCase untuk komponen React.
- Bahasa UI: Inggris + Indonesia (setelah S4-02 lewat i18n). Komentar kode: Inggris.

## Definition of Done (setiap task)
- [ ] Kriteria penerimaan di file sprint terpenuhi
- [ ] `lint`, `typecheck`, `test`, `build` lulus
- [ ] Tidak ada secret/`Math.random()` data baru (`grep` dulu)
- [ ] CLAUDE.md / docs diperbarui bila struktur/perintah berubah
- [ ] Ringkasan akhir: file yang diubah, cara test manual, langkah manual yang tersisa untuk developer
