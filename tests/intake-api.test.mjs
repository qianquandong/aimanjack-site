// POST /v1/intake — training quote intake (Revenue OS v6, W-002). Mirrors coupon-api.test.mjs: fetch is mocked, nothing leaves the machine.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash, createHmac } from 'node:crypto';
import { onRequest } from '../functions/v1/[[route]].js';
import { pages as contactPages } from '../src/pages/contact.mjs';
import { render, pageOf } from '../src/layout.mjs';
import { QUOTE_URL } from '../src/config.mjs';

const env = {
  SUPABASE_URL: 'https://db.test', SB_SECRET_KEY: 'test-key',
  CF_ACCOUNT_ID: 'account', CF_EMAIL_TOKEN: '', EMAIL_FROM: 'bookings@aimanjack.com', OWNER_EMAIL: 'jack@aimanjack.com',
  SITE_ORIGIN: 'https://aimanjack.com', ADMIN_TOKEN: 'admin-token',
};
const IP = '203.0.113.77';
const PII = ['Dana', 'Reyes', 'dana.reyes', 'Northwind', 'northwind', 'dispatch spreadsheet', IP];
const response = (body, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
const sha = (s) => createHash('sha256').update(s).digest('hex');
const today = () => new Date().toISOString().slice(0, 10);

const valid = (over = {}) => ({
  name: 'Dana Reyes', email: ' Dana.Reyes@Northwind-Example.com ', company: 'Northwind Example', company_website: 'https://www.northwind-example.com/about',
  industry: 'distribution', headcount: '50-99', attendees: '12', format: 'workshop_90', location: 'dfw_onsite', location_city: '',
  workflows: 'Weekly ops report from the dispatch spreadsheet', tools: 'NetSuite, Microsoft 365', timing: 'one_to_three', source: 'linkedin', source_detail: '',
  consent_request: true, consent_newsletter: false, lang: 'en', form_version: 'intake-2026-10-08', fill_ms: '15000', company_url: '',
  ft_utm_source: 'linkedin', ft_utm_medium: 'social', ft_utm_campaign: 'q4-launch', ft_ref: 'www.linkedin.com', ft_landing: '/ai-training/team-workshop/', ft_ts: '1760000000000',
  ...over,
});

function call(body, { e = env, origin = 'https://aimanjack.com', ip = IP, form = false } = {}) {
  const headers = { 'content-type': form ? 'application/x-www-form-urlencoded' : 'application/json' };
  if (origin) headers.origin = origin;
  if (ip) headers['cf-connecting-ip'] = ip;
  const payload = form ? new URLSearchParams(body).toString() : JSON.stringify(body);
  const jobs = [];
  const req = new Request('https://aimanjack.com/v1/intake', { method: 'POST', headers, body: payload });
  return { jobs, res: onRequest({ request: req, env: e, params: { route: ['intake'] }, waitUntil: (p) => jobs.push(p) }) };
}
const send = async (body, opts) => { const { jobs, res } = call(body, opts); const r = await res; await Promise.allSettled(jobs); return r; };

// A stateful stand-in for Supabase (schema revenue) + the email and ROS endpoints.
const REAL_FETCH = globalThis.fetch;
function fake(t, { rateLimit = () => true, record, rosStatus = 200, emailOk = true } = {}) {
  const original = REAL_FETCH, receipts = new Map(), calls = [], records = [], ros = [], emails = [];
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    url = String(url); calls.push(url);
    if (url.startsWith('https://db.test/')) assert.equal(options.headers['content-profile'], 'revenue', 'intake uses the revenue schema');
    if (url === 'https://db.test/rest/v1/rpc/take_intake_rate_limit') { const v = rateLimit(JSON.parse(options.body)); return v instanceof Response ? v : response(v); }
    if (url === 'https://db.test/rest/v1/rpc/record_intake') {
      const { p, p_consents } = JSON.parse(options.body);
      records.push({ p, p_consents });
      if (record) return record(p);
      const ex = receipts.get(p.dedupe_key);
      if (ex) return response({ receipt_id: ex.receipt_id, received_at: ex.received_at, deduped: true });
      const row = { ...p, receipt_id: crypto.randomUUID(), received_at: new Date().toISOString() };
      receipts.set(p.dedupe_key, row);
      return response({ receipt_id: row.receipt_id, received_at: row.received_at, deduped: false }, 200);
    }
    if (url.includes('/email/sending/send')) { emails.push(JSON.parse(options.body)); return emailOk ? response({ success: true }) : response('provider down', 503); }
    if (url === 'https://ros.test/hook') { ros.push({ headers: options.headers, body: options.body }); return response({ ok: rosStatus < 300 }, rosStatus); }
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  return { receipts, calls, records, ros, emails };
}

test('a valid submission makes exactly one receipt with normalized fields, separate consents and first-touch attribution', async (t) => {
  const db = fake(t);
  const r = await send(valid());
  const j = await r.json();
  assert.equal(r.status, 201, JSON.stringify(j));
  assert.equal(j.ok, true);
  assert.match(j.receipt_id, /^[0-9a-f-]{36}$/);
  assert.deepEqual(Object.keys(j).sort(), ['ok', 'receipt_id'], 'nothing echoed back');
  assert.equal(db.records.length, 1, 'one insert');
  const { p, p_consents } = db.records[0];
  assert.equal(p.dedupe_key, sha(`dana.reyes@northwind-example.com|northwind-example.com|${today()}`));
  assert.equal(p.payload.email, 'dana.reyes@northwind-example.com');
  assert.equal(p.payload.company_website, 'northwind-example.com');
  assert.equal(p.payload.attendees, 12);
  assert.equal(p.consent_request, true);
  assert.equal(p.consent_newsletter, false);
  assert.equal(p.consent_notice_version, 'privacy-2026-10-08-draft');
  assert.equal(p.form_version, 'intake-2026-10-08');
  assert.deepEqual(p.utm, { utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'q4-launch', referrer_host: 'linkedin.com', landing_path: '/ai-training/team-workshop/', first_touch_at: new Date(1760000000000).toISOString() });
  assert.equal(p.self_reported_source, 'linkedin');
  assert.match(p.ip_hash, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(db.records).includes(IP), 'raw IP is never stored');
  assert.deepEqual(p_consents, [{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: false }]);
  assert.equal(db.calls.filter((u) => u.endsWith('take_intake_rate_limit')).length, 2, 'IP and email windows both checked');
});

test('a retried form (same person, same company, same day) dedupes onto one receipt', async (t) => {
  const db = fake(t);
  const first = await (await send(valid())).json();
  const again = await send(valid({ email: 'DANA.REYES@northwind-example.com', company_website: 'northwind-example.com' }));
  const second = await again.json();
  assert.equal(again.status, 200);
  assert.equal(second.receipt_id, first.receipt_id, 'same receipt');
  assert.equal(db.receipts.size, 1, 'one receipt row');
  assert.equal(db.records[0].p.dedupe_key, db.records[1].p.dedupe_key);
  const other = await (await send(valid({ email: 'sam@northwind-example.com' }))).json();
  assert.notEqual(other.receipt_id, first.receipt_id, 'a different person is a different receipt');
});

test('honeypot or a too-fast submission is accepted silently and stores nothing', async (t) => {
  const db = fake(t);
  for (const over of [{ company_url: 'https://spam.example' }, { fill_ms: '400' }]) {
    const r = await send(valid(over));
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { ok: true }, 'no receipt id for dropped submissions');
  }
  assert.equal(db.calls.length, 0, 'no rate limit, insert, email or webhook');
});

