// Booking email ledger (GitHub qianquandong/revenue-os#2): sender/reply-to, durable delivery state, retries, no double
// send, configuration gaps recorded, and an email problem never failing a booking. Offline: an in-memory PostgREST and
// a fake Cloudflare Email Sending API. Real-mailbox authentication (SPF/DKIM/DMARC) is NOT provable here — see
// scripts/booking-email-e2e.md (owner-authorized live check).
import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequest } from '../functions/v1/[[route]].js';
import { createNotifier, classifyProviderResult, describeMailConfig, parseOwnerEmails, MAX_ATTEMPTS, MAX_OWNER_RECIPIENTS } from '../src/booking-notify.mjs';

// ── in-memory PostgREST (only what the booking API uses) ───────────────────────────────────────────────────────────
function fakeDb({ failNotifications = false, failEvents = false } = {}) {
  const t = { businesses: [{ id: 'aimanjack', name: 'AI Man Jack', tz: 'America/Chicago', min_lead_min: 60, max_days_ahead: 30, cancel_window_hours: 2 }],
    services: [{ business_id: 'aimanjack', id: 'demo-call', name: '20-Minute AI Workflow Call', duration_min: 20, buffer_min: 0, capacity: 1, active: true }],
    staff: [{ business_id: 'aimanjack', id: 'jack', name: 'Jack Qian', active: true }],
    availability_rules: [0, 1, 2, 3, 4, 5, 6].map((w) => ({ business_id: 'aimanjack', staff_id: null, weekday: w, start_hm: '08:00', end_hm: '20:00' })),
    blocks: [], bookings: [], events: [], notifications: [], mail_tokens: [], rate: {} };
  let seq = 0;
  const cmp = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a ?? '').localeCompare(String(b ?? '')));
  const match = (row, k, v) => {
    if (v.startsWith('eq.')) return String(row[k]) === v.slice(3);
    if (v.startsWith('in.(')) return v.slice(4, -1).split(',').includes(String(row[k]));
    if (v.startsWith('lte.')) return cmp(row[k], v.slice(4)) <= 0;
    if (v.startsWith('lt.')) return cmp(row[k], v.slice(3)) < 0;
    if (v.startsWith('gte.')) return cmp(row[k], v.slice(4)) >= 0;
    if (v.startsWith('gt.')) return cmp(row[k], v.slice(3)) > 0;
    if (v === 'is.true') return row[k] === true;
    if (v === 'is.false') return row[k] === false;
    if (v === 'is.null') return row[k] == null;
    throw new Error('op ' + v);
  };
  const SKIP = new Set(['select', 'order', 'limit', 'on_conflict']);
  const view = (b) => { const s = t.services.find((x) => x.id === b.service_id), biz = t.businesses[0];
    return { ...b, business_name: biz.name, service_name: s.name, tz: biz.tz, cancel_window_hours: biz.cancel_window_hours, duration_min: s.duration_min, buffer_min: s.buffer_min, capacity: s.capacity, staff_name: 'Jack Qian' }; };
  async function handle(url, init) {
    const u = new URL(url); const path = u.pathname.replace('/rest/v1/', ''); const method = init?.method ?? 'GET';
    const body = init?.body ? JSON.parse(init.body) : null; const prefer = init?.headers?.prefer ?? '';
    const filters = [...u.searchParams].filter(([k]) => !SKIP.has(k));
    const ok = (data, status = 200) => new Response(data == null ? '' : JSON.stringify(data), { status });
    if (path === 'rpc/create_booking') { const p = body.p; t.bookings.push({ ...p, status: 'confirmed', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }); return ok(true); }
    if (path === 'rpc/take_coupon_rate_limit') { const n = (t.rate[body.p_key_hash] ?? 0) + 1; t.rate[body.p_key_hash] = n; return ok(n <= body.p_limit); }
    if (path === 'rpc/move_booking') { const p = body.p; const b = t.bookings.find((x) => x.id === p.id); Object.assign(b, { start_at: p.start_at, end_at: p.end_at }); return ok(true); }
    const table = path === 'bookings_full' ? 'bookings' : path;
    if (!(table in t)) return ok({ message: 'not found' }, 404);
    if (table === 'notifications' && failNotifications) return ok({ message: 'relation "booking.notifications" does not exist', code: '42P01' }, 404);
    if (table === 'events' && failEvents && method === 'POST') return ok({ message: 'events down' }, 503);
    let rows = t[table].filter((r) => filters.every(([k, v]) => match(r, k, v)));
    if (method === 'GET') {
      const order = u.searchParams.get('order'); if (order) { const [f, dir] = order.split('.'); rows = [...rows].sort((a, b) => cmp(a[f], b[f]) * (dir === 'desc' ? -1 : 1)); }
      const limit = Number(u.searchParams.get('limit') || 1e9);
      const sel = u.searchParams.get('select'); const pick = (r) => (!sel || sel === '*' ? r : Object.fromEntries(sel.split(',').map((c) => [c, r[c]])));
      return ok(rows.slice(0, limit).map((r) => pick(path === 'bookings_full' ? view(r) : { ...r })));
    }
    if (method === 'POST') {
      const list = Array.isArray(body) ? body : [body]; const out = [];
      for (let r of list) {
        const oc = u.searchParams.get('on_conflict');
        if (oc && prefer.includes('merge-duplicates')) { const ex = t[table].find((x) => x[oc] === r[oc]); if (ex) { Object.assign(ex, r); out.push({ ...ex }); continue; } }
        if (table === 'mail_tokens') r = { generation: 0, needs_reconnect: false, ...r };
        if (table === 'notifications' && t.notifications.some((x) => x.dedupe_key === r.dedupe_key)) { if (prefer.includes('ignore-duplicates')) continue; return ok({ code: '23505' }, 409); }
        const row = { id: ++seq, created_at: new Date().toISOString(), ...r }; t[table].push(row); out.push({ ...row });
      }
      return ok(prefer.includes('return=minimal') ? null : out, 201);
    }
    if (method === 'PATCH') { rows.forEach((r) => Object.assign(r, body)); return ok(prefer.includes('return=minimal') ? null : rows.map((r) => ({ ...r }))); }
    return ok({ message: 'method' }, 405);
  }
  return { t, handle };
}

// ── fake Cloudflare Email Sending ──────────────────────────────────────────────────────────────────────────────────
function fakeMail(script = []) {
  const calls = [];
  const handle = async (url, init) => {
    const body = JSON.parse(init.body); calls.push({ ...body, auth: init.headers.authorization });
    const next = script.length ? script.shift() : 'delivered';
    if (next instanceof Error) throw next;
    if (typeof next === 'object') return new Response(JSON.stringify(next.body), { status: next.status });
    const result = { delivered: [], queued: [], permanent_bounces: [] }; result[next === 'bounce' ? 'permanent_bounces' : next].push(body.to);
    return new Response(JSON.stringify({ success: true, errors: [], messages: [], result }), { status: 200 });
  };
  return { calls, handle };
}

