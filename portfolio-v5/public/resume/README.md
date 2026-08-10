# /public/resume/

This directory serves the downloadable resume files linked from `/resume` on
the site.

**Files that must exist here** (path is public, referenced from `resume.astro`):

- `Atharva_Patil_Resume.md` — plain-text markdown resume (canonical source
  of truth, easy to edit, always in sync with `projects.ts`).
- `Atharva_Patil_Resume.pdf` — PDF-rendered version of the above. Generate
  from the MD with any tool (pandoc, VS Code's Markdown-PDF, Typora
  export). Drop it here alongside the MD.

**Do not delete the MD in favour of the PDF-only.** Recruiters occasionally
ask for machine-readable resume text; the MD covers that.

**Do not track large binaries here without checking git-lfs.** The PDF is
typically <200KB — fine to track normally. Anything larger, use LFS.
