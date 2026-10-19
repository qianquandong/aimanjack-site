// PR02 (M03): quote intake by submission (INTAKE_V2_ENABLED). Acceptance tests T16–T21 (02_ACCEPTANCE_TESTS.md).
// The real migrations run on disposable PGlite behind a PostgREST stand-in; CRM and email are mocks; nothing leaves the machine.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHmac, randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { onRequest } from '../functions/v1/[[route]].js';
import { renderIntakeErrorPage } from '../src/intake-error-page.mjs';

const CHAIN = ['db/schema.sql', 'db/migrations/2026-10-08-revenue-intake.sql', 'db/migrations/2026-10-11-ros-event-outbox.sql',
  'db/migrations/2026-10-16-mailerlite-quote-outbox.sql', 'db/migrations/2026-10-19-consent-scope.sql', 'db/migrations/2026-10-19-intake-submissions.sql'];
const SECRET = 'mock-email-hash-secret-only-for-tests';
const ENV = { SITE_ENV: 'production', INTAKE_V2_ENABLED: 'true', SUPABASE_URL: 'https://db.test', SB_SECRET_KEY: 'mock-service-key',
  SITE_ORIGIN: 'https://aimanjack.com', OWNER_EMAIL: 'jack@aimanjack.com', EMAIL_HASH_SECRET: SECRET, IP_HASH_SALT: 'mock-ip-salt-only',
  CRM_INTAKE_SECRET: 'mock-crm-secret', CRM_INTAKE_URL: 'https://crm.test/hook', CF_ACCOUNT_ID: 'acct', CF_EMAIL_TOKEN: '', EMAIL_FROM: 'bookings@aimanjack.com' };
const subject = (email) => createHmac('sha256', SECRET).update('subject:' + email).digest('hex');

async function harness(t, { rateLimit = () => true } = {}) {
  const pg = new PGlite(); t.after(() => pg.close());
  await pg.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  for (const f of CHAIN) await pg.exec(await readFile(new URL('../' + f, import.meta.url), 'utf8'));
  const rows = async (sql, args = []) => (await pg.query(sql, args)).rows;
  const calls = { v1: 0, v2: 0, crm: [], emails: [] };
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    url = String(url);
    const rpc = async (fn) => {
      const { p, p_consents } = JSON.parse(options.body);
      try { return Response.json((await rows(`select revenue.${fn}($1::jsonb,$2::jsonb) as r`, [JSON.stringify(p), JSON.stringify(p_consents)]))[0].r); }
      catch (e) { return Response.json({ code: e.code ?? 'P0001', message: String(e.message) }, { status: 400 }); }
    };
    if (url === 'https://db.test/rest/v1/rpc/take_intake_rate_limit') { const v = rateLimit(); return v instanceof Response ? v : Response.json(v); }
    if (url === 'https://db.test/rest/v1/rpc/record_intake_v2') { calls.v2++; return rpc('record_intake_v2'); }
    if (url === 'https://db.test/rest/v1/rpc/record_intake') { calls.v1++; return rpc('record_intake'); }
    if (url === 'https://db.test/rest/v1/rpc/take_coupon_rate_limit') return Response.json(true);
    if (url.startsWith('https://db.test/rest/v1/notifications?') || url.startsWith('https://db.test/rest/v1/coupon_rate_limits?')) return Response.json([]);
    if (url.includes('/email/sending/send')) { calls.emails.push(JSON.parse(options.body)); return Response.json({ success: true }); }
    if (url === 'https://crm.test/hook') { calls.crm.push(JSON.parse(options.body)); return Response.json({ ok: true }, { status: 201 }); }
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const post = async (body, { env = ENV, form = false, origin = 'https://aimanjack.com', raw } = {}) => {
    const headers = { 'content-type': form ? 'application/x-www-form-urlencoded' : 'application/json', 'cf-connecting-ip': '203.0.113.20' };
    if (origin) headers.origin = origin;
    const payload = raw ?? (form ? new URLSearchParams(body).toString() : JSON.stringify(body));
    const jobs = [];
    const res = await onRequest({ request: new Request('https://aimanjack.com/v1/intake', { method: 'POST', headers, body: payload }), env, params: { route: ['intake'] }, waitUntil: (p) => jobs.push(p) });
    await Promise.allSettled(jobs);
    return res;
  };
  const count = async (table) => (await rows(`select count(*)::int n from revenue.${table}`))[0].n;
  return { pg, rows, calls, post, count };
}

