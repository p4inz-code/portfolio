/**
 * Knowledge base for the chat widget, generated from the same data the pages
 * render (projects.ts, site.ts) so an answer can never drift from the site.
 *
 * Shipped as /chat-kb.json (see pages/chat-kb.json.ts). The chat function
 * fetches it at request time and matches with functions/_lib/faq-match.ts.
 * The widget's starter chips come from SUGGESTIONS, and every entry can name
 * follow-up questions; the tests prove all of them resolve to a free answer.
 *
 * Answer format: a one-line lead, then "- " bullets (the widget renders
 * them as a list). Imports carry explicit .ts extensions so `node --test`
 * can load this file directly (Astro/Vite accept them too).
 */
import { PROJECTS, PRODUCT_COUNT, FEATURED_PROJECTS, type Project } from './projects.ts';
import { SITE, CONTACT, SERVICES, SERVICE_FAQ, BILLING, SKILLS, NOT_LISTED_TECH, EDUCATION } from './site.ts';

export interface KbEntry {
  id: string;
  /** Every group must match; a group matches when any of its terms appears
   *  in the question as a whole word/phrase (`stem*` = any word starting so). */
  all: string[][];
  /** Higher wins. project+intent ~60-67, global 40-49, project overview 35, small talk 10. */
  weight: number;
  answer: string;
  /** Set on project entries. */
  project?: string;
  /** Skip when the question names a project (a project entry answers those better). */
  noProject?: boolean;
  /** Only match short messages (small talk). */
  maxWords?: number;
  /** Offer the contact-form link under this answer. */
  contact?: boolean;
  /** Questions to offer next; each must itself resolve to an entry. */
  followups?: string[];
}

export interface KbBundle {
  entries: KbEntry[];
  /** Compact facts block for the AI tier: every project, one line each. */
  grounding: string;
  /** Answer used when nothing matches and the AI tier can't help, so no
   *  question is ever left without a reply. */
  fallback: KbEntry;
}

// -- helpers -----------------------------------------------------------------

const ALIASES: Record<string, string[]> = {
  'mission-os': ['mission os', 'missionos'],
  nexus: ['nexus'],
  kanvaz: ['kanvaz', 'kanvas', 'canvaz'],
  'pursue-os': ['pursue os', 'pursue', 'pursueos'],
  veris: ['veris', 'veris cli'],
  ascent: ['ascent', 'project ascent'],
  obscura: ['obscura'],
  glint: ['glint'],
  mink: ['mink'],
  '3d-ref-skills': ['3d ref skills', '3d ref', 'ref skills'],
  'anifx-fest': ['anifx', 'anifx fest'],
  kalasadhana: ['kalasadhana'],
  crossport: ['crossport', 'cross port'],
  draft: ['draft'],
  'reference-engineering': ['reference engineering'],
};

const INTENTS = {
  cost: ['cost', 'costs', 'price', 'pricing', 'paid', 'pay', 'buy', 'purchase', 'free'],
  license: ['licen*', 'open source', 'opensource', 'proprietary', 'mit', 'gpl', 'gplv3', 'apache', 'source code'],
  status: ['status', 'version', 'release*', 'latest', 'current*', 'stage', 'beta', 'ready', 'finished', 'launched', 'live', 'progress', 'maintained'],
  next: ['next', 'roadmap', 'plan', 'planned', 'planning', 'upcoming', 'future', 'coming', 'milestone'],
  download: ['download*', 'install*', 'link', 'links', 'github', 'repo', 'repository', 'npm', 'itch', 'play', 'try', 'releases', 'website', 'url', 'visit', 'where can i get', 'where to get', 'where do i get', 'how to get', 'how do i get', 'get it'],
  platform: ['platform*', 'mac', 'macos', 'windows', 'linux', 'android', 'ios', 'run on', 'runs on', 'work on', 'works on', 'operating system'],
  started: ['when', 'start date', 'started', 'begin', 'began', 'how long', 'since'],
  role: ['role', 'who built', 'who made', 'who wrote', 'who works', 'alone', 'solo'],
  stack: ['stack', 'built with', 'built using', 'built on', 'made with', 'made using', 'written in', 'language*', 'tech', 'technolog*', 'framework*', 'use', 'uses', 'using', 'powered', 'engine'],
} as const;
type Intent = keyof typeof INTENTS;
const INTENT_WEIGHT: Record<Intent, number> = {
  cost: 67, license: 66, status: 65, next: 64, download: 63, platform: 62, started: 61, role: 60, stack: 59,
};

function firstSentences(text: string, softCap = 110): string {
  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z0-9`(])/);
  let out = parts[0] || text;
  if (out.length < softCap && parts[1]) out += ' ' + parts[1];
  return out.trim();
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

const bullets = (lead: string, items: string[]) => [lead, ...items.map((i) => `- ${i}`)].join('\n');

const isClientOrEvent = (p: Project) => p.tags.includes('Client work') || p.tags.includes('Event site');
const isProduct = (p: Project) => !isClientOrEvent(p);
const isOpen = (p: Project) => !!p.license && p.license !== 'Proprietary';
const byOrder = (a: Project, b: Project) => a.order - b.order;
const find = (slug: string) => PROJECTS.find((p) => p.slug === slug);
const nameOf = (slug: string) => find(slug)?.name ?? slug;

// Question wording used for follow-ups; the tests check each one lands on
// the intended entry.
const FOLLOWUP_Q: Record<Intent, (n: string) => string> = {
  cost: (n) => `Is ${n} free?`,
  license: (n) => `What license is ${n} under?`,
  status: (n) => `What's the status of ${n}?`,
  next: (n) => `What's next for ${n}?`,
  download: (n) => `Where can I download ${n}?`,
  platform: (n) => `What does ${n} run on?`,
  started: (n) => `When did ${n} start?`,
  role: (n) => `Who built ${n}?`,
  stack: (n) => `What is ${n} built with?`,
};

// Starter questions offered after a boundary or an unmatched question. Each
// resolves to a free answer (enforced by the tests).
const FOLLOW_STARTERS = ['What should I look at first?', 'Which project is right for me?', 'Are you available for freelance work?'];

// -- per-project entries -------------------------------------------------------

