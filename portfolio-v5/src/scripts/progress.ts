/**
 * Scroll progress engine.
 *
 * The showcase, the hero and the work deck are driven by native CSS scroll
 * timelines where the browser has them and the viewport is wide. Everywhere
 * else (phones, iOS before scroll timelines shipped, Firefox) this file gives
 * the same choreography a JS driver:
 *
 *   html[data-jsp]      set when progress must come from JS
 *   [data-progress]     element gets --p, 0..1, the same "cover" mapping the
 *                       CSS timelines use: 0 when its top edge enters at the
 *                       bottom of the viewport, 1 when its bottom edge leaves
 *                       at the top
 *   html --sp           whole-page scroll progress, 0..1 (used by backdrops
 *                       when scroll() timelines are missing)
 *
 * Everything is a pure function of scroll position, so it reverses on the
 * way back up. Reduced motion turns the whole thing off.
 */
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 899.98px)');
const nativeView = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
const nativeScroll = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');

let els: HTMLElement[] = [];
let queued = false;

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function setMode() {
  const jsp = !reduce.matches && (narrow.matches || !nativeView);
  root.toggleAttribute('data-jsp', jsp);
  root.toggleAttribute('data-nosp', !nativeScroll);
}

function collect() {
  els = Array.from(document.querySelectorAll<HTMLElement>('[data-progress]'));
}

function update() {
  queued = false;
  const vh = window.innerHeight || root.clientHeight;
  const max = Math.max(1, root.scrollHeight - vh);
  root.style.setProperty('--sp', clamp(window.scrollY / max).toFixed(4));
  if (!root.hasAttribute('data-jsp')) return;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -vh * 0.3 || r.top > vh * 1.3) continue; // off screen: leave it be
    el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
  }
}

function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

function init() {
  setMode();
  collect();
  update();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => { setMode(); queue(); }, { passive: true });
  window.addEventListener('orientationchange', () => { setMode(); queue(); });
  window.addEventListener('pageshow', queue);
  narrow.addEventListener('change', () => { setMode(); queue(); });
  reduce.addEventListener('change', () => { setMode(); queue(); });
  // content that loads late (fonts, images) changes heights
  window.addEventListener('load', queue);
  if ('ResizeObserver' in window) new ResizeObserver(queue).observe(document.body);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
