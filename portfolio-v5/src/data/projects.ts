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
      'A privacy-first, offline-first Linux operating system built on Debian Stable and KDE Plasma. Four pillars: privacy-first, security-conscious, portable-first, offline-first. Ships hardened by default: sysctl hardening and Mission OS\'s Rust system services are enabled automatically during install, no post-install script needed. Installer is Calamares, customized with Mission OS branding and a Python post-install module. No telemetry, ever.',
    status: { kind: 'beta', label: 'Open Beta' },
    tags: ['Linux', 'GPLv3', 'Privacy'],
    metaTags: ['Debian Stable', 'KDE Plasma', 'Rust', 'GPLv3'],
    featured: true,
    order: 0,
    href: '/mission-os',
    isExternal: false,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/mission-os', external: true }],
    license: 'GPLv3',
    stack: ['Debian Stable', 'KDE Plasma (Wayland)', 'Rust', 'Calamares (customized)', 'GitHub Actions'],
    role: 'Founder / Designer / Developer / Systems Engineer',
    started: '2026',
    currentVersion: 'Open Beta',
    nextMilestone: 'Stabilizing the Open Beta toward a numbered release. Roadmap tracked in the repo.',
    notes: 'Shipped as an Open Beta in August 2026. Installer is Calamares (standard Welcome, Locale, Keyboard, Partition, Users, Summary, Finished flow) rather than a fully bespoke installer application; Mission OS-specific hardening runs automatically after the main install completes, via a Python post-install module, not through an interactive trade-off screen.',
  },
  {
    slug: 'nexus',
    name: 'Nexus',
    tagline: 'Your private files, sealed behind one password.',
    description:
      'Encrypted personal vault for Windows. AES-256-GCM authenticated encryption with Argon2id key derivation. Windows Hello unlock, in-app SHA-256-verified updater, portable mode. Fully offline, zero telemetry. Source is proprietary; public repo hosts releases and Discord community only.',
    status: { kind: 'beta', label: 'Public Beta · v10.12.5' },
    tags: ['WPF', 'AES-256-GCM'],
    metaTags: ['Windows Desktop', 'AES-256-GCM', 'Fully Offline'],
    featured: true,
    order: 1,
    href: '/nexus',
    isExternal: false,
    links: [
      { label: 'Releases on GitHub', href: 'https://github.com/p4inz-code/nexus-desktop', external: true },
      { label: 'Join Beta on Discord', href: 'https://discord.gg/8UKt8s5FbW', external: true },
    ],
    license: 'Proprietary',
    stack: ['C#', '.NET 8', 'WPF', 'AES-256-GCM', 'Argon2id'],
    role: 'Sole engineer',
    started: 'March 2026',
    currentVersion: 'v10.12.5',
    nextMilestone: 'v11 · new UI + final release currently in prep',
    notes: 'Flagship commercial product of Northbyte Studios. Source is proprietary; the public repo hosts releases and community discussion only. v11 (new UI, final-release grade) is in prep — case study will refresh once it ships.',
  },
  {
    slug: 'kanvaz',
    name: 'Kanvaz',
    tagline: 'Your canvas. Your references.',
    description:
      'Visual reference workspace for VFX and 3D artists. Plugin system with a local-only MCP Bridge: an AI agent can read and edit the active board through 30 tools, off by default and undo-reversible. Command palette, safer .kanvaz zip container with per-asset integrity hashes, GitHub Actions CI. Free forever, MIT-licensed.',
    status: { kind: 'active', label: 'Active Development · v4.5.1' },
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
    currentVersion: 'v4.5.1',
    nextMilestone: 'Roadmap tracked in the repo\'s CHANGELOG.md — most recent work has centered on the MCP Bridge plugin ecosystem.',
    notes: 'Kanvaz About screenshot in the case study is from a v4.2.1 build; v4.5.1 is what actually ships.',
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
    status: { kind: 'released', label: 'Released · v1.0.0' },
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
    currentVersion: 'v1.0.0',
    nextMilestone: 'Public case study with full architecture breakdown (blocked on final production screenshots)',
  },
  {
    slug: 'ascent',
    name: 'Project Ascent',
    tagline: 'A precision platformer where the only thing between you and the top is your own timing.',
    description:
      'A 25-level, 5-act 2D precision platformer built in Godot 4: full moveset from the start (run, jump, wall-jump, dash, slide, ground pound, wall run, ledge grab, grapple), five boss chases on a visible countdown, and a shared cyberpunk UI across every screen. Offline-first: no accounts, no backend, no ads, no network runtime beyond an optional signed update check. Ships for Windows, macOS, Linux, and browser (playable on itch.io) from one codebase.',
    status: { kind: 'active', label: 'Active Development · v0.14.1' },
    tags: ['Godot 4', 'GDScript', 'Platformer'],
    metaTags: ['Godot 4', 'GDScript', 'Cross-Platform'],
    featured: true,
    order: 4,
    href: '/ascent',
    isExternal: false,
    links: [
      { label: 'Play on itch.io', href: 'https://p4inz-code.itch.io/project-ascent', external: true },
      { label: 'View on GitHub', href: 'https://github.com/p4inz-code/project-ascent', external: true },
    ],
    license: 'Proprietary',
    stack: ['Godot 4', 'GDScript', 'Python (launcher)'],
    role: 'Creative direction, design, and QA (implementation via Claude Code)',
    started: 'August 2026',
    currentVersion: 'v0.14.1',
    nextMilestone: 'Touch controls for mobile are planned next; this release is desktop and browser only.',
    notes: 'Went from first playable (v0.1.0) to a full 25-level campaign with cross-platform exports and PlayStation controller support in about a week. 18 automated test suites, including a full 25-level reachability sweep that measures the player\'s actual jump envelope rather than trusting the configured jump height.',
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
      'Native brightness and volume tray utility for Windows, no Electron, sub-second cold start. Per-monitor brightness over DDC/CI and WMI with automatic hot-plug detection, a master and per-app volume mixer, global hotkeys, and automatic recovery when a monitor drops out. Free forever, zero telemetry.',
    status: { kind: 'released', label: 'Released · v1.1.0' },
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
    currentVersion: 'v1.1.0',
    nextMilestone: 'No committed roadmap beyond the current release.',
  },
  {
    slug: 'mink',
    name: 'MINK',
    tagline: 'A general-purpose programming language, built from first principles.',
    description:
      'A compiled, general-purpose programming language built from the ground up — its own lexer, parser, type system, HIR/MIR, optimizer, and native code generator. Compiles to a standalone x86_64 Windows executable with no external toolchain (no C compiler, assembler, or linker). Rust, Apache 2.0, 1928 tests passing.',
    status: { kind: 'released', label: 'Released · v1.0.0' },
    tags: ['Rust', 'Compilers', 'Systems'],
    metaTags: ['Rust', 'Compiler', 'Apache 2.0'],
    featured: false,
    order: 9,
    href: 'https://github.com/p4inz-code/mink',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/mink', external: true }],
    license: 'Apache 2.0',
    stack: ['Rust', 'x86_64-windows-pe native codegen', 'No external toolchain'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'v1.0.0',
    nextMilestone: 'Roadmap tracked in the repo — Linux/aarch64 targets, concurrency primitives, mink run/test/fmt.',
    notes: 'v1.0.0 shipped 2026-08-24. Full pipeline (parse → type check → HIR → MIR → optimize → codegen) with structs, enums, sum types, pattern matching, generics, and closures. 1928 automated tests.',
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
