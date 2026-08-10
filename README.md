# Atharva Patil — Portfolio

Personal portfolio site for **Atharva Patil** — solo founder of Northbyte
Studios, software engineer, and 3D / VFX student based in Navi Mumbai,
India.

**Live:** https://atharvapatil.tech

---

## What this repo is

An Astro 5 static site. Built with a single-family file-based routing
setup across 14 real pages, zero-JS-by-default with small vanilla-JS
islands where interactivity is needed (theme toggle, command palette,
Mission OS demo state machine, mobile nav drawer, contact terminal).

All source lives under `portfolio-v5/`. The build outputs static HTML +
one small CSS bundle per route and deploys to Cloudflare Pages on every
push to `main`.

## Repo layout

```
portfolio/
  portfolio-v5/                    Astro workspace (the whole site)
    src/
      pages/                       14 routes — file-based
      layouts/BaseLayout.astro     Head, nav, footer, JSON-LD, mobile drawer
      components/                  layout / ui / features (incl. MissionDemo/)
      data/
        projects.ts                Single source of truth for every project
        site.ts                    SITE / CONTACT / NAV / SERVICES
        changelog.ts               Every version, newest-first
      styles/
        tokens.css                 Dual-theme design tokens (dark + light)
        global.css                 Reset, base, custom scrollbars, parchment grain
    public/                        Anything served as-is (og.svg, robots.txt,
                                   security.txt, llms.txt, sitemap loader,
                                   ai.txt, humans.txt, manifest, RSS, resume/)
  docs/                            Handoff + spec docs
  README.md                        You are here
  LICENSE                          All rights reserved
  .gitignore
  .nvmrc                           Node 20
```

## Design system

- **Palette** — dual theme. Dark = *Ultraviolet Cathedral* (`#0A0517`
  base, cream `#E8E1D0` text, purples `#B993FF` / `#7B3FE4`). Light =
  *Parchment Manuscript* (`#F3EDDD` base, deep ink `#1A0F28`, darker
  purples for AA contrast). Every text/background pair verified WCAG-AA.
- **Fonts** — three families from Fontshare, each doing one job:
  `Neue Machina` (display / hero / H1-H2), `Neue Montreal` (body / UI),
  `Supply Mono` (eyebrows / code / kbd / status). No PP Editorial New,
  no JetBrains Mono, no Inter — all three are the "safe designer" fonts
  AI generators reach for and were flagged as AI-tells in the v5.6.3
  audit. Whole stack now reads as chosen, not defaulted.
- **Motion** — every scroll-linked animation via CSS
  `animation-timeline: view()`, zero JS. Falls back to static end-state
  on unsupported browsers and honors `prefers-reduced-motion` globally.

## Signature interactions

- **Command palette** — `⌘K` / `Ctrl+K` / press `/` from anywhere.
  Recent searches, match highlighting, keyboard nav (arrows, Home/End,
  PgUp/PgDn), suggestion chips on empty results.
- **Mission OS interactive demo** — `/mission-os/demo/`. Cold-boot →
  GRUB → kernel messages → login → desktop with 6 real informational
  apps (Installer, Settings, About, Files, Terminal, Firefox). Respects
  site theme. Every dock icon opens a real window with substantive
  content. Explicitly labeled concept demo.
- **Featured showcase** — `/` and `/work/`. Hero-scale project cards
  with 3D Y-axis merry-go-round rotation tied to scroll position.
- **Contact terminal** — `/contact/`. macOS-style terminal card with
  keyboard-accessible custom selects. Submits to a `mailto:` composer
  with all fields formatted in the body. No backend, no fetch, no data
  leaves the page.

## Discoverability suite

- `sitemap.xml` — Astro endpoint, build-time `lastmod`.
- `robots.txt` — full AI crawler allowlist.
- `llms.txt` — AI-readable structured content index with identity
  resolution (Atharva Patil ↔ p4inz ↔ p4inz-code ↔ Northbyte Studios).
- `ai.txt` — training + attribution terms.
- `humans.txt` — counterpart to robots.txt.
- `.well-known/security.txt` — RFC 9116.
- `manifest.webmanifest` + `browserconfig.xml` — PWA / Windows tile.
- `opensearch.xml` — browsers can add the site as a search engine.
- `feed.xml` — RSS 2.0 for the changelog.
- JSON-LD `@graph` (Person + Organization + WebSite) on every page.

## Running locally

```bash
cd portfolio-v5
npm install
npm run dev          # http://localhost:4321
npm run build        # -> portfolio-v5/dist/
npm run preview      # serve the production build locally
```

Node version pinned to 20 via `.nvmrc`.

## Deployment

Cloudflare Pages, `main` branch. Build config:

- **Build command** — `cd portfolio-v5 && npm install && npm run build`
- **Output directory** — `portfolio-v5/dist`
- **Node** — 20 (auto-detected from `.nvmrc`)

Every push to `main` triggers a rebuild. Cloudflare deploys in ~1-2 min.

## Version history

Every version bump lands with a changelog entry at
[`/status`](https://atharvapatil.tech/status/) and in
`portfolio-v5/src/data/changelog.ts`. RSS feed of the same:
[`/feed.xml`](https://atharvapatil.tech/feed.xml).

## License

All rights reserved. This portfolio's code is not open source. The
individual products it showcases have their own licenses (MIT / GPLv3 /
Apache 2.0 / Proprietary) — see each project's own repo.

---

**Contact** — atharva.patil.cg@gmail.com · Discord `p4inz` ·
GitHub [`p4inz-code`](https://github.com/p4inz-code)
