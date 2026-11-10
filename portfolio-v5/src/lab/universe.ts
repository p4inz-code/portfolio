import { $, $$, clamp, coarsePointer, dayNum, fmtLong, fmtShort, fromDay, reduceMotion } from './common.ts';
import { initLamp } from './lamp.ts';
import { playIntro } from './intro.ts';

interface Body {
  slug: string; name: string; tagline: string; kind: string; status: string; license: string | null;
  href: string; external: boolean; version: string | null; date: string | null; created: string | null;
  galaxy: number; stack: string[]; latestUrl: string | null; repo: string | null; recency: number;
  releases: [string, string, string][];
}
interface UData { checkedAt: string; bodies: Body[]; latest: { name: string; tag: string; date: string } }
interface P3 { b: Body; el: HTMLAnchorElement; x: number; y: number; z: number; vis: boolean; label: HTMLElement; ver: HTMLElement }

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

export function initUniverse() {
  const root = $('.uni') as HTMLElement | null;
  if (!root) return;
  const data: UData = JSON.parse($('#uni-data')!.textContent!);
  if (reduceMotion()) { root.dataset.static = '1'; return; }

  const stage = $('.uni-stage')!, track = $('.uni-track')!, cam = $('#uni-cam')!, canvas = $<HTMLCanvasElement>('#uni-stars')!;
  const hero = $('#uni-hero')!, skills = $('#uni-skills')!, panel = $('#uni-panel')!;
  const neb = $$('.uni-neb'), caps = $$('.uni-cap'), prog = $('.uni-prog')!;
  const small = window.innerWidth < 760;
  const rng = (() => { let s = 7919; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();

  // ---- place the bodies: four galaxies along the flight path ----
  const ZGAP = 1500, Z0 = 760;
  const byG: Body[][] = [[], [], [], []];
  data.bodies.forEach((b) => byG[b.galaxy].push(b));
  const items: P3[] = [];
  byG.forEach((list, g) => {
    list.forEach((b, i) => {
      const n = list.length, a = (i / n) * Math.PI * 2 + g * 0.9 + rng() * 0.4;
      const R = (small ? 150 : 250) + rng() * (small ? 120 : 230);
      const x = Math.cos(a) * R * (small ? 0.9 : 1.25), y = Math.sin(a) * R * 0.62, z = -(Z0 + g * ZGAP + (i - n / 2) * 190 + rng() * 110);
      const el = document.createElement('a');
      el.className = 'uni-body'; el.href = b.href; el.dataset.kind = b.kind; el.dataset.slug = b.slug; el.setAttribute('data-pad', '');
      const d = (small ? 62 : 76) + b.recency * (small ? 38 : 56);
      el.style.setProperty('--d', Math.round(d) + 'px');
      const hs = HUES[g], jit = (rng() - 0.5) * 16;
      hs.forEach((h, k) => el.style.setProperty(`--c${k + 1}`, `color-mix(in oklab, hsl(${Math.round(h[0] + jit)} ${h[1]}% ${h[2]}%), var(--purple) 22%)`));
      el.style.setProperty('--tilt', String(Math.round(rng() * 40 - 20)));
      el.style.animationDelay = '0s';
      const sats = b.stack.slice(0, 3).map((s, k) => `<i class="sat" title="${s.replace(/"/g, '')}" style="--r:${Math.round(d * 0.78 + k * 16)}px;--t:${8 + k * 3.5 + rng() * 3}s;--delay:${-rng() * 8}s"></i>`).join('');
      el.innerHTML = `<span class="planet" style="animation-duration:${30 + Math.round(rng() * 30)}s"><span class="ring"></span></span><span class="sats">${sats}</span><span class="uni-label"><b></b><small><span class="light" data-kind="${b.kind}"></span><span class="v"></span></small></span>`;
      (el.querySelector('b') as HTMLElement).textContent = b.name;
      const ver = el.querySelector('.v') as HTMLElement;
      ver.textContent = b.version ?? b.status.split(' · ')[0];
      cam.appendChild(el);
      items.push({ b, el, x, y, z, vis: false, label: el.querySelector('.uni-label') as HTMLElement, ver });
    });
  });
  const Zmax = Math.max(...items.map((i) => -i.z)) + 500;
  const galaxyP = [0, 1, 2, 3].map((g) => (Z0 + g * ZGAP + 200) / Zmax);

  // ---- state: scroll progress, mouse, tilt, focus ----
  let p = 0, mx = 0, my = 0, tmx = 0, tmy = 0, focus: P3 | null = null, focusScroll = 0, tiltOn = false;
  const c = { x: 0, y: 0, z: 0 };
  let lastZ = 0, speed = 0;
  const navh = () => parseFloat(getComputedStyle(root).getPropertyValue('--navh')) || 76;

  function readProgress() {
    const r = track.getBoundingClientRect();
    const span = r.height - stage.clientHeight;
    p = clamp((navh() - r.top) / Math.max(1, span), 0, 1);
  }
  const onPointer = (e: PointerEvent) => {
    if (tiltOn) return;
    const r = stage.getBoundingClientRect();
    tmx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); tmy = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    if (e.pointerType === 'mouse') spawn(e.clientX - r.left, e.clientY - r.top);
  };

  // ---- canvas: depth starfield, warp streaks and a comet trail ----
  const ctx = canvas.getContext('2d')!;
  let W = 0, H = 0, dpr = 1;
  const stars = Array.from({ length: small ? 110 : 240 }, () => ({ x: rng() * 2 - 1, y: rng() * 2 - 1, z: rng(), h: rng() }));
  const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  function size() { dpr = Math.min(2, window.devicePixelRatio || 1); W = stage.clientWidth; H = stage.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(x: number, y: number) { if (parts.length < 70) parts.push({ x, y, vx: (rng() - 0.5) * 0.6, vy: (rng() - 0.5) * 0.6, life: 1 }); }
  let starCol = '#fff', accCol = '#b993ff';
  const readCols = () => { const cs = getComputedStyle(document.documentElement); starCol = cs.getPropertyValue('--text').trim() || '#fff'; accCol = cs.getPropertyValue('--purple-bright').trim() || '#d6bfff'; };

  function drawStars() {
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
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i]; q.x += q.vx; q.y += q.vy; q.life -= 0.025;
      if (q.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = q.life * 0.7; ctx.fillStyle = accCol; ctx.beginPath(); ctx.arc(q.x, q.y, 1 + q.life * 2.2, 0, 6.283); ctx.fill();
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
    it.el.addEventListener('click', (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); open(it); });
    it.el.addEventListener('mouseenter', () => (it.el.dataset.hover = '1'));
    it.el.addEventListener('mouseleave', () => delete it.el.dataset.hover);
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

  // ---- per-frame ----
  const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  let lastScrollY = scrollY;
  function frame(t: number) {
    readProgress();
    if (focus && Math.abs(scrollY - focusScroll) > 90) close();
    mx += (tmx - mx) * 0.07; my += (tmy - my) * 0.07;
    let tgt: { x: number; y: number; z: number };
    if (focus) tgt = { x: focus.x + (small ? 0 : 150), y: focus.y + (small ? 120 : 0), z: -focus.z + 250 };
    else tgt = { x: Math.sin(p * 9) * 150 + mx * 90, y: Math.cos(p * 7) * 90 + my * 60, z: p * Zmax };
    c.x += (tgt.x - c.x) * 0.085; c.y += (tgt.y - c.y) * 0.085; c.z += (tgt.z - c.z) * 0.085;
    speed += (Math.abs(c.z - lastZ) - speed) * 0.2; lastZ = c.z;
    cam.style.transform = `rotateX(${(-my * 3.5).toFixed(2)}deg) rotateY(${(mx * 5).toFixed(2)}deg) translate3d(${(-c.x).toFixed(1)}px, ${(-c.y).toFixed(1)}px, ${c.z.toFixed(1)}px)`;

    const heroDim = 1 - 0.82 * clamp(1 - p * 9, 0, 1);
    for (const it of items) {
      const d = it.z + c.z;
      const o = smooth(-2700, -1500, d) * (1 - smooth(300, 720, d)) * (focus ? 1 : heroDim);
      const on = o > 0.04;
      if (on !== it.vis) { it.vis = on; it.el.dataset.vis = on ? '1' : '0'; }
      if (on) {
        it.el.style.opacity = o.toFixed(3);
        it.el.style.transform = `translate3d(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px, ${it.z.toFixed(1)}px)`;
        it.label.style.opacity = String(smooth(-1500, -700, d));
      }
    }
    // hero, caption and nebula follow the flight
    const h = focus ? 0 : clamp(1 - p * 9, 0, 1);
    hero.style.opacity = h.toFixed(3); hero.style.transform = `translateY(${(-p * 160).toFixed(0)}px) scale(${(1 + p * 0.6).toFixed(3)})`; hero.style.visibility = h < 0.02 ? 'hidden' : 'visible';
    skills.style.opacity = h.toFixed(3);
    caps.forEach((el, g) => { el.dataset.on = !focus && p > galaxyP[g] - 0.13 && p < galaxyP[g] + 0.09 ? '1' : '0'; });
    neb.forEach((n, i) => { n.style.transform = `translate3d(${(-c.x * 0.06 * (i + 1) + mx * 30).toFixed(1)}px, ${(-c.z * 0.02 * (i % 2 ? -1 : 1) + my * 20).toFixed(1)}px, 0)`; });
    prog.style.setProperty('--p', p.toFixed(3));
    drawStars();
    lastScrollY = scrollY;
  }

  // loop only while the stage is on screen and the tab is visible
  let raf = 0, vis = true;
  const tick = (t: number) => { frame(t); raf = requestAnimationFrame(tick); };
  const sync = () => { const should = vis && !document.hidden; if (should && !raf) raf = requestAnimationFrame(tick); if (!should && raf) { cancelAnimationFrame(raf); raf = 0; } };
  new IntersectionObserver((e) => { vis = e[e.length - 1].isIntersecting; sync(); }, { rootMargin: '200px' }).observe(track);
  document.addEventListener('visibilitychange', sync);

  // ---- headline that listens to the cursor ----
  const words = $$('.uni-h1 span');
  let vx = 0, lastMX = 0, skew = 0;
  addEventListener('pointermove', (e) => { vx = e.clientX - lastMX; lastMX = e.clientX; onPointer(e); }, { passive: true });
  if (!coarsePointer()) setInterval(() => { skew += (clamp(vx * 0.5, -8, 8) - skew) * 0.3; vx *= 0.6; words.forEach((w, i) => { w.style.setProperty('--skew', skew.toFixed(2)); w.style.setProperty('--w', String(Math.round(660 + Math.abs(skew) * 14 - i * 8))); }); }, 50);

  // ---- tilt (phones) and controller ----
  const tiltBtn = $<HTMLButtonElement>('#uni-tilt');
  const onOrient = (e: DeviceOrientationEvent) => { if (e.gamma == null || e.beta == null) return; tiltOn = true; tmx = clamp(e.gamma / 28, -1, 1); tmy = clamp((e.beta - 40) / 28, -1, 1); };
  const D = (window as any).DeviceOrientationEvent;
  if (coarsePointer() && D) {
    if (typeof D.requestPermission === 'function') { tiltBtn?.removeAttribute('hidden'); tiltBtn?.addEventListener('click', async () => { try { if ((await D.requestPermission()) === 'granted') { addEventListener('deviceorientation', onOrient); tiltBtn.textContent = 'Tilt on'; } } catch { /* ignore */ } }); }
    else addEventListener('deviceorientation', onOrient);
  }
  let padRaf = 0, prevA = false, prevB = false, prevL = false, prevR = false, lastNav = 0;
  const order = () => items.filter((i) => i.vis).sort((a, b) => b.z - a.z);
  function padLoop() {
    const pad = [...(navigator.getGamepads?.() ?? [])].find(Boolean);
    if (pad) {
      const now = performance.now();
      tmx = clamp(pad.axes[0] || 0, -1, 1); tmy = clamp(pad.axes[1] || 0, -1, 1);
      const a = !!pad.buttons[0]?.pressed, b = !!pad.buttons[1]?.pressed, l = !!pad.buttons[14]?.pressed || !!pad.buttons[4]?.pressed, r = !!pad.buttons[15]?.pressed || !!pad.buttons[5]?.pressed;
      const list = order();
      const cur = focus ? list.indexOf(focus) : -1;
      if (r && !prevR && now - lastNav > 150 && list.length) { lastNav = now; open(list[(cur + 1 + list.length) % list.length]); }
      if (l && !prevL && now - lastNav > 150 && list.length) { lastNav = now; open(list[(cur - 1 + list.length) % list.length]); }
      if (a && !prevA && !focus && list.length) open(list.sort((x, y) => Math.abs(x.z + c.z) - Math.abs(y.z + c.z))[0]);
      if (b && !prevB) close();
      if (pad.buttons[12]?.pressed) scrollBy({ top: -40 }); if (pad.buttons[13]?.pressed) scrollBy({ top: 40 });
      prevA = a; prevB = b; prevL = l; prevR = r;
    }
    padRaf = requestAnimationFrame(padLoop);
  }
  addEventListener('gamepadconnected', () => { if (!padRaf) padRaf = requestAnimationFrame(padLoop); });
  addEventListener('gamepaddisconnected', () => { cancelAnimationFrame(padRaf); padRaf = 0; });

  // ---- palette and lamp HUD ----
  const apply = (pal: string) => { if (pal === 'ultraviolet') document.documentElement.removeAttribute('data-lab-palette'); else document.documentElement.setAttribute('data-lab-palette', pal); $$('.uni-pal button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pal === pal))); writeState({ palette: pal }); setTimeout(readCols, 60); };
  $$('.uni-pal button').forEach((b) => b.addEventListener('click', () => apply(b.dataset.pal!)));
  apply(readState().palette || 'ultraviolet');
  const lamp = initLamp();
  const lampBtn = $<HTMLButtonElement>('#uni-lamp')!;
  let lampOn = readState().on?.lamp !== false;
  const setLamp = (v: boolean) => { lampOn = v; lampBtn.textContent = v ? 'Lamp on' : 'Lamp off'; lampBtn.setAttribute('aria-pressed', String(v)); v ? lamp.enable() : lamp.disable(); writeState({ on: { ...(readState().on || {}), lamp: v } }); };
  lampBtn.addEventListener('click', () => setLamp(!lampOn));
  setLamp(lampOn);

  // ---- boot ----
  size(); readCols(); renderTime(); readProgress();
  c.z = p * Zmax; c.x = 0; c.y = 0;
  addEventListener('resize', () => { size(); });
  sync();
  const introOn = readState().on?.intro !== false;
  if (introOn) playIntro({ checkedAt: data.checkedAt, projects: data.bodies as any, latest: data.latest } as any);
  $('#uni-replay')?.addEventListener('click', () => playIntro({ checkedAt: data.checkedAt, projects: data.bodies as any, latest: data.latest } as any, true));
  // the universe is the home page's main content: let people jump past it
  $('#uni-skip')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('uni-list')?.scrollIntoView({ behavior: 'smooth' }); });
}
