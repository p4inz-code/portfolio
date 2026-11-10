import { $, fmtLong, fmtShort, type LabData, type Mod } from './common.ts';

interface Fact { label: string; value: string; source: string; sourceLabel: string; published?: string; how: string }

export function initStamps(data: LabData): Mod {
  const host = $('#facts')!;
  const by = (slug: string) => data.projects.find((p) => p.slug === slug);
  const facts: Fact[] = [];
  const add = (f: Fact | null) => f && facts.push(f);

  const k = by('kanvaz'), mink = by('mink'), od = by('outlinedesk'), asc = by('ascent'), mini = by('kanvaz-mini');
  if (k?.latestTag) add({ label: 'Kanvaz, latest version', value: k.latestTag, source: k.latestUrl!, sourceLabel: 'GitHub release ' + k.latestTag, published: k.latestDate!, how: 'Read from the repository release list.' });
  if (k?.license) add({ label: 'Kanvaz, license', value: k.license, source: k.repo + '/blob/main/LICENSE', sourceLabel: 'LICENSE in the repository', how: 'Read from the LICENSE file and the repository license field.' });
  if (mink?.latestTag) add({ label: 'MINK, latest version', value: mink.latestTag, source: mink.latestUrl!, sourceLabel: 'Git tag ' + mink.latestTag, published: mink.latestDate!, how: 'Read from the repository tags, and checked against the npm package.' });
  if (mini?.latestTag) add({ label: 'Kanvaz Mini, latest version', value: mini.latestTag, source: mini.latestUrl!, sourceLabel: 'GitHub release ' + mini.latestTag, published: mini.latestDate!, how: 'Read from the repository release list.' });
  if (od?.latestTag) add({ label: 'Outlinedesk, status', value: od.status, source: od.latestUrl!, sourceLabel: 'GitHub release ' + od.latestTag + ' (pre-release)', published: od.latestDate!, how: 'The release is marked as a pre-release on GitHub, which matches the release candidate label.' });
  if (asc?.latestTag) add({ label: 'Project Ascent, status', value: asc.status, source: asc.latestUrl!, sourceLabel: 'GitHub release ' + asc.latestTag, published: asc.latestDate!, how: 'The version is the latest release. The rework status is set by Atharva, so it has no repository source.' });

  host.innerHTML = '';
  let open: HTMLElement | null = null;
  const close = () => { if (open) { open.hidden = true; (open.previousElementSibling as HTMLElement)?.setAttribute('aria-expanded', 'false'); open = null; } };

  facts.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'fact';
    const l = document.createElement('span'); l.textContent = f.label;
    const v = document.createElement('strong'); v.textContent = f.value;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'stamp'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('data-pad', '');
    b.id = 'stamp-' + i;
    b.textContent = 'Checked ' + fmtShort(data.checkedAt);
    const pop = document.createElement('div');
    pop.className = 'stamp-pop'; pop.hidden = true; pop.setAttribute('role', 'group'); pop.setAttribute('aria-labelledby', b.id);
    const dl = document.createElement('dl');
    const rows: [string, Node][] = [['Claim', document.createTextNode(`${f.label}: ${f.value}`)]];
    const a = document.createElement('a'); a.href = f.source; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = f.sourceLabel;
    rows.push(['Source', a]);
    if (f.published) rows.push(['Published', document.createTextNode(fmtLong(f.published))]);
    rows.push(['Checked', document.createTextNode(fmtLong(data.checkedAt))]);
    rows.push(['Method', document.createTextNode(f.how)]);
    for (const [dt, dd] of rows) { const t = document.createElement('dt'); t.textContent = dt; const d = document.createElement('dd'); d.appendChild(dd); dl.append(t, d); }
    pop.appendChild(dl);
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const was = open === pop;
      close();
      if (!was) { pop.hidden = false; b.setAttribute('aria-expanded', 'true'); open = pop; }
    });
    row.append(l, v, b, pop);
    host.appendChild(row);
  });

  document.addEventListener('click', (e) => { if (open && !open.contains(e.target as Node)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  return { enable() {}, disable() { close(); } };
}
