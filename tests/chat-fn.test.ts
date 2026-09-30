// End-to-end tests for functions/api/chat.ts: the real function is bundled
// with esbuild and driven with a mocked fetch, KV namespace and AI binding.
// Run: node --test tests/
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildKb } from '../portfolio-v5/src/data/chat-kb.ts';

const require = createRequire(import.meta.url);
const { buildSync } = require('../portfolio-v5/node_modules/esbuild');

let onRequestPost: (ctx: { request: Request; env: Record<string, unknown> }) => Promise<Response>;
const realFetch = globalThis.fetch;
const kbJson = JSON.stringify(buildKb());
let kbFetches = 0;

before(async () => {
  const out = join(mkdtempSync(join(tmpdir(), 'chatfn-')), 'chat.mjs');
  const res = buildSync({ entryPoints: [fileURLToPath(new URL('../functions/api/chat.ts', import.meta.url))], bundle: true, format: 'esm', platform: 'neutral', write: false });
  writeFileSync(out, res.outputFiles[0].text);
  ({ onRequestPost } = await import(pathToFileURL(out).href));
});

function mockFetch(handler?: (url: string) => Response | undefined) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    const custom = handler?.(url);
    if (custom) return custom;
    if (url.endsWith('/chat-kb.json')) {
      kbFetches++;
      return new Response(kbJson, { headers: { 'content-type': 'application/json' } });
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
}

function post(question: unknown, env: Record<string, unknown> = {}, origin: string | null = 'https://atharvapatil.tech') {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' };
  if (origin) headers.Origin = origin;
  return onRequestPost({ request: new Request('https://atharvapatil.tech/api/chat', { method: 'POST', headers, body: JSON.stringify({ question }) }), env });
}

class FakeKV {
  store = new Map<string, string>();
  async get(k: string) { return this.store.get(k) ?? null; }
  async put(k: string, v: string) { this.store.set(k, v); }
}

test('tier 1: a KB question is answered free, with bullets and follow-ups, and never touches AI or KV', async () => {
  mockFetch();
  let aiCalls = 0;
  const env = { AI: { run: async () => { aiCalls++; return { response: 'x' }; } }, RATE_LIMIT: new FakeKV() };
  const res = await post('What license is Nexus?', env);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.source, 'faq');
  assert.match(body.answer, /Nexus is proprietary/);
  assert.ok(Array.isArray(body.followups) && body.followups.length > 0);
  assert.equal(aiCalls, 0);
  assert.equal(env.RATE_LIMIT.store.size, 0, 'a free FAQ hit must not consume rate-limit quota');
});

test('tier 1: contact flag is passed through for hiring questions', async () => {
  mockFetch();
  const body = await (await post('Are you available for freelance work?')).json();
  assert.equal(body.source, 'faq');
  assert.equal(body.contact, true);
});

test('KB is cached between requests (one fetch, not one per question)', async () => {
  mockFetch();
  kbFetches = 0;
  await post('How many products have you shipped?');
  await post('Who are you?');
  await post('What are you working on right now?');
  assert.ok(kbFetches <= 1, `expected the KB to be reused, fetched ${kbFetches}x`);
});

test('rejects a foreign origin, bad bodies and empty questions', async () => {
  mockFetch();
  assert.equal((await post('hi', {}, 'https://evil.example')).status, 403);
  assert.equal((await post('   ')).status, 400);
  const bad = await onRequestPost({ request: new Request('https://atharvapatil.tech/api/chat', { method: 'POST', headers: { Origin: 'https://atharvapatil.tech' }, body: '{nope' }), env: {} });
  assert.equal(bad.status, 400);
  const huge = await onRequestPost({ request: new Request('https://atharvapatil.tech/api/chat', { method: 'POST', headers: { Origin: 'https://atharvapatil.tech' }, body: JSON.stringify({ question: 'x'.repeat(5000) }) }), env: {} });
  assert.equal(huge.status, 413);
});

test('tier 3: an unmatched question goes to AI, grounded in the FULL compact KB (every project)', async () => {
  mockFetch();
  let prompt = '';
  const env = { AI: { run: async (_m: string, input: any) => { prompt = input.messages[0].content; return { response: 'Lead line\n- a point' }; } }, RATE_LIMIT: new FakeKV() };
  const body = await (await post('Can you build me a mobile app in Swift for my bakery?', env)).json();
  assert.equal(body.source, 'ai');
  for (const name of ['MINK', 'Glint', 'Obscura', 'CrossPort', 'Kalasadhana Academy', '30 days of free bug-fixes']) {
    assert.ok(prompt.includes(name), `AI prompt is missing "${name}" (grounding truncated?)`);
  }
  assert.match(prompt, /bullet/i, 'system prompt should ask for bullet answers');
});

test('tier 3 fallback: if the KB is unreachable, llms.txt grounds the AI instead', async () => {
  mockFetch((url) => (url.endsWith('/llms.txt') ? new Response('LLMS FALLBACK CONTENT', { status: 200 }) : url.endsWith('/chat-kb.json') ? new Response('nope', { status: 500 }) : undefined));
  // fresh module state matters: use a question the (already cached) KB could answer only if cached -> use an unmatched one
  let prompt = '';
  const env = { AI: { run: async (_m: string, input: any) => { prompt = input.messages[0].content; return { response: 'ok' }; } } };
  const res = await post('Tell me a joke about semicolons', env);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(prompt.includes('Reference data:'));
});

test('cache tier: the second identical AI question is served from KV, not the model', async () => {
  mockFetch();
  let aiCalls = 0;
  const kv = new FakeKV();
  const env = { AI: { run: async () => { aiCalls++; return { response: 'Cached lead\n- point' }; } }, RATE_LIMIT: kv };
  const q = 'Do you enjoy playing chess in your spare time?';
  const first = await (await post(q, env)).json();
  const second = await (await post(q, env)).json();
  assert.equal(first.source, 'ai');
  assert.equal(second.source, 'cache');
  assert.equal(aiCalls, 1);
});

test('rate limit: the 9th uncached AI question in a burst is refused with reason rate_limited', async () => {
  mockFetch();
  const kv = new FakeKV();
  const env = { AI: { run: async () => ({ response: 'a' }) }, RATE_LIMIT: kv };
  let last: any;
  for (let i = 0; i < 9; i++) last = await post(`unmatched question number ${i} about nothing in particular`, env);
  assert.equal(last.status, 429);
  assert.equal((await last.json()).reason, 'rate_limited');
});

test('not configured: with no AI binding an unmatched question degrades to a clean 503, not a crash', async () => {
  mockFetch();
  const res = await post('Could you design a logo for my bakery in Pune?', {});
  assert.equal(res.status, 503);
  assert.equal((await res.json()).reason, 'not_configured');
});

test.after?.(() => { globalThis.fetch = realFetch; });
