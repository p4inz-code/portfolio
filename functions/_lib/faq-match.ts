// Pure, dependency-free matcher for the chat knowledge base (see
// portfolio-v5/src/data/chat-kb.ts). Whole-word matching only, so "free"
// never fires inside "freelance" and "use" never fires inside "pursue".

export interface KbEntry {
  id: string;
  all: string[][];
  weight: number;
  answer: string;
  project?: string;
  noProject?: boolean;
  maxWords?: number;
  contact?: boolean;
  followups?: string[];
}

export function normalize(q: string): string {
  return q
    .toLowerCase()
    .replace(/[-\/]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function termHits(padded: string, tokens: string[], term: string): boolean {
  if (term.endsWith('*')) {
    const stem = term.slice(0, -1);
    return tokens.some((t) => t.startsWith(stem));
  }
  return padded.includes(` ${term} `);
}

/**
 * Best entry for a question, or null when nothing fits (the caller then
 * falls through to the cache / AI tier). A question that names two
 * different projects is left to the AI tier, which can compare them.
 */
export function matchFaq(entries: KbEntry[], question: string): KbEntry | null {
  const q = normalize(question);
  if (!q) return null;
  const tokens = q.split(' ');
  const padded = ` ${q} `;

  const hits = entries.filter(
    (e) =>
      (!e.maxWords || tokens.length <= e.maxWords) &&
      e.all.every((group) => group.some((t) => termHits(padded, tokens, t)))
  );
  if (hits.length === 0) return null;

  const mentioned = new Set(hits.filter((e) => e.project).map((e) => e.project as string));
  if (mentioned.size > 1) return null;

  const candidates = hits.filter((e) => !(e.noProject && mentioned.size > 0));
  if (candidates.length === 0) return null;

  let best = candidates[0];
  let bestScore = best.weight + best.all.length * 0.1;
  for (const e of candidates.slice(1)) {
    const score = e.weight + e.all.length * 0.1;
    if (score > bestScore) {
      best = e;
      bestScore = score;
    }
  }
  return best;
}
