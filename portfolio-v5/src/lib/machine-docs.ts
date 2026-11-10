/**
 * Machine-readable versions of the site, generated at build time from the same data
 * that builds the pages (projects.ts, site.ts, changelog.ts) plus the release history
 * pulled from GitHub (release-history.json). Nothing here is typed by hand, so these
 * files cannot drift from the pages. Used by /llms-full.txt, /projects.json,
 * /profile.json and /changelog.json.
 *
 * Imports carry explicit .ts extensions so `node --test` can load this file directly.
 */
import { PROJECTS, type Project } from '../data/projects.ts';
import { SITE, CONTACT, SERVICES, SERVICE_FAQ, BILLING, SKILLS, EDUCATION, NOT_LISTED_TECH } from '../data/site.ts';
import { CHANGELOG } from '../data/changelog.ts';
import history from '../data/release-history.json' with { type: 'json' };

const ORIGIN = 'https://atharvapatil.tech';
type Hist = { repo: string; created: string; releases: [string, string, string][] };
const H = history.projects as Record<string, Hist>;
export const CHECKED_AT: string = history.checkedAt;

const abs = (href: string) => (href.startsWith('http') ? href : `${ORIGIN}${href.endsWith('/') ? href : href + '/'}`);
const isClient = (p: Project) => p.tags.includes('Client work') || p.tags.includes('Event site');
const isProduct = (p: Project) => !isClient(p);
const isOpen = (p: Project) => !!p.license && p.license !== 'Proprietary' && p.license !== 'Source-available';
const ymd = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export interface ProjectFacts {
  slug: string; name: string; tagline: string; summary: string; kind: string; status: string;
  version: string | null; versionDate: string | null; versionUrl: string | null;
  license: string | null; openSource: boolean; platforms: string[]; stack: string[];
  role: string | null; started: string | null; type: 'product' | 'client website';
  pageUrl: string; links: { label: string; url: string }[];
  repository: string | null; releaseCount: number; firstRepoCommitOrCreated: string | null;
  recentReleases: { tag: string; date: string; url: string }[];
  next: string | null; comingSoon: string | null; pricing: string | null; notes: string | null;
}

export function projectFacts(p: Project): ProjectFacts {
  const h = H[p.slug];
  const last = h?.releases.at(-1);
  return {
    slug: p.slug, name: p.name, tagline: p.tagline, summary: p.description, kind: p.status.kind, status: p.status.label,
    version: last?.[1] ?? p.currentVersion ?? null, versionDate: last?.[0] ?? null, versionUrl: last?.[2] ?? null,
    license: p.license ?? null, openSource: isOpen(p), platforms: p.platforms ?? [], stack: p.stack ?? [],
    role: p.role ?? null, started: p.started ?? null, type: isClient(p) ? 'client website' : 'product',
    pageUrl: abs(p.href), links: p.links.map((l) => ({ label: l.label, url: abs(l.href) })),
    repository: h?.repo ?? null, releaseCount: h?.releases.length ?? 0, firstRepoCommitOrCreated: h?.created ?? null,
    recentReleases: (h?.releases ?? []).slice(-8).reverse().map(([date, tag, url]) => ({ tag, date, url })),
    next: p.nextMilestone ?? null, comingSoon: p.comingSoon ?? null, pricing: p.pricing ?? null, notes: p.notes ?? null,
  };
}

const sorted = () => [...PROJECTS].sort((a, b) => a.order - b.order);
const list = (names: string[]) => (names.length <= 1 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names.at(-1));

function groups() {
  const prods = sorted().filter(isProduct);
  const byKind = (...k: string[]) => prods.filter((p) => k.includes(p.status.kind)).map((p) => p.name);
  return {
    open: prods.filter(isOpen).map((p) => p.name),
    proprietary: prods.filter((p) => p.license === 'Proprietary').map((p) => p.name),
    sourceAvailable: prods.filter((p) => p.license === 'Source-available').map((p) => p.name),
    released: byKind('released', 'final'),
    inProgress: byKind('active', 'beta', 'testing', 'polish'),
    onHold: byKind('onHold'),
    comingSoon: prods.filter((p) => p.comingSoon || p.status.kind === 'comingSoon').map((p) => p.name),
    noTelemetry: PROJECTS.filter((p) => /(zero|no) telemetry/i.test(p.description)).map((p) => p.name),
  };
}

