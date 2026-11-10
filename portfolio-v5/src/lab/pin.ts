import { $, clamp, type Mod } from './common.ts';

const CARDS = [
  { id: 'home', src: '/assets/kanvaz/kanvaz-home.webp', cap: 'Home screen', x: 0.04, y: 0.08, r: -3 },
  { id: 'map', src: '/assets/kanvaz/kanvaz-mapview.webp', cap: 'Map View', x: 0.38, y: 0.04, r: 2 },
  { id: 'scratch', src: '/assets/kanvaz/kanvaz-scratchboard.webp', cap: 'Scratch Board', x: 0.7, y: 0.14, r: -2 },
  { id: 'tasks', src: '/assets/kanvaz/kanvaz-tasktracker.webp', cap: 'Task Tracker', x: 0.1, y: 0.56, r: 2.5 },
  { id: 'annot', src: '/assets/kanvaz/kanvaz-annotate.webp', cap: 'Annotate', x: 0.5, y: 0.5, r: -2 },
];
const LINKS: [string, string, string][] = [['home', 'map', 'used in'], ['map', 'scratch', 'derived from'], ['scratch', 'annot', 'supports'], ['home', 'tasks', 'related to'], ['tasks', 'annot', 'used in']];

export function initPin(): Mod {
  const host = $('#pin')!;
  let built = false;
  const pos = new Map<string, { x: number; y: number; el: HTMLElement }>();
  let svg: SVGSVGElement;

  const NS = 'http://www.w3.org/2000/svg';
  function size() { const W = host.clientWidth; return { W, cw: clamp(Math.round(W * (W < 700 ? 0.5 : 0.28)), 130, 300) }; }

  function build() {
    if (built) return;
    built = true;
    host.innerHTML = '';
    if (host.clientWidth < 700) host.style.height = '560px';
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pin-svg'); svg.setAttribute('aria-hidden', 'true');
    host.appendChild(svg);
    const { W, cw } = size();
    const H = host.clientHeight;
    for (const c of CARDS) {
      const fig = document.createElement('figure');
      fig.className = 'pin-card'; fig.style.setProperty('--w', cw + 'px'); fig.tabIndex = 0; fig.setAttribute('data-pad', '');
      fig.setAttribute('role', 'img'); fig.setAttribute('aria-label', 'Kanvaz screenshot: ' + c.cap);
      const img = document.createElement('img'); img.src = c.src; img.alt = ''; img.loading = 'lazy'; img.draggable = false;
      const cap = document.createElement('figcaption'); cap.textContent = c.cap;
      fig.append(img, cap); host.appendChild(fig);
      const x = clamp(c.x * W, 4, W - cw - 4), y = clamp(c.y * H, 4, H - 140);
      pos.set(c.id, { x, y, el: fig });
      fig.dataset.rot = String(c.r);
      attach(fig, c.id);
    }
    layout();
    new ResizeObserver(() => layout()).observe(host);
  }

  function layout() {
    for (const c of CARDS) { const p = pos.get(c.id)!; p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${c.r}deg)`; }
    draw();
  }

  function center(id: string) { const p = pos.get(id)!; return { x: p.x + p.el.offsetWidth / 2, y: p.y + 14 }; }

  function draw() {
    svg.innerHTML = '';
    for (const [a, b, label] of LINKS) {
      const A = center(a), B = center(b);
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 + Math.min(70, Math.abs(A.x - B.x) * 0.25 + 20);
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', `M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`);
      svg.appendChild(path);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', String((A.x + 2 * mx + B.x) / 4)); t.setAttribute('y', String((A.y + 2 * my + B.y) / 4 - 4)); t.setAttribute('text-anchor', 'middle');
      t.textContent = label; svg.appendChild(t);
    }
  }

  function attach(el: HTMLElement, id: string) {
    let ox = 0, oy = 0;
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      const r = host.getBoundingClientRect(); const p = pos.get(id)!;
      ox = e.clientX - r.left - p.x; oy = e.clientY - r.top - p.y; el.dataset.drag = '1';
    });
    el.addEventListener('pointermove', (e) => {
      if (el.dataset.drag !== '1') return;
      const r = host.getBoundingClientRect(); const p = pos.get(id)!;
      p.x = clamp(e.clientX - r.left - ox, 0, r.width - el.offsetWidth);
      p.y = clamp(e.clientY - r.top - oy, 0, r.height - el.offsetHeight);
      layout();
    });
    const end = () => { delete el.dataset.drag; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 30 : 10; const p = pos.get(id)!;
      const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (!d[e.key]) return;
      e.preventDefault(); p.x = clamp(p.x + d[e.key][0], 0, host.clientWidth - el.offsetWidth); p.y = clamp(p.y + d[e.key][1], 0, host.clientHeight - el.offsetHeight); layout();
    });
  }

  return { enable() { build(); }, disable() {} };
}
