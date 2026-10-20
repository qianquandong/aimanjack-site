#!/usr/bin/env node
// Pick the on-page PR that may be merged without Jack (2026-10-20, Jack: "auto-merge it"). Used by seo-onpage-automerge.yml.
// A `seo/onpage-*` PR into production qualifies when ALL of these hold:
//   - it is open, not a draft, mergeable, and has no `hold` label (Jack's veto: add the label, or close the PR)
//   - it has been open for at least SEO_ONPAGE_AUTOMERGE_HOURS hours (default 24; 0 = merge as soon as checks pass)
//   - on its head commit the `check` job (check-change.mjs + build + full tests) and `offline-tests` succeeded,
//     and no check failed or is still running
// Prints `pr=<number>` for the oldest qualifying PR (one per run, so each merge gets its own deploy) or `pr=` for none.
import { execFileSync } from 'node:child_process';

export function pick(prs, { now = Date.now(), hours = 24 } = {}) {
  const log = [], ok = [];
  for (const p of prs) {
    const why = [];
    if (!p.headRefName.startsWith('seo/onpage-')) continue;
    if (p.isDraft) why.push('draft');
    if (p.labels.some((l) => l.name === 'hold')) why.push('has the hold label');
    if (p.mergeable !== 'MERGEABLE') why.push(`mergeable=${p.mergeable}`);
    const age = (now - Date.parse(p.createdAt)) / 36e5;
    if (age < hours) why.push(`open ${age.toFixed(1)}h of ${hours}h`);
    const runs = p.statusCheckRollup || [];
    const done = (r) => r.status === 'COMPLETED' || r.state === 'SUCCESS' || r.state === 'FAILURE' || r.conclusion;
    const good = (r) => ['SUCCESS', 'SKIPPED', 'NEUTRAL'].includes(r.conclusion || r.state);
    if (runs.some((r) => !done(r))) why.push('checks still running');
    if (runs.some((r) => done(r) && !good(r))) why.push('a check failed');
    for (const name of ['check', 'offline-tests']) if (!runs.some((r) => r.name === name && (r.conclusion || r.state) === 'SUCCESS')) why.push(`no successful ${name}`);
    if (why.length) log.push(`#${p.number} waits: ${why.join(', ')}`); else ok.push(p);
  }
  ok.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  return { pr: ok[0]?.number ?? null, log };
}

if (process.argv[1]?.endsWith('automerge-pick.mjs')) {
  const prs = JSON.parse(execFileSync('gh', ['pr', 'list', '--state', 'open', '--base', 'production', '--limit', '50',
    '--json', 'number,headRefName,createdAt,isDraft,labels,mergeable,statusCheckRollup'], { encoding: 'utf8' }));
  const hours = Number(process.env.SEO_ONPAGE_AUTOMERGE_HOURS ?? 24);
  const { pr, log } = pick(prs, { hours: Number.isFinite(hours) ? hours : 24 });
  for (const l of log) console.error(l);
  console.error(pr ? `#${pr} is ready to merge` : 'no on-page PR is ready');
  console.log(`pr=${pr ?? ''}`);
}