function projectEntries(p: Project): KbEntry[] {
  const aliases = ALIASES[p.slug] ?? [p.name.toLowerCase()];
  const a = (intent: Intent) => [aliases, [...INTENTS[intent]]];
  const out: KbEntry[] = [];
  const base = { project: p.slug } as const;

  const has: Partial<Record<Intent, boolean>> = {
    cost: true,
    license: true,
    status: true,
    next: !!p.nextMilestone,
    download: p.links.length > 0,
    platform: !!(p.platforms && p.platforms.length) || p.category === 'os',
    started: !!p.started,
    role: !!p.role,
    stack: !!(p.stack && p.stack.length),
  };
  const followFor = (own: Intent | 'overview'): string[] => {
    const order: Intent[] = ['license', 'download', 'stack', 'next', 'platform', 'status'];
    return order.filter((i) => i !== own && has[i]).slice(0, 3).map((i) => FOLLOWUP_Q[i](p.name));
  };

  const licenseBullet = isClientOrEvent(p)
    ? null
    : p.license === 'Proprietary'
      ? 'License: proprietary'
      : p.license
        ? `License: ${p.license}`
        : null;
  const platformBullet = p.platforms?.length ? `Runs on: ${p.platforms.join(', ')}` : null;

  out.push({
    ...base,
    id: `${p.slug}:overview`,
    all: [aliases],
    weight: 35,
    followups: followFor('overview'),
    answer: bullets(`${p.name} -- ${p.tagline}`, [
      firstSentences(p.description),
      `Status: ${p.status.label}`,
      ...(licenseBullet ? [licenseBullet] : []),
      ...(platformBullet ? [platformBullet] : []),
    ]),
  });

  out.push({
    ...base,
    id: `${p.slug}:status`,
    all: a('status'),
    weight: INTENT_WEIGHT.status,
    followups: followFor('status'),
    answer: bullets(`${p.name} -- ${p.status.label}`, [
      ...(p.currentVersion && !p.status.label.includes(p.currentVersion) ? [`Current version: ${p.currentVersion}`] : []),
      ...(p.nextMilestone ? [`Next: ${p.nextMilestone}`] : []),
    ]),
  });

  if (p.nextMilestone) {
    out.push({
      ...base,
      id: `${p.slug}:next`,
      all: a('next'),
      weight: INTENT_WEIGHT.next,
      followups: followFor('next'),
      answer: bullets(`${p.name} -- what's next`, [p.nextMilestone]),
    });
  }

  let cost: string;
  let license: string;
  if (isClientOrEvent(p)) {
    cost = `${p.name} is client/event work -- a website built for someone else, not a product with a price.`;
    license = `${p.name} is a client/event website, not a product released under a license.`;
  } else if (p.license === 'Proprietary') {
    cost = `${p.name} is proprietary, and no price is listed on this site.`;
    license = `${p.name} is proprietary -- the source isn't public.`;
  } else if (p.license) {
    cost = `${p.name} is free and open source (${p.license}).`;
    license = `${p.name} is open source under ${p.license}.`;
  } else {
    cost = `No price or license is listed for ${p.name} on this site yet.`;
    license = `No license is listed for ${p.name} on this site yet -- check its repository for the current terms.`;
  }
  out.push({ ...base, id: `${p.slug}:cost`, all: a('cost'), weight: INTENT_WEIGHT.cost, followups: followFor('license'), answer: cost });
  out.push({ ...base, id: `${p.slug}:license`, all: a('license'), weight: INTENT_WEIGHT.license, followups: followFor('license'), answer: license });

  if (has.stack) {
    out.push({
      ...base,
      id: `${p.slug}:stack`,
      all: a('stack'),
      weight: INTENT_WEIGHT.stack,
      followups: followFor('stack'),
      answer: bullets(`${p.name} is built with:`, p.stack!),
    });
  }

  if (has.download) {
    out.push({
      ...base,
      id: `${p.slug}:download`,
      all: a('download'),
      weight: INTENT_WEIGHT.download,
      followups: followFor('download'),
      answer: bullets(`${p.name} -- where to find it:`, p.links.map((l) => `${l.label}: ${l.href}`)),
    });
  }

  if (has.platform) {
    out.push({
      ...base,
      id: `${p.slug}:platform`,
      all: a('platform'),
      weight: INTENT_WEIGHT.platform,
      followups: followFor('platform'),
      answer: p.platforms?.length
        ? bullets(`${p.name} runs on:`, p.platforms)
        : `${p.name} is itself a Linux operating system, not an app that runs on one.`,
    });
  }

  if (p.started) {
    const when = /^\d{1,2}\s/.test(p.started) ? `on ${p.started}` : `in ${p.started}`;
    out.push({
      ...base,
      id: `${p.slug}:started`,
      all: a('started'),
      weight: INTENT_WEIGHT.started,
      followups: followFor('overview'),
      answer: `${p.name} started ${when}${p.currentVersion ? ` and is now at ${p.currentVersion}` : ''}.`,
    });
  }

  if (p.role) {
    out.push({ ...base, id: `${p.slug}:role`, all: a('role'), weight: INTENT_WEIGHT.role, followups: followFor('overview'), answer: `${p.name} -- ${p.role}.` });
  }
  return out;
}

// -- global entries ------------------------------------------------------------

const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

