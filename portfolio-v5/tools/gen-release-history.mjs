// Builds src/data/release-history.json from real GitHub data (repo creation dates and release
// history) for the projects listed on the site. Only listed repos are read. Run weekly with the
// version check: node tools/gen-release-history.mjs (needs the gh CLI, logged in).
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const REPOS = {
  'mission-os': 'mission-os',
  nexus: 'nexus-desktop',
  kanvaz: 'kanvaz',
  'kanvaz-mini': 'kanvaz-mini',
  'pursue-os': 'pursue-os',
  veris: 'veris',
  ascent: 'project-ascent',
  obscura: 'obscura',
  glint: 'Glint',
  mink: 'mink',
  '3d-ref-skills': '3d-ref-skills',
  crossport: 'Crossport',
  draft: 'Draft',
  'reference-engineering': 'reference-engineering',
  outlinedesk: 'outlinedesk',
  ropework: 'ropework',
};

const gh = (path) => JSON.parse(execSync(`gh api --paginate "${path}"`, { encoding: 'utf8', maxBuffer: 1 << 26 }).replace(/\]\s*\[/g, ','));

const out = { checkedAt: new Date().toISOString().slice(0, 10), projects: {} };
for (const [slug, repo] of Object.entries(REPOS)) {
  const meta = JSON.parse(execSync(`gh api repos/p4inz-code/${repo}`, { encoding: 'utf8' }));
  let releases = [];
  try {
    releases = gh(`repos/p4inz-code/${repo}/releases?per_page=100`)
      .filter((r) => !r.draft)
      .map((r) => [r.published_at.slice(0, 10), r.tag_name, r.html_url])
      .sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1], undefined, { numeric: true }));
  } catch { /* no releases */ }
  // tags-only repos (MINK ships tagged versions without every GitHub release)
  if (slug === 'mink') {
    const tags = JSON.parse(execSync(`gh api repos/p4inz-code/${repo}/tags`, { encoding: 'utf8' }));
    for (const t of tags) {
      if (releases.some((r) => r[1] === t.name)) continue;
      const c = JSON.parse(execSync(`gh api repos/p4inz-code/${repo}/commits/${t.commit.sha}`, { encoding: 'utf8' }));
      releases.push([c.commit.committer.date.slice(0, 10), t.name, `https://github.com/p4inz-code/${repo}/releases/tag/${t.name}`]);
    }
    releases.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1], undefined, { numeric: true }));
  }
  out.projects[slug] = { repo: `https://github.com/p4inz-code/${repo}`, created: meta.created_at.slice(0, 10), releases };
  console.log(slug.padEnd(24), meta.created_at.slice(0, 10), releases.length, 'releases', releases.at(-1)?.[1] ?? '-');
}
writeFileSync(new URL('../src/data/release-history.json', import.meta.url), JSON.stringify(out));
console.log('written');
