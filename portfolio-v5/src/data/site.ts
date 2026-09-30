/**
 * Site-level metadata — the person, the studio, contact channels,
 * services offered. Single source of truth so nothing drifts.
 */

export const SITE = {
  title: 'Atharva Patil',
  role: 'Software engineer, founder of P4inz Interactive Labs',
  tagline: 'Software during the day, 3D and VFX on the side',
  // Meta description — includes "p4inz" (the actual search handle) once,
  // naturally, not stuffed. Homepage <title> stays clean/short on purpose;
  // this is the room to state the alias.
  description:
    'Atharva Patil (p4inz) — solo founder of P4inz Interactive Labs. Privacy-first software, two Linux OSes, encrypted vault, dev tools, 3D/VFX.',
  location: 'Navi Mumbai, India',
  // v5.29.0: renamed from Northbyte Studios. Third studio name overall
  // (Obsidian Labs 2025 -> Northbyte Studios mid-2026 -> this, Sept 2026) —
  // see about.astro's timeline/identity sections for the full history.
  studio: 'P4inz Interactive Labs',
  studioFounded: '2026',
  currentVersion: 'v5.47.0',
  domain: 'atharvapatil.tech',
  // Sitewide meta-keywords fallback — covers name/handle variants people
  // actually type (including the retired "painz" spelling and the
  // previous studio name, since people may still search it) so search
  // engines have a baseline signal on every page even without a
  // per-page override. Individual pages pass a more specific list via
  // BaseLayout's `keywords` prop.
  keywords:
    'Atharva Patil, p4inz, P4INZ, painz, P4inz Interactive Labs, Northbyte Studios, software engineer, web developer, app developer, CLI developer, game developer, 3D artist, VFX artist',
} as const;

export const CONTACT = {
  email: 'atharva.patil.cg@gmail.com',
  github: 'https://github.com/p4inz-code',
  githubHandle: 'github.com/p4inz-code',
  linkedin: 'https://www.linkedin.com/in/p4inz',
  linkedinHandle: 'linkedin.com/in/p4inz',
  instagram: 'https://instagram.com/atharva.patil.cg',
  discord: 'p4inz',
  discordInvite: 'https://discord.gg/8UKt8s5FbW',
  buyMeACoffee: 'https://buymeacoffee.com/p4inz',
  donatePage: 'https://p4inz-code.github.io/donate/',
} as const;

export interface Service {
  slug: string;
  name: string;
  short: string;
  bullets: string[];
  cta?: { label: string; href: string };
}

export const SERVICES: Service[] = [
  {
    slug: 'product',
    name: 'Product & Web Development',
    short: 'Full-stack builds for products and marketing sites, from first line of code to a deployed, maintainable system.',
    bullets: ['Marketing & portfolio sites', 'Product dashboards & internal tools', 'Astro, Next.js and TypeScript builds'],
    cta: { label: 'See it in Kanvaz →', href: '/kanvaz' },
  },
  {
    slug: 'ui-ux',
    name: 'UI, UX & Product Design',
    short: 'Interfaces designed for clarity first, wireframes through to high-fidelity, production-ready design systems.',
    bullets: ['Product & marketing interfaces', 'Design systems + tokens', 'User flows and prototypes'],
    cta: { label: 'See it in Nexus →', href: '/nexus' },
  },
  {
    slug: 'brand',
    name: 'Branding & Visual Identity',
    short: 'Logo systems, color and type direction, and the visual language that makes a brand recognizable at a glance.',
    bullets: ['Logo systems', 'Color + typographic direction', 'Brand books and guidelines'],
    cta: { label: 'See it in Mission OS →', href: '/mission-os' },
  },
  {
    slug: '3d-vfx',
    name: '3D & VFX & Visualization',
    short: 'Renders, lighting studies, and motion work, for product showcases, brand visuals, or standalone pieces.',
    bullets: ['Product renders', 'Lighting studies', 'Motion + camera work'],
    cta: { label: 'See the 3D & VFX page →', href: '/3d' },
  },
];

/**
 * The services-page FAQ, written by the owner. Single source: the page
 * renders it as FAQPage schema, and the chat answers from it verbatim.
 */
export const SERVICE_FAQ = [
  { q: 'Do you sign NDAs?', a: "Yes, for real client work. Not for portfolio reviews or evaluation calls: those aren't confidential." },
  { q: 'Do you subcontract?', a: "No. Everything I ship is me. If a project needs specialists I can't cover (native mobile, specific 3D shots), I recommend, not resell." },
  { q: 'Who owns the code?', a: 'You do, on delivery. I keep the right to reference the work in this portfolio unless you specifically ask me not to.' },
  { q: 'What if something breaks after launch?', a: '30 days of free bug-fixes on any build I ship. Beyond that, small retainer or per-fix.' },
  { q: 'Are you available right now?', a: "Selective: taking one or two new projects at a time. If timing is tight, ask; I'll be honest about whether I can hit it." },
] as const;

/** Billing model as stated on the services page. */
export const BILLING = {
  model: 'Fixed price for short-loop work. Weekly for longer builds. Never per-hour.',
  reply: 'First response inside 24-48h.',
} as const;

export interface NavLink {
  label: string;
  href: string;
  cta?: boolean;
}

export const NAV: NavLink[] = [
  { label: 'Work', href: '/work' },
  { label: '3D & VFX', href: '/3d' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
  { label: 'Get in touch', href: '/contact', cta: true },
];
