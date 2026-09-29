/**
 * Build-time force-directed layout for the project constellation.
 *
 * Runs entirely at build time (Node context, inside Astro frontmatter) --
 * no physics simulation ships to the browser. A small deterministic PRNG
 * seeds initial positions so the same data always produces the same
 * layout between builds, rather than visually thrashing on every deploy.
 */

export interface ConstellationNode {
  id: string;
  label: string;
  x: number; // 0-100, percentage of container
  y: number; // 0-100, percentage of container
}

export interface ConstellationEdge {
  from: string;
  to: string;
  reason: string; // human-readable: what connects these two
}

interface InputNode {
  id: string;
  category?: string;
  stack?: string[];
  tags?: string[];
}

// mulberry32 -- tiny seeded PRNG, deterministic across runs
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildEdges(nodes: InputNode[]): ConstellationEdge[] {
  const edges: ConstellationEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.category && b.category && a.category === b.category) {
        edges.push({ from: a.id, to: b.id, reason: `Both ${a.category}` });
        continue;
      }
      const sharedStack = (a.stack || []).find((s) => (b.stack || []).includes(s));
      if (sharedStack) {
        edges.push({ from: a.id, to: b.id, reason: `Both use ${sharedStack}` });
        continue;
      }
      const sharedTag = (a.tags || []).find((t) => (b.tags || []).includes(t));
      if (sharedTag) {
        edges.push({ from: a.id, to: b.id, reason: `Both tagged ${sharedTag}` });
      }
    }
  }
  return edges;
}

export function computeConstellation(
  inputNodes: InputNode[],
  labels: Record<string, string>
): { nodes: ConstellationNode[]; edges: ConstellationEdge[] } {
  const edges = buildEdges(inputNodes);
  const rand = mulberry32(20260929); // fixed seed -- deterministic between builds

  const W = 1000;
  const H = 560;
  const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();

  inputNodes.forEach((n, i) => {
    // seeded circular-ish starting spread, not pure random clumping
    const angle = (i / inputNodes.length) * Math.PI * 2;
    const radius = 150 + rand() * 100;
    positions.set(n.id, {
      x: W / 2 + Math.cos(angle) * radius,
      y: H / 2 + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    });
  });

  const REPULSION = 12000;
  const SPRING_LEN = 170;
  const SPRING_K = 0.02;
  const CENTER_K = 0.006;
  const DAMPING = 0.82;
  const ITERATIONS = 400;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // repulsion between every pair
    for (let i = 0; i < inputNodes.length; i++) {
      for (let j = i + 1; j < inputNodes.length; j++) {
        const a = positions.get(inputNodes[i].id)!;
        const b = positions.get(inputNodes[j].id)!;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 1) distSq = 1;
        const dist = Math.sqrt(distSq);
        const force = REPULSION / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }
    // spring attraction along edges
    for (const e of edges) {
      const a = positions.get(e.from)!;
      const b = positions.get(e.to)!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist - SPRING_LEN) * SPRING_K;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
    // gentle centering pull + integrate + damping
    for (const n of inputNodes) {
      const p = positions.get(n.id)!;
      p.vx += (W / 2 - p.x) * CENTER_K;
      p.vy += (H / 2 - p.y) * CENTER_K;
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  // clamp into padded bounds, then normalize to 0-100%
  // The repulsion+centering forces are isotropic, so an unconstrained sim
  // naturally settles into a roughly circular cluster -- which leaves both
  // sides empty inside a wide rectangular box. Rescale the settled bounding
  // box to actually fill the padded canvas instead of just clamping it.
  const PAD = 60;
  const xs = inputNodes.map((n) => positions.get(n.id)!.x);
  const ys = inputNodes.map((n) => positions.get(n.id)!.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);

  const nodes: ConstellationNode[] = inputNodes.map((n) => {
    const p = positions.get(n.id)!;
    const x = PAD + ((p.x - minX) / spanX) * (W - PAD * 2);
    const y = PAD + ((p.y - minY) / spanY) * (H - PAD * 2);
    return {
      id: n.id,
      label: labels[n.id] || n.id,
      x: (x / W) * 100,
      y: (y / H) * 100,
    };
  });

  return { nodes, edges };
}
