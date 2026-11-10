import { $$, clamp, coarsePointer, dayNum, reduceMotion, visibleLoop, type LabData, type Mod } from './common.ts';

export function initListen(data: LabData): Mod {
  const links = $$<HTMLAnchorElement>('#listen a');
  const host = document.getElementById('listen')!;
  const today = dayNum(data.checkedAt);
  const base = links.map((a) => {
    const days = today - dayNum(a.dataset.date!);
    return 300 + 450 * clamp(1 - days / 120, 0, 1); // heavier the more recently it shipped
  });
  links.forEach((a, i) => { a.querySelector('span')!.style.setProperty('--w', String(Math.round(base[i]))); a.setAttribute('data-pad', ''); });

  let mx = 0, my = 0, vel = 0, skew = 0, scrollV = 0, lastY = scrollY, lastT = performance.now(), boost = 0;
  const live = () => !reduceMotion() && !coarsePointer();
  const onMove = (e: PointerEvent) => {
    const now = performance.now();
    const dt = Math.max(8, now - lastT);
    vel = (e.clientX - mx) / dt; // px per ms, signed
    mx = e.clientX; my = e.clientY; lastT = now;
  };
  const onScroll = () => {
    const now = performance.now();
    scrollV = Math.abs(scrollY - lastY) / Math.max(8, now - lastT) * 1000;
    lastY = scrollY;
  };

  const loop = visibleLoop(host, () => {
    skew += (clamp(vel * 9, -9, 9) - skew) * 0.12;
    vel *= 0.9;
    boost += (clamp(scrollV / 2600, 0, 1) * 160 - boost) * 0.12;
    scrollV *= 0.9;
    links.forEach((a, i) => {
      const s = a.querySelector('span')!;
      s.style.setProperty('--skew', skew.toFixed(2));
      s.style.setProperty('--w', String(Math.round(clamp(base[i] + boost, 100, 800))));
    });
  });

  return {
    enable() {
      if (!live()) return;
      addEventListener('pointermove', onMove, { passive: true });
      addEventListener('scroll', onScroll, { passive: true });
      loop.start();
    },
    disable() {
      removeEventListener('pointermove', onMove);
      removeEventListener('scroll', onScroll);
      loop.stop();
      links.forEach((a, i) => { const s = a.querySelector('span')!; s.style.setProperty('--skew', '0'); s.style.setProperty('--w', String(Math.round(base[i]))); });
    },
  };
}
