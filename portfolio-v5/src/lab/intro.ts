import { reduceMotion, type LabData } from './common.ts';

const KEY = 'lab:intro-seen';

/** A short build log that plays once per visit. Every line is generated from real data. */
export function playIntro(data: LabData, force = false): void {
  if (!force) {
    try { if (sessionStorage.getItem(KEY)) return; } catch { /* private mode */ }
  }
  if (reduceMotion()) { try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ } return; }
  const lines = [
    `read ${data.projects.length} projects from the site data`,
    `latest release: ${data.latest.name} ${data.latest.tag} (${data.latest.date})`,
    `checked against GitHub: ${new Date(data.checkedAt + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}`,
    'trackers on this page: 0',
    'cookies set: 0',
    'ready',
  ];
  const prevFocus = document.activeElement as HTMLElement | null;
  const root = document.createElement('div');
  root.className = 'lab-intro'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Loading summary, press any key to skip');
  const box = document.createElement('div'); box.className = 'lab-intro-box';
  const bar = document.createElement('div'); bar.className = 'lab-intro-bar'; const fill = document.createElement('i'); bar.appendChild(fill);
  const skip = document.createElement('button'); skip.type = 'button'; skip.className = 'lab-intro-skip'; skip.textContent = 'Skip';
  box.append(bar, skip); root.appendChild(box); document.body.appendChild(root);
  skip.focus();

  let i = 0, done = false, timer = 0;
  const finish = () => {
    if (done) return; done = true; clearTimeout(timer);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    root.dataset.leaving = '1';
    removeEventListener('keydown', finish); root.removeEventListener('pointerdown', finish);
    setTimeout(() => { root.remove(); prevFocus?.focus?.(); }, 650);
  };
  const next = () => {
    if (done) return;
    if (i >= lines.length) { timer = window.setTimeout(finish, 500); return; }
    const row = document.createElement('div'); row.className = 'lab-intro-line';
    row.innerHTML = '<b>ok</b><span></span>'; row.querySelector('span')!.textContent = lines[i];
    box.insertBefore(row, bar);
    i++; fill.style.width = `${Math.round((i / lines.length) * 100)}%`;
    timer = window.setTimeout(next, 380);
  };
  addEventListener('keydown', finish); root.addEventListener('pointerdown', finish);
  next();
}
