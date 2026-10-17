// Disposable PostgreSQL only. Does not read environment files or connect to any real provider.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { createHash, createHmac } from 'node:crypto';

export async function fixture(t) {
  const pg = new PGlite(); t.after(() => pg.close());
  await pg.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  for (const file of ['2026-10-08-revenue-intake.sql', '2026-10-16-mailerlite-quote-outbox.sql'])
    await pg.exec(await readFile(new URL('../db/migrations/' + file, import.meta.url), 'utf8'));
  const rows = async (sql, args = []) => (await pg.query(sql, args)).rows;
  const names = { begin_tick: [], end_tick: ['p_tick'], claim: ['p_tick', 'p_limit'], context: ['p_id', 'p_token', 'p_group'],
    reserve: ['p_id', 'p_token', 'p_group', 'p_creating'], finish: ['p_id', 'p_token', 'p_group', 'p_outcome', 'p_reason', 'p_subscriber'], health: [], suppress: ['p_items', 'p_receipt_hash'] };
  const db = async (path, { body = {}, schema } = {}) => {
    if (!path.startsWith('rpc/mailerlite_') || schema !== 'revenue') throw Error('unexpected_database_path');
    const name = path.slice('rpc/mailerlite_'.length);
    if (!(name in names)) throw Error('unexpected_rpc');
    const args = names[name].map(key => key === 'p_items' ? JSON.stringify(body[key]) : body[key] ?? null), params = args.map((_, i) => '$' + (i + 1)).join(',');
    const result = await rows(name === 'claim' ? `select * from revenue.mailerlite_claim(${params})` : `select revenue.mailerlite_${name}(${params}) as result`, args);
    return name === 'claim' ? result : result[0].result;
  };
  const env = { SITE_ENV: 'production', MAILERLITE_SYNC_ENABLED: 'true', MAILERLITE_DOI_ACKNOWLEDGED: 'true',
    MAILERLITE_API_TOKEN: 'mock-mailerlite-api-token-only', MAILERLITE_PROCESS_TOKEN: 'p'.repeat(40), MAILERLITE_QUOTE_GROUP_ID: '123',
    MAILERLITE_WEBHOOK_SECRET: 'mock-webhook-secret-only', EMAIL_HASH_SECRET: 'mock-existing-email-identity-key-only' };
  const intake = async (granted = true, email = 'dana@example.test', dedupe = email) => {
    const identity = createHmac('sha256', env.EMAIL_HASH_SECRET).update('subject:' + email).digest('hex');
    const p = { dedupe_key: createHash('sha256').update(dedupe).digest('hex'), form_version: 'intake-test', payload: { name: 'Dana Test', email, lang: 'en' },
      consent_request: true, consent_newsletter: granted, consent_notice_version: 'notice-test', subject_email_hash: identity };
    return (await rows('select revenue.record_intake($1::jsonb,$2::jsonb) as r', [JSON.stringify(p), JSON.stringify([{ consent_type: 'newsletter', granted }])]))[0].r;
  };
  const enable = () => pg.exec('update revenue.mailerlite_configuration set enabled=true');
  const due = () => pg.exec("update revenue.mailerlite_sync_events set next_attempt_at=clock_timestamp()-interval '1 minute'");
  const rpc = (name, body = {}) => db('rpc/mailerlite_' + name, { schema: 'revenue', body });
  return { pg, rows, env, db, rpc, intake, enable, due };
}

export function provider({ initial = null, failPost = null, groupPage = null } = {}) {
  const calls = [], subscribers = new Map();
  if (initial) subscribers.set(initial.email, structuredClone(initial));
  let failure = failPost;
  const fetchImpl = async (raw, options) => {
    const url = new URL(raw); calls.push({ path: url.pathname + url.search, method: options.method, body: options.body });
    if (url.origin !== 'https://connect.mailerlite.com' || options.redirect !== 'manual') throw Error('network_boundary_violation');
    if (url.pathname === '/api/groups') return Response.json({ data: groupPage ? groupPage(Number(url.searchParams.get('page'))) : [{ id: '123', name: 'Mock quotes' }] });
    if (url.pathname === '/api/subscribers' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      const data = { id: '42', email: body.email, status: 'unconfirmed', groups: body.groups.map(id => ({ id })) };
      if (failure === 'unknown_not_saved') throw Error('response lost before we can observe a result');
      if (failure === '429') { failure = null; return new Response('', { status: 429 }); }
      subscribers.set(body.email, data);
      if (failure === 'unknown_saved') throw Error('response lost after commit');
      return Response.json({ data }, { status: 201 });
    }
    const assign = /^\/api\/subscribers\/([0-9]+)\/groups\/([0-9]+)$/.exec(url.pathname);
    if (assign && options.method === 'POST') {
      const data = [...subscribers.values()].find(row => row.id === assign[1]);
      if (!data.groups.some(group => group.id === assign[2])) data.groups.push({ id: assign[2] });
      if (failure === 'unknown_saved') throw Error('assignment response lost');
      return Response.json({ data: { id: assign[2], name: 'Mock quotes' } });
    }
    if (url.pathname.startsWith('/api/subscribers/') && options.method === 'GET') {
      const email = decodeURIComponent(url.pathname.slice('/api/subscribers/'.length));
      return subscribers.has(email) ? Response.json({ data: subscribers.get(email) }) : new Response('', { status: 404 });
    }
    throw Error('unexpected_provider_call');
  };
  return { calls, subscribers, fetchImpl };
}
