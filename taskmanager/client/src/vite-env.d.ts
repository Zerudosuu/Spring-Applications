/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ACCESS_TOKEN_SKEW_SECONDS: string;
  // add other variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