test('missing request consent is a 400 and touches nothing', async (t) => {
  const db = fake(t);
  for (const over of [{ consent_request: false }, { consent_request: undefined }, { consent_request: 'no' }]) {
    const r = await send(valid(over));
    assert.equal(r.status, 400);
    assert.equal((await r.json()).error, 'consent_required');
  }
  assert.equal(db.calls.length, 0);
});

test('newsletter consent defaults to false and is recorded only when ticked', async (t) => {
  const db = fake(t);
  const { consent_newsletter, ...noNewsletter } = valid();
  await send(noNewsletter);
  assert.equal(db.records[0].p.consent_newsletter, false);
  assert.deepEqual(db.records[0].p_consents[1], { consent_type: 'newsletter', granted: false });
  await send(valid({ email: 'opt-in@northwind-example.com', consent_newsletter: true }));
  assert.equal(db.records[1].p.consent_newsletter, true);
  assert.deepEqual(db.records[1].p_consents[1], { consent_type: 'newsletter', granted: true });
});

test('a foreign or missing Origin is refused with 403', async (t) => {
  const db = fake(t);
  for (const origin of ['https://evil.example', null]) {
    const r = await send(valid(), { origin });
    assert.equal(r.status, 403);
    assert.equal((await r.json()).error, 'origin_not_allowed');
  }
  assert.equal(db.calls.length, 0);
});

