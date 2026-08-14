/// <reference types="vite/client" />

// Injectée par esbuild/Rollup au moment du build via `define` dans
// vite.config.ts (lit package.json) — voir src/pages/Parametres.tsx.
declare const __APP_VERSION__: string
