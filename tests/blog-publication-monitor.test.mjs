import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationSlot, selectMonitorTarget, classifyPublisher, safeMonitorUrl, readonlyGet, readPublisherRuns } from '../scripts/monitor-blog-publication.mjs';

const now = new Date('2026-10-21T14:35:00Z'), slot = publicationSlot(now);
const item = { slug: 'next-topic', draftSha256: 'exact-bilingual-version' };
const approval = { approved: true, notBefore: '2026-10-21' };
const report = { items: [item], ledger: [] };
const run = overrides => ({ workflow_id: 384355210, head_branch: 'production', event: 'schedule', created_at: '2026-10-21T14:17:00Z', status: 'completed', conclusion: 'success', ...overrides });

test('monitor checkpoints use Dallas Wednesday 09:00 across DST and never select the future slot', () => {
  assert.equal(slot.startsAt, '2026-10-21T14:00:00.000Z');
  assert.equal(publicationSlot(new Date('2026-11-04T15:35:00Z')).startsAt, '2026-11-04T15:00:00.000Z');
  assert.equal(publicationSlot(new Date('2026-10-21T13:59:59Z')).date, '2026-10-14');
  assert.equal(publicationSlot(new Date('2026-10-22T15:00:00Z')).date, '2026-10-21');
  assert.equal(selectMonitorTarget(report, { [item.slug]: approval }, new Date('2026-10-21T13:59:59Z')).item, null);
});

test('future or withdrawn drafts are quiet; a verified week takes precedence over the next unpublished manuscript', () => {
  assert.equal(classifyPublisher(selectMonitorTarget(report, {}, now), [], now), 'no_due');
  const entry = { ...item, state: 'verified', verifiedWeek: slot.week };
  const selection = selectMonitorTarget({ ...report, ledger: [entry], items: [item, { slug: 'later', draftSha256: 'later' }] }, { [item.slug]: approval, later: approval }, now);
  assert.equal(selection.item.slug, item.slug);
  assert.equal(classifyPublisher(selection, [run({ conclusion: 'failure' })], now), 'verify');
  assert.throws(() => selectMonitorTarget({ ...report, ledger: [entry, entry] }, {}, now), /More than one/);
});

test('running, failed, missing and pending releases are distinct; a successful no-op cannot imply publication', () => {
  const selection = selectMonitorTarget(report, { [item.slug]: approval }, now);
  assert.equal(classifyPublisher(selection, [], now), 'schedule_missing');
  assert.equal(classifyPublisher(selection, [run()], now), 'schedule_missing');
  assert.equal(classifyPublisher(selection, [run({ conclusion: 'failure' })], now), 'publisher_failed');
  assert.equal(classifyPublisher(selection, [run({ status: 'in_progress', conclusion: null })], now), 'running');
  assert.equal(classifyPublisher(selection, [run({ event: 'workflow_dispatch', status: 'in_progress', conclusion: null })], now), 'running', 'manual recovery before ledger preparation must not be mistaken for a missing trigger');
  assert.equal(classifyPublisher(selection, [], new Date('2026-10-21T14:29:59Z')), 'waiting');
  assert.equal(classifyPublisher(selection, [run({ event: 'workflow_dispatch', conclusion: 'failure' })], now), 'schedule_missing', 'manual approval/dry-run failure is not evidence of failed scheduled publication');
  const pending = selectMonitorTarget({ ...report, ledger: [{ ...item, state: 'pending-verification' }] }, { [item.slug]: approval }, now);
  assert.equal(classifyPublisher(pending, [], now), 'pending_verification');
  assert.equal(classifyPublisher(pending, [run({ status: 'queued', conclusion: null })], now), 'running');
  assert.equal(classifyPublisher(pending, [run({ event: 'workflow_dispatch', status: 'in_progress', conclusion: null })], now), 'running');
});

test('queued or running publishers past the 20-minute checkpoint become unknown instead of waiting forever', () => {
  const selection = selectMonitorTarget(report, { [item.slug]: approval }, now);
  for (const event of ['schedule', 'workflow_dispatch']) for (const status of ['queued', 'in_progress']) {
    assert.equal(classifyPublisher(selection, [run({ event, status, conclusion: null, created_at: '2026-10-21T14:15:00Z' })], now), 'unknown');
    assert.equal(classifyPublisher(selection, [run({ event, status, conclusion: null, created_at: '2026-10-21T14:15:01Z' })], now), 'running');
  }
});

test('GET guard refuses production APIs, external redirects, credentials and mutations before a request', async () => {
  for (const url of ['https://other.example/', '/v1/intake', '/%76%31/bookings', '/%2576%2531/bookings', 'https://user:pass@aimanjack.com/']) assert.throws(() => safeMonitorUrl(url), /permitted|refused/);
  assert.throws(() => safeMonitorUrl('https://api.github.com/repos/qianquandong/aimanjack-site/issues', 'github'), /runs API/);
  let calls = 0;
  const fetchImpl = async (url, options) => {
    calls++;
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.headers.Authorization, undefined, 'GitHub token cannot reach the public site');
    return { status: 302, headers: new Headers({ location: '/v1/intake' }) };
  };
  await assert.rejects(readonlyGet('/blog/', { method: 'POST', fetchImpl }), /GET/);
  assert.equal(calls, 0);
  await assert.rejects(readonlyGet('/blog/', { token: 'must-not-be-sent', fetchImpl }), /no APIs/);
  assert.equal(calls, 1, 'unsafe redirect is refused before following');
});

test('repository run pagination filters the publisher and refuses an incomplete history instead of reporting missing', async () => {
  const urls = [], get = async url => {
    urls.push(url);
    return JSON.stringify({ workflow_runs: [run(), run({ workflow_id: 999 })] });
  };
  assert.equal((await readPublisherRuns(slot, get)).length, 1);
  const url = new URL(urls[0]);
  assert.equal(url.pathname, '/repos/qianquandong/aimanjack-site/actions/runs');
  assert.equal(url.searchParams.get('branch'), 'production');
  assert.equal(url.searchParams.get('created'), `>=${slot.startsAt}`);
  let pages = 0;
  await assert.rejects(readPublisherRuns(slot, async () => { pages++; return JSON.stringify({ workflow_runs: Array.from({ length: 100 }, () => run()) }); }), /unknown, not missing/);
  assert.equal(pages, 5);
});
