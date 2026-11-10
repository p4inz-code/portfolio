import { $, clamp, coarsePointer, dayNum, fmtShort, reduceMotion, visibleLoop, type LabData, type Mod } from './common.ts';

interface Card {
  el: HTMLAnchorElement; x: number; y: number; vx: number; vy: number; hx: number; hy: number;
  w: number; h: number; phase: number; depth: number; drag: boolean; moved: number;
}

export function initDrift(data: LabData): Mod & { setTilt(x: number, y: number): void } {
  const host = $('#drift')!;
  let cards: Card[] = [];
  let tx = 0, ty = 0, smx = 0, smy = 0;
  let loop: ReturnType<typeof visibleLoop> | null = null;
  let enabled = false;
  let mode: 'field' | 'row' | 'static' = 'field';
  const today = dayNum(data.checkedAt);

  const pickMode = () => (reduceMotion() ? 'static' : window.innerWidth < 700 || coarsePointer() && window.innerWidth < 900 ? 'row' : 'field');

  // small seeded random so the layout is the same every visit
  const rng = (() => { let s = 20261110; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();

  function build() {
    mode = pickMode();
    host.className = 'drift' + (mode === 'row' ? ' is-row' : mode === 'static' ? ' is-static' : '');
    host.innerHTML = '';
    cards = [];
    for (const p of data.projects) {
      const a = document.createElement('a');
      a.className = 'drift-card';
      a.href = p.href;
      a.setAttribute('role', 'listitem');
      a.setAttribute('data-pad', '');
      if (p.external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      const last = p.latestDate ?? p.created;
      const days = today - dayNum(last);
      const recency = clamp(1 - days / 140, 0, 1);
      a.style.setProperty('--fs', `${15 + recency * 9}px`);
      a.style.setProperty('--ring', recency > 0.6 ? 'var(--purple)' : 'var(--line-strong)');
      a.innerHTML = `<b></b><small><span class="light" data-kind="${p.kind}"></span><span></span></small><em></em>`;
      a.querySelector('b')!.textContent = p.name;
      a.querySelectorAll('small span')[1].textContent = p.status;
      a.querySelector('em')!.textContent = p.latestTag ? `${p.latestTag} · ${fmtShort(p.latestDate!)}` : `started ${fmtShort(p.created)}`;
      host.appendChild(a);
      cards.push({ el: a, x: 0, y: 0, vx: 0, vy: 0, hx: 0, hy: 0, w: 0, h: 0, phase: rng() * 6.28, depth: 0.4 + rng() * 0.9, drag: false, moved: 0 });
    }
    if (mode !== 'field') return;
    layout();
    for (const c of cards) { c.x = c.hx; c.y = c.hy; bind(c); }
    render();
  }

  function layout() {
    const W = host.clientWidth, H = host.clientHeight;
    const n = cards.length;
    const cols = Math.max(2, Math.round(Math.sqrt((n * W) / H)));
    const rows = Math.ceil(n / cols);
    cards.forEach((c, i) => {
      c.w = c.el.offsetWidth; c.h = c.el.offsetHeight;
      const col = i % cols, row = Math.floor(i / cols);
      const cx = ((col + 0.5) / cols) * W + (rng() - 0.5) * (W / cols) * 0.35 + (row % 2 ? W / cols / 4 : 0);
      const cy = ((row + 0.5) / rows) * H + (rng() - 0.5) * (H / rows) * 0.4;
      c.hx = clamp(cx - c.w / 2, 8, W - c.w - 8);
      c.hy = clamp(cy - c.h / 2, 8, H - c.h - 8);
    });
  }

  function bind(c: Card) {
    let px = 0, py = 0, ox = 0, oy = 0, last: { x: number; y: number; t: number }[] = [];
    c.el.addEventListener('pointerdown', (e) => {
      if (mode !== 'field' || e.button !== 0) return;
      c.el.setPointerCapture(e.pointerId);
      const r = host.getBoundingClientRect();
      ox = e.clientX - r.left - c.x; oy = e.clientY - r.top - c.y; px = e.clientX; py = e.clientY;
      c.drag = true; c.moved = 0; c.vx = c.vy = 0; last = [{ x: c.x, y: c.y, t: performance.now() }];
      c.el.dataset.drag = '1';
    });
    c.el.addEventListener('pointermove', (e) => {
      if (!c.drag) return;
      const r = host.getBoundingClientRect();
      c.moved = Math.max(c.moved, Math.hypot(e.clientX - px, e.clientY - py));
      c.x = clamp(e.clientX - r.left - ox, 0, r.width - c.w);
      c.y = clamp(e.clientY - r.top - oy, 0, r.height - c.h);
      last.push({ x: c.x, y: c.y, t: performance.now() });
      if (last.length > 5) last.shift();
      render();
    });
    const end = () => {
      if (!c.drag) return;
      c.drag = false; delete c.el.dataset.drag;
      const a = last[0], b = last[last.length - 1];
      const dt = Math.max(16, b.t - a.t) / 1000;
      c.vx = clamp((b.x - a.x) / dt, -1800, 1800); c.vy = clamp((b.y - a.y) / dt, -1800, 1800);
    };
    c.el.addEventListener('pointerup', end);
    c.el.addEventListener('pointercancel', end);
    c.el.addEventListener('click', (e) => { if (c.moved > 6) e.preventDefault(); });
    c.el.addEventListener('dragstart', (e) => e.preventDefault());
  }

  function render() {
    for (const c of cards) c.el.style.transform = `translate3d(${(c.x + smx * c.depth * 22).toFixed(1)}px, ${(c.y + smy * c.depth * 22).toFixed(1)}px, 0)`;
  }

  function step(t: number, dt: number) {
    if (mode !== 'field') return;
    smx += (tx - smx) * Math.min(1, dt * 5); smy += (ty - smy) * Math.min(1, dt * 5);
    const W = host.clientWidth, H = host.clientHeight;
    for (const c of cards) {
      if (c.drag) continue;
      const gx = c.hx + Math.sin(t * 0.00035 + c.phase) * 14, gy = c.hy + Math.cos(t * 0.00028 + c.phase * 1.3) * 12;
      c.vx += (16 * (gx - c.x) - 5 * c.vx) * dt;
      c.vy += (16 * (gy - c.y) - 5 * c.vy) * dt;
    }
    // soft push-apart so cards never stack on top of each other
    for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i], b = cards[j];
      const dx = a.x + a.w / 2 - (b.x + b.w / 2), dy = a.y + a.h / 2 - (b.y + b.h / 2);
      const ox = (a.w + b.w) / 2 + 6 - Math.abs(dx), oy = (a.h + b.h) / 2 + 6 - Math.abs(dy);
      if (ox > 0 && oy > 0) {
        const f = 260;
        if (ox < oy) { const s = Math.sign(dx) || 1; if (!a.drag) a.vx += s * f * dt * (ox / 20); if (!b.drag) b.vx -= s * f * dt * (ox / 20); }
        else { const s = Math.sign(dy) || 1; if (!a.drag) a.vy += s * f * dt * (oy / 20); if (!b.drag) b.vy -= s * f * dt * (oy / 20); }
      }
    }
    for (const c of cards) {
      if (c.drag) continue;
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.x < 0) { c.x = 0; c.vx = Math.abs(c.vx) * 0.5; }
      if (c.y < 0) { c.y = 0; c.vy = Math.abs(c.vy) * 0.5; }
      if (c.x > W - c.w) { c.x = W - c.w; c.vx = -Math.abs(c.vx) * 0.5; }
      if (c.y > H - c.h) { c.y = H - c.h; c.vy = -Math.abs(c.vy) * 0.5; }
    }
    render();
  }

  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => { if (enabled) { build(); } }, 200); };

  return {
    enable() {
      enabled = true;
      build();
      loop ??= visibleLoop(host, step);
      loop.start();
      window.addEventListener('resize', onResize);
    },
    disable() {
      enabled = false;
      loop?.stop();
      window.removeEventListener('resize', onResize);
    },
    setTilt(x: number, y: number) { tx = x; ty = y; },
  };
}