const ENV = { SUPABASE_URL: 'https://db.test', SB_SECRET_KEY: 'k', CF_ACCOUNT_ID: 'acct', CF_EMAIL_TOKEN: 'mail-token', OWNER_EMAIL: 'owner-inbox@example.com',
  BOOKING_EMAIL_FROM: 'booking-no-reply@aimanjack.com', BOOKING_REPLY_TO: 'jack@aimanjack.com', EMAIL_FROM: 'bookings@aimanjack.com', SITE_ORIGIN: 'https://aimanjack.com', ADMIN_TOKEN: 'admin' };

function harness(t, { env = ENV, db = fakeDb(), mail = fakeMail(), alerts = [], ms = null } = {}) {
  const original = globalThis.fetch; const errors = [];
  t.after(() => { globalThis.fetch = original; });
  t.mock.method(console, 'error', (...a) => { errors.push(a.join(' ')); });
  globalThis.fetch = async (url, init) => {
    const s = String(url);
    if (s.startsWith('https://db.test/')) return db.handle(s, init);
    if (s.includes('/email/sending/send')) return mail.handle(s, init);
    if (s.startsWith('https://ntfy.test/')) { alerts.push(init.body); return new Response('ok'); }
    if (ms && (s.startsWith('https://login.microsoftonline.com/') || s.startsWith('https://graph.microsoft.com/'))) return ms.handle(s, init);
    throw new Error('unexpected fetch ' + s);
  };
  const pending = [];
  const call = async (method, path, body, headers = {}) => {
    const req = new Request('https://aimanjack.com' + path, { method, headers: { 'content-type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
    const route = path.split('?')[0].replace(/^\/v1\//, '').split('/').filter(Boolean);
    const r = await onRequest({ request: req, env, params: { route }, waitUntil: (p) => pending.push(p) });
    const settle = async () => { while (pending.length) await pending.shift(); };
    await settle();
    return { status: r.status, body: await r.json() };
  };
  return { db, mail, call, errors, alerts, ms };
}
const slot = async (h) => (await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call')).body.days[1].slots[0].start_at;
const book = async (h, extra = {}, headers = {}) => h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: await slot(h), customer_name: 'Test Person', customer_phone: '(469) 555-0100', customer_email: 'customer@example.com', ...extra }, headers);

test('created: customer + owner each get exactly one message; From/Reply-To are the owner-decided values; ledger says delivered', async (t) => {
  const h = harness(t);
  const r = await book(h);
  assert.equal(r.status, 201);
  assert.equal(h.mail.calls.length, 2);
  const cust = h.mail.calls.find((c) => c.to === 'customer@example.com'), own = h.mail.calls.find((c) => c.to === 'owner-inbox@example.com');
  assert.deepEqual(cust.from, { address: 'booking-no-reply@aimanjack.com', name: 'AI Man Jack' });
  assert.equal(cust.reply_to, 'jack@aimanjack.com', 'customer replies reach the monitored business mailbox');
  assert.equal(own.reply_to, 'customer@example.com', 'owner can reply straight to the customer');
  assert.match(own.text, /\/admin\/bookings\//);
  assert.deepEqual(h.db.t.notifications.map((n) => [n.role, n.kind, n.status]).sort(), [['customer', 'created', 'delivered'], ['owner', 'created', 'delivered']]);
});

test('absent OWNER_EMAIL: booking succeeds, customer still notified, owner gap RECORDED (not silent)', async (t) => {
  const { OWNER_EMAIL, ...env } = ENV;
  const h = harness(t, { env });
  assert.equal((await book(h)).status, 201);
  const owner = h.db.t.notifications.find((n) => n.role === 'owner');
  assert.equal(owner.status, 'failed'); assert.equal(owner.last_error, 'config_missing:OWNER_EMAIL');
  assert.equal(h.db.t.notifications.find((n) => n.role === 'customer').status, 'delivered');
  assert.equal(h.mail.calls.length, 1);
});

test('absent CF_EMAIL_TOKEN: booking succeeds, nothing sent, both rows say config_missing:CF_EMAIL_TOKEN', async (t) => {
  const { CF_EMAIL_TOKEN, ...env } = ENV;
  const h = harness(t, { env });
  assert.equal((await book(h)).status, 201);
  assert.equal(h.mail.calls.length, 0);
  assert.ok(h.db.t.notifications.every((n) => n.status === 'failed' && n.last_error === 'config_missing:CF_EMAIL_TOKEN'));
});

test('provider rejects: retried with backoff, then dead after MAX_ATTEMPTS with an alert that carries no personal data', async (t) => {
  const reject = { status: 403, body: { success: false, errors: [{ code: 10203, message: 'Sending disabled for this zone or account' }], result: null } };
  const db = fakeDb(); const mail = fakeMail(Array(20).fill(reject)); const alerts = [];
  const h = harness(t, { env: { ...ENV, ALERT_NTFY_URL: 'https://ntfy.test/amj' }, db, mail, alerts });
  assert.equal((await book(h, { customer_email: null })).status, 201);
  const row = db.t.notifications[0];
  assert.equal(row.status, 'failed'); assert.match(row.last_error, /http_403 code_10203/); assert.ok(row.next_attempt_at > new Date().toISOString());
  const n = createNotifier({ db: (p, o) => fetch(`https://db.test/rest/v1/${p}`, { method: o?.method ?? 'GET', body: o?.body && JSON.stringify(o.body), headers: o?.headers ?? {} }).then((r) => r.text()).then((x) => (x ? JSON.parse(x) : null)),
    env: { ...ENV, ALERT_NTFY_URL: 'https://ntfy.test/amj' }, alert: async (msg) => { alerts.push(msg); } });
  for (let i = 0; i < MAX_ATTEMPTS + 2; i++) { row.next_attempt_at = '2000-01-01T00:00:00.000Z'; await n.processDue(); }
  assert.equal(row.status, 'dead'); assert.equal(row.attempts, MAX_ATTEMPTS);
  assert.equal(mail.calls.length, MAX_ATTEMPTS, 'never more than MAX_ATTEMPTS sends');
  assert.ok(alerts.some((a) => /dead/.test(a)));
  assert.ok(alerts.every((a) => !/@|Test Person|555/.test(a)), 'alerts carry ids and codes only');
});

test('transient failure then success: exactly two provider calls, final state delivered', async (t) => {
  const db = fakeDb(); const mail = fakeMail([{ status: 503, body: { success: false, errors: [{ code: 1, message: 'busy' }] } }, 'delivered']);
  const h = harness(t, { db, mail });
  await book(h, { customer_email: null });
  const row = db.t.notifications[0]; assert.equal(row.status, 'failed');
  row.next_attempt_at = '2000-01-01T00:00:00.000Z';
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(row.status, 'delivered'); assert.equal(mail.calls.length, 2);
});

test('permanent bounce: recorded as bounced, alerted, never retried', async (t) => {
  const db = fakeDb(); const mail = fakeMail(['bounce']); const alerts = [];
  const h = harness(t, { env: { ...ENV, ALERT_NTFY_URL: 'https://ntfy.test/amj' }, db, mail, alerts });
  await book(h, { customer_email: null });
  const row = db.t.notifications[0];
  assert.equal(row.status, 'bounced'); assert.ok(alerts.length >= 1);
  row.next_attempt_at = '2000-01-01T00:00:00.000Z';
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(mail.calls.length, 1);
});

test('idempotent replay creates no new event and no new email; re-enqueueing the same event is a no-op', async (t) => {
  const h = harness(t);
  const s = await slot(h);
  const first = await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: s, customer_name: 'Test Person', customer_phone: '4695550100', customer_email: 'customer@example.com' }, { 'idempotency-key': 'k1' });
  const again = await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: s, customer_name: 'Test Person', customer_phone: '4695550100', customer_email: 'customer@example.com' }, { 'idempotency-key': 'k1' });
  assert.equal(first.status, 201); assert.equal(again.status, 200);
  assert.equal(h.db.t.events.length, 1); assert.equal(h.db.t.notifications.length, 2); assert.equal(h.mail.calls.length, 2);
});

