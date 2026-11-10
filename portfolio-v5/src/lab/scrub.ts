import { $, dayNum, fmtLong, fmtShort, fromDay, reduceMotion, type LabData, type Mod } from './common.ts';

const START = '2026-06-01';

export function initScrub(data: LabData): Mod & { step(days: number): void } {
  const range = $<HTMLInputElement>('#scrub-range')!;
  const dateEl = $('#scrub-date')!;
  const subEl = $('#scrub-sub')!;
  const grid = $('#scrub-grid')!;
  const playBtn = $<HTMLButtonElement>('#scrub-play')!;
  const d0 = dayNum(START), d1 = dayNum(data.checkedAt);
  range.max = String(d1 - d0); range.value = range.max;
  range.setAttribute('data-pad', '');
  playBtn.setAttribute('data-pad', '');

  const chips = new Map<string, { el: HTMLElement; version: string }>();
  let raf = 0, started = false;

  function build() {
    if (started) return;
    started = true;
    grid.innerHTML = '';
    for (const p of data.projects) {
      const el = document.createElement('div');
      el.className = 'scrub-chip';
      el.innerHTML = `<b></b><span class="v"></span><small></small>`;
      el.querySelector('b')!.textContent = p.name;
      grid.appendChild(el);
      chips.set(p.slug, { el, version: '' });
    }
  }

  function render() {
    const day = d0 + Number(range.value);
    const date = fromDay(day);
    dateEl.textContent = fmtLong(date);
    range.setAttribute('aria-valuetext', fmtLong(date));
    let lastEvent: { name: string; tag: string; day: number } | null = null;
    let alive = 0;
    for (const p of data.projects) {
      const c = chips.get(p.slug)!;
      const exists = dayNum(p.created) <= day;
      const rel = [...p.releases].filter((r) => dayNum(r[0]) <= day);
      const cur = rel.at(-1);
      const version = cur ? cur[1] : '';
      if (exists) alive++;
      c.el.dataset.state = !exists ? 'off' : cur ? 'live' : 'dev';
      c.el.setAttribute('aria-hidden', exists ? 'false' : 'true');
      c.el.querySelector('.v')!.textContent = !exists ? '' : cur ? cur[1] : 'in development';
      c.el.querySelector('small')!.textContent = !exists ? '' : cur ? `${rel.length} release${rel.length === 1 ? '' : 's'} so far` : `started ${fmtShort(p.created)}`;
      if (exists && version !== c.version && c.version !== '__init') {
        c.el.dataset.flash = '1';
        setTimeout(() => delete c.el.dataset.flash, 450);
      }
      c.version = version;
      if (cur && (!lastEvent || dayNum(cur[0]) > lastEvent.day)) lastEvent = { name: p.name, tag: cur[1], day: dayNum(cur[0]) };
    }
    const ago = lastEvent ? day - lastEvent.day : 0;
    subEl.textContent = `${alive} project${alive === 1 ? '' : 's'} on the board` + (lastEvent ? ` · last release: ${lastEvent.name} ${lastEvent.tag}${ago ? `, ${ago} day${ago === 1 ? '' : 's'} earlier` : ', that day'}` : '');
  }

  function play() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; playBtn.textContent = 'Play'; return; }
    if (reduceMotion()) { range.value = range.max; render(); return; }
    if (Number(range.value) >= Number(range.max)) range.value = '0';
    playBtn.textContent = 'Pause';
    const from = Number(range.value), to = Number(range.max);
    const ms = 14000 * ((to - from) / to) + 800;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      range.value = String(Math.round(from + (to - from) * k));
      render();
      if (k < 1) raf = requestAnimationFrame(tick); else { raf = 0; playBtn.textContent = 'Play'; }
    };
    raf = requestAnimationFrame(tick);
  }

  range.addEventListener('input', () => { if (raf) { cancelAnimationFrame(raf); raf = 0; playBtn.textContent = 'Play'; } render(); });
  playBtn.addEventListener('click', play);

  return {
    enable() { build(); render(); },
    disable() { if (raf) { cancelAnimationFrame(raf); raf = 0; playBtn.textContent = 'Play'; } },
    step(days: number) { range.value = String(Math.min(Number(range.max), Math.max(0, Number(range.value) + days))); render(); },
  };
}
