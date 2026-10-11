import assert from 'node:assert/strict';
import test from 'node:test';
import { reserveMailSend } from '../src/mail-quota.mjs';

// Models the existing SQL RPC's one-row atomic upsert (no real DB or network).
function quotaStore({ history = [], fail = null } = {}) {
  const rows = new Map(), calls = [];
  const db = async (path, options = {}) => {
    calls.push({ path, body: options.body });
    if (fail && path.startsWith(fail)) throw new Error('offline store failure');
    if (path.startsWith('notifications?')) return history;
    if (path.startsWith('coupon_rate_limits?')) {
      const keys = new URL('https://test.invalid/' + path).searchParams.get('key_hash').slice(4, -1).split(',');
      return keys.flatMap(key => rows.has(key) ? [{ ...rows.get(key) }] : []);
    }
    assert.equal(path, 'rpc/take_coupon_rate_limit');
    assert.equal(options.body.p_limit, 1);
    assert.equal(options.body.p_window_seconds, 86400);
    const { p_key_hash: key } = options.body;
    let row = rows.get(key);
    if (!row || Date.parse(row.window_start) <= Date.now() - 86400000) {
      row = { key_hash: key, window_start: new Date(Date.now()).toISOString(), requests: 0 }; rows.set(key, row);
    }
    row.requests++;
    return row.requests <= 1;
  };
  return { db, rows, calls };
}

test('simultaneous sends cannot oversubscribe one mailbox budget across callers', async () => {
  const store = quotaStore(), env = { MAIL_DAILY_CAP: '3' };
  const results = await Promise.all(Array.from({ length: 30 }, () => reserveMailSend(env, store.db, 'Sender@Example.COM')));
  assert.equal(results.filter(r => r.ok).length, 3);
  assert.equal((await reserveMailSend(env, store.db, 'sender@example.com')).error, 'daily_send_cap_reached');
  assert.equal(store.rows.size, 3);
  assert.ok(store.calls.every(c => !JSON.stringify(c).includes('example.com')), 'stored keys do not contain mailbox addresses');
});

test('slots expire individually after 24 hours, with no reset burst at midnight', async (t) => {
  let now = Date.parse('2026-10-11T23:59:00Z');
  t.mock.method(Date, 'now', () => now);
  const store = quotaStore(), env = { MAIL_DAILY_CAP: '2' };
  assert.equal((await reserveMailSend(env, store.db, 'sender@example.com')).ok, true);
  now += 120000;
  assert.equal((await reserveMailSend(env, store.db, 'sender@example.com')).ok, true);
  assert.equal((await reserveMailSend(env, store.db, 'sender@example.com')).ok, false);
  now += 86400000 - 120000;
  const results = await Promise.all([reserveMailSend(env, store.db, 'sender@example.com'), reserveMailSend(env, store.db, 'sender@example.com')]);
  assert.equal(results.filter(r => r.ok).length, 1, 'only the first slot has expired');
});

test('quota storage/read/RPC failures and non-boolean RPC results all fail closed', async () => {
  for (const fail of ['notifications?', 'coupon_rate_limits?', 'rpc/']) {
    const store = quotaStore({ fail });
    assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: '1' }, store.db, 'sender@example.com')).error, 'mail_quota_unavailable');
  }
  const store = quotaStore();
  const badRpc = (p, o) => p.startsWith('rpc/') ? Promise.resolve('true') : store.db(p, o);
  assert.equal((await reserveMailSend({}, badRpc, 'sender@example.com')).error, 'mail_quota_unavailable');
});

test('invalid caps never silently become a larger default', async () => {
  for (const cap of ['0', '-1', '1.2', 'NaN', 'Infinity', '101']) {
    const store = quotaStore();
    assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: cap }, store.db, 'sender@example.com')).error, 'config_invalid:MAIL_DAILY_CAP');
    assert.equal(store.calls.length, 0);
  }
});

test('exhausted legacy ledger is honored before quota slots are created', async () => {
  const store = quotaStore({ history: [{ id: 1 }] });
  assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: '1' }, store.db, 'sender@example.com')).error, 'daily_send_cap_reached');
  assert.equal(store.rows.size, 0);
});

test('partially used legacy budget and concurrent new sends stay within the same cap', async () => {
  const store = quotaStore({ history: [{ id: 'already-sent-before-rollout' }] });
  const results = await Promise.all(Array.from({ length: 10 }, () => reserveMailSend({ MAIL_DAILY_CAP: '3' }, store.db, 'sender@example.com')));
  assert.equal(results.filter(r => r.ok).length, 2, 'one historical send leaves only two new slots');
  assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: '3' }, store.db, 'sender@example.com')).error, 'daily_send_cap_reached');
});

test('quota is still enforced for legacy fallback without the notification table', async () => {
  const store = quotaStore();
  const db = (p, o) => p.startsWith('notifications?') ? Promise.reject(Object.assign(new Error('missing'), { code: '42P01' })) : store.db(p, o);
  assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: '1' }, db, 'sender@example.com')).ok, true);
  assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: '1' }, db, 'sender@example.com')).ok, false);
});

test('different mailbox senders have independent slots', async () => {
  const store = quotaStore();
  assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: '1' }, store.db, 'one@example.com')).ok, true);
  assert.equal((await reserveMailSend({ MAIL_DAILY_CAP: '1' }, store.db, 'two@example.com')).ok, true);
});