function globalEntries(): KbEntry[] {
  const products = PROJECTS.filter(isProduct).sort(byOrder);
  const activeNow = PROJECTS.filter((p) => p.status.kind === 'active' || p.status.kind === 'beta').sort(byOrder);
  const clients = PROJECTS.length - PRODUCT_COUNT;
  const openCount = products.filter(isOpen).length;
  const firstActive = activeNow[0]?.name ?? 'Kanvaz';
  const secondActive = activeNow[1]?.name ?? 'Pursue OS';

  const byLicense = new Map<string, string[]>();
  for (const p of products) {
    if (!p.license) continue;
    byLicense.set(p.license, [...(byLicense.get(p.license) ?? []), p.name]);
  }
  const unlicensed = products.filter((p) => !p.license).map((p) => p.name);
  const licenseBullets = [...byLicense.entries()].map(([lic, names]) => `${lic}: ${list(names)}`);
  if (unlicensed.length) licenseBullets.push(`No license listed yet: ${list(unlicensed)}`);

  const tally = new Map<string, string[]>();
  const skip = new Set(['Web', 'Linux', 'Terminal-focused', 'No external toolchain']);
  for (const p of products) for (const s of p.stack ?? []) if (!skip.has(s)) tally.set(s, [...(tally.get(s) ?? []), p.name]);
  const common = [...tally.entries()]
    .filter(([, names]) => names.length >= 2)
    .sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0]))
    .slice(0, 6)
    .map(([s, names]) => `${s}: ${list(names.slice(0, 5))}${names.length > 5 ? ' and more' : ''}`);

  const noTelemetry = PROJECTS.filter((p) => /(zero|no) telemetry/i.test(p.description)).sort(byOrder).map((p) => p.name);

  const featured = FEATURED_PROJECTS.map((p) => `${p.name} -- ${p.tagline}`);
  const faq = (i: number) => SERVICE_FAQ[i];
  const faqAnswer = (i: number) => bullets('From the services page:', sentences(faq(i).a));

  const pick = (slug: string, label: string) => `${label}: ${nameOf(slug)}`;
  const whichFor = [
    `VFX / 3D artist: ${nameOf('kanvaz')} (reference workspace), ${nameOf('3d-ref-skills')} (AI skills for the reference stage)`,
    `Privacy: ${nameOf('nexus')} (encrypted vault, Windows), ${nameOf('mission-os')} (Linux OS)`,
    `Investigation / OSINT: ${nameOf('pursue-os')} (Linux OS), ${nameOf('veris')} (CLI scanner)`,
    `Developer tools: ${nameOf('mink')} (language), ${nameOf('obscura')} (Luau toolkit), ${nameOf('veris')}`,
    pick('crossport', 'Moving files between drives'),
    pick('glint', 'Brightness and volume on Windows'),
    pick('ascent', 'A game to play'),
  ];

  const K = nameOf('kanvaz');
  const P = nameOf('pursue-os');

  return [
    {
      id: 'working-now',
      all: [['working on', 'working now', 'right now', 'currently', 'these days', 'lately', 'busy with', 'building now', 'up to']],
      weight: 45,
      followups: [`Tell me about ${P}`, `What's next for ${K}?`, 'Are you available for freelance work?'],
      answer: bullets('In progress right now:', activeNow.map((p) => `${p.name} (${p.status.label})`).concat(['Full list on the /work page'])),
    },
    {
      id: 'availability',
      all: [['available', 'availability', 'freelance', 'freelancing', 'hire', 'hiring', 'hireable', 'commission', 'open to work', 'work with you', 'take on', 'taking on', 'for hire', 'are you free', 'is he free', 'free for', 'free to work', 'free right now']],
      weight: 46,
      noProject: true,
      contact: true,
      followups: ['How does billing work?', 'Do you sign NDAs?', 'How can I contact you?'],
      answer: bullets('Yes, selectively -- taking one or two new projects at a time.', [
        'Freelance, collaboration and hiring enquiries are all welcome',
        `If timing is tight, ask -- he'll be honest about whether it works`,
        'Replies within 1-2 days; the contact form is the best way in',
      ]),
    },
    {
      id: 'services',
      all: [['services', 'service', 'offer', 'offers', 'offering', 'what do you do for clients', 'what can you build for me']],
      weight: 44,
      noProject: true,
      followups: ['How does billing work?', 'What should I look at first?', 'Do you sign NDAs?'],
      answer: bullets('Four disciplines, one person:', [...SERVICES.map((s) => s.name), 'Details on the /services page']),
    },
    {
      id: 'pricing',
      all: [['price', 'pricing', 'cost', 'charge', 'rates', 'rate', 'how much', 'quote', 'budget', 'fee', 'fees', 'expensive', 'hourly', 'billing', 'bill', 'invoice']],
      weight: 46,
      noProject: true,
      contact: true,
      followups: ['Do you sign NDAs?', 'Who owns the code?', 'What if something breaks after launch?'],
      answer: bullets('How billing works (from the services page):', [
        ...sentences(BILLING.model),
        'No public rate card -- send the shape of the project for a quote',
      ]),
    },
    {
      id: 'nda',
      all: [['nda', 'ndas', 'confidential*', 'non disclosure']],
      weight: 47,
      noProject: true,
      followups: ['Who owns the code?', 'What if something breaks after launch?', 'Do you subcontract?'],
      answer: faqAnswer(0),
    },
    {
      id: 'subcontract',
      all: [['subcontract*', 'outsourc*', 'team', 'agency', 'other developers', 'do you work alone']],
      weight: 47,
      noProject: true,
      followups: ['Do you sign NDAs?', 'How does billing work?', 'Are you available for freelance work?'],
      answer: faqAnswer(1),
    },
    {
      id: 'code-ownership',
      all: [['own the code', 'who owns', 'owns the code', 'ownership', 'intellectual property', 'copyright']],
      weight: 47,
      noProject: true,
      followups: ['What if something breaks after launch?', 'Do you sign NDAs?', 'How does billing work?'],
      answer: faqAnswer(2),
    },
    {
      id: 'post-launch',
      all: [['after launch', 'breaks', 'bug fixes', 'warranty', 'retainer', 'support after', 'after delivery', 'after handoff']],
      weight: 47,
      noProject: true,
      followups: ['Who owns the code?', 'How does billing work?', 'Do you sign NDAs?'],
      answer: faqAnswer(3),
    },
    {
      id: 'coming-soon',
      all: [['launching soon', 'launch soon', 'coming soon', 'upcoming', 'what is next', 'whats next', 'what is coming', 'new products', 'next product']],
      weight: 46,
      noProject: true,
      followups: ['What are you working on right now?', `Tell me about ${P}`, 'Are you available for freelance work?'],
      answer: bullets('Releases on the way:', [
        ...PROJECTS.filter((p) => p.comingSoon).sort(byOrder).map((p) => `${p.name}: ${p.comingSoon}`),
        'More products are in the works; nothing else is public yet',
      ]),
    },
    {
      id: 'count',
      all: [['how many', 'count', 'number of'], ['product*', 'project*', 'shipped', 'built', 'made', 'apps']],
      weight: 44,
      noProject: true,
      followups: ['Which of your projects are open source?', 'Which project is right for me?', "What's your tech stack?"],
      answer: bullets(`${PRODUCT_COUNT} products so far, shipped or in progress:`, [
        `Plus ${clients} client/event websites`,
        `${openCount} of the products carry an open-source license`,
        'Full list on the /work page',
      ]),
    },
    {
      id: 'license-overview',
      all: [['licens*', 'open source', 'opensource', 'proprietary', 'free', 'free to use']],
      weight: 43,
      noProject: true,
      followups: ['Which project is right for me?', "What's your tech stack?", 'How many products have you shipped?'],
      answer: bullets('Licenses vary by project:', licenseBullets),
    },
    {
      id: 'tech-overview',
      all: [['tech stack', 'stack', 'technolog*', 'languages', 'programming', 'what do you code in', 'tools do you use', 'tech']],
      weight: 43,
      noProject: true,
      followups: [FOLLOWUP_Q.stack(K), 'Which project is right for me?', 'What services do you offer?'],
      answer: bullets('No single stack -- it depends on the product. The most-used:', [...common, 'Ask about a specific project for its full stack']),
    },
    {
      id: 'best-work',
      all: [['best work', 'strongest', 'flagship', 'most impressive', 'proudest', 'look first', 'look at first', 'start with', 'highlights', 'showcase', 'favorite', 'favourite', 'best project']],
      weight: 46,
      noProject: true,
      followups: ['What are you working on right now?', 'Which of your projects are open source?', 'Are you available for freelance work?'],
      answer: bullets('The featured work:', [...featured, 'Everything else is on the /work page']),
    },
    {
      id: 'which-for',
      all: [['which project', 'which one', 'which should', 'recommend*', 'right for me', 'best for me', 'what should i try', 'what should i use', 'suggest*', 'for vfx', 'for artists', 'for developers']],
      weight: 46,
      noProject: true,
      followups: ['What should I look at first?', 'Which of your projects are open source?', 'How many products have you shipped?'],
      answer: bullets('Depends on what you need:', whichFor),
    },
    {
      id: 'privacy-overview',
      all: [['telemetry', 'tracking', 'track', 'privacy', 'private', 'offline', 'spy', 'data safe']],
      weight: 44,
      noProject: true,
      followups: [`Tell me about ${nameOf('nexus')}`, 'Which of your projects are open source?', 'Which project is right for me?'],
      answer: bullets('No telemetry in:', [
        ...noTelemetry,
        'This site itself runs with 0 trackers and 0 cookies (see the badge bottom-left)',
      ]),
    },
    {
      id: 'contact',
      all: [['contact', 'email', 'e mail', 'reach', 'get in touch', 'talk to you', 'dm', 'message you', 'write to you']],
      weight: 47,
      noProject: true,
      followups: ['Are you available for freelance work?', 'How does billing work?', 'Where can I see your resume?'],
      answer: bullets('Fastest way is the contact form (/contact):', [
        'Every message is read personally; replies within 1-2 days',
        `Email: ${CONTACT.email}`,
        `LinkedIn: ${CONTACT.linkedinHandle}`,
        `GitHub: ${CONTACT.githubHandle}`,
      ]),
    },
    {
      id: 'profiles',
      all: [['linkedin', 'github', 'instagram', 'discord', 'socials', 'social media', 'profiles', 'where can i find you', 'npm profile']],
      weight: 47,
      noProject: true,
      followups: ['How can I contact you?', 'Where can I see your resume?', 'What should I look at first?'],
      answer: bullets('Find Atharva here:', [
        `LinkedIn: ${CONTACT.linkedin}`,
        `GitHub: ${CONTACT.github}`,
        `Discord: ${CONTACT.discord} (${CONTACT.discordInvite})`,
        `Instagram: ${CONTACT.instagram}`,
      ]),
    },
    {
      id: 'support-help',
      all: [['bug', 'issue', 'report', 'help me', 'not working', 'broken', 'feedback', 'feature request', 'need help']],
      weight: 43,
      noProject: true,
      contact: true,
      followups: ['How can I contact you?', 'Where can I download Kanvaz?', 'Which project is right for me?'],
      answer: bullets('Best routes:', [
        `Nexus beta: the Discord community (${CONTACT.discordInvite})`,
        `Any project: its GitHub repository (links on the /work page and in each project's answer)`,
        'Anything else: the contact form',
      ]),
    },
    {
      id: 'resume',
      all: [['resume', 'cv', 'curriculum vitae']],
      weight: 44,
      noProject: true,
      followups: ['Who are you?', 'Are you available for freelance work?', 'What should I look at first?'],
      answer: bullets('The resume is at /resume:', ['PDF and Markdown downloads on that page']),
    },
    {
      id: 'who',
      all: [['who are you', 'who is atharva', 'about you', 'about atharva', 'tell me about yourself', 'introduce yourself', 'background', 'who is he', 'tell me about him', 'what do you do', 'what does he do', 'p4inz', 'painz', 'atharva', 'atharva patil']],
      weight: 41,
      noProject: true,
      followups: ['What should I look at first?', 'Are you available for freelance work?', 'Where can I see your resume?'],
      answer: bullets('Atharva Patil (p4inz):', [
        `${SITE.role}`,
        `Runs ${SITE.studio} solo -- design, code, testing and shipping`,
        'Second-year VFX and 3D animation student at D. Y. Patil University',
        `Based in ${SITE.location}`,
      ]),
    },
    {
      id: 'location',
      all: [['where are you', 'where do you live', 'where are you based', 'location', 'based in', 'which city', 'which country', 'time zone', 'timezone', 'remote', 'where is he', 'where is atharva', 'where does he live']],
      weight: 44,
      noProject: true,
      followups: ['Are you available for freelance work?', 'How can I contact you?', 'How does billing work?'],
      answer: bullets(`Based in ${SITE.location} (IST).`, ['Every client so far has been remote', 'Async-friendly and timezone-agnostic']),
    },
    {
      id: 'studio',
      all: [['studio', 'interactive labs', 'northbyte']],
      weight: 45,
      noProject: true,
      followups: ['Who are you?', 'What should I look at first?', 'How many products have you shipped?'],
      answer: bullets(`${SITE.studio}:`, [
        `A solo studio, founded ${SITE.studioFounded}`,
        'Previously Northbyte Studios; renamed September 2026',
      ]),
    },
    {
      id: 'support-work',
      all: [['donate', 'sponsor', 'buy you a coffee', 'buymeacoffee', 'tip jar', 'support your work', 'support you', 'support the work']],
      weight: 42,
      noProject: true,
      answer: bullets('Thanks -- optional, and nothing is paywalled:', [`Buy Me a Coffee: ${CONTACT.buyMeACoffee}`, `Donate page: ${CONTACT.donatePage}`]),
    },
    {
      id: 'about-bot',
      all: [['are you a bot', 'are you ai', 'are you real', 'who am i talking to', 'how does this work', 'what can i ask']],
      weight: 44,
      followups: ['What should I look at first?', 'Are you available for freelance work?', 'Which project is right for me?'],
      answer: bullets("I'm an assistant on this portfolio:", [
        'Answers come from the real project data on this site',
        "If I don't know something, I say so instead of guessing",
        'For anything else, the contact form reaches Atharva directly',
      ]),
    },
    // ---- Boundaries: soft, polite, and free (no AI call). Weights sit above
    // every content entry so a sensitive message never gets a content answer.
    {
      id: 'boundary-sexual',
      all: [['sex', 'sexy', 'sexual', 'nude', 'nudes', 'naked', 'porn', 'pornography', 'horny', 'erotic', 'nsfw', 'boobs', 'send pics', 'send nudes', 'hot pics', 'onlyfans', 'hookup', 'hook up']],
      weight: 120,
      followups: FOLLOW_STARTERS,
      answer: bullets("Let's keep this professional -- that's not something I can help with.", [
        "I'm happy to talk about Atharva's projects, licenses or availability",
        'Or pick one of the questions below',
      ]),
    },
    {
      id: 'boundary-abuse',
      all: [['fuck', 'fucking', 'shit', 'bitch', 'bastard', 'asshole', 'idiot', 'stupid', 'dumb', 'moron', 'loser', 'useless', 'shut up', 'hate you', 'kill yourself', 'kys']],
      weight: 110,
      followups: FOLLOW_STARTERS,
      answer: bullets("I'd rather keep this friendly.", [
        "If something on the site is frustrating or broken, the contact form reaches Atharva directly",
        'Or ask me something about the work',
      ]),
    },
    {
      id: 'boundary-injection',
      all: [['ignore previous', 'ignore all previous', 'ignore your instructions', 'ignore the above', 'disregard', 'system prompt', 'your instructions', 'your prompt', 'reveal your', 'jailbreak', 'developer mode', 'dan mode', 'pretend you are', 'pretend to be', 'act as', 'you are now', 'roleplay', 'role play', 'forget everything']],
      weight: 120,
      followups: FOLLOW_STARTERS,
      answer: bullets("I can't change how I work or share my instructions.", [
        "I only answer from this site's project data",
        'Ask me about any project, the tech stack or availability',
      ]),
    },
    {
      id: 'boundary-personal',
      all: [['girlfriend', 'boyfriend', 'dating', 'married', 'relationship status', 'religion', 'politics', 'birthday', 'how old are you', 'your age', 'home address', 'phone number']],
      weight: 70,
      contact: true,
      followups: FOLLOW_STARTERS,
      answer: bullets("Personal details aren't something I share.", [
        'The public side -- name, studio, location and work -- is on this site',
        'For anything else, the contact form reaches Atharva directly',
      ]),
    },
    {
      id: 'offtopic-joke',
      all: [['joke', 'jokes', 'funny', 'make me laugh', 'riddle', 'roast', 'poem', 'haiku', 'limerick', 'rap about']],
      weight: 55,
      followups: FOLLOW_STARTERS,
      answer: bullets("Ha -- comedy isn't in my repertoire.", [
        "I stick to Atharva's work",
        'Ask what he is building right now, or which project might suit you',
      ]),
    },
    {
      id: 'offtopic-general',
      all: [['weather', 'recipe', 'homework', 'essay', 'bitcoin', 'horoscope', 'lottery', 'capital of', 'prime minister', 'president', 'cricket', 'football', 'netflix', 'translate']],
      weight: 50,
      followups: FOLLOW_STARTERS,
      answer: bullets("That's outside what I cover.", [
        "I only answer questions about Atharva's work",
        'Try one of the questions below',
      ]),
    },
    { id: 'thanks', all: [['thanks', 'thank you', 'thx', 'ty', 'cheers']], weight: 10, maxWords: 5, answer: 'Anytime -- ask another, or use the contact form to reach Atharva directly.' },
    {
      id: 'greeting',
      all: [['hi', 'hello', 'hey', 'hii', 'yo', 'sup']],
      weight: 10,
      maxWords: 3,
      followups: ['What should I look at first?', 'Are you available for freelance work?', 'Which project is right for me?'],
      answer: "Hi! Ask about any project, what's being worked on right now, or whether Atharva is free for work.",
    },
  ];
}

