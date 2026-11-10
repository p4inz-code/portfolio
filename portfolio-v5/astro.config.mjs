import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Strip HTML comments from the built pages. Component comments are developer notes
// (version history, rationale) that should not ship to every visitor.
// Script, style, pre and textarea blocks are left alone.
function stripHtmlComments() {
  const walk = (dir) => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
  return {
    name: 'strip-html-comments',
    hooks: {
      'astro:build:done': ({ dir }) => {
        for (const file of walk(fileURLToPath(dir))) {
          const html = readFileSync(file, 'utf8');
          const out = html.split(/(<(?:script|style|pre|textarea)[\s\S]*?<\/(?:script|style|pre|textarea)>)/gi)
            .map((part, i) => (i % 2 ? part : part.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')))
            .join('');
          if (out !== html) writeFileSync(file, out);
        }
      },
    },
  };
}

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
  integrations: [stripHtmlComments()],
});
