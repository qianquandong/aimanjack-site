import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import { fixture, provider } from './mailerlite-test-store.mjs';
import { mailerliteProcessor, mailerliteRoute, mailerliteClient, mailerliteWebhook } from '../functions/mailerlite.mjs';

const process = (f, p) => mailerliteProcessor({ ...f, fetchImpl: p.fetchImpl }).process();
const mutations = p => p.calls.filter(call => call.method === 'POST');
function callback(env, payload, options = {}) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signature = createHmac('sha256', env.MAILERLITE_WEBHOOK_SECRET).update(body).digest('hex');
  return new Request('https://aimanjack.com/v1/mailerlite/webhook', { method: 'POST', headers: { 'content-type': 'application/json', signature, ...options.headers }, body });
}

test('database and env are independently disabled; no historical backfill or network', async t => {
  const f = await fixture(t), p = provider();
  await f.intake(true);
  assert.equal((await f.rows('select * from revenue.mailerlite_sync_events')).length, 0);
  assert.equal((await process(f, p)).enabled, false);
  assert.equal(p.calls.length, 0);
  await f.enable(); await f.intake(true);
  assert.equal((await f.rows('select * from revenue.mailerlite_sync_events')).length, 1, 'new consent event is captured even on deduped receipt');
  f.env.MAILERLITE_SYNC_ENABLED = 'false';
  assert.equal((await process(f, p)).enabled, false); assert.equal(p.calls.length, 0);
});

test('quote dedupe followed by new opt-in reaches DOI once; no status/resubscribe or other groups touched', async t => {
  const f = await fixture(t), p = provider(); await f.enable();
  const a = await f.intake(false), b = await f.intake(true); assert.equal(a.receipt_id, b.receipt_id);
  assert.equal((await f.rows('select consent_newsletter from revenue.intake_receipts'))[0].consent_newsletter, false, 'initial receipt remains immutable');
  const r = await process(f, p); assert.equal(r.processed[0].outcome, 'delivered');
  assert.equal(r.processed[0].code, 'pending_confirmation');
  assert.deepEqual(JSON.parse(mutations(p)[0].body), { email: 'dana@example.test', fields: { name: 'Dana Test' }, groups: ['123'] });
  await f.intake(true); await process(f, p);
  assert.equal(mutations(p).length, 1, 'a duplicate consent rechecks membership and cannot resend DOI');
  const health = await f.rpc('health'); assert.equal(health.pendingConfirmation, 2);
  assert.ok(!JSON.stringify(r).includes('@'), 'processor responses contain no customer email');
});

test('latest unticked consent cancels pending enrollment without unsubscribing an existing subscriber', async t => {
  const f = await fixture(t), p = provider({ initial: { id: '42', email: 'dana@example.test', status: 'active', groups: [] } });
  await f.enable(); await f.intake(true); await f.intake(false);
  const r = await process(f, p); assert.equal(r.processed[0].outcome, 'cancelled');
  assert.equal(r.processed[0].code, 'latest_consent_not_granted');
  assert.equal(mutations(p).length, 0); assert.equal(p.subscribers.get('dana@example.test').status, 'active');
});

test('existing active/unconfirmed subscriber uses group assignment, preserving existing membership and confirmation status', async t => {
  const f = await fixture(t); await f.enable();
  for (const status of ['active', 'unconfirmed']) {
    const email = status + '@example.test'; await f.intake(true, email);
    const p = provider({ initial: { id: '42', email, status, groups: [{ id: '999' }] } });
    await process(f, p);
    assert.equal(mutations(p).length, 1); assert.match(mutations(p)[0].path, /\/subscribers\/42\/groups\/123$/);
    assert.equal(mutations(p)[0].body, undefined);
    assert.deepEqual(p.subscribers.get(email).groups, [{ id: '999' }, { id: '123' }]);
    assert.equal(p.subscribers.get(email).status, status);
  }
});

test('provider suppression is persistent locally and a later quote cannot reactivate it', async t => {
  const f = await fixture(t); await f.enable();
  for (const status of ['unsubscribed', 'bounced', 'junk']) {
    const email = status + '@example.test'; await f.intake(true, email);
    const p = provider({ initial: { id: '42', email, status, groups: [] } });
    assert.equal((await process(f, p)).processed[0].outcome, 'suppressed');
    p.subscribers.get(email).status = 'active'; await f.intake(true, email);
    assert.equal((await process(f, p)).processed[0].code, 'local_suppressed');
    assert.equal(mutations(p).length, 0);
  }
});

