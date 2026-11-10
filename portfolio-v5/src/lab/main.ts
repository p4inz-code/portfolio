import { $, $$, type LabData, type Mod } from './common.ts';
import { initDrift } from './drift.ts';
import { initScrub } from './scrub.ts';
import { initStamps } from './stamps.ts';
import { initListen } from './listen.ts';
import { initPin } from './pin.ts';
import { initInput } from './input.ts';
import { initLamp } from './lamp.ts';
import { initDoor } from './door.ts';
import { initCssTouches } from './css-touches.ts';
import { playIntro } from './intro.ts';

const KEY = 'lab:v1';
const FEATURES: { key: string; label: string }[] = [
  { key: 'intro', label: 'Skippable intro' },
  { key: 'door', label: '01 One door' },
  { key: 'drift', label: '02 Drift field' },
  { key: 'scrub', label: '03 Scrubber' },
  { key: 'stamps', label: '04 Proof stamps' },
  { key: 'type', label: '05 Type that listens' },
  { key: 'feed', label: '06 Week feed' },
  { key: 'pin', label: '07 Kanvaz pinboard' },
  { key: 'fold', label: '08 Unfolding changelog' },
  { key: 'css', label: '09 Small CSS touches' },
  { key: 'input', label: '10 Controller and tilt' },
  { key: 'lamp', label: '11 Studio lamp' },
  { key: 'chatSource', label: '12 Show your work chat' },
];

interface State { on: Record<string, boolean>; palette: string }
function load(): State {
  const base: State = { on: Object.fromEntries(FEATURES.map((f) => [f.key, true])), palette: 'ultraviolet' };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) return { on: { ...base.on, ...s.on }, palette: s.palette || base.palette }; } catch { /* ignore */ }
  return base;
}
const state = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } };

const data: LabData = JSON.parse(document.getElementById('lab-data')!.textContent!);

// ---- modules ----
const drift = initDrift(data);
const scrub = initScrub(data);
const panel = $<HTMLDetailsElement>('#lab-panel')!;
const mods: Record<string, Mod> = {
  door: initDoor(),
  drift,
  scrub,
  stamps: initStamps(data),
  type: initListen(data),
  pin: initPin(),
  css: initCssTouches(),
  lamp: initLamp(),
  input: initInput({ setTilt: drift.setTilt, step: scrub.step, togglePanel: () => { panel.open = !panel.open; } }),
};

function apply(key: string, on: boolean, first = false) {
  const sec = $(`section[data-feature="${key}"]`);
  if (sec) sec.hidden = !on;
  const m = mods[key];
  if (m) { if (on) m.enable(); else if (!first) m.disable(); }
}

// ---- panel ----
const togglesHost = $('#lab-toggles')!;
for (const f of FEATURES) {
  const label = document.createElement('label'); label.className = 'lab-toggle';
  const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!state.on[f.key]; cb.setAttribute('data-pad', '');
  cb.addEventListener('change', () => { state.on[f.key] = cb.checked; save(); apply(f.key, cb.checked); });
  label.append(cb, document.createTextNode(f.label));
  togglesHost.appendChild(label);
}
function setPalette(p: string) {
  state.palette = p; save();
  if (p === 'ultraviolet') document.documentElement.removeAttribute('data-lab-palette'); else document.documentElement.setAttribute('data-lab-palette', p);
  $$('#lab-pal button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pal === p)));
  window.dispatchEvent(new CustomEvent('lab:palette'));
}
$$('#lab-pal button').forEach((b) => { b.setAttribute('data-pad', ''); b.addEventListener('click', () => setPalette(b.dataset.pal!)); });
$('#lab-replay')!.addEventListener('click', () => playIntro(data, true));
$('#lab-reset')!.addEventListener('click', () => { try { localStorage.removeItem(KEY); sessionStorage.removeItem('lab:intro-seen'); } catch { /* ignore */ } location.reload(); });
$('#open-chat')?.addEventListener('click', () => document.querySelector<HTMLElement>('.chat-trigger')?.click());
if (window.innerWidth < 700) panel.open = false;

// ---- start ----
setPalette(state.palette);
for (const f of FEATURES) if (f.key !== 'intro' && f.key !== 'chatSource') apply(f.key, !!state.on[f.key], true);
if (state.on.chatSource === false) { const s = $('section[data-feature="chatSource"]'); if (s) s.hidden = true; }
if (state.on.intro) playIntro(data);