test('no double send: two workers attempting the same row ⇒ one provider call', async (t) => {
  const h = harness(t, { env: { ...ENV, CF_EMAIL_TOKEN: '' } });
  await book(h, { customer_email: null });
  const row = h.db.t.notifications[0]; Object.assign(row, { status: 'pending', attempts: 0, last_error: null });
  const n = createNotifier({ db: (p, o) => fetch(`https://db.test/rest/v1/${p}`, { method: o?.method ?? 'GET', body: o?.body && JSON.stringify(o.body), headers: o?.headers ?? {} }).then((r) => r.text()).then((x) => (x ? JSON.parse(x) : null)), env: ENV });
  const snapshot = { ...row };
  const results = await Promise.all([n.attempt(snapshot), n.attempt(snapshot)]);
  assert.equal(h.mail.calls.length, 1);
  assert.deepEqual(results.sort(), ['delivered', 'skipped_claimed_elsewhere']);
});

test('worker died mid-send: row becomes uncertain and is NOT resent automatically; owner requeue resends once', async (t) => {
  const h = harness(t);
  await book(h, { customer_email: null });
  const row = h.db.t.notifications[0]; Object.assign(row, { status: 'sending', claimed_at: '2000-01-01T00:00:00.000Z' });
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(row.status, 'uncertain'); assert.equal(h.mail.calls.length, 1);
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(h.mail.calls.length, 1, 'still not resent');
  const rq = await h.call('POST', '/v1/notifications/requeue', { ids: [row.id] }, { authorization: 'Bearer admin' });
  assert.deepEqual(rq.body.requeued, [row.id]);
  assert.equal(row.status, 'delivered'); assert.equal(h.mail.calls.length, 2);
});

test('missing customer_email: only the owner is notified; no customer row', async (t) => {
  const h = harness(t);
  await book(h, { customer_email: '' });
  assert.deepEqual(h.db.t.notifications.map((n) => n.role), ['owner']);
});

test("source='admin' (explicit choice, admin token required): customer is told, owner gets no notice about their own action", async (t) => {
  const h = harness(t);
  await book(h, {}, { 'x-source': 'admin', authorization: 'Bearer admin' });
  assert.deepEqual(h.db.t.notifications.map((n) => n.role), ['customer']);
  assert.equal(h.db.t.bookings[0].source, 'admin');
});

test("a public caller cannot claim X-Source: admin to suppress the owner's notice", async (t) => {
  const h = harness(t);
  await book(h, {}, { 'x-source': 'admin' });
  assert.deepEqual(h.db.t.notifications.map((n) => n.role).sort(), ['customer', 'owner']);
  assert.equal(h.db.t.bookings[0].source, 'web');
});

test('double cancel (concurrent) sends ONE set of cancellation emails', async (t) => {
  const h = harness(t);
  const c = await book(h);
  const [a, b] = await Promise.all([h.call('DELETE', '/v1/bookings/' + c.body.id), h.call('DELETE', '/v1/bookings/' + c.body.id)]);
  assert.equal(a.body.status, 'cancelled'); assert.equal(b.body.status, 'cancelled');
  assert.equal(h.db.t.notifications.filter((n) => n.kind === 'cancelled').length, 2, 'customer + owner, once');
  assert.equal(h.mail.calls.filter((m) => m.subject.startsWith('Cancelled') || m.subject.includes('cancelled')).length, 2);
});

test('a failed "Confirmed" email is superseded by a later "Cancelled" one — never sent out of order', async (t) => {
  const busy = { status: 503, body: { success: false, errors: [{ code: 1, message: 'busy' }] } };
  const db = fakeDb(); const mail = fakeMail([busy, 'delivered']);
  const h = harness(t, { db, mail });
  const c = await book(h, { customer_email: null });                       // owner "created" notice fails (503)
  assert.equal(db.t.notifications[0].status, 'failed');
  await h.call('DELETE', '/v1/bookings/' + c.body.id);                    // owner "cancelled" notice delivered
  db.t.notifications[0].next_attempt_at = '2000-01-01T00:00:00.000Z';
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(db.t.notifications[0].status, 'superseded');
  assert.deepEqual(mail.calls.map((m) => m.subject.split(' ')[0]), ['[booking]', '[booking]']);
  assert.match(mail.calls[1].subject, /cancelled/);
});

test('network error after the request: uncertain, never auto-resent (no duplicate)', async (t) => {
  const db = fakeDb(); const mail = fakeMail([Object.assign(new TypeError('fetch failed'), {})]);
  const h = harness(t, { db, mail });
  await book(h, { customer_email: null });
  const row = db.t.notifications[0];
  assert.equal(row.status, 'uncertain');
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(mail.calls.length, 1);
});

