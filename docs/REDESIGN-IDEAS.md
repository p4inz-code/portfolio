# Redesign ideas

A research note for making atharvapatil.tech more creative. These are ideas to recreate in our own way, not designs to copy. Nothing here is built yet.

## What the research found

I ran searches on creative portfolios, agent-style interfaces, scroll animation, physics cards and performance. The honest summary is that most results were listicles and vendor blogs, so I treated them as pointers and not as proof.

- **Floating, physical projects are common.** Examples include cards that move as you scroll, screenshots on 3D planes with physics (Basement Studio), floating shapes that follow the cursor, and draggable skills built with Matter.js. Most use Three.js or React Three Fiber plus GSAP. At least one hides the floating objects on mobile.
- **Nobody seems to have an "agentic reveal" as a landing page pattern.** The search found agent interface patterns (streamed text with a cursor, step lists with pending, running and done states, pinned logs) but no site that opens with one. That gap is where we can be original.
- **Scroll-driven CSS is ready to use.** `animation-timeline: view()` and `scroll()` run off the main thread, need a `@supports` check and should sit inside `prefers-reduced-motion: no-preference`. This site already uses them.
- **Performance is the real cost.** Sources agree on the same rules: pause what is off screen, pause on `visibilitychange`, cap pixel ratio, give reduced-motion users a static poster, keep the HTML usable if WebGL fails. Third-party sources quote mobile targets of LCP 2.5 s, INP 200 ms and CLS 0.1, which should be checked against web.dev before we use them as a gate.
- **Warning from one source:** vague design prompts produce stock purple gradients and identical feature cards. Our current theme is purple, so the new look needs a clear idea behind it and not just more effects.

## Ideas, in our own voice

### 1. The drift field (floating projects)

Projects float as real HTML cards in a calm field. They drift slowly, and you can grab one, throw it and watch it settle. Our own spring code is enough for this, about 60 lines, so we avoid a physics library and the extra weight.

- Card size follows how recent the last release was. A ring shows status: released, in progress, on hold, coming soon.
- Cards that share a stack or license sit closer together, which reuses the data behind the constellation on the Work page.
- Click a card and it grows into the case study with the View Transitions API.
- On phones the field becomes a swipeable row. With reduced motion it is a plain grid.

### 2. The build log hero (our version of an agentic reveal)

The home page opens with a short log that assembles the page from real data, then fades into the hero. Every line is true because it is generated at build time from the same files the chat uses.

- Example lines: "read the project list", "latest release: Kanvaz v9.8.3", "0 trackers". The numbers would come from the data at build time.
- It plays once per visit, can be skipped with any key or tap, and is replaced by the normal hero for reduced motion and for repeat visits.
- The honesty is the point. A fake "AI is thinking" animation would break the trust the rest of the site tries to build.

### 3. The week feed

The weekly update becomes a visible feed on the home page: what changed this week, as small diff-style entries with the version before and after. It turns the weekly job into something visitors can watch.

### 4. The pinboard wall for Kanvaz

The Kanvaz page uses its own product as the layout: screenshots pinned on a board you can drag around, with typed connection lines between related ones. It shows the product by using it.

### 5. One door for search and chat

Merge the command palette and the chat widget into one input that can jump to a page or answer a question. Answers appear in the page as a card, not only in a side panel.

### 6. A shared status light

Every project gets the same small status light and one line of motion: pulse for in progress, steady for released, dim for on hold, flicker for coming soon. It is cheap, consistent and reads at a glance on every page.

## Rules we keep

- No tracking, no heavy 3D layer. The privacy promise on the site stays true.
- Every effect has a reduced-motion version and a no-JavaScript version.
- Motion pauses when it is off screen or the tab is hidden.
- Budgets: LCP under 2.5 s and INP under 200 ms on a mid-range phone, checked on the real device before anything ships.
- Changes ship behind a preview branch first. The live site only changes after you have seen a demo.

## Suggested order

1. **Prototype the drift field and the build log hero** on a preview branch, on one page (`/lab`). About a day each.
2. **Look at both on your phone**, keep one or both, and drop what feels gimmicky.
3. **Roll out the status light and the week feed** across the site.
4. **Rebuild the Kanvaz page as a pinboard** last, since it depends on the field code.

## Questions for you

- Should the look stay dark and purple, or is this the moment to change the palette?
- Is a skippable intro acceptable, or do you want the home page to load straight into content?
- Which of the six ideas excites you most? I would start with 1 and 2.

## Sources

