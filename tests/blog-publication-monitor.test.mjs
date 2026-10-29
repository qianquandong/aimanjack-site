import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PACK, sha256, draftFor } from '../scripts/editorial-queue.mjs';
import { publicationSlot, selectMonitorTarget, classifyPublisher, safeMonitorUrl, readonlyGet, readonlyProbe, readPublisherRuns, observeFormalPresence, monitor } from '../scripts/monitor-blog-publication.mjs';

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

test('a diagnostic probe can observe a formal 404 without weakening successful-page or GitHub checks', async () => {
  const fetchImpl = async url => ({ status: 404, url: String(url), text: async () => 'Not found' });
  assert.equal((await readonlyProbe('/blog/missing/', { fetchImpl })).status, 404);
  await assert.rejects(readonlyGet('/blog/missing/', { fetchImpl }), /404/);
  await assert.rejects(readonlyProbe('https://api.github.com/repos/qianquandong/aimanjack-site/actions/runs', { kind: 'github', fetchImpl }), /404/);
});

test('formal presence checks cannot claim a verified publication from HTTP success or partial discovery', async () => {
  const target = { slug: 'next-topic' }, get = async () => '', probe = async path => ({ url: 'https://aimanjack.com' + path, status: 404 });
  const absent = await observeFormalPresence(target, { get, probe });
  assert.equal(absent.state, 'absent');
  assert.equal(absent.pages.length, 2);
  const present = await observeFormalPresence(target, { get, probe: async path => ({ url: 'https://aimanjack.com' + path, status: 200 }) });
  assert.equal(present.state, 'present_or_partial');
  assert.equal(present.verified, false);
  const staleDiscovery = await observeFormalPresence(target, { probe, get: async path => path === '/sitemap.xml' ? '<loc>https://aimanjack.com/blog/next-topic/</loc>' : '' });
  assert.equal(staleDiscovery.state, 'present_or_partial');
});

test('configuration drift reports approval_blocked with live and run evidence, then needs a fresh exact approval', async t => {
  const root = await mkdtemp(join(tmpdir(), 'aimanjack-monitor-approval-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const path of ['src', `${PACK}/posts`, `${PACK}/approvals`]) await mkdir(join(root, path), { recursive: true });
  const target = { slug: 'next-topic', order: 1, existing: false, baseSourceSha256: null };
  await writeFile(join(root, PACK, 'queue.json'), JSON.stringify({ version: 1, owner: 'qianquandong', timezone: 'America/Chicago', items: [target] }));
  await writeFile(join(root, 'src/blog.mjs'), '// reviewed renderer\n');
  const rendererSha256 = sha256('// reviewed renderer\n');
  await writeFile(join(root, PACK, 'index-copy.json'), JSON.stringify({ rendererBeforeSha256: rendererSha256, rendererAfterSha256: rendererSha256, replacements: [] }));
  await writeFile(join(root, PACK, 'posts/next-topic.mjs'), "export const post = {slug:'next-topic',status:'draft',en:{},zh:{}};");
  const config = 'current quote-only business facts';
  await writeFile(join(root, 'src/config.mjs'), config);
  const draft = await draftFor(target, root), approvalPath = join(root, PACK, 'approvals/next-topic.json');
  const record = { approved: true, slug: target.slug, approvedBy: 'qianquandong', approvedAt: '2026-10-14T13:31:51Z',
    approvalRun: 'offline-test-fixture-only', notBefore: '2026-10-21', draftSha256: draft.digest, configSha256: sha256('old public price') };
  await writeFile(approvalPath, JSON.stringify(record));
  const calls = [], get = async (url, options) => {
    calls.push(url);
    if (options?.kind === 'github') return JSON.stringify({ workflow_runs: [run({ id: 123 })] });
    return '';
  };
  const probe = async path => { calls.push(path); return { status: 404, url: 'https://aimanjack.com' + path }; };
  const blocked = await monitor(now, { root, get, probe });
  assert.equal(blocked.status, 'approval_blocked');
  assert.equal(blocked.approval.code, 'site_facts_changed');
  assert.equal(blocked.approval.approvedConfigSha256, record.configSha256);
  assert.equal(blocked.approval.currentConfigSha256, sha256(config));
  assert.equal(blocked.publication.state, 'absent');
  assert.equal(blocked.publication.verified, false);
  assert.equal(blocked.publisherRuns[0].id, 123, 'a green no-op remains independent scheduler evidence');
  assert.ok(calls.includes('/blog/next-topic/'));
  assert.ok(calls.includes('/zh/blog/next-topic/'));
  assert.ok(calls.includes('/sitemap.xml'));
  // Offline fixture only: no real approval is recorded or inferred by the monitor.
  await writeFile(approvalPath, JSON.stringify({ ...record, configSha256: sha256(config) }));
  const approved = await monitor(now, { root, get, probe });
  assert.equal(approved.status, 'schedule_missing', 'approval and a successful publisher run still do not establish publication');
  await writeFile(join(root, 'src/blog.mjs'), '// unreviewed renderer change\n');
  assert.equal((await monitor(now, { root, get, probe })).approval.code, 'renderer_changed');
  await writeFile(approvalPath, JSON.stringify({ ...record, draftSha256: 'stale manuscript', configSha256: sha256(config) }));
  assert.equal((await monitor(now, { root, get, probe })).approval.code, 'draft_changed');
});
