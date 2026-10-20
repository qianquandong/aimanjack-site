#!/usr/bin/env node
// Rank this week's SEO opportunities from the archive (2026-10-19). Deterministic: no model involved. The Monday routine reads the
// output and proposes at most 3 changes from the top of the list; Jack approves them as a PR.
//
//   node scripts/seo-loop/opportunities.mjs [--data .seo-data] [--ref production] [--min-impr 10]
// Writes <data>/opportunities/<last-day>.json and .md (last-day = newest day in the archive).
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COOLDOWN_DAYS, addDays, daysBetween, loadDays, latestDay, sum, readJsonl, pagesOf, shipDate, matchesTarget } from './lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const data = arg('--data', '.seo-data'), ref = arg('--ref', 'production'), MIN = +arg('--min-impr', 10);

export function findOpportunities({ cur, prev, targets, ledger, last, min = 10 }) {
  // Pages changed in the last 28 days are cooling down: they stay in the report but never become candidates.
  const cooling = new Map();
  for (const e of ledger) {
    const s = e.shippedResolved;
    if (s && daysBetween(s, last) < COOLDOWN_DAYS) for (const p of pagesOf(e)) cooling.set(p, s);
  }
  const rows = cur.flatMap((d) => d.rows);
  const byPQ = new Map();   // page|query → summed row
  for (const [page, query, c, i, p] of rows) {
    const k = page + '\u0000' + query, o = byPQ.get(k) || { page, query, clicks: 0, impressions: 0, posw: 0 };
    o.clicks += c; o.impressions += i; o.posw += p * i; byPQ.set(k, o);
  }
  const pq = [...byPQ.values()].map((o) => ({ page: o.page, query: o.query, clicks: o.clicks, impressions: o.impressions, position: o.impressions ? +(o.posw / o.impressions).toFixed(1) : null }));

  // 1. Target keywords: where each ranks and which page Google shows.
  const targetStatus = targets.map((t) => {
    const hits = pq.filter((r) => matchesTarget(r.query, t));
    const byPage = {};
    for (const r of hits) { const b = byPage[r.page] || (byPage[r.page] = []); b.push([r.clicks, r.impressions, r.position]); }
    const pages = Object.entries(byPage).map(([page, rs]) => ({ page, ...sum(rs) })).sort((a, b) => b.impressions - a.impressions);
    const total = sum(hits.map((r) => [r.clicks, r.impressions, r.position]));
    const top = pages[0]?.page || null, owner = pages.find((p) => p.page === t.page);
    let status;
    if (!t.page) status = 'needs-page';
    else if (!hits.length) status = 'not-seen';
    else if (top !== t.page) status = 'wrong-page';
    else if (owner.position <= 7) status = 'page-one';
    else if (owner.position <= 20) status = 'striking';
    else status = 'deep';
    return { id: t.id, keyword: t.keyword, owner: t.page, status, impressions: total.impressions, clicks: total.clicks, position: owner?.position ?? null, top_page: top, queries: hits.sort((a, b) => b.impressions - a.impressions).slice(0, 5).map((r) => r.query), cooling: t.page ? cooling.has(t.page) : false };
  });

  // 2. Candidates (all rules are cheap to read and to change).
  const cand = [];
  const add = (c) => { if (!cooling.has(c.page)) cand.push(c); };
  for (const s of targetStatus) {
    if (s.status === 'wrong-page') add({ rule: 'target-wrong-page', page: s.owner, target: s.id, score: 100 + s.impressions, why: `"${s.keyword}" is ranked by ${s.top_page}, not its owner page` });
    if (s.status === 'striking') add({ rule: 'target-striking', page: s.owner, target: s.id, score: 90 + s.impressions, why: `"${s.keyword}" sits at #${s.position}; one on-page change may reach page one` });
  }
  for (const r of pq) {
    if (r.position >= 8 && r.position <= 20 && r.impressions >= min) add({ rule: 'striking-distance', page: r.page, query: r.query, score: 50 + r.impressions, why: `"${r.query}" at #${r.position} with ${r.impressions} impressions` });
    if (r.position <= 7 && r.impressions >= 50 && r.clicks / r.impressions < 0.02) add({ rule: 'low-ctr', page: r.page, query: r.query, score: 40 + r.impressions / 5, why: `"${r.query}" at #${r.position} but CTR ${(100 * r.clicks / r.impressions).toFixed(1)}%: title/description problem` });
  }
  const pageSum = (days) => { const m = {}; for (const [page, c, i, p] of days.flatMap((d) => d.pages)) { const b = m[page] || (m[page] = []); b.push([c, i, p]); } return Object.fromEntries(Object.entries(m).map(([k, v]) => [k, sum(v)])); };
  const nowP = pageSum(cur), prevP = pageSum(prev);
  for (const [page, p] of Object.entries(prevP)) {
    const n = nowP[page]?.impressions || 0;
    if (p.impressions >= 40 && n <= p.impressions * 0.75) add({ rule: 'decay', page, score: 30 + (p.impressions - n), why: `impressions ${p.impressions} → ${n} vs the previous 28 days` });
  }
  const byQ = {};
  for (const r of pq) (byQ[r.query] ||= []).push(r);
  for (const [query, rs] of Object.entries(byQ)) {
    const tot = rs.reduce((a, r) => a + r.impressions, 0), big = rs.filter((r) => r.impressions >= tot * 0.2);
    if (tot >= 20 && big.length >= 2) add({ rule: 'cannibalization', page: big[0].page, query, score: 60 + tot, why: `"${query}" split across ${big.map((r) => r.page).join(' and ')}` });
  }
  cand.sort((a, b) => b.score - a.score);
  return { targets: targetStatus, candidates: cand.slice(0, 15), cooling: [...cooling].map(([page, since]) => ({ page, since })) };
}

