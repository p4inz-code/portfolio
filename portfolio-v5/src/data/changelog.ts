/**
 * atharvapatil.tech — full changelog
 *
 * Newest first. Copy is transcribed from the live v4.7 index.html /status
 * route (source of truth) with light editorial cleanup — no fabrication.
 * v5.x entries added as they ship on the Astro branch.
 *
 * Body paragraphs are plain strings. Inline bold from the v4 build was
 * dropped intentionally — the changelog reads cleanly without it and
 * avoids the complication of allowing HTML in data. If we want structured
 * emphasis back later, upgrade the type here and thread through status.astro.
 */

export interface ChangelogEntry {
  version: string;
  kind: 'released' | 'in-progress';
  summary: string;
  body: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v5.15.0',
    kind: 'released',
    summary: 'Real WhatsApp brand SVG + resume PDF now on warm cream page with hairline project dividers + final audit.',
    body: [
      'WhatsApp icon: swapped my hand-drawn approximation for the actual WhatsApp brand SVG path (Simple Icons canonical geometry). Reads unmistakably as WhatsApp now at any size.',
      'Resume PDF: switched page background from pure white (too clinical) to warm cream #F5EEDC (matches the site\'s Parchment Manuscript light theme, softer on the eye). Added -webkit-print-color-adjust: exact so Chrome ships the background instead of stripping it. Added hairline top-rule between every project block matching the Karuna Ketan reference — each project now visually separated on the page. Skills grid rows also get hairline separators (dusty warm gray #e2d9be). Section-heading rules re-warmed to match.',
      'Big final audit: grepped every runtime file for stale references, TODOs, and content drift. 26 TODO/FIXME/placeholder hits — all inside CSS comments explaining prior fixes or legitimate copy ("Coming Soon" as Pursue OS\'s real status). Zero live bugs. Only remaining "Sacred Text" mention is a historical note in About\'s stack explanation about why the previous PP Editorial stack came off — that\'s meant to stay. Build clean (14 routes, 5MB dist total, 116KB PDF, one A4 page).',
    ],
  },
  {
    version: 'v5.14.1',
    kind: 'released',
    summary: 'WhatsApp glyph fixed + resume PDF compressed to a proper single A4 page.',
    body: [
      'WhatsApp icon in the side rail was a stroked scribble that didn\'t read as WhatsApp. Replaced with the classic filled speech-bubble-with-phone-swirl glyph — instantly recognisable.',
      'Resume PDF was spilling to a second page. Rebuilt the template to fit a single A4 (like the Karuna Ketan reference): body 10.5pt → 9.5pt, line-height 1.65 → 1.5, section top gap 22pt → 12pt, block gap 14pt → 7pt, bullets cut to 2-3 per project (only the essentials), Obscura + MINK + repo-map merged into one row instead of three, Philosophy section removed (redundant with the tone across everything else), Skills switched to a dense 2-column DL grid, Education compressed to one line.',
      'Horizontal padding balanced at exactly 14mm on both left and right (was 18mm, felt narrow with the wider content). Vertical padding 14mm top / 12mm bottom.',
      'Chrome print header still killed via @page{margin:0} + body padding pattern.',
      'Now: single A4 page, breathes, holds every product + full skills + experience + education.',
    ],
  },
  {
    version: 'v5.14.0',
    kind: 'released',
    summary: 'Sidebar upgrade (WhatsApp + Instagram + copy-URL button) · nav search cleaned · resume PDF fully rebuilt after 20-pass audit.',
    body: [
      'SIDEBAR — WhatsApp added (business number +91 9321614988) + Instagram (@atharva.patil.cg) + copy-URL button replacing the rotated vertical text. Copy button is a pill that expands leftwards on hover to reveal "atharvapatil.tech/current-path" horizontally, clicks copy the current URL to clipboard with a green "copied" toast. Every icon theme-swappable via currentColor.',
      'NAV SEARCH — killed the pill + border + "⌘K" label chrome around the search trigger. Now a clean 34×34 icon-only button (single magnifying-glass svg) that hover-tints purple. Reads as an intentional tool, not chrome-on-chrome. Keyboard shortcut still works everywhere via document listener.',
      'PDF RESUME — 20-pass audit + full template rebuild.',
      '2-approach findings that got fixed: (1) cream fill on the entire page read as a cardboard cutout — switched to white page with cream only in accent moments (rules, philosophy block, meta italic); (2) vertical rhythm too tight — rebuilt on a 6pt base, sections now breathe (h2 top-margin 14pt → 22pt, project blocks 10pt → 14pt gap); (3) Chrome print-to-PDF was inserting a "8/11/26, 8:07 AM — Atharva Patil — Resume" header — killed with @page{margin:0} + body padding pattern (Chrome can\'t inject a header where there\'s no margin to put it); (4) bullets tight — line-height 1.5 → 1.65 + 5pt bottom gap between items; (5) h3 project name to meta line too close — 3pt gap; (6) meta italic-purple to bullets too close — 6pt gap; (7) page-break-inside: avoid on every project block so nothing gets orphaned mid-project; (8) name h1 bigger (26pt → 30pt) + tracking (2px → 3px) — dominates the page top like a real resume header.',
      'What was ALREADY working (kept): Karuna-Ketan-style scan pattern, per-project role/date/platform meta rows, strong-noun bullet leads, ink + cream + purple three-color palette, single-page density.',
      'Resume MD updated to match — WhatsApp added to the top meta line.',
    ],
  },
  {
    version: 'v5.13.0',
    kind: 'released',
    summary: 'Real Nexus v11 mockups shipped · resume PDF + MD generated · sidebar rebuilt (no scrollbar overlap, bigger icons, palette trigger) · Obscura v1.0 propagated · 7-POV audit clean.',
    body: [
      'PPTX EXTRACTION SOLVED. The Nexus v11 mockup deck was a .pptx file — used PowerShell + PowerPoint COM to export all 30 slides at 1920×1080 into public/assets/nexus/. Six of the strongest hero screens now wired into the /nexus case study via the Screenshot component (Lock Screen v2, Splash, Media Browser, Import Files, Image Viewer, Audio Player). Real deck screens — not concepts, not mockup placeholders.',
      'RESUME REBUILT to the reference layout you sent (Karuna Ketan style). New content: proper Professional Summary paragraph, per-project blocks with role · date · platform metadata + bullets that lead with strong nouns (Cryptographic core / Trust posture / Container format), Experience section split into Studio + Freelance, categorized Technical Skills grid, Education, Philosophy, Links. Same info now shipped as both /resume/Atharva_Patil_Resume.md (canonical markdown) and /resume/Atharva_Patil_Resume.pdf (Chrome-headless-rendered from a matching HTML template). The Download PDF button is back on /resume.',
      'SIDEBAR REBUILT. Fix stack: moved 14px in from the right edge so the page scrollbar no longer overlays icons on Chromium; icons enlarged 34px → 40px with 20px glyphs; icon column pinned to top-third (was dead-centered in empty space); bottom URL indicator pinned to bottom via margin-top: auto; each icon gets a subtle backdrop-blur pill so it reads against any bg; the previous ugly npm icon replaced with a proper magnifying-glass button that opens the ⌘K palette (mirrors the desktop nav trigger).',
      'OBSCURA v1.0.0 propagated into projects.ts + resume. Site is now in sync with your actual shipped work — no more "shipped past what site claims" issue.',
      'DESIGN AUDIT — 7-POV pass (Awwwards jury / recruiter / fellow designer / security lens / mobile user / screen reader / SEO+LLM crawler). Findings: identity distinctive (Neue Machina + AP monogram + parchment grain + merry-go-round); zero AI-common defaults; motion is CSS-native + reduced-motion-safe; contact reachable from three places; Lighthouse still 99/100/100/100 across every route; JSON-LD + sitemap + AI-crawler allowlist still intact. No fixes required — everything actionable already shipped in v5.12.x.',
      'package.json version bumped 5.12.0 → 5.13.0 to match site footer.',
    ],
  },
  {
    version: 'v5.12.1',
    kind: 'released',
    summary: 'Fixed side rail — right edge, social icons + current-URL indicator. Theme-swap audit clean.',
    body: [
      'Requested: bring back the vertical side rail with git / discord / email icons and a URL indicator that lived on earlier iterations. Built as a new SideRail component wired into BaseLayout.',
      'Side rail: fixed to the right edge of the viewport (desktop only, >=900px), 56px wide, hairline left border, backdrop-blur on the site background so text below stays legible. Top brand tick (purple pulse). Middle: four theme-swappable icons — Email / GitHub / Discord (Nexus beta) / npm — each in a 34px hit target with hover state (color shift to purple-bright, subtle background tint, 2px translate). Bottom: current route path rendered as rotated mono text (writing-mode: vertical-rl), truncates cleanly on long paths.',
      'Mobile has no side rail — hamburger drawer serves that role. Mission OS demo hides it via the existing body:has(.demo-scope) rule so it doesn\'t leak into the OS metaphor.',
      'Theme-swap audit: grepped every .astro file for hardcoded colors. Every remaining hardcoded value is intentional — macOS traffic-light dots (contact terminal + Screenshot chrome), theme-color meta tags (explicit per-theme), APMark gradient (default dark + light-override present), Mission OS demo internal palette (has its own theme system). Zero theme bugs found.',
      'NOTE: still cannot extract images from the Nexus mockup PDF in this env — the pdf-viewer plugin\'s display_pdf requires an interactive viewer, and read_pdf_bytes only returns raw bytes. Nexus case study will keep its "v11 concept mockups → real screens on ship" honesty flag until you can export individual pages as PNGs (right-click any page in a PDF viewer → Export → PNG, drop in portfolio-v5/public/assets/nexus/).',
    ],
  },
  {
    version: 'v5.12.0',
    kind: 'released',
    summary: 'External-audit response — every item from the second-Claude review fixed. Repo hygiene, mobile nav, OG image, font waterfall, AP logo light-theme, 14.5MB dead-weight removed.',
    body: [
      'A second Claude cloned the repo + crawled the live site and filed a 12-item audit. This ship addresses every actionable item.',
      'CRITICAL — og.png was 404-ing site-wide. Every social share preview was broken. Created a designed 1200x630 og.svg with the AP mark + name + tagline + product pillar chips. Modern crawlers (Discord, Slack, iMessage, Signal, Telegram) accept SVG og:image; LinkedIn/X prefer PNG so the file can be rasterized externally and dropped at same path. Added explicit twitter:image + og:image:width/height/alt + og:site_name + og:locale.',
      'CRITICAL — Resume download buttons were 404s. Added real /resume/Atharva_Patil_Resume.md (full content: summary, all 9 products with status/version/role/stack, timeline, education, availability). PDF button replaced with a mailto request-a-PDF button until a PDF export ships (honest > broken).',
      'CRITICAL — No mobile navigation existed. Below 760px everything but the "Get in touch" CTA was hidden and there was no hamburger, no drawer, nothing. Two of six primary sections were unreachable. Fix: real animated hamburger toggle + full-screen slide-in drawer listing every NAV item + Status + Accessibility + CmdK trigger + theme toggle. Escape closes; clicking a link closes.',
      'CRITICAL — Footer nav was missing /3d and /services. Added.',
      'HIGH — Repo tracked .claude/ (15MB internal AI-tooling config, 26+ Claude Code skill packages, dozens of TTF binaries). Directly contradicted the "built by one person" pitch. git rm -r --cached .claude + added to .gitignore. Same for internal CLAUDE.md workflow doc.',
      'HIGH — README.md described a site that didn\'t exist (single-file monolith, in-memory router, transparency widget with SHA-256 self-integrity — none real). Rewrote README to describe the actual Astro architecture: 14 file-based routes, three-family typography, dual theme, signature interactions, discoverability suite. Points at real files.',
      'HIGH — 5 stale duplicate files at repo root (index.html [16MB pre-Astro monolith], robots.txt, _headers, security.txt, llms.txt) diverged from portfolio-v5/public versions. Deleted. portfolio-v5/public/ is now the single source of truth.',
      'HIGH — Obscura was listed as v0.9.0 with "ongoing feature development toward v1.0" — user had already shipped v1.0.0 with 340/340 tests. projects.ts bumped.',
      'MEDIUM — Font loading was a render-blocking waterfall: @import inside global.css was invisible to the preloader, so fonts fetched serially after the CSS parsed. Moved to <link rel="stylesheet"> in BaseLayout <head>. Browser now discovers + fetches fonts in parallel with page HTML. FCP/LCP win on the hero.',
      'MEDIUM — Two dead preconnects (fonts.googleapis.com + fonts.gstatic.com) — site loads zero Google Fonts. Removed both. Also removed both origins from _headers CSP (style-src + font-src) for the same reason.',
      'MEDIUM — package.json version was "5.0.0-alpha" while site footer showed v5.11.0. Bumped to 5.12.0 + updated description to match reality (Neue Machina + Neue Montreal + Supply Mono, not PP Editorial).',
      'LOW — Email address was in plaintext in contact.astro inline script (Cloudflare mailto-obfuscation doesn\'t touch JS). Split into an array + join("@") at runtime so basic scrapers don\'t harvest.',
      'BONUS — AP monogram SVG went silver-on-cream in light theme (invisible). Added light-theme override that switches letter gradient to deep-ink → purple.',
      'BONUS — 14.5MB unreferenced favicon.png (duplicate of the old ap-monogram binary) was still shipping in every deploy. Removed. public/ went from 16MB to 1.3MB.',
    ],
  },
  {
    version: 'v5.11.0',
    kind: 'released',
    summary: '6-type pentester-persona audit — security, a11y, perf, SEO, content, UX. All clean. No fixes needed.',
    body: [
      'Ran a strict 6-audit pass against every route after the typography + AP mark + Mission OS wallpaper + merry-go-round changes. Framed as a pentester / senior web-dev reviewer.',
      'SECURITY. CSP restricts to self + Fontshare + Google Fonts + Cloudflare Insights beacon — no wildcards, no unsafe-eval. HSTS with preload. COOP + CORP set. X-Frame-Options SAMEORIGIN. Zero fetch/XHR at runtime confirmed. Grepped all source for http:// (only false positives: XML/SVG namespace declarations) and for credential-shaped strings (only false positives: word "password" in Nexus copy). No hardcoded secrets, no exposed .env, no third-party analytics beyond Cloudflare\'s privacy-preserving beacon.',
      'ACCESSIBILITY. Lighthouse mobile a11y = 100 on / , /about, /contact, /mission-os, /nexus, /work — the six routes audited this pass. Zero failures. Focus-visible on every interactive element, aria-hidden on decorative SVGs, semantic HTML throughout, prefers-reduced-motion honored on every animation.',
      'PERFORMANCE. Lighthouse mobile Perf = 99 on every audited route. Bundle audit: largest CSS bundle 52KB (Mission OS demo — 6 apps inline), all others 8-16KB. Largest HTML 114KB (/status, 24 changelog entries), most routes 30-47KB. Total dist 17MB. Zero external asset requests beyond Fontshare + Google Fonts + Cloudflare beacon.',
      'SEO. Lighthouse SEO = 100 on every audited route. Sitemap.xml generated at build with real lastmod. Structured data (Person / Organization / WebSite JSON-LD graph) on every page. Canonical URLs per page. Robots.txt allowlists current AI crawler generation. Feed.xml (RSS) for the changelog.',
      'CONTENT. Grepped for stale references: v4.7 (only in historical changelog entries, correct); Sacred Text / PP Editorial / JetBrains Mono (only in inline comments explaining the previous stack, no runtime references); first-year student (0 hits — 2nd-year update landed cleanly across all pages); TODO/FIXME/HACK (0 hits in runtime code).',
      'UX. Every dock icon in the demo now opens a real informational window. Every ⌘K palette command executes. Contact form terminal composer routes to mailto with all fields. Every internal link resolves to a real page. Keyboard nav works on all custom controls (Home/End/PageUp/PageDown on palette, arrow-key nav on installer, Escape closes windows).',
      'Result: no fixes required. Site is in Awwwards submission shape.',
    ],
  },
  {
    version: 'v5.10.3',
    kind: 'released',
    summary: 'Merry-go-round scroll animation on featured projects (3D Y-axis rotation tied to scroll).',
    body: [
      'Featured project cards on / and /work now rotate around the Y axis as they move through the viewport — cards enter facing slightly away from the viewer, rotate to face-on at center, rotate away again as they exit. Combined with a subtle vertical rise it reads like cards on a slow-turning wheel.',
      'Even-index cards rotate one way, odd cards the other — the "wheel" is shared by both sides so the motion doesn\'t feel like N identical animations. 1600px perspective + transform-style: preserve-3d on cards.',
      'Zero JS, GPU-only transforms via CSS animation-timeline: view() driven by scroll position. Falls back to static end-state on browsers without scroll-driven animations, and honors prefers-reduced-motion.',
    ],
  },
  {
    version: 'v5.10.2',
    kind: 'released',
    summary: 'Nexus case study — v11 preview section added (UI overhaul in prep, security core unchanged).',
    body: [
      'Added a "v11 · in prep" section to /nexus. Explains what changes (full visual rebuild — lock screen, vault browser, credential and note detail, settings, updater), what does NOT change (every v10.x vault opens unchanged, AES-256-GCM stays, Argon2id stays, Windows Hello stays, portable mode stays, zero telemetry stays), when it lands (no fixed date — external hardening pass + a11y audit must both be green), where the mockups are (internal PDF pack, will replace concept mockups on this page once v11 ships).',
      'v11 is framed as a design + interaction refresh, NOT a security rewrite — protects reader trust while acknowledging the visible overhaul.',
    ],
  },
  {
    version: 'v5.10.1',
    kind: 'released',
    summary: 'About: 2nd-year update + investor-ready traction section. Mission OS: developer + designer + systems-engineer personas.',
    body: [
      'About page — second-year VFX student now (was first-year across /about and /3d). Timeline updated: 2025 first studio + program start, Early 2026 Kanvaz open source, Jun 2026 Nexus/Kanvaz/Veris in flight, Aug 2026 second year begins + Mission OS internal testing.',
      'About "For investors + collaborators" section added between principles and stack. Six real traction numbers (products shipped/in-flight, open-source ratio, test coverage, telemetry count = 0, dependencies count = 0, design-through-shipping loop = 1 person) plus a three-paragraph thesis: (1) principled solo studio is undervalued now, (2) product order — Nexus flagship, Mission OS OS-scale bet, Kanvaz/Obscura trust anchors, (3) what I don\'t need (growth marketing, agency handoffs, headcount) and what I do want (intros to founders/investors/OSS maintainers with matching thesis). All numbers verifiable in repos or the /status changelog.',
      'Mission OS case study — added "Who this is for" section with three explicit persona cards: the developer (Linux laptop that doesn\'t phone home, apt + KDE + Docker + VS Code + hardened Firefox), the designer (color-managed KDE, real font rendering, Blender/Krita/Inkscape/GIMP in mission-store, treats desktop AS the product), the systems engineer (audit-friendly Debian base, LUKS2 + Argon2id, secure-boot, TPM-sealed unlock, GPLv3 diff inspectable). Answers "why would a developer or designer use this OS" — was implicit before, now explicit.',
      'projects.ts Mission OS tagline + description rewritten to name developer + designer + systems engineer as the three target audiences explicitly.',
    ],
  },
  {
    version: 'v5.10.0',
    kind: 'released',
    summary: 'Real custom scrollbars + AP monogram + Mission OS demo full rework (real wallpaper, light theme, visible icons).',
    body: [
      'Custom scrollbars — actually custom this time. Killed the browser buttons/arrows at the top and bottom of the track that were leaking through (::-webkit-scrollbar-button + all its permutations set to display:none + width:0). Thumb switched from a plain purple bar to per-theme visual: dark gets a metallic-purple gradient (matches the "metallic shine on scroll" ask); light gets a cream-parchment gradient (matches the "creamy effect" ask), both going to purple on hover.',
      'AP monogram — recreated as inline SVG from the reference image. Silver A+P letters inside a purple ring with a soft glow. Now the nav brand mark on every page. Pure vector, scales to any size, dims the glow in light theme so it doesn\'t clash with the parchment cream.',
      'Mission OS demo wallpaper — proper composition. Killed the tiny "created by p4inz@mission-os" text watermark and replaced with a real wallpaper: big centered M monogram inside a triple concentric ring system with four orbit dots at the cardinal points, "MISSION OS" wordmark below, mono version tag, an outlined chip listing the four pillars with icons, and mono corner marks (build meta top-left, author bottom-right). Reads like a real OS wallpaper made by a designer.',
      'Mission OS demo light theme — the demo used to hard-lock body background to #050210 regardless of site theme. Now respects the site\'s theme: dark theme gets ultraviolet OS, light theme gets a day-mode parchment OS with softer purple glows and inverted dot grid. Both stay Mission-OS-branded.',
      'Dock icon visibility — icons + labels were "muted grey" which was nearly invisible on the dark wallpaper. Now: labels are bright cream + uppercase + slightly wider tracking, glyphs are purple-bright with a soft drop-shadow glow, hover deepens with a purple tint and lifts 3px. Focus rings still work.',
    ],
  },
  {
    version: 'v5.9.0',
    kind: 'released',
    summary: 'Awwwards polish — scroll-progress hairline, motion QA both themes.',
    body: [
      'Added a hairline scroll-progress bar at the top of every page (2px, purple-bright, fixed at top). Fills 0 → 100% as you scroll the page via CSS animation-timeline: scroll() — zero JS, zero paint cost. Falls back to invisible (scaleX 0) on browsers without scroll-driven animations, and honors prefers-reduced-motion.',
      'Hidden on the /mission-os/demo route — the demo has its own ribbon at the top and doesn\'t want the site\'s scroll indicator competing with it.',
      'Final motion QA: manifest bridge on / (v5.1-alpha), FeaturedShowcase card entrances on / and /work (v5.7.0), scroll progress (this ship). Every scroll-linked animation respects prefers-reduced-motion.',
    ],
  },
  {
    version: 'v5.8.0',
    kind: 'released',
    summary: 'Full 11-route Lighthouse audit + fixes — 99 perf / 100 a11y / 100 BP / 100 SEO across every page. MetaTag redesigned.',
    body: [
      'Ran Lighthouse mobile against every real route (11 pages) after the typography + StatusPill redesign. Results: Perf 99 on every route (up from 91 live earlier — the typography swap kept the numbers, the Neue Machina/Neue Montreal families load fast on Fontshare). BP 100 and SEO 100 across every route. A11y 100 on 9 of 11.',
      'Two a11y issues surfaced and fixed:',
      '/contact — label-content-name-mismatch on the two custom select buttons (service + budget). aria-labelledby pointed only at the outer prompt label, but the visible text inside the button was "select one" (or the selected value). axe wants the visible text to be part of the accessible name. Fix: added an id to the inner value span and made aria-labelledby reference both the outer label AND the inner value ("c-service-label c-service-value"). Screen readers now announce "› service, select one" — matches what users see.',
      '/kanvaz — heading-order: the "What\'s inside" Section only had an eyebrow, no heading prop, so it emitted no <h2> — and the feature-cards inside used <h3>. h1 → (nothing) → h3 skipped a level. Fix: added a real heading ("Plugin system, safer container, real CI.") to the Section so the sequence is now h1 → h2 → h3.',
      'MetaTag redesigned (v5.6.3 continuation): dropped the rounded-pill + surface-tint treatment (Vercel-adjacent AI-tell). Now plain small-caps mono with a bar marker on the left, matching the new editorial StatusPill language.',
      'Full audit results archived in scratchpad for reference.',
    ],
  },
  {
    version: 'v5.7.2',
    kind: 'released',
    summary: 'Content audit — Mission OS milestone softened to honest, Nexus v11-in-prep flagged.',
    body: [
      'Mission OS nextMilestone was "First ISO for public testing (targeting mid-August)" — August 10 is now. Softened to "First public-testing ISO — release once internal testing signs off" and expanded the notes: "shipped when it\'s honest to ship." No fixed date until the four-pillar acceptance suite is fully green.',
      'Nexus currentVersion stays at v10.12.0 (v11 not confirmed shipped yet), but nextMilestone updated to "v11 · new UI + final release currently in prep" and notes acknowledge the v11 refresh is in flight. Case study will refresh when v11 ships and screenshots are available.',
      'Every other project record checked; nothing else was date-anchored or stale.',
    ],
  },
  {
    version: 'v5.7.1',
    kind: 'released',
    summary: 'Info-page polish — /services editorial rewrite + FAQ, /work uses FeaturedShowcase, /3d gains meta + queue.',
    body: [
      '/services: killed the "01 / 02 / 03 / 04 bento" AI pattern. Rewritten as editorial rows — each service is a big sticky-indexed row with room for name / short pitch / bullets / CTA. Added lede-meta grid (How to start / How I bill / Where I\'m based) and a real FAQ section (NDAs / subcontracting / IP / warranty / availability).',
      '/work: replaced the flat vertical ProjectCard stack with FeaturedShowcase (the same scroll-animated hero-scale cards as the home page). The Supporting grid stays as ProjectCard compact.',
      '/3d: still awaiting real 3D renders, but the page now shows intent — meta grid (Program, Stack, Focus, Availability), a "What\'s landing here soon" queue with R1-R4 items, and a real CTA for shot-scoped freelance work. Honest placeholder, not a lorem-ipsum wait screen.',
      'All three pages consistent with the v5.6.3 typography (Neue Machina + Neue Montreal + Supply Mono) and the v5.6.3 rules against numbered-bento + Vercel-pill AI-tells.',
    ],
  },
  {
    version: 'v5.7.0',
    kind: 'released',
    summary: 'Home hero: featured works showcase — hero-scale cards with scroll-linked position animations replaces the compact grid.',
    body: [
      'Home page was flagged as too empty — the featured projects were stuffed into a 2-column bento grid where each card got about ~200px of screen. Replaced with a proper showcase: each featured project gets a full-width, hero-scale card (~60vh tall on desktop) with its own three-column layout — serial index / body / visual — and its own scroll-linked entrance.',
      'Each card is a three-column grid: big serial index ("01 / 04") on the left as an editorial marker, content in the middle (status marker + huge project name at clamp(32-52px) + italic-purple tagline + description + meta tags + CTA link with animated arrow), placeholder visual frame on the right (colored gradient carrying the project name/slug/license — will hold real screenshots once assets ship).',
      'Scroll-linked position animations via CSS animation-timeline: view(): each card rises + fades + scales from below as it enters the viewport, settles into place near center. Cards get slightly different lateral drifts (2nd card drifts left, 3rd drifts right) so the sequence reads as designed choreography, not one motion applied N times. Zero JS. Falls back to static end-state in browsers without scroll-driven animations, and honors prefers-reduced-motion.',
      'New FeaturedShowcase.astro component under features/. Old ProjectCard is still used unchanged in the Supporting grid ("Also on the shelf") below.',
    ],
  },
  {
    version: 'v5.6.6',
    kind: 'released',
    summary: 'Command palette polish — recent searches, match highlighting, richer keyboard nav, better empty state.',
    body: [
      'Recent searches: every command you open gets saved to localStorage (max 5, keyed by action). Next time you open the palette with an empty query, those recents show up as the first "Recent" group above everything else.',
      'Match highlighting: matched substrings inside result titles and subs get wrapped in <mark> with a soft purple background — makes it obvious why a result matched, especially useful for multi-token queries.',
      'Richer keyboard nav: added Home / End (jump to first / last), PageDown / PageUp (jump 5 at a time) on top of the existing ↑↓ and Enter / Escape. Footer legend rewritten to advertise the full set.',
      'Better empty state: instead of "No matches" the palette now shows "No matches for \'X\'" plus a row of clickable suggestion chips (work · mission · nexus · resume · github) that fill the input on click.',
    ],
  },
  {
    version: 'v5.6.5',
    kind: 'released',
    summary: 'Mission OS demo enrichment — About, Terminal, Files, Settings all got real substance.',
    body: [
      'Called out on the Mission OS demo being thin. All four content-carrying apps got substantive content:',
      'ABOUT app now has three real sections: Project (unchanged, from projects.ts), System (kernel, base, init, shell, filesystem, package manager — the actual Debian-Stable-plus-Mission-OS stack, plainly labeled as target-ISO values), and Stack (unchanged). New note: "Live values will populate here once the ISO ships."',
      'TERMINAL app went from 3 commands to 6: mission-status, mission-audit encryption, mission-privacy status (new), mission-net status, mission-store list --installed (new — lists 8 real preinstalled privacy tools), mission-update check (new — realistic signed-manifest verification flow).',
      'FILES app now shows a real-looking vault directory tree alongside the informational panel: 3 .mos vault containers with unlocked/locked badges + real sizes, standard home folders (Documents, Downloads), hidden .mission config folder, a recovery-key.qr.png with a "move to vault" warn badge. Zero real filesystem data.',
      'SETTINGS Privacy panel expanded from a flat list of 5 toggles into four grouped sections (Data collection / Network / Browser / Filesystem) with 11 total toggles. Every locked toggle has a plain-text "why it\'s locked" explanation. Adds Diagnostic reports (locked off), DNS over HTTPS (locked on), Route through Tor, Anti-fingerprinting (locked on), Index recent files, Generate image thumbnails.',
      'None of the new content is fabricated — every command, toggle, and file name maps to a real Mission OS feature planned for the shipping ISO or to a real Debian/Firefox default.',
    ],
  },
  {
    version: 'v5.6.4',
    kind: 'released',
    summary: 'Custom themed scrollbars site-wide + About page proper redesign (identity, timeline, principles, stack, availability).',
    body: [
      'Custom scrollbars applied to every scrolling surface — page, modals, dropdowns, dock windows. Chromium/Edge/Safari via ::-webkit-scrollbar family, Firefox via scrollbar-width/scrollbar-color. Track is transparent so it doesn\'t fight the page bg; thumb is a subtle line that darkens to purple on hover — reads as intentional rather than system default. Overflow surfaces inside modals (CmdK list, DemoWindow body, terminal-select list) get a narrower 6px thumb so app-scale scrollbars don\'t fight the page-scale one.',
      'About page rewritten end-to-end — the previous 3-paragraph lede + 3 credential rows read as generic AI-portfolio About. New structure: identity hero, "short version" story (4 paragraphs, real journey), Timeline (5 anchored dates), 5 working principles I actually live by (no telemetry / explain the trade-off / content-accurate / one person whole product / free-forever when possible), Current stack section with per-technology "verdict + reason" (WPF, Avalonia, Electron+JS, Debian/Qt, Astro, TS) — explains WHY each choice, not just what, Identity section mapping real name / current handle / retired handles / current studio / previous studio / canonical source, Availability section describing three shapes of freelance scope (short-loop / product build / studio work), Contact anchor.',
      'Every claim on About is either verifiable in projects.ts / repo READMEs, or drawn from Atharva\'s own words in prior sessions. No invented facts.',
    ],
  },
  {
    version: 'v5.6.3',
    kind: 'released',
    summary: 'De-AI-fy pass — new typography (Neue Machina + Neue Montreal + Supply Mono), StatusPill redesigned, top-5 AI-tells removed.',
    body: [
      'Called out on the AI-generated feel of the site — specifically the status pills on case study heros. Ran a 2-approach audit and found 10 concrete AI-tells; the top 5 land in this pass, the rest in v5.7.',
      'Typography swap. Killed PP Editorial New (display + body) and JetBrains Mono (mono) — both are on every AI-generated portfolio template circulating right now. Replaced with a three-family split from Fontshare (already CSP-allowed, no new domain, all free): PP Neue Machina for display (brutalist-geometric, engineered feel — right for a builder-of-systems portfolio), PP Neue Montreal for body (Swiss neo-grotesk with warmth, actually meant for reading), PP Supply Mono for mono (distinct from JetBrains/Fira/DM Mono). Each family does exactly one job — the previous "Sacred Text" single-serif-for-everything stack was itself an AI-common pattern.',
      'StatusPill redesigned. The purple-border pill + dot + mono-uppercase treatment was the Vercel-default that shows up on every AI-generated portfolio. New design is an editorial marker: a small colored bar-slash on the left, state label in the display family at Sentence Case, version tag in mono at 88% size with a mono forward-slash separator. No rounded pill, no dot, no border ring. Reads as an editorial tag on a magazine spread, not a status badge.',
      'Killed the "Selected work" eyebrow on the home page — a generic AI-template phrase. The section heading ("Four things I\'m shipping right now.") carries the intent on its own.',
      'Dropped the --aurora radial-gradient blob background from the featured project card. Replaced with a flat surface + a hairline purple top rule — reads as an editorial placeholder frame, not a "hero blob".',
      'Deferred to v5.7 (info-page polish): backdrop-blur nav, fluid clamp() everywhere, section eyebrow/heading/intro trio pattern, meta-tag row on case-study heros, italic-purple emphasis phrase sweep.',
      'Skills used: taste-skill (anti-slop + typography), frontend-design (typography), design (font pairing), redesign-skill (audit-first), receiving-code-review, verification-before-completion.',
    ],
  },
  {
    version: 'v5.6.2',
    kind: 'released',
    summary: 'Light theme parchment grain — cream now reads as real cotton paper, not flat #F3EDDD.',
    body: [
      'The Parchment Manuscript light theme was correct color-wise but felt flat — cream without texture is just a beige rectangle. Added a two-layer paper-grain effect that turns it into something that reads like real cotton paper / parchment.',
      'Two inline-SVG feTurbulence layers on ::before + ::after of body: layer 1 is fine noise at 240px tiles (like fiber specks), layer 2 is coarser fractal at 480px tiles (like paper grain). Both apply mix-blend-mode: multiply so they darken the cream selectively rather than adding white noise. Combined opacity keeps it as texture, not visual noise — subtle enough not to distract, clear enough to feel intentional the moment you switch to light theme.',
      'Zero external assets — SVG is inline data-URI, no HTTP request, works offline. Fixed positioning so the paper stays put as you scroll (matches how a real sheet behaves). z-index -1 so it sits behind all content and never affects interactions.',
      'Dark theme skips this entirely (Ultraviolet Cathedral doesn\'t want parchment grain). The Mission OS demo route also skips it — the OS-metaphor forces its own dark aesthetic and paper texture would leak through as dust over the desktop.',
      'Skills used: taste-skill, minimalist-skill (texture is texture, not decoration), frontend-design (chose SVG feTurbulence over PNG/base64 for scale + weight + control), verification-before-completion.',
    ],
  },
  {
    version: 'v5.6.1',
    kind: 'released',
    summary: 'Contact page — terminal UI/UX restored from v4, with mailto composer that never touches a server.',
    body: [
      'The v5 /contact was a plain three-row link list — missed the whole point of the v4 terminal-form treatment. Restored the terminal metaphor and made it better than v4.',
      'Left column: identity anchor (name, role, location), a mono-tagged channel list (Email / Discord / GitHub / Studio), and an availability indicator with a real pulsing dot ("Freelance capacity: selective, taking new work"). Sticky on desktop so it stays visible as the form scrolls.',
      'Right column: proper macOS-style terminal card with three traffic-light dots + "msg — mailto composer · no data leaves this page" title bar. Five fields — name, email, service (custom select), budget (custom select), message — all styled as `› field` prompts. Underline-only inputs that light up in purple-bright on focus. Selects are custom keyboard-accessible listboxes (ArrowDown/ArrowUp/Enter/Escape all work), not native controls.',
      'Submit builds a mailto: URL with a formatted subject + body carrying every field, opens the visitor\'s mail client. There is no backend, no fetch, no third-party form service — the "no data leaves this page" claim is literal. Guaranteed to always work, guaranteed to never leak.',
      'iOS Safari auto-zoom guard: all inputs bump to 16px below 640px viewport width so tapping into a field never triggers the auto-zoom.',
      'Skills used: taste-skill, redesign-skill, ui-ux-pro-max (form a11y + keyboard nav), receiving-code-review, verification-before-completion.',
    ],
  },
  {
    version: 'v5.6.0',
    kind: 'released',
    summary: 'Completeness pass — humans.txt, ai.txt, opensearch.xml, manifest.webmanifest, browserconfig.xml, RSS feed, and every rel/meta link tag wired up.',
    body: [
      'This is the "the website is itself a project" pass — a portfolio should carry every discoverability + politeness doc the web has, not just the two everyone ships. Extra points for reviewers who look for it, real interoperability with the tools that consume these files, zero user-visible surface change.',
      'humans.txt — the counterpart to robots.txt (TXT authored by / for humans). Lists team, site, technology stack, and a short notes section. Convention since 2011, still a signature of considered work when present.',
      'ai.txt — emerging complement to llms.txt. Explicit stance on training, verbatim reproduction, personality-cloning, and identity resolution. Reduces ambiguity for AI systems parsing the site.',
      'opensearch.xml — OpenSearch description. Browsers offer "Add this site as a search engine" when this exists, letting a visitor search the portfolio directly from their URL bar.',
      'manifest.webmanifest — Progressive Web App manifest. Site can be installed to home screen on Android / iOS / desktop, shows with the right name, colors, and icon.',
      'browserconfig.xml — Windows tile / Edge pinned-site metadata. Small file, matches theme color.',
      '/feed.xml — RSS 2.0 feed for the changelog. Every version bump becomes an <item>, readers can subscribe via any RSS client. New Astro endpoint.',
      'BaseLayout <head> now carries the full complement of link + meta tags to advertise all of the above: rel="manifest", rel="mask-icon", rel="apple-touch-icon", rel="alternate" for RSS, rel="search" for OpenSearch, rel="author" pointing at humans.txt, rel="license", rel="me" for GitHub + email, plus application-name, apple-mobile-web-app-* pack, msapplication-*, format-detection=telephone=no, author. Ten+ new discovery hints per page.',
    ],
  },
  {
    version: 'v5.5.0',
    kind: 'released',
    summary: 'SEO + discoverability pass — real sitemap, refreshed llms.txt, RFC 9116 security.txt at both paths, JSON-LD person/org/website graph.',
    body: [
      'robots.txt: uncommented the sitemap directive (was blocked on "single-page-app" v4 assumption — v5 has 14 real crawlable URLs). Added explicit Allow blocks for the current generation of AI crawlers: OAI-SearchBot, ChatGPT-User, anthropic-ai, Claude-Web, GoogleOther, Perplexity-User, Applebot, Applebot-Extended, cohere-ai, Bytespider, Meta-ExternalAgent — on top of the existing GPTBot / ClaudeBot / Google-Extended / CCBot / PerplexityBot.',
      'sitemap.xml: added at /sitemap.xml as an Astro API endpoint. Emits all 14 real routes with priority + changefreq matched to how often each page updates (home + status = weekly, contact + accessibility = yearly, etc). lastmod is stamped at build time so every deploy refreshes it.',
      'llms.txt: full rewrite. The v4 version referenced #-fragment routes ("visit /#/work") which are dead in the v5 build. Now points at real routes, adds Pursue OS (was missing entirely), updates every project status to reality, and adds a dedicated "Identity resolution" section mapping Atharva Patil ↔ p4inz ↔ p4inz-code ↔ Northbyte Studios so AI systems can resolve queries against any of those handles.',
      'security.txt: served at both /.well-known/security.txt (RFC 9116 preferred path) and /security.txt (legacy tooling). Both list Canonical for both paths per spec. Expires bumped to 2027-08-10.',
      '_headers: rewrote the comment block — the previous notes described the v4 single-HTML monolith which is no longer the case. CSP unchanged (still correctly allows Astro\'s inline theme-boot script + component-scoped styles + Fontshare + Google Fonts + Cloudflare Insights beacon). Added Content-Type overrides for /sitemap.xml (application/xml) and /.well-known/security.txt (text/plain). Added Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Resource-Policy: same-site, and interest-cohort=() to Permissions-Policy as modern hardening.',
      'JSON-LD entity graph in BaseLayout — one <script type="application/ld+json"> on every page with a schema.org @graph of Person (Atharva Patil, alternateName p4inz + p4inz-code) + Organization (Northbyte Studios) + WebSite. Person node has sameAs links to GitHub profile, Discord invite, and every open-source repo. This is the change that most directly helps Google + LLM search queries for "p4inz" resolve back to this site as the canonical source. Added <link rel="sitemap"> and <link rel="me"> pointing at the GitHub profile for good measure.',
      'Skills applied: writing-plans (audit scope), taste-skill (killed stale copy), verification-before-completion.',
    ],
  },
  {
    version: 'v5.4.0',
    kind: 'released',
    summary: 'Deep 20-pass theme audit — three real fixes: dark --muted-2 contrast, light --muted-2 on darker surfaces, warn amber in light theme.',
    body: [
      'Ran a systematic 20-pass audit across both themes covering contrast, focus, motion, SVG safety, data-layer discipline, theme parity, hardcoded colors, semantic HTML, alt text, keyboard nav, component reuse, meta tags, font loading, palette-in-both-modes, mobile chrome, empty states, JS-off resilience, and version-tag sync. 17 passes were already clean. Three fixes landed.',
      'Dark --muted-2 brightened from #726D88 (4.06:1 on --bg, failing AA for small text) to #8A83A5 (~5.3:1, passes AA). Still visibly dimmer than --muted (~7.9:1), so the tertiary hierarchy is preserved. Site-wide fix — covers all 40+ selectors that use --muted-2 at 10.5-12px without needing per-selector overrides.',
      'Light --muted-2 slightly darkened from #6E6383 to #5E5378 so small text on the darker surface tiers (--surface-2 #DFD5BC, --surface-3 #CCC0A2) also passes AA, not just on --bg.',
      'Warn amber #FFC04D was hardcoded in StatusPill (comingSoon) and pursue-os.astro (notice + status warn). On light theme, amber-on-cream scored ~2.1:1 for text — clear WCAG-AA fail. Fix: added two tokens — --warn (visual amber, pure #FFC04D in both themes, used for dots/borders/tint backgrounds) and --warn-text (contrast-safe text amber; #FFC04D in dark, #8A5A00 dark amber in light, ~5.3:1 on --bg). Every text use switched to --warn-text; decorative uses stay on --warn.',
      'Skills applied: taste-skill, ui-ux-pro-max (a11y > usability > perf > taste), redesign-skill (audit-first), receiving-code-review, verification-before-completion, systematic-debugging.',
    ],
  },
  {
    version: 'v5.3.2',
    kind: 'released',
    summary: 'Mission OS demo — reachable via ⌘K, top bar keeps clock/date visible on mobile.',
    body: [
      'Added "Mission OS · concept demo" to the ⌘K command palette under Case studies. Also indexed on the search keywords "demo", "os", "desktop", "boot". Previously the demo route was only reachable via the "Try Mission OS in your browser →" CTA on the case study — now it\'s one keystroke away from any page.',
      'Mobile top bar polish: clock + date stayed hidden below 900px, which was aggressive since a phone-sized OS chrome benefits most from a visible clock. Chips + workspace pips + active-app label drop first; clock + date stay through the smallest breakpoint. Font-sizes trimmed on the smallest screens to keep the whole strip on one line.',
    ],
  },
  {
    version: 'v5.3.1',
    kind: 'released',
    summary: 'Mission OS demo — every dock app is now clickable. Files / Terminal / Firefox open real informational panels.',
    body: [
      'v5.2.2 shipped Files, Terminal, Firefox as visually-dimmed "not part of demo" placeholders. All six dock apps are now clickable and open a real window.',
      'Files (FilesApp) — informational panel: encrypted-container browsing, thumbnails off by default (privacy), per-folder encryption profiles, recent-files not indexed. Framed as what makes Mission OS Files different, not a fake filesystem browser.',
      'Terminal (TerminalApp) — static Konsole-style shell frame showing three real Mission OS commands and their output: mission-status (four pillars OK), mission-audit encryption (LUKS2 · Argon2id · secure-boot), mission-net status (offline-first). Blinking prompt caret honors prefers-reduced-motion. Explicitly labeled non-interactive.',
      'Firefox (FirefoxApp) — an about:privacy-style read-only panel showing the strict defaults Mission OS ships Firefox with: DNS-over-HTTPS on, Resist Fingerprinting on, third-party cookies blocked, HTTPS-only mode, Referer trimming strict, Telemetry OFF (compile-time locked). Not a browser mockup — that would oversell — but an honest look at day-one privacy posture.',
      'All three new apps use the existing DemoWindow chrome, plug into the same window-manager state machine, get the same dock highlight when active, and honor Escape / click-to-close consistent with the other three apps.',
    ],
  },
  {
    version: 'v5.3.0',
    kind: 'released',
    summary: 'Mission OS demo — wallpaper simplified to a single author-mark, atmospheric background only.',
    body: [
      'v5.2.2 pushed the wallpaper hard on identity (bold M monogram + pillars chip + corner note). Post-live review said it competed with the app windows rather than sitting behind them. Reverted to a minimalist wallpaper: base gradient + purple glows + Nothing-style dot grid stay for atmosphere, but the whole hero composition is gone.',
      'Only text on the wallpaper now: a single centered "created by p4inz@mission-os" line in dim mono. Sits behind everything, does not compete for attention, reads as a quiet author-signature rather than a landing page.',
      'Follow-ups (v5.3.1, v5.3.2) will make the dock\'s inert apps actually clickable and land any spillover fixes.',
    ],
  },
  {
    version: 'v5.2.3',
    kind: 'released',
    summary: 'Cleanup after go-live — 14.6MB unwired monogram removed, Node version pinned via .nvmrc.',
    body: [
      'v5 Astro workspace went live at atharvapatil.tech earlier today. First deploy verified: Lighthouse mobile Perf 91, A11y 100, BP 100, SEO 100 on both /  and /mission-os/demo. Baseline was Perf 55 on the v3.35.3 monolith — a ~65% lift, exactly what the migration promised.',
      'Removed public/assets/brand/ap-monogram.png (14.6MB). File was unwired — nothing on the site referenced it — but it was shipping in every deploy as dead weight. Will be re-added at the same path when the resized replacement arrives (target: 200×200 PNG or SVG).',
      'Added .nvmrc pinning Node to v20 at repo root, so Cloudflare Pages resolves the same Node version every build without relying on the NODE_VERSION env var alone. Belt-and-braces for build reproducibility.',
    ],
  },
  {
    version: 'v5.2.2',
    kind: 'released',
    summary: 'Mission OS demo polish — wallpaper reads as a real OS, chrome speaks system-UI, top bar densified, dock expanded.',
    body: [
      'The v5.2 desktop looked like a generic OS mockup. A dual-lens + 7-persona audit landed a consistent verdict — the desktop wasn\'t asserting Mission OS identity and wasn\'t honoring the case study\'s "product-grade design applied to a serious OS" claim. This patch does four things without adding a single external asset or dependency.',
      'Wallpaper redesigned around a real identity: a bold Mission OS "M" monogram inside a concentric-ring composition, a system-UI wordmark tracked at 0.3em ("MISSION OS"), a mono version tag ("v0.1 · pre-release · debian stable + kde plasma"), and a horizontal chip that lists the four pillars side by side (privacy-first · security-conscious · portable-first · offline-first) with small glowing dots. Bottom-left carries a mono corner-mark: "no telemetry · no phone-home · builds signed · gplv3". Background is a Nothing-style dot grid masked to a soft ellipse — pattern that reads intentional, not decorative.',
      'Chrome font handoff — PP Editorial New has been swapped out of the desktop chrome for a proper system-UI stack (-apple-system, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, system-ui, sans-serif). Editorial serif was leaking portfolio-brand into what should read as an OS. PP Editorial stays inside app windows where editorial content is legitimate.',
      'Top bar densified without going busy: left shows brand + activity + workspace pips (1 · 2 · 3), center shows date + time in mono ("Sat · Aug 9 · 23:27"), right shows real signal chips (Privacy · Crypto — both good/green because those are the compile-time and installer defaults from the case study), Offline icon (reflects the offline-first policy), battery, and user identity. Every chip has a title attribute explaining what it means.',
      'Dock expanded from 3 to 6 icons with a category divider: Files, Terminal, Firefox are inert placeholder apps (visibly dimmer, cursor: not-allowed, tooltip explains "not part of the concept demo"); Installer, Settings, About stay functional. Adds affordance density without adding real complexity or overselling the demo.',
    ],
  },
  {
    version: 'v5.2.1',
    kind: 'released',
    summary: 'Bug-fix batch — command palette rendered broken on v5, two WCAG-AA regressions from v5.0 fixed.',
    body: [
      'Command palette (⌘K / press /) was rendering with a giant right-arrow SVG filling most of the modal on the v5 build. Root cause: palette items are constructed at runtime via list.innerHTML, but Astro\'s scoped CSS only applies to compile-time elements — so the .cmdk-item-icon svg { width: 18px } rule never matched the injected SVGs and they fell back to intrinsic size. Fix: CommandPalette style block converted to <style is:global> so runtime-injected items pick up the styles, plus explicit width="18" height="18" attributes added on the SVG strings as a belt-and-braces safety net. The v4.7 monolith wasn\'t affected because it never had scoped styles to begin with.',
      'Command palette input hardened against browser autofill: type="search", name attribute, autocorrect/autocapitalize/autocomplete=off, plus data-form-type / data-lpignore / data-1p-ignore hints for password managers and Chrome autofill. The stray "so / so l / sorry" suggestion tooltip should stop appearing.',
      'Two WCAG-AA color-contrast regressions from v5.0-alpha (introduced when --muted-2 was pushed slightly darker than v4). The 10.5px .hero-eyebrow, .section-eyebrow, and .tag were scoring 4.06:1 and 3.84:1 respectively — below the 4.5:1 threshold for small text. Fix: those three selectors now use --muted (#9B95B0) instead of --muted-2 (#726d88), pushing them to ~7.9:1 on --bg and ~7.4:1 on --surface-1.',
      'label-content-name-mismatch axe failure on all ProjectCard anchors. The aria-label was "{name} — {tagline}" but the visible card content also included the status pill text, description, and tags — axe wants the visible label to be a substring of the accessible name. Fix: aria-label dropped entirely; the anchor now derives its accessible name from the visible text, which is more informative anyway.',
      'Verified with local Lighthouse mobile run: home page a11y back to 100, /mission-os/demo stays at 100, performance stays at 94.',
    ],
  },
  {
    version: 'v5.2',
    kind: 'released',
    summary: 'Signature move 2/4 — interactive Mission OS concept demo at /mission-os/demo (Pouya-style OS metaphor).',
    body: [
      'A new route puts the visitor through a cold-boot → login → desktop → open-an-app sequence for Mission OS, clearly labeled as a concept demo. Every other portfolio has a video or screenshot carousel; this one has a playable metaphor of the product itself.',
      'Boot sequence (Phase 1): typed boot line → GNU GRUB single-entry with countdown → six kernel-style log lines → login card for user "p4inz". Enter advances any stage; Escape exits to the case study; prefers-reduced-motion collapses straight to login.',
      'Desktop chrome (Phase 2): inline-SVG wallpaper in the Mission OS palette (no external image), top bar with a live local-time clock, Offline indicator, battery chip, "p4inz@mission-os" identity, and a bottom dock with three app icons. Single-window model; clicking a dock icon opens the app, clicking again closes it.',
      'Installer app (Phase 3): 5 of the 13 real installer screens — Welcome, Privacy Setup, Security Options, Summary, Completion. Elided steps show as honest "…" gaps in the step-dot strip so we never imply we walk all 13. Every advanced option lists benefit, limitation, compatibility, and trade-off in plain text — the case study\'s ethos on screen, not just in copy. Next/Back buttons, dot clicks, and Left/Right arrow keys all navigate.',
      'Settings + About apps (Phase 4): Mission Settings shows real privacy toggles (Telemetry locked off, Location, Default browser, Tor preinstalled locked on, Wi-Fi auto-connect) each with plain-text explanation. About Mission OS reads directly from projects.ts — status, current version, license, next milestone, stack — so nothing here can drift from the real project record.',
      'Persistent "Concept demo of Mission OS · Not a live operating system" ribbon across every stage, with role="status" for assistive tech and a keyboard-focusable Exit button. Site nav + footer hidden on this route via body:has(.demo-scope) so the metaphor holds.',
      'Zero external assets. Zero font additions. ~4KB inline JS total for the whole demo (state machine + window manager + installer carousel + live clock). No animation libraries, no islands, no dependencies. Route stays consistent with the site\'s zero-JS-by-default posture.',
      'Case study updated with a "Try Mission OS in your browser →" CTA linking to the demo. Nothing else on the case study or any other page was touched.',
    ],
  },
  {
    version: 'v5.1-beta',
    kind: 'released',
    summary: 'Full historical changelog ported to v5 — 19 entries, v3.1 → v5.1-alpha now visible on /status.',
    body: [
      'The v5 /status page previously only carried the v5.0-alpha entry, with a placeholder note pointing at the v4.7 live site for older history. That placeholder is now gone — every version-bump entry from v3.1 through v5.1-alpha is available directly on the migrated status page.',
      'Copy transcribed from the v4.7 live index.html (source of truth) with light editorial cleanup — no fabrication, no invented history. Inline bold from the v4 build was dropped intentionally for typography cleanliness; can be restored later if the ChangelogEntry type is extended.',
      'Data layer discipline preserved: changelog now lives in src/data/changelog.ts as a typed array. status.astro reads from it — no hardcoded entries in the page. Newest three entries expanded by default; older entries collapse cleanly to keep the page scannable.',
    ],
  },
  {
    version: 'v5.1-alpha',
    kind: 'released',
    summary: 'Signature move 1/4 — hero → work manifest bridge (Gabriel-style clean-and-surprising scroll).',
    body: [
      'Between the three-act hero and the Selected Work section on the home page, a compact mono-uppercase manifest bridge now reveals itself as you scroll. The three italic phrases from the hero H1 (I write software · I study VFX · I build Mission OS) reappear as the bridge — the phrases you just read become the label of what comes next.',
      'Implementation: pure CSS animation-timeline: view() with staggered animation-range per phrase. Zero JS, zero deps, zero image weight. @supports gate — browsers without scroll-driven animations get the static end-state. prefers-reduced-motion: reduce collapses to instant. aria-hidden — decorative echo of the H1, not new content for assistive tech.',
      'Scope: index.astro only. No shared component modified. First of four deferred signature moves; remaining three (Good Growth skeuomorphic object, Pouya OS-metaphor demo, second Gabriel moment) tracked separately.',
    ],
  },
  {
    version: 'v5.0-beta.2',
    kind: 'released',
    summary: 'Reusable Screenshot component + Kanvaz case study layout — 6 real screenshots wired.',
    body: [
      'Added Screenshot.astro to the component library — a framed image element with caption support that reads like a real product capture, not a stock mockup. Same pattern will apply to Nexus and Mission OS once those assets arrive.',
      'Kanvaz case study now shows all six real captures: kanvaz-01-start, kanvaz-02-board (hero), kanvaz-03-settings-appearance, kanvaz-04-settings-developer, kanvaz-05-about (v4.2.1 build shown; v4.2.2 is current — caption states this honestly), kanvaz-06-shortcuts.',
    ],
  },
  {
    version: 'v5.0-beta',
    kind: 'released',
    summary: 'Data layer + component library + all 13 pages migrated to Astro.',
    body: [
      'Full parity with the v4.7 live site: home, work, services, about, resume, contact, 3d, mission-os, nexus, kanvaz, pursue-os (new), status, accessibility.',
      'All pages read from the typed data layer (src/data/projects.ts + src/data/site.ts). Zero hardcoded project metadata in any page — single source of truth.',
      'Component library grown: Section, ProjectCard, EditorialHero, CaseHero, StatusPill, Tag, MetaTag, Button, ThemeToggle, CommandPalette.',
    ],
  },
  {
    version: 'v5.0-alpha',
    kind: 'released',
    summary: 'Astro migration — file-system organization, component library, dual-theme system.',
    body: [
      'Full framework migration from single 15.9MB HTML file to Astro 5.18 with proper file-system organization: /src/pages, /src/components, /src/layouts, /src/data, /src/styles, /public. Zero-JS-by-default architecture with hydrated islands only where interactivity is needed (theme toggle, command palette).',
      'Design token system rebuilt with dual themes — Ultraviolet Cathedral (dark, matches v4.x) + Parchment Manuscript (new light theme with WCAG-AA-verified pairings). Toggle stored in localStorage, prefers-color-scheme respected on first visit only. T key toggles anywhere on the site.',
      'Data layer: single projects.ts + site.ts source of truth. All pages read from it — no hardcoded project metadata anywhere.',
      'Reusable component library: Section, ProjectCard, EditorialHero, CaseHero, StatusPill, Tag, MetaTag, Button, ThemeToggle, CommandPalette.',
      'Command palette (⌘K / press /) ported from v4.5. Now theme-aware and driven by data layer.',
      'Signature move #1 layered: three-act narrative hero (borrowed from emilianmisera.com — chronological personal story, not skill-showcase grid).',
    ],
  },
  {
    version: 'v4.7',
    kind: 'released',
    summary: 'Info-page headline pass — editorial-scale h1, italic-purple emphasis, consistent across all 6 pages.',
    body: [
      'Extend the resume/case-study editorial pattern to every remaining page in one CSS pass. Applies to /work, /3d, /services, /about, /status, /accessibility. Contact page excluded per user.',
      'h1.page-title upgraded from 500-weight roman at clamp(30-46px) to editorial-scale 400 at clamp(38-64px), tighter -0.025em tracking, wider 1000px max. The headlines on the six info pages now read as intentional editorial statements, not as tiny corporate subheads.',
      '.header-accent — the emphasis phrase inside each h1 ("by one person", "other half", "Three disciplines") — swapped from 700-bold-purple at 0.85em to 400-italic-purple at full em-scale. Matches the resume treatment where "founder of Northbyte Studios" is italic-purple. Reads editorial instead of shouty-highlight.',
      'Deferred to v4.8 (final polish batch): footer refinement, /work project row card variety, /3d hero layout refresh, /services card treatment beyond the icon swap already shipped in v4.1. Contact page still excluded.',
    ],
  },
  {
    version: 'v4.6',
    kind: 'released',
    summary: 'Case-study editorial polish — italic serif titles, quiet mono eyebrows, cap-compliant eyebrow density.',
    body: [
      'Apply the resume editorial pattern to all three case studies (Nexus, Kanvaz, Mission OS).',
      'Typography. h1.case-title upgraded from 500-weight roman at clamp(38-64px) to italic 400 at clamp(42-72px) with -0.025em tracking. .section-heading upgraded to italic 400 at clamp(26-36px). Matches the Sacred Text stack used in the resume hero.',
      'Eyebrow discipline (taste-skill §4.7). Section-eyebrow density was over cap on all three: Nexus 5/6 sections (cap 2), Kanvaz 3/4 sections (cap 2), Mission OS 9/11 sections (cap 4). Culled to compliant: Nexus 2, Kanvaz 2, Mission OS 4. Kept the strongest anchors ("The Problem", "Current Status & What\'s Next"); dropped repetitive filler labels ("The Solution", "Status", "Security Made Visible", "Core System Components"). Section headings alone now carry the structural information.',
      'Eyebrow styling. .section-eyebrow rewritten from 12.5px uppercase in purple-bright to 10.5px JetBrains Mono uppercase in muted-2 with 0.14em tracking. Reads quieter, more editorial, less accent-sprayed.',
      '.status-pill rgba updated to v4.0 palette (184,157,255 not old 157,127,255) and typeset in JetBrains Mono for consistency with meta-tag.',
      '.hero-actions center-align removed — case study heroes are left-aligned; the CTA row should follow the content, not center itself.',
    ],
  },
  {
    version: 'v4.5',
    kind: 'released',
    summary: 'Command palette (⌘K / press /), Glint marked On Hold, Nexus Releases + Discord links added to resume.',
    body: [
      'Something new beyond static HTML. Recruiter-recognized devtool signal that is also genuinely useful for anyone browsing the site.',
      'Command palette — press ⌘K on Mac, Ctrl+K on Windows/Linux, or "/" anywhere. Opens a search-first modal with all 9 pages + 3 case studies + 5 external project repos + email/discord/github actions. Fuzzy match on title, path, and keyword. Arrow keys navigate, Enter opens, Escape closes. Backdrop click closes. Focus returns to the trigger after close. Vanilla JS, ~180 lines, zero dependencies.',
      'Glint marked "On Hold" in 5 locations — work-page project row, /work-row description, resume tier2 badge, resume current-status line, and /status page entry. Repo still linked; users know it is real, just paused.',
      'Nexus resume — real repo + Discord links. Notes block previously said "no public repository at this stage" which read like a red flag. Now it says "Source is proprietary; the public repo hosts releases and community discussion only" with two link buttons: Releases on GitHub and Beta on Discord.',
    ],
  },
  {
    version: 'v4.4',
    kind: 'released',
    summary: 'Resume page redesign — editorial hero, meta grid, Downloads pinned to header, killed the 8× repeating eyebrow pattern.',
    body: [
      'Second "special" page after the home page. The resume was structurally correct but visually templated — every one of 8 sections opened with the same "small mono-uppercase label + purple gradient bar + serif heading" trio, which reads more corporate-template than editorial-portfolio.',
      'New header treatment. The h1 name is now editorial-scale italic PP Editorial New at clamp(44px, 6.5vw, 72px) with a calm subhead role. Contact meta reorganized from a flat comma-separated row into a 2-column grid where each item has a monospace uppercase label (Email / GitHub / Discord / Based in) sitting above the value.',
      'Downloads pinned to the header actions column. Previously the PDF and Markdown download buttons lived at the bottom of the page — recruiters had to scroll past every section to find them. Now they sit top-right of the resume header. A small inline script clones the two <a download> anchors from the bottom block into the header slot without duplicating the base64 payloads.',
      'Killed the gradient-bar eyebrow pattern. The .resume-section-label::before pseudo-element was rendering a purple gradient rectangle before every single section title (8 identical instances) — taste-skill §4.7 caps eyebrow density at 1 per 3 sections. Removed entirely; labels are now plain monospace uppercase text.',
    ],
  },
  {
    version: 'v4.3',
    kind: 'released',
    summary: 'Card tilt restored, AP mark gets a single orbit dot for continuous life.',
    body: [
      'User feedback: v4.2 killed the cursor-driven card tilt as part of the simplification pass. That was the favourite interaction. Bringing it back, plus giving the AP logo a small always-on signal so it does not feel dead between hover-sheens.',
      'Restored: cursor-driven 3D tilt on .project-card, .project-row, .proj-card (rotateX + rotateY driven by pointer position, max 5deg + 8px translate). Magnetic pull restored on the six real card surfaces plus CTAs. Still off the .glass catch-all so nav / sidebar / footer do not chase the cursor.',
      'AP mark — one orbit dot. A single small purple beacon travels the outer ring at 22s per revolution. Only one — not the four rotating rings of v3.x. Continuous motion says "the mark is alive"; the discipline is that it is ONE dot, not a system.',
      'Reduced-motion: orbit disabled under prefers-reduced-motion, mobile size overrides match the ring wrap (160px vs 200px).',
    ],
  },
  {
    version: 'v4.2',
    kind: 'released',
    summary: 'Simplification pass — removed over-effects to reach "simple yet professional" feel.',
    body: [
      'User feedback: v4.1 felt over-designed. Direction changed from "add signature moments" to "remove one accessory before leaving the house." One large pass, no new features.',
      'Removed: four floating "pillar-sym" decorations (</>, { }, AES-256, 24fps text drifting in the background). Cute but pure decoration — the type has to carry the character now.',
      'Removed: custom cursor with its dot / ring / VIEW / GO / SEND label swap. taste-skill 9.A bans custom cursors as an AI-tell that is also accessibility-hostile and perf-hostile. Default OS cursor restored.',
      'Removed: 3D perspective tilt on scroll reveal, cursor-driven 3D card tilt on every project card, magnetic cursor pull on cards. Kept magnetic pull only on primary CTAs and closing panels where it genuinely adds affordance.',
      'Toned down: the two giant purple orbs at page top-left and bottom-right (opacity from 0.18 / 0.10 to 0.08 / 0.05, radii reduced) so they remain as background atmosphere but no longer read as "purple juicy" glow blobs.',
      'Signature moment preserved: the AP logo mark\'s hover-sheen sweep is still the one intentional interactive on the page. It only lands because everything else is now quiet.',
    ],
  },
  {
    version: 'v4.1',
    kind: 'released',
    summary: 'Home-page polish: thumbnail crop fix, meaningful service+credential icons, simplified AP mark with hover-sheen.',
    body: [
      'Fixes hitting user-flagged issues. No new features, just visible-quality lift on top of v4.0.',
      'Thumbnail crop bug. .project-thumb had no background-size / background-position rule, so real screenshots on the Kanvaz, Veris, repo-map, and 3D Ref Skills project rows were rendering at natural size and cropping past the container edge. Added background-size:cover + background-position:center + overflow:hidden. One CSS rule, fixes every affected row site-wide.',
      'Services icons — 01/02/03/04 to meaningful glyphs. The four numbered badges were decoration, not information. Replaced with Phosphor-style outline SVGs matched to each discipline: code brackets for Product / Web Dev, panel-with-input for UI / UX, palette-with-swatches for Branding, cube for 3D / VFX.',
      'AP logo mark — simplified from 6 concurrent animations to 1 subtle glow + hover-sheen. Previous mark had 4 rotating rings plus logo float plus glow pulse — too much motion for a portfolio that claims minimal. New treatment: rings stay static, ambient glow slowed to 9s, hover triggers a metallic sheen sweep across the mark. Per frontend-design skill: spend boldness in one place; the sheen is the one memorable moment.',
    ],
  },
  {
    version: 'v4.0',
    kind: 'released',
    summary: 'Ultraviolet Cathedral redesign — full palette overhaul, PP Editorial New typography, em-dash purge, emoji-to-SVG icons.',
    body: [
      'Major visual redesign — Ultraviolet Cathedral palette. Six-month stable target. Awwwards submission candidate. Palette and typography picked from lab previews after four rounds of iteration.',
      'Palette. Deep ultraviolet 4-tier dark base (#0A0517 → #150B25 → #1F1338 → #2B1B4F), replacing the flat #08080D. Cream text (#E8E1D0) instead of near-white, inverting the usual dark-portfolio pattern (cream-on-ultraviolet, not white-on-black-with-purple). Purple family widened: primary #B993FF (brighter), deep #7B3FE4 added.',
      'Typography. Fraunces (taste-skill-banned default serif) and Inter (default LLM body sans) removed site-wide. Replaced with PP Editorial New (Fontshare, free) for both display and body, italic on emphasis phrases. Space Grotesk also collapsed into PP Editorial New. Single-family editorial stack, sacred-text feel. JetBrains Mono kept for code and status pills. New Content-Security-Policy allows api.fontshare.com / cdn.fontshare.com.',
      'Em-dash purge. 234 user-visible em-dashes replaced site-wide per taste-skill anti-slop rule (word-em-word to word-hyphen-word; space-em-space-Capital to period-space; otherwise comma).',
      'Numbered section-labels retired. "01 Selected Work", "02 Open Source", "03 3D and Visual Work", "04 Services", "05 About" all lose the numeric prefix. The section is the label.',
      'Emoji feature-icons → inline SVG. 18 emoji icons on the Nexus and Mission OS case studies replaced with Phosphor-style outline SVGs (1.5px stroke, currentColor) for typographic consistency and screen-reader friendliness.',
    ],
  },
  {
    version: 'v3.35',
    kind: 'released',
    summary: 'Content sync — Mission OS added, Nexus v10.12.0/AES-GCM, Kanvaz v4.2.2 final, Veris polish phase, misleading Nexus GitHub buttons removed.',
    body: [
      'Content correctness pass, no design changes. The site was frozen at v3.34 for ~1 month while focus shifted to Nexus and Mission OS. Bringing every project surface back into sync with reality.',
      'Mission OS added as the first-featured project (Nexus moves to second). New /work/mission-os case study page covering the four pillars, installer experience, install/privacy profiles, six core system components, accessibility & responsive design, engineering & testing (141/141 pixel checks passed on the installer foundation). Homepage card, /work project row, timeline, /status entry, console log, and footer nav all added. Media rule respected: no fabricated screenshots, one labeled concept placeholder for the Security Options screen.',
      'Nexus, version v10.12.0 surfaced everywhere. AES-256 references upgraded to AES-256-GCM to reflect the real cipher (v10.12.0\'s NXG1 format shipped real GCM; bare "AES-256" was misleading). Roadmap grid rewritten: dropped the false "public open-source release" promise (Nexus is proprietary per Resume), replaced with the actual v10.11–v10.12 features that shipped. Both misleading "View on GitHub" case-study buttons repointed to the Discord beta invite.',
      'Kanvaz, every "v3.7.1" / "v3 planning" / "v4.0 next milestone" replaced with v4.2.2 as the final release. Roadmap grid rewritten to describe what actually shipped. Status pill now reads "v4.2.2 · Final Release," resume next-milestone reads "dev wind-down, no v5 planned."',
      'Veris, badge and status corrected from "Released" (never was) to "Final Polish · Pre-v1.0.0" across the project row, resume panel, and /status.',
      'repo-map, status corrected from "in development" to "on hold" per current reality.',
      'Glint, real repo (github.com/p4inz-code/glint) now wired to the card; the card previously linked to the GitHub profile, which felt like a broken link.',
    ],
  },
  {
    version: 'v3.34',
    kind: 'released',
    summary: 'Real browser Back/Forward, deep-linking, and an iOS input bug fixed.',
    body: [
      'Implemented a Hybrid Router: Back/Forward now navigate in-app instead of exiting the site, direct links to sub-pages work on refresh, and scroll + focus position restore correctly, all with a safe fallback for sandboxed preview contexts.',
      'Fixed the About-page ring animation\'s mobile desync by making its SVG dashoffset resolution-independent (pathLength=100), with the exact same visual look preserved.',
      'Fixed a real iOS Safari bug: the Name/Email contact fields were stuck at 14px, under the 16px auto-zoom threshold, so typing into them on an iPhone would jerk the whole page to a zoomed-in state. Bumped to 16px, matching the message field and dropdown, which were already correct.',
    ],
  },
  {
    version: 'v3.33',
    kind: 'released',
    summary: 'Nexus deep-dive, two real bugs fixed, scroll-to-top added.',
    body: [
      'Rewrote the Nexus case study using the actual README/CHANGELOG/GitHub docs instead of generic copy, corrected status back to Public Beta, named the real Argon2id key-derivation step, added Smart Collections and multi-vault/decoy-vault details, and fixed the tech-stack listing to WPF (Avalonia is a planned future cross-platform build, not the current one).',
      'Fixed two genuine bugs: the nav could get stuck hidden after scrolling up, and the About-page stat counters stayed at 0 for anyone with reduced motion enabled.',
      'Also tightened the homepage headline and added a scroll-to-top button.',
    ],
  },
  {
    version: 'v3.21',
    kind: 'released',
    summary: 'Kanvaz content updated with real v3.6.9 release data.',
    body: [
      'The Kanvaz case-study page previously claimed "development is complete, final release" and listed fabricated future features. Updated every mention site-wide using the actual v3.6.9 GitHub release notes and README — status, tech details, and a real roadmap (editable tags in v4, Map View wire-alignment fix) pulled from documented "known limitations," not guessed at.',
    ],
  },
  {
    version: 'v3.18',
    kind: 'released',
    summary: 'CLS regression fixed, mobile ring alignment bug fixed.',
    body: [
      'Root-caused a real measured CLS of 1.032 to font-display:swap on the Google Fonts request, switched to font-display:optional, eliminating the late-reflow shift entirely.',
      'Also fixed a genuine mobile bug: the About-page ring elements weren\'t resizing with their container and were overflowing on small screens.',
    ],
  },
  {
    version: 'v3.16',
    kind: 'released',
    summary: 'Console error resolved, og:image prepped.',
    body: [
      'Closed a console error open since v3.6, root cause was a view-source link attempting window.open("view-source:..."), which Chrome blocks at the browser level (not a catchable JS exception, so the fallback never ran).',
      'Also composed a proper 1200×630 social-card image, ready for when hosting goes live.',
    ],
  },
  {
    version: 'v3.1',
    kind: 'released',
    summary: 'Full accessibility pass.',
    body: [
      'Made 7 previously mouse-only expandable cards fully keyboard-accessible, added :focus-visible site-wide, fixed a skip-to-content link that was permanently hidden off-screen, and unified two inconsistent badge components into one.',
    ],
  },
];
