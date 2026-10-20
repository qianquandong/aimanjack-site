#!/usr/bin/env node
// Score past changes (2026-10-19). For every entry in state/seo/changes.jsonl whose 14- or 28-day check is due and covered by the
// archive, compare the N days before shipping with the N days after (ship day excluded), against all unchanged pages as the
// control, and append the result to <data>/verdicts.jsonl. Each (id, check) is scored once.
//
//   node scripts/seo-loop/score.mjs [--data .seo-data] [--ref production]
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHECKS, addDays, loadDays, latestDay, sum, pageRows, otherPageRows, queryRows, readJsonl, pagesOf, shipDate, matchesTarget, verdict } from './lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const data = arg('--data', '.seo-data'), ref = arg('--ref', 'production');
const targets = JSON.parse(readFileSync('state/seo/targets.json', 'utf8')).targets;
const ledger = readJsonl('state/seo/changes.jsonl');
const done = new Set(readJsonl(join(data, 'verdicts.jsonl')).map((v) => `${v.id}@${v.check}`));
const last = latestDay(data);
if (!last) { console.log('score: no Search Console archive yet; nothing to score'); process.exit(0); }

mkdirSync(data, { recursive: true });
let n = 0;
for (const e of ledger) {
  const shipped = shipDate(e, { ref });
  if (!shipped) continue;   // not on production yet
  const pages = pagesOf(e);
  const tgs = targets.filter((t) => (e.targets || []).includes(t.id));
  const onTarget = (page, q) => pages.includes(page) && tgs.some((t) => matchesTarget(q, t));
  for (const days of CHECKS) {
    const key = `${e.id}@d${days}`, afterEnd = addDays(shipped, days);
    if (done.has(key) || afterEnd > last) continue;
    const before = loadDays(data, addDays(shipped, -days), addDays(shipped, -1));
    const after = loadDays(data, addDays(shipped, 1), afterEnd);
    if (!before.length && e.type !== 'new-page' && e.type !== 'new-post') continue;   // archive does not reach back that far
    const m = {
      page: { before: sum(pageRows(before, pages)), after: sum(pageRows(after, pages)) },
      control: { before: sum(otherPageRows(before, pages)), after: sum(otherPageRows(after, pages)) },
      targets: tgs.length ? { before: sum(queryRows(before, onTarget)), after: sum(queryRows(after, onTarget)) } : null,
    };
    const v = { id: e.id, check: `d${days}`, url: e.url, type: e.type, shipped, window: `${addDays(shipped, -days)}..${afterEnd}`, ...m, verdict: verdict({ type: e.type, ...m }), scored_at: new Date().toISOString().slice(0, 10) };
    appendFileSync(join(data, 'verdicts.jsonl'), JSON.stringify(v) + '\n');
    console.log(`${key}: ${v.verdict} (page impressions ${m.page.before.impressions} → ${m.page.after.impressions})`);
    n++;
  }
}
console.log(`score: ${n} new verdict(s); archive through ${last}`);
