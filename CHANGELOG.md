# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning: [SemVer](https://semver.org/).

## [0.2.0] - 2026-10-21 (Sprint 0: foundation, security, honest data)

### Security
- Removed hardcoded API keys from `serverless.yml`, env templates, frontend services, docs and scripts.
- Stopped tracking `backend/.env` and `.serverless/` build artifacts.
- Backend secrets now come from AWS SSM Parameter Store (`/stockai/<stage>/*`).
- The browser no longer calls Replicate, NewsAPI, Alpha Vantage or RapidAPI directly; no `VITE_*_KEY` variables.
- Removed the mock auth fallback that signed users in when Cognito rejected their password.
- CORS restricted to an allow-list; error responses no longer include stack traces.

### Changed
- Repo is now an npm workspaces monorepo (`frontend`, `backend`, `packages/shared`) with one lockfile.
- Technical analysis is computed from one year of real daily candles (RSI Wilder, MACD, SMA 20/50/200).
- Price change is computed from the previous close (it was always 0 before).
- AI outlook calls the Replicate models endpoint correctly (configurable `LLM_MODEL`, IBM Granite by default)
  and returns an error instead of a random prediction.
- Auth is a single Cognito flow via Amplify, with email verification and password reset.
- Landing copy no longer claims accurate predictions, 99.9% uptime or per-second updates.
- Frontend upgraded to Vite 5.

### Added
- `/health` endpoint, shared HTTP/validation helpers (zod), source + timestamp badges, financial disclaimer.
- Vitest test suites for frontend and backend; a single CI workflow (lint, typecheck, test, build).

### Removed
- Random/template generators for prices, predictions, indicators and news.
- Auth Lambda (used aws-sdk v2, which is missing from the Node 20 runtime). Legacy `StockChatUsers` table is retained.
- Five unused GitHub workflows, duplicate lockfiles and yarn configs.