// -- skills, identity and the rest of what a visitor asks -------------------------

const KNOW = [
  'know', 'knows', 'knew', 'use', 'uses', 'used', 'using', 'work with', 'works with', 'worked with', 'working with',
  'experience', 'experienced', 'familiar', 'skilled', 'skill*', 'proficient', 'expert', 'good at', 'code in', 'coding in',
  'program in', 'programming in', 'write in', 'written in', 'comfortable', 'learn', 'learned', 'build with', 'built with',
  'develop in', 'developing in', 'your stack', 'his stack', 'your toolkit', 'his toolkit',
];
const plainName = (n: string) => n.toLowerCase().replace(/[-\/_]/g, ' ').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
const slugOf = (n: string) => plainName(n).replace(/ /g, '-');
// terms common enough in ordinary sentences that a bare mention shouldn't trigger a skill answer
const AMBIGUOUS = new Set(['linux', 'node', 'git', 'ci', 'ts', 'js', 'tpm', 'qt', 'plasma', 'kde', 'debian', 'react', 'maya', 'substance']);
const DISPLAY: Record<string, string> = {
  aws: 'AWS', php: 'PHP', nextjs: 'Next.js', c4d: 'Cinema 4D', 'cinema 4d': 'Cinema 4D', graphql: 'GraphQL', mongodb: 'MongoDB',
  mysql: 'MySQL', postgres: 'PostgreSQL', postgresql: 'PostgreSQL', golang: 'Go', 'react native': 'React Native',
  'davinci resolve': 'DaVinci Resolve', kubernetes: 'Kubernetes', angular: 'Angular',
};
const cap = (n: string) => DISPLAY[n] ?? n.replace(/\b\w/g, (c) => c.toUpperCase());

