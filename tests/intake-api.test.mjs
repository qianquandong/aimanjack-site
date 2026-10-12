// POST /v1/intake — training quote intake (Revenue OS v6, W-002). Mirrors coupon-api.test.mjs: fetch is mocked, nothing leaves the machine.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash, createHmac } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { onRequest } from '../functions/v1/[[route]].js';
import { pages as contactPages } from '../src/pages/contact.mjs';
import { render, pageOf } from '../src/layout.mjs';
import { QUOTE_URL } from '../src/config.mjs';

const env = { SITE_ENV: 'production',
  SUPABASE_URL: 'https://db.test', SB_SECRET_KEY: 'test-key',
  CF_ACCOUNT_ID: 'account', CF_EMAIL_TOKEN: '', EMAIL_FROM: 'bookings@aimanjack.com', OWNER_EMAIL: 'jack@aimanjack.com',
  SITE_ORIGIN: 'https://aimanjack.com', ADMIN_TOKEN: 'admin-token',
  EMAIL_HASH_SECRET: 'email-hash-test-secret', IP_HASH_SALT: 'ip-salt-test',
};
const { EMAIL_HASH_SECRET: _s, IP_HASH_SALT: _i, ...unsalted } = env;   // production before the secrets are set
const IP = '203.0.113.77';
const PII = ['Dana', 'Reyes', 'dana.reyes', 'Northwind', 'northwind', 'dispatch spreadsheet', IP];
const response = (body, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
const sha = (s) => createHash('sha256').update(s).digest('hex');
const hmac = (k, s) => createHmac('sha256', k).update(s).digest('hex');
const EMAIL = 'dana.reyes@northwind-example.com';
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
    if (url.startsWith('https://db.test/') && /\/(take_intake_rate_limit|record_intake)$/.test(url)) assert.equal(options.headers['content-profile'], 'revenue', 'intake uses the revenue schema');
    if (url.startsWith('https://db.test/rest/v1/notifications?') || url.startsWith('https://db.test/rest/v1/coupon_rate_limits?')) return response([]);
    if (url === 'https://db.test/rest/v1/rpc/take_coupon_rate_limit') {
      assert.equal(options.headers['content-profile'], 'booking', 'shared mail quota uses booking schema');
      assert.equal(JSON.parse(options.body).p_limit, 1);
      return response(true);
    }
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
  assert.equal(p.dedupe_key, hmac(env.EMAIL_HASH_SECRET, `dedupe:${EMAIL}|northwind-example.com|${today()}`), 'dedupe key is keyed (HMAC)');
  assert.equal(p.subject_email_hash, hmac(env.EMAIL_HASH_SECRET, `subject:${EMAIL}`), 'subject hash = HMAC(EMAIL_HASH_SECRET, subject:email)');
  assert.equal(p.ip_hash, hmac(env.IP_HASH_SALT, `intake-ip:${IP}`), 'ip hash = HMAC(IP_HASH_SALT, intake-ip:ip)');
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

test('destination settings alone never enable event transmission; receipt still persists', async (t) => {
  const e = { ...env, ROS_WEBHOOK_URL: 'https://ros.test/hook', ROS_WEBHOOK_SECRET: 'test' };
  const db = fake(t);
  const r = await send(valid(), {e});
  assert.equal(r.status, 201);
  assert.equal(db.ros.length, 0);
  assert.equal(db.records.length, 1);
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

// ── Hashing and erasure (lifecycle/privacy review 2026-10-08) ──
const UNSALTED = (email) => [email, `email:${email}`, `subject:${email}`, `intake-email:${email}`, `coupon-email:${email}`].map(sha);

test('EMAIL_HASH_SECRET / IP_HASH_SALT unset: subject and IP hashes are null, dedupe falls back to the day-scoped sha256 (receipt row only), warnings are code-only', async (t) => {
  const lines = [];
  t.mock.method(console, 'warn', (...a) => lines.push(a.join(' ')));
  const e = { ...unsalted, ROS_WEBHOOK_URL: 'https://ros.test/hook', ROS_WEBHOOK_SECRET: 's' };
  const db = fake(t);
  const r = await send(valid(), { e });
  assert.equal(r.status, 201, 'intake still works without the secrets');
  const { p } = db.records[0];
  assert.equal(p.subject_email_hash, null, 'no unsalted subject hash');
  assert.equal(p.ip_hash, null, 'no unsalted IP hash');
  assert.equal(p.dedupe_key, sha(`${EMAIL}|northwind-example.com|${today()}`), 'documented fallback');
  assert.equal(db.ros.length, 0, 'disabled event processor never transmits receipt data');
  assert.ok(lines.some((l) => /EMAIL_HASH_SECRET unset/.test(l)) && lines.some((l) => /IP_HASH_SALT unset/.test(l)), 'warned');
  for (const s of PII) assert.ok(!lines.join('\n').toLowerCase().includes(s.toLowerCase()), `warning contains ${s}`);
});

test('no unsalted sha256 of the email (or of the IP) is sent anywhere, with or without the secrets', async (t) => {
  for (const e of [env, unsalted]) {
    t.mock.method(console, 'warn', () => {});
    const sent = [];
    const db = fake(t);
    const inner = globalThis.fetch;
    globalThis.fetch = async (url, o = {}) => { sent.push(String(o.body ?? '')); return inner(url, o); };
    await send(valid(), { e: { ...e, ROS_WEBHOOK_URL: 'https://ros.test/hook', ROS_WEBHOOK_SECRET: 's' } });
    assert.ok(db.records.length === 1);
    const all = sent.join('\n');
    for (const h of [...UNSALTED(EMAIL), sha(IP), sha(`intake-ip:${IP}`), sha(`intake-ip:${IP}|`)]) assert.ok(!all.includes(h), `unsalted hash ${h.slice(0, 8)}… sent`);
    if (e.EMAIL_HASH_SECRET) assert.ok(!all.includes(sha(`${EMAIL}|northwind-example.com|${today()}`)), 'with the secret, not even the day-scoped fallback is computed');
  }
});

test('functions/v1 source: the only sha256() call is the documented day-scoped dedupe fallback', () => {
  for (const file of readdirSync(new URL('../functions/v1/', import.meta.url)).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(new URL(`../functions/v1/${file}`, import.meta.url), 'utf8');
    const calls = [...src.matchAll(/\bsha256\(([^)]*)\)/g)].map((m) => m[1]).filter((arg) => arg !== 'value');   // skip the definition
    assert.deepEqual(calls, ['dedupeBasis'], `${file}: unexpected sha256 call sites ${JSON.stringify(calls)}`);
    assert.match(src, /emailHmac\(env, 'dedupe', dedupeBasis\)\)\s*\?\?\s*\(await sha256\(dedupeBasis\)\)/, 'fallback only when the HMAC is unavailable');
    assert.doesNotMatch(src, /sha256\(`[^`]*(email|ip)/i, 'no template-literal sha256 over an email or IP');
    assert.doesNotMatch(src, /IP_HASH_SALT \|\| ''/, 'no empty-salt IP hash');
  }
});

test('migration: consent ledger has no FK to receipts, erase_subject is a service-role-only SECURITY DEFINER function, RLS on with no policies', () => {
  const sql = readFileSync(new URL('../db/migrations/2026-10-08-revenue-intake.sql', import.meta.url), 'utf8');
  const code = sql.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');   // ignore comments
  assert.doesNotMatch(code, /references\s+revenue\.intake_receipts/i, 'no foreign key from the append-only ledger');
  assert.match(code, /drop constraint if exists consent_events_receipt_id_fkey/);
  const ce = code.match(/create table if not exists revenue\.consent_events \(([\s\S]*?)\n\);/)[1];
  assert.doesNotMatch(ce, /\b(payload|email text|name text|company)\b/i, 'no PII columns in the ledger');
  assert.match(ce, /subject_email_hash text check \(subject_email_hash is null or/);
  assert.match(code, /create table if not exists revenue\.intake_receipts \([\s\S]*?subject_email_hash text/);
  const fn = code.match(/create or replace function revenue\.erase_subject\(p_subject_hash text\) returns jsonb([\s\S]*?)\$\$;/)[1];
  assert.match(fn, /security definer/);
  assert.match(fn, /set search_path = revenue, pg_temp/);
  assert.match(fn, /delete from revenue\.intake_receipts where subject_email_hash = p_subject_hash/);
  assert.match(fn, /insert into revenue\.consent_events[\s\S]*'erasure'[\s\S]*'dsar_erasure'/);
  assert.match(code, /grant execute on function revenue\.erase_subject\(text\) to service_role;/);
  assert.match(code, /revoke execute on function revenue\.erase_subject\(text\) from public, anon, authenticated;/);
  assert.match(code, /revoke update, delete, truncate on revenue\.intake_receipts from service_role;/, 'receipts are deleted only via the erase functions');
  assert.match(code, /where c->>'consent_type' in \('request_contact', 'newsletter'\)/, 'the form cannot forge an erasure event');
  for (const tbl of ['intake_receipts', 'consent_events', 'intake_rate_limits']) assert.match(code, new RegExp(`alter table revenue\\.${tbl} enable row level security;`));
  assert.doesNotMatch(code, /create policy/i, 'no anon/authenticated policies');
  assert.doesNotMatch(code, /grant [^;]* to (anon|authenticated)/i);
});
