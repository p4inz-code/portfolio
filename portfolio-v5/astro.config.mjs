import { defineConfig } from 'astro/config';

// v5.0 bootstrap. Static output, zero JS by default, per-component hydration only where
// interactivity is genuinely needed (cmd+K palette, theme toggle, signature moves).
// Cloudflare Pages picks up the /dist output; no adapter needed for pure static.
export default defineConfig({
  site: 'https://atharvapatil.tech',
  output: 'static',
  build: {
    // Inline stylesheets under 4KB so the first paint doesn't wait on a CSS round-trip,
    // but full component sheets stay external and cache-friendly.
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
