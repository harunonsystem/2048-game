/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_UMAMI_WEBSITE_ID_2048_GAME?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
