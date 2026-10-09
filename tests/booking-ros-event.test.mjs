// Booking API → Revenue OS (contract aimanjack.booking.v1). fetch is mocked: an in-memory stand-in for Supabase (schema booking)
// plus the ROS endpoint. Nothing leaves the machine.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHmac } from 'node:crypto';
import { onRequest } from '../functions/v1/[[route]].js';

const ROS_URL = 'https://ros.test/v1/events/booking', ROS_SECRET = 'booking-webhook-test-secret', EMAIL_SECRET = 'email-hash-test-secret-0123456789';
const env = {
  SUPABASE_URL: 'https://db.test', SB_SECRET_KEY: 'test-key', CF_ACCOUNT_ID: 'account', CF_EMAIL_TOKEN: '', EMAIL_FROM: 'bookings@aimanjack.com',
  OWNER_EMAIL: 'jack@aimanjack.com', SITE_ORIGIN: 'https://aimanjack.com',
  ROS_BOOKING_WEBHOOK_URL: ROS_URL, ROS_BOOKING_WEBHOOK_SECRET: ROS_SECRET, EMAIL_HASH_SECRET: EMAIL_SECRET,
};
const hmac = (k, s) => createHmac('sha256', k).update(s).digest('hex');
const response = (body, status = 200) => new Response(body === null ? null : typeof body === 'string' ? body : JSON.stringify(body), { status });
const CUSTOMER = { customer_name: 'Dana Reyes', customer_phone: '(214) 555-0147', customer_email: 'Dana.Reyes+Ops@Northwind-Example.com', note: 'Northwind Example — weekly dispatch spreadsheet' };
const PII = ['Dana', 'Reyes', 'dana.reyes', '555', '0147', '+12145550147', 'dispatch', 'Northwind Example', '@'];