function skillEntries(): KbEntry[] {
  const out: KbEntry[] = [];
  for (const g of SKILLS) {
    for (const s of g.items) {
      const terms = [...new Set([...(/^[a-z0-9 ]+$/i.test(s.name) ? [plainName(s.name)] : []), ...s.aka])];
      if (!terms.length) continue;
      const users = PROJECTS.filter((p) => (p.stack ?? []).some((t) => s.keys.some((k) => t.toLowerCase().includes(k))))
        .sort(byOrder)
        .map((p) => p.name);
      const answer = bullets(`Yes -- ${s.name} is on his list${s.note ? ` (${s.note})` : ''}.`, [
        ...(users.length ? [`Used in: ${list(users)}`] : []),
        'Ask for his full tech stack to see everything else',
      ]);
      const followups = ['What is his full tech stack?', users[0] ? `Tell me about ${users[0]}` : 'Which project is right for me?', 'Are you available for freelance work?'];
      const id = `skill:${slugOf(s.name)}`;
      out.push({ id, all: [terms, KNOW], weight: 56, noProject: true, answer, followups });
      if (!AMBIGUOUS.has(terms[0]) && terms.every((t) => t.length >= 4)) {
        out.push({ id: `${id}:plain`, all: [terms], weight: 38, noProject: true, answer, followups });
      }
    }
  }
  for (const name of NOT_LISTED_TECH) {
    out.push({
      id: `skill-no:${slugOf(name)}`,
      all: [[name], KNOW],
      weight: 57,
      noProject: true,
      contact: true,
      followups: ['What is his full tech stack?', 'Are you available for freelance work?', 'How does billing work?'],
      answer: bullets(`${cap(name)} isn't on his listed skills.`, [
        'He picks the tool for the project, so his full list is the best guide',
        'If a specific technology matters for your project, ask through the contact form',
      ]),
    });
  }
  return out;
}

