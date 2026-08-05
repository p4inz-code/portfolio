# Project Instructions — atharvapatil.tech portfolio

## Mandatory skills for this project

For **every** design, UI, UX, layout, typography, color, animation, or component decision on this project — including reviews, critiques, and small polish — always load and follow these skills first:

- `ui-ux-pro-max` (from `.claude/skills/ui-ux-pro-max/`) — priority-ordered UI/UX rule database (accessibility → touch → performance → style → layout → typography → animation → forms → navigation)
- `design-taste-frontend` (aka `taste-skill`, from `.claude/skills/taste-skill/`) — anti-slop frontend brief-inference + pre-flight, for landing pages / portfolios / redesigns
- `redesign-existing-projects` (from `.claude/skills/redesign-skill/`) — audit-first upgrade playbook for existing sites; use whenever we are improving what exists rather than building new

Supporting skills also installed in `.claude/skills/` (26 total): `brand`, `design`, `design-system`, `ui-styling`, `banner-design`, `slides`, `brandkit`, `brutalist-skill`, `gpt-tasteskill`, `image-to-code-skill`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `minimalist-skill`, `output-skill`, `soft-skill`, `stitch-skill`, `taste-skill-v1`, plus 6 from `anthropics/skills` (2026-08-05): `algorithmic-art`, `brand-guidelines`, `canvas-design`, `frontend-design`, `theme-factory`, `web-artifacts-builder`. Load on demand when the task fits. `frontend-design` is particularly relevant to the current redesign phase.

Skip only for: pure content edits with no visual decision, non-visual scripts, build/infrastructure tasks.

## Workflow rules (from the master handoff)

- **Ask before acting or building.** Plan and demo before touching real files.
- **"Plan mode"** = investigation only, no code changes. **"GO"** = explicit execute signal.
- **MAJOR.MINOR.PATCH** versioning; builds are session-scoped.
- Keep responses **concise** — "yap less, work more."
- **Brutal honesty over flattery.** Retract a suspected bug the moment verification disproves it.
- **Never fabricate project-specific facts** — versions, domains, dates, feature status. Verify against real sources; flag contradictions instead of guessing.
- **Validate after every batch of edits**: HTML parse check, JS syntax check (`node --check`), behavioral tests for interactive logic.
- **Changelog every version bump** with real reasoning — footer/console/status-page tags all stay in sync.
- Don't oversell unfinished work — status labels must reflect real state.

## Site conventions

- Single self-contained `index.html` — no framework, no build step. Base64 images inline. Cloudflare Pages auto-deploys on `git push` to `main`.
- Dark theme: `#08080D` background, purple accents `#9D7FFF` / `#C3AEFF`; fonts Fraunces / Inter / JetBrains Mono (font revamp planned).
- Router: two-layer, `renderRoute(scrollY)` + `navigateTo(routeObj)`. Every `history` call wrapped in try/catch for sandboxed-iframe fallback.
- `.project-row` on `/work` is a strict 3-column grid `200px | 1fr | auto` — direct children MUST be exactly `.project-thumb` + `.project-body` + `.project-arrow`, or the layout collapses. Do not add loose children.
- No fabricated screenshots. If a real capture doesn't exist yet, use a clearly labeled concept/mockup placeholder.

## Current phase

**Executing v4.0 redesign (2026-08-05).** Palette + typography locked after user picked from lab previews:

- **Palette: Ultraviolet Cathedral** — `#0A0517` base, `#150B25`/`#1F1338`/`#2B1B4F` elevations, purples `#B993FF`/`#7B3FE4`, text `#E8E1D0` (parchment cream). Cream-on-ultraviolet inverts the usual dark-portfolio pattern.
- **Typography: Sacred Text stack** — PP Editorial New (Fontshare, free) for display AND body. Italic on emphasis phrases; JetBrains Mono for code / status pills. Fraunces and Inter completely removed.
- **Awwwards submission target** — dial values `VARIANCE 8 · MOTION 7 · DENSITY 4` with signature interactive moment in hero (ambient purple aurora + parallax on cursor).
- **Zero-risk cleanups shipped with v4.0**: 232 em-dashes → hyphens/periods per taste-skill §9.G, 4 numbered `section-label` eyebrows removed, emoji feature-icons → inline SVG, base64 images extracted to external files (unlocks Lighthouse mobile Perf from 55 → ~90+).

See `/status` on-site for latest build. See `memory/` for user + project memory records.