test('configuration gaps wait without using up attempts, and alert the owner once after 30 minutes', async (t) => {
  const { OWNER_EMAIL, ...env } = ENV; const alerts = [];
  const h = harness(t, { env: { ...env, ALERT_NTFY_URL: 'https://ntfy.test/amj' }, alerts });
  await book(h, { customer_email: null });
  const row = h.db.t.notifications[0];
  for (let i = 0; i < MAX_ATTEMPTS + 3; i++) { row.next_attempt_at = '2000-01-01T00:00:00.000Z'; await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' }); }
  assert.equal(row.status, 'failed', 'never dead because of a config gap'); assert.equal(row.attempts, 0);
  row.created_at = '2000-01-01T00:00:00.000Z';
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(alerts.filter((a) => /still failing/.test(a)).length, 1, 'one alert, not one per sweep');
  assert.match(alerts.find((a) => /still failing/.test(a)), /config_missing:OWNER_EMAIL/);
});

test('owner requeue never resends to a bounced address unless explicitly asked', async (t) => {
  const db = fakeDb(); const mail = fakeMail(['bounce', 'delivered']);
  const h = harness(t, { db, mail });
  await book(h, { customer_email: null });
  const row = db.t.notifications[0]; assert.equal(row.status, 'bounced');
  assert.deepEqual((await h.call('POST', '/v1/notifications/requeue', { ids: [row.id] }, { authorization: 'Bearer admin' })).body.requeued, []);
  assert.deepEqual((await h.call('POST', '/v1/notifications/requeue', { ids: [row.id], include_bounced: true }, { authorization: 'Bearer admin' })).body.requeued, [row.id]);
});

test('rescheduled and cancelled each produce their own notifications (no dedupe across events)', async (t) => {
  const h = harness(t);
  const created = await book(h);
  const avail = await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call');
  const other = avail.body.days[2].slots[0].start_at;
  assert.equal((await h.call('PATCH', '/v1/bookings/' + created.body.id, { start_at: other })).status, 200);
  assert.equal((await h.call('DELETE', '/v1/bookings/' + created.body.id)).status, 200);
  const kinds = h.db.t.notifications.map((n) => `${n.kind}:${n.role}`).sort();
  assert.deepEqual(kinds, ['cancelled:customer', 'cancelled:owner', 'created:customer', 'created:owner', 'rescheduled:customer', 'rescheduled:owner']);
  assert.equal(h.mail.calls.length, 6);
  assert.match(h.mail.calls.find((c) => c.subject.startsWith('Cancelled')).text, /Book again: https:\/\/aimanjack\.com\/book\//);
});

test('ledger unavailable (migration not applied): booking still 201, emails still attempted, failure logged loudly', async (t) => {
  const h = harness(t, { db: fakeDb({ failNotifications: true }) });
  const r = await book(h);
  assert.equal(r.status, 201);
  assert.equal(h.mail.calls.length, 2);
  assert.ok(h.errors.some((e) => /ledger unavailable/.test(e)));
  assert.ok(h.errors.every((e) => !/customer@example\.com|owner-inbox/.test(e)), 'logs carry no addresses');
});

test('event log failure after the booking committed never turns it into an error', async (t) => {
  const h = harness(t, { db: fakeDb({ failEvents: true }) });
  const r = await book(h);
  assert.equal(r.status, 201);
  assert.equal(h.db.t.bookings.length, 1);
});

test('admin: email-config shows the effective settings with the owner address masked; requires the token', async (t) => {
  const h = harness(t);
  assert.equal((await h.call('GET', '/v1/admin/email-config')).status, 401);
  const r = await h.call('GET', '/v1/admin/email-config', null, { authorization: 'Bearer admin' });
  assert.equal(r.body.booking_from, 'booking-no-reply@aimanjack.com'); assert.equal(r.body.booking_reply_to, 'jack@aimanjack.com');
  assert.equal(r.body.owner_email, 'o***x@example.com'); assert.equal(r.body.coupon_from, 'bookings@aimanjack.com');
  assert.ok(!JSON.stringify(r.body).includes('mail-token'));
  assert.deepEqual(describeMailConfig({}).owner_email, null);
});

test('admin list shows each booking with its notification states; requires the token', async (t) => {
  const h = harness(t);
  await book(h);
  assert.equal((await h.call('GET', '/v1/bookings?business=aimanjack')).status, 401);
  const plain = await h.call('GET', '/v1/bookings?business=aimanjack', null, { authorization: 'Bearer admin' });
  assert.equal(plain.body.bookings[0].notifications, undefined, 'agents keep the old response shape');
  const r = await h.call('GET', '/v1/bookings?business=aimanjack&with=notifications', null, { authorization: 'Bearer admin' });
  assert.equal(r.body.notifications_ledger, 'ok');
  assert.deepEqual(r.body.bookings[0].notifications.map((n) => n.status), ['delivered', 'delivered']);
  assert.ok(!('to_address' in r.body.bookings[0].notifications[0]), 'ledger addresses are not echoed');
});

test('provider result classification: delivered vs queued vs bounced vs error (independent of address formatting)', () => {
  const ok = (k) => ({ success: true, result: { delivered: [], queued: [], permanent_bounces: [], [k]: ['Some Name <A@B.co>'] } });
  assert.equal(classifyProviderResult(200, ok('delivered')).status, 'delivered');
  assert.equal(classifyProviderResult(200, ok('queued')).status, 'queued');
  assert.equal(classifyProviderResult(200, ok('permanent_bounces')).status, 'bounced');
  assert.equal(classifyProviderResult(200, { success: false, errors: [{ code: 9 }] }).status, 'failed');
  assert.equal(classifyProviderResult(429, null).retry, true);
});

// ── several owner inboxes (OWNER_EMAIL comma-separated) ─────────────────────────────────────────────────────────────
const TWO = 'owner-a@example.com, Owner-B@example.net';
function mailBy(decide) {           // provider fake that answers per recipient (order-independent)
  const calls = [];
  const handle = async (url, init) => {
    const body = JSON.parse(init.body); calls.push(body);
    const next = decide(body.to, calls.filter((c) => c.to === body.to).length);
    if (typeof next === 'object') return new Response(JSON.stringify(next.body), { status: next.status });
    const result = { delivered: [], queued: [], permanent_bounces: [] }; result[next === 'bounce' ? 'permanent_bounces' : next].push(body.to);
    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  };
  return { calls, handle };
}

test('parseOwnerEmails: commas/semicolons/spaces, case-insensitive de-dupe, invalid entries counted, capped', () => {
  assert.deepEqual(parseOwnerEmails(' a@x.com ,b@y.org; A@X.com  c@z.io ').list, ['a@x.com', 'b@y.org', 'c@z.io']);
  assert.deepEqual(parseOwnerEmails('a@x.com, not-an-address, "Jack" <j@x.com>'), { list: ['a@x.com'], invalid: 3, dropped: 0 });
  const many = parseOwnerEmails(Array.from({ length: MAX_OWNER_RECIPIENTS + 2 }, (_, i) => `o${i}@x.com`).join(','));
  assert.equal(many.list.length, MAX_OWNER_RECIPIENTS); assert.equal(many.dropped, 2);
  assert.deepEqual(parseOwnerEmails(undefined).list, []);
});

test('two owner inboxes: each gets its OWN message and ledger row (single `to` per provider call)', async (t) => {
  const h = harness(t, { env: { ...ENV, OWNER_EMAIL: TWO } });
  assert.equal((await book(h)).status, 201);
  assert.deepEqual(h.mail.calls.map((c) => c.to).sort(), ['Owner-B@example.net', 'customer@example.com', 'owner-a@example.com']);
  assert.ok(h.mail.calls.every((c) => typeof c.to === 'string'));
  const owners = h.db.t.notifications.filter((n) => n.role === 'owner');
  assert.equal(owners.length, 2); assert.ok(owners.every((n) => n.status === 'delivered'));
  assert.equal(new Set(owners.map((n) => n.dedupe_key)).size, 2);
  assert.ok(owners.every((n) => !n.dedupe_key.includes('@')), 'addresses stay out of dedupe keys');
});

test('two owner inboxes: one bounces, the other is unaffected; neither supersedes the other', async (t) => {
  const mail = mailBy((to) => (to === 'owner-a@example.com' ? 'bounce' : 'delivered'));
  const h = harness(t, { env: { ...ENV, OWNER_EMAIL: TWO }, mail });
  await book(h, { customer_email: null });
  const byTo = Object.fromEntries(h.db.t.notifications.map((n) => [n.to_address, n.status]));
  assert.deepEqual(byTo, { 'owner-a@example.com': 'bounced', 'Owner-B@example.net': 'delivered' });
});

test('two owner inboxes: a failed "Confirmed" to one inbox is superseded by its own "Cancelled", the other inbox keeps both', async (t) => {
  const busy = { status: 503, body: { success: false, errors: [{ code: 1, message: 'busy' }] } };
  const mail = mailBy((to, n) => (to === 'owner-a@example.com' && n === 1 ? busy : 'delivered'));
  const h = harness(t, { env: { ...ENV, OWNER_EMAIL: TWO }, mail });
  const c = await book(h, { customer_email: null });
  await h.call('DELETE', '/v1/bookings/' + c.body.id);
  const createdA = h.db.t.notifications.find((n) => n.kind === 'created' && n.to_address === 'owner-a@example.com');
  assert.equal(createdA.status, 'failed');
  createdA.next_attempt_at = '2000-01-01T00:00:00.000Z';
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(createdA.status, 'superseded');
  const st = (kind, to) => h.db.t.notifications.find((n) => n.kind === kind && n.to_address === to).status;
  assert.equal(st('created', 'Owner-B@example.net'), 'delivered'); assert.equal(st('cancelled', 'Owner-B@example.net'), 'delivered');
  assert.equal(st('cancelled', 'owner-a@example.com'), 'delivered');
  assert.equal(mail.calls.filter((m) => m.to === 'owner-a@example.com').length, 2, 'A: the failed attempt + the cancellation, never a late "Confirmed"');
});

test('owner notice recorded while OWNER_EMAIL was unset is re-addressed once the setting exists (once, no duplicates)', async (t) => {
  const { OWNER_EMAIL, ...base } = ENV; const env = { ...base };
  const h = harness(t, { env });
  await book(h, { customer_email: null });
  const gap = h.db.t.notifications[0];
  assert.equal(gap.last_error, 'config_missing:OWNER_EMAIL'); assert.equal(h.mail.calls.length, 0);
  env.OWNER_EMAIL = TWO;                                                    // owner fixes the setting
  gap.next_attempt_at = '2000-01-01T00:00:00.000Z';
  await Promise.all([h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' }),
    h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' })]);
  assert.equal(gap.status, 'superseded'); assert.equal(gap.last_error, 'readdressed_to_configured_owner_email');
  assert.deepEqual(h.mail.calls.map((c) => c.to).sort(), ['Owner-B@example.net', 'owner-a@example.com']);
  await h.call('POST', '/v1/notifications/process', null, { authorization: 'Bearer admin' });
  assert.equal(h.mail.calls.length, 2, 'sent once per inbox, never again');
  assert.ok(h.db.t.notifications.filter((n) => n.to_address).every((n) => n.status === 'delivered' && n.kind === 'created'));
});

test('admin: email-config lists every owner inbox masked and reports invalid entries; list shows a masked recipient per owner row', async (t) => {
  const h = harness(t, { env: { ...ENV, OWNER_EMAIL: TWO + ', oops' } });
  const cfg = (await h.call('GET', '/v1/admin/email-config', null, { authorization: 'Bearer admin' })).body;
  assert.deepEqual(cfg.owner_emails, ['o***a@example.com', 'O***B@example.net']);
  assert.equal(cfg.owner_email, 'o***a@example.com'); assert.equal(cfg.owner_email_count, 2); assert.equal(cfg.owner_email_invalid_entries, 1);
  await book(h);
  const r = await h.call('GET', '/v1/bookings?business=aimanjack&with=notifications', null, { authorization: 'Bearer admin' });
  const notes = r.body.bookings[0].notifications;
  assert.deepEqual(notes.filter((n) => n.role === 'owner').map((n) => n.recipient).sort(), ['O***B@example.net', 'o***a@example.com']);
  assert.ok(notes.every((n) => !('to_address' in n)) && !JSON.stringify(r.body.bookings[0].notifications).includes('owner-a@'));
  assert.equal(notes.find((n) => n.role === 'customer').recipient, undefined);
});

// ── Microsoft 365 transport (owner decision 2026-10-09: no Workers Paid; send as jack@aimanjack.com via Graph) ────────
import { seal, unseal, _resetM365CacheForTests } from '../src/m365-mail.mjs';
const KEY = Buffer.alloc(32, 7).toString('base64');
const { CF_EMAIL_TOKEN: _cf, ...NO_CF } = ENV;
const M365 = { ...NO_CF, MAIL_TRANSPORT: 'm365', M365_AUTH: 'delegated', M365_TENANT_ID: 'tenant-guid', M365_CLIENT_ID: 'client-1',
  M365_SENDER: 'jack@aimanjack.com', M365_TOKEN_KEY: KEY, OWNER_EMAIL: 'jack@aimanjack.com' };
const msJson = (b, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } });
function fakeMs({ me = 'jack@aimanjack.com', send = [], refresh = 'ok', device = ['authorization_pending', 'ok'], onRefresh = null } = {}) {
  const calls = []; const st = { rt: 'rt-1', n: 0 };
  const handle = async (url, init = {}) => {
    const u = new URL(url);
    if (u.pathname === '/tenant-guid/oauth2/v2.0/devicecode') { calls.push({ kind: 'devicecode', p: new URLSearchParams(init.body) }); return msJson({ device_code: 'DEV-SECRET-123', user_code: 'ABCD-EFGH', verification_uri: 'https://microsoft.com/devicelogin', expires_in: 900, interval: 5 }); }
    if (u.pathname === '/tenant-guid/oauth2/v2.0/token') {
      const p = new URLSearchParams(init.body); calls.push({ kind: 'token', grant: p.get('grant_type'), p });
      const issue = () => { st.n += 1; st.rt = `rt-${st.n + 1}`; return msJson({ access_token: `at-${st.n}`, refresh_token: st.rt, expires_in: 3600 }); };
      if (p.get('grant_type') !== 'client_credentials') assert.equal(p.get('client_secret'), null, 'a public client never sends a secret');
      if (p.get('grant_type') === 'urn:ietf:params:oauth:grant-type:device_code') { assert.equal(p.get('device_code'), 'DEV-SECRET-123'); const step = device.shift() ?? 'ok'; return step === 'ok' ? issue() : typeof step === 'object' ? msJson(step.body, step.status) : msJson({ error: step }, 400); }
      if (p.get('grant_type') === 'refresh_token') { if (onRefresh) await onRefresh(); if (refresh !== 'ok') return msJson({ error: refresh }, 400); assert.equal(p.get('refresh_token'), st.rt, 'always presents the latest (rotated) refresh token'); return issue(); }
      if (p.get('grant_type') === 'client_credentials') { assert.equal(p.get('client_secret'), 'app-secret'); return msJson({ access_token: 'app-at', expires_in: 3600 }); }
    }
    if (u.hostname === 'graph.microsoft.com' && u.pathname === '/v1.0/me') return msJson({ mail: me, userPrincipalName: me });
    if (u.hostname === 'graph.microsoft.com' && u.pathname.endsWith('/sendMail')) {
      calls.push({ kind: 'send', path: u.pathname, auth: init.headers.authorization, body: JSON.parse(init.body) });
      const next = send.length ? send.shift() : 202;
      if (next instanceof Error) throw next;
      return typeof next === 'object' ? msJson(next.body, next.status) : new Response(null, { status: next });
    }
    throw new Error('unexpected Microsoft call ' + url);
  };
  return { calls, handle, st, sends: () => calls.filter((c) => c.kind === 'send') };
}
const ADMIN = { authorization: 'Bearer admin' };
async function connect(h) {
  const start = await h.call('POST', '/v1/admin/m365/connect', null, ADMIN);
  assert.equal(start.status, 200); assert.equal(start.body.user_code, 'ABCD-EFGH');
  assert.equal((await h.call('POST', '/v1/admin/m365/poll', null, ADMIN)).body.status, 'pending');
  return (await h.call('POST', '/v1/admin/m365/poll', null, ADMIN)).body;
}

test('M365 not connected yet: booking still 201, nothing sent, every row recorded as config_missing:M365_CONNECTION', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  assert.equal((await book(h)).status, 201);
  assert.equal(ms.sends().length, 0); assert.equal(h.mail.calls.length, 0, 'Cloudflare is never called');
  assert.ok(h.db.t.notifications.every((n) => n.status === 'failed' && n.last_error === 'config_missing:M365_CONNECTION' && n.attempts === 0));
});

test('M365 connect (device code): the device code never reaches the browser; only the sender mailbox can connect; tokens are sealed', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  assert.equal((await h.call('POST', '/v1/admin/m365/connect')).status, 401, 'admin token required');
  const start = await h.call('POST', '/v1/admin/m365/connect', null, ADMIN);
  assert.ok(!JSON.stringify(start.body).includes('DEV-SECRET'), 'device code stays server-side');
  assert.equal(ms.calls.find((c) => c.kind === 'devicecode').p.get('scope'), 'offline_access User.Read Mail.Send');
  const row = h.db.t.mail_tokens[0];
  assert.ok(row.pending_device_enc.startsWith('v1.') && !row.pending_device_enc.includes('DEV-SECRET'));
  assert.equal((await h.call('POST', '/v1/admin/m365/poll', null, ADMIN)).body.status, 'pending');
  const done = (await h.call('POST', '/v1/admin/m365/poll', null, ADMIN)).body;
  assert.equal(done.status, 'connected'); assert.equal(done.account, 'jack@aimanjack.com');
  assert.equal(row.pending_device_enc, null); assert.ok(!row.refresh_token_enc.includes('rt-'));
  assert.equal(await unseal(KEY, 'refresh', row.refresh_token_enc), ms.st.rt);
  await assert.rejects(unseal(KEY, 'device', row.refresh_token_enc), 'field-bound: a refresh token cannot be read as a device code');
  const cfg = (await h.call('GET', '/v1/admin/email-config', null, ADMIN)).body;
  assert.equal(cfg.transport, 'm365'); assert.equal(cfg.booking_from, 'jack@aimanjack.com'); assert.equal(cfg.m365.connected, true);
  assert.ok(!JSON.stringify(cfg).includes(KEY) && !JSON.stringify(cfg).includes('rt-'));
});

