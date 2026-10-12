import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequest } from '../functions/v1/[[route]].js';

const PROCESS_KEY = 'p'.repeat(64);
const env = {
SITE_ENV: 'production',   ADMIN_TOKEN: 'private-owner-administrator',
  NOTIFICATION_PROCESS_TOKEN: PROCESS_KEY,
  SUPABASE_URL: 'https://supabase.test.invalid',
  SB_SECRET_KEY: 'test-only-service-key',
  MAIL_TRANSPORT: 'cloudflare',
  CF_ACCOUNT_ID: 'test-account',
  CF_EMAIL_TOKEN: 'test-only-email-token',
};

const request = async (method, path, token, fields = {}) => onRequest({
  request: new Request('https://aimanjack.com/v1/' + path, {
    method,
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    ...(method === 'POST' && Object.keys(fields).length ? { body: JSON.stringify(fields) } : {}),
  }),
  env,
  params: { route: path.split('?')[0].split('/') },
});

test('scoped scheduler key processes only due booking notifications; no PII is returned', async (t) => {
  const oldFetch = globalThis.fetch;
  const queries = [];
  t.after(() => { globalThis.fetch = oldFetch; });
  globalThis.fetch = async (url, opts = {}) => {
    assert.ok(String(url).startsWith(env.SUPABASE_URL + '/rest/v1/notifications?'));
    queries.push({ path: String(url), method: opts.method || 'GET' });
    return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const ok = await request('POST', 'notifications/process', PROCESS_KEY);
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { uncertain: 0, processed: [] });
  assert.equal(queries.length, 3);

  const blocked = [
    ['GET', 'notifications'],
    ['POST', 'notifications/requeue'],
    ['GET', 'bookings?business=aimanjack'],
    ['GET', 'admin/email-config'],
  ];
  for (const [method, path] of blocked) {
    const r = await request(method, path, PROCESS_KEY, { ids: [1] });
    assert.equal(r.status, 401, `${method} ${path} must not accept the scoped key`);
  }
  assert.equal(queries.length, 3, 'prohibited actions must not touch the database');
});

test('missing, incorrect or short scheduler token cannot process due messages', async () => {
  for (const token of ['invalid', 'short-key', '']) {
    const r = await request('POST', 'notifications/process', token);
    assert.equal(r.status, 401);
  }
  const r = await onRequest({
    request: new Request('https://aimanjack.com/v1/notifications/process', {
      method: 'POST', headers: { authorization: 'Bearer ' + PROCESS_KEY },
    }),
    env: { ...env, NOTIFICATION_PROCESS_TOKEN: 'short' },
    params: { route: ['notifications', 'process'] },
  });
  assert.equal(r.status, 401);
});