if (process.argv[1]?.endsWith('opportunities.mjs')) {
  const last = latestDay(data);
  if (!last) { console.log('opportunities: no Search Console archive yet'); process.exit(0); }
  const targets = JSON.parse(readFileSync('state/seo/targets.json', 'utf8')).targets;
  const ledger = readJsonl('state/seo/changes.jsonl').map((e) => ({ ...e, shippedResolved: shipDate(e, { ref }) }));
  const cur = loadDays(data, addDays(last, -27), last), prev = loadDays(data, addDays(last, -55), addDays(last, -28));
  const out = { generated: new Date().toISOString().slice(0, 10), window: `${addDays(last, -27)}..${last}`, days_in_window: cur.length, totals: sum(cur.map((d) => [d.totals.clicks, d.totals.impressions, d.totals.position])), ...findOpportunities({ cur, prev, targets, ledger, last, min: MIN }) };
  mkdirSync(join(data, 'opportunities'), { recursive: true });
  writeFileSync(join(data, 'opportunities', `${last}.json`), JSON.stringify(out, null, 1) + '\n');
  const md = [`# SEO opportunities, ${out.window} (${out.days_in_window} days of data)`, '', `Site: ${out.totals.impressions} impressions, ${out.totals.clicks} clicks.`, '', '## Target keywords', '', '| id | keyword | status | impr | pos | Google shows |', '|---|---|---|---|---|---|',
    ...out.targets.map((t) => `| ${t.id} | ${t.keyword} | ${t.status}${t.cooling ? ' (cooling)' : ''} | ${t.impressions} | ${t.position ?? ''} | ${t.top_page ?? ''} |`),
    '', '## Candidates (top first; pages changed in the last 28 days are excluded)', '', ...(out.candidates.length ? out.candidates.map((c, i) => `${i + 1}. **${c.rule}** ${c.page}: ${c.why}`) : ['None this week.'])].join('\n');
  writeFileSync(join(data, 'opportunities', `${last}.md`), md + '\n');
  console.log(md);
}
