import { $, $$, clamp, coarsePointer, dayNum, fmtLong, fmtShort, fromDay, reduceMotion } from './common.ts';
import { initLamp } from './lamp.ts';
import { playIntro } from './intro.ts';
import { placeOnOrbit, step as physStep, SUN_GM, type PBody, type Sun, type Ext } from './physics.ts';

interface Body {
  slug: string; name: string; tagline: string; kind: string; status: string; license: string | null;
  href: string; external: boolean; version: string | null; date: string | null; created: string | null;
  galaxy: number; stack: string[]; latestUrl: string | null; repo: string | null; recency: number;
  releases: [string, string, string][];
}
interface UData { checkedAt: string; bodies: Body[]; galaxies: string[]; latest: { name: string; tag: string; date: string } }
interface P3 { b: Body; el: HTMLAnchorElement; p: PBody; vis: boolean; label: HTMLElement; ver: HTMLElement; trail: { x: number; y: number }[]; hue: number; px: number }
interface SunEl { el: HTMLElement; s: Sun }

const STATE_KEY = 'lab:v1';
const readState = () => { try { return JSON.parse(localStorage.getItem(STATE_KEY) || 'null') || {}; } catch { return {}; } };
const writeState = (patch: Record<string, unknown>) => { try { localStorage.setItem(STATE_KEY, JSON.stringify({ ...readState(), ...patch })); } catch { /* ignore */ } };

// three hues per galaxy, mixed with the active palette so the whole universe follows the palette switch
const HUES: [number, number, number][][] = [
  [[262, 78, 62], [286, 70, 50], [236, 70, 58]],
  [[198, 80, 56], [174, 70, 46], [222, 76, 58]],
  [[330, 76, 62], [18, 84, 60], [300, 66, 52]],
  [[44, 90, 60], [28, 86, 56], [96, 60, 52]],
];
const F = 900; // CSS perspective, in px