test('M365 connect refuses a different mailbox (the site would send as whoever signed in)', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs({ me: 'someone.else@aimanjack.com' }); const h = harness(t, { env: M365, ms });
  const r = await connect(h);
  assert.equal(r.status, 'wrong_account'); assert.equal(r.expected, 'jack@aimanjack.com');
  assert.equal(h.db.t.mail_tokens[0].refresh_token_enc ?? null, null, 'nothing stored');
});

test('M365 connected: booking emails go out via Graph /me/sendMail as the mailbox; owner Reply-To is the customer; ledger says queued (accepted, not proof of inbox)', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  assert.equal((await connect(h)).status, 'connected');
  assert.equal((await book(h)).status, 201);
  const sends = ms.sends(); assert.equal(sends.length, 2);
  assert.ok(sends.every((c) => c.path === '/v1.0/me/sendMail' && c.body.saveToSentItems === true && /^Bearer at-/.test(c.auth)));
  const cust = sends.find((c) => c.body.message.toRecipients[0].emailAddress.address === 'customer@example.com');
  const own = sends.find((c) => c.body.message.toRecipients[0].emailAddress.address === 'jack@aimanjack.com');
  assert.equal(cust.body.message.replyTo, undefined, 'customer replies go to the sending mailbox itself (jack@aimanjack.com)');
  assert.deepEqual(own.body.message.replyTo, [{ emailAddress: { address: 'customer@example.com' } }]);
  assert.match(cust.body.message.subject, /^Confirmed:/); assert.equal(cust.body.message.body.contentType, 'Text');
  assert.ok(h.db.t.notifications.every((n) => n.status === 'queued'));
});

