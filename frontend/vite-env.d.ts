/// <reference types="vite/client" />

// Only public, non-secret values may live in VITE_* variables (they end up in the bundle).
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AWS_REGION?: string
  readonly VITE_USER_POOL_ID: string
  readonly VITE_USER_POOL_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
