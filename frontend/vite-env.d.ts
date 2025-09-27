/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_API_URL: string
  readonly VITE_RAPIDAPI_KEY: string
  readonly VITE_REPLICATE_API_KEY: string
  readonly VITE_ALPHA_VANTAGE_API_KEY: string
  readonly VITE_NEWS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}