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
