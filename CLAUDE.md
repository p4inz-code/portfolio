# Project Instructions — atharvapatil.tech portfolio

## Mandatory skills for this project

For **every** design, UI, UX, layout, typography, color, animation, or component decision on this project — including reviews, critiques, and small polish — always load and follow these skills first:

- `ui-ux-pro-max` (from `.claude/skills/ui-ux-pro-max/`) — priority-ordered UI/UX rule database (accessibility → touch → performance → style → layout → typography → animation → forms → navigation)
- `design-taste-frontend` (aka `taste-skill`, from `.claude/skills/taste-skill/`) — anti-slop frontend brief-inference + pre-flight, for landing pages / portfolios / redesigns
- `redesign-existing-projects` (from `.claude/skills/redesign-skill/`) — audit-first upgrade playbook for existing sites; use whenever we are improving what exists rather than building new

Supporting skills also installed in `.claude/skills/`: `brand`, `design`, `design-system`, `ui-styling`, `banner-design`, `slides`, `brandkit`, `brutalist-skill`, `gpt-tasteskill`, `image-to-code-skill`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `minimalist-skill`, `output-skill`, `soft-skill`, `stitch-skill`, `taste-skill-v1`. Load on demand when the task fits.

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

Redesign phase (theme refresh + font revamp, ~6-month stable target). See `/status` on-site for latest build. See `memory/` for user + project memory records.