const quick = (over = {}) => ({ kind: 'quick', name: 'Dana Test', email: 'dana@example.test', attendees: '10', budget: 'not sure yet',
  workflows: 'Copilot for weekly reports', tool: 'copilot', page: '/ai-training/copilot/', lang: 'en', form_version: 'intake-2026-10-17',
  consent_request: true, consent_newsletter: false, fill_ms: '9000', submission_key: randomUUID(), ...over });
const full = (over = {}) => ({ name: 'Dana Test', email: 'dana@example.test', company: 'Example Co', company_website: 'example.test', industry: 'distribution',
  headcount: '50-99', attendees: '12', format: 'workshop_90', location: 'dfw_onsite', location_city: '', workflows: 'Weekly ops report', tools: '',
  timing: 'one_to_three', source: '', source_detail: '', lang: 'en', form_version: 'intake-2026-10-08', consent_request: 'yes', fill_ms: '', ...over });

test('flag off: the live behaviour is unchanged (record_intake, day-scoped dedupe), v2 is never called', async (t) => {
  const h = await harness(t);
  const env = { ...ENV, INTAKE_V2_ENABLED: 'false' };
  const a = await h.post(quick(), { env }), b = await h.post(quick({ attendees: '20' }), { env });
  assert.equal(a.status, 201); assert.equal(b.status, 200, 'today: the same-day second request dedupes onto the first');
  assert.equal(h.calls.v2, 0); assert.equal(h.calls.v1, 2);
  assert.equal(await h.count('intake_receipts'), 1);
});

test('T16: 100 concurrent retries of one submission make one receipt, one forward and the same reference', async (t) => {
  const h = await harness(t);
  const body = quick();
  const res = await Promise.all(Array.from({ length: 100 }, () => h.post(body)));
  const out = await Promise.all(res.map((r) => r.json()));
  assert.ok(res.every((r) => r.status === 201), 'every retry gets the same answer');
  assert.equal(new Set(out.map((o) => o.receipt_id)).size, 1, 'one reference for all retries');
  assert.equal(await h.count('intake_receipts'), 1);
  assert.equal(await h.count('consent_events'), 2, 'consent recorded once');
  assert.equal(h.calls.crm.length, 1, 'one CRM forward');
  assert.equal((await h.rows('select count(*)::int n from revenue.intake_receipts where submission_version = 2'))[0].n, 1);
});

test('T17: same person, same day, a new submission (10 → 20 people) is stored in full, linked, and forwarded again', async (t) => {
  const h = await harness(t);
  const env = { ...ENV, CF_EMAIL_TOKEN: 'mock-email-token' };
  const r1 = await (await h.post(quick({ attendees: '10' }), { env })).json();
  const r2 = await (await h.post(quick({ attendees: '20', workflows: 'Copilot for reports and meeting notes' }), { env })).json();
  assert.notEqual(r1.receipt_id, r2.receipt_id);
  const rows = await h.rows('select receipt_id, payload, previous_receipt_id from revenue.intake_receipts order by received_at');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].payload.attendees, 10, 'the earlier request is kept for audit');
  assert.equal(rows[1].payload.attendees, 20); assert.match(rows[1].payload.workflows, /meeting notes/);
  assert.equal(rows[1].previous_receipt_id, r1.receipt_id);
  assert.equal(h.calls.crm.length, 2, 'both reach the CRM');
  assert.match(h.calls.crm[1].workflows, new RegExp(`possibly a revision of receipt ${r1.receipt_id.slice(0, 8)}`));
  assert.equal(h.calls.emails.length, 2, 'both reach the owner');
  assert.match(h.calls.emails[1].text, new RegExp(`earlier request: ${r1.receipt_id}`));
});

