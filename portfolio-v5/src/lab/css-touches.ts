import { $, reduceMotion, type Mod } from './common.ts';

/** Floyd-free ordered dither (4x4 Bayer) of the screenshot to two palette colours. */
function paintDither(host: HTMLElement) {
  const img = host.querySelector('img')!;
  const canvas = host.querySelector('canvas')!;
  const draw = () => {
    const W = 260, H = Math.round((260 * img.naturalHeight) / img.naturalWidth) || 160;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H);
    const cs = getComputedStyle(document.documentElement);
    const col = (name: string, fb: string) => { const c = document.createElement('canvas').getContext('2d')!; c.fillStyle = cs.getPropertyValue(name).trim() || fb; c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data]; };
    const dark = col('--bg', '#0a0517'), light = col('--purple-bright', '#d6bfff');
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const lum = (0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2]) / 255;
      const on = lum * 1.15 > (bayer[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
      const c = on ? light : dark;
      d.data[i] = c[0]; d.data[i + 1] = c[1]; d.data[i + 2] = c[2]; d.data[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
  };
  if (img.complete && img.naturalWidth) draw(); else img.addEventListener('load', draw, { once: true });
  return draw;
}

export function initCssTouches(): Mod {
  const stagger = $('#stagger')!;
  const replay = () => { stagger.dataset.on = '0'; void stagger.offsetWidth; stagger.dataset.on = '1'; };
  $('#stagger-btn')!.addEventListener('click', replay);
  stagger.querySelectorAll('i').forEach((el, i) => (el as HTMLElement).style.setProperty('--i', String(i)));

  const btn = $<HTMLButtonElement>('#pop-btn')!, box = $('#pop-box')!;
  btn.addEventListener('click', () => {
    const open = (box as HTMLElement).hidden;
    (box as HTMLElement).hidden = !open;
    btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Close panel' : 'Open panel';
  });

  const dither = $('#dither')!;
  const redraw = paintDither(dither);
  window.addEventListener('lab:palette', () => setTimeout(redraw, 60));
  if (reduceMotion()) dither.dataset.on = '1';

  return { enable() { replay(); }, disable() {} };
}