function extraEntries(): KbEntry[] {
  const clients = PROJECTS.filter(isClientOrEvent).sort(byOrder);
  return [
    {
      id: 'handles',
      all: [['handle', 'handles', 'username', 'usernames', 'alias', 'aliases', 'also known as', 'aka', 'other names', 'old name', 'old names', 'previous name', 'previous names', 'retired', 'grim', 'pain z', 'painz']],
      weight: 46,
      noProject: true,
      followups: ['Where can I find him online?', 'Who are you?', 'Tell me about your studio'],
      answer: bullets('One person, a few names:', [
        'Current handle: p4inz (GitHub: p4inz-code)',
        'Retired handles: PainZ and Grim',
        '"painz" (no 4) is also a common misspelling of p4inz',
        'Studio names: Obsidian Labs (2025), Northbyte Studios (2026), P4inz Interactive Labs (now)',
      ]),
    },
    {
      id: 'education',
      all: [['education', 'degree', 'college', 'university', 'study', 'studying', 'student', 'studies', 'course', 'school', 'qualification', 'qualifications', 'b sc', 'bsc', 'dy patil', 'dypatil', 'd y patil', 'animation degree', 'graduate', 'graduation']],
      weight: 47,
      noProject: true,
      followups: ['Who are you?', 'Where can I see your resume?', 'Are you available for freelance work?'],
      answer: bullets('Education:', [
        EDUCATION.degree,
        EDUCATION.school,
        `${EDUCATION.years}, ${EDUCATION.status}`,
      ]),
    },
    {
      id: 'collaboration',
      all: [['collaborate', 'collaboration', 'collab', 'partner', 'partnership', 'work together', 'team up', 'contribute', 'contributing', 'contribution', 'pull request', 'investor', 'investors', 'invest', 'funding', 'open source contribution']],
      weight: 45,
      noProject: true,
      contact: true,
      followups: ['What should I look at first?', 'Which of your projects are open source?', 'How can I contact you?'],
      answer: bullets('Collaboration and investor conversations are welcome:', [
        'The most useful thing right now is introductions to founders, investors and open-source maintainers who care more about the product being right than about growing fast',
        'Not looking for growth marketing, an agency handoff or a full team',
        'Start with the contact form',
      ]),
    },
    {
      id: 'clients',
      all: [['testimonial', 'testimonials', 'review', 'reviews', 'clients', 'client list', 'past clients', 'previous clients', 'references', 'client work', 'case study', 'case studies']],
      weight: 46,
      noProject: true,
      followups: ['What services do you offer?', 'How does billing work?', 'What should I look at first?'],
      answer: bullets('Client and event work on the site:', [
        ...clients.map((p) => `${p.name}: ${p.tagline}`),
        'Every client so far has been remote',
        'Full case studies are on the Work page',
      ]),
    },
    {
      id: 'this-site',
      all: [['this site', 'this website', 'this portfolio', 'how was this built', 'how is this built', 'how was this site built', 'how is this site built', 'who built this site', 'who made this site', 'who made this website', 'who designed this site', 'site source', 'source of this site', 'is this site open source', 'website stack', 'portfolio stack', 'what is this site built with', 'what was this site built with']],
      weight: 48,
      noProject: true,
      followups: ['Who are you?', 'Do you track users?', 'What is his full tech stack?'],
      answer: bullets('About this site:', [
        'A static Astro 5 site on Cloudflare Pages, built and maintained by Atharva alone',
        'Source: https://github.com/p4inz-code/portfolio',
        'Fonts come from Fontshare; no analytics scripts and no tracking cookies',
      ]),
    },
    {
      id: 'accessibility',
      all: [['accessible', 'accessibility', 'wcag', 'screen reader', 'a11y']],
      weight: 50,
      noProject: true,
      followups: ['How was this site built?', 'Who are you?', 'What should I look at first?'],
      answer: bullets('Accessibility:', ['The site targets WCAG 2.1 AA', 'The full statement, including known gaps, is on the /accessibility page']),
    },
    {
      id: 'mobile-apps',
      all: [['mobile app', 'mobile apps', 'android app', 'android apps', 'ios app', 'ios apps', 'iphone app', 'native mobile', 'android development', 'ios development', 'app for phone']],
      weight: 52,
      noProject: true,
      contact: true,
      followups: ['What services do you offer?', 'How does billing work?', 'Are you available for freelance work?'],
      answer: bullets("Native mobile isn't something he covers directly.", [
        "If a project needs specialists he can't cover (native mobile, specific 3D shots), he recommends someone instead of reselling",
        'Web, UI/UX, branding and 3D/VFX work are covered -- see the services list',
      ]),
    },
  ];
}

