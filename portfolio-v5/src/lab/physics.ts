// A small 3D gravity sandbox for the universe home. No DOM in here, so it is easy to test.
// Every galaxy has a sun. Planets start on tilted, near-circular orbits around it, pull on each
// other a little, bounce off each other and the sun, and slowly settle back towards a circular
// orbit after being thrown, so the scene never falls apart.

export interface Sun { x: number; y: number; z: number; r: number; gm: number }
export interface PBody {
  x: number; y: number; z: number; vx: number; vy: number; vz: number;
  m: number; r: number; g: number; grab: boolean; id: number;
}
export type Ext = (b: PBody) => [number, number, number];

export const SUN_GM = 2.6e6;
const SOFT = 46;           // gravity softening, avoids a singularity at the sun
const MUTUAL = 3.6e4;      // planet to planet pull (per unit mass)
const LEASH = 760;         // distance from the sun where a soft wall starts pulling back
const RESTITUTION = 0.86;

export const circularSpeed = (r: number, gm = SUN_GM) => Math.sqrt((gm * r * r) / Math.pow(r * r + SOFT * SOFT, 1.5));

/** Put a body on a near-circular orbit at angle `a`, radius `R`, in a plane tilted by `tilt` radians. */
export function placeOnOrbit(b: PBody, sun: Sun, a: number, R: number, tilt: number) {
  const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(tilt), st = Math.sin(tilt);
  b.x = sun.x + R * ca; b.y = sun.y + R * sa * ct; b.z = sun.z + R * sa * st;
  const v = circularSpeed(R, sun.gm) * 0.97;
  b.vx = -v * sa; b.vy = v * ca * ct; b.vz = v * ca * st;
}

export function energy(b: PBody, sun: Sun) {
  const dx = b.x - sun.x, dy = b.y - sun.y, dz = b.z - sun.z;
  const r = Math.sqrt(dx * dx + dy * dy + dz * dz + SOFT * SOFT);
  return 0.5 * b.m * (b.vx * b.vx + b.vy * b.vy + b.vz * b.vz) - (sun.gm * b.m) / r;
}

export function step(bodies: PBody[], suns: Sun[], dt: number, ext?: Ext) {
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.grab) continue;
    const sun = suns[b.g];
    let dx = sun.x - b.x, dy = sun.y - b.y, dz = sun.z - b.z;
    let r2 = dx * dx + dy * dy + dz * dz + SOFT * SOFT;
    const inv = sun.gm / (r2 * Math.sqrt(r2));
    let ax = dx * inv, ay = dy * inv, az = dz * inv;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    // planets tug on each other (only neighbours in the same galaxy matter at this scale)
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const o = bodies[j];
      if (o.g !== b.g) continue;
      const ex = o.x - b.x, ey = o.y - b.y, ez = o.z - b.z;
      const d2 = ex * ex + ey * ey + ez * ez + 60 * 60;
      const f = (MUTUAL * o.m) / (d2 * Math.sqrt(d2));
      ax += ex * f; ay += ey * f; az += ez * f;
    }
    // settle: pull the tangential speed towards the circular speed, damp radial motion, keep the plane
    const rx = -dx / r, ry = -dy / r, rz = -dz / r; // unit vector from the sun to the body
    const Lx = ry * b.vz - rz * b.vy, Ly = rz * b.vx - rx * b.vz, Lz = rx * b.vy - ry * b.vx; // r x v
    let tx = Ly * rz - Lz * ry, ty = Lz * rx - Lx * rz, tz = Lx * ry - Ly * rx; // L x r = tangent
    const tl = Math.hypot(tx, ty, tz);
    if (tl > 1e-6) {
      tx /= tl; ty /= tl; tz /= tl;
      const vt = b.vx * tx + b.vy * ty + b.vz * tz;
      const vc = circularSpeed(r, sun.gm);
      const k = 0.14;
      ax += tx * (vc - vt) * k; ay += ty * (vc - vt) * k; az += tz * (vc - vt) * k;
    }
    const vr = b.vx * rx + b.vy * ry + b.vz * rz;
    ax -= rx * vr * 0.18; ay -= ry * vr * 0.18; az -= rz * vr * 0.18;
    if (r > LEASH) { const pull = (r - LEASH) * 3; ax -= rx * pull; ay -= ry * pull; az -= rz * pull; }
    if (ext) { const [ex, ey, ez] = ext(b); ax += ex; ay += ey; az += ez; }
    b.vx += ax * dt; b.vy += ay * dt; b.vz += az * dt;
  }
  for (const b of bodies) { if (b.grab) continue; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; }

  // collisions: planet with planet (equal-restitution impulse), planet with the sun (fixed, heavy)
  for (let i = 0; i < n; i++) {
    const a = bodies[i];
    const sun = suns[a.g];
    let sx = a.x - sun.x, sy = a.y - sun.y, sz = a.z - sun.z;
    let sd = Math.hypot(sx, sy, sz) || 1;
    const sm = sun.r + a.r;
    if (sd < sm) {
      sx /= sd; sy /= sd; sz /= sd;
      a.x = sun.x + sx * sm; a.y = sun.y + sy * sm; a.z = sun.z + sz * sm;
      const vn = a.vx * sx + a.vy * sy + a.vz * sz;
      if (vn < 0) { a.vx -= (1 + 0.6) * vn * sx; a.vy -= (1 + 0.6) * vn * sy; a.vz -= (1 + 0.6) * vn * sz; }
    }
    for (let j = i + 1; j < n; j++) {
      const c = bodies[j];
      if (a.g !== c.g) continue;
      let nx = c.x - a.x, ny = c.y - a.y, nz = c.z - a.z;
      const d = Math.hypot(nx, ny, nz) || 1e-6;
      const min = a.r + c.r;
      if (d >= min) continue;
      nx /= d; ny /= d; nz /= d;
      const wa = a.grab ? 0 : 1 / a.m, wc = c.grab ? 0 : 1 / c.m, wsum = wa + wc || 1;
      const push = min - d;
      a.x -= nx * push * (wa / wsum); a.y -= ny * push * (wa / wsum); a.z -= nz * push * (wa / wsum);
      c.x += nx * push * (wc / wsum); c.y += ny * push * (wc / wsum); c.z += nz * push * (wc / wsum);
      const rvn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny + (c.vz - a.vz) * nz;
      if (rvn < 0) {
        const j2 = (-(1 + RESTITUTION) * rvn) / wsum;
        a.vx -= j2 * wa * nx; a.vy -= j2 * wa * ny; a.vz -= j2 * wa * nz;
        c.vx += j2 * wc * nx; c.vy += j2 * wc * ny; c.vz += j2 * wc * nz;
      }
    }
  }
}