export function initUniverse() {
  const root = $('.uni') as HTMLElement | null;
  if (!root) return;
  const data: UData = JSON.parse($('#uni-data')!.textContent!);
  if (reduceMotion()) { root.dataset.static = '1'; return; }

  const stage = $('.uni-stage')!, track = $('.uni-track')!, cam = $('#uni-cam')!, canvas = $<HTMLCanvasElement>('#uni-stars')!;
  const hero = $('#uni-hero')!, skills = $('#uni-skills')!, panel = $('#uni-panel')!, hint = $('#uni-hint');
  const neb = $$('.uni-neb'), caps = $$('.uni-cap'), prog = $('.uni-prog')!;
  const small = window.innerWidth < 760;
  const rng = (() => { let s = 7919; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();

  // ---- build the galaxies: a sun each, planets on tilted orbits ----
  const ZGAP = 1500, Z0 = 760;
  const suns: SunEl[] = [];
  for (let g = 0; g < 4; g++) {
    const s: Sun = { x: 0, y: 0, z: -(Z0 + g * ZGAP), r: small ? 22 : 30, gm: SUN_GM };
    const el = document.createElement('div');
    el.className = 'uni-sun'; el.style.setProperty('--sun', `hsl(${HUES[g][0][0]} 90% 66%)`);
    el.innerHTML = `<i class="core"></i><i class="flare a"></i><i class="flare b"></i><b></b>`;
    el.querySelector('b')!.textContent = data.galaxies[g] ?? '';
    cam.appendChild(el);
    suns.push({ el, s });
  }
  const byG: Body[][] = [[], [], [], []];
  data.bodies.forEach((b) => byG[b.galaxy].push(b));
  const items: P3[] = [];
  byG.forEach((list, g) => {
    const n = list.length;
    const Rmin = small ? 120 : 175, Rmax = small ? 300 : 470;
    list.forEach((b, i) => {
      const el = document.createElement('a');
      el.className = 'uni-body'; el.href = b.href; el.dataset.kind = b.kind; el.dataset.slug = b.slug; el.setAttribute('data-pad', '');
      const d = (small ? 60 : 74) + b.recency * (small ? 34 : 54);
      el.style.setProperty('--d', Math.round(d) + 'px');
      const hs = HUES[g], jit = (rng() - 0.5) * 16;
      hs.forEach((h, k) => el.style.setProperty(`--c${k + 1}`, `color-mix(in oklab, hsl(${Math.round(h[0] + jit)} ${h[1]}% ${h[2]}%), var(--purple) 22%)`));
      el.style.setProperty('--tilt', String(Math.round(rng() * 40 - 20)));
      const sats = b.stack.slice(0, 3).map((s, k) => `<i class="sat" title="${s.replace(/"/g, '')}" style="--r:${Math.round(d * 0.78 + k * 16)}px;--t:${8 + k * 3.5 + rng() * 3}s;--delay:${-rng() * 8}s"></i>`).join('');
      el.innerHTML = `<span class="planet" style="animation-duration:${30 + Math.round(rng() * 30)}s"><span class="ring"></span></span><span class="sats">${sats}</span><span class="uni-label"><b></b><small><span class="light" data-kind="${b.kind}"></span><span class="v"></span></small></span>`;
      (el.querySelector('b') as HTMLElement).textContent = b.name;
      const ver = el.querySelector('.v') as HTMLElement;
      ver.textContent = b.version ?? b.status.split(' · ')[0];
      cam.appendChild(el);
      const R = n > 1 ? Rmin + (i / (n - 1)) * (Rmax - Rmin) + (rng() - 0.5) * 24 : (Rmin + Rmax) / 2;
      const pb: PBody = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, m: Math.pow(d / 74, 2), r: d * 0.46, g, grab: false, id: items.length };
      placeOnOrbit(pb, suns[g].s, i * 2.399 + g * 1.3 + rng() * 0.4, R, (rng() - 0.5) * 0.5);
      items.push({ b, el, p: pb, vis: false, label: el.querySelector('.uni-label') as HTMLElement, ver, trail: [], hue: HUES[g][0][0], px: d });
    });
  });
  const Zmax = Z0 + 3 * ZGAP + 520;
  const galaxyP = [0, 1, 2, 3].map((g) => (Z0 + g * ZGAP) / Zmax);

  // ---- state ----
  let p = 0, mx = 0, my = 0, tmx = 0, tmy = 0, focus: P3 | null = null, focusScroll = 0, tiltOn = false;
  let physOn = true, timeScale = 1, hovering = 0;
  const c = { x: 0, y: 0, z: 0 };
  let lastZ = 0, speed = 0, W = 0, H = 0;
  const ptr = { x: 0, y: 0, in: false, down: false, since: 0, type: 'mouse' };
  const shocks: { x: number; y: number; t: number }[] = [];
  let grab: { it: P3; offX: number; offY: number; moved: number; t0: number } | null = null;
  const navh = () => parseFloat(getComputedStyle(root).getPropertyValue('--navh')) || 76;

  function readProgress() {
    const r = track.getBoundingClientRect();
    p = clamp((navh() - r.top) / Math.max(1, r.height - stage.clientHeight), 0, 1);
  }

  /** World to screen with the same maths as the CSS transform on the camera, so the physics can talk in pixels. */
  function proj(x: number, y: number, z: number) {
    const px = x - c.x, py = y - c.y, pz = z + c.z;
    const ry = mx * 5 * (Math.PI / 180), rx = -my * 3.5 * (Math.PI / 180);
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    const x1 = px * cy + pz * sy, z1 = -px * sy + pz * cy;
    const y2 = py * cx - z1 * sx, z2 = py * sx + z1 * cx;
    if (z2 > F - 60) return null;
    const s = F / (F - z2), ox = W / 2, oy = H * 0.46;
    return { sx: ox + (W / 2 + x1 - ox) * s, sy: oy + (H / 2 + y2 - oy) * s, s };
  }

  // ---- forces that come from the visitor ----
  const ext: Ext = (pb) => {
    let ax = 0, ay = 0;
    const d = pb.z + c.z;
    if (d > -250 && d < 480 && speed > 2) { const k = 0.0035 * speed; ax += (pb.x - c.x) * k; ay += (pb.y - c.y) * k; } // wake from flying through
    if (ptr.in && ptr.type !== 'touch') {
      const pr = proj(pb.x, pb.y, pb.z);
      if (pr) {
        const dx = ptr.x - pr.sx, dy = ptr.y - pr.sy, dist = Math.hypot(dx, dy) || 1;
        if (ptr.down) { const f = 1900 * Math.pow(clamp(1 - dist / 820, 0, 1), 1.5); ax += (dx / dist) * f; ay += (dy / dist) * f; }
        else if (dist < 320) { const f = 70 * Math.pow(1 - dist / 320, 2); ax += (dx / dist) * f; ay += (dy / dist) * f; }
      }
    }
    return [ax, ay, 0];
  };
  function shock(x: number, y: number, power = 700) {
    shocks.push({ x, y, t: 0 });
    for (const it of items) {
      const pr = proj(it.p.x, it.p.y, it.p.z); if (!pr) continue;
      const dx = pr.sx - x, dy = pr.sy - y, dist = Math.hypot(dx, dy) || 1;
      const f = power * Math.exp(-dist / 340);
      it.p.vx += (dx / dist) * f; it.p.vy += (dy / dist) * f;
    }
  }
  const fadeHint = () => { if (hint) hint.dataset.on = '0'; };

  // ---- pointer: grab and throw a planet, or hold empty space for gravity and release for a shockwave ----
  const rectOf = () => stage.getBoundingClientRect();
  function setPtr(e: PointerEvent) { const r = rectOf(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.in = true; ptr.type = e.pointerType; }
  addEventListener('pointermove', (e) => {
    setPtr(e);
    if (!tiltOn) { const r = rectOf(); tmx = clamp((ptr.x / r.width) * 2 - 1, -1, 1); tmy = clamp((ptr.y / r.height) * 2 - 1, -1, 1); }
    if (e.pointerType === 'mouse') spawn(ptr.x, ptr.y);
    if (grab) grab.moved += Math.hypot(e.movementX, e.movementY);
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { ptr.in = false; });
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    if ((e.target as Element).closest('a,button,input,aside,label,output')) return;
    setPtr(e); ptr.down = true; ptr.since = performance.now(); fadeHint();
  });
  addEventListener('pointerup', () => {
    if (ptr.down) { ptr.down = false; if (performance.now() - ptr.since > 140) shock(ptr.x, ptr.y); }
    if (grab) endGrab();
  });
  function startGrab(it: P3, e: PointerEvent) {
    setPtr(e);
    const pr = proj(it.p.x, it.p.y, it.p.z); if (!pr) return;
    grab = { it, offX: pr.sx - ptr.x, offY: pr.sy - ptr.y, moved: 0, t0: performance.now() };
    it.p.grab = true; it.p.vx = it.p.vy = it.p.vz = 0; it.el.dataset.drag = '1'; fadeHint();
  }
  function endGrab() {
    if (!grab) return;
    const g = grab; grab = null; g.it.p.grab = false; delete g.it.el.dataset.drag;
    const v = Math.hypot(g.it.p.vx, g.it.p.vy); if (v > 900) { g.it.p.vx *= 900 / v; g.it.p.vy *= 900 / v; }
    if (g.moved < 6 && performance.now() - g.t0 < 380) open(g.it);
    justDragged = g.moved >= 6;
  }
  let justDragged = false;

  // ---- canvas: depth starfield, warp streaks, planet trails, comet and shockwaves ----
  const ctx = canvas.getContext('2d')!;
  let dpr = 1;
  const stars = Array.from({ length: small ? 110 : 240 }, () => ({ x: rng() * 2 - 1, y: rng() * 2 - 1, z: rng(), h: rng() }));
  const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  function size() { dpr = Math.min(2, window.devicePixelRatio || 1); W = stage.clientWidth; H = stage.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(x: number, y: number) { if (parts.length < 70) parts.push({ x, y, vx: (rng() - 0.5) * 0.6, vy: (rng() - 0.5) * 0.6, life: 1 }); }
  let starCol = '#fff', accCol = '#b993ff';
  const readCols = () => { const cs = getComputedStyle(document.documentElement); starCol = cs.getPropertyValue('--text').trim() || '#fff'; accCol = cs.getPropertyValue('--purple-bright').trim() || '#d6bfff'; };

  function drawScene(dt: number) {
    ctx.clearRect(0, 0, W, H);
    const adv = (c.z * 0.00011) % 1;
    const streak = clamp(speed / 26, 0, 1);
    for (const s of stars) {
      const zz = (((s.z - adv) % 1) + 1) % 1;
      const k = 1 / (zz * 3 + 0.16);
      const sx = W / 2 + s.x * k * W * 0.26, sy = H / 2 + s.y * k * H * 0.26;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const a = (1 - zz) * 0.85 + 0.12, r = (1 - zz) * 1.9 + 0.35;
      ctx.globalAlpha = a; ctx.strokeStyle = ctx.fillStyle = s.h > 0.82 ? accCol : starCol;
      if (streak > 0.06) {
        const k2 = 1 / (Math.min(1, zz + 0.05 * streak) * 3 + 0.16);
        ctx.lineWidth = r; ctx.beginPath(); ctx.moveTo(W / 2 + s.x * k2 * W * 0.26, H / 2 + s.y * k2 * H * 0.26); ctx.lineTo(sx, sy); ctx.stroke();
      } else { ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.283); ctx.fill(); }
    }
    ctx.globalCompositeOperation = 'lighter';
    // planet trails: comet tails that show the motion and the throws
    for (const it of items) {
      const tr = it.trail; if (tr.length < 3) continue;
      for (let k = 1; k < tr.length; k++) {
        const f = k / tr.length;
        ctx.globalAlpha = f * 0.5; ctx.strokeStyle = `hsl(${it.hue} 85% 66%)`; ctx.lineWidth = Math.max(0.6, f * it.px * 0.3);
        ctx.beginPath(); ctx.moveTo(tr[k - 1].x, tr[k - 1].y); ctx.lineTo(tr[k].x, tr[k].y); ctx.stroke();
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i]; q.x += q.vx; q.y += q.vy; q.life -= 0.025;
      if (q.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = q.life * 0.7; ctx.fillStyle = accCol; ctx.beginPath(); ctx.arc(q.x, q.y, 1 + q.life * 2.2, 0, 6.283); ctx.fill();
    }
    // gravity well while holding: rings that contract onto the pointer
    if (ptr.down) {
      const t = (performance.now() - ptr.since) / 1000;
      ctx.strokeStyle = accCol; ctx.lineWidth = 1.5;
      for (let k = 0; k < 3; k++) { const ph = ((t * 1.1 + k / 3) % 1); ctx.globalAlpha = (1 - ph) * 0.6; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 14 + (1 - ph) * 150, 0, 6.283); ctx.stroke(); }
      const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 60); g.addColorStop(0, accCol); g.addColorStop(1, 'transparent'); ctx.globalAlpha = 0.35; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 60, 0, 6.283); ctx.fill();
    }
    for (let i = shocks.length - 1; i >= 0; i--) {
      const s = shocks[i]; s.t += dt;
      if (s.t > 0.95) { shocks.splice(i, 1); continue; }
      const f = s.t / 0.95;
      ctx.globalAlpha = (1 - f) * 0.7; ctx.strokeStyle = accCol; ctx.lineWidth = 3 * (1 - f) + 0.5;
      ctx.beginPath(); ctx.arc(s.x, s.y, f * Math.max(W, H) * 0.6, 0, 6.283); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  // ---- focus a planet ----
  const dateOut = $<HTMLOutputElement>('#uni-date')!;
  function open(it: P3) {
    focus = it; focusScroll = scrollY;
    panel.dataset.open = '1';
    const b = it.b;
    $('#uni-p-name', panel)!.textContent = b.name;
    $('#uni-p-tag', panel)!.textContent = b.tagline;
    const meta = $('#uni-p-meta', panel)!;
    meta.innerHTML = '';
    const row = (k: string, v: string | Node) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.append(v); meta.append(dt, dd); };
    const st = document.createElement('span'); st.innerHTML = `<span class="light" data-kind="${b.kind}"></span> `; st.append(b.status);
    row('Status', st);
    if (b.version) row('Version', b.version + (b.date ? ' · ' + fmtShort(b.date) : ''));
    if (b.license) row('License', b.license);
    if (b.stack.length) row('Built with', b.stack.slice(0, 5).join(', '));
    const acts = $('#uni-p-acts', panel)!; acts.innerHTML = '';
    const a1 = document.createElement('a'); a1.className = 'primary'; a1.href = b.href; a1.textContent = b.external ? 'Open project' : 'Open case study';
    if (b.external) { a1.target = '_blank'; a1.rel = 'noopener noreferrer'; }
    acts.appendChild(a1);
    if (b.repo && !(b.external && b.href.startsWith(b.repo))) { const a2 = document.createElement('a'); a2.href = b.repo; a2.target = '_blank'; a2.rel = 'noopener noreferrer'; a2.textContent = 'GitHub'; acts.appendChild(a2); }
    const sl = $('#uni-p-stamp', panel)!; sl.innerHTML = '';
    if (b.latestUrl) { sl.append(`Checked ${fmtShort(data.checkedAt)} against GitHub · `); const l = document.createElement('a'); l.href = b.latestUrl; l.target = '_blank'; l.rel = 'noopener noreferrer'; l.textContent = 'release ' + b.version; sl.appendChild(l); }
    else sl.textContent = b.repo ? `Checked ${fmtShort(data.checkedAt)}, no release published yet` : 'Status set by Atharva';
    ($('#uni-p-close', panel) as HTMLElement).focus?.({ preventScroll: true } as FocusOptions);
  }
  function close() { if (!focus) return; const f = focus; focus = null; panel.dataset.open = '0'; f.el.focus?.({ preventScroll: true } as FocusOptions); }
  $('#uni-p-close', panel)!.addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  for (const it of items) {
    it.el.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; it.el.setPointerCapture?.(e.pointerId); startGrab(it, e); });
    it.el.addEventListener('click', (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); if (e.detail === 0) open(it); /* keyboard activation; pointer clicks are handled by the grab */ });
    it.el.addEventListener('mouseenter', () => { it.el.dataset.hover = '1'; hovering++; });
    it.el.addEventListener('mouseleave', () => { delete it.el.dataset.hover; hovering = Math.max(0, hovering - 1); });
    it.el.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // ---- time slider: planets are born on the day their repository was created ----
  const range = $<HTMLInputElement>('#uni-time')!;
  const t0 = dayNum('2026-06-01'), t1 = dayNum(data.checkedAt);
  range.max = String(t1 - t0); range.value = range.max;
  function renderTime() {
    const day = t0 + Number(range.value), date = fromDay(day);
    dateOut.textContent = Number(range.value) >= Number(range.max) ? 'Now' : fmtLong(date);
    for (const it of items) {
      const b = it.b;
      it.el.dataset.born = !b.created || dayNum(b.created) <= day ? '1' : '0';
      if (b.releases.length) { const rel = b.releases.filter((r) => dayNum(r[0]) <= day).at(-1); it.ver.textContent = rel ? rel[1] : 'in development'; }
    }
  }
  range.addEventListener('input', renderTime);

  // ---- per frame ----
  const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const SUBSTEP = 1 / 120;
  let acc = 0, frameN = 0;
  function frame(dt: number) {
    readProgress();
    if (focus && Math.abs(scrollY - focusScroll) > 90) close();
    mx += (tmx - mx) * 0.07; my += (tmy - my) * 0.07;

    // physics: slower while you aim at a planet or have one open, frozen when switched off
    const wantTs = !physOn ? 0 : grab ? 1 : focus ? 0.35 : hovering > 0 ? 0.3 : 1;
    timeScale += (wantTs - timeScale) * Math.min(1, dt * 7);
    acc += dt * timeScale;
    let guard = 0;
    while (acc >= SUBSTEP && guard++ < 6) { physStep(items.map((i) => i.p), suns.map((s) => s.s), SUBSTEP, ext); acc -= SUBSTEP; }
    if (grab) {
      const it = grab.it, pr = proj(it.p.x, it.p.y, it.p.z);
      if (pr) {
        const dx = ptr.x + grab.offX - pr.sx, dy = ptr.y + grab.offY - pr.sy;
        it.p.vx = clamp((dx / pr.s) * 14, -1400, 1400); it.p.vy = clamp((dy / pr.s) * 14, -1400, 1400);
        it.p.x += it.p.vx * dt; it.p.y += it.p.vy * dt;
      }
    }

    let tgt: { x: number; y: number; z: number };
    if (focus) tgt = { x: focus.p.x + (small ? 0 : 150), y: focus.p.y + (small ? 120 : 0), z: -focus.p.z + 250 };
    else tgt = { x: Math.sin(p * 9) * 190 + mx * 90, y: Math.cos(p * 7) * 90 + my * 60, z: p * Zmax };
    c.x += (tgt.x - c.x) * 0.085; c.y += (tgt.y - c.y) * 0.085; c.z += (tgt.z - c.z) * 0.085;
    speed += (Math.abs(c.z - lastZ) - speed) * 0.2; lastZ = c.z;
    cam.style.transform = `rotateX(${(-my * 3.5).toFixed(2)}deg) rotateY(${(mx * 5).toFixed(2)}deg) translate3d(${(-c.x).toFixed(1)}px, ${(-c.y).toFixed(1)}px, ${c.z.toFixed(1)}px)`;

    const heroDim = 1 - 0.82 * (focus ? 0 : clamp(1 - p * 9, 0, 1));
    const fade = (z: number) => smooth(-2700, -1500, z + c.z) * (1 - smooth(300, 720, z + c.z));
    for (const sn of suns) {
      const o = fade(sn.s.z) * (focus ? 1 : heroDim);
      sn.el.style.opacity = o.toFixed(3); sn.el.style.visibility = o > 0.03 ? 'visible' : 'hidden';
      if (o > 0.03) sn.el.style.transform = `translate3d(${sn.s.x}px, ${sn.s.y}px, ${sn.s.z}px)`;
    }
    for (const it of items) {
      const o = fade(it.p.z) * (focus ? 1 : heroDim);
      const on = o > 0.04;
      if (on !== it.vis) { it.vis = on; it.el.dataset.vis = on ? '1' : '0'; if (!on) it.trail.length = 0; }
      if (on) {
        it.el.style.opacity = o.toFixed(3);
        it.el.style.transform = `translate3d(${it.p.x.toFixed(1)}px, ${it.p.y.toFixed(1)}px, ${it.p.z.toFixed(1)}px)`;
        it.label.style.opacity = String(smooth(-1500, -700, it.p.z + c.z));
        if (frameN % 2 === 0) { const pr = proj(it.p.x, it.p.y, it.p.z); if (pr) { it.trail.push({ x: pr.sx, y: pr.sy }); if (it.trail.length > 22) it.trail.shift(); } }
      }
    }
    frameN++;
    const h = focus ? 0 : clamp(1 - p * 9, 0, 1);
    hero.style.opacity = h.toFixed(3); hero.style.transform = `translateY(${(-p * 160).toFixed(0)}px) scale(${(1 + p * 0.6).toFixed(3)})`; hero.style.visibility = h < 0.02 ? 'hidden' : 'visible';
    skills.style.opacity = h.toFixed(3);
    caps.forEach((el, g) => { el.dataset.on = !focus && p > galaxyP[g] - 0.13 && p < galaxyP[g] + 0.09 ? '1' : '0'; });
    neb.forEach((n, i) => { n.style.transform = `translate3d(${(-c.x * 0.06 * (i + 1) + mx * 30).toFixed(1)}px, ${(-c.z * 0.02 * (i % 2 ? -1 : 1) + my * 20).toFixed(1)}px, 0)`; });
    prog.style.setProperty('--p', p.toFixed(3));
    drawScene(dt);
  }

  // loop only while the stage is on screen and the tab is visible
  let raf = 0, vis = true, last = 0;
  const tick = (t: number) => { const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; frame(dt); raf = requestAnimationFrame(tick); };
  const sync = () => { const should = vis && !document.hidden; if (should && !raf) { last = 0; raf = requestAnimationFrame(tick); } if (!should && raf) { cancelAnimationFrame(raf); raf = 0; } };
  new IntersectionObserver((e) => { vis = e[e.length - 1].isIntersecting; sync(); }, { rootMargin: '200px' }).observe(track);
  document.addEventListener('visibilitychange', sync);

  // ---- headline that listens to the cursor ----
  const words = $$('.uni-h1 span');
  let vx = 0, lastMX = 0, skew = 0;
  addEventListener('pointermove', (e) => { vx = e.clientX - lastMX; lastMX = e.clientX; }, { passive: true });
  if (!coarsePointer()) setInterval(() => { skew += (clamp(vx * 0.5, -8, 8) - skew) * 0.3; vx *= 0.6; words.forEach((w, i) => { w.style.setProperty('--skew', skew.toFixed(2)); w.style.setProperty('--w', String(Math.round(660 + Math.abs(skew) * 14 - i * 8))); }); }, 50);

  // ---- tilt (phones) and controller ----
  const tiltBtn = $<HTMLButtonElement>('#uni-tilt');
  const onOrient = (e: DeviceOrientationEvent) => { if (e.gamma == null || e.beta == null) return; tiltOn = true; tmx = clamp(e.gamma / 28, -1, 1); tmy = clamp((e.beta - 40) / 28, -1, 1); };
  const D = (window as any).DeviceOrientationEvent;
  if (coarsePointer() && D) {
    if (typeof D.requestPermission === 'function') { tiltBtn?.removeAttribute('hidden'); tiltBtn?.addEventListener('click', async () => { try { if ((await D.requestPermission()) === 'granted') { addEventListener('deviceorientation', onOrient); tiltBtn.textContent = 'Tilt on'; } } catch { /* ignore */ } }); }
    else addEventListener('deviceorientation', onOrient);
  }
  let padRaf = 0, prevA = false, prevB = false, prevL = false, prevR = false, prevX = false, lastNav = 0;
  const order = () => items.filter((i) => i.vis).sort((a, b) => b.p.z - a.p.z);
  function padLoop() {
    const pad = [...(navigator.getGamepads?.() ?? [])].find(Boolean);
    if (pad) {
      const now = performance.now();
      tmx = clamp(pad.axes[0] || 0, -1, 1); tmy = clamp(pad.axes[1] || 0, -1, 1);
      const a = !!pad.buttons[0]?.pressed, b = !!pad.buttons[1]?.pressed, x = !!pad.buttons[2]?.pressed, l = !!pad.buttons[14]?.pressed || !!pad.buttons[4]?.pressed, r = !!pad.buttons[15]?.pressed || !!pad.buttons[5]?.pressed;
      const list = order();
      const cur = focus ? list.indexOf(focus) : -1;
      if (r && !prevR && now - lastNav > 150 && list.length) { lastNav = now; open(list[(cur + 1 + list.length) % list.length]); }
      if (l && !prevL && now - lastNav > 150 && list.length) { lastNav = now; open(list[(cur - 1 + list.length) % list.length]); }
      if (a && !prevA && !focus && list.length) open(list.sort((q, w) => Math.abs(q.p.z + c.z) - Math.abs(w.p.z + c.z))[0]);
      if (b && !prevB) close();
      if (x && !prevX) shock(W / 2, H * 0.46, 760); // X: shockwave from the middle of the screen
      if (pad.buttons[12]?.pressed) scrollBy({ top: -40 }); if (pad.buttons[13]?.pressed) scrollBy({ top: 40 });
      prevA = a; prevB = b; prevL = l; prevR = r; prevX = x;
    }
    padRaf = requestAnimationFrame(padLoop);
  }
  addEventListener('gamepadconnected', () => { if (!padRaf) padRaf = requestAnimationFrame(padLoop); });
  addEventListener('gamepaddisconnected', () => { cancelAnimationFrame(padRaf); padRaf = 0; });

  // ---- palette, lamp and physics HUD ----
  const apply = (pal: string) => { if (pal === 'ultraviolet') document.documentElement.removeAttribute('data-lab-palette'); else document.documentElement.setAttribute('data-lab-palette', pal); $$('.uni-pal button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pal === pal))); writeState({ palette: pal }); setTimeout(readCols, 60); };
  $$('.uni-pal button').forEach((b) => b.addEventListener('click', () => apply(b.dataset.pal!)));
  apply(readState().palette || 'ultraviolet');
  const lamp = initLamp();
  const lampBtn = $<HTMLButtonElement>('#uni-lamp')!;
  let lampOn = readState().on?.lamp !== false;
  const setLamp = (v: boolean) => { lampOn = v; lampBtn.textContent = v ? 'Lamp on' : 'Lamp off'; lampBtn.setAttribute('aria-pressed', String(v)); v ? lamp.enable() : lamp.disable(); writeState({ on: { ...(readState().on || {}), lamp: v } }); };
  lampBtn.addEventListener('click', () => setLamp(!lampOn));
  setLamp(lampOn);
  const physBtn = $<HTMLButtonElement>('#uni-phys');
  physBtn?.addEventListener('click', () => { physOn = !physOn; physBtn.textContent = physOn ? 'Physics on' : 'Physics off'; physBtn.setAttribute('aria-pressed', String(physOn)); });
  $('#uni-reset')?.addEventListener('click', () => {
    byG.forEach((list, g) => list.forEach((b, i) => {
      const it = items.find((q) => q.b === b)!; const n = list.length;
      const R = n > 1 ? (small ? 120 : 175) + (i / (n - 1)) * ((small ? 300 : 470) - (small ? 120 : 175)) : 300;
      placeOnOrbit(it.p, suns[g].s, i * 2.399 + g * 1.3, R, ((i % 5) - 2) * 0.1); it.trail.length = 0;
    }));
  });

  // ---- boot ----
  size(); readCols(); renderTime(); readProgress();
  c.z = p * Zmax; c.x = 0; c.y = 0;
  addEventListener('resize', () => { size(); });
  sync();
  if (hint) setTimeout(() => { if (hint) hint.dataset.on = '0'; }, 14000);
  const introOn = readState().on?.intro !== false;
  const introData = { checkedAt: data.checkedAt, projects: data.bodies as any, latest: data.latest } as any;
  if (introOn) playIntro(introData);
  $('#uni-replay')?.addEventListener('click', () => playIntro(introData, true));
  $('#uni-skip')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('uni-list')?.scrollIntoView({ behavior: 'smooth' }); });
}
