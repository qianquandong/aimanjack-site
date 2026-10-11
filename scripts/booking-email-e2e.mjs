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
async function settle(id, kind, expectRoles, fromDate) {
  for (let i = 0; i < 20; i++) {
    const l = await call('GET', `/v1/bookings?business=${B}&from=${encodeURIComponent(fromDate)}&with=notifications`, null, admin);
    assert.equal(l.status, 200, 'admin bookings lookup failed');
    assert.equal(l.body.notifications_ledger, 'ok', 'notification ledger unavailable');
    const b = l.body.bookings?.find((x) => x.id === id);
    const rows = (b?.notifications ?? []).filter((n) => n.kind === kind);
    if (expectRoles.every((role) => rows.some((n) => n.role === role)) &&
        rows.every((n) => !['pending', 'sending'].includes(n.status))) {
      assert.ok(rows.every((n) => ['queued', 'delivered'].includes(n.status)),
        `notification failure for ${kind}: ${rows.map((n) => n.role + ':' + n.status).join(' ')}`);
      return rows;
    }
    await call('POST', '/v1/notifications/process', null, admin); await sleep(3000);
  }
  throw new Error(`notifications for ${kind} did not settle`);
}

console.log(`approval: ${approved}`);
const cfg = await call('GET', '/v1/admin/email-config', null, admin);
assert.equal(cfg.status, 200, 'admin token rejected');
console.log('effective email config:', cfg.body);
const m365 = cfg.body.transport === 'm365';
assert.equal(cfg.body.booking_from, m365 ? 'jack@aimanjack.com' : 'booking-no-reply@aimanjack.com');
assert.equal(cfg.body.booking_reply_to, 'jack@aimanjack.com');
if (m365) assert.equal(cfg.body.m365?.connected, true, 'Microsoft 365 is not connected — use "Connect Microsoft 365" on /admin/bookings/ first');
assert.ok(cfg.body.owner_email, 'OWNER_EMAIL is not set in this deployment');

const av = await call('GET', `/v1/availability?business=${B}&service=${S}`);
const slots = av.body.days.flatMap((d) => d.slots);
const [s1, s2] = slots.slice(-2); // furthest-out slots: least likely to block a real customer
assert.ok(s1 && s2, 'not enough available slots for a create/reschedule/cancel test');
const fromDate = s1.start_at.slice(0, 10);
const hdr = { 'x-source': 'web', 'idempotency-key': 'e2e-' + Date.now() };
let id = null;
let cancelled = false;
try {
  const c = await call('POST', '/v1/bookings', { business: B, service: S, start_at: s1.start_at, customer_name: 'E2E TEST — DO NOT CALL', customer_phone: '(469) 555-0100', customer_email: testEmail, note: 'automated booking email end-to-end test' }, hdr);
  assert.equal(c.status, 201, JSON.stringify(c.body));
  id = c.body.id;
  console.log('created', id.slice(0, 4) + '…', '→', (await settle(id, 'created', ['customer', 'owner'], fromDate)).map((n) => `${n.role}:${n.status}`).join(' '));
  const r = await call('PATCH', `/v1/bookings/${id}`, { start_at: s2.start_at }, { 'x-source': 'web' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  console.log('rescheduled →', (await settle(id, 'rescheduled', ['customer', 'owner'], fromDate)).map((n) => `${n.role}:${n.status}`).join(' '));
  const x = await call('DELETE', `/v1/bookings/${id}`, null, { 'x-source': 'web' });
  assert.equal(x.status, 200, JSON.stringify(x.body));
  assert.equal(x.body.status, 'cancelled');
  cancelled = true;
  console.log('cancelled →', (await settle(id, 'cancelled', ['customer', 'owner'], fromDate)).map((n) => `${n.role}:${n.status}`).join(' '));
} finally {
  // A notification assertion must never leave a test appointment occupying a real customer slot.
  if (id && !cancelled) {
    try {
      const cleanup = await call('DELETE', `/v1/bookings/${id}`, null, { ...admin, 'x-source': 'admin' });
      if (cleanup.status === 200 && cleanup.body.status === 'cancelled') console.error('test booking cancelled during cleanup');
      else console.error('WARNING: test booking cleanup unsuccessful; manually cancel booking', id.slice(0, 4) + '…', cleanup.status);
    } catch (e) {
      console.error('WARNING: test booking cleanup failed; manually cancel booking', id.slice(0, 4) + '…', String(e));
    }
  }
}

console.log(`
Ledger states above are the PROVIDER's view (${m365 ? '"queued" = accepted by Microsoft 365' : '"delivered" = accepted by the recipient\'s mail server'}), not inbox proof.
Now verify by hand, in BOTH inboxes (${testEmail} and the owner inbox), for all three messages:
  [ ] arrived (not spam/quarantine — check Proofpoint quarantine for the owner inbox)
  [ ] From: ${m365 ? 'jack@aimanjack.com (your Microsoft 365 mailbox); copies are in its Sent Items' : 'AI Man Jack <booking-no-reply@aimanjack.com>'}
  [ ] Reply-To: ${m365 ? 'none on the customer copies (replies go to jack@aimanjack.com itself)' : 'jack@aimanjack.com on the customer copies'}; the customer's address on the owner copies
  [ ] Show original / message headers: spf=pass, dkim=pass header.d=aimanjack.com${m365 ? ' (or the tenant\'s onmicrosoft.com domain)' : ''}, dmarc=pass
  [ ] no NDR (bounce) arrived in jack@aimanjack.com
  [ ] reply to the customer copy lands in jack@aimanjack.com
Record the result (with the approval quote) in docs/AGENT_ACTIVITY_LOG.md of revenue-os and on issue #2.
The test booking is cancelled and labelled; nothing else was touched.`);
