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
  /** Real media for the showcase. 'banner' = brand art from the project README,
   *  'mockup' = design-deck slide, 'screenshot' = real UI capture,
   *  'video' = real screen recording (src is the poster frame). */
  media?: {
    src: string;
    alt: string;
    kind: 'banner' | 'mockup' | 'screenshot' | 'video';
    ratio: string;
    label?: string;
    video?: { mp4: string; webm: string };
  };
  /** Sub-theme applied on the showcase chapter and on the project's own page. */
  scene?: 'nexus' | 'kanvaz' | 'ascent';
}

export const PROJECTS: Project[] = [
  {
    slug: 'mission-os',
    name: 'Mission OS',
    tagline: 'A privacy-first Linux OS built for developers, designers, and systems engineers who ship.',
    description:
      'A privacy-first, offline-first Linux operating system built on Debian Stable and KDE Plasma. Four pillars: privacy-first, security-conscious, portable-first, offline-first. Ships hardened by default: sysctl hardening and Mission OS\'s Rust system services are enabled automatically during install, no post-install script needed. Installer is Calamares, customized with Mission OS branding and a Python post-install module. No telemetry, ever.',
    status: { kind: 'onHold', label: 'On Hold · Open Beta' },
    tags: ['Linux', 'GPLv3', 'Privacy'],
    metaTags: ['Debian Stable', 'KDE Plasma', 'Rust', 'GPLv3'],
    featured: true,
    order: 3,
    href: '/mission-os',
    isExternal: false,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/mission-os', external: true }],
    license: 'GPLv3',
    stack: ['Debian Stable', 'KDE Plasma (Wayland)', 'Rust', 'Calamares (customized)', 'GitHub Actions'],
    role: 'Founder / Designer / Developer / Systems Engineer',
    started: '2026',
    currentVersion: 'Open Beta',
    nextMilestone: 'On hold while other products take priority. Roadmap tracked in the repo for when work resumes.',
    notes: 'Shipped as an Open Beta in August 2026, then paused. Installer is Calamares (standard Welcome, Locale, Keyboard, Partition, Users, Summary, Finished flow) rather than a fully bespoke installer application; Mission OS-specific hardening runs automatically after the main install completes, via a Python post-install module, not through an interactive trade-off screen.',
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
    order: 0,
    media: { src: '/assets/nexus/nexus-v11-01-card.webp', alt: 'Nexus v11 lock screen mockup: a split window with the Nexus brand and four trust pillars on the left, and an Unlock your vault form with Windows Hello on the right.', kind: 'mockup', ratio: '1400 / 883', label: 'v11 design mockup' },
    scene: 'nexus',
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
      'Visual reference workspace for VFX and 3D artists. Live 3D model preview (glTF, OBJ, FBX, STL, USD, and more), typed connections with a Map View, shared cards across boards, a Layers panel, and 14 board templates. Plugin system with a local-only MCP Bridge: an AI agent can read and edit the active board, off by default and undo-reversible. Windows, macOS and Linux builds. Free forever, MIT-licensed.',
    status: { kind: 'active', label: 'Active · v8.8.5' },
    tags: ['Electron', 'MIT'],
    metaTags: ['Electron', 'MIT', 'Open Source'],
    featured: true,
    order: 1,
    media: { src: '/assets/kanvaz/kanvaz-showcase-dark.webp', alt: 'Kanvaz reference board in the dark theme: image, note, color and URL cards joined by a Related To connection.', kind: 'screenshot', ratio: '1960 / 1224', label: 'Real capture · v7.26.0' },
    scene: 'kanvaz',
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
    currentVersion: 'v8.8.5',
    nextMilestone: 'Shipping most weeks, driven by user feedback. No fixed roadmap.',
    notes: 'v8.8.5 is the latest published release (Windows, macOS arm64 and Linux builds). The main branch is already at v8.9.8 with Presentation Mode, Layers panel highlight/grouping and template connections, awaiting release. The About screenshot in the case study is from an older v4.2.1 build.',
  },
  {
    slug: 'pursue-os',
    name: 'Pursue OS',
    tagline: 'One operating system for the investigation workflow.',
    description:
      'Investigation-focused Linux OS for OSINT, DFIR, secure research, intelligence gathering, and evidence-driven workflows. Two flagship interfaces: Investigation Terminal + Investigation Browser with integrated Tor. Apache 2.0. Built by P4inz. On hold mid-implementation, no ISO yet.',
    status: { kind: 'onHold', label: 'On Hold · Pre-release' },
    tags: ['Linux', 'OSINT', 'Apache 2.0'],
    metaTags: ['Linux', 'OSINT / DFIR', 'Apache 2.0'],
    featured: true,
    order: 4,
    href: '/pursue-os',
    isExternal: false,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/pursue-os', external: true }],
    license: 'Apache 2.0',
    stack: ['Linux', 'Terminal-focused', 'Tor', 'Local AI (optional)'],
    role: 'Creator / Sole developer',
    started: '2026',
    currentVersion: 'Pre-release',
    nextMilestone: 'On hold while other products take priority. Core implementation resumes before a first public release.',
    notes: 'Not ready for production use. Case-store layer (traits, in-memory and file-backed) is the most recent work before development paused.',
  },
  {
    slug: 'veris',
    name: 'Veris',
    tagline: 'Investigate. Correlate. Explain. Trust.',
    description:
      'Offline-first, explainable security investigation platform for Windows. Deterministic analysis engine: no black-box AI scoring; AI is intentionally limited to a read-only explanation layer, never performs detection. 3,100+ automated tests.',
    status: { kind: 'onHold', label: 'On Hold · Released v1.0.0' },
    tags: ['TypeScript', 'Offline-First'],
    metaTags: ['TypeScript', 'Node.js', 'SQLite', 'Modular Monorepo'],
    featured: false,
    order: 4,
    media: { src: '/assets/banners/veris.webp', alt: 'Veris banner art: a dark desk with a monitor showing an investigation session for sample.exe, with the title Veris, Explainable Investigation Platform.', kind: 'banner', ratio: '16 / 9' },
    href: 'https://github.com/p4inz-code/veris',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/veris', external: true }],
    license: 'Proprietary',
    stack: ['TypeScript', 'Node.js', 'SQLite'],
    role: 'Sole engineer',
    started: '29 June 2026',
    currentVersion: 'v1.0.0',
    nextMilestone: 'Stable v1.0.0 is out. On hold while other products take priority; public case study blocked on the same pause.',
  },
  {
    slug: 'ascent',
    name: 'Project Ascent',
    tagline: 'A precision platformer where the only thing between you and the top is your own timing.',
    description:
      'A 25-level, 5-act 2D precision platformer built in Godot 4: full moveset from the start (run, jump, wall-jump, dash, slide, ground pound, wall run, ledge grab, grapple), five boss chases on a visible countdown, and a shared cyberpunk UI across every screen. Offline-first: no accounts, no backend, no ads, no network runtime beyond an optional signed update check. Ships for Windows, macOS, Linux, and browser (playable on itch.io) from one codebase.',
    status: { kind: 'polish', label: 'Visual Polish Phase · v0.14.1' },
    tags: ['Godot 4', 'GDScript', 'Platformer'],
    metaTags: ['Godot 4', 'GDScript', 'Cross-Platform'],
    featured: true,
    order: 2,
    media: { src: '/assets/ascent/ascent-loop-poster.webp', alt: 'Project Ascent gameplay, Level 10 Master Escape: a small blue runner leaping up a staircase of platforms under a full moon while red creatures chase from below.', kind: 'video', ratio: '1600 / 646', label: 'Real gameplay · Level 10', video: { mp4: '/assets/ascent/ascent-loop.mp4', webm: '/assets/ascent/ascent-loop.webm' } },
    scene: 'ascent',
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
    nextMilestone: 'Core development is done. A real character/monster enemy is planned, alongside visual polish expected to continue for at least the next two months.',
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
    media: { src: '/assets/banners/obscura.webp', alt: 'Obscura banner art: a dark desk with a monitor showing an AST visualizer and transformation pipeline, with the title Obscura, Luau Protection Toolkit.', kind: 'banner', ratio: '16 / 9' },
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
      'A compiled, general-purpose programming language built from the ground up: its own lexer, parser, type system, HIR/MIR, optimizer, and native code generator. Compiles to a standalone x86_64 Windows executable with no external toolchain (no C compiler, assembler, or linker). Statically linked, no VC++ Redistributable needed. Rust, Apache 2.0.',
    status: { kind: 'released', label: 'Released · v1.0.1' },
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
    currentVersion: 'v1.0.1',
    nextMilestone: 'Linux is the next platform target. Unreleased work on main since v1.0.1 adds async fn/await, non-blocking I/O and a package manifest/resolver; roadmap tracked in the repo.',
    notes: 'v1.0.0 shipped 2026-08-24 with 1928 compiler tests passing. v1.0.1 added static CRT linking, a mink run command, and completed environment, process, and filesystem standard-library coverage (Win32 API, full test suites per library).',
  },
  {
    slug: '3d-ref-skills',
    name: '3D Ref Skills',
    tagline: 'Reference engineering for 3D artists.',
    description:
      'Nine AI skills for the reference stage of 3D work: silhouette, ortho, materials, scale and detail briefs before you open your DCC. Works with Claude, Cursor, Codex and Gemini, and with any DCC or engine. MIT-licensed.',
    status: { kind: 'released', label: 'Live · Open Source' },
    tags: ['Open Source', 'AI Skills'],
    metaTags: ['Open Source', 'AI Skills', '3D / VFX'],
    featured: false,
    order: 8,
    href: 'https://github.com/p4inz-code/3d-ref-skills',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/3d-ref-skills', external: true }],
    license: 'MIT',
    stack: ['Markdown skill files', 'Agent-agnostic'],
    role: 'Creator',
    started: '2026',
    currentVersion: 'v3.0.0',
    nextMilestone: 'Ongoing content expansion',
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured).sort((a, b) => a.order - b.order);
export const SUPPORTING_PROJECTS = PROJECTS.filter((p) => !p.featured).sort((a, b) => a.order - b.order);
export const CASE_STUDY_PROJECTS = PROJECTS.filter((p) => !p.isExternal);