test('M365 refresh-token rotation: a cold isolate refreshes with the stored token and stores the rotated one (sealed)', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  await connect(h);
  _resetM365CacheForTests();                                                // new isolate: no cached access token
  await book(h, { customer_email: null });
  assert.equal(ms.calls.filter((c) => c.grant === 'refresh_token').length, 1, 'one refresh, then the access token is cached');
  assert.equal(await unseal(KEY, 'refresh', h.db.t.mail_tokens[0].refresh_token_enc), ms.st.rt, 'rotated token stored');
  _resetM365CacheForTests();
  await book(h, { customer_email: null, start_at: (await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call')).body.days[2].slots[0].start_at });
  assert.equal(ms.sends().length, 2);
});

test('M365 sign-in revoked (invalid_grant): recorded as m365_reconnect_required, no attempts used, nothing sent', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  await connect(h); _resetM365CacheForTests(); ms.calls.length = 0;
  const ms2 = fakeMs({ refresh: 'invalid_grant' }); ms2.st.rt = ms.st.rt; h.ms.handle = ms2.handle;
  Object.assign(ms, { handle: ms2.handle });
  await book(h, { customer_email: null });
  const row = h.db.t.notifications[0];
  assert.equal(row.status, 'failed'); assert.equal(row.last_error, 'm365_reconnect_required:invalid_grant'); assert.equal(row.attempts, 0);
  assert.equal(ms2.sends().length, 0);
});

test('M365 provider results: 429 retried, 400 ErrorInvalidRecipients = bounced (never retried), network error = uncertain', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs({ send: [{ status: 429, body: { error: { code: 'ApplicationThrottled', message: 'x' } } }, 202] });
  const h = harness(t, { env: M365, ms });
  await connect(h);
  await book(h, { customer_email: null });
  const row = h.db.t.notifications[0]; assert.equal(row.status, 'failed'); assert.match(row.last_error, /http_429 code_ApplicationThrottled/);
  row.next_attempt_at = '2000-01-01T00:00:00.000Z';
  await h.call('POST', '/v1/notifications/process', null, ADMIN);
  assert.equal(row.status, 'queued');

  _resetM365CacheForTests();
  const ms2 = fakeMs({ send: [{ status: 400, body: { error: { code: 'ErrorInvalidRecipients', message: 'bad' } } }, new TypeError('fetch failed')] });
  const h2 = harness(t, { env: M365, ms: ms2 });
  await connect(h2);
  await book(h2);
  const st = h2.db.t.notifications.map((n) => n.status).sort();
  assert.deepEqual(st, ['bounced', 'uncertain']);
  assert.ok(h2.db.t.notifications.every((n) => !/bad|@/.test(n.last_error)), 'only codes stored, never provider messages or addresses');
});