test('T18: the same submission key with different content is a conflict; nothing new is stored or sent', async (t) => {
  const h = await harness(t);
  const key = randomUUID();
  assert.equal((await h.post(quick({ submission_key: key }))).status, 201);
  const res = await h.post(quick({ submission_key: key, attendees: '20' }));
  assert.equal(res.status, 409); assert.equal((await res.json()).error, 'submission_conflict');
  assert.equal(await h.count('intake_receipts'), 1);
  assert.equal((await h.rows('select payload from revenue.intake_receipts'))[0].payload.attendees, 10, 'the stored content is untouched');
  assert.equal(h.calls.crm.length, 1);
  // Without JS there is no key: identical content is the same submission, different content a new one.
  const f = { ...quick(), submission_key: undefined, fill_ms: '' }; delete f.submission_key;
  assert.equal((await h.post(f, { form: true })).status, 303);
  assert.equal((await h.post(f, { form: true })).status, 303);
  assert.equal(await h.count('intake_receipts'), 2, 'a no-JS retry of the same content is one receipt');
});

test('T19: receipt, consent and outbox are one transaction — a failure in any part stores nothing and never answers success', async (t) => {
  for (const [table, label] of [['intake_receipts', 'receipt'], ['consent_events', 'consent'], ['ros_events', 'outbox']]) {
    const h = await harness(t);
    await h.pg.exec(`create function revenue.fail_${label}() returns trigger language plpgsql as $$ begin raise exception 'injected ${label} failure'; end $$;
      create trigger fail_${label} before insert on revenue.${table} for each row execute function revenue.fail_${label}();`);
    const res = await h.post(quick());
    assert.equal(res.status, 503, `${label} failure → 503`); assert.equal((await res.json()).error, 'intake_unavailable');
    for (const tb of ['intake_receipts', 'consent_events', 'ros_events', 'mailerlite_sync_events']) assert.equal(await h.count(tb), 0, `${label}: no partial ${tb}`);
    assert.equal(h.calls.crm.length, 0, `${label}: nothing forwarded`);
  }
});

test('T20: a fast submission asks for confirmation instead of being dropped; honeypot and rate limits produce nothing', async (t) => {
  const h = await harness(t);
  const key = randomUUID();
  let res = await h.post(quick({ submission_key: key, fill_ms: '800' }));
  assert.equal(res.status, 409); assert.equal((await res.json()).error, 'confirm_required');
  assert.equal(await h.count('intake_receipts'), 0, 'nothing stored before the confirmation');
  res = await h.post(quick({ submission_key: key, fill_ms: '800', confirm: 'yes' }));
  assert.equal(res.status, 201);
  assert.equal((await h.rows('select risk from revenue.intake_receipts'))[0].risk, 'fast_fill_confirmed');
  // Honeypot: looks like success, but no receipt id (so the page fires no conversion), nothing stored or sent.
  res = await h.post(quick({ company_url: 'https://spam.example' }));
  assert.equal(res.status, 200); assert.deepEqual(await res.json(), { ok: true });
  assert.equal(await h.count('intake_receipts'), 1); assert.equal(h.calls.crm.length, 1);
  // A no-JS fast post gets the confirmation page with a confirm field.
  res = await h.post({ ...quick({ fill_ms: '500' }), submission_key: '' }, { form: true });
  assert.equal(res.status, 409); const html = await res.text();
  assert.match(html, /name="confirm" value="yes"/); assert.match(html, /very fast/);
  // Rate limit: refused, nothing stored.
  const g = await harness(t, { rateLimit: () => false });
  res = await g.post(quick());
  assert.equal(res.status, 429); assert.equal(await g.count('intake_receipts'), 0); assert.equal(g.calls.crm.length, 0);
});

