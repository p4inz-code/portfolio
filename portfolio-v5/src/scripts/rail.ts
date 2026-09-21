/**
 * Scroll spy for the home page's release ladder (components/features/ShippingRail.astro).
 * Finds which featured chapter sits at the middle of the screen, marks it,
 * fills the rail by how far through the chapters you are, and only shows the
 * rail while the chapters are on screen. A pure function of scroll position,
 * so it reverses on the way back up.
 */
const rail = document.getElementById('shipRail');
const chapters = Array.from(document.querySelectorAll<HTMLElement>('.showcase .chapter'));
const showcase = document.querySelector<HTMLElement>('.showcase');

if (rail && showcase && chapters.length) {
  const links = Array.from(rail.querySelectorAll<HTMLAnchorElement>('a[data-rail-target]'));
  const pillNum = document.getElementById('railPillNum');
  const pillName = document.getElementById('railPillName');
  const pillSub = document.getElementById('railPillSub');
  const pad = (n: number) => String(n).padStart(2, '0');
  let active = -1;
  let queued = false;

  const update = () => {
    queued = false;
    const vh = window.innerHeight;
    const sr = showcase.getBoundingClientRect();
    const on = sr.top < vh * 0.55 && sr.bottom > vh * 0.45;
    rail.classList.toggle('is-on', on);
    if (!on) return;

    const mid = vh * 0.5;
    const tops = chapters.map((c) => c.getBoundingClientRect().top);
    let idx = 0;
    tops.forEach((t, i) => { if (t <= mid) idx = i; });
    const rp = Math.max(0, Math.min(1, (mid - sr.top) / sr.height));
    // fractional chapter index: the logo sits on a dot at a chapter's start and glides to the next
    const next = tops[idx + 1];
    const frac = next === undefined ? 0 : Math.max(0, Math.min(1, (mid - tops[idx]) / (next - tops[idx])));
    rail.style.setProperty('--rp', rp.toFixed(4));
    rail.style.setProperty('--ri', (idx + frac).toFixed(4));

    if (idx !== active) {
      active = idx;
      links.forEach((a, i) => {
        a.classList.toggle('is-active', i === idx);
        a.classList.toggle('is-passed', i < idx);
        if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      const a = links[idx];
      if (a && pillNum && pillName && pillSub) {
        pillNum.textContent = `${pad(idx + 1)} | ${pad(chapters.length)}`;
        pillName.textContent = a.dataset.name || '';
        pillSub.textContent = a.dataset.sub || '';
      }
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

  // jump straight there (no scrolling through the chapters in between) so the picture is up, not the empty run-in
  links.forEach((a, i) => {
    a.addEventListener('click', (e) => {
      const c = chapters[i];
      if (!c) return;
      e.preventDefault();
      const stage = c.querySelector('.stage');
      const pinned = !!stage && getComputedStyle(stage).position === 'sticky';
      const top = c.getBoundingClientRect().top + window.scrollY + (pinned ? window.innerHeight * 0.62 : -72);
      window.scrollTo({ top, behavior: 'instant' });
    });
  });

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  window.addEventListener('load', queue);
  update();
}
