# Plan: scroll choreography + per-project scenes

Branch: `feat/showcase-themes` (main stays clean until this is reviewed on a preview build).
Target version when merged: v5.24.0.

## What is wrong now

- Showcase cards all use one generic reveal (a Y-axis "wheel"). Every project moves the same way.
- The media column is a small image under a wall of empty space. Nexus banner and Mission OS banner look weak at that size.
- Nexus, Kanvaz and Ascent have their own pages but look like the rest of the site. Nothing tells you which product you are in.

## 1. Scroll choreography (featured showcase, home + /work)

Each featured project becomes a **chapter**: a tall wrapper (about 220vh desktop, 150vh mobile) with one
sticky 100vh stage inside it. A named `view-timeline` on the chapter drives three phases with
`animation-range` on `cover`. No JS, same mechanism the site already uses.

| Phase | Scroll range (of chapter cover) | What moves |
|---|---|---|
| 1. Arrive | 8% to 30% | Status, name, tagline, description rise in, staggered by range offset |
| 2. Reveal | 34% to 54% | The media card is revealed (each project reveals differently, see scenes) |
| 3. Release | 70% to 95% | Stage lifts and fades as the next chapter arrives |

So one scroll gives you the words, the next scroll reveals the picture, as asked.

Fallbacks:
- No `animation-timeline` support: static layout, everything visible.
- `prefers-reduced-motion`: static, no pin.
- Under 760px: no pinning (plain stacked card), light fade-up only.

## 2. Scenes (sub-themes)

A scene is a set of token overrides plus a few decorations, keyed by `data-scene` on a wrapper.
It sits on top of the base dark/light themes, so both themes keep working. Each scene has its own
media frame and its own reveal.

| Scene | Feel | Frame | Reveal | Backdrop |
|---|---|---|---|---|
| `nexus` | Futuristic, clean | Hairline frame, corner brackets, small mono readout | Horizontal wipe with a thin scan line | Faint measured grid fading to the edges |
| `kanvaz` | An infinite canvas | Board-card look: slight tilt, soft shadow, pin dot | Card drops onto the board and settles; a dashed connection line draws from text to card | Dot grid |
| `ascent` | Game | HUD corner marks, real readout from the footage (level, orbs) | Letterbox opens (the footage is 2.48:1) | Dusk vignette, moon glow |

Mission OS and Pursue OS keep the default look for now.

Scenes also apply on the project's own page (`/nexus`, `/kanvaz`, `/ascent`): backdrop, section eyebrows,
feature cards and screenshot frames pick up the scene. Set through a `scene` prop on `BaseLayout`.

## 3. Media changes

- Nexus: showcase uses a real v11 design-deck slide (lock screen, 1920x1080) instead of the tiny banner. Labelled as a mockup, same as the /nexus page.
- Ascent: the screen recording (Level 10, Master Escape) trimmed to a muted loop, MP4 + WebM, with a WebP poster. Plays only while in view.
- Mission OS: banner removed from the showcase and the case-study hero for now. It goes back to the plain placeholder frame, same as Pursue OS.
- Kanvaz: unchanged (real dark-theme screenshot).
- Veris and Obscura banners on /work: unchanged.

## 4. Build order

1. Media prep (video encode, poster, Nexus slide as WebP).
2. Data model: `media.kind` gains `mockup`, optional `video`, and `scene` on Project.
3. New FeaturedShowcase (chapter + stage + phases) with the default reveal.
4. `scenes.css` with the three scenes, wired through `data-scene`.
5. `scene` prop on BaseLayout, set on the three project pages.
6. Verify: build, axe-style checks, both themes, 375px and desktop, reduced motion.
7. Preview build on the branch; merge to main only after review.

## Risks

- Sticky inside a scroll-driven wrapper breaks if any ancestor has `overflow: hidden/auto`. Section already animates `transform`, so the showcase must sit outside that animated wrapper.
- Chrome and Safari 26 support `animation-timeline`; Firefox is behind a flag. Static fallback is the Firefox experience.
- Video weight: keep the loop under about 1.5 MB.

## Status (built on this branch, not merged)

