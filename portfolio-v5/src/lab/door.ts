import { $, type Mod } from './common.ts';

interface Page { label: string; href: string; kw: string }

export function initDoor(): Mod {
  const input = $<HTMLInputElement>('#door-input')!;
  const list = $('#door-list')!;
  const pages: Page[] = JSON.parse($('#door-pages')!.textContent || '[]');
  input.setAttribute('data-pad', '');
  let sel = 0, rows: { label: string; hint: string; run: () => void }[] = [];

  function compute() {
    const q = input.value.trim().toLowerCase();
    rows = [];
    if (q) {
      const hits = pages.filter((p) => (p.label + ' ' + p.kw).toLowerCase().includes(q)).slice(0, 4);
      for (const p of hits) rows.push({ label: p.label, hint: 'page', run: () => { location.href = p.href; } });
      rows.push({ label: `Ask: ${input.value.trim()}`, hint: 'chat', run: () => { window.dispatchEvent(new CustomEvent('ap-chat-ask', { detail: input.value.trim() })); input.value = ''; close(); } });
    }
    sel = 0;
    render();
  }
  function render() {
    list.innerHTML = '';
    rows.forEach((r, i) => {
      const li = document.createElement('li');
      li.id = 'door-opt-' + i; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', String(i === sel));
      const s = document.createElement('span'); s.textContent = r.label; const m = document.createElement('small'); m.textContent = r.hint;
      li.append(s, m);
      li.addEventListener('mousedown', (e) => { e.preventDefault(); r.run(); });
      list.appendChild(li);
    });
    const open = rows.length > 0;
    (list as HTMLElement).hidden = !open; input.setAttribute('aria-expanded', String(open));
    if (open) input.setAttribute('aria-activedescendant', 'door-opt-' + sel); else input.removeAttribute('aria-activedescendant');
  }
  function close() { rows = []; render(); }

  input.addEventListener('input', compute);
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (rows.length) { sel = (sel + 1) % rows.length; render(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (rows.length) { sel = (sel - 1 + rows.length) % rows.length; render(); } }
    else if (e.key === 'Enter') { e.preventDefault(); rows[sel]?.run(); }
    else if (e.key === 'Escape') { close(); }
  });

  return { enable() {}, disable() { close(); } };
}
