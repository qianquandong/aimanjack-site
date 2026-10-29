import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/v1/[[route]].js';
import { forwardToken, sender, dropReason } from '../src/phone-inbox.mjs';

const READ = 'r'.repeat(40);
const kv = () => { const m = new Map(); return { m, get: async (k) => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); } }; };
const envWith = (store = kv()) => ({ SITE_ENV: 'production', ADMIN_TOKEN: 'owner-admin', TEXTS_READ_TOKEN: READ, PHONE_INBOX: store });
const call = (env, method, route, token, body) => onRequest({ env, params: { route: route.split('/') },
  request: new Request('https://aimanjack.com/v1/' + route, { method, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }) });

test('sender: phone numbers become E.164, contact names stay; codes and short codes are dropped', () => {
  assert.equal(sender('+1 (214) 766-1141'), '+12147661141');
  assert.equal(sender('2147661141'), '+12147661141');
  assert.equal(sender('Matt Pickett'), 'Matt Pickett');
  assert.equal(sender('马特'), '马特');
  assert.equal(dropReason('Matt', 'Can we move the call to tomorrow 3pm?'), null);
  assert.equal(dropReason('Matt', 'Call me at 2147661141 tomorrow'), null);
  assert.equal(dropReason('Bank', 'Your verification code is 482913'), 'one_time_code');
  assert.equal(dropReason('Apple', '您的验证码是 4821'), 'one_time_code');
  assert.equal(dropReason('72975', 'Reply STOP to end'), 'short_code');
});

test('forward token is write-only: it stores texts but cannot read them; admin and the read token can read', async () => {
  const store = kv(), env = envWith(store), fwd = await forwardToken(env);
  assert.equal(fwd.length, 40);
  assert.notEqual(fwd, env.ADMIN_TOKEN);
  assert.equal((await call(env, 'POST', 'phone/inbound', 'owner-admin', { from: 'Matt', body: 'hi' })).status, 401);
  const r = await call(env, 'POST', 'phone/inbound', fwd, { from: '(214) 766-1141', body: 'Can we do tomorrow at 3?' });
  assert.deepEqual(await r.json(), { ok: true, stored: true });
  assert.deepEqual(await (await call(env, 'POST', 'phone/inbound', fwd, { from: '2147661141', body: 'Can we do tomorrow at 3?' })).json(), { ok: true, stored: false, reason: 'duplicate' });
  assert.deepEqual(await (await call(env, 'POST', 'phone/inbound', fwd, { from: 'Chase', body: 'Your code is 123456' })).json(), { ok: true, stored: false, reason: 'one_time_code' });
  await call(env, 'POST', 'phone/inbound', fwd, { from: 'Dana', body: 'Thanks!' });
  assert.equal((await call(env, 'GET', 'admin/phone', fwd)).status, 401);
  const list = await (await call(env, 'GET', 'admin/phone', READ)).json();
  assert.deepEqual(list.messages.map((m) => [m.from, m.body]), [['Dana', 'Thanks!'], ['+12147661141', 'Can we do tomorrow at 3?']]);
  assert.ok(!JSON.stringify([...store.m.values()]).includes('123456'), 'codes are never stored');
  assert.equal((await call(env, 'GET', 'admin/phone/setup', READ)).status, 401);
  assert.deepEqual(await (await call(env, 'GET', 'admin/phone/setup', 'owner-admin')).json(), { url: 'https://aimanjack.com/v1/phone/inbound', token: fwd });
});

test('old messages age out and the list is capped', async () => {
  const store = kv(), env = envWith(store), fwd = await forwardToken(env);
  const old = new Date(Date.now() - 31 * 864e5).toISOString();
  store.m.set('recent', JSON.stringify([{ id: 'x', from: 'Old', body: 'old', at: old }, ...Array.from({ length: 300 }, (_, i) => ({ id: 'k' + i, from: 'P' + i, body: 'b', at: new Date(Date.now() - i * 1000 - 5e5).toISOString() }))]));
  await call(env, 'POST', 'phone/inbound', fwd, { from: 'New', body: 'new' });
  const rows = JSON.parse(store.m.get('recent'));
  assert.equal(rows.length, 300);
  assert.equal(rows[0].from, 'New');
  assert.ok(!rows.some((m) => m.from === 'Old'));
});

test('without the KV binding both routes say so and nothing else happens', async () => {
  const env = { ...envWith(), PHONE_INBOX: undefined };
  assert.equal((await call(env, 'POST', 'phone/inbound', 'anything', { from: 'a', body: 'b' })).status, 503);
  assert.equal((await call(env, 'GET', 'admin/phone', 'owner-admin')).status, 503);
});
