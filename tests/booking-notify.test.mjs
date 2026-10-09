// Booking email ledger (GitHub qianquandong/revenue-os#2): sender/reply-to, durable delivery state, retries, no double
// send, configuration gaps recorded, and an email problem never failing a booking. Offline: an in-memory PostgREST and
// a fake Cloudflare Email Sending API. Real-mailbox authentication (SPF/DKIM/DMARC) is NOT provable here — see
// scripts/booking-email-e2e.md (owner-authorized live check).
import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequest } from '../functions/v1/[[route]].js';
import { createNotifier, classifyProviderResult, describeMailConfig, MAX_ATTEMPTS } from '../src/booking-notify.mjs';

// ── in-memory PostgREST (only what the booking API uses) ───────────────────────────────────────────────────────────
function fakeDb({ failNotifications = false, failEvents = false } = {}) {
  const t = { businesses: [{ id: 'aimanjack', name: 'AI Man Jack', tz: 'America/Chicago', min_lead_min: 60, max_days_ahead: 30, cancel_window_hours: 2 }],
    services: [{ business_id: 'aimanjack', id: 'demo-call', name: '20-Minute AI Workflow Call', duration_min: 20, buffer_min: 0, capacity: 1, active: true }],
    staff: [{ business_id: 'aimanjack', id: 'jack', name: 'Jack Qian', active: true }],
    availability_rules: [0, 1, 2, 3, 4, 5, 6].map((w) => ({ business_id: 'aimanjack', staff_id: null, weekday: w, start_hm: '08:00', end_hm: '20:00' })),
    blocks: [], bookings: [], events: [], notifications: [] };
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
      for (const r of list) {
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

function harness(t, { env = ENV, db = fakeDb(), mail = fakeMail(), alerts = [] } = {}) {
  const original = globalThis.fetch; const errors = [];
  t.after(() => { globalThis.fetch = original; });
  t.mock.method(console, 'error', (...a) => { errors.push(a.join(' ')); });
  globalThis.fetch = async (url, init) => {
    const s = String(url);
    if (s.startsWith('https://db.test/')) return db.handle(s, init);
    if (s.includes('/email/sending/send')) return mail.handle(s, init);
    if (s.startsWith('https://ntfy.test/')) { alerts.push(init.body); return new Response('ok'); }
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
  return { db, mail, call, errors, alerts };
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