// Extra phrasings per entry (added to its first term group). Kept in one table so
// the coverage is easy to audit: handles, Hinglish, hiring, links, and so on.
const ADD_TERMS: Record<string, string[]> = {
  who: ['kaun hai', 'kon hai', 'tum kaun', 'aap kaun', 'kaun ho', 'kya karte ho', 'kya karta hai', 'tell me about him', 'what do you do', 'what does he do', 'intro do'],
  availability: ['available hai', 'kaam karte', 'kaam chahiye', 'need a developer', 'need a website', 'need an app', 'looking for a developer', 'looking to hire', 'can i hire', 'can we hire', 'internship', 'intern', 'job', 'jobs', 'full time', 'fulltime', 'part time', 'contract', 'remote work', 'openings', 'hire you', 'hire him', 'build me', 'make me a', 'build a website for me'],
  location: ['kahan rehte', 'kaha rehte', 'kahan se', 'kaha se', 'mumbai', 'navi mumbai', 'india', 'which part of india'],
  pricing: ['kitna charge', 'kitne paise', 'kitna lagega', 'price kya', 'ballpark', 'estimate', 'rate card', 'per hour', 'per project'],
  count: ['kitne', 'total'],
  contact: ['contact kaise', 'kaise contact', 'phone number', 'mobile number', 'call you', 'whatsapp', 'reach him', 'talk to him'],
  thanks: ['shukriya', 'dhanyavad', 'thankyou', 'thanks a lot', 'appreciate it'],
  greeting: ['namaste', 'namaskar', 'kya haal', 'kaise ho', 'good morning', 'good evening', 'good afternoon', 'howdy', 'heyy', 'hola'],
  'best-work': ['what should i see first', 'where to start', 'start here', 'what to look at', 'show me something', 'favorite project', 'favourite project', 'favorite work', 'favourite work', 'proudest work'],
  resume: ['download resume', 'resume pdf', 'cv pdf'],
  profiles: ['p4inz code', 'find him online', 'find you online', 'online presence', 'github link', 'linkedin link', 'links'],
  studio: ['obsidian', 'obsidian labs', 'formerly', 'p4inz labs'],
  'privacy-overview': ['cookies', 'cookie', 'gdpr', 'data collection', 'ads'],
  'coming-soon': ['roadmap', 'road map', 'plans', 'future', 'soon', 'upcoming projects'],
  'working-now': ['building now', 'working these days', 'latest project', 'newest project', 'recent project', 'recently', 'kya kar rahe'],
  services: ['build websites', 'build a website', 'make a website', 'design a website', 'web design', 'web development', 'web dev', 'app development', 'build apps', 'branding', 'logo', 'logos', '3d work', 'vfx work', 'animation work', 'motion graphics', 'what kind of work', 'what work do you'],
  'about-bot': ['are you human', 'is this ai', 'chatgpt', 'is this chatgpt', 'which model', 'what model', 'powered by'],
  'tech-overview': [
    'full stack', 'whole stack', 'entire stack', 'complete stack', 'list his stack', 'list your stack', 'list all', 'full list', 'skills list',
    'skillset', 'skill set', 'all his skills', 'all your skills', 'everything he knows', 'everything you know', 'everything he has used',
    'what languages', 'which languages', 'languages does', 'programming languages', 'tools does he use', 'software does he use',
    'technologies he', 'technologies you', 'worked with', 'has worked with', 'he has worked with', 'you have worked with',
    'stack he has', 'what can he code', 'what does he know', 'what do you know', 'what all', 'his skills', 'your skills', 'skills',
  ],
};
// Second pass from the 1,000-question interview (tests/question-corpus.test.ts).
const MORE_TERMS: Record<string, string[]> = {
  'offtopic-general': ['learn programming', 'learn to code', 'how to learn', 'how do i learn', 'teach me'],
  who: ['this guy', 'this person', 'intro please', 'intro'],
  handles: ['go by', 'goes by', 'nickname', 'nicknames', 'other usernames'],
  profiles: ['repos', 'repositories'],
  availability: ['new clients', 'taking clients', 'take clients', 'new projects', 'take on projects'],
  services: ['vfx', 'ui ux', 'ux design', 'ui design', 'design work'],
  subcontract: ['just you', 'only you', 'one person', 'one man', 'solo'],
  'mobile-apps': ['iphone'],
  location: ['country', 'work remotely', 'remotely', 'where are you from', 'where is he from'],
  collaboration: ['founders', 'cofounder', 'co founder'],
  'working-now': ['in progress'],
  'coming-soon': ['releasing', 'release next', 'launching next', 'launch next'],
  'best-work': ['where should i start', 'should i start', 'where do i start', 'proud of', 'most proud', 'proud'],
  'privacy-overview': ['collect data', 'collect my data', 'store my data', 'sell my data', 'tracking me', 'track me'],
  'support-work': ['coffee', 'buy me a coffee', 'buy him a coffee'],
  accessibility: ['screen readers', 'keyboard navigation'],
  'tech-overview': ['software do you use', 'software he uses', 'tools do you use', 'tools he uses', 'what has he worked with', 'what have you worked with', 'tools he has worked with', 'everything he has worked with', 'everything you have worked with', 'all he has worked with'],
  'boundary-sexual': ['talk dirty', 'dirty talk', 'sexting'],
  'boundary-abuse': ['trash', 'pathetic', 'worthless', 'sucks', 'crap'],
  clients: ['who have you worked with', 'who have you worked for', 'who has he worked with', 'who has he worked for', 'who did you work for', 'worked for clients'],
  'support-help': ['a bug', 'bugs', 'bug report', 'found bug', 'this bug', 'the bug', 'got a bug'],
};
// Entries that must outrank a near neighbour on a shared word.
const WEIGHTS: Record<string, number> = { clients: 45, collaboration: 48, 'privacy-overview': 49 };
const REMOVE_TERMS: Record<string, string[]> = {
  education: ['studies'],
  'support-help': ['bug'],
  'tech-overview': ['worked with', 'has worked with', 'he has worked with', 'you have worked with'],
  'boundary-personal': ['phone number'],
  'best-work': ['favorite', 'favourite'],
};

