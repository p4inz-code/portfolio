/**
 * Small page effects, all of them replayable (they run every time the element
 * comes back into view, so scrolling up and down keeps them alive):
 *
 *   .stat-cell dd   whole numbers count up; text like "AES-256-GCM" or
 *                   "v10.12.5" resolves out of scrambled characters
 *
 * The real value stays in the DOM in a visually hidden span for screen
 * readers and for search engines; the animated copy is aria-hidden.
 * Reduced motion: nothing runs, the value is simply there.
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const CHARS = 'ABCDEF0123456789#%&*+<>';

function prep(el: HTMLElement) {
  const final = (el.textContent || '').trim();
  if (!final) return null;
  el.innerHTML = '';
  const sr = document.createElement('span');
  sr.className = 'fx-sr';
  sr.textContent = final;
  const vis = document.createElement('span');
  vis.className = 'fx-vis';
  vis.setAttribute('aria-hidden', 'true');
  vis.textContent = final;
  el.append(sr, vis);
  return { final, vis };
}

function runCount(vis: HTMLElement, final: string, token: { id: number }) {
  const target = parseInt(final, 10);
  const id = ++token.id;
  const t0 = performance.now();
  const dur = 900 + Math.min(600, target * 8);
  function step(now: number) {
    if (id !== token.id) return;
    const k = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    vis.textContent = String(Math.round(target * eased));
    if (k < 1) requestAnimationFrame(step); else vis.textContent = final;
  }
  requestAnimationFrame(step);
}

function runScramble(vis: HTMLElement, final: string, token: { id: number }) {
  const id = ++token.id;
  const t0 = performance.now();
  const dur = 650 + final.length * 40;
  function step(now: number) {
    if (id !== token.id) return;
    const k = Math.min(1, (now - t0) / dur);
    const lock = Math.floor(k * final.length);
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const c = final[i];
      out += i < lock || c === ' ' || c === '-' || c === '.' ? c : CHARS[(Math.random() * CHARS.length) | 0];
    }
    vis.textContent = out;
    if (k < 1) requestAnimationFrame(step); else vis.textContent = final;
  }
  requestAnimationFrame(step);
}

function init() {
  if (reduce.matches || !('IntersectionObserver' in window)) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.stat-cell dd'));
  if (!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement & { __fx?: { final: string; vis: HTMLElement; token: { id: number }; kind: 'count' | 'scramble' } };
      const s = el.__fx;
      if (!s) continue;
      if (e.isIntersecting) {
        if (s.kind === 'count') { s.vis.textContent = '0'; runCount(s.vis, s.final, s.token); }
        else { runScramble(s.vis, s.final, s.token); }
      } else {
        s.token.id++;               // cancel and park on the real value
        s.vis.textContent = s.final;
      }
    }
  }, { threshold: 0.6 });
  for (const el of targets) {
    const p = prep(el);
    if (!p) continue;
    const kind = /^\d+$/.test(p.final) ? 'count' : 'scramble';
    (el as any).__fx = { final: p.final, vis: p.vis, token: { id: 0 }, kind };
    io.observe(el);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

// ---- gameplay loops: play only while on screen, never in still mode or reduced motion ----
function videos() {
  const vids = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-showcase-video]'));
  if (!vids.length) return;
  const canPlay = () => !reduce.matches && !document.documentElement.hasAttribute('data-still');
  const visible = new WeakMap<Element, boolean>();
  const sync = (v: HTMLVideoElement) => {
    if (visible.get(v) && canPlay()) v.play().catch(() => {}); else v.pause();
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { visible.set(e.target, e.isIntersecting); sync(e.target as HTMLVideoElement); });
    }, { threshold: 0.35 });
    vids.forEach((v) => io.observe(v));
  }
  window.addEventListener('nb-still', () => vids.forEach(sync));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', videos);
else videos();
