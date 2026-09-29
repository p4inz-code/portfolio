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
  scene?: 'nexus' | 'kanvaz' | 'ascent' | 'mission' | 'pursue';
  /** Which bucket this shows up in on /work's "Web / App / CLI / OS" index.
   *  Left unset for things that don't fit one of those four cleanly
   *  (the game, the AI-skill packs, the methodology library). */
  category?: 'web' | 'app' | 'cli' | 'os';
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
    media: { src: '/assets/banners/mission-os.webp', alt: 'GitHub repository card for p4inz-code/mission-os.', kind: 'banner', ratio: '1200 / 600' },
    scene: 'mission',
    category: 'os',
    featured: true,
    order: 4,
    href: '/mission-os',
    isExternal: false,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/mission-os', external: true }],
    license: 'GPLv3',
    stack: ['Debian Stable', 'KDE Plasma (Wayland)', 'Rust', 'Calamares (customized)', 'GitHub Actions'],
    role: 'Founder, designer, developer, systems engineer',
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
    category: 'app',
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
    notes: 'Flagship commercial product of P4inz Interactive Labs. Source is proprietary; the public repo hosts releases and community discussion only. v11 (new UI, final-release grade) is in prep — case study will refresh once it ships.',
  },
  {
    slug: 'kanvaz',
    name: 'Kanvaz',
    tagline: 'Your canvas. Your references.',
    description:
      'Visual reference workspace for VFX and 3D artists. Live 3D model preview (glTF, OBJ, FBX, STL, USD, and more), typed connections with a Map View, a Scratch Board drawing layer, a Task Tracker, shared cards across boards, and 14 board templates. Plugin system with a local-only MCP Bridge: an AI agent can read and edit the active board, off by default and undo-reversible. Windows, macOS and Linux builds. Free forever, MIT-licensed.',
    status: { kind: 'active', label: 'Flagship · Active · v9.6.0' },
    category: 'app',
    tags: ['Electron', 'MIT'],
    metaTags: ['Electron', 'MIT', 'Open Source'],
    featured: true,
    order: 1,
    media: { src: '/assets/kanvaz/kanvaz-showcase-dark.webp', alt: 'Kanvaz reference board in the dark theme: image, note, color and URL cards joined by a Related To connection.', kind: 'screenshot', ratio: '1960 / 1224' },
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
    currentVersion: 'v9.6.0',
    nextMilestone: 'Shipping most weeks, driven by user feedback. No fixed roadmap.',
    notes: 'Ten releases since the site last checked (v8.8.5 -> v9.6.0, Sept 2026): security/platform hardening (v9.0.0), 13 render modes plus Kanvaz Link and Open With (v9.1.0), a Blender picker and preview quality gates (v9.2.0), OBJ material support and HDR/EXR previews (v9.3.0), Krita/Clip Studio/Procreate recognition (v9.4.0), a third board type -- Scratch Board, with board-wide annotations and Illustrator-style tools (v9.5.0) -- and a second pass fixing Map View overlap, a Windows dialog-freeze bug, and BMP export (v9.6.0). Screenshots on the case study page are now the real v9.6.0 set, replacing one that had drifted as far back as v4.2.1.',
  },
  {
    slug: 'pursue-os',
    name: 'Pursue OS',
    tagline: 'One operating system for the investigation workflow.',
    description:
      'Investigation-focused Linux OS for OSINT, DFIR, secure research, intelligence gathering, and evidence-driven workflows. Two flagship interfaces: Investigation Terminal + Investigation Browser with integrated Tor. Case Vault uses content-addressed SHA-256 storage with an append-only, hash-chained audit trail. Apache 2.0. Built by P4inz. Core V1 implementation is complete: a candidate ISO exists and has passed automated QEMU boot and live-flow validation. Not yet a public download -- hardware and manual testing is the current phase.',
    status: { kind: 'active', label: 'Active · V1 Beta (hardware testing)' },
    tags: ['Linux', 'OSINT', 'Apache 2.0'],
    metaTags: ['Linux', 'OSINT & DFIR', 'Apache 2.0'],
    media: { src: '/assets/banners/pursue-os.webp', alt: 'GitHub repository card for p4inz-code/pursue-os.', kind: 'banner', ratio: '1200 / 600' },
    scene: 'pursue',
    category: 'os',
    featured: true,
    order: 3,
    href: '/pursue-os',
    isExternal: false,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/pursue-os', external: true }],
    license: 'Apache 2.0',
    stack: ['Rust', 'Linux', 'Terminal-focused', 'Tor', 'Local AI (optional)'],
    role: 'Creator and sole developer',
    started: '2026',
    currentVersion: 'V1 Beta',
    nextMilestone: 'Hardware and manual testing on real devices, following a clean automated QEMU cold-boot pass. Candidate ISO built directly from the verified source tree; not yet hosted as a GitHub release download.',
    notes: 'Real jump since the site last checked: 348/348 (Phase 9) and 310/310 (Phase 10) workspace tests passing, a 19/19 adversarial security suite (path traversal, blob/manifest tampering, hash breaks, framing attacks all fail closed), clean clippy + cargo fmt, and a 7/7 live investigation flow (case creation through cryptographic case verification) passing inside QEMU. Desktop is Sway on Debian 13 Trixie. "No ISO yet" was true when last recorded and is no longer true.',
  },
  {
    slug: 'veris',
    name: 'Veris',
    tagline: 'Investigate. Correlate. Explain. Trust.',
    description:
      'Deterministic, offline-first CLI security scanner published as veris-cli on npm (`npx veris-cli scan`). 100% reproducible: identical inputs always produce identical findings, evidence, and risk scores, no network calls, no telemetry. Interactive terminal scan session, a browser-based investigation dashboard with zero-dependency HTML export, CI security gates with configurable policy thresholds, AI-assisted rule authoring with deterministic validation, and a sandboxed plugin ecosystem with Merkle SHA-256 integrity verification.',
    status: { kind: 'onHold', label: 'Maintenance Mode · v1.2.1' },
    category: 'cli',
    tags: ['TypeScript', 'Offline-First'],
    metaTags: ['TypeScript', 'Node.js', 'npm', 'CLI'],
    featured: false,
    order: 4,
    media: { src: '/assets/banners/veris.webp', alt: 'Veris banner art: a dark desk with a monitor showing an investigation session for sample.exe, with the title Veris, Explainable Investigation Platform.', kind: 'banner', ratio: '16 / 9' },
    href: 'https://github.com/p4inz-code/veris',
    isExternal: true,
    links: [
      { label: 'View on GitHub', href: 'https://github.com/p4inz-code/veris', external: true },
      { label: 'Package on npm', href: 'https://www.npmjs.com/package/veris-cli', external: true },
    ],
    license: 'Proprietary',
    stack: ['TypeScript', 'Node.js', 'SQLite', 'Handlebars'],
    role: 'Sole engineer',
    started: '29 June 2026',
    currentVersion: 'v1.2.1',
    nextMilestone: 'Repo\'s own README calls this "production hold / maintenance only" as of v1.2.0. v1.2.1 was a terminal-lifecycle bug fix on top of that; no new feature work planned.',
    notes: 'Bigger jump than the site had caught: went from v1.0.0 straight to v1.2.1 (Sept 2026) while marked on hold here. v1.2.0 shipped the CI gates, AI rule authoring, investigation dashboard, and plugin marketplace foundation in one release; v1.2.1 was a follow-up fix for the terminal session header. The case study on this site still describes the pre-v1.2 shape and needs a proper rewrite.',
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
    media: { src: '/assets/ascent/ascent-loop-poster.webp', alt: 'Project Ascent gameplay, Level 10 Master Escape: a small blue runner leaping up a staircase of platforms under a full moon while red creatures chase from below.', kind: 'video', ratio: '1600 / 646', video: { mp4: '/assets/ascent/ascent-loop.mp4', webm: '/assets/ascent/ascent-loop.webm' } },
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
    category: 'cli',
    tags: ['Luau', 'MIT'],
    metaTags: ['Luau', 'MIT', 'Roblox'],
    featured: false,
    order: 6,
    media: { src: '/assets/banners/obscura.webp', alt: 'Obscura banner art: a dark desk with a monitor showing an AST visualizer and transformation pipeline, with the title Obscura, Luau Protection Toolkit.', kind: 'banner', ratio: '16 / 9' },
    href: 'https://github.com/p4inz-code/obscura',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/obscura', external: true }],
    license: 'MIT',
    stack: ['Luau', 'AST transformations', 'TypeScript', 'C++'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'v1.0.0',
    nextMilestone: 'Maintenance + ongoing feature work driven by community requests',
    notes: 'v1.0.0 shipped with all 340 tests passing.',
  },
  {
    slug: 'glint',
    name: 'Glint',
    tagline: 'Brightness and volume, sharpened.',
    description:
      'Native brightness and volume tray utility for Windows, no Electron, sub-second cold start. Per-monitor brightness over DDC/CI and WMI with automatic hot-plug detection, a master and per-app volume mixer, global hotkeys, and automatic recovery when a monitor drops out. Free forever, zero telemetry.',
    status: { kind: 'released', label: 'Released · v1.1.0' },
    category: 'app',
    tags: ['.NET 8', 'Windows', 'Utility'],
    metaTags: ['.NET 8', 'Avalonia', 'Windows'],
    media: { src: '/assets/banners/glint.webp', alt: 'GitHub repository card for p4inz-code/glint.', kind: 'banner', ratio: '1200 / 600' },
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
      'A compiled, general-purpose programming language built from the ground up: its own lexer, parser, type system, HIR/MIR, optimizer, and native code generator. Compiles to a standalone native executable with no external toolchain (no C compiler, assembler, or linker) on both Windows (PE) and Linux (ELF, x86_64). Real OS threads, an async task loop with genuine `async`/`await` concurrency, TLS-verified networking, a package manager (manifest, resolver, lockfile), and a built-in test runner (`mink test`) and REPL (`mink repl`). Rust, Apache 2.0.',
    status: { kind: 'released', label: 'Released · v1.0.3' },
    category: 'cli',
    tags: ['Rust', 'Compilers', 'Systems'],
    metaTags: ['Rust', 'Compiler', 'Apache 2.0'],
    media: { src: '/assets/banners/mink.webp', alt: 'GitHub repository card for p4inz-code/mink.', kind: 'banner', ratio: '1200 / 600' },
    featured: false,
    order: 9,
    href: 'https://github.com/p4inz-code/mink',
    isExternal: true,
    links: [
      { label: 'View on GitHub', href: 'https://github.com/p4inz-code/mink', external: true },
      { label: 'Package on npm', href: 'https://www.npmjs.com/package/mink', external: true },
    ],
    license: 'Apache 2.0',
    stack: ['Rust', 'x86_64 native codegen (PE + ELF)', 'No external toolchain'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'v1.0.3',
    nextMilestone: 'Linux support (the previous milestone) is done and execution-verified via WSL. Ongoing work is Windows API-parity coverage against Python, tracked session-by-session in the repo.',
    notes: 'v1.0.0 shipped 2026-08-24 with 1928 compiler tests. Everything past v1.0.1 was a much bigger jump than the site had caught: a full Linux x86_64 backend, real threads and an async runtime, a package manager, a test runner, a REPL, regex, TLS networking, and DEFLATE/zip compression, taking the regression suite to just under 3,000 native-execution tests. v1.0.2 and v1.0.3 are real, tagged, shipped versions but don\'t have formal GitHub release notes the way v1.0.0/v1.0.1 do. One real gap worth flagging: as of this check, the published npm package still serves the older v1.0.1 build, not v1.0.3 — install from a tagged GitHub release if you need the current version.',
  },
  {
    slug: '3d-ref-skills',
    name: '3D Ref Skills',
    tagline: 'Reference engineering for 3D artists.',
    description:
      'Nine AI skills for the reference stage of 3D work: silhouette, ortho, materials, scale and detail briefs before you open your DCC. Works with Claude, Cursor, Codex and Gemini, and with any DCC or engine. MIT-licensed.',
    status: { kind: 'released', label: 'Live · Open Source' },
    tags: ['Open Source', 'AI Skills'],
    metaTags: ['Open Source', 'AI Skills', '3D & VFX'],
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
  {
    slug: 'anifx-fest',
    name: 'AniFX Fest 2026',
    tagline: 'Festival site for a two-day creative competition.',
    description:
      'The website for AniFX 2026, a creative festival run by the School of Creative Studies at DY Patil Deemed to be University, Navi Mumbai (23 to 24 October 2026). One site for five competitions (film festival, a 100-hour game jam, VALORANT, FC26 and character design) with per-event pages, registration, FAQs and contact channels grouped by event. Designed and built with one of my teachers/seniors from the program.',
    status: { kind: 'released', label: 'Live · Event site' },
    tags: ['Web', 'Event site', 'Firebase'],
    metaTags: ['Web', 'Event site', 'Client work'],
    category: 'web',
    featured: false,
    order: 10,
    href: 'https://anifx-fest.com/',
    isExternal: true,
    links: [{ label: 'Visit the site', href: 'https://anifx-fest.com/', external: true }],
    stack: ['Web', 'Firebase Hosting'],
    role: 'Designer and developer (with a teacher/senior from the program)',
    started: '2026',
    nextMilestone: 'Live for the festival on 23 to 24 October 2026.',
  },
  {
    slug: 'kalasadhana',
    name: 'Kalasadhana Academy',
    tagline: 'Website for a performing-arts academy in Kharghar.',
    description:
      'A full production website for Kalasadhana Academy of Performing Arts, a music academy in Kharghar, Navi Mumbai teaching Western instruments (Trinity College London) and Hindustani vocal and tabla. Course information, faculty, studio facilities, gallery, exam resources and contact, built and launched for the academy.',
    status: { kind: 'released', label: 'Live · Client site' },
    tags: ['Web', 'Client work'],
    metaTags: ['Web', 'Client work', 'Live'],
    category: 'web',
    featured: false,
    order: 11,
    href: 'https://kalasadhana-navimumbai.in/',
    isExternal: true,
    links: [{ label: 'Visit the site', href: 'https://kalasadhana-navimumbai.in/', external: true }],
    stack: ['Web'],
    role: 'Designer and developer',
    started: '2026',
    nextMilestone: 'Maintained for the academy.',
  },
  {
    slug: 'crossport',
    name: 'Crossport',
    tagline: 'Send a file to any of your devices, no account, no cloud.',
    description:
      'Free cross-platform file transfer utility for Windows, macOS, and Linux. No GitHub Release published yet; the repo is tagged at an early foundation build. Paused after the initial foundation work, development resumed in September 2026.',
    status: { kind: 'active', label: 'Active · Foundation' },
    category: 'app',
    tags: ['Utility', 'Cross-Platform'],
    metaTags: ['Windows', 'macOS', 'Linux'],
    media: { src: '/assets/banners/crossport.webp', alt: 'GitHub repository card for p4inz-code/Crossport.', kind: 'banner', ratio: '1200 / 600' },
    featured: false,
    order: 12,
    href: 'https://github.com/p4inz-code/Crossport',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/Crossport', external: true }],
    // Rust + TypeScript/HTML/CSS is what the repo's own language breakdown
    // shows; not naming a specific framework (Tauri looks likely from that
    // combination, but "looks likely" isn't a real confirmation).
    stack: ['Rust', 'TypeScript'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'v0.1.0-foundation',
    nextMilestone: 'Foundation stage, development active again as of September 2026. As of Sept 27, work in progress locally, not yet committed or pushed; expected to wrap within a day or two.',
  },
  {
    slug: 'draft',
    name: 'DRAFT',
    tagline: 'Sketch it. The agent sees exactly what you sketched.',
    description:
      'A cross-platform visual workspace built to hand structured canvas context to MCP-compatible AI agents as live data, not a screenshot or a typed-out description after the fact. Especially suited to game and level design, but works the same way for UI mockups, software architecture diagrams, and storyboards. Not a drawing app, an image generator, or a whiteboard clone.',
    status: { kind: 'active', label: 'Active · Foundation (Pre-v1)' },
    category: 'app',
    tags: ['MCP', 'Desktop'],
    metaTags: ['Cross-Platform', 'MCP', 'Pre-v1'],
    media: { src: '/assets/banners/draft.webp', alt: 'GitHub repository card for p4inz-code/Draft.', kind: 'banner', ratio: '1200 / 600' },
    featured: false,
    order: 13,
    href: 'https://github.com/p4inz-code/Draft',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/Draft', external: true }],
    stack: ['Rust', 'TypeScript'],
    role: 'Sole engineer',
    started: '2026',
    currentVersion: 'v0.1.0',
    nextMilestone: 'Repo\'s own README calls this "active foundation development (pre-v1)": real and working, not yet feature-complete.',
  },
  {
    slug: 'reference-engineering',
    name: 'Reference Engineering',
    tagline: 'The methodology behind 3D Ref Skills, written down properly.',
    description:
      'The canonical free library and methodology for Reference Engineering: the systematic discipline of collecting, organizing, analyzing, and applying references to inform production decisions, across any field with a production phase, not just 3D. Defines the methodology, proves it with worked examples, and provides the underlying tools that 3D Ref Skills packages as AI skills.',
    status: { kind: 'released', label: 'Live · Open Source' },
    tags: ['Open Source', 'Methodology'],
    metaTags: ['Open Source', 'Documentation'],
    featured: false,
    order: 15,
    href: 'https://github.com/p4inz-code/reference-engineering',
    isExternal: true,
    links: [{ label: 'View on GitHub', href: 'https://github.com/p4inz-code/reference-engineering', external: true }],
    license: 'MIT',
    role: 'Creator',
    started: '2026',
    nextMilestone: 'Ongoing documentation and worked-example expansion.',
  },
];

// Removed from the site (kept here as a record of why, not as dead weight
// in the array):
//
// - Docflow: discontinued. Won't be restarted.
// - P4inz (Discord Bot, github.com/p4inz-code/p4inz): not dead, postponed.
//   The work itself is done; it's on hold purely because there's no hosting
//   budget for it right now. Expected to resume being worked on/relisted
//   sometime next year (2027).

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured).sort((a, b) => a.order - b.order);
export const SUPPORTING_PROJECTS = PROJECTS.filter((p) => !p.featured).sort((a, b) => a.order - b.order);
export const CASE_STUDY_PROJECTS = PROJECTS.filter((p) => !p.isExternal);

/** Products only: client and event websites are listed in /work but are not counted as products. */
export const PRODUCT_COUNT = PROJECTS.filter((p) => !p.tags.includes('Client work') && !p.tags.includes('Event site')).length;
