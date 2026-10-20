// Shared, side-effect-free helpers for the SEO loop (2026-10-19). The loop's rule: code measures and ranks, Claude proposes,
// Jack approves page edits, and every change lands in state/seo/changes.jsonl so it can be scored at 14 and 28 days.
// Data lives on the `seo-data` branch (never on production: production ships to Cloudflare), checked out at .seo-data/.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export const COOLDOWN_DAYS = 28;   // do not touch a page again until its last change has a 28-day verdict
export const CHECKS = [14, 28];    // days after shipping when a change is scored
export const TYPES = ['title', 'description', 'h1', 'body', 'faq', 'internal-link', 'schema', 'new-page', 'new-post', 'revert'];

// ── Dates (UTC calendar days, YYYY-MM-DD) ─────────────────────────────────
export const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);

// ── Queries ───────────────────────────────────────────────────────────────
// Lowercase, hyphens and punctuation to spaces, simple plural folding ("teams" → "team", "employees" → "employee").
const fold = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
export const tokens = (q) => String(q).toLowerCase().replace(/[^a-z0-9一-鿿]+/g, ' ').trim().split(/\s+/).filter(Boolean).map(fold);
export const matchesTarget = (query, target) => { const t = new Set(tokens(query)); return target.must.every((w) => t.has(fold(w.toLowerCase()))); };

// ── Archive: one file per day, written by collect-gsc.py ──────────────────
// { date, totals, pages: [[page, clicks, impressions, position]], rows: [[page, query, clicks, impressions, position]] }
export function loadDays(dir, from, to) {
  const gsc = join(dir, 'gsc');
  if (!existsSync(gsc)) return [];
  return readdirSync(gsc).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).map((f) => f.slice(0, 10))
    .filter((d) => d >= from && d <= to).sort().map((d) => JSON.parse(readFileSync(join(gsc, d + '.json'), 'utf8')));
}
export const latestDay = (dir) => {
  const gsc = join(dir, 'gsc');
  if (!existsSync(gsc)) return null;
  const days = readdirSync(gsc).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  return days.length ? days.at(-1).slice(0, 10) : null;
};

// Sum clicks/impressions and an impression-weighted average position over rows of [.., clicks, impressions, position].
export function sum(rows) {
  let clicks = 0, impressions = 0, posw = 0;
  for (const r of rows) { const [c, i, p] = r.slice(-3); clicks += c; impressions += i; posw += p * i; }
  return { clicks, impressions, position: impressions ? +(posw / impressions).toFixed(1) : null };
}
export const pageRows = (days, pages) => days.flatMap((d) => d.pages.filter((r) => pages.includes(r[0])));
export const otherPageRows = (days, pages) => days.flatMap((d) => d.pages.filter((r) => !pages.includes(r[0])));
export const queryRows = (days, pred) => days.flatMap((d) => d.rows.filter((r) => pred(r[0], r[1])));

// ── Ledger ────────────────────────────────────────────────────────────────
export const readJsonl = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)) : []);
export const pagesOf = (e) => [e.url, ...(e.also || [])];

// The day a ledger entry reached production: an explicit `shipped` (backfill) or the date of the first production commit that
// added its line. Routine-written entries never carry `shipped`, so the ship date is the day Jack merged the PR.
export function shipDate(entry, { cwd = '.', ref = 'production' } = {}) {
  if (entry.shipped) return entry.shipped;
  try {
    const out = execFileSync('git', ['log', ref, '--reverse', '--format=%cs', '-S', `"id":"${entry.id}"`, '--', 'state/seo/changes.jsonl'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return out.split('\n')[0] || null;
  } catch { return null; }
}

// ── Scoring ───────────────────────────────────────────────────────────────
// Page impressions before vs after, divided by the same ratio for every unchanged page (the control), so a Google update or a
// quiet week does not read as a win or a loss. With ~12 impressions a day these are directional reads, not proof.
export function verdict({ type, page, control, targets }) {
  const MIN = 30;
  if (type === 'new-page' || type === 'new-post') {
    return page.after.impressions >= MIN ? 'traction' : page.after.impressions > 0 ? 'early' : 'no-impressions';
  }
  if (page.before.impressions + page.after.impressions < MIN) return 'insufficient-data';
  const ctrl = control.before.impressions ? control.after.impressions / control.before.impressions : 1;
  const rel = page.before.impressions ? page.after.impressions / page.before.impressions / (ctrl || 1) : null;
  const tb = targets?.before?.position, ta = targets?.after?.position;
  const posGain = tb != null && ta != null ? tb - ta : null;   // positive = moved up
  if ((posGain != null && posGain >= 2) || (rel != null && rel >= 1.3 && page.after.clicks >= page.before.clicks)) return 'improved';
  if ((posGain != null && posGain <= -2) || (rel != null && rel <= 0.7)) return 'regressed';
  return 'flat';
}

// Wilson score interval for k successes in n runs (95%). Used for AI-answer mention and citation rates.
export function wilson(k, n, z = 1.96) {
  if (!n) return [0, 0];
  const p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [+((c - m) / d).toFixed(3), +((c + m) / d).toFixed(3)];
}
