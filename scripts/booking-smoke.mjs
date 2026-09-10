#!/usr/bin/env node
// End-to-end check of the booking API. Fails loudly if any rule breaks.
//   node scripts/booking-smoke.mjs http://localhost:8788 [ADMIN_TOKEN]
// Books, replays the same Idempotency-Key, double-books, reschedules, cancels — then cancels its
// own test booking, so it is safe against production (rows stay as 'SMOKE TEST', status cancelled).
import assert from 'node:assert/strict';
const [base = 'http://localhost:8788', token] = process.argv.slice(2);
const call = async (m, p, body, h = {}) => {
  const r = await fetch(base + p, { method: m, headers: { 'content-type': 'application/json', 'x-source': 'admin', ...h }, body: body && JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
};
const B = 'aimanjack', S = 'demo-call';

const av = await call('GET', `/v1/availability?business=${B}&service=${S}`);
assert.equal(av.status, 200, JSON.stringify(av.body));
assert.ok(av.body.days.length >= 1, 'no open days');
const [s1, s2] = av.body.days.flatMap((d) => d.slots);
assert.match(s1.start_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, 'ISO 8601 with offset');
assert.ok(Date.parse(s1.start_at) - Date.now() >= 60 * 60000, 'min lead 60 min');
console.log('availability ok:', av.body.days.length, 'days, first', s1.start_at);

const key = 'smoke-' + Date.now();
const mk = (h) => call('POST', '/v1/bookings', { business: B, service: S, start_at: s1.start_at, customer_name: 'SMOKE TEST', customer_phone: '(469) 555-0100', note: 'automated check' }, h);
const c1 = await mk({ 'idempotency-key': key });
assert.equal(c1.status, 201, JSON.stringify(c1.body));
assert.equal(c1.body.customer_phone, '+14695550100');
assert.equal(c1.body.start_at, s1.start_at);
const id = c1.body.id;
console.log('created', id, c1.body.manage_url);

const c2 = await mk({ 'idempotency-key': key });
assert.equal(c2.status, 200); assert.equal(c2.body.id, id, 'idempotent replay returns the same booking');
const c3 = await mk({ 'idempotency-key': key + '-b' });
assert.equal(c3.status, 409); assert.equal(c3.body.error, 'slot_unavailable', 'double booking blocked');
const av2 = await call('GET', `/v1/availability?business=${B}&service=${S}`);
assert.ok(!av2.body.days.flatMap((d) => d.slots).some((s) => s.start_at === s1.start_at), 'booked slot disappears');
console.log('idempotency + double-booking ok');

const g = await call('GET', `/v1/bookings/${id}`);
assert.equal(g.status, 200); assert.equal(g.body.status, 'confirmed');
const r1 = await call('PATCH', `/v1/bookings/${id}`, { start_at: s2.start_at });
assert.equal(r1.status, 200, JSON.stringify(r1.body)); assert.equal(r1.body.start_at, s2.start_at);
const av3 = await call('GET', `/v1/availability?business=${B}&service=${S}`);
assert.ok(av3.body.days.flatMap((d) => d.slots).some((s) => s.start_at === s1.start_at), 'old slot reopens after reschedule');
console.log('reschedule ok →', s2.start_at);

const bad = await call('POST', '/v1/bookings', { business: B, service: S, start_at: s1.start_at, customer_name: 'x', customer_phone: '12' });
assert.equal(bad.status, 400); assert.equal(bad.body.error, 'phone_invalid');
const bad2 = await call('PATCH', `/v1/bookings/${id}`, { start_at: '2020-01-01T10:00:00-06:00' });
assert.equal(bad2.status, 409, 'past slot rejected');

const d1 = await call('DELETE', `/v1/bookings/${id}`);
assert.equal(d1.status, 200); assert.equal(d1.body.status, 'cancelled');
const r2 = await call('PATCH', `/v1/bookings/${id}`, { start_at: s1.start_at });
assert.equal(r2.status, 409); assert.equal(r2.body.error, 'booking_cancelled');
const nf = await call('GET', '/v1/bookings/nope');
assert.equal(nf.status, 404);
console.log('cancel ok');

if (token) {
  const l = await call('GET', `/v1/bookings?business=${B}`, null, { authorization: `Bearer ${token}` });
  assert.equal(l.status, 200); assert.ok(l.body.bookings.some((b) => b.id === id), 'list includes the test booking');
  assert.equal((await call('GET', `/v1/bookings?business=${B}`)).status, 401);
  console.log('admin list ok:', l.body.count, 'bookings');
}
console.log('ALL OK');