test('lost create response reconciles by GET, without another POST or duplicate DOI', async t => {
  const f = await fixture(t), p = provider({ failPost: 'unknown_saved' }); await f.enable(); await f.intake();
  assert.equal((await process(f, p)).processed[0].outcome, 'uncertain');
  await f.due(); assert.equal((await process(f, p)).processed[0].outcome, 'delivered');
  assert.equal(mutations(p).length, 1);
});

test('an unexpectedly active new create pauses database processing and stops the tick for DOI review', async t => {
  const f = await fixture(t); await f.enable(); await f.intake(); await f.intake(true, 'next@example.test');
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push(options.method);
    if (String(url).includes('/groups?')) return Response.json({ data: [{ id: '123' }] });
    if (options.method === 'GET') return new Response('', { status: 404 });
    const body = JSON.parse(options.body);
    return Response.json({ data: { id: '42', email: body.email, status: 'active', groups: [{ id: '123' }] } }, { status: 201 });
  };
  const r = await mailerliteProcessor({ ...f, fetchImpl }).process();
  assert.equal(r.error, 'double_opt_in_unverified'); assert.equal(r.processed[0].outcome, 'uncertain');
  assert.equal(r.processed.length, 1); assert.equal(calls.filter(method => method === 'POST').length, 1);
  assert.equal((await f.rpc('health')).enabled, false);
  assert.equal((await mailerliteProcessor({ ...f, fetchImpl }).process()).enabled, false);
  assert.equal(calls.filter(method => method === 'POST').length, 1);
});

test('RFC3986 lookup encoding accepts legal apostrophe and punctuation in an email local part', async () => {
  const email = "o'brien!()*@example.test";
  const client = mailerliteClient({ env: { MAILERLITE_API_TOKEN: 'mock-only', MAILERLITE_QUOTE_GROUP_ID: '123' }, fetchImpl: async (url, options) => {
    assert.equal(options.method, 'GET'); assert.ok(String(url).endsWith('/subscribers/o%27brien%21%28%29%2A%40example.test'));
    return Response.json({ data: { id: '42', email, status: 'active', groups: [] } });
  } });
  assert.equal((await client.lookup(email)).id, '42');
});

test('unobserved uncertain create blocks new same-email consent attempts and exhausts to manual dead state', async t => {
  const f = await fixture(t), p = provider({ failPost: 'unknown_not_saved' }); await f.enable(); await f.intake();
  await process(f, p); await f.intake();
  for (let i = 0; i < 9; i++) { await f.due(); await process(f, p); }
  assert.equal(mutations(p).length, 1);
  assert.ok((await f.rows('select status from revenue.mailerlite_sync_events')).every(row => row.status === 'dead'));
  assert.equal((await f.rpc('health')).mutationsToday, 1);
});

test('changing the configured group cannot repeat an uncertain subscriber create for the same identity', async t => {
  const f = await fixture(t), p = provider({ failPost: 'unknown_not_saved', groupPage: () => [{ id: '123' }, { id: '456' }] });
  await f.enable(); await f.intake(); await process(f, p);
  f.env.MAILERLITE_QUOTE_GROUP_ID = '456'; await f.intake();
  const r = await process(f, p); assert.equal(r.processed[0].outcome, 'uncertain');
  assert.equal(mutations(p).length, 1);
  // The SQL reservation itself enforces the cross-group attempt guard, independently of the worker branch.
  await f.intake(); const tick = await f.rpc('begin_tick');
  const [row] = await f.rpc('claim', { p_tick: tick.token, p_limit: 1 });
  assert.equal(await f.rpc('reserve', { p_id: row.id, p_token: row.lease_token, p_group: '456', p_creating: true }), false);
  await f.rpc('end_tick', { p_tick: tick.token });
});

