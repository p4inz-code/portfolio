/**
 * The browser-tab icon follows the page: the AP mark sits in a ring that fills
 * as you scroll, so the tab shows how far through the page you are. Drawn on a
 * canvas from /ap-mark.png and swapped in only when the ring moves a step.
 * Static icons stay in the HTML for crawlers and no-JS; reduced motion and the
 * "pause motion" toggle leave the tab icon alone.
 */
const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]'));
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const STEPS = 48;

if (links.length && !reduce.matches) {
  const img = new Image();
  img.decoding = 'async';
  img.src = '/ap-mark.png';
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  let last = -1;
  let queued = false;

  const draw = (step: number) => {
    if (!ctx) return;
    const t = step / STEPS;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#15111f';
    ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(167,139,250,0.28)';
    ctx.beginPath(); ctx.arc(32, 32, 28, 0, Math.PI * 2); ctx.stroke();
    if (t > 0) {
      ctx.strokeStyle = '#b79cff';
      ctx.beginPath(); ctx.arc(32, 32, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t); ctx.stroke();
    }
    ctx.drawImage(img, 14, 14, 36, 36);
    const url = canvas.toDataURL('image/png');
    links.forEach((l) => { l.type = 'image/png'; l.removeAttribute('sizes'); l.href = url; });
  };

  const update = () => {
    queued = false;
    if (document.hidden || document.documentElement.hasAttribute('data-still')) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const step = Math.round(p * STEPS);
    if (step === last) return;
    last = step;
    draw(step);
  };
  const queue = () => { if (!queued) { queued = true; setTimeout(update, 120); } };

  const start = () => { window.addEventListener('scroll', queue, { passive: true }); };
  if (img.complete) start(); else img.addEventListener('load', start, { once: true });
}