test('T21: no-JS errors keep what was typed (escaped) and name the fields; consent missing is explained', async (t) => {
  const h = await harness(t);
  const evil = '<script>alert(1)</script>';
  let res = await h.post(full({ email: 'not-an-email', name: 'N'.repeat(101), workflows: evil, company: 'Acme & Sons "Ltd"' }), { form: true });
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('x-robots-tag'), 'noindex, nofollow'); assert.equal(res.headers.get('cache-control'), 'no-store');
  let html = await res.text();
  assert.ok(!html.includes(evil), 'no raw markup from the visitor');
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/, 'the typed message is kept, escaped');
  assert.match(html, /value="Acme &amp; Sons &quot;Ltd&quot;"/);
  assert.match(html, /id="ie-email"[^>]*aria-invalid="true"/);
  assert.match(html, /href="#ie-email"/); assert.match(html, /href="#ie-name"/);
  assert.match(html, /<option value="distribution" selected>/, 'selected options are kept');
  assert.equal(await h.count('intake_receipts'), 0);
  res = await h.post(full({ consent_request: '' }), { form: true });
  assert.equal(res.status, 400); html = await res.text();
  assert.match(html, /tick the consent box/); assert.match(html, /value="Weekly ops report"|>Weekly ops report</);
  // Chinese page for Chinese forms.
  res = await h.post(full({ lang: 'zh', email: 'bad' }), { form: true });
  assert.match(await res.text(), /请检查你的申请/);
});

test('T21: oversized bodies, foreign origins and other people’s addresses reveal and store nothing', async (t) => {
  const h = await harness(t);
  let res = await h.post(null, { raw: JSON.stringify(quick({ workflows: 'x'.repeat(40000) })) });
  assert.equal(res.status, 413); assert.equal((await res.json()).error, 'too_large');
  res = await h.post(null, { form: true, raw: 'name=a&' + 'x='.padEnd(40000, 'y') });
  assert.equal(res.status, 303); assert.match(res.headers.get('location'), /#not-sent$/);
  res = await h.post(quick(), { origin: 'https://evil.example' });
  assert.equal(res.status, 403);
  res = await h.post(quick(), { origin: null });
  assert.equal(res.status, 403);
  assert.equal(await h.count('intake_receipts'), 0);
  // Someone uses another person's address: the answer is the same shape and status as for anyone, with no history.
  const first = await h.post(quick({ email: 'owner@example.test' }));
  const second = await h.post(quick({ email: 'owner@example.test', name: 'Someone Else', workflows: 'different text' }));
  assert.equal(first.status, 201); assert.equal(second.status, 201, 'no 200-vs-201 oracle');
  const body = await second.json();
  assert.deepEqual(Object.keys(body).sort(), ['ok', 'receipt_id']);
  assert.ok(!JSON.stringify(body).includes('Dana') && !JSON.stringify(body).includes('previous'));
});

test('T13 follow-up: after erasure the same content is refused on any day and under any new key; new content is a new request', async (t) => {
  const h = await harness(t);
  const body = quick();
  assert.equal((await h.post(body)).status, 201);
  await h.rows('select revenue.erase_subject($1)', [subject('dana@example.test')]);
  let res = await h.post({ ...body, submission_key: randomUUID() });   // same content, new key (e.g. a later day)
  assert.equal(res.status, 503); assert.equal(await h.count('intake_receipts'), 0, 'personal data not recreated');
  res = await h.post({ ...body, submission_key: undefined });          // same content, no key (no-JS identity)
  assert.equal(res.status, 503);
  assert.equal(h.calls.crm.length, 1, 'no second CRM forward');
  res = await h.post(quick({ workflows: 'A genuinely new request' }));
  assert.equal(res.status, 201, 'new content from the person is a new request');
  assert.equal((await h.rows(`select state from revenue.consent_effective where subject_email_hash=$1 and purpose='newsletter'`, [subject('dana@example.test')]))[0].state, 'erased', 'marketing stays off');
});

test('v2 fails closed without EMAIL_HASH_SECRET and refuses malformed submission keys as identity', async (t) => {
  const h = await harness(t);
  const { EMAIL_HASH_SECRET, ...env } = ENV;
  assert.equal((await h.post(quick(), { env })).status, 503);
  assert.equal(await h.count('intake_receipts'), 0);
  // A non-UUID key is ignored (content fingerprint is used instead), so it cannot collide with someone else's key.
  assert.equal((await h.post(quick({ submission_key: 'aaaa' }))).status, 201);
  assert.equal((await h.post(quick({ submission_key: 'bbbb' }))).status, 201);
  assert.equal(await h.count('intake_receipts'), 1, 'same content, no valid key → one submission');
});

test('error page: escapes everything, echoes only known fields, and only links back to our own paths', () => {
  const html = renderIntakeErrorPage({ lang: 'en', kind: 'quick', body: { name: '"><img src=x onerror=alert(1)>', unknown: 'secret-field', page: '/ai-training/copilot/' },
    errors: ['email'], reason: 'invalid', backPath: 'javascript:alert(1)' });
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('secret-field'), 'unknown fields are not echoed');
  assert.match(html, /href="\/contact\/quote\/"/, 'unsafe back link replaced');
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.ok(!/<script/i.test(html), 'no script on the page');
  assert.match(renderIntakeErrorPage({ lang: 'en', kind: 'quick', body: {}, backPath: '/ai-training/copilot/' }), /href="\/ai-training\/copilot\/"/);
});