- Media: Ascent loop (12 s, 325 KB MP4 / 240 KB WebM + poster) from the screen recording; Nexus uses a cropped v11 lock-screen mockup; Mission OS banner removed (placeholder frame again); Pursue OS untouched.
- Showcase rebuilt as pinned chapters with the phase timings above; scenes for nexus, kanvaz, ascent.
- `scene` prop on BaseLayout, styles in `src/styles/scenes.css`, set on /nexus, /kanvaz, /ascent.
- Not verified: autoplay of the Ascent loop in a foreground tab (the preview pane was hidden, so the browser paused it), Safari, Firefox (falls back to the static layout), and real reduced-motion (gated by media query, not emulated).
- Version and changelog are not bumped here on purpose; do it at merge (v5.24.0).

## Polish pass (same branch)

- Chapters are taller (280vh with media) so the reveal has room; text arrives 27-42%, media reveals 42-60%, leave 76-96%.
- No more linear scroll mapping: arrivals ease out, wipes ease in-out, the Kanvaz card overshoots and settles.
- Kanvaz: the cable draws first, then the card drops, then the pin pops.
- Nexus: wipe and scan line share one easing so they stay locked; slight zoom-in settle; brackets scale in.
- Ascent: letterbox opens while the footage fades up from dark and the camera pulls back; HUD corners settle onto the frame.
- Backdrops drift slower than the page for depth. A small "02 / 05" counter with a filling hairline shows chapter progress.

## Pass 3 (no dead scroll)

- Chapters shortened (240vh with media, 160vh without) and re-timed so the words start while the stage is still rising into view; the reveal follows immediately; the rest of the pin is a slow push-in plus backdrop parallax. Measured at 0.1-screen steps: no step with nothing changing.
- Ascent: HUD corner frames removed. Backdrop is now layered: stars, moon, and three ridges (far/mid/near) moving at different rates.
- Nexus corner brackets kept (they are that scene's identity); say the word to drop them too.

## Pass 4 (title fonts)

- Titles only (project name in the showcase, page h1, Ascent stat numbers): Nexus = Technor, Kanvaz = Kalam (both Fontshare, one link each), Ascent = Pixelify Sans (SIL OFL, self-hosted, Latin subset, 8.7 KB at /fonts/PixelifySans.woff2).
- Not used: the game's own font (Craftpix asset pack, not licensed for redistribution here).
- "Real capture / Real gameplay" captions removed. "v11 design mockup" stays on Nexus because it is a mockup, not the shipping UI.
- FINDING: the site's base font link asks Fontshare for neue-machina, neue-montreal and supply-mono. Fontshare's catalogue (100 fonts) has none of them, so the request returns no CSS and the whole site renders in the fallback stack (Helvetica Neue / Arial / system mono). Confirmed on the live site: document.fonts is empty. Not changed here; needs a decision.

## Pass 5 (title fill, cosmos, brackets gone)

- Project names start as an outline and fill with the accent as you scroll (a clipped copy of the text swept by the scroll timeline, the same idea as the AniFX outline-fill, but pure CSS). Ascent fills in 16 pixel-sized steps.
- All corner-bracket motifs removed: Nexus thumbnail, Nexus/Ascent page cards.
- Ascent sky rebuilt as a climb: deep-space gradient, nebula, three star layers (far/mid/near, the near one twinkles), two shooting stars at fixed scroll points, a moon that rises fast from behind the ridges, and three ridges that fall away at different speeds. Light theme keeps a lavender dusk without stars.

## Pass 6 (page backdrops + moon)

- New `SceneBackdrop.astro`, rendered by BaseLayout on scene pages: fixed, behind content, scroll-linked through the root timeline, with ambient motion only when reduced motion is not requested.
  - /nexus: perspective floor grid flowing toward you, data packets on the grid lines, a scan beam, a slow wireframe cube.
  - /kanvaz: a board that pans as you scroll (dot grid, ghost reference cards, flowing cables, a marquee selection).
  - /ascent: deep space (nebula, three star depths, shooting stars), ridges falling away, and the moon.
- Moon: craters and maria, terminator shadow, halo, and a scroll-driven phase (crescent at the top of the page, full by the bottom) with faint earthshine on the unlit side. Same orb used in the /work Ascent chapter.
