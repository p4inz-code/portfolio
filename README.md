# Atharva Patil — Portfolio

Personal portfolio site for **Atharva Patil** — solo founder of Northbyte
Studios, software engineer, and 3D / VFX student based in Navi Mumbai,
India.

**Live:** https://atharvapatil.tech

---

## What this repo is

An Astro 5 static site: 18 pages, a 404, and build-time endpoints for the
sitemap and the RSS feed. Zero JavaScript by default, with small vanilla
islands where interactivity earns it (theme toggle, command palette,
Mission OS demo state machine, mobile nav drawer, the contact composer and
its magnetic card, the Ascent gameplay loop's play/pause).

All source lives under `portfolio-v5/`. The build outputs static HTML and
one small CSS bundle per route and deploys to Cloudflare Pages on every
push to `main`.

## Repo layout

```
portfolio/
  portfolio-v5/                    Astro workspace (the whole site)
    src/
      pages/                       Routes, file-based
      layouts/BaseLayout.astro     Head, nav, footer, JSON-LD, drawer, `scene` prop
      components/
        layout/ ui/ features/      Sections, atoms, showcase, palette, MissionDemo/
        SceneBackdrop.astro        Fixed page backdrops for Nexus / Kanvaz / Ascent
        SideRail.astro             Right rail: email, GitHub, Discord, WhatsApp,
                                   Instagram, search, copy-URL pill
      data/
        projects.ts                Single source of truth for every project
        site.ts                    SITE / CONTACT / NAV / SERVICES
        changelog.ts               Every version, newest first
      styles/
        tokens.css                 Dual-theme design tokens (dark + light)
        global.css                 Reset, base, custom scrollbars, parchment grain
        scenes.css                 Scene title fonts, the moon
    public/                        Served as-is: assets/, fonts/, resume/, og images,
                                   robots.txt, llms.txt, ai.txt, humans.txt,
                                   security.txt, manifest, opensearch
  docs/                            Handoffs and plans (PLAN-showcase-scenes.md)
  README.md                        You are here
  LICENSE                          All rights reserved
  .nvmrc                           Node 20
```

## Design system

- **Palette** — dual theme. Dark = *Ultraviolet Cathedral* (`#0A0517`
  base, cream `#E8E1D0` text, purples `#B993FF` / `#7B3FE4`). Light =
  *Parchment Manuscript* (`#F3EDDD` base, deep ink `#1A0F28`, darker
  purples for AA contrast). Text and background pairs were checked for
  WCAG AA. Toggle with the button or the `T` key; the choice is kept in
  `localStorage['nb-theme']`.
- **Type** — the intended stack is `Neue Machina` (display), `Neue
  Montreal` (body) and `Supply Mono` (mono), set as `--font-display`,
  `--font-body` and `--font-mono`. Those are Pangram Pangram families and
  are **not on Fontshare**, so the current Fontshare request returns
  nothing and the site renders the fallback stack (Helvetica Neue / Arial /
  system mono) until they are licensed and self-hosted or replaced.
  Scene titles use their own faces: Technor and Kalam (Fontshare, one
  request each) and Jersey 10 (SIL OFL, self-hosted in `public/fonts/`).
- **Motion** — scroll-linked effects use CSS scroll-driven animations
  (`animation-timeline: view()` and `scroll()`), not JavaScript. Everything
  is gated on `@supports` and `prefers-reduced-motion`, and falls back to a
  static layout in browsers without support and below 900px.

## Signature interactions

- **Featured showcase** — `/` and `/work/`. Each featured project is a
  pinned chapter: the words arrive first, one more scroll reveals the
  picture. Project names start as outlines and fill with the accent as you
  scroll. Every scroll step moves something; there are no dead stretches.
- **Scenes** — Nexus, Kanvaz and Ascent each have their own look on their
  page and in the showcase (`scene` prop on `BaseLayout`):
  - *Nexus* — Technor titles, a floor grid flowing toward you, data
    packets, a scan beam, a wireframe cube. The picture wipes in.
  - *Kanvaz* — Kalam titles, a dotted board that pans as you scroll, faint
    reference cards joined by flowing cables. A card drops onto the board.
  - *Ascent* — Jersey 10 titles, a night sky with a nebula, star layers,
    shooting stars and a moon that fills out as you scroll, over ridges that
    fall away. The letterbox opens on a real gameplay loop.
- **Contact composer** — `/contact/`. A terminal-style card with
  keyboard-accessible custom selects, a live character count and
  `Ctrl`/`Cmd` + `Enter` to send. The whole card is magnetic: it leans and
  tilts toward the pointer and lights up where it is (off on touch and for
  reduced motion). Submitting opens a `mailto:` message with the fields
  formatted in the body. No backend, no fetch, nothing leaves the page.
- **Command palette** — `⌘K` / `Ctrl+K` / `/`. Recent searches, match
  highlighting, keyboard navigation, suggestion chips on empty results.
- **Mission OS demo** — `/mission-os/demo/`. Boot sequence to a desktop with
  six windows (Installer, Settings, About, Files, Terminal, Firefox), each
  with a per-window error boundary. Labeled as a concept demo.

## How content is kept honest

Project versions, statuses and claims are checked against the real GitHub
repos and release tags before they ship, and `projects.ts` is the only
place they live. Media is real or labeled: screenshots and recordings are
captures, banners are marked as banner art, and design-deck slides are
marked as mockups. The policy is written up at `/editorial/`.

## Discoverability suite

- `sitemap.xml` — Astro endpoint, build-time `lastmod`.
- `robots.txt` — full AI crawler allowlist.
- `llms.txt` — AI-readable content index with identity resolution
  (Atharva Patil ↔ p4inz ↔ p4inz-code ↔ Northbyte Studios).
- `ai.txt` — training and attribution terms.
- `humans.txt`, `.well-known/security.txt` (RFC 9116).
- `manifest.webmanifest`, `browserconfig.xml`, `opensearch.xml`.
- `feed.xml` — RSS 2.0 for the changelog.
- IndexNow key file for Bing, Yandex, Seznam and Naver.
- JSON-LD `@graph` (Person + Organization + WebSite) on every page, plus
  per-page `SoftwareApplication`, `BreadcrumbList` and `FAQPage` nodes.

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

Cloudflare Pages, `main` branch.

- **Build command** — `cd portfolio-v5 && npm install && npm run build`
- **Output directory** — `portfolio-v5/dist`
- **Node** — 20 (from `.nvmrc`)

Every push to `main` rebuilds and deploys in about 90 seconds. `main` is
production. `v5-astro` is a mirror kept in sync with fast-forward merges;
larger work happens on a feature branch and merges to `main` once reviewed.

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

---

<!-- SUPPORT-BLOCK:START -->
<div align="center">

### Support my work

I make these tools on my own and keep them free. If one helped you, you can chip in by UPI. Any amount.

<a href="https://p4inz-code.github.io/donate/"><img src="https://raw.githubusercontent.com/p4inz-code/donate/main/qr.svg" alt="UPI QR code. Scan it with any UPI app." width="200"></a>

`9321614988@jio`

On your phone? [Open the donation page](https://p4inz-code.github.io/donate/).

</div>
<!-- SUPPORT-BLOCK:END -->