- [Hostinger, web developer portfolio examples](https://www.hostinger.com/tutorials/web-developer-portfolio/)
- [Creative Dev Jobs, best Three.js portfolio examples](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025)
- [AYDesign, AI streaming response UI patterns](https://www.aydesign.ai/blog/ai-streaming-response-ui-patterns-2026)
- [SetProduct, AI agent UI design patterns](https://www.setproduct.com/blog/ai-agent-ui-design-patterns)
- [MDN, CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scroll-driven_Animations)
- [Chrome developers, scroll-driven animations](https://developer.chrome.com/articles/scroll-driven-animations)
- [Cardstock, Matter.js draggable cards](https://github.com/AitorGallardo/cardstock)
- [Matter.js](https://github.com/liabru/matter-js)
- [Hackernoon, the interaction budget for WebGL interfaces](https://hackernoon.com/the-interaction-budget-keeping-webgl-interfaces-usable-on-real-devices)
- [Hontran, Core Web Vitals for animation heavy sites](https://www.hontran.dev/blog/core-web-vitals-for-animation-heavy-sites)

---

# Round 2: rarer ideas

I searched Codrops, Hacker News mirrors, dev blogs and design galleries for unusual, current ideas. I could not search X, TikTok, LinkedIn or Reddit directly with the tools I have, so nothing below is a claim about what is trending there. Treat the sources as leads. The first filter was rarity: terminal portfolios, desktop OS sites, typing intros and Three.js hero scenes are all common, so I left them out.

## What I found that is actually unusual

- **Codrops, 2026:** a crumpled paper you can unfold and throw (Houdini bake plus cannon-es), a real-time datamosh transition between scenes, scroll-driven typography with ghost trails, custom brush-shaped cursor trails with WebGPU, and an HTML-in-Canvas proposal that is still behind a Chromium flag.
- **Kinetic type driven by input:** one 2025 project maps scroll speed to font weight, microphone level to width and cursor speed to slant, smoothed so it sways instead of jittering. No 2026 site combining all three turned up.
- **New CSS that few portfolios use yet:** `sibling-index()` for staggered motion without JavaScript, scroll-state queries to react to sticky or snapped elements, `@starting-style` for entry animations, and `corner-shape` for bevel, scoop and squircle corners (still experimental in Chrome).
- **Rarely used browser APIs:** Web Audio, Gamepad, device orientation and Web MIDI. These show up in talks and tutorials but almost never on portfolios.
- **A gap:** I found nothing that uses a time scrubber instead of scrolling. That could mean it is niche, or just untried.
- **The one real viral example I found** was "Your AI Slop Bores Me" (March 2026), a site where humans answer questions like ChatGPT. It says people are tired of generic AI output, which matters for how we present our chat.
- **A warning from the navigation results:** spatial and 3D navigation looks great in a prototype and often frustrates people in use, and it can break keyboard and screen reader order.

## Seven ideas to recreate, ranked by how rare they are

### 1. The scrubber (rarest)
A timeline slider along the bottom of the page runs from the first studio year to now. Drag it and the whole site rewinds: projects appear and disappear, version numbers change, status lights change. It is built from the real changelog and release dates. It is the idea with no example in my search, and it makes the weekly updates visible.

### 2. Proof stamps
Every claim on the site (a version, a license, a status) carries a small stamp: "checked against GitHub, 10 Nov". Hover or tap and it shows the release or commit it came from. It makes the weekly sync visible and sets us apart from the generic-AI look people now distrust. It needs a little more data at build time, but no new library.

### 3. Show your work chat
Each chat answer gets a "where this came from" chip that names the data it used: a project entry, a release, the services page. It fits the way the chat already works, since most answers come from a fixed knowledge base. Almost no portfolio chat does this.

### 4. The studio lamp (sky aware, private)
The page lighting follows the visitor's own clock and the moon phase, worked out locally with a formula. There is no location lookup and no weather API, so the privacy promise holds. Late at night the page dims and the status lights stay readable.

### 5. Type that listens
Project names are set in a variable font. Weight follows how recently the project shipped, and a gentle slant follows cursor speed on desktop. On touch devices and with reduced motion, it is a static weight. Smoothing stops it jittering. Cost: axis animation is heavier than transform and opacity, so it is limited to a few headings.

### 6. Controller and tilt
Plug in a game controller and the Work page becomes navigable with the stick and buttons (Gamepad API). On phones, tilting moves the cards slightly (device orientation, which needs a permission prompt on iOS, so it stays optional). It suits a studio that makes games. Both are invisible until used, which is part of the charm.

### 7. Unfolding changelog
The changelog is a sheet of paper that unfolds as you scroll, with the fold lines as the entry dividers. We would do a light CSS version, using 3D transforms and `corner-shape` where it is available, instead of the Houdini and physics bake from the Codrops demo. Rare, and readable on a phone.

## Small CSS touches that cost almost nothing

- `sibling-index()` to stagger cards in with no script.
- Scroll-state queries so the header changes when it sticks.
- `@starting-style` for panels that open smoothly.
- One-bit dither on project images that resolves to full colour on hover (a 2026 Codrops effect), done with a CSS filter or a tiny canvas.

## What I would try first

Start with **1, the scrubber** and **2, proof stamps**. Both come straight from data we already have, neither needs a heavy library, and nothing like the scrubber showed up in my search. Then **3**, since it extends the chat that already exists. The rest are optional extras once the core feels right.

## Sources, round 2

- [Codrops, exploring the HTML-in-Canvas proposal](https://tympanus.net/codrops/2026/05/13/exploring-the-html-in-canvas-proposal/)
- [Codrops, real-time ASCII and dithering effects](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/)
- [Codrops, tutorials](https://tympanus.net/codrops/category/tutorials/)
- [Chrome, what's new in web UI](https://developer.chrome.com/blog/new-in-web-ui-io26)
- [modern-css.com, what's new in CSS](https://modern-css.com/whats-new/)
- [Kinetica, kinetic typography project](https://creative-folio.vercel.app/works/kinetica)
- [LogRocket, 5 weird web APIs](https://blog.logrocket.com/5-weird-web-apis/)
- [Your AI Slop Bores Me, Wikipedia](https://en.wikipedia.org/wiki/Your_AI_Slop_Bores_Me)
- [OMG Ubuntu, a personal site as a GNOME 2 desktop](https://www.omgubuntu.co.uk/2026/06/website-as-gnome-2-desktop/amp)
- [F7, design trends 2026](https://f7.de/en/blog/designtrends-2026)
- [Dev guide, variable font animation](https://camoa.github.io/dev-guides/css/css-craft/variable-font-animation/)