test('explicit 429 rejection can safely retry after backoff but spends budget for both attempts', async t => {
  const f = await fixture(t), p = provider({ failPost: '429' }); await f.enable(); await f.intake();
  assert.equal((await process(f, p)).processed[0].outcome, 'retry_rejected');
  assert.equal((await process(f, p)).processed.length, 0, 'backoff respected');
  await f.due(); assert.equal((await process(f, p)).processed[0].outcome, 'delivered');
  assert.equal(mutations(p).length, 2); assert.equal((await f.rpc('health')).mutationsToday, 2);
});

test('daily mutation budget and two-event tick limit are enforced atomically in SQL', async t => {
  const f = await fixture(t), p = provider(); await f.enable();
  await f.pg.exec('update revenue.mailerlite_configuration set daily_limit=1');
  for (let i = 0; i < 4; i++) await f.intake(true, `person${i}@example.test`);
  const r = await process(f, p); assert.equal(r.processed.length, 2); assert.equal(mutations(p).length, 1);
  await process(f, p); assert.equal(mutations(p).length, 1); assert.equal((await f.rpc('health')).mutationsToday, 1);
  const tick = await f.rpc('begin_tick'); const busy = await f.rpc('begin_tick'); assert.equal(busy.busy, true);
  assert.equal(await f.rpc('end_tick', { p_tick: crypto.randomUUID() }), false);
  assert.equal(await f.rpc('end_tick', { p_tick: tick.token }), true);
});

test('source erasure cascades queued data and service-role cannot read tables or alter consent', async t => {
  const f = await fixture(t); await f.enable(); const receipt = await f.intake();
  await f.rows('select revenue.erase_receipt($1)', [receipt.receipt_id]);
  assert.equal((await f.rows('select * from revenue.mailerlite_sync_events')).length, 0);
  await f.pg.exec('set role anon'); await assert.rejects(f.rpc('health')); await f.pg.exec('reset role');
  await f.pg.exec('set role service_role'); assert.equal((await f.rpc('health')).enabled, true);
  await assert.rejects(f.rows('select * from revenue.mailerlite_sync_events'));
  await assert.rejects(f.rows('update revenue.mailerlite_configuration set enabled=true'));
  await f.pg.exec('reset role');
});

test('expired lease cannot finish; crashed reserved mutation stays lookup-only after lease recovery', async t => {
  const f = await fixture(t); await f.enable(); await f.intake();
  const tick = await f.rpc('begin_tick'), [row] = await f.rpc('claim', { p_tick: tick.token, p_limit: 2 });
  const body = { p_id: row.id, p_token: row.lease_token, p_group: '123' };
  assert.equal(await f.rpc('reserve', body), true); assert.equal(await f.rpc('reserve', body), false);
  await f.pg.exec("update revenue.mailerlite_sync_events set lease_until=clock_timestamp()-interval '1 minute'");
  assert.equal(await f.rpc('finish', { ...body, p_outcome: 'delivered', p_reason: 'active' }), false);
  await f.rpc('end_tick', { p_tick: tick.token }); const p = provider();
  assert.equal((await process(f, p)).processed[0].outcome, 'uncertain'); assert.equal(mutations(p).length, 0);
});

