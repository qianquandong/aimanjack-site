import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequest } from '../functions/v1/[[route]].js';

const env = {
  SUPABASE_URL: 'https://db.test', SB_SECRET_KEY: 'test-key',
  CF_ACCOUNT_ID: 'account', CF_EMAIL_TOKEN: 'email-token',
  EMAIL_FROM: 'offers@aimanjack.com', OWNER_EMAIL: 'jack@aimanjack.com',
  SITE_ORIGIN: 'https://aimanjack.com', ADMIN_TOKEN: 'admin-token',
  COUPON_IP_RATE_LIMITER: { limit: async () => ({ success: true }) },
  COUPON_EMAIL_RATE_LIMITER: { limit: async () => ({ success: true }) },
};
const response = (body, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
const request = (body) => new Request('https://aimanjack.com/v1/coupons', {
  method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://aimanjack.com', 'cf-connecting-ip': '203.0.113.1' }, body: JSON.stringify(body),
});
const ctx = (body) => ({ request: request(body), env, params: { route: ['coupons'] }, waitUntil() {} });

const countingLimiter = () => {
  const counts = new Map();
  return {
    limit: async ({ key }) => {
      const count = (counts.get(key) || 0) + 1;
      counts.set(key, count);
      return { success: count <= 5 };
    },
  };
};

test('coupon claim fails closed when rate-limit bindings are unavailable', async () => {
  const { COUPON_IP_RATE_LIMITER, COUPON_EMAIL_RATE_LIMITER, ...unboundEnv } = env;
  const r = await onRequest({ request: request({ email: 'team@example.com' }), env: unboundEnv, params: { route: ['coupons'] }, waitUntil() {} });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, 'rate_limit_unavailable');
});

test('coupon claim fails closed when Cloudflare does not provide a client IP', async () => {
  const req = new Request('https://aimanjack.com/v1/coupons', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://aimanjack.com' },
    body: JSON.stringify({ email: 'team@example.com' }),
  });
  const r = await onRequest({ request: req, env, params: { route: ['coupons'] }, waitUntil() {} });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, 'rate_limit_unavailable');
});

test('coupon claim fails closed when a rate limiter errors', async (t) => {
  t.mock.method(console, 'error', () => {});
  const limiterErrorEnv = {
    ...env,
    COUPON_IP_RATE_LIMITER: { limit: async () => { throw new Error('limiter unavailable'); } },
  };
  const r = await onRequest({ request: request({ email: 'team@example.com' }), env: limiterErrorEnv, params: { route: ['coupons'] }, waitUntil() {} });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, 'rate_limit_unavailable');
});

test('coupon claim rate limits the sixth request from one IP within a minute', async () => {
  const limitedEnv = {
    ...env,
    CF_EMAIL_TOKEN: '',
    COUPON_IP_RATE_LIMITER: countingLimiter(),
    COUPON_EMAIL_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };
  let result;
  for (let i = 1; i <= 6; i += 1) {
    const req = new Request('https://aimanjack.com/v1/coupons', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://aimanjack.com', 'cf-connecting-ip': '203.0.113.10' },
      body: JSON.stringify({ email: `ip-limit-${i}@example.com` }),
    });
    result = await onRequest({ request: req, env: limitedEnv, params: { route: ['coupons'] }, waitUntil() {} });
  }
  assert.equal(result.status, 429);
  assert.equal((await result.json()).error, 'rate_limited');
});

test('coupon claim rate limits the sixth normalized-email request within a minute', async () => {
  const limitedEnv = {
    ...env,
    CF_EMAIL_TOKEN: '',
    COUPON_IP_RATE_LIMITER: { limit: async () => ({ success: true }) },
    COUPON_EMAIL_RATE_LIMITER: countingLimiter(),
  };
  let result;
  for (let i = 1; i <= 6; i += 1) {
    const req = new Request('https://aimanjack.com/v1/coupons', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://aimanjack.com', 'cf-connecting-ip': `203.0.113.${i}` },
      body: JSON.stringify({ email: i % 2 ? ' Rate-Limit@Example.com ' : 'rate-limit@example.com' }),
    });
    result = await onRequest({ request: req, env: limitedEnv, params: { route: ['coupons'] }, waitUntil() {} });
  }
  assert.equal(result.status, 429);
  assert.equal((await result.json()).error, 'rate_limited');
});

test('coupon claim rejects an invalid email without touching external services', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => { throw new Error('fetch must not run'); };
  const r = await onRequest(ctx({ email: 'not-an-email' }));
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, 'email_invalid');
});

test('coupon claim persists one code and reports only provider-accepted email success', async (t) => {
  const original = globalThis.fetch, calls = [];
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/rest/v1/coupons?') && (!options.method || options.method === 'GET')) return response([]);
    if (String(url).endsWith('/rest/v1/coupons') && options.method === 'POST') return response([JSON.parse(options.body)], 201);
    if (String(url).includes('/email/sending/send')) return response({ success: true });
    if (String(url).includes('/rest/v1/coupons?') && options.method === 'PATCH') return response([]);
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const r = await onRequest(ctx({ email: ' Team@Example.COM ' }));
  const result = await r.json();
  assert.equal(r.status, 201, JSON.stringify(result));
  assert.deepEqual(result, { status: 'accepted' });
  const insert = calls.find((c) => c.options.method === 'POST' && c.url.endsWith('/rest/v1/coupons'));
  const record = JSON.parse(insert.options.body);
  assert.equal(record.email_normalized, 'team@example.com');
  assert.match(record.code, /^AMJ25-[A-Z0-9]{8}$/);
  const mail = calls.find((c) => c.url.includes('/email/sending/send'));
  assert.match(mail.options.body, /\$25 coupon/);
  assert.match(mail.options.body, new RegExp(record.code));
});