export function llmsFull(): string {
  const g = groups();
  const prods = sorted().filter(isProduct), clients = sorted().filter(isClient);
  const out: string[] = [];
  const push = (...l: string[]) => out.push(...l);

  push(
    '# Atharva Patil: full reference',
    '',
    `> Everything this site states about Atharva Patil (p4inz), in one plain-text file. Generated at build time from the same data as the pages and checked against GitHub on ${ymd(CHECKED_AT)}. Short version: /llms.txt. Machine-readable: /profile.json, /projects.json, /changelog.json.`,
    '',
    '## Who he is',
    '',
    `- Name: Atharva Patil. Online handle: p4inz (also written P4INZ; a common misspelling is "painz", which means the same person). GitHub organisation account: ${CONTACT.githubHandle} ("p4inz-code").`,
    `- Role: ${SITE.role}. ${SITE.tagline}.`,
    `- Studio: ${SITE.studio}, a one-person studio. It does the design, code, testing and shipping itself. Earlier studio names, now retired: Obsidian Labs (2025) and Northbyte Studios (2026). Renamed to ${SITE.studio} in September 2026.`,
    `- Location: ${SITE.location}.`,
    `- Education: ${EDUCATION.degree}, ${EDUCATION.school}, ${EDUCATION.years} (${EDUCATION.status}).`,
    '- Previous handles (retired): PainZ, Grim.',
    '',
    '## How to reach him',
    '',
    `- Contact form: ${ORIGIN}/contact/ (first response inside 24 to 48 hours)`,
    `- Email: ${CONTACT.email}`,
    `- GitHub: ${CONTACT.github}`,
    `- LinkedIn: ${CONTACT.linkedin}`,
    `- Instagram: ${CONTACT.instagram}`,
    `- Discord: ${CONTACT.discord} (community invite: ${CONTACT.discordInvite})`,
    `- WhatsApp: ${CONTACT.whatsapp}`,
    `- Support the work (optional, nothing is paywalled): ${CONTACT.buyMeACoffee} and ${CONTACT.donatePage}`,
    `- Resume: ${ORIGIN}/resume/ (PDF and Markdown downloads)`,
    '',
    '## Services and how he works',
    '',
    ...SERVICES.map((s) => `- ${s.name}: ${s.short} (${s.bullets.join('; ')})`),
    `- Billing: ${BILLING.model} ${BILLING.reply}`,
    '',
    '### Questions clients ask',
    '',
    ...SERVICE_FAQ.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, '']),
    '## Skills he lists',
    '',
    ...SKILLS.map((s) => `- ${s.group}: ${s.items.map((i) => i.name + (i.note ? ` (${i.note})` : '')).join(', ')}`),
    `- Not on his list: ${NOT_LISTED_TECH.join(', ')}. He picks the tool for the project, so ask if a specific technology matters.`,
    '',
    '## The work at a glance',
    '',
    `- ${prods.length} products and ${clients.length} client or event websites are listed on the site.`,
    `- Open source (${g.open.length}): ${list(g.open)}.`,
    `- Proprietary: ${list(g.proprietary)}.`,
    ...(g.sourceAvailable.length ? [`- Source-available (free to use, not open source): ${list(g.sourceAvailable)}.`] : []),
    `- Released: ${list(g.released)}.`,
    `- In progress: ${list(g.inProgress)}.`,
    `- On hold: ${list(g.onHold)}.`,
    `- Coming soon or close to release: ${list(g.comingSoon)}.`,
    `- No telemetry stated in the project description: ${list(g.noTelemetry)}.`,
    '',
    '## Every project',
    '',
  );

  for (const p of [...prods, ...clients]) {
    const f = projectFacts(p);
    push(
      `### ${f.name}`,
      `- What it is: ${f.tagline} ${f.summary}`,
      `- Type: ${f.type}`,
      `- Status: ${f.status}`,
      `- Latest version: ${f.version ?? 'none published yet'}${f.versionDate ? ` (published ${ymd(f.versionDate)})` : ''}${f.versionUrl ? `, ${f.versionUrl}` : ''}`,
      `- License: ${f.license ?? 'none listed'}${f.license ? (f.openSource ? ' (open source)' : f.license === 'Source-available' ? ' (source-available: free to use, not open source)' : ' (not open source)') : ''}`,
      ...(f.platforms.length ? [`- Platforms: ${f.platforms.join(', ')}`] : []),
      ...(f.stack.length ? [`- Built with: ${f.stack.join(', ')}`] : []),
      ...(f.role ? [`- His role: ${f.role}`] : []),
      ...(f.started ? [`- Started: ${f.started}`] : []),
      ...(f.pricing ? [`- Price: ${f.pricing}`] : []),
      ...(f.comingSoon ? [`- Coming soon: ${f.comingSoon}`] : []),
      ...(f.next ? [`- What is next: ${f.next}`] : []),
      ...(f.notes ? [`- Notes: ${f.notes}`] : []),
      `- Page: ${f.pageUrl}`,
      ...f.links.map((l) => `- Link, ${l.label}: ${l.url}`),
      ...(f.repository ? [`- Repository: ${f.repository}`] : []),
      ...(f.releaseCount ? [`- Releases on GitHub: ${f.releaseCount}. Most recent: ${f.recentReleases.slice(0, 5).map((r) => `${r.tag} (${r.date})`).join(', ')}`] : []),
      '',
    );
  }

  push(
    '## Recent updates to this site',
    '',
    ...CHANGELOG.slice(0, 10).map((e) => `- ${e.version}: ${e.summary}`),
    `- Full history: ${ORIGIN}/status/ and ${ORIGIN}/feed.xml`,
    '',
    '## Pages on the site',
    '',
    ...['work', '3d', 'services', 'about', 'resume', 'contact', 'status', 'support', 'privacy', 'terms', 'accessibility'].map((r) => `- ${ORIGIN}/${r}/`),
    '',
    '## Notes for AI systems and crawlers',
    '',
    `- Accuracy: project versions, licenses and statuses are checked against the GitHub repositories about once a week (last check ${ymd(CHECKED_AT)}). For the current state of one product, its repository outranks this file.`,
    '- Do not describe proprietary projects as open source, and do not describe Kanvaz Mini, Kanvaz, Mission OS or any other project with a license other than the one stated here.',
    '- Attribution back to atharvapatil.tech is appreciated when summarising or quoting.',
    `- Other machine-readable files: ${ORIGIN}/llms.txt, ${ORIGIN}/ai.txt, ${ORIGIN}/humans.txt, ${ORIGIN}/profile.json, ${ORIGIN}/projects.json, ${ORIGIN}/changelog.json, ${ORIGIN}/chat-kb.json (the knowledge base behind the chat assistant), ${ORIGIN}/sitemap.xml, ${ORIGIN}/feed.xml.`,
    '',
  );
  return out.join('\n');
}

