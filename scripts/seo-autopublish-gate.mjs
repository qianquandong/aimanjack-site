#!/usr/bin/env node
// Gate for .github/workflows/seo-weekly-autopublish.yml (2026-10-17, Jack: "the weekly SEO routine should go live by itself").
// The routine pushes a `seo/weekly-YYYY-MM-DD` branch; this decides whether that branch may be merged into production and
// deployed WITHOUT a human review. It only answers yes for the narrow set of changes the routine is allowed to make.
//
//   node scripts/seo-autopublish-gate.mjs <base-ref>     (base = origin/production)
//
// Exit 0 = may publish. Exit 1 = blocked (reasons printed). Build/test/clean-tree checks run in the workflow itself.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const base = process.argv[2] || 'origin/production';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const changed = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean);
const problems = [];

// What the routine may touch: blog posts, page copy modules, its own data files, and the generated output of the build.
// Generated files are trusted only because the workflow rebuilds and requires a byte-identical tree afterwards.
const ALLOW = [
  /^src\/posts\/[a-z0-9-]+\.mjs$/,
  /^src\/pages\/[a-z0-9-]+\.mjs$/,
  /^scripts\/health\/\d{4}-\d{2}-\d{2}\.json$/,
  /^scripts\/geo-mentions\.json$/,
  /^sitemap\.xml$/,
  /^llms\.txt$/,
  /^(zh\/)?([a-z0-9-]+\/)*index\.html$/,
  /^(zh\/)?[a-z0-9-]+\.html$/,
];
// Never, even inside the allowlist: legal text, booking, and anything that is not a content module.
const DENY = [/^src\/pages\/(legal|book|contact)\.mjs$/, /^src\/posts\/_/];

if (!changed.length) problems.push('branch has no changes against production');
for (const f of changed) {
  if (DENY.some((re) => re.test(f)) || !ALLOW.some((re) => re.test(f))) problems.push(`not allowed for unattended publishing: ${f}`);
}

// Posts: a published post must pass blog-check and carry no open placeholder for Jack.
for (const f of changed.filter((x) => /^src\/posts\/[a-z0-9-]+\.mjs$/.test(x) && existsSync(x))) {
  const src = readFileSync(f, 'utf8'), slug = f.slice('src/posts/'.length, -'.mjs'.length);
  const published = /status:\s*'published'/.test(src);
  if (published && /\[Jack 补/.test(src)) problems.push(`${f}: published but still has a [Jack 补…] placeholder`);
  try { execFileSync('node', ['scripts/blog-check.mjs', slug], { encoding: 'utf8', stdio: 'pipe' }); }
  catch (e) { problems.push(`${f}: blog-check failed\n${String(e.stdout || '').split('\n').filter((l) => /^FAIL/.test(l)).join('\n')}`); }
}

console.log(`changed files (${changed.length}):\n  ${changed.join('\n  ')}`);
if (problems.length) {
  console.log(`\nBLOCKED — nothing will be published:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\nGate passed.');