// businesses: the AI Man Jack sales call (db/schema.sql seed) and a receptionist client on the same API.
function fake(t, { ros = () => response({ ok: true }) } = {}) {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const businesses = {
    aimanjack: { id: 'aimanjack', name: 'AI Man Jack', tz: 'America/Chicago', min_lead_min: 60, max_days_ahead: 30, cancel_window_hours: 2 },
    'acme-salon': { id: 'acme-salon', name: 'Acme Salon', tz: 'America/Chicago', min_lead_min: 60, max_days_ahead: 30, cancel_window_hours: 2 },
  };
  const services = [
    { business_id: 'aimanjack', id: 'demo-call', name: '20-Minute AI Workflow Call', duration_min: 20, buffer_min: 0, capacity: 1, active: true },
    { business_id: 'aimanjack', id: 'onsite-visit', name: 'Onsite visit', duration_min: 60, buffer_min: 0, capacity: 1, active: true },
    { business_id: 'acme-salon', id: 'haircut', name: 'Haircut', duration_min: 30, buffer_min: 0, capacity: 1, active: true },
  ];
  const staff = [{ business_id: 'aimanjack', id: 'jack', name: 'Jack Qian' }, { business_id: 'acme-salon', id: 'sam', name: 'Sam' }];
  const bookings = new Map(), events = [], sent = [];
  let clock = Date.parse('2026-10-09T12:00:00.000Z');
  const stamp = () => new Date(clock += 1000).toISOString();
  const full = (b) => {
    const s = services.find((x) => x.business_id === b.business_id && x.id === b.service_id), bz = businesses[b.business_id];
    return { ...b, service_name: s.name, duration_min: s.duration_min, buffer_min: s.buffer_min, capacity: s.capacity, staff_name: staff.find((x) => x.id === b.staff_id).name,
      business_name: bz.name, tz: bz.tz, cancel_window_hours: bz.cancel_window_hours };
  };
  globalThis.fetch = async (url, options = {}) => {
    url = String(url);
    const method = options.method || 'GET';
    if (url === ROS_URL) { sent.push({ headers: options.headers, body: options.body }); return ros(); }
    if (!url.startsWith('https://db.test/rest/v1/')) throw new Error(`unexpected fetch ${method} ${url}`);
    const u = new URL(url), path = u.pathname.replace('/rest/v1/', ''), p = Object.fromEntries(u.searchParams), eq = (k) => p[k]?.replace(/^eq\./, '');
    const body = options.body ? JSON.parse(options.body) : null;
    if (path === 'businesses') return response(businesses[eq('id')] ? [businesses[eq('id')]] : []);
    if (path === 'services') return response(services.filter((s) => s.business_id === eq('business_id') && s.id === eq('id')));
    if (path === 'staff') return response(staff.filter((s) => s.business_id === eq('business_id')));
    if (path === 'availability_rules') return response([0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ staff_id: null, weekday, start_hm: '09:00', end_hm: '17:00' })));
    if (path === 'blocks') return response([]);
    if (path === 'bookings' && method === 'GET') return response([...bookings.values()].filter((b) => b.business_id === eq('business_id') && b.status === 'confirmed'));
    if (path === 'rpc/create_booking') {
      const at = stamp();
      const { lo, hi, capacity, ...row } = body.p;
      bookings.set(row.id, { ...row, status: 'confirmed', created_at: at, updated_at: at });
      return response(true);
    }
    if (path === 'rpc/move_booking') {
      const b = bookings.get(body.p.id);
      Object.assign(b, { start_at: body.p.start_at, end_at: body.p.end_at, staff_id: body.p.staff_id, updated_at: stamp() });
      return response(true);
    }
    if (path === 'bookings' && method === 'PATCH') { const b = bookings.get(eq('id')); if (b?.status === 'confirmed') Object.assign(b, { status: 'cancelled', updated_at: stamp() }); return response(null, 204); }
    if (path === 'bookings_full') {
      const rows = [...bookings.values()].filter((b) => (p.id ? b.id === eq('id') : b.business_id === eq('business_id') && b.idempotency_key === eq('idempotency_key')));
      return response(rows.map(full));
    }
    if (path === 'events') { events.push(body); return response(null, 201); }
    throw new Error(`unexpected supabase ${method} ${path}`);
  };
  return { bookings, events, sent };
}

async function call(e, method, route, body, headers = {}) {
  const jobs = [];
  const qs = route[0] === 'availability' ? `?business=${body.business}&service=${body.service}` : '';
  const req = new Request(`https://aimanjack.com/v1/${route.join('/')}${qs}`, { method, headers: { 'content-type': 'application/json', ...headers }, body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body) });
  const res = await onRequest({ request: req, env: e, params: { route }, waitUntil: (p) => jobs.push(p) });
  await Promise.allSettled(jobs);
  return { res, json: await res.json(), jobs };
}
const slots = async (e, business, service) => (await call(e, 'GET', ['availability'], { business, service })).json.days.flatMap((d) => d.slots);
async function book(e, business = 'aimanjack', service = 'demo-call', extra = {}) {
  const s = await slots(e, business, service);
  const r = await call(e, 'POST', ['bookings'], { business, service, start_at: s[0].start_at, staff: s[0].staff_id, ...CUSTOMER, ...extra });
  assert.equal(r.res.status, 201, JSON.stringify(r.json));
  return { ...r, slots: s };
}
const verifies = ({ headers, body }) => headers['x-ros-signature'] === `sha256=${hmac(ROS_SECRET, `${headers['x-ros-timestamp']}.${body}`)}`;
function assertNoPii(body) {
  for (const s of PII) assert.ok(!body.toLowerCase().includes(s.toLowerCase()), `ROS body contains ${s}`);
  const ev = JSON.parse(body);
  for (const k of ['customer_name', 'customer_phone', 'customer_email', 'name', 'phone', 'email', 'note']) assert.ok(!(k in ev), `ROS body has ${k}`);
}