// ── Review round 1 regressions ──

test('erasure of a legacy (v1) receipt fails closed: the same person cannot be re-stored through v2', async (t) => {
  const h = await harness(t);
  const env = { ...ENV, INTAKE_V2_ENABLED: 'false' };
  assert.equal((await h.post(quick(), { env })).status, 201, 'stored by the live v1 path');
  assert.equal((await h.rows('select body_hash from revenue.intake_receipts'))[0].body_hash, null, 'legacy rows have no content fingerprint');
  await h.rows('select revenue.erase_subject($1)', [subject('dana@example.test')]);
  const crmBefore = h.calls.crm.length;
  for (const body of [quick(), quick({ workflows: 'something new' })]) assert.equal((await h.post(body)).status, 503);
  assert.equal(await h.count('intake_receipts'), 0, 'personal data not recreated');
  assert.equal(h.calls.crm.length, crmBefore, 'nothing forwarded');
  assert.equal((await h.post(quick({ email: 'someone.else@example.test' }))).status, 201, 'other people are unaffected');
});

test('T19 with MailerLite capture enabled: a failing enrollment-queue insert also rolls everything back', async (t) => {
  const h = await harness(t);
  await h.pg.exec(`update revenue.mailerlite_configuration set enabled = true;
    create function revenue.fail_ml() returns trigger language plpgsql as $$ begin raise exception 'injected queue failure'; end $$;
    create trigger fail_ml before insert on revenue.mailerlite_sync_events for each row execute function revenue.fail_ml();`);
  const res = await h.post(quick({ consent_newsletter: true }));
  assert.equal(res.status, 503);
  for (const tb of ['intake_receipts', 'consent_events', 'ros_events', 'mailerlite_sync_events']) assert.equal(await h.count(tb), 0, tb);
  assert.equal(h.calls.crm.length, 0);
});

test('no-JS rate limit and store failures keep what was typed; risk is tagged whenever the confirm step was used', async (t) => {
  let h = await harness(t, { rateLimit: () => false });
  let res = await h.post({ ...quick({ workflows: 'Keep <this> text' }), submission_key: '', fill_ms: '' }, { form: true });
  assert.equal(res.status, 429); let html = await res.text();
  assert.match(html, /Too many requests/); assert.match(html, /Keep &lt;this&gt; text/);
  h = await harness(t);
  await h.pg.exec(`create function revenue.fail_any() returns trigger language plpgsql as $$ begin raise exception 'down'; end $$;
    create trigger fail_any before insert on revenue.intake_receipts for each row execute function revenue.fail_any();`);
  res = await h.post({ ...full({ workflows: 'Typed before the outage' }) }, { form: true });
  assert.equal(res.status, 503); html = await res.text();
  assert.match(html, /could not be saved/); assert.match(html, /Typed before the outage/);
  const g = await harness(t);
  assert.equal((await g.post(quick({ fill_ms: '9000', confirm: 'yes' }))).status, 201);
  assert.equal((await g.rows('select risk from revenue.intake_receipts'))[0].risk, 'fast_fill_confirmed', 'tagged even when the second press is slow');
});

