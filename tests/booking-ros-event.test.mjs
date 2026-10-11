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

// Delivery/ordering/retry assertions now execute the real SQL triggers in ros-events.test.mjs.
test('booking lifecycle works with event processing disabled, even when old URLs remain', async t => {
  const db=fake(t);
  const available=await slots(env,'aimanjack','demo-call');
  const created=await book(env,'aimanjack','demo-call',{start_at:available[12].start_at});
  const id=created.json.id;
  assert.equal((await call(env,'PATCH',['bookings',id],{start_at:created.slots[15].start_at})).res.status,200);
  assert.equal((await call(env,'DELETE',['bookings',id])).res.status,200);
  assert.equal(db.sent.length,0,'no fire-and-forget event path remains');
});

test('enabling delivery without the migration fails before creating a booking', async t=>{
  const db=fake(t);
  const r=await call({...env,ROS_EVENTS_ENABLED:'true'},'POST',['bookings'],{business:'aimanjack',service:'demo-call',...CUSTOMER});
  assert.equal(r.res.status,503);assert.equal(r.json.error,'customer_sync_unavailable');assert.equal(db.bookings.size,0);assert.equal(db.sent.length,0);
});

test('idempotent booking replay creates no additional booking', async t=>{
  const db=fake(t);const s=await slots(env,'aimanjack','demo-call');
  const body={business:'aimanjack',service:'demo-call',start_at:s[0].start_at,...CUSTOMER};
  const a=await call(env,'POST',['bookings'],body,{'idempotency-key':'same'});
  const b=await call(env,'POST',['bookings'],body,{'idempotency-key':'same'});
  assert.equal(a.res.status,201);assert.equal(b.res.status,200);assert.equal(a.json.id,b.json.id);assert.equal(db.bookings.size,1);
});
