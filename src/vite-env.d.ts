/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Images imported through vite-imagetools with `&as=srcset` (see features/landing/sections.ts) */
declare module '*as=srcset' {
  const srcset: string;
  export default srcset;
}