test('M365 setup incomplete (no client id): recorded as config_missing:M365_CLIENT_ID; email-config says so; connect refused', async (t) => {
  _resetM365CacheForTests();
  const { M365_CLIENT_ID, ...env } = M365; const ms = fakeMs(); const h = harness(t, { env, ms });
  await book(h, { customer_email: null });
  assert.equal(h.db.t.notifications[0].last_error, 'config_missing:M365_CLIENT_ID');
  assert.equal((await h.call('GET', '/v1/admin/email-config', null, ADMIN)).body.m365.setup_gap, 'config_missing:M365_CLIENT_ID');
  const c = await h.call('POST', '/v1/admin/m365/connect', null, ADMIN);
  assert.equal(c.status, 409); assert.equal(c.body.error, 'config_missing:M365_CLIENT_ID');
  assert.equal(ms.calls.length, 0);
});

test('M365 app permission (fallback): client credentials, sends via /users/{sender}/sendMail, no token table needed', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: { ...M365, M365_AUTH: 'app', M365_CLIENT_SECRET: 'app-secret', M365_TOKEN_KEY: '' }, ms });
  await book(h, { customer_email: null });
  assert.equal(ms.sends()[0].path, '/v1.0/users/jack%40aimanjack.com/sendMail'); assert.equal(ms.sends()[0].auth, 'Bearer app-at');
  assert.equal(h.db.t.notifications[0].status, 'queued'); assert.equal(h.db.t.mail_tokens.length, 0);
});

test('sealing: wrong key or tampered ciphertext fails closed', async () => {
  const sealed = await seal(KEY, 'refresh', 'secret-token');
  assert.equal(await unseal(KEY, 'refresh', sealed), 'secret-token');
  await assert.rejects(unseal(Buffer.alloc(32, 9).toString('base64'), 'refresh', sealed));
  await assert.rejects(unseal(KEY, 'refresh', sealed.slice(0, -4) + 'AAAA'));
});

// ── review fixes: abuse guards, disconnect, budget, stale mail, reconnect visibility ──────────────────────────────
test('H1: a malformed customer_email is refused at booking (400) instead of reaching the mailbox', async (t) => {
  const h = harness(t);
  const r = await book(h, { customer_email: 'john at gmail' });
  assert.equal(r.status, 400); assert.equal(r.body.error, 'email_invalid');
  assert.equal(h.db.t.bookings.length, 0);
});

test('H1: public bookings are rate-limited per IP (the 7th within an hour is refused); admin bookings are not', async (t) => {
  const h = harness(t);
  const avail = (await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call')).body;
  const slots = avail.days.flatMap((d) => d.slots.map((x) => x.start_at));
  const statuses = [];
  for (let i = 0; i < 7; i += 1) statuses.push((await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: slots[i], customer_name: 'P', customer_phone: '4695550100' }, { 'cf-connecting-ip': '198.51.100.7' })).status);
  assert.deepEqual(statuses, [201, 201, 201, 201, 201, 201, 429]);
  assert.equal((await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: slots[8], customer_name: 'P', customer_phone: '4695550100' }, { 'cf-connecting-ip': '198.51.100.7', 'x-source': 'admin', authorization: 'Bearer admin' })).status, 201);
});

test('H1: one customer address gets at most RECIPIENT_DAILY_CAP emails per 24 h; the next is HELD with an alert; owner can release', async (t) => {
  const alerts = []; const h = harness(t, { env: { ...ENV, ALERT_NTFY_URL: 'https://ntfy.test/amj' }, alerts });
  const slots = (await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call')).body.days.flatMap((d) => d.slots.map((x) => x.start_at));
  for (let i = 0; i < 5; i += 1) await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: slots[i], customer_name: 'P', customer_phone: '4695550100', customer_email: 'target@example.com' });
  const cust = h.db.t.notifications.filter((n) => n.role === 'customer');
  assert.deepEqual(cust.map((n) => n.status), ['delivered', 'delivered', 'delivered', 'delivered', 'held']);
  assert.equal(h.db.t.notifications.filter((n) => n.role === 'owner' && n.status === 'delivered').length, 5, 'owner notices are not capped per recipient');
  assert.ok(alerts.some((a) => /held/.test(a) && !/target@/.test(a)));
  await h.call('POST', '/v1/notifications/requeue', { ids: [cust[4].id] }, ADMIN);
  assert.equal(cust[4].status, 'delivered', 'an explicit owner release overrides the per-address cap');
});

test('H1: global daily cap defers sending (no attempts used) once MAIL_DAILY_CAP sends happened in 24 h', async (t) => {
  const h = harness(t, { env: { ...ENV, MAIL_DAILY_CAP: '2' } });
  await book(h);                                                            // customer + owner = 2 sends
  const slots = (await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call')).body.days.flatMap((d) => d.slots.map((x) => x.start_at));
  await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: slots[3], customer_name: 'P', customer_phone: '4695550100' });
  const last = h.db.t.notifications.at(-1);
  assert.equal(last.status, 'failed'); assert.equal(last.last_error, 'daily_send_cap_reached'); assert.equal(last.attempts, 0);
  assert.equal(h.mail.calls.length, 2);
});

test('M4: a stored malformed customer email (legacy row) gets no confirmation and is not used as the owner Reply-To', async (t) => {
  const { composeMessages } = await import('../src/booking-notify.mjs');
  const fmt = { fmtWhen: () => 'Mon', prettyPhone: (p) => p, manageUrl: 'https://x/m', siteOrigin: 'https://x' };
  const msgs = composeMessages(ENV, { customer_email: 'john at gmail', customer_name: 'J', customer_phone: '1', service_name: 'Call', cancel_window_hours: 2 }, 'created', 'voice', fmt);
  assert.deepEqual(msgs.map((m) => m.role), ['owner']); assert.equal(msgs[0].reply_to, undefined); assert.match(msgs[0].text, /invalid address/);
});

