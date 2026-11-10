import { $, type Mod } from './common.ts';

/** Moon phase 0..1 (0 new, 0.5 full) from the date, computed locally. */
export function moonPhase(d = new Date()): number {
  const jd = d.getTime() / 86400000 + 2440587.5;
  const p = ((jd - 2451550.1) / 29.530588853) % 1;
  return p < 0 ? p + 1 : p;
}
const NAMES = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'last quarter', 'waning crescent'];

function tint(h: number): string {
  // multiply colour by time of day: bluish at night, warm around dawn and dusk, none in daylight
  const stops: [number, [number, number, number]][] = [[0, [150, 160, 215]], [5, [150, 160, 215]], [7, [244, 214, 178]], [9, [255, 255, 255]], [17, [255, 255, 255]], [19, [246, 206, 168]], [21, [150, 160, 215]], [24, [150, 160, 215]]];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i], [b, cb] = stops[i + 1];
    if (h >= a && h <= b) { const k = (h - a) / (b - a || 1); return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(',')})`; }
  }
  return 'rgb(255,255,255)';
}

export function initLamp(): Mod {
  const lamp = $('#lamp')!;
  const text = $('#lamp-text');
  const moonI = $<HTMLElement>('#lamp-moon-i');
  let timer = 0;

  function update() {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    lamp.style.background = tint(h);
    const p = moonPhase(now);
    const illum = Math.round(((1 - Math.cos(2 * Math.PI * p)) / 2) * 100);
    if (text) text.textContent = `Your time ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${NAMES[Math.round(p * 8) % 8]}, ${illum}% lit`;
    const waxing = p < 0.5;
    if (moonI) moonI.style.clipPath = waxing ? `inset(0 0 0 ${100 - illum}%)` : `inset(0 ${100 - illum}% 0 0)`;
  }

  return {
    enable() { update(); lamp.setAttribute('data-on', '1'); timer = window.setInterval(update, 60000); },
    disable() { lamp.removeAttribute('data-on'); clearInterval(timer); },
  };
}
