export interface LabProject {
  slug: string; name: string; tagline: string; kind: string; status: string; license: string | null;
  href: string; external: boolean; order: number; created: string; repo: string;
  releases: [string, string, string][]; latestTag: string | null; latestDate: string | null; latestUrl: string | null;
}
export interface LabData {
  checkedAt: string;
  projects: LabProject[];
  latest: { name: string; tag: string; date: string };
}
export interface Mod { enable(): void; disable(): void }

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarsePointer = () => window.matchMedia('(pointer: coarse)').matches;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const dayNum = (d: string) => Math.floor(new Date(d + 'T00:00:00Z').getTime() / 864e5);
export const fromDay = (n: number) => new Date(n * 864e5).toISOString().slice(0, 10);
export const fmtShort = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
export const fmtLong = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Runs `cb(visible)` whenever the element enters or leaves the viewport. */
export function watchVisible(el: Element, cb: (visible: boolean) => void, margin = '120px') {
  const io = new IntersectionObserver((e) => cb(e[e.length - 1].isIntersecting), { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}

/** A requestAnimationFrame loop that only runs while its element is on screen and the tab is visible. */
export function visibleLoop(el: Element, step: (t: number, dt: number) => void) {
  let raf = 0, last = 0, vis = false, on = false;
  const tick = (t: number) => {
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    step(t, dt);
    raf = requestAnimationFrame(tick);
  };
  const sync = () => {
    const should = on && vis && !document.hidden;
    if (should && !raf) { last = 0; raf = requestAnimationFrame(tick); }
    if (!should && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  const un = watchVisible(el, (v) => { vis = v; sync(); });
  document.addEventListener('visibilitychange', sync);
  return {
    start() { on = true; sync(); },
    stop() { on = false; sync(); },
    destroy() { on = false; sync(); un(); document.removeEventListener('visibilitychange', sync); },
  };
}
