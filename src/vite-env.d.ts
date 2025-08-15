/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_SERVICE_KEY: string;
  // Add other VITE_ variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