test('a sent coupon cannot be claimed twice for the same normalized email', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url) => {
    if (String(url).includes('/rest/v1/coupons?')) return response([{ code: 'AMJ25-ABCDEFGH', email: 'team@example.com', email_normalized: 'team@example.com', issuance_status: 'sent' }]);
    throw new Error(`duplicate claim must not send email: ${url}`);
  };
  const r = await onRequest(ctx({ email: 'TEAM@example.com' }));
  assert.equal(r.status, 409);
  assert.equal((await r.json()).error, 'already_claimed');
});

test('email provider failure is persisted and returned as failure, never success', async (t) => {
  const original = globalThis.fetch, patches = [];
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/rest/v1/coupons?') && (!options.method || options.method === 'GET')) return response([]);
    if (String(url).endsWith('/rest/v1/coupons') && options.method === 'POST') return response([JSON.parse(options.body)], 201);
    if (String(url).includes('/email/sending/send')) return response('provider down', 503);
    if (String(url).includes('/rest/v1/coupons?') && options.method === 'PATCH') { patches.push(JSON.parse(options.body)); return response([]); }
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const r = await onRequest(ctx({ email: 'team@example.com' }));
  assert.equal(r.status, 502);
  assert.equal((await r.json()).error, 'email_failed');
  assert.equal(patches.at(-1).issuance_status, 'failed');
});

test('email provider success false is treated as a failed send', async (t) => {
  const original = globalThis.fetch, patches = [];
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/rest/v1/coupons?') && (!options.method || options.method === 'GET')) return response([]);
    if (String(url).endsWith('/rest/v1/coupons') && options.method === 'POST') return response([JSON.parse(options.body)], 201);
    if (String(url).includes('/email/sending/send')) return response({ success: false, errors: [{ message: 'rejected' }] });
    if (String(url).includes('/rest/v1/coupons?') && options.method === 'PATCH') { patches.push(JSON.parse(options.body)); return response([]); }
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const r = await onRequest(ctx({ email: 'team@example.com' }));
  assert.equal(r.status, 502);
  assert.equal((await r.json()).error, 'email_failed');
  assert.equal(patches.at(-1).issuance_status, 'failed');
});

test('a concurrent pending claim is not sent twice', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let reads = 0;
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/rest/v1/coupons?') && (!options.method || options.method === 'GET')) {
      reads += 1;
      return response(reads === 1 ? [] : [{ code: 'AMJ25-PENDING1', email: 'team@example.com', email_normalized: 'team@example.com', issuance_status: 'pending' }]);
    }
    if (String(url).endsWith('/rest/v1/coupons') && options.method === 'POST') return response({ code: '23505' }, 409);
    if (String(url).includes('/email/sending/send')) throw new Error('pending coupon must not be emailed twice');
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const r = await onRequest(ctx({ email: 'team@example.com' }));
  assert.equal(r.status, 409);
  assert.equal((await r.json()).error, 'already_claimed');
});

test('a failed coupon retry must win an atomic lease before sending', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/rest/v1/coupons?') && (!options.method || options.method === 'GET')) return response([{ code: 'AMJ25-FAILED01', email: 'team@example.com', email_normalized: 'team@example.com', issuance_status: 'failed', delivery_attempts: 1 }]);
    if (String(url).includes('/rest/v1/coupons?') && options.method === 'PATCH') return response([]);
    if (String(url).includes('/email/sending/send')) throw new Error('lease loser must not send');
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const r = await onRequest(ctx({ email: 'team@example.com' }));
  assert.equal(r.status, 409);
  assert.equal((await r.json()).error, 'already_claimed');
});

test('provider acceptance remains success when the sent-status write fails', async (t) => {
  const original = globalThis.fetch;
  t.mock.method(console, 'error', () => {});
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/rest/v1/coupons?') && (!options.method || options.method === 'GET')) return response([]);
    if (String(url).endsWith('/rest/v1/coupons') && options.method === 'POST') return response([JSON.parse(options.body)], 201);
    if (String(url).includes('/email/sending/send')) return response({ success: true });
    if (String(url).includes('/rest/v1/coupons?') && options.method === 'PATCH') return response({ message: 'db down' }, 503);
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const r = await onRequest(ctx({ email: 'team@example.com' }));
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { status: 'accepted' });
});

test('manual redemption fails closed when another admin wins the update race', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/rest/v1/coupons?') && (!options.method || options.method === 'GET')) return response([{ code: 'AMJ25-ABCDEFGH', issuance_status: 'sent', redeemed_at: null }]);
    if (String(url).includes('/rest/v1/coupons?') && options.method === 'PATCH') return response([]);
    throw new Error(`unexpected fetch ${options.method || 'GET'} ${url}`);
  };
  const req = new Request('https://aimanjack.com/v1/coupons/AMJ25-ABCDEFGH', { method: 'PATCH', headers: { authorization: 'Bearer admin-token' } });
  const r = await onRequest({ request: req, env, params: { route: ['coupons', 'AMJ25-ABCDEFGH'] }, waitUntil() {} });
  assert.equal(r.status, 409);
  assert.equal((await r.json()).error, 'coupon_already_redeemed');
});
