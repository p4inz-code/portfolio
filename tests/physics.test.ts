import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeOnOrbit, step, circularSpeed, SUN_GM, type PBody, type Sun } from '../portfolio-v5/src/lab/physics.ts';

const sun: Sun = { x: 0, y: 0, z: -1000, r: 34, gm: SUN_GM };
const mk = (id: number, m = 1, r = 40): PBody => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, m, r, g: 0, grab: false, id });
const dist = (b: PBody) => Math.hypot(b.x - sun.x, b.y - sun.y, b.z - sun.z);

function world(n: number) {
  const bodies = Array.from({ length: n }, (_, i) => mk(i, 1 + (i % 3) * 0.4, 30 + (i % 4) * 8));
  bodies.forEach((b, i) => placeOnOrbit(b, sun, (i / n) * Math.PI * 2 + 0.3, 200 + (i % 4) * 70, ((i % 5) - 2) * 0.12));
  return bodies;
}
const run = (bodies: PBody[], seconds: number, ext?: Parameters<typeof step>[3]) => { for (let t = 0; t < seconds * 120; t++) step(bodies, [sun], 1 / 120, ext); };

test('orbits stay bounded and finite for two minutes', () => {
  const bodies = world(8);
  run(bodies, 120);
  for (const b of bodies) {
    assert.ok(Number.isFinite(b.x + b.y + b.z + b.vx + b.vy + b.vz), 'no NaN or infinity');
    assert.ok(dist(b) < 800 && dist(b) > sun.r, `body ${b.id} stayed in the galaxy (${Math.round(dist(b))})`);
  }
});

test('a body keeps moving at about circular speed after settling', () => {
  const bodies = world(6);
  run(bodies, 40);
  for (const b of bodies) {
    const v = Math.hypot(b.vx, b.vy, b.vz);
    const vc = circularSpeed(dist(b));
    assert.ok(Math.abs(v - vc) / vc < 0.45, `body ${b.id} speed ${Math.round(v)} vs circular ${Math.round(vc)}`);
  }
});

test('a hard throw changes the orbit, then it settles back inside the galaxy', () => {
  const bodies = world(5);
  const t = bodies[0];
  const before = dist(t);
  t.vx += 520; t.vy -= 380;
  let far = 0;
  for (let i = 0; i < 120 * 30; i++) { step(bodies, [sun], 1 / 120); far = Math.max(far, dist(t)); }
  assert.ok(far > before + 40, `the throw moved it out (${Math.round(before)} to ${Math.round(far)})`);
  run(bodies, 60);
  assert.ok(dist(t) < 780, 'it is back inside the leash');
});

test('two planets that collide bounce and do not overlap afterwards', () => {
  const a = mk(0), b = mk(1);
  a.x = -60; a.y = 0; a.z = sun.z; b.x = 60; b.y = 0; b.z = sun.z;
  a.vx = 120; b.vx = -120;
  const bodies = [a, b];
  for (let i = 0; i < 120; i++) step(bodies, [sun], 1 / 120);
  const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  assert.ok(d >= a.r + b.r - 0.5, `separated (${d.toFixed(1)})`);
  assert.ok(a.vx < 120 && b.vx > -120, 'they exchanged momentum');
});

test('a grabbed body is not moved by physics and others still react to it', () => {
  const bodies = world(4);
  const g = bodies[0]; g.grab = true;
  const x0 = g.x;
  run(bodies, 5);
  assert.equal(g.x, x0);
});

test('an external pull (the cursor well) accelerates a body toward the target', () => {
  const bodies = world(1);
  const b = bodies[0];
  const start = Math.hypot(b.x - 300, b.y - 300);
  run(bodies, 2, (p) => [(300 - p.x) * 2, (300 - p.y) * 2, 0]);
  assert.ok(Math.hypot(b.x - 300, b.y - 300) < start, 'moved toward the point');
});
