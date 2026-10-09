#!/usr/bin/env node
// LIVE end-to-end check of booking emails (revenue-os#2). Sends REAL email to the test inbox and to OWNER_EMAIL.
// Run only with a recorded owner approval, against production or an owner-approved preview deployment:
//
//   ADMIN_TOKEN=… node scripts/booking-email-e2e.mjs https://aimanjack.com you+bookingtest@example.com \
//       --approved "owner chat 2026-10-XX HH:MM: <quote>"
//
// It books ONE clearly labelled test appointment ("E2E TEST — DO NOT CALL"), reschedules it, cancels it, and after each
// step waits for the notification ledger to settle. It never touches other bookings. It cannot see inboxes: afterwards,
// open the test inbox and OWNER_EMAIL's inbox and check the checklist it prints (From, Reply-To, SPF/DKIM/DMARC).
import assert from 'node:assert/strict';

const [base, testEmail] = process.argv.slice(2);
const approved = (() => { const i = process.argv.indexOf('--approved'); return i > 0 ? process.argv[i + 1] : null; })();
const token = process.env.ADMIN_TOKEN;
if (!base || !testEmail || !approved || !token) {
  console.error('usage: ADMIN_TOKEN=… node scripts/booking-email-e2e.mjs <base-url> <test-inbox> --approved "<owner approval quote>"');
  process.exit(2);
}
const B = 'aimanjack', S = 'demo-call';
const call = async (m, p, body, h = {}) => {
  const r = await fetch(base + p, { method: m, headers: { 'content-type': 'application/json', ...h }, body: body && JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};
const admin = { authorization: `Bearer ${token}` };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function settle(id, kind, expectRoles) {
  for (let i = 0; i < 20; i++) {
    const l = await call('GET', `/v1/bookings?business=${B}&from=2000-01-01`, null, admin);
    const b = l.body.bookings?.find((x) => x.id === id);
    const rows = (b?.notifications ?? []).filter((n) => n.kind === kind);
    if (rows.length >= expectRoles.length && rows.every((n) => !['pending', 'sending'].includes(n.status))) return rows;
    await call('POST', '/v1/notifications/process', null, admin); await sleep(3000);
  }
  throw new Error(`notifications for ${kind} did not settle`);
}

console.log(`approval: ${approved}`);
const cfg = await call('GET', '/v1/admin/email-config', null, admin);
assert.equal(cfg.status, 200, 'admin token rejected');
console.log('effective email config:', cfg.body);
assert.equal(cfg.body.booking_from, 'booking-no-reply@aimanjack.com');
assert.equal(cfg.body.booking_reply_to, 'jack@aimanjack.com');
assert.ok(cfg.body.owner_email, 'OWNER_EMAIL is not set in this deployment');

const av = await call('GET', `/v1/availability?business=${B}&service=${S}`);
const slots = av.body.days.flatMap((d) => d.slots);
const [s1, s2] = slots.slice(-2); // furthest-out slots: least likely to block a real customer
const hdr = { 'x-source': 'web', 'idempotency-key': 'e2e-' + Date.now() };
const c = await call('POST', '/v1/bookings', { business: B, service: S, start_at: s1.start_at, customer_name: 'E2E TEST — DO NOT CALL', customer_phone: '(469) 555-0100', customer_email: testEmail, note: `automated email E2E; ${approved}` }, hdr);
assert.equal(c.status, 201, JSON.stringify(c.body));
const id = c.body.id;
console.log('created', id.slice(0, 4) + '…', '→', (await settle(id, 'created', ['customer', 'owner'])).map((n) => `${n.role}:${n.status}`).join(' '));
const r = await call('PATCH', `/v1/bookings/${id}`, { start_at: s2.start_at }, { 'x-source': 'web' });
assert.equal(r.status, 200, JSON.stringify(r.body));
console.log('rescheduled →', (await settle(id, 'rescheduled', ['customer', 'owner'])).map((n) => `${n.role}:${n.status}`).join(' '));
const x = await call('DELETE', `/v1/bookings/${id}`, null, { 'x-source': 'web' });
assert.equal(x.body.status, 'cancelled');
console.log('cancelled →', (await settle(id, 'cancelled', ['customer', 'owner'])).map((n) => `${n.role}:${n.status}`).join(' '));

console.log(`
Ledger states above are the PROVIDER's view ("delivered" = accepted by the recipient's mail server), not inbox proof.
Now verify by hand, in BOTH inboxes (${testEmail} and the owner inbox), for all three messages:
  [ ] arrived (not spam/quarantine — check Proofpoint quarantine for the owner inbox)
  [ ] From: AI Man Jack <booking-no-reply@aimanjack.com>
  [ ] Reply-To: jack@aimanjack.com on the customer copies; the customer's address on the owner copies
  [ ] Show original / message headers: spf=pass (smtp.mailfrom=cf-bounce.aimanjack.com), dkim=pass header.d=aimanjack.com, dmarc=pass
  [ ] reply to the customer copy lands in jack@aimanjack.com
Record the result (with the approval quote) in docs/AGENT_ACTIVITY_LOG.md of revenue-os and on issue #2.
The test booking is cancelled and labelled; nothing else was touched.`);
