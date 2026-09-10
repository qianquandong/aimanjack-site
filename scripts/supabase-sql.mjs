#!/usr/bin/env node
// Run SQL against the Supabase project through the Management API (no psql needed).
//   node scripts/supabase-sql.mjs db/schema.sql            file
//   node scripts/supabase-sql.mjs "select count(*) from booking.bookings"
//   node scripts/supabase-sql.mjs --expose booking         add a schema to PostgREST's exposed list
//   node scripts/supabase-sql.mjs --keys                   list API key names/types (never values)
// Credentials: SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF from $SB_ENV_FILE (default: the CRM's .env —
// booking lives in the same project, schema `booking`).
import { readFileSync, existsSync } from 'node:fs';
const envFile = process.env.SB_ENV_FILE || '/Users/joseesp/outreach-tool/.env';
const env = Object.fromEntries(readFileSync(envFile, 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim().replace(/^['"]|['"]$/g, '')]; }));
const api = `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}`;
const call = async (path, init = {}) => {
  const r = await fetch(api + path, { ...init, headers: { authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'content-type': 'application/json', ...init.headers } });
  const body = await r.text();
  if (!r.ok) { console.error(`HTTP ${r.status}`, body); process.exit(1); }
  return body ? JSON.parse(body) : null;
};
const [a, b] = process.argv.slice(2);
if (a === '--keys') {
  for (const k of await call('/api-keys?reveal=false')) console.log(`${k.type.padEnd(12)} ${k.name.padEnd(20)} ${k.prefix ?? ''}`);
} else if (a === '--expose') {
  const cfg = await call('/postgrest');
  const schemas = cfg.db_schema.split(',').map((s) => s.trim());
  if (!schemas.includes(b)) { schemas.push(b); await call('/postgrest', { method: 'PATCH', body: JSON.stringify({ db_schema: schemas.join(', ') }) }); }
  console.log('exposed schemas:', (await call('/postgrest')).db_schema);
} else {
  const query = existsSync(a) ? readFileSync(a, 'utf8') : a;
  console.log(JSON.stringify(await call('/database/query', { method: 'POST', body: JSON.stringify({ query }) }), null, 1));
}
