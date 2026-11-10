import { test } from 'node:test';
import assert from 'node:assert/strict';
import { llmsFull, projectsJson, profileJson, changelogJson, projectFacts } from '../portfolio-v5/src/lib/machine-docs.ts';
import { PROJECTS } from '../portfolio-v5/src/data/projects.ts';
import { SITE } from '../portfolio-v5/src/data/site.ts';

const docs = {
  'llms-full.txt': llmsFull(),
  'projects.json': JSON.stringify(projectsJson()),
  'profile.json': JSON.stringify(profileJson()),
  'changelog.json': JSON.stringify(changelogJson()),
};

test('machine-readable files never name private or personal repositories', () => {
  for (const [name, text] of Object.entries(docs)) {
    for (const bad of ['cairn', 'sequenceops', 'project-shu', 'strata', 'painfree-source', 'rfx-ae', 'northbyte-studio-tools', 'aetherion']) {
      assert.ok(!text.toLowerCase().includes(bad), `${name} must not mention ${bad}`);
    }
  }
});

test('the retired studio name only appears as a former name', () => {
  for (const [name, text] of Object.entries(docs)) {
    for (const line of text.split('\n')) {
      if (/northbyte/i.test(line)) assert.match(line, /retired|former|earlier|renamed|previous|formerName|Northbyte Studios \(2026\)/i, `${name}: ${line.slice(0, 120)}`);
    }
  }
});

test('every project appears with its current version, status and license', () => {
  const full = docs['llms-full.txt'];
  for (const p of PROJECTS) {
    const f = projectFacts(p);
    assert.ok(full.includes(`### ${p.name}`), `${p.name} section`);
    assert.ok(full.includes(`Status: ${p.status.label}`), `${p.name} status`);
    if (f.version) assert.ok(full.includes(f.version), `${p.name} version ${f.version}`);
    if (p.license) assert.ok(full.includes(p.license), `${p.name} license`);
  }
});

test('open source is never claimed for proprietary or source-available projects', () => {
  const j = projectsJson();
  for (const p of j.projects) {
    if (p.license === 'Proprietary' || p.license === 'Source-available') assert.equal(p.openSource, false, p.name);
  }
  assert.match(docs['llms-full.txt'], /Source-available \(free to use, not open source\)|source-available: free to use, not open source/);
});

test('the JSON files parse, point at the site and carry the check date', () => {
  for (const k of ['projects.json', 'profile.json', 'changelog.json'] as const) {
    const o = JSON.parse(docs[k]);
    assert.ok(JSON.stringify(o).includes('checkedAgainstGitHub'), k);
  }
  const p = JSON.parse(docs['profile.json']);
  assert.equal(p.name, 'Atharva Patil');
  assert.ok(p.alternateName.includes('p4inz') && p.alternateName.includes('painz'));
  assert.ok(p.sameAs.some((u: string) => u.includes('linkedin.com/in/p4inz')));
  assert.equal(JSON.parse(docs['changelog.json']).siteVersion, SITE.currentVersion);
});

test('generated prose has no dashes used as punctuation', () => {
  for (const [name, text] of Object.entries(docs)) assert.ok(!/[—–]| -- /.test(text), `${name} has a dash`);
});

test('the files are substantial: lots of true, current information', () => {
  assert.ok(docs['llms-full.txt'].length > 20000, 'llms-full.txt is long: ' + docs['llms-full.txt'].length);
  assert.ok(JSON.parse(docs['projects.json']).projects.length >= 19);
});
