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

// Text-speak that people type on a phone; mapped before matching, whole tokens only.
const SLANG: Record<string, string> = {
  wat: 'what', wht: 'what', hw: 'how', u: 'you', ur: 'your', r: 'are', y: 'why', abt: 'about', bout: 'about',
  pls: 'please', plz: 'please', wen: 'when', tk: 'took', cuz: 'because', coz: 'because', bcz: 'because',
  gimme: 'give me', lemme: 'let me', wanna: 'want to', gonna: 'going to', dis: 'this', dat: 'that', wats: 'what is', whats: 'what is',
};

export function normalize(q: string): string {
  const base = normalizeBase(q);
  return base.split(' ').map((t) => SLANG[t] ?? t).join(' ');
}

function normalizeBase(q: string): string {
  return q
    .toLowerCase()
    // curly apostrophes, "who's" -> "who is", then possessives ("Kanvaz's" -> "Kanvaz")
    .replace(/[\u2018\u2019\u00b4`]/g, "'")
    .replace(/\b(who|what|where|when|how|why|that|there|here)'s\b/g, '$1 is')
    .replace(/(\w)'s\b/g, '$1')
    // keep the technologies whose names are punctuation from collapsing into
    // single letters ("c#" and "c++" would both become "c")
    .replace(/c\+\+/g, 'cpp')
    .replace(/c#/g, 'csharp')
    .replace(/f#/g, 'fsharp')
    .replace(/\.net\b/g, 'dotnet')
    .replace(/node\.js/g, 'nodejs')
    .replace(/[-\/_]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/java script/g, 'javascript')
    .replace(/type script/g, 'typescript')
    .replace(/node js/g, 'nodejs')
    .replace(/next js/g, 'nextjs')
    .replace(/react js/g, 'reactjs')
    .replace(/c sharp/g, 'csharp')
    .replace(/c plus plus/g, 'cpp')
    .replace(/dot net/g, 'dotnet')
    .trim();
}

function termHits(padded: string, tokens: string[], term: string): boolean {
  if (term.endsWith('*')) {
    const stem = term.slice(0, -1);
    return tokens.some((t) => t.startsWith(stem));
  }
  return padded.includes(` ${term} `);
}

function entryMatches(e: KbEntry, padded: string, tokens: string[]): boolean {
  if (e.maxWords && tokens.length > e.maxWords) return false;
  return e.all.every((group) => group.some((t) => termHits(padded, tokens, t)));
}

/** All entries that fit, best first, after the project/noProject rules. */
function rank(entries: KbEntry[], q: string): KbEntry[] {
  if (!q) return [];
  const tokens = q.split(' ');
  const padded = ` ${q} `;
  const hits = entries.filter((e) => entryMatches(e, padded, tokens));
  if (hits.length === 0) return [];

  const mentioned = new Set(hits.filter((e) => e.project).map((e) => e.project as string));
  if (mentioned.size > 1) return [];

  const candidates = hits.filter((e) => !(e.noProject && mentioned.size > 0));
  const score = (e: KbEntry) => e.weight + e.all.length * 0.1;
  return candidates.map((e, i) => ({ e, i })).sort((a, b) => score(b.e) - score(a.e) || a.i - b.i).map((x) => x.e);
}

// -- typo tolerance -----------------------------------------------------------
// Only used when nothing matched as typed. Words are corrected towards the
// knowledge base's own vocabulary (project names, handles, key intent words),
// never towards arbitrary English, and only when exactly one word is closest.

// Correction targets are deliberately narrow: project names and handles, plus
// long, distinctive words (8+ letters). Ordinary short English words are never
// targets, otherwise "teach" would become "reach" and be answered as a contact
// question.
const NEVER_CORRECT = new Set(['craft', 'crafts', 'flint', 'drafts']);
const PERSON_WORDS = new Set(['atharva', 'patil', 'p4inz', 'painz']);
const vocabCache = new WeakMap<KbEntry[], { names: Set<string>; vocab: string[] }>();

function vocabulary(entries: KbEntry[]): { names: Set<string>; vocab: string[] } {
  const cached = vocabCache.get(entries);
  if (cached) return cached;
  const names = new Set<string>();
  const set = new Set<string>();
  for (const e of entries) {
    if (e.project && e.id.endsWith(':overview')) {
      for (const term of e.all[0]) for (const w of term.split(' ')) if (w.length >= 4 && /^[a-z0-9]+$/.test(w)) { names.add(w); set.add(w); }
    }
    if (e.id === 'who' || e.id === 'handles') {
      for (const term of e.all[0]) for (const w of term.split(' ')) if (PERSON_WORDS.has(w)) { names.add(w); set.add(w); }
    }
    for (const group of e.all) {
      for (const term of group) {
        if (term.endsWith('*')) continue;
        for (const w of term.split(' ')) if (w.length >= 8 && /^[a-z0-9]+$/.test(w)) set.add(w);
      }
    }
  }
  const built = { names, vocab: [...set] };
  vocabCache.set(entries, built);
  return built;
}

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      // adjacent swap ("kanvaz" -> "knavaz") counts as one edit
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

function correct(entries: KbEntry[], q: string): string | null {
  const { names, vocab } = vocabulary(entries);
  const known = new Set(vocab);
  let changed = false;
  const out = q.split(' ').map((tok) => {
    if (tok.length < 5 || known.has(tok) || NEVER_CORRECT.has(tok) || !/^[a-z0-9]+$/.test(tok)) return tok;
    const max = tok.length >= 9 ? 2 : 1;
    let best: string | null = null;
    let bestD = max + 1;
    let tie = false;
    for (const w of vocab) {
      // short project names (nexus, glint, draft...) only match when the first letter agrees
      if (w.length <= 6 && names.has(w) && w[0] !== tok[0]) continue;
      const d = editDistance(tok, w, max);
      if (d < bestD) { best = w; bestD = d; tie = false; }
      else if (d === bestD && d <= max) tie = true;
    }
    if (best && !tie && bestD <= max) { changed = true; return best; }
    return tok;
  });
  return changed ? out.join(' ') : null;
}

// -- public API ---------------------------------------------------------------

/**
 * Best entry for a question, or null when nothing fits (the caller then
 * falls through to the cache / AI tier). A question that names two
 * different projects is left to the AI tier, which can compare them.
 */
export function matchFaq(entries: KbEntry[], question: string): KbEntry | null {
  return matchAll(entries, question)[0] ?? null;
}

/**
 * Every entry that fits, best first. Typo correction runs when nothing fit as
 * typed, or when the only fits are general ones and the correction (a misspelt
 * project name, say) turns up a project-specific answer.
 */
export function matchAll(entries: KbEntry[], question: string): KbEntry[] {
  const q = normalize(question);
  const direct = rank(entries, q);
  if (direct.some((e) => e.project)) return direct;
  const fixed = correct(entries, q);
  if (!fixed) return direct;
  const corrected = rank(entries, fixed);
  if (!direct.length) return corrected;
  return corrected.some((e) => e.project) ? corrected : direct;
}

// Words that point back at the project being discussed. "this" does not count when it
// is the site itself ("who made this site").
const ANAPHORA = /(^| )(it|its|that|this one|that one|there|same|them|the same|this(?! (site|website|portfolio|page|chat|bot|guy|person)))( |$)|(^| )the (github|repo|link|download|version|licen[sc]e|price|stack)( |$)/;
// A one-word ask that only makes sense about the last project ("link?", "license", "price").
const BARE_INTENT = /^(link|links|github|repo|download|licen[sc]e|price|cost|version|stack|platforms?|status|roadmap|source|source code)$/;
// Softer pointers ("how long he took to come here") and short intent-only questions
// ("which platforms", "when is the next version"): used only when nothing else matched,
// so "where is he based" or "who made this site" are never hijacked by the last project.
const SOFT_POINTER = /(^| )(he|him|his|here|she|they|their)( |$)/;
const ABOUT_PERSON = /(^| )(atharva|patil|p4inz|painz)( |$)/;
const ADDRESSES_HIM = /(^| )(you|your|yours)( |$)/;
const BARE_FOLLOWUP = /^(and|and then|then|more|why|explain|go on|continue|tell me more|what else|anything else|so|really|elaborate|details|more details|more info|and what else)$/;
const INTENT_ORDER = ['next', 'stack', 'license', 'download', 'platform', 'status', 'started', 'role', 'cost'];

/**
 * Like matchFaq, but a follow-up that leans on the previous topic ("and its
 * license?", "is it free?") is resolved against that project. Only a
 * project-specific *intent* answer is accepted, never a bare overview, so
 * "what is it like building an OS alone" is not hijacked by the last topic.
 */
export function matchWithContext(entries: KbEntry[], question: string, contextProject?: string | null): KbEntry | null {
  const plain = matchFaq(entries, question);
  const nq = normalize(question);
  if (!contextProject || ABOUT_PERSON.test(nq) || ADDRESSES_HIM.test(nq)) return plain;
  const hard = (ANAPHORA.test(nq) && !/(^| )it like( |$)/.test(nq)) || BARE_INTENT.test(nq);
  const soft = !plain && (SOFT_POINTER.test(nq) || nq.split(' ').length <= 7);
  if (!(hard || soft)) return plain;
  const overview = entries.find((e) => e.id === `${contextProject}:overview`);
  const alias = overview?.all[0]?.[0];
  if (!alias) return plain;
  const aug = matchFaq(entries, `${question} ${alias}`);
  if (aug && aug.project === contextProject && !aug.id.endsWith(':overview')) return aug;
  return plain;
}

export interface Turn {
  hits: KbEntry[];
  /** the question repeats the answer given just before it */
  repeat: KbEntry | null;
}

/**
 * One chat turn: follow-ups lean on the last project, "more"/"why?" move to the next
 * fact not yet shown, and asking the same thing twice is flagged instead of repeated.
 */
export function resolveTurn(entries: KbEntry[], question: string, contextProject: string | null, seen: string[] = []): Turn {
  const nq = normalize(question);
  let hits: KbEntry[];
  if (BARE_FOLLOWUP.test(nq)) {
    hits = [];
    if (contextProject) {
      const wanted = [...INTENT_ORDER.map((i) => `${contextProject}:${i}`), `${contextProject}:overview`];
      const next = wanted.map((id) => entries.find((e) => e.id === id)).find((e) => e && !seen.includes(e.id));
      if (next) hits = [next];
    }
    return { hits, repeat: null };
  }
  hits = matchMany(entries, question, contextProject);
  const last = seen[seen.length - 1];
  if (hits.length && last && hits[0].id === last) return { hits: [], repeat: hits[0] };
  return { hits, repeat: null };
}

/**
 * When one question asks several things about the same project ("license and
 * stack of Kanvaz"), returns those project-intent entries (up to three, best
 * first); otherwise just the single best match.
 */
export function matchMany(entries: KbEntry[], question: string, contextProject?: string | null): KbEntry[] {
  const best = matchWithContext(entries, question, contextProject);
  if (!best) return [];
  if (!best.project || best.id.endsWith(':overview')) return [best];
  // Only an explicit multi-part ask ("license and stack", "price, platform") gets
  // several answers; one question that merely trips two keywords gets the best one.
  if (!/(^| )(and|also|plus|as well|along with)( |$)|[,&+]/.test(` ${question.toLowerCase()} `)) return [best];
  const all = matchAll(entries, question).filter((e) => e.project === best.project && !e.id.endsWith(':overview'));
  const seen = new Set<string>();
  const out: KbEntry[] = [];
  for (const e of [best, ...all]) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
    if (out.length === 3) break;
  }
  return out;
}
