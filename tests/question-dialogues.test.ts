// Multi-turn conversations: the follow-ups people really type ("how long he took to
// come here?", "wat is it built with", "more", "why?") must stay on the project being
// discussed, never hijack a question that is about Atharva, and never paste the same
// answer twice. Each turn is resolved exactly as the chat function does it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildKb } from '../portfolio-v5/src/data/chat-kb.ts';
import { PROJECTS } from '../portfolio-v5/src/data/projects.ts';
import { resolveTurn } from '../functions/_lib/faq-match.ts';

const { entries } = buildKb();
const byId = new Set(entries.map((e) => e.id));

interface Turn { q: string; expect: string } // 'id|id', 'slug:', '-' (silent), 'repeat'
interface Dialogue { name: string; turns: Turn[] }
const dialogues: Dialogue[] = [];

const OPENERS = (n: string) => [`what is ${n}`, `tell me about ${n}`, `${n}?`, `yo what is ${n} even`, `explain ${n}`];

// follow-up wording -> the intent it must reach
const FOLLOW: [string, string][] = [
  ['how long he took to come here?', 'started'], ['how long did it take him to build this', 'started'], ['hw long did it take', 'started'],
  ['wat is it built with', 'stack'], ['what is this made with', 'stack'], ['which language is it in', 'stack'],
  ['is it free?', 'cost'], ['is this free or paid', 'cost'], ['how much is it', 'cost'], ['what does it cost', 'cost'],
  ['where do i get it', 'download'], ['where can i download this', 'download'], ['link?', 'download'], ['gimme the github', 'download'],
  ['is this open source', 'license'], ['and its license?', 'license'], ['what licence is it under', 'license'],
  ['does it work on mac', 'platform'], ['which platforms', 'platform'], ['is it windows only', 'platform'],
  ['when is the next version', 'next'], ['whats coming next for it', 'next'], ['what are the plans for this', 'next'], ['when is the next update coming', 'next'],
  ['what is the status of this', 'status'], ['whats the latest version', 'status'], ['is it released yet', 'status'],
  ['who made this', 'role'], ['did he build it alone', 'role'],
];

for (const p of PROJECTS) {
  const n = p.name.toLowerCase();
  OPENERS(n).forEach((open, oi) => {
    FOLLOW.forEach(([q, intent], fi) => {
      if ((oi + fi) % 3 !== 0) return; // a rotating third of the grid keeps this fast and varied
      const id = `${p.slug}:${intent}`;
      dialogues.push({ name: `${p.slug}: ${open} -> ${q}`, turns: [{ q: open, expect: `${p.slug}:overview` }, { q, expect: byId.has(id) ? id : '-|' + p.slug + ':' }] });
    });
  });

  // "more" / "why?" walk through facts that have not been shown
  dialogues.push({ name: `${p.slug}: more, more`, turns: [{ q: `tell me about ${n}`, expect: `${p.slug}:overview` }, { q: 'more', expect: `${p.slug}:` }, { q: 'and?', expect: `${p.slug}:` }, { q: 'tell me more', expect: `${p.slug}:` }] });
  dialogues.push({ name: `${p.slug}: why`, turns: [{ q: `what is ${n}`, expect: `${p.slug}:overview` }, { q: 'why?', expect: `${p.slug}:` }] });
  // the same question twice is flagged, not pasted again
  dialogues.push({ name: `${p.slug}: repeat`, turns: [{ q: `what is ${n}`, expect: `${p.slug}:overview` }, { q: `what is ${n}`, expect: 'repeat' }] });
  // questions about the person stay about the person
  for (const [q, ids] of [
    ['where is he based', 'location'], ['what does he do', 'who'], ['is he available', 'availability'], ['how old is he', 'boundary-personal'],
    ['who is he', 'who'], ['what is his email', 'contact'], ['are you available for freelance work', 'availability'], ['how can i contact you', 'contact'],
  ] as [string, string][]) {
    dialogues.push({ name: `${p.slug}: ${q}`, turns: [{ q: `what is ${n}`, expect: `${p.slug}:overview` }, { q, expect: ids }] });
  }
  // switching project mid-conversation
  const other = PROJECTS.find((x) => x.slug !== p.slug)!;
  dialogues.push({ name: `${p.slug}: switch to ${other.slug}`, turns: [{ q: `what is ${n}`, expect: `${p.slug}:overview` }, { q: `how much is ${other.name.toLowerCase()}`, expect: byId.has(`${other.slug}:cost`) ? `${other.slug}:cost` : `${other.slug}:` }] });
  // a general question that merely contains "it" is not a follow-up
  dialogues.push({ name: `${p.slug}: it-like`, turns: [{ q: `what is ${n}`, expect: `${p.slug}:overview` }, { q: 'what is it like building an operating system alone', expect: '-' }] });
}

// no topic yet: bare follow-ups have nothing to lean on, the AI tier takes them
for (const q of ['more', 'why?', 'and?', 'explain', 'how long he took to come here?', 'is it free?', 'what is it built with']) {
  dialogues.push({ name: `cold: ${q}`, turns: [{ q, expect: q === 'is it free?' || q === 'what is it built with' ? '-|license-overview|tech-overview' : '-' }] });
}

function run(d: Dialogue): string[] {
  const problems: string[] = [];
  let ctx: string | null = null;
  const seen: string[] = [];
  d.turns.forEach((t, i) => {
    const r = resolveTurn(entries, t.q, ctx, seen);
    const got = r.repeat ? 'repeat' : r.hits[0]?.id ?? null;
    const options = t.expect.split('|');
    const ok = got === null ? options.includes('-') : options.some((o) => (o === 'repeat' ? !!r.repeat : o.endsWith(':') ? r.hits[0]?.project === o.slice(0, -1) : o === got));
    if (!ok) problems.push(`turn ${i + 1} ${JSON.stringify(t.q)} -> ${got}   (accepted: ${t.expect})`);
    const shown = r.repeat ?? r.hits[0];
    if (shown) { seen.push(shown.id); ctx = shown.project ?? null; } else ctx = null;
  });
  return problems;
}

test(`dialogues: ${dialogues.length} multi-turn conversations stay on topic, never repeat, never hijack`, () => {
  assert.ok(dialogues.length >= 300, `only ${dialogues.length} dialogues`);
  const bad: string[] = [];
  for (const d of dialogues) for (const p of run(d)) bad.push(`${d.name}\n    ${p}`);
  const turns = dialogues.reduce((a, d) => a + d.turns.length, 0);
  console.log(`\nDIALOGUES: ${dialogues.length} conversations, ${turns} turns | failures ${bad.length}`);
  if (bad.length) console.log(bad.slice(0, Number(process.env.CORPUS_ALL ? 9999 : 40)).join('\n'));
  assert.equal(bad.length, 0, `${bad.length} dialogue turns went wrong`);
});
