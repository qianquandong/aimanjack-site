#!/usr/bin/env node
// Gate for on-page change PRs from the SEO loop (2026-10-19; branch seo/onpage-YYYY-MM-DD). Jack approves these by merging;
// this makes sure what he sees is small, logged and measurable. Runs in CI and before the routine pushes.
//
//   node scripts/seo-loop/check-change.mjs <base-ref>     (base = origin/production)
// Exit 0 = ok, 1 = blocked (reasons printed).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { COOLDOWN_DAYS, TYPES, daysBetween, readJsonl, pagesOf, shipDate } from './lib.mjs';

const base = process.argv[2] || 'origin/production';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const changed = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean);
const problems = [], warnings = [];
const today = new Date().toISOString().slice(0, 10);

const ALLOW = [/^src\/pages\/[a-z0-9-]+\.mjs$/, /^src\/content\/[a-z0-9-]+\.mjs$/, /^src\/posts\/[a-z0-9-]+\.mjs$/, /^state\/seo\/changes\.jsonl$/,
  /^scripts\/health\/\d{4}-\d{2}-\d{2}\.json$/, /^scripts\/geo-mentions\.json$/, /^sitemap\.xml$/, /^llms\.txt$/, /^(zh\/)?([a-z0-9-]+\/)*index\.html$/, /^(zh\/)?[a-z0-9-]+\.html$/];
const DENY = [/^src\/pages\/(legal|book|contact)\.mjs$/, /^src\/posts\/_/];
for (const f of changed) if (DENY.some((re) => re.test(f)) || !ALLOW.some((re) => re.test(f))) problems.push(`not allowed in an on-page change PR: ${f}`);

// New ledger lines = lines in this branch that production does not have.
let baseLedger = '';
try { baseLedger = git('show', `${base}:state/seo/changes.jsonl`); } catch {}
const lines = (s) => s.split(/\r?\n/).filter((l) => l.trim());   // CRLF-safe: Windows checkouts use core.autocrlf
const baseLines = new Set(lines(baseLedger));
const headLines = existsSync('state/seo/changes.jsonl') ? lines(readFileSync('state/seo/changes.jsonl', 'utf8')) : [];
const fresh = [];
for (const l of headLines.filter((x) => !baseLines.has(x))) { try { fresh.push(JSON.parse(l)); } catch { problems.push(`ledger line is not JSON: ${l.slice(0, 80)}`); } }
for (const l of baseLines) if (!headLines.includes(l)) problems.push('ledger is append-only: an existing line was changed or removed');

const touchesPages = changed.some((f) => /^src\/(pages|content)\//.test(f));
if (touchesPages && !fresh.length) problems.push('page source changed but state/seo/changes.jsonl has no new entry');
if (fresh.length > 3) problems.push(`${fresh.length} changes in one PR; the loop allows at most 3`);

const targets = new Set(JSON.parse(readFileSync('state/seo/targets.json', 'utf8')).targets.map((t) => t.id));
const all = readJsonl('state/seo/changes.jsonl');
const ids = all.map((e) => e.id);
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const built = (url) => { const f = url === '/' ? 'index.html' : url.replace(/^\//, '') + 'index.html'; return existsSync(f) ? readFileSync(f, 'utf8') : null; };

for (const e of fresh) {
  const where = `ledger ${e.id || '(no id)'}`;
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(e.id || '')) problems.push(`${where}: id must look like YYYY-MM-DD-short-slug`);
  if (ids.filter((x) => x === e.id).length > 1) problems.push(`${where}: duplicate id`);
  if (!TYPES.includes(e.type)) problems.push(`${where}: type must be one of ${TYPES.join(', ')}`);
  if (e.shipped) problems.push(`${where}: do not set "shipped"; the merge date is read from git`);
  if (!e.hypothesis || e.hypothesis.length < 20) problems.push(`${where}: needs a hypothesis (what should move, and why)`);
  if (!(e.targets?.length || e.queries?.length)) problems.push(`${where}: needs "targets" (ids from state/seo/targets.json) or "queries"`);
  for (const t of e.targets || []) if (!targets.has(t)) problems.push(`${where}: unknown target ${t}`);
  if (['title', 'description', 'h1'].includes(e.type) && !(e.old && e.new)) problems.push(`${where}: ${e.type} changes need "old" and "new"`);
  const html = typeof e.url === 'string' && e.url.startsWith('/') ? built(e.url) : null;
  if (!html) { problems.push(`${where}: no built page for url ${e.url}`); continue; }
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] || ''), desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '');
  // Lengths block only the change that owns them; on other edits an existing long title/description is a warning to fix later.
  const tLen = title.length < 30 || title.length > 65 ? `title is ${title.length} characters (30–65): "${title}"` : null;
  const dLen = desc.length < 70 || desc.length > 160 ? `meta description is ${desc.length} characters (70–160)` : null;
  if (tLen) (e.type === 'title' ? problems : warnings).push(`${where}: ${tLen}`);
  if (dLen) (e.type === 'description' ? problems : warnings).push(`${where}: ${dLen}`);
  if (e.type === 'title' && e.new !== title) problems.push(`${where}: "new" does not match the built title "${title}"`);
  if (e.type === 'description' && e.new !== desc) problems.push(`${where}: "new" does not match the built meta description`);
  if (e.type !== 'revert') {
    for (const prior of all.filter((p) => p.id !== e.id && pagesOf(p).some((u) => pagesOf(e).includes(u)))) {
      const s = shipDate(prior);
      if (s && daysBetween(s, today) < COOLDOWN_DAYS) problems.push(`${where}: ${e.url} changed on ${s} (${prior.id}); wait ${COOLDOWN_DAYS} days before changing it again`);
    }
  }
}

console.log(`changed files (${changed.length}), new ledger entries (${fresh.length}): ${fresh.map((e) => e.id).join(', ') || 'none'}`);
if (warnings.length) console.log(`\nWarnings (not blocking):\n- ${warnings.join('\n- ')}`);
if (problems.length) { console.log(`\nBLOCKED:\n- ${problems.join('\n- ')}`); process.exit(1); }
console.log('On-page change check passed.');