test('created, rescheduled and canceled each emit exactly one signed aimanjack.booking.v1 event with the right type', async (t) => {
  const db = fake(t);
  const created = await book(env, 'aimanjack', 'demo-call', { ft_utm_source: 'linkedin', ft_utm_campaign: 'q4', ft_ref: 'www.linkedin.com', ft_landing: '/ai-training/' });
  assert.equal(db.sent.length, 1, 'one event on create');
  const id = created.json.id;
  const moved = await call(env, 'PATCH', ['bookings', id], { start_at: created.slots[3].start_at });
  assert.equal(moved.res.status, 200, JSON.stringify(moved.json));
  assert.equal(db.sent.length, 2, 'one event on reschedule');
  const canceled = await call(env, 'DELETE', ['bookings', id]);
  assert.equal(canceled.json.status, 'cancelled');
  assert.equal(db.sent.length, 3, 'one event on cancel');
  const again = await call(env, 'DELETE', ['bookings', id]);
  assert.equal(again.res.status, 200);
  assert.equal(db.sent.length, 3, 'canceling an already-canceled booking changes nothing and emits nothing');

  const evs = db.sent.map((x) => JSON.parse(x.body));
  assert.deepEqual(evs.map((e) => e.event_type), ['booking.created', 'booking.rescheduled', 'booking.canceled']);
  assert.equal(new Set(evs.map((e) => e.event_id)).size, 3, 'event_id unique per change');
  for (const [i, x] of db.sent.entries()) {
    const ev = evs[i];
    assert.ok(verifies(x), 'signature verifies');
    assert.equal(x.headers['content-type'], 'application/json');
    assert.equal(x.headers['x-ros-event-id'], ev.event_id);
    assert.ok(Math.abs(Number(x.headers['x-ros-timestamp']) - Date.now() / 1000) < 60);
    assert.equal(ev.schema, 'aimanjack.booking.v1');
    assert.equal(ev.booking_id, id);
    assert.equal(ev.business_id, 'aimanjack');
    assert.equal(ev.service_id, 'demo-call');
    assert.equal(ev.duration_min, 20);
    assert.equal(ev.timezone, 'America/Chicago');
    assert.match(ev.starts_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/);
    assert.match(ev.occurred_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(ev.email_hmac, hmac(EMAIL_SECRET, 'email|dana.reyes@northwind-example.com'), 'keyed, normalized like ROS subjectKey (lowercase, +tag stripped)');
    assert.equal(ev.company_domain, 'northwind-example.com');
    assertNoPii(x.body);
  }
  assert.equal(evs[0].starts_at, new Date(created.slots[0].start_at).toISOString());
  assert.equal(evs[1].starts_at, new Date(created.slots[3].start_at).toISOString(), 'rescheduled carries the new time');
  assert.equal(evs[2].starts_at, evs[1].starts_at);
  assert.deepEqual(evs[0].utm, { utm_source: 'linkedin', utm_campaign: 'q4', referrer_host: 'linkedin.com', landing_path: '/ai-training/' }, 'first-touch when the request carries it');
  assert.equal(evs[1].utm, null);
  assert.equal(db.events.length, 3, 'booking.events log unchanged: one row per write');
});

test('receptionist-client bookings (other business, or another AI Man Jack service) emit nothing', async (t) => {
  const db = fake(t);
  const salon = await book(env, 'acme-salon', 'haircut');
  await call(env, 'PATCH', ['bookings', salon.json.id], { start_at: salon.slots[2].start_at });
  await call(env, 'DELETE', ['bookings', salon.json.id]);
  await book(env, 'aimanjack', 'onsite-visit');
  assert.equal(db.events.length, 4, 'the bookings themselves happened');
  assert.equal(db.sent.length, 0, 'nothing reached Revenue OS');
});

test('webhook env unset (either variable) → no event, booking unaffected', async (t) => {
  for (const drop of [['ROS_BOOKING_WEBHOOK_URL'], ['ROS_BOOKING_WEBHOOK_SECRET'], ['ROS_BOOKING_WEBHOOK_URL', 'ROS_BOOKING_WEBHOOK_SECRET']]) {
    const db = fake(t);
    const e = { ...env }; for (const k of drop) delete e[k];
    const r = await book(e);
    await call(e, 'PATCH', ['bookings', r.json.id], { start_at: r.slots[1].start_at });
    await call(e, 'DELETE', ['bookings', r.json.id]);
    assert.equal(db.sent.length, 0, `unset ${drop.join('+')}`);
  }
});

test('the intake webhook settings alone do not send booking events', async (t) => {
  const db = fake(t);
  const { ROS_BOOKING_WEBHOOK_URL, ROS_BOOKING_WEBHOOK_SECRET, ...rest } = env;
  await book({ ...rest, ROS_WEBHOOK_URL: ROS_URL, ROS_WEBHOOK_SECRET: 'intake-secret' });
  assert.equal(db.sent.length, 0);
});

test('free-mail booker → company_domain null; no EMAIL_HASH_SECRET → email_hmac null; no email → both null; never a raw email', async (t) => {
  const db = fake(t);
  await book(env, 'aimanjack', 'demo-call', { customer_email: 'dana.reyes@gmail.com' });
  const { EMAIL_HASH_SECRET, ...unsalted } = env;
  await book(unsalted);
  await book(env, 'aimanjack', 'demo-call', { customer_email: undefined });
  const [free, nosecret, noemail] = db.sent.map((x) => JSON.parse(x.body));
  assert.equal(free.company_domain, null);
  assert.equal(free.email_hmac, hmac(EMAIL_SECRET, 'email|dana.reyes@gmail.com'));
  assert.equal(nosecret.email_hmac, null, 'never an unkeyed hash');
  assert.equal(nosecret.company_domain, 'northwind-example.com');
  assert.equal(noemail.email_hmac, null);
  assert.equal(noemail.company_domain, null);
  for (const x of db.sent) { assert.ok(verifies(x)); assertNoPii(x.body); }
  assert.ok(!db.sent[0].body.includes('gmail'), 'free-mail domain is not sent either');
});

test('ROS failures (HTTP error or network error) never affect the booking response', async (t) => {
  for (const ros of [() => response('down', 503), () => { throw new Error('network down'); }]) {
    const lines = [];
    t.mock.method(console, 'error', (...a) => lines.push(a.join(' ')));
    const db = fake(t, { ros });
    const r = await book(env);
    assert.equal(r.json.status, 'confirmed');
    const m = await call(env, 'PATCH', ['bookings', r.json.id], { start_at: r.slots[1].start_at });
    assert.equal(m.res.status, 200);
    const c = await call(env, 'DELETE', ['bookings', r.json.id]);
    assert.equal(c.res.status, 200);
    assert.equal(db.sent.length, 3, 'attempted each time');
    assert.ok(lines.some((l) => /^ros (booking webhook failed|webhook rejected 503)/.test(l)), 'failure is logged');
    for (const s of PII.filter((x) => x !== '@')) assert.ok(!lines.join('\n').toLowerCase().includes(s.toLowerCase()), `log contains ${s}`);
  }
});

test('idempotent create replay (same Idempotency-Key) emits no second event', async (t) => {
  const db = fake(t);
  const s = await slots(env, 'aimanjack', 'demo-call');
  const body = { business: 'aimanjack', service: 'demo-call', start_at: s[0].start_at, staff: s[0].staff_id, ...CUSTOMER };
  const a = await call(env, 'POST', ['bookings'], body, { 'idempotency-key': 'k-1' });
  const b = await call(env, 'POST', ['bookings'], body, { 'idempotency-key': 'k-1' });
  assert.equal(a.res.status, 201); assert.equal(b.res.status, 200); assert.equal(a.json.id, b.json.id);
  assert.equal(db.sent.length, 1);
});