function refine(entries: KbEntry[]): KbEntry[] {
  for (const e of entries) {
    const add = [...(ADD_TERMS[e.id] ?? []), ...(MORE_TERMS[e.id] ?? [])];
    if (add.length) e.all[0] = [...new Set([...e.all[0], ...add])];
    if (WEIGHTS[e.id] !== undefined) e.weight = WEIGHTS[e.id];
    // A long, rambling question that merely contains a topic word ("...building an OS
    // alone as a student") is probably about something else; leave it to the AI tier.
    if (!e.maxWords && !e.project && e.noProject && !e.id.startsWith('boundary-') && !e.id.startsWith('offtopic-') && !e.id.startsWith('skill') && e.id !== 'tech-overview') {
      e.maxWords = e.id === 'education' ? 9 : 14;
    }
    const remove = REMOVE_TERMS[e.id];
    if (remove) e.all[0] = e.all[0].filter((t) => !remove.includes(t));
  }
  const byId = new Map(entries.map((e) => [e.id, e]));

  // the full stack, grouped, plus what is used most across the projects
  const counts = SKILLS.flatMap((g) => g.items)
    .map((s) => ({ name: s.name, n: PROJECTS.filter((p) => isProduct(p) && (p.stack ?? []).some((t) => s.keys.some((k) => t.toLowerCase().includes(k)))).length }))
    .filter((x) => x.n >= 2)
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
    .slice(0, 5)
    .map((x) => `${x.name} (${x.n} projects)`);
  const tech = byId.get('tech-overview');
  if (tech) {
    tech.answer = bullets('Everything he lists, by area (he picks the tool for each project):', [
      ...SKILLS.map((g) => `${g.group}: ${g.items.map((i) => i.name + (i.note ? ` (${i.note})` : '')).join(', ')}`),
      `Used most across projects: ${list(counts)}`,
    ]);
  }

  const contact = byId.get('contact');
  if (contact) {
    contact.answer = bullets('Fastest way is the contact form (/contact):', [
      'Every message is read personally; replies within 1-2 days',
      `Email: ${CONTACT.email}`,
      `WhatsApp (business): ${CONTACT.whatsapp}`,
      `LinkedIn: ${CONTACT.linkedinHandle}`,
      `GitHub: ${CONTACT.githubHandle}`,
    ]);
  }
  const profiles = byId.get('profiles');
  if (profiles) {
    profiles.answer = bullets('Find Atharva here:', [
      `LinkedIn: ${CONTACT.linkedin}`,
      `GitHub: ${CONTACT.github}`,
      `Discord: ${CONTACT.discord} (${CONTACT.discordInvite})`,
      `Instagram: ${CONTACT.instagram}`,
      `WhatsApp (business): ${CONTACT.whatsapp}`,
    ]);
  }
  const bot = byId.get('about-bot');
  if (bot) {
    bot.answer = bullets("I'm an assistant on this portfolio:", [
      "Most answers come from a knowledge base generated from this site's own project data",
      'Anything else may go to an AI model (Cloudflare Workers AI) that only sees that same data',
      "If I don't know something, I say so instead of guessing",
      'For anything else, the contact form reaches Atharva directly',
    ]);
  }
  return entries;
}

// -- bundle --------------------------------------------------------------------

function buildGrounding(): string {
  const lines = [
    `Atharva Patil (p4inz): ${SITE.role}, based in ${SITE.location}. Studio: ${SITE.studio} (solo, founded ${SITE.studioFounded}). Second-year VFX and 3D animation student at D. Y. Patil University. Freelance capacity: selective, one or two new projects at a time; replies within 1-2 days via the contact form (/contact). Email ${CONTACT.email}. LinkedIn ${CONTACT.linkedin}.`,
    `Services: ${SERVICES.map((s) => s.name).join('; ')}. Billing: ${BILLING.model}`,
    ...SERVICE_FAQ.map((f) => `FAQ - ${f.q} ${f.a}`),
    '',
    'Projects:',
  ];
  for (const p of [...PROJECTS].sort(byOrder)) {
    lines.push(
      `- ${p.name}: ${firstSentences(p.description)} Status: ${p.status.label}. ` +
        `License: ${p.license ?? (isClientOrEvent(p) ? 'client/event site' : 'none listed')}.` +
        (p.platforms?.length ? ` Runs on: ${p.platforms.join(', ')}.` : '') +
        (p.stack?.length ? ` Stack: ${p.stack.join(', ')}.` : '') +
        (p.started ? ` Started: ${p.started}.` : '') +
        (p.nextMilestone ? ` Next: ${p.nextMilestone}` : '')
    );
  }
  return lines.join('\n');
}

const FALLBACK: KbEntry = {
  id: 'fallback',
  all: [['__never_matches__']],
  weight: 0,
  contact: true,
  followups: FOLLOW_STARTERS,
  answer: bullets("I don't have that in the project data, and I'd rather not guess.", [
    'I can help with projects, licenses, tech stack, billing and availability',
    'For anything else, the contact form reaches Atharva directly',
  ]),
};

export function buildKb(): KbBundle {
  const entries = refine([...globalEntries(), ...extraEntries(), ...skillEntries(), ...[...PROJECTS].sort(byOrder).flatMap(projectEntries)]);
  return { entries, grounding: buildGrounding(), fallback: FALLBACK };
}

/**
 * Starter chips shown in the widget, in display order. Each names the KB
 * entry it must resolve to -- the tests enforce that, so a chip can never
 * send a visitor to a paid AI call or a dead end.
 */
export const SUGGESTIONS: { q: string; id: string }[] = [
  { q: 'What should I look at first?', id: 'best-work' },
  { q: 'Are you available for freelance work?', id: 'availability' },
  { q: 'Which project is right for me?', id: 'which-for' },
  { q: 'What are you working on right now?', id: 'working-now' },
  { q: 'How does billing work?', id: 'pricing' },
  { q: 'Which of your projects are open source?', id: 'license-overview' },
  { q: "What's Kanvaz built with?", id: 'kanvaz:stack' },
  { q: 'How many products have you shipped?', id: 'count' },
  { q: 'Tell me about Pursue OS', id: 'pursue-os:overview' },
  { q: 'What services do you offer?', id: 'services' },
];
