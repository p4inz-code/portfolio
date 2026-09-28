// Cloudflare Pages Function — POST /api/contact
//
// Ships inert: with no RESEND_API_KEY configured this always returns
// ok:false/not_configured, so the frontend's mailto: fallback stays the
// only active path until Resend + Turnstile are set up (see repo notes).
// Turnstile verification only runs once TURNSTILE_SECRET_KEY exists, so
// this can go live before that step without weakening anything today.
// Rate limiting only runs once a RATE_LIMIT KV namespace is bound; until
// then it's skipped rather than blocking legitimate traffic by accident.

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  RATE_LIMIT?: KVNamespaceLike;
}

const SERVICES = new Set([
  'Product & Web Development',
  'UI, UX & Product Design',
  'Branding & Visual Identity',
  '3D & VFX & Visualization',
  'Security & Privacy consulting',
  'Something else',
]);

const BUDGETS = new Set([
  'Under $1k',
  '$1k – $5k',
  '$5k – $15k',
  '$15k+',
  'Not sure yet',
]);

// Deliberately strict: a single local-part + single domain, no comma,
// semicolon, angle bracket, or control character. A looser regex would
// still accept things like "a@b.com,evil@x.com" as a "valid" email, which
// has no business being anywhere near a Reply-To value.
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_ORIGIN = 'https://atharvapatil.tech';
const EXPECTED_TURNSTILE_HOSTNAME = 'atharvapatil.tech';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// Strips characters that have no legitimate reason to be in a name, subject
// line, or single-line field — mainly CR/LF, which is the building block of
// classic email header injection if this value ever ends up near a header.
function cleanLine(value: string, maxLen: number): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLen);
}

async function checkRateLimit(kv: KVNamespaceLike | undefined, ip: string): Promise<'ok' | 'burst' | 'day' | 'global'> {
  if (!kv) return 'ok'; // not bound yet — Turnstile + honeypot still apply

  const day = new Date().toISOString().slice(0, 10);
  const burstKey = `rl:burst:${ip}`;
  const dayKey = `rl:day:${ip}:${day}`;
  const globalKey = `rl:global:${day}`;

  const [burstRaw, dayRaw, globalRaw] = await Promise.all([
    kv.get(burstKey),
    kv.get(dayKey),
    kv.get(globalKey),
  ]);
  const burstCount = burstRaw ? parseInt(burstRaw, 10) : 0;
  const dayCount = dayRaw ? parseInt(dayRaw, 10) : 0;
  const globalCount = globalRaw ? parseInt(globalRaw, 10) : 0;

  // 5 attempts / 10 min per IP, 8 / day per IP, and a sitewide daily cap
  // held well under Resend's 100/day ceiling so one bad actor can't burn
  // through the quota and start silently failing everyone else's messages.
  if (burstCount >= 5) return 'burst';
  if (dayCount >= 8) return 'day';
  if (globalCount >= 80) return 'global';

  await Promise.all([
    kv.put(burstKey, String(burstCount + 1), { expirationTtl: 600 }),
    kv.put(dayKey, String(dayCount + 1), { expirationTtl: 90_000 }),
    kv.put(globalKey, String(globalCount + 1), { expirationTtl: 90_000 }),
  ]);
  return 'ok';
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  const rateResult = await checkRateLimit(env.RATE_LIMIT, ip);
  if (rateResult !== 'ok') {
    return json({ ok: false, reason: 'rate_limited' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 20_000) return json({ ok: false, reason: 'invalid' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, reason: 'invalid' }, 400);
  }

  // Honeypot: a bot that fills a hidden field gets a fake success, never a tell.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') {
    return json({ ok: true });
  }

  const name = typeof body.name === 'string' ? cleanLine(body.name, 100) : '';
  const emailRaw = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  const service = typeof body.service === 'string' && SERVICES.has(body.service) ? body.service : '';
  const budget = typeof body.budget === 'string' && BUDGETS.has(body.budget) ? body.budget : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

  if (!name || !emailRaw || !EMAIL_RE.test(emailRaw) || !message) {
    return json({ ok: false, reason: 'invalid' }, 400);
  }
  const email = emailRaw;

  // Soft origin check: only rejects when a mismatched Origin is present.
  // Bypassable by a non-browser client that omits the header entirely —
  // that path is covered by Turnstile + rate limiting instead. This layer
  // exists specifically against a third-party page silently POSTing here
  // through a visitor's browser.
  const origin = request.headers.get('Origin');
  if (origin && origin !== ALLOWED_ORIGIN) {
    return json({ ok: false, reason: 'invalid_origin' }, 403);
  }

  // Bot check — active only once TURNSTILE_SECRET_KEY is configured.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
    if (!token) return json({ ok: false, reason: 'invalid' }, 400);
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    });
    const verifyData = await verifyRes.json().catch(() => ({ success: false })) as {
      success?: boolean;
      hostname?: string;
    };
    if (!verifyData.success || verifyData.hostname !== EXPECTED_TURNSTILE_HOSTNAME) {
      return json({ ok: false, reason: 'bot_check_failed' }, 403);
    }
  }

  // Not configured yet — frontend falls back to mailto:.
  if (!env.RESEND_API_KEY) {
    return json({ ok: false, reason: 'not_configured' }, 503);
  }

  const to = env.CONTACT_TO_EMAIL || 'atharva.patil.cg@gmail.com';
  const subject = `Project inquiry — ${name}`;
  const plainBody = [
    `from:     ${name} <${email}>`,
    `service:  ${service || '(not specified)'}`,
    `budget:   ${budget || '(not specified)'}`,
    '',
    '--',
    '',
    message,
  ].join('\n');

  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: 'atharvapatil.tech <contact@atharvapatil.tech>',
      to: [to],
      reply_to: email,
      subject,
      text: plainBody,
    }),
  });

  if (!sendRes.ok) {
    return json({ ok: false, reason: 'send_failed' }, 502);
  }

  return json({ ok: true });
}
