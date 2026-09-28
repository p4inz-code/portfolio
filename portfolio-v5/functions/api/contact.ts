// Cloudflare Pages Function — POST /api/contact
//
// Ships inert: with no RESEND_API_KEY configured this always returns
// ok:false/not_configured, so the frontend's mailto: fallback stays the
// only active path until Resend + Turnstile are set up (see repo notes).
// Turnstile verification only runs once TURNSTILE_SECRET_KEY exists, so
// this can go live before that step without weakening anything today.

interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTACT_TO_EMAIL?: string;
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

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

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  const service = typeof body.service === 'string' && SERVICES.has(body.service) ? body.service : '';
  const budget = typeof body.budget === 'string' && BUDGETS.has(body.budget) ? body.budget : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return json({ ok: false, reason: 'invalid' }, 400);
  }

  // Bot check — active only once TURNSTILE_SECRET_KEY is configured.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
    if (!token) return json({ ok: false, reason: 'invalid' }, 400);
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    });
    const verifyData = await verifyRes.json().catch(() => ({ success: false })) as { success?: boolean };
    if (!verifyData.success) return json({ ok: false, reason: 'bot_check_failed' }, 403);
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
