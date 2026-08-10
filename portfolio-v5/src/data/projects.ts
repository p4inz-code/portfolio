/**
 * Single source of truth for every project on the site.
 * Pages import from here, never hard-code project metadata.
 *
 * Keeping this as TypeScript (not JSON) so we get autocomplete + type-checking
 * on every field, and can compute derived views (featured-only, by-status, etc.)
 * without duplicating data.
 */

export type ProjectStatus =
  | { kind: 'active'; label: string }
  | { kind: 'beta'; label: string }
  | { kind: 'released'; label: string }
  | { kind: 'final'; label: string }
  | { kind: 'polish'; label: string }
  | { kind: 'onHold'; label: string }
  | { kind: 'testing'; label: string }
  | { kind: 'comingSoon'; label: string };

export interface ProjectLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  metaTags: string[];       // shown next to status pill on case study hero
  featured: boolean;        // homepage feature
  order: number;            // sort order (lower = earlier)
  href: string;             // internal route OR external URL
  isExternal: boolean;
  links: ProjectLink[];
  license?: string;
  stack?: string[];
  role?: string;
  started?: string;
  currentVersion?: string;
  nextMilestone?: string;
  notes?: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'mission-os',
    name: 'Mission OS',
    tagline: 'A privacy-first Linux OS built for developers, designers, and systems engineers who ship.',
    description:
      'A privacy-first, offline-first Linux operating system built on Debian Stable and KDE Plasma. Not "another distro." Four pillars: privacy-first, security-conscious, portable-first, offline-first — held to the level of a real product. Designed for the developer who wants their laptop to work without phoning home, the designer who wants a real color-managed KDE desktop without spyware bundled in, and the systems engineer who wants an audit-friendly Debian base with hardened defaults out of the box. No telemetry, ever.',
    status: { kind: 'active', label: 'Active Development' },
    tags: ['Linux', 'GPLv3', 'Privacy'],
    metaTags: ['Debian Stable', 'KDE Plasma', 'QML / Qt', 'GPLv3'],
    featured: true,
    order: 0,
    href: '/mission-os',
    isExternal: false,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/mission-os', external: true }],
    license: 'GPLv3',
    stack: ['QML', 'Qt', 'CMake', 'QtTest', 'CTest', 'GitHub Actions'],
    role: 'Founder / Designer / Developer / Systems Engineer',
    started: '2026',
    currentVersion: 'Pre-release · internal testing',
    nextMilestone: 'First public-testing ISO — release once internal testing signs off',
    notes: 'ISO in internal testing as of August 2026. Public release when the four-pillar acceptance suite is fully green — no fixed date; shipped when it\'s honest to ship.',
  },
  {
    slug: 'nexus',
    name: 'Nexus',
    tagline: 'Your private files, sealed behind one password.',
    description:
      'Encrypted personal vault for Windows. AES-256-GCM authenticated encryption with Argon2id key derivation. Windows Hello unlock, in-app SHA-256-verified updater, portable mode. Fully offline, zero telemetry. Source is proprietary; public repo hosts releases and Discord community only.',
    status: { kind: 'beta', label: 'Public Beta · v10.12.0' },
    tags: ['WPF', 'AES-256-GCM'],
    metaTags: ['Windows Desktop', 'AES-256-GCM', 'Fully Offline'],
    featured: true,
    order: 1,
    href: '/nexus',
    isExternal: false,
    links: [
      { label: 'Releases on GitHub', href: 'https://github.com/p4inz-code/nexus-desktop', external: true },
      { label: 'Join Beta on Discord', href: 'https://discord.gg/XFF5nV53ZJ', external: true },
    ],
    license: 'Proprietary',
    stack: ['C#', '.NET 8', 'WPF', 'AES-256-GCM', 'Argon2id'],
    role: 'Sole engineer',
    started: 'June 2026',
    currentVersion: 'v10.12.0',
    nextMilestone: 'v11 · new UI + final release currently in prep',
    notes: 'Flagship commercial product of Northbyte Studios. Source is proprietary; the public repo hosts releases and community discussion only. v11 (new UI, final-release grade) is in prep — case study will refresh once it ships.',
  },
  {
    slug: 'kanvaz',
    name: 'Kanvaz',
    tagline: 'Your canvas. Your references.',
    description:
      'Visual reference workspace for VFX and 3D artists. Plugin system (Theme Creator ships as the first official plugin), safer .kanvaz zip container with SHA-256 integrity, URL and File reference cards, GitHub Actions CI, opt-in updater. Free forever, MIT-licensed. Dev is winding down; no v5 planned.',
    status: { kind: 'final', label: 'Final Release · v4.2.2' },
    tags: ['Electron', 'MIT'],
    metaTags: ['Electron', 'MIT', 'Open Source'],
    featured: true,
    order: 2,
    href: '/kanvaz',
    isExternal: false,
    links: [
      { label: 'View on GitHub', href: 'https://github.com/p4inz-code/kanvaz', external: true },
      { label: 'Download latest', href: 'https://github.com/p4inz-code/kanvaz/releases/latest', external: true },
    ],
    license: 'MIT',
    stack: ['Electron', 'vanilla JS'],
    role: 'Sole engineer + designer',
    started: 'June 2026',
    currentVersion: 'v4.2.2',
    nextMilestone: 'v4.3.0 stable release, then dev wind-down',
    notes: 'Kanvaz About screenshot in the case study is from a v4.2.1 build; v4.2.2 is what actually ships. v4.3.0 in progress.',
  },
  {
    slug: 'pursue-os',
    name: 'Pursue OS',
    tagline: 'One operating system for the investigation workflow.',
    description:
      'Investigation-focused Linux OS for OSINT, DFIR, secure research, intelligence gathering, and evidence-driven workflows. Two flagship interfaces: Investigation Terminal + Investigation Browser with integrated Tor. Apache 2.0. Built by P4inz. Currently in early implementation — no ISO yet.',
    status: { kind: 'comingSoon', label: 'Coming Soon' },
    tags: ['Linux', 'OSINT', 'Apache 2.0'],
    metaTags: ['Linux', 'OSINT / DFIR', 'Apache 2.0'],
    featured: true,
    order: 3,
    href: '/pursue-os',
    isExternal: false,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/pursue-os', external: true }],
    license: 'Apache 2.0',
    stack: ['Linux', 'Terminal-focused', 'Tor', 'Local AI (optional)'],
    role: 'Creator / Sole developer',
    started: '2026',
    currentVersion: 'Pre-release',
    nextMilestone: 'Core implementation, then first public release',
    notes: 'Not ready for production use. Repository foundation is complete; implementation is starting.',
  },
  {
    slug: 'veris',
    name: 'Veris',
    tagline: 'Investigate. Correlate. Explain. Trust.',
    description:
      'Offline-first, explainable security investigation platform for Windows. Deterministic analysis engine — no black-box AI scoring; AI is intentionally limited to a read-only explanation layer, never performs detection. 3,100+ automated tests.',
    status: { kind: 'polish', label: 'Final Polish · Pre-v1.0.0' },
    tags: ['TypeScript', 'Offline-First'],
    metaTags: ['TypeScript', 'Node.js', 'SQLite', 'Modular Monorepo'],
    featured: false,
    order: 4,
    href: 'https://github.com/p4inz-code/veris',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/veris', external: true }],
    license: 'Proprietary',
    stack: ['TypeScript', 'Node.js', 'SQLite'],
    role: 'Sole engineer',
    started: '29 June 2026',
    currentVersion: 'Pre-v1.0.0',
    nextMilestone: 'v1.0.0 release + public case study with full architecture breakdown (blocked on final production screenshots)',
  },
  {
    slug: 'repo-map',
    name: 'repo-map',
    tagline: 'Understand any codebase in one command.',
    description:
      'Engineering Intelligence Platform. CLI + planned interactive TUI, published on npm as @p4inz-code/repo-map. TypeScript, ESM-first, zero native deps. 870+ tests. MIT.',
    status: { kind: 'onHold', label: 'On Hold · v2.2.0' },
    tags: ['TypeScript', 'CLI', 'npm'],
    metaTags: ['TypeScript', 'CLI', 'MIT'],
    featured: false,
    order: 5,
    href: 'https://github.com/p4inz-code/repo-map',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/repo-map', external: true }],
    license: 'MIT',
    stack: ['TypeScript', 'Node.js standard lib only', 'ESM-first', 'strict mode'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'v2.2.0',
    nextMilestone: 'Resuming interactive TUI work once bandwidth returns',
    notes: 'Live at v2.2.0 on npm. Interactive TUI work is paused for now — no active updates.',
  },
  {
    slug: 'obscura',
    name: 'Obscura',
    tagline: 'Luau AST toolkit for Roblox developers.',
    description:
      'Open-source Luau code protection toolkit for Roblox developers. AST-based transformations, free forever, no telemetry, no vendor lock-in. MIT licensed. Shipped v1.0.0 with the full test suite green — 340/340 passing.',
    status: { kind: 'released', label: 'Released · v1.0.0' },
    tags: ['Luau', 'MIT'],
    metaTags: ['Luau', 'MIT', 'Roblox'],
    featured: false,
    order: 6,
    href: 'https://github.com/p4inz-code/obscura',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/obscura', external: true }],
    license: 'MIT',
    stack: ['Luau', 'AST transformations'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'v1.0.0',
    nextMilestone: 'Maintenance + ongoing feature work driven by community requests',
    notes: 'v1.0.0 shipped with 340/340 tests passing.',
  },
  {
    slug: 'glint',
    name: 'Glint',
    tagline: 'Brightness and volume, sharpened.',
    description:
      'Brightness and volume tray utility for Windows. Clean dark UI, minimal system footprint, free forever. Currently on hold — internal testing paused, no active updates while other projects take priority.',
    status: { kind: 'onHold', label: 'On Hold' },
    tags: ['.NET 8', 'Windows', 'Utility'],
    metaTags: ['.NET 8', 'Avalonia', 'Windows'],
    featured: false,
    order: 7,
    href: 'https://github.com/p4inz-code/glint',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/glint', external: true }],
    license: 'MIT',
    stack: ['C#', '.NET 8', 'Avalonia'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'Internal testing complete',
    nextMilestone: 'Resume when bandwidth returns',
  },
  {
    slug: '3d-ref-skills',
    name: '3D Ref Skills',
    tagline: 'A knowledge graph for 3D and VFX learners.',
    description:
      'An open-source knowledge graph for creative and 3D skill development, for learners and the people who teach them.',
    status: { kind: 'released', label: 'Live · Open Source' },
    tags: ['Open Source', 'Knowledge Graph'],
    metaTags: ['Open Source', 'Knowledge Graph', '3D / VFX'],
    featured: false,
    order: 8,
    href: 'https://github.com/p4inz-code/3d-ref-skills',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/3d-ref-skills', external: true }],
    license: 'MIT',
    stack: ['Open source knowledge graph'],
    role: 'Creator',
    started: '2026',
    currentVersion: 'Stable, maintained',
    nextMilestone: 'Ongoing content expansion',
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured).sort((a, b) => a.order - b.order);
export const SUPPORTING_PROJECTS = PROJECTS.filter((p) => !p.featured).sort((a, b) => a.order - b.order);
export const CASE_STUDY_PROJECTS = PROJECTS.filter((p) => !p.isExternal);