test('rate limiting fails closed: limiter error or no client IP → 503, over the limit → 429, nothing stored', async (t) => {
  t.mock.method(console, 'error', () => {});
  const down = fake(t, { rateLimit: () => response({ message: 'rate-limit store unavailable' }, 503) });
  let r = await send(valid());
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, 'intake_unavailable');
  r = await send(valid(), { ip: null });
  assert.equal(r.status, 503);
  assert.equal(down.records.length, 0);
});

test('over the rate limit → 429', async (t) => {
  const db = fake(t, { rateLimit: () => false });
  const r = await send(valid());
  assert.equal(r.status, 429);
  assert.equal((await r.json()).error, 'rate_limited');
  assert.equal(db.records.length, 0);
});

test('server-side validation rejects bad fields by name only', async (t) => {
  fake(t);
  const cases = [[{ email: 'not-an-email' }, 'email'], [{ location: 'other_texas', location_city: '' }, 'location_city'], [{ attendees: '0' }, 'attendees'], [{ attendees: '12.5' }, 'attendees'],
    [{ industry: 'casino' }, 'industry'], [{ format: '' }, 'format'], [{ workflows: 'x'.repeat(2001) }, 'workflows'], [{ name: '' }, 'name'], [{ company_website: 'not a url' }, 'company_website'], [{ source: 'tiktok-ads' }, 'source']];
  for (const [over, field] of cases) {
    const r = await send(valid(over)), j = await r.json();
    assert.equal(r.status, 400, field);
    assert.equal(j.error, 'invalid');
    assert.ok(j.fields.includes(field), `${field} flagged: ${j.fields}`);
    assert.ok(!JSON.stringify(j).includes('Dana') && !JSON.stringify(j).includes('northwind'), 'no values echoed');
  }
  assert.equal((await send(valid({ location: 'other_texas', location_city: 'Odessa' }))).status, 201, 'another Texas city with a name is fine');
});

test('every option the quote form renders is accepted by the server (form and API stay in sync)', async (t) => {
  fake(t);
  const route = contactPages.find((p) => p.path === QUOTE_URL);
  for (const lang of ['en', 'zh']) {
    const html = render(pageOf(route, lang), lang);
    for (const name of ['industry', 'headcount', 'format', 'location', 'timing', 'source']) {
      const sel = html.match(new RegExp(`<select id="qf-${name}" name="${name}"[^>]*>([\\s\\S]*?)</select>`))[1];
      const values = [...sel.matchAll(/<option value="([^"]*)">/g)].map((m) => m[1]).filter(Boolean);
      assert.ok(values.length >= 3, `${name} options`);
      for (const v of values) {
        const r = await send(valid({ [name]: v, email: `${name}-${v.replace(/\W/g, '')}-${lang}@example.com`, location_city: name === 'location' && v === 'other_texas' ? 'Odessa' : '' }));
        assert.equal(r.status, 201, `${lang} ${name}=${v}`);
      }
    }
  }
});

test('plain form POST without JS: 303 to the receipt or error anchor, in the right language', async (t) => {
  const db = fake(t);
  const asForm = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== false && v !== undefined).map(([k, v]) => [k, v === true ? 'yes' : String(v)]));
  let r = await send(asForm(valid({ fill_ms: '' })), { form: true });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/contact/quote/#received');
  assert.equal(db.records[0].p.consent_newsletter, false, 'unticked checkbox is absent from the form body → false');
  assert.equal(db.records[0].p.payload.timer, 'absent', 'no-JS posts are flagged for triage, not rejected');
  r = await send(asForm(valid({ lang: 'zh', email: 'zh@example.com' })), { form: true });
  assert.equal(r.headers.get('location'), '/zh/contact/quote/#received');
  r = await send(asForm(valid({ consent_request: false, email: 'x@example.com' })), { form: true });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/contact/quote/#not-sent');
});