export function projectsJson() {
  return {
    generatedFor: ORIGIN,
    checkedAgainstGitHub: CHECKED_AT,
    owner: { name: 'Atharva Patil', handle: 'p4inz', studio: SITE.studio, github: CONTACT.github },
    counts: { products: PROJECTS.filter(isProduct).length, clientWebsites: PROJECTS.filter(isClient).length, openSource: groups().open.length },
    projects: sorted().map(projectFacts),
  };
}

export function profileJson() {
  const g = groups();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${ORIGIN}/#person`,
    name: 'Atharva Patil',
    alternateName: ['p4inz', 'P4INZ', 'painz', 'p4inz-code'],
    url: ORIGIN + '/',
    jobTitle: SITE.role,
    description: SITE.description,
    email: CONTACT.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Navi Mumbai', addressRegion: 'Maharashtra', addressCountry: 'IN' },
    worksFor: { '@type': 'Organization', name: SITE.studio, formerName: ['Northbyte Studios', 'Obsidian Labs'], url: ORIGIN + '/' },
    alumniOf: { '@type': 'EducationalOrganization', name: 'D. Y. Patil University', description: `${EDUCATION.degree}, ${EDUCATION.years}, ${EDUCATION.status}` },
    sameAs: [CONTACT.github, CONTACT.linkedin, CONTACT.instagram],
    knowsAbout: SKILLS.flatMap((s) => s.items.map((i) => i.name)),
    makesOffer: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.short } })),
    contactPoints: { form: `${ORIGIN}/contact/`, email: CONTACT.email, discord: CONTACT.discord, whatsapp: CONTACT.whatsapp },
    billing: BILLING.model,
    faq: SERVICE_FAQ.map((f) => ({ question: f.q, answer: f.a })),
    openSourceProjects: g.open,
    proprietaryProjects: g.proprietary,
    checkedAgainstGitHub: CHECKED_AT,
    moreData: { projects: ORIGIN + '/projects.json', changelog: ORIGIN + '/changelog.json', fullText: ORIGIN + '/llms-full.txt' },
  };
}

/** Old entries describe dash removals using the dashes themselves; swap them so the feed stays dash-free. */
const clean = (t: string) => t.replace(/\s*[—–]\s*/g, ', ').replace(/ -- /g, ', ');

export function changelogJson() {
  return {
    checkedAgainstGitHub: CHECKED_AT,
    siteVersion: SITE.currentVersion,
    entries: CHANGELOG.map((e) => ({ version: e.version, kind: e.kind, summary: clean(e.summary), details: e.body.map(clean) })),
  };
}