test('body limit is enforced while streaming (no Content-Length) and the upload is cancelled early', async (t) => {
  const h = await harness(t);
  let pulled = 0, cancelled = false;
  const chunk = new TextEncoder().encode('x'.repeat(8192));
  const stream = new ReadableStream({ pull(c) { pulled += chunk.byteLength; c.enqueue(chunk); if (pulled >= 81920) c.close(); }, cancel() { cancelled = true; } });
  const req = new Request('https://aimanjack.com/v1/intake', { method: 'POST', body: stream, duplex: 'half',
    headers: { 'content-type': 'application/json', origin: 'https://aimanjack.com', 'cf-connecting-ip': '203.0.113.20' } });
  assert.equal(req.headers.get('content-length'), null);
  const res = await onRequest({ request: req, env: ENV, params: { route: ['intake'] }, waitUntil: () => {} });
  assert.equal(res.status, 413);
  assert.ok(cancelled, 'stream cancelled'); assert.ok(pulled < 81920, `stopped early (${pulled} bytes read)`);
  assert.equal(await h.count('intake_receipts'), 0);
});

test('multipart bodies keep their case-sensitive boundary', async (t) => {
  const h = await harness(t);
  const fd = new FormData(); for (const [k, v] of Object.entries({ ...quick(), consent_request: 'yes' })) fd.append(k, String(v));
  const tmp = new Request('https://x', { method: 'POST', body: fd });
  const ct = tmp.headers.get('content-type'); assert.match(ct, /boundary=.*[A-Z]|boundary=.*[a-z]/);
  const raw = await tmp.arrayBuffer();
  const res = await onRequest({ request: new Request('https://aimanjack.com/v1/intake', { method: 'POST', body: raw,
    headers: { 'content-type': ct, origin: 'https://aimanjack.com', 'cf-connecting-ip': '203.0.113.20' } }), env: ENV, params: { route: ['intake'] }, waitUntil: () => {} });
  assert.equal(res.status, 303); assert.match(res.headers.get('location'), /#quote-received$/);
  assert.equal(await h.count('intake_receipts'), 1);
});

test('multipart with a mixed-case boundary is parsed (boundaries are case-sensitive)', async (t) => {
  const h = await harness(t);
  const B = 'BoundaryAbCdEf123';
  const parts = Object.entries({ ...quick(), consent_request: 'yes' }).map(([k, v]) => `--${B}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`).join('') + `--${B}--\r\n`;
  const res = await onRequest({ request: new Request('https://aimanjack.com/v1/intake', { method: 'POST', body: parts,
    headers: { 'content-type': `multipart/form-data; boundary=${B}`, origin: 'https://aimanjack.com', 'cf-connecting-ip': '203.0.113.20' } }), env: ENV, params: { route: ['intake'] }, waitUntil: () => {} });
  assert.equal(res.status, 303); assert.equal(await h.count('intake_receipts'), 1);
});

// Runs the real quick-form script (as built into the page) against a minimal fake DOM.
async function runQuickFormScript({ storage, responses }) {
  const { quickQuote } = await import('../src/quick-quote.mjs');
  const html = quickQuote('en', { tool: 'copilot', path: '/ai-training/copilot/' });
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('SKM('));
  const QQ = JSON.parse(html.match(/window\.QQ=(\{[\s\S]*?\})<\/script>/)[1]);
  const values = { kind: 'quick', tool: 'copilot', page: '/ai-training/copilot/', lang: 'en', form_version: 'intake-2026-10-17', fill_ms: '',
    name: 'Dana Test', email: 'dana@example.test', attendees: '10', budget: '', workflows: 'Weekly reports', company_url: '' };
  const el = () => ({ textContent: '', hidden: false, disabled: false, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; }, focus() {} });
  const btn = el(), msg = el(), ok = el(), handlers = {};
  const elements = { tool: { value: 'copilot' }, consent_request: { ...el(), checked: true }, consent_newsletter: { checked: false } };
  for (const k of Object.keys(values)) elements[k] = elements[k] || { ...el(), value: values[k] };
  const form = { id: 'qq-form', action: '/v1/intake', hidden: false, elements, addEventListener(type, fn) { handlers[type] = fn; }, querySelector: () => btn, querySelectorAll: () => [] };
  const sent = [], events = [];
  const fakeFetch = async (_url, opts) => { sent.push(JSON.parse(opts.body)); const next = responses.shift(); if (next instanceof Error) throw next; return new Response(JSON.stringify(next.body), { status: next.status }); };
  const window = { QQ, fetch: fakeFetch, crypto: globalThis.crypto, TextEncoder, amjTrack: (n, p) => events.push([n, p]) };
  const document = { getElementById: (id) => ({ 'qq-form': form, 'qq-msg': msg, 'quote-received': ok }[id]) };
  class FD { constructor(f) { this.f = f; } forEach(cb) { for (const [k, v] of Object.entries(values)) cb(v, k); } }
  const run = new Function('window', 'document', 'sessionStorage', 'FormData', 'fetch', 'crypto', 'TextEncoder', script);
  run(window, document, storage, FD, fakeFetch, globalThis.crypto, TextEncoder);
  const submit = async () => { handlers.submit({ preventDefault() {} }); for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 5)); };
  return { submit, sent, events, btn, msg, ok, form, QQ };
}
const fakeStorage = () => { const m = new Map(); return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };

