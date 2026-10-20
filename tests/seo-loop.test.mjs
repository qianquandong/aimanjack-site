import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { matchesTarget, verdict, wilson, readJsonl, addDays, daysBetween, TYPES } from '../scripts/seo-loop/lib.mjs';
import { findOpportunities } from '../scripts/seo-loop/opportunities.mjs';

const root = new URL('../', import.meta.url);
const targets = JSON.parse(readFileSync(new URL('state/seo/targets.json', root), 'utf8')).targets;
const builtFile = (url) => new URL(url === '/' ? 'index.html' : url.replace(/^\//, '') + 'index.html', root);

test('the 20 target keywords each have one id, match words and an owner page that is built', () => {
  assert.equal(targets.length, 20);
  assert.equal(new Set(targets.map((t) => t.id)).size, 20);
  for (const t of targets) {
    assert.ok(t.must.length >= 2, `${t.id} needs at least two match words`);
    if (t.page) assert.ok(existsSync(builtFile(t.page)), `${t.id} owner page ${t.page} is not built`);
  }
});

test('the change ledger is valid JSONL with unique ids, known types and known targets', () => {
  const ledger = readJsonl(new URL('state/seo/changes.jsonl', root));
  assert.ok(ledger.length > 0);
  assert.equal(new Set(ledger.map((e) => e.id)).size, ledger.length, 'duplicate ledger id');
  const ids = new Set(targets.map((t) => t.id));
  for (const e of ledger) {
    assert.ok(TYPES.includes(e.type), `${e.id}: unknown type ${e.type}`);
    assert.ok(e.hypothesis?.length >= 20, `${e.id}: hypothesis`);
    for (const t of e.targets || []) assert.ok(ids.has(t), `${e.id}: unknown target ${t}`);
    for (const u of [e.url, ...(e.also || [])]) assert.ok(existsSync(builtFile(u)), `${e.id}: ${u} is not built`);
  }
});

test('the AI prompt set is frozen, versioned and carries both controls', () => {
  const set = JSON.parse(readFileSync(new URL('state/seo/ai-prompts.json', root), 'utf8'));
  assert.match(set.version, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(set.prompts.some((p) => p.kind === 'control-brand') && set.prompts.some((p) => p.kind === 'control-unrelated'));
  assert.ok(set.prompts.filter((p) => p.kind === 'core').length >= 8);
});

test('queries match targets on every word, with plurals folded', () => {
  const t = (id) => targets.find((x) => x.id === id);
  assert.ok(matchesTarget('corporate ai training in dallas tx', t('t01')));
  assert.ok(matchesTarget('AI trainings for sales teams', t('t14')));
  assert.ok(matchesTarget('copilot training for executive assistants', t('t09')));
  assert.ok(!matchesTarget('ai training jobs', t('t14')));
  assert.ok(!matchesTarget('corporate ai training houston', t('t01')));
});

test('verdicts compare against the control and refuse to judge thin data', () => {
  const s = (i, c = 0, p = 10) => ({ impressions: i, clicks: c, position: p });
  const ctrl = { before: s(1000), after: s(1000) };
  assert.equal(verdict({ type: 'title', page: { before: s(10), after: s(12) }, control: ctrl }), 'insufficient-data');
  assert.equal(verdict({ type: 'title', page: { before: s(100, 2), after: s(150, 3) }, control: ctrl }), 'improved');
  assert.equal(verdict({ type: 'title', page: { before: s(100, 2), after: s(150, 3) }, control: { before: s(1000), after: s(1600) } }), 'flat', 'site-wide growth is not credited to the page');
  assert.equal(verdict({ type: 'title', page: { before: s(100), after: s(60) }, control: ctrl }), 'regressed');
  assert.equal(verdict({ type: 'faq', page: { before: s(40), after: s(40) }, control: ctrl, targets: { before: s(20, 0, 14), after: s(20, 0, 9) } }), 'improved');
  assert.equal(verdict({ type: 'new-page', page: { before: s(0), after: s(45) }, control: ctrl }), 'traction');
});

test('opportunities flag a target ranked by the wrong page and respect the cooldown', () => {
  const day = (date, rows) => ({ date, totals: { clicks: 0, impressions: 0, position: 0 }, pages: [], rows });
  const cur = [day('2026-11-01', [['/', 'corporate ai training dallas', 0, 30, 11], ['/ai-training/plano/', 'ai training plano tx', 0, 25, 12]])];
  const t = targets.filter((x) => ['t01', 't06'].includes(x.id));
  const fresh = findOpportunities({ cur, prev: [], targets: t, ledger: [], last: '2026-11-01' });
  assert.equal(fresh.targets.find((x) => x.id === 't01').status, 'wrong-page');
  assert.equal(fresh.targets.find((x) => x.id === 't06').status, 'striking');
  assert.ok(fresh.candidates.some((c) => c.rule === 'target-wrong-page' && c.page === '/ai-training/dallas/'));
  const cooled = findOpportunities({ cur, prev: [], targets: t, ledger: [{ id: 'x', url: '/ai-training/plano/', type: 'faq', shippedResolved: '2026-10-20' }], last: '2026-11-01' });
  assert.ok(!cooled.candidates.some((c) => c.page === '/ai-training/plano/'), 'a page changed 12 days ago is not a candidate');
});

test('date helpers and Wilson interval', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(daysBetween('2026-10-19', '2026-11-16'), 28);
  const [lo, hi] = wilson(3, 30);
  assert.ok(lo > 0 && lo < 0.1 && hi > 0.2 && hi < 0.3);
  assert.deepEqual(wilson(0, 0), [0, 0]);
});