test('owner notice goes out only when email is configured, and its failure never fails the request', async (t) => {
  t.mock.method(console, 'error', () => {});
  const off = fake(t);
  await send(valid());
  assert.equal(off.emails.length, 0, 'no CF_EMAIL_TOKEN → no email');
  const on = fake(t, { emailOk: false });
  const r = await send(valid({ email: 'b@example.com' }), { e: { ...env, CF_EMAIL_TOKEN: 'email-token' } });
  assert.equal(r.status, 201, 'email failure does not fail the intake');
  assert.equal(on.emails.length, 1);
  assert.equal(on.emails[0].to, 'jack@aimanjack.com');
  assert.match(on.emails[0].text, /not a booked meeting/);
});

test('ROS webhook: signed with HMAC-SHA256 over "${t}.${body}", event id = receipt id, no IP data, once per receipt, failures ignored', async (t) => {
  t.mock.method(console, 'error', () => {});
  const secret = 'ros-test-secret';
  const e = { ...env, ROS_WEBHOOK_URL: 'https://ros.test/hook', ROS_WEBHOOK_SECRET: secret };
  const db = fake(t, { rosStatus: 500 });
  const r = await send(valid(), { e });
  const j = await r.json();
  assert.equal(r.status, 201, 'a failing webhook does not fail the request');
  assert.equal(db.ros.length, 1);
  const { headers, body } = db.ros[0];
  assert.match(headers['x-ros-timestamp'], /^\d{10}$/);
  assert.equal(headers['x-ros-event-id'], j.receipt_id);
  assert.equal(headers['x-ros-signature'], `sha256=${createHmac('sha256', secret).update(`${headers['x-ros-timestamp']}.${body}`).digest('hex')}`);
  const event = JSON.parse(body);
  assert.equal(event.event_type, 'intake.received');
  assert.equal(event.receipt_id, j.receipt_id);
  assert.equal(event.consent_request, true); assert.equal(event.consent_newsletter, false);
  assert.ok(!('ip_hash' in event) && !('subject_email_hash' in event) && !body.includes(IP), 'no IP data in the event');
  await send(valid(), { e });
  assert.equal(db.ros.length, 1, 'a deduped retry is not re-sent');
  const quiet = fake(t);
  await send(valid({ email: 'c@example.com' }));
  assert.equal(quiet.ros.length, 0, 'no webhook env → no webhook');
});

test('no PII reaches console output on any path, including store, email and webhook failures', async (t) => {
  const lines = [];
  for (const m of ['log', 'error', 'warn', 'info', 'debug']) t.mock.method(console, m, (...a) => lines.push(a.map((x) => (x instanceof Error ? `${x.message} ${x.stack}` : typeof x === 'string' ? x : JSON.stringify(x))).join(' ')));
  const e = { ...env, CF_EMAIL_TOKEN: 'email-token', ROS_WEBHOOK_URL: 'https://ros.test/hook', ROS_WEBHOOK_SECRET: 's' };
  // store error whose body echoes the row, as PostgREST error details can
  fake(t, { record: (p) => response({ code: '23514', message: `failing row contains (${p.payload.name}, ${p.payload.email}, ${p.payload.company})` }, 400) });
  assert.equal((await send(valid(), { e })).status, 503);
  fake(t, { rateLimit: () => response({ message: 'down', hint: 'dana.reyes@northwind-example.com' }, 500) });
  assert.equal((await send(valid(), { e })).status, 503);
  fake(t, { emailOk: false, rosStatus: 502 });
  assert.equal((await send(valid(), { e })).status, 201);
  fake(t, { record: () => { throw new Error(`socket closed while sending Dana Reyes dana.reyes@northwind-example.com`); } });
  assert.equal((await send(valid(), { e })).status, 503);
  assert.ok(lines.length >= 4, 'failures were logged');
  const out = lines.join('\n');
  for (const s of PII) assert.ok(!out.toLowerCase().includes(s.toLowerCase()), `console output contains ${s}`);
});