test('preview, disabled config, missing DOI acknowledgement and wrong token perform no DB/network work', async () => {
  let calls = 0; const db = async () => { calls++; throw Error('unexpected_database'); }, fetchImpl = async () => { calls++; throw Error('unexpected_network'); };
  const base = { SITE_ENV: 'production', MAILERLITE_SYNC_ENABLED: 'true', MAILERLITE_DOI_ACKNOWLEDGED: 'true', MAILERLITE_PROCESS_TOKEN: 'p'.repeat(40), MAILERLITE_API_TOKEN: 'mock'.repeat(10), MAILERLITE_QUOTE_GROUP_ID: '123' };
  const req = (host = 'aimanjack.com', token = base.MAILERLITE_PROCESS_TOKEN) => new Request(`https://${host}/v1/mailerlite/process`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
  assert.equal((await mailerliteRoute({ env: base, req: req('preview.pages.dev'), id: 'process', db, fetchImpl })).status, 503);
  assert.equal((await mailerliteRoute({ env: base, req: req('aimanjack.com', 'ADMIN_TOKEN'), id: 'process', db, fetchImpl })).status, 401);
  assert.equal((await mailerliteRoute({ env: { ...base, MAILERLITE_SYNC_ENABLED: 'false' }, req: req(), id: 'process', db, fetchImpl })).status, 200);
  assert.equal((await mailerliteRoute({ env: { ...base, MAILERLITE_DOI_ACKNOWLEDGED: 'false' }, req: req(), id: 'process', db, fetchImpl })).status, 503);
  assert.equal(calls, 0);
});

test('group verification follows only fixed-host numbered pages and caps at ten; no customer mutation on invalid group', async () => {
  const env = { MAILERLITE_API_TOKEN: 'mock-token-only', MAILERLITE_QUOTE_GROUP_ID: '123' };
  let calls = 0;
  const client = mailerliteClient({ env, fetchImpl: async (url, opts) => {
    calls++; assert.equal(new URL(url).origin, 'https://connect.mailerlite.com'); assert.equal(opts.method, 'GET');
    return Response.json({ data: Array.from({ length: 100 }, (_, i) => ({ id: String(1000 + i) })), links: { next: 'https://evil.invalid/exfiltrate' } });
  } });
  await assert.rejects(client.verifyGroup(), /group_page_budget/); assert.equal(calls, 10);
});

test('health is token protected and returns counts and booleans, never customer data or tokens', async t => {
  const f = await fixture(t); await f.enable(); await f.intake();
  const req = new Request('https://aimanjack.com/v1/mailerlite/health', { headers: { authorization: `Bearer ${f.env.MAILERLITE_PROCESS_TOKEN}` } });
  const r = await mailerliteRoute({ ...f, req, id: 'health' }), text = await r.text();
  assert.equal(r.status, 200); assert.ok(!text.includes('@')); assert.ok(!text.includes(f.env.MAILERLITE_PROCESS_TOKEN)); assert.ok(text.includes('not an unsubscribe'));
});

test('signed single and batch suppression callbacks are idempotent, monotone, and block fresh quote after provider deletion', async t => {
  const f = await fixture(t), p = provider();
  // Suppression protection accepts signed callbacks while enrollment is OFF, before first signup.
  const event = { type: 'subscriber.deleted', subscriber: { id: '42', email: 'dana@example.test', status: 'active', deleted_at: '2026-10-16T10:00:00Z', forget_at: '2026-10-16T10:00:00Z' } };
  const payload = { events: [event], total: 1 };
  for (let i = 0; i < 2; i++) {
    const response = await mailerliteWebhook({ ...f, req: callback(f.env, payload) });
    assert.equal(response.status, 200); assert.equal((await response.json()).outcome, i ? 'duplicate' : 'accepted');
  }
  assert.equal((await f.rows('select * from revenue.mailerlite_suppressions')).length, 1);
  const unsub = { id: '42', email: 'dana@example.test', status: 'active', event: 'subscriber.unsubscribed' };
  await mailerliteWebhook({ ...f, req: callback(f.env, unsub) });
  assert.equal((await f.rows('select state from revenue.mailerlite_suppressions'))[0].state, 'forgotten', 'a later or replayed less severe event cannot downgrade tombstone');
  const confirmation = { id: '42', email: 'dana@example.test', status: 'active', event: 'subscriber.active' };
  assert.equal((await mailerliteWebhook({ ...f, req: callback(f.env, confirmation) })).status, 200);
  await f.enable(); await f.intake();
  assert.equal((await process(f, p)).processed[0].code, 'local_forgotten'); assert.equal(mutations(p).length, 0);
  assert.equal(p.calls.filter(call => call.path.startsWith('/api/subscribers')).length, 0, 'permanent local tombstone blocks lookup-404 recreation');
  const stored = JSON.stringify(await f.rows('select * from revenue.mailerlite_suppressions'));
  assert.ok(!stored.includes('@')); assert.ok(!stored.includes('Dana'));
});

test('signed unsubscribed, bounced and spam callbacks suppress pending work even when payload status says active', async t => {
  const f = await fixture(t); await f.enable();
  const events = [];
  for (const event of ['subscriber.unsubscribed', 'subscriber.bounced', 'subscriber.spam_reported']) {
    const email = event.split('.')[1] + '@example.test'; await f.intake(true, email);
    events.push({ id: '42', email, status: 'active', event });
  }
  const response = await mailerliteRoute({ ...f, id: 'webhook', req: callback(f.env, { events, total: events.length }) });
  assert.equal(response.status, 200);
  assert.ok((await f.rows('select status from revenue.mailerlite_sync_events')).every(row => row.status === 'suppressed'));
  assert.equal((await f.rpc('health')).suppressionTombstones, 3);
});

test('webhook authenticates exact raw bytes before parsing or any DB write and rejects oversized/invalid payloads', async () => {
  const env = { SITE_ENV: 'production', MAILERLITE_WEBHOOK_SECRET: 'mock-webhook-secret-only', EMAIL_HASH_SECRET: 'mock-existing-email-identity-key-only' };
  let calls = 0; const db = async () => { calls++; throw Error('must_not_reach_database'); };
  const payload = { id: '42', email: 'dana@example.test', status: 'unsubscribed', event: 'subscriber.unsubscribed' };
  let response = await mailerliteWebhook({ env, req: callback(env, payload, { headers: { signature: '0'.repeat(64) } }), db });
  assert.equal(response.status, 401);
  response = await mailerliteWebhook({ env, req: callback(env, '{bad-json', { headers: { signature: '0'.repeat(64) } }), db });
  assert.equal(response.status, 401, 'signature is verified before JSON is parsed');
  response = await mailerliteWebhook({ env, req: callback(env, 'x'.repeat(262144)), db }); assert.equal(response.status, 413);
  response = await mailerliteWebhook({ env, req: callback(env, { events: [payload], total: 2 }), db }); assert.equal(response.status, 400);
  const request = callback(env, payload); const raw = await request.text();
  response = await mailerliteWebhook({ env, req: new Request(request.url, { method: 'POST', headers: request.headers, body: raw + ' ' }), db }); assert.equal(response.status, 401);
  assert.equal(calls, 0);
});

test('provider deleted/forgotten lookup records global tombstone and never upserts that address', async t => {
  const f = await fixture(t); await f.enable(); await f.intake();
  const p = provider({ initial: { id: '42', email: 'dana@example.test', status: 'active', groups: [], deleted_at: '2026-10-16T10:00:00Z' } });
  assert.equal((await process(f, p)).processed[0].code, 'provider_deleted');
  p.subscribers.clear(); await f.intake();
  assert.equal((await process(f, p)).processed[0].code, 'local_deleted');
  assert.equal(mutations(p).length, 0);
});

test('production enrollment requires explicit settings while preview and a fresh database stay disabled', async () => {
  const toml = await readFile(new URL('../wrangler.toml', import.meta.url), 'utf8');
  // Read only the quoted settings used here, by section: a production rollout must not change preview defaults.
  const sections = new Map(); let section;
  for (const line of toml.split(/\r?\n/)) {
    const heading = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (heading) { section = {}; sections.set(heading[1], section); continue; }
    const setting = /^\s*([A-Z][A-Z0-9_]*)\s*=\s*"([^"]*)"/.exec(line);
    if (setting && section) section[setting[1]] = setting[2];
  }
  for (const name of ['vars', 'env.preview.vars']) {
    const settings = sections.get(name);
    assert.equal(settings?.SITE_ENV, 'preview', `${name} must remain a preview environment`);
    assert.notEqual(settings.MAILERLITE_SYNC_ENABLED, 'true', `${name} cannot enable newsletter enrollment`);
  }
  const production = sections.get('env.production.vars');
  assert.equal(production?.SITE_ENV, 'production');
  assert.ok(['true', 'false'].includes(production.MAILERLITE_SYNC_ENABLED), 'production enrollment must be explicitly enabled or paused');
  if (production.MAILERLITE_SYNC_ENABLED === 'true') {
    assert.equal(production.MAILERLITE_DOI_ACKNOWLEDGED, 'true', 'an enabled rollout requires verified API double opt-in');
    assert.match(production.MAILERLITE_QUOTE_GROUP_ID ?? '', /^[0-9]{1,30}$/, 'an enabled rollout requires a valid configured group');
  }
  const sql = await readFile(new URL('../db/migrations/2026-10-16-mailerlite-quote-outbox.sql', import.meta.url), 'utf8');
  assert.match(sql, /enabled\s+boolean\s+not null\s+default false/, 'a fresh database cannot start enrollment merely by applying the migration');
  assert.ok(!sql.includes('insert into revenue.funnel_')); assert.ok(!sql.includes('create or replace function revenue.record_intake'));
});