test('browser: a failed confirmation gives the button back; the key survives; GA fires only with a receipt', async () => {
  const storage = fakeStorage();
  const ui = await runQuickFormScript({ storage, responses: [
    { status: 409, body: { ok: false, error: 'confirm_required' } }, new Error('network down'), { status: 503, body: { ok: false, error: 'intake_unavailable' } },
    { status: 201, body: { ok: true, receipt_id: '11111111-2222-4333-8444-555555555555' } }] });
  await ui.submit();
  assert.equal(ui.btn.disabled, false); assert.equal(ui.btn.textContent, ui.QQ.confirmBtn); assert.equal(ui.msg.textContent, ui.QQ.confirm);
  await ui.submit();   // the confirmation press fails on the network
  assert.equal(ui.btn.disabled, false, 'button re-enabled after a failed confirmation'); assert.equal(ui.btn.textContent, ui.QQ.confirmBtn);
  await ui.submit();   // 503
  assert.equal(ui.btn.disabled, false);
  await ui.submit();   // success
  assert.equal(ui.sent.length, 4);
  assert.equal(new Set(ui.sent.map((o) => o.submission_key)).size, 1, 'one key for the whole attempt');
  assert.deepEqual(ui.sent.map((o) => o.confirm ?? null), [null, 'yes', 'yes', 'yes']);
  assert.equal(ui.events.filter(([n]) => n === 'submit_enterprise_inquiry').length, 1, 'one conversion, after the real receipt');
  assert.equal(storage.m.size, 0, 'key cleared after success');
});

test('browser: a reload after a lost response reuses the key; storage never holds form values; honeypot success fires no GA', async () => {
  const storage = fakeStorage();
  const a = await runQuickFormScript({ storage, responses: [new Error('response lost')] });
  await a.submit();
  const stored = [...storage.m.values()].join(' ');
  assert.equal(storage.m.size, 1); assert.ok(!/Dana|dana@example|Weekly/.test(stored), 'no form values in sessionStorage');
  const b = await runQuickFormScript({ storage, responses: [{ status: 200, body: { ok: true } }] });   // page reloaded, same content
  await b.submit();
  assert.equal(b.sent[0].submission_key, a.sent[0].submission_key, 'same key after reload');
  assert.equal(b.events.filter(([n]) => n === 'submit_enterprise_inquiry').length, 0, 'no conversion without a receipt id');
});
