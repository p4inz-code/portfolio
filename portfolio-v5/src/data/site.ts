/**
 * Site-level metadata — the person, the studio, contact channels,
 * services offered. Single source of truth so nothing drifts.
 */

export const SITE = {
  title: 'Atharva Patil',
  role: 'Software engineer, founder of Northbyte Studios',
  tagline: 'Software during the day, 3D and VFX on the side',
  // Meta description — 140 chars (was 148, SEO audit flagged >920px pixel width).
  description:
    'Atharva Patil — solo founder of Northbyte Studios. Privacy-first software, two Linux OSes, encrypted vault, dev tools, 3D/VFX.',
  location: 'Navi Mumbai, India',
  studio: 'Northbyte Studios',
  studioFounded: '2026',
  currentVersion: 'v5.17.6',
  domain: 'atharvapatil.tech',
} as const;

export const CONTACT = {
  email: 'atharva.patil.cg@gmail.com',
  github: 'https://github.com/p4inz-code',
  githubHandle: 'github.com/p4inz-code',
  discord: 'p4inz',
  discordInvite: 'https://discord.gg/8UKt8s5FbW',
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
    bullets: ['Marketing & portfolio sites', 'Product dashboards & internal tools', 'Astro / Next.js / TypeScript builds'],
    cta: { label: 'See it in Kanvaz →', href: '/kanvaz' },
  },
  {
    slug: 'ui-ux',
    name: 'UI / UX & Product Design',
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
    name: '3D / VFX & Visualization',
    short: 'Renders, lighting studies, and motion work, for product showcases, brand visuals, or standalone pieces.',
    bullets: ['Product renders', 'Lighting studies', 'Motion + camera work'],
    cta: { label: 'See the 3D / VFX page →', href: '/3d' },
  },
];

export interface NavLink {
  label: string;
  href: string;
  cta?: boolean;
}

export const NAV: NavLink[] = [
  { label: 'Work', href: '/work' },
  { label: '3D / VFX', href: '/3d' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
  { label: 'Get in touch', href: '/contact', cta: true },
];