test('M1: a disconnect elsewhere stops sending even where an access token is still cached', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  await connect(h);                                                         // this "isolate" now has a cached access token
  Object.assign(h.db.t.mail_tokens[0], { refresh_token_enc: null, account: null, generation: h.db.t.mail_tokens[0].generation + 1 });  // disconnected by another isolate
  await book(h, { customer_email: null });
  assert.equal(ms.sends().length, 0); assert.equal(h.db.t.notifications[0].last_error, 'config_missing:M365_CONNECTION');
});

test('M1: a refresh racing a disconnect cannot write its rotated token back (no resurrection, nothing sent)', async (t) => {
  _resetM365CacheForTests();
  let h; const ms = fakeMs({ onRefresh: async () => { await h.call('POST', '/v1/admin/m365/disconnect', null, ADMIN); } });
  h = harness(t, { env: M365, ms });
  await connect(h); _resetM365CacheForTests();
  await book(h, { customer_email: null });
  assert.equal(h.db.t.mail_tokens[0].refresh_token_enc, null, 'stays disconnected');
  assert.equal(ms.sends().length, 0);
});

test('M2: the runtime refusing a request (subrequest limit) is a retryable failure, not "uncertain"', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs({ send: [new Error('Too many subrequests.')] }); const h = harness(t, { env: M365, ms });
  await connect(h);
  await book(h, { customer_email: null });
  const row = h.db.t.notifications[0];
  assert.equal(row.status, 'failed'); assert.equal(row.last_error, 'subrequest_limit_not_sent');
});

test('M3: customer emails stuck for over a day (e.g. before connecting) expire instead of arriving late; owner notices still go', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  await book(h);                                                            // not connected: both rows wait
  h.db.t.notifications.forEach((n) => { n.created_at = '2000-01-01T00:00:00.000Z'; n.next_attempt_at = '2000-01-01T00:00:00.000Z'; });
  await connect(h);
  await h.call('POST', '/v1/notifications/process', null, ADMIN);
  const st = Object.fromEntries(h.db.t.notifications.map((n) => [n.role, n.status]));
  assert.deepEqual(st, { customer: 'expired', owner: 'queued' });
  assert.equal(ms.sends().length, 1);
});

test('M5: a revoked sign-in is flagged on the connection, alerted once, and shown as not connected', async (t) => {
  _resetM365CacheForTests();
  const alerts = []; const ms = fakeMs(); const h = harness(t, { env: { ...M365, ALERT_NTFY_URL: 'https://ntfy.test/amj' }, ms, alerts });
  await connect(h); _resetM365CacheForTests();
  const ms2 = fakeMs({ refresh: 'invalid_grant' }); ms.handle = ms2.handle;
  await book(h, { customer_email: null });
  const slots = (await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call')).body.days.flatMap((d) => d.slots.map((x) => x.start_at));
  await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: slots[4], customer_name: 'P', customer_phone: '4695550100' });
  assert.equal(h.db.t.mail_tokens[0].needs_reconnect, true);
  assert.equal(alerts.filter((a) => /needs renewing/.test(a)).length, 1, 'one alert, not one per message');
  const cfg = (await h.call('GET', '/v1/admin/email-config', null, ADMIN)).body.m365;
  assert.equal(cfg.connected, false); assert.equal(cfg.needs_reconnect, true); assert.equal(cfg.last_error, 'invalid_grant');
  assert.equal(ms2.calls.filter((c) => c.grant === 'refresh_token').length, 1, 'stops asking Microsoft once flagged');
});

test('M5: keep-alive refreshes an idle connection weekly (so it never reaches the 90-day expiry)', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  await connect(h);
  h.db.t.mail_tokens[0].last_refresh_at = '2000-01-01T00:00:00.000Z';
  await h.call('POST', '/v1/notifications/process', null, ADMIN);
  assert.equal(ms.calls.filter((c) => c.grant === 'refresh_token').length, 1);
  assert.ok(h.db.t.mail_tokens[0].last_refresh_at > '2026-01-01');
  await h.call('POST', '/v1/notifications/process', null, ADMIN);
  assert.equal(ms.calls.filter((c) => c.grant === 'refresh_token').length, 1, 'fresh: no second refresh');
});

test('L1/L10: a stale-token 401 is retried at once with a fresh token; 504 is uncertain (may have been accepted)', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs({ send: [{ status: 401, body: { error: { code: 'InvalidAuthenticationToken' } } }, 202, { status: 504, body: {} }] });
  const h = harness(t, { env: M365, ms });
  await connect(h);
  await book(h, { customer_email: null });
  assert.equal(h.db.t.notifications[0].status, 'queued'); assert.equal(ms.sends().length, 2);
  const slots = (await h.call('GET', '/v1/availability?business=aimanjack&service=demo-call')).body.days.flatMap((d) => d.slots.map((x) => x.start_at));
  await h.call('POST', '/v1/bookings', { business: 'aimanjack', service: 'demo-call', start_at: slots[4], customer_name: 'P', customer_phone: '4695550100' });
  assert.equal(h.db.t.notifications.at(-1).status, 'uncertain');
});

test('L4: a temporary Microsoft error while signing in keeps the sign-in alive', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs({ device: [{ status: 503, body: { error: 'temporarily_unavailable' } }, 'ok'] }); const h = harness(t, { env: M365, ms });
  await h.call('POST', '/v1/admin/m365/connect', null, ADMIN);
  assert.equal((await h.call('POST', '/v1/admin/m365/poll', null, ADMIN)).body.status, 'pending');
  assert.equal((await h.call('POST', '/v1/admin/m365/poll', null, ADMIN)).body.status, 'connected');
});

test('L5: if M365_SENDER changes after connecting, nothing is sent as the old mailbox', async (t) => {
  _resetM365CacheForTests();
  const ms = fakeMs(); const h = harness(t, { env: M365, ms });
  await connect(h);
  const h2 = harness(t, { env: { ...M365, M365_SENDER: 'bookings@aimanjack.com' }, db: h.db, ms });
  await book(h2, { customer_email: null });
  assert.equal(h.db.t.notifications[0].last_error, 'm365_connected_account_mismatch'); assert.equal(ms.sends().length, 0);
});

test('L7: coupon form says "temporarily unavailable" (503, no coupon row) while the mailbox is not connected', async (t) => {
  _resetM365CacheForTests();
  const h = harness(t, { env: M365, ms: fakeMs() });
  const req = new Request('https://aimanjack.com/v1/coupons', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://aimanjack.com', 'cf-connecting-ip': '203.0.113.9' }, body: JSON.stringify({ email: 'team@example.com' }) });
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async (url, init) => (String(url).includes('/rest/v1/coupon') ? new Response('[]', { status: 200 }) : fetchBefore(url, init));
  const r = await onRequest({ request: req, env: M365, params: { route: ['coupons'] }, waitUntil() {} });
  globalThis.fetch = fetchBefore;
  assert.equal(r.status, 503); assert.equal((await r.json()).error, 'email_unavailable');
});
