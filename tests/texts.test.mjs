import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/v1/[[route]].js';
import { shape, threads } from '../src/texts.mjs';

const LINE = '+14694254142', DEMO = '+14695172968', OWNER = '+12145550000', A = '+12145550101', B = '+19725550102';
const READ = 'r'.repeat(40);
const env = { SITE_ENV: 'production', ADMIN_TOKEN: 'owner-admin', TEXTS_READ_TOKEN: READ, TEXT_NUMBERS: `${LINE},${DEMO}`,
  TEXT_HIDE_NUMBERS: OWNER, TWILIO_ACCOUNT_SID: 'ACtest', TWILIO_API_KEY: 'SKtest', TWILIO_API_SECRET: 'secret' };
const msg = (sid, from, to, body, at, extra = {}) => ({ sid, from, to, body, date_sent: at, status: 'delivered', num_media: '0', ...extra });
const store = [
  msg('SM1', A, LINE, 'Hi, can we move the call to tomorrow?', 'Wed, 28 Oct 2026 20:00:00 +0000'),
  msg('SM2', LINE, A, 'Sure, what time works?', 'Wed, 28 Oct 2026 20:05:00 +0000'),
  msg('SM3', B, DEMO, 'pricing?', 'Tue, 27 Oct 2026 15:00:00 +0000'),
  msg('SM4', LINE, OWNER, 'AI line alert', 'Wed, 28 Oct 2026 21:00:00 +0000'),
];

function fakeTwilio(t, sent = []) {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  const calls = [];
  globalThis.fetch = async (url, o = {}) => {
    const u = new URL(url); calls.push({ url: u, o });
    assert.equal(u.origin, 'https://api.twilio.com');
    assert.equal(o.headers.authorization, 'Basic ' + btoa('SKtest:secret'));
    if ((o.method || 'GET') === 'POST') {
      const f = new URLSearchParams(o.body); sent.push(Object.fromEntries(f));
      if (f.get('To') === '+19995550000') return new Response(JSON.stringify({ code: 21610, message: 'opted out' }), { status: 400 });
      return new Response(JSON.stringify(msg('SM9', f.get('From'), f.get('To'), f.get('Body'), 'Wed, 28 Oct 2026 22:00:00 +0000', { status: 'queued' })), { status: 201 });
    }
    const to = u.searchParams.get('To'), from = u.searchParams.get('From');
    return new Response(JSON.stringify({ messages: store.filter((m) => (!to || m.to === to) && (!from || m.from === from)) }), { status: 200 });
  };
  return calls;
}
const call = (method, path, token, body) => onRequest({ env, params: { route: ['admin', 'texts'] },
  request: new Request('https://aimanjack.com/v1/admin/texts' + path, { method, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }) });

test('shape marks direction from our own numbers; threads group by the other person, newest first, hidden numbers left out', () => {
  const own = [LINE, DEMO];
  const rows = store.map((m) => shape(m, own));
  assert.deepEqual(rows.map((r) => [r.direction, r.with, r.via]), [['in', A, LINE], ['out', A, LINE], ['in', B, DEMO], ['out', OWNER, LINE]]);
  assert.equal(rows[0].at, '2026-10-28T20:00:00.000Z');
  const t = threads(rows, [OWNER]);
  assert.deepEqual(t.map((x) => [x.with, x.via, x.count, x.last.direction]), [[A, LINE, 2, 'out'], [B, DEMO, 1, 'in']]);
  assert.equal(t[0].last_in_at, '2026-10-28T20:00:00.000Z');
});

test('list and thread read Twilio live; the read token can read but never send', async (t) => {
  fakeTwilio(t);
  const list = await (await call('GET', '', 'owner-admin')).json();
  assert.deepEqual(list.numbers, [LINE, DEMO]);
  assert.deepEqual(list.threads.map((x) => x.with), [A, B]);
  const th = await (await call('GET', '?with=' + encodeURIComponent(A), READ)).json();
  assert.deepEqual(th.messages.map((m) => m.sid), ['SM1', 'SM2']);
  assert.equal(th.via, LINE);
  assert.equal((await call('POST', '', READ, { to: A, body: 'hi' })).status, 401);
  assert.equal((await call('GET', '', 'wrong')).status, 401);
  assert.equal((await call('GET', '?with=not-a-number', 'owner-admin')).status, 400);
});

test('owner reply goes out from one of our numbers only; Twilio refusals come back as a code', async (t) => {
  const sent = []; fakeTwilio(t, sent);
  const ok = await call('POST', '', 'owner-admin', { to: A, body: ' Tomorrow 3pm works. ', from: LINE });
  assert.equal(ok.status, 200);
  assert.deepEqual(sent[0], { To: A, From: LINE, Body: 'Tomorrow 3pm works.' });
  assert.equal((await ok.json()).sent.direction, 'out');
  assert.equal((await call('POST', '', 'owner-admin', { to: A, body: 'x', from: '+15555550123' })).status, 400);
  assert.equal((await call('POST', '', 'owner-admin', { to: LINE, body: 'x' })).status, 400);
  assert.equal((await call('POST', '', 'owner-admin', { to: A, body: '' })).status, 400);
  const refused = await call('POST', '', 'owner-admin', { to: '+19995550000', body: 'x' });
  assert.equal(refused.status, 502);
  assert.deepEqual(await refused.json(), { error: 'send_failed', code: 21610 });
  assert.equal(sent.length, 2);
});

test('missing Twilio config names the missing settings and makes no call', async (t) => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => { throw new Error('should not fetch'); };
  const r = await onRequest({ env: { ...env, TWILIO_API_SECRET: '', TEXT_NUMBERS: '' }, params: { route: ['admin', 'texts'] },
    request: new Request('https://aimanjack.com/v1/admin/texts', { headers: { authorization: 'Bearer owner-admin' } }) });
  assert.equal(r.status, 503);
  assert.deepEqual((await r.json()).missing, ['TWILIO_API_SECRET', 'TEXT_NUMBERS']);
});
