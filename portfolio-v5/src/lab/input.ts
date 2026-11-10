import { $, clamp, reduceMotion, type Mod } from './common.ts';

interface Hooks { setTilt(x: number, y: number): void; step(days: number): void; togglePanel(): void }

export function initInput(h: Hooks): Mod {
  const status = $('#pad-status')!;
  const tiltBtn = $<HTMLButtonElement>('#tilt-btn')!;
  const tiltStatus = $('#tilt-status')!;
  let padIndex = -1, raf = 0, focused: HTMLElement | null = null, lastMove = 0;
  const prev: boolean[] = [];

  // ---- controller ----
  const setStatus = (on: boolean, name = '') => {
    status.innerHTML = `<span class="light" data-kind="${on ? 'released' : 'onHold'}"></span> `;
    status.append(on ? `Controller connected${name ? ': ' + name.slice(0, 32) : ''}` : 'No controller yet');
  };
  const items = () => [...document.querySelectorAll<HTMLElement>('[data-pad]')].filter((e) => e.offsetParent !== null && e.getBoundingClientRect().width > 0 && !e.closest('[hidden]'));
  const mark = (el: HTMLElement | null) => {
    focused?.removeAttribute('data-pad-focus');
    focused = el;
    if (el) { el.setAttribute('data-pad-focus', '1'); el.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' }); }
  };
  const move = (dx: number, dy: number) => {
    const list = items();
    if (!list.length) return;
    if (!focused || !list.includes(focused)) { mark(list[0]); return; }
    const from = focused.getBoundingClientRect(); const fx = from.left + from.width / 2, fy = from.top + from.height / 2;
    let best: HTMLElement | null = null, bestScore = Infinity;
    for (const el of list) {
      if (el === focused) continue;
      const r = el.getBoundingClientRect(); const x = r.left + r.width / 2 - fx, y = r.top + r.height / 2 - fy;
      const along = x * dx + y * dy; if (along <= 4) continue;
      const across = Math.abs(x * dy) + Math.abs(y * dx);
      const score = along + across * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) mark(best);
  };

  function poll() {
    const pad = navigator.getGamepads?.()[padIndex];
    if (pad) {
      const now = performance.now();
      const btn = (i: number) => !!pad.buttons[i]?.pressed;
      const edge = (i: number) => btn(i) && !prev[i];
      let dx = 0, dy = 0;
      if (btn(14) || pad.axes[0] < -0.55) dx = -1; else if (btn(15) || pad.axes[0] > 0.55) dx = 1;
      if (btn(12) || pad.axes[1] < -0.55) dy = -1; else if (btn(13) || pad.axes[1] > 0.55) dy = 1;
      if ((dx || dy) && now - lastMove > 230) { lastMove = now; move(dx, dy); }
      if (edge(0) && focused) focused.click();
      if (edge(1)) mark(null);
      if (edge(4)) h.step(-3);
      if (edge(5)) h.step(3);
      if (edge(3)) h.togglePanel();
      for (let i = 0; i < pad.buttons.length; i++) prev[i] = btn(i);
    }
    raf = requestAnimationFrame(poll);
  }
  const onConnect = (e: GamepadEvent) => { padIndex = e.gamepad.index; setStatus(true, e.gamepad.id); if (!raf) raf = requestAnimationFrame(poll); };
  const onDisconnect = () => { padIndex = -1; setStatus(false); cancelAnimationFrame(raf); raf = 0; mark(null); };

  // ---- tilt ----
  let tiltOn = false, got = false, sx = 0, sy = 0;
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    got = true;
    sx += (clamp(e.gamma / 28, -1, 1) - sx) * 0.2; sy += (clamp((e.beta - 40) / 28, -1, 1) - sy) * 0.2;
    h.setTilt(sx, sy);
  };
  async function enableTilt() {
    const D = (window as any).DeviceOrientationEvent;
    try {
      if (D && typeof D.requestPermission === 'function') {
        const r = await D.requestPermission();
        if (r !== 'granted') { tiltStatus.textContent = 'Tilt permission denied'; return; }
      }
    } catch { tiltStatus.textContent = 'Tilt permission not available'; return; }
    window.addEventListener('deviceorientation', onOrient);
    tiltOn = true; tiltBtn.textContent = 'Disable tilt'; tiltStatus.textContent = 'Waiting for a tilt sensor';
    setTimeout(() => { if (tiltOn && !got) tiltStatus.textContent = 'No tilt sensor found on this device'; }, 1800);
    const watch = setInterval(() => { if (!tiltOn) clearInterval(watch); else if (got) { tiltStatus.textContent = 'Tilt on'; clearInterval(watch); } }, 300);
  }
  function disableTilt() {
    window.removeEventListener('deviceorientation', onOrient);
    tiltOn = false; got = false; tiltBtn.textContent = 'Enable tilt'; tiltStatus.textContent = 'Tilt off'; h.setTilt(0, 0);
  }
  tiltBtn.addEventListener('click', () => (tiltOn ? disableTilt() : enableTilt()));

  return {
    enable() {
      window.addEventListener('gamepadconnected', onConnect);
      window.addEventListener('gamepaddisconnected', onDisconnect);
      const existing = [...(navigator.getGamepads?.() ?? [])].find(Boolean);
      if (existing) onConnect({ gamepad: existing } as GamepadEvent);
    },
    disable() {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
      cancelAnimationFrame(raf); raf = 0; mark(null); disableTilt();
    },
  };
}
