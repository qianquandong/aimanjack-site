// Website quote opt-ins -> MailerLite. Independent of ROS and the worksheet/CRM funnel.
// Both the database and environment switch default OFF. This module never sends a campaign.
import { productionApiEnabled } from '../src/deployment-safety.mjs';

const API = 'https://connect.mailerlite.com/api';
const MAX_CALLS = 16, MAX_PAGES = 10, MAX_PER_TICK = 2;
const STATES = new Set(['active', 'unconfirmed', 'unsubscribed', 'bounced', 'junk']);
const SUPPRESSED = new Set(['unsubscribed', 'bounced', 'junk']);
const pathSegment = value => encodeURIComponent(value).replace(/[!'()*]/g, character => '%' + character.charCodeAt(0).toString(16).toUpperCase());
const idOk = value => typeof value === 'string' && /^[0-9]{1,30}$/.test(value);
const code = value => /^[a-z0-9_:.-]{1,96}$/.test(String(value)) ? String(value) : 'internal_error';
const json = (status, data) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
export const mailerliteEnabled = env => env.MAILERLITE_SYNC_ENABLED === 'true';

export function mailerliteConfig(env) {
  return {
    enabled: mailerliteEnabled(env),
    apiTokenConfigured: typeof env.MAILERLITE_API_TOKEN === 'string' && env.MAILERLITE_API_TOKEN.length >= 20,
    groupConfigured: idOk(env.MAILERLITE_QUOTE_GROUP_ID),
    processTokenConfigured: typeof env.MAILERLITE_PROCESS_TOKEN === 'string' && env.MAILERLITE_PROCESS_TOKEN.length >= 32,
    webhookSecretConfigured: typeof env.MAILERLITE_WEBHOOK_SECRET === 'string' && env.MAILERLITE_WEBHOOK_SECRET.length >= 8,
    identitySecretConfigured: typeof env.EMAIL_HASH_SECRET === 'string' && env.EMAIL_HASH_SECRET.length >= 32,
    doiAcknowledged: env.MAILERLITE_DOI_ACKNOWLEDGED === 'true',
  };
}

async function tokenMatches(secret, supplied) {
  if (typeof secret !== 'string' || secret.length < 32 || typeof supplied !== 'string' || supplied.length > 1024) return false;
  const enc = new TextEncoder(), text = enc.encode('mailerlite-quote-processor-v1');
  const key = await crypto.subtle.importKey('raw', enc.encode(`Bearer ${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const candidate = await crypto.subtle.importKey('raw', enc.encode(supplied), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', candidate, await crypto.subtle.sign('HMAC', key, text), text);
}

async function boundedJson(response) {
  const reader = response.body?.getReader();
  if (!reader) throw Error('provider_invalid_json');
  const chunks = []; let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 131072) { await reader.cancel(); throw Error('provider_body_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw Error('provider_invalid_json'); }
}

// Every URL is constructed here: provider response links and caller-supplied URLs are never followed.
export function mailerliteClient({ env, fetchImpl = (...args) => fetch(...args), maxCalls = MAX_CALLS }) {
  let calls = 0;
  async function request(path, { method = 'GET', body } = {}) {
    if (++calls > Math.min(MAX_CALLS, maxCalls)) throw Error('tick_api_budget');
    if (!/^\/(groups\?limit=100&page=[0-9]+|subscribers(?:\/[A-Za-z0-9%._~-]+(?:\/groups\/[0-9]+)?)?)$/.test(path)) throw Error('provider_path_invalid');
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetchImpl(API + path, { method, redirect: 'manual', signal: controller.signal,
        headers: { authorization: `Bearer ${env.MAILERLITE_API_TOKEN}`, accept: 'application/json', 'content-type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}) });
      if (!response.ok) {
        await response.body?.cancel();
        const error = Error(`provider_http_${response.status}`); error.status = response.status; throw error;
      }
      return { status: response.status, body: await boundedJson(response) };
    } catch (error) {
      if (/^provider_/.test(error.message)) throw error;
      throw Error(controller.signal.aborted ? 'provider_timeout' : 'provider_network');
    } finally { clearTimeout(timeout); }
  }
  async function verifyGroup() {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { body } = await request(`/groups?limit=100&page=${page}`);
      if (!Array.isArray(body?.data) || body.data.length > 100 || body.data.some(group => !idOk(group?.id))) throw Error('provider_invalid_groups');
      if (body.data.some(group => group.id === env.MAILERLITE_QUOTE_GROUP_ID)) return true;
      if (body.data.length < 100) return false;
    }
    throw Error('group_page_budget');
  }
  async function lookup(email) {
    let result;
    try { result = await request(`/subscribers/${pathSegment(email)}`); }
    catch (error) { if (error.status === 404) return null; throw error; }
    return subscriber(result.body, email);
  }
  function subscriber(body, email) {
    const data = body?.data;
    if (!idOk(data?.id) || typeof data.email !== 'string' || data.email.trim().toLowerCase() !== email || !STATES.has(data.status) || !Array.isArray(data.groups) || data.groups.some(group => !idOk(group?.id))) throw Error('provider_invalid_subscriber');
    return { id: data.id, status: data.status, suppression: data.forget_at ? 'forgotten' : data.deleted_at ? 'deleted' : null,
      inGroup: data.groups.some(group => group.id === env.MAILERLITE_QUOTE_GROUP_ID) };
  }
  async function mutate(context, existing) {
    if (!existing) {
      // The account's verified API double opt-in owns confirmation. Never set active/resubscribe/opted_in_at.
      const { status, body } = await request('/subscribers', { method: 'POST', body: {
        email: context.email, fields: { name: context.name }, groups: [env.MAILERLITE_QUOTE_GROUP_ID],
      } });
      if (![200, 201].includes(status)) throw Error('provider_unexpected_status');
      const value = subscriber(body, context.email);
      if (value.suppression || SUPPRESSED.has(value.status)) return { outcome: 'suppressed', reason: `provider_${value.suppression || value.status}`, subscriberId: value.id };
      if (value.status === 'active') throw Error('double_opt_in_unverified');
      if (!value.inGroup) throw Error('provider_membership_unconfirmed');
      return { outcome: 'delivered', reason: value.status === 'unconfirmed' ? 'pending_confirmation' : 'active', subscriberId: value.id };
    }
    // Adding to one group preserves all other groups and cannot deliberately change status.
    const { status, body } = await request(`/subscribers/${existing.id}/groups/${env.MAILERLITE_QUOTE_GROUP_ID}`, { method: 'POST' });
    if (![200, 201].includes(status) || body?.data?.id !== env.MAILERLITE_QUOTE_GROUP_ID) throw Error('provider_invalid_assignment');
    return { outcome: 'delivered', reason: existing.status === 'unconfirmed' ? 'pending_confirmation' : 'active', subscriberId: existing.id };
  }
  return { verifyGroup, lookup, mutate, get calls() { return calls; } };
}

export function mailerliteProcessor({ env, db, fetchImpl }) {
  const rpc = (name, body = {}) => db(`rpc/mailerlite_${name}`, { method: 'POST', schema: 'revenue', body });
  async function process() {
    const cfg = mailerliteConfig(env);
    if (!cfg.enabled) return { enabled: false, processed: [] };
    if (!cfg.apiTokenConfigured || !cfg.groupConfigured || !cfg.doiAcknowledged || !cfg.webhookSecretConfigured || !cfg.identitySecretConfigured) return { enabled: false, error: 'mailerlite_not_configured', processed: [] };
    const tick = await rpc('begin_tick');
    if (!tick?.enabled || !tick.token) return { enabled: !!tick?.enabled, busy: !!tick?.busy, processed: [] };
    const processed = [], client = mailerliteClient({ env, fetchImpl });
    try {
      if (!await client.verifyGroup()) return { enabled: true, error: 'group_not_found', processed: [] };
      const rows = await rpc('claim', { p_tick: tick.token, p_limit: MAX_PER_TICK });
      for (const row of rows) {
        let result;
        try {
          let context = await rpc('context', { p_id: row.id, p_token: row.lease_token, p_group: env.MAILERLITE_QUOTE_GROUP_ID });
          if (!context?.eligible) result = { outcome: 'cancelled', reason: code(context?.reason ?? 'consent_unavailable') };
          else if (['suppressed', 'deleted', 'forgotten'].includes(context.local_state)) result = { outcome: 'suppressed', reason: `local_${context.local_state}` };
          else {
            const existing = await client.lookup(context.email);
            if (existing && (existing.suppression || SUPPRESSED.has(existing.status))) result = { outcome: 'suppressed', reason: `provider_${existing.suppression || existing.status}`, subscriberId: existing.id };
            else if (existing?.inGroup) result = { outcome: 'delivered', reason: existing.status === 'unconfirmed' ? 'pending_confirmation' : 'active', subscriberId: existing.id };
            else if (context.local_state || row.mutation_started_at || context.uncertain_history || (!existing && context.creation_history)) {
              // A timeout/5xx may already have sent DOI. Lookup-only recovery never blindly repeats a POST.
              result = { outcome: 'uncertain', reason: existing ? 'membership_not_observed' : 'subscriber_not_observed' };
            } else {
              // Recheck consent after the provider read. The atomic reservation checks it again and spends daily quota.
              context = await rpc('context', { p_id: row.id, p_token: row.lease_token, p_group: env.MAILERLITE_QUOTE_GROUP_ID });
              if (!context?.eligible) result = { outcome: 'cancelled', reason: code(context?.reason ?? 'consent_unavailable') };
              else if (!await rpc('reserve', { p_id: row.id, p_token: row.lease_token, p_group: env.MAILERLITE_QUOTE_GROUP_ID, p_creating: !existing })) result = { outcome: 'retry', reason: 'daily_budget_or_identity_busy' };
              else {
                try { result = await client.mutate(context, existing); }
                catch (error) {
                  // Explicit 429 rejects the write; all ambiguous POST outcomes remain lookup-only.
                  result = error.status === 429 ? { outcome: 'retry_rejected', reason: 'provider_http_429' }
                    : [400, 401, 403, 404, 422].includes(error.status) ? { outcome: 'dead', reason: code(error.message) }
                    : { outcome: 'uncertain', reason: code(error.message) };
                }
              }
            }
          }
        } catch (error) { result = { outcome: 'retry', reason: code(error.message) }; }
        const saved = await rpc('finish', { p_id: row.id, p_token: row.lease_token, p_group: env.MAILERLITE_QUOTE_GROUP_ID,
          p_outcome: result.outcome, p_reason: result.reason, p_subscriber: result.subscriberId ?? null });
        processed.push({ id: row.id, outcome: result.outcome, code: result.reason, saved });
        // Database finish atomically pauses capture/processing on an unexpected active create result.
        if (result.reason === 'double_opt_in_unverified') return { enabled: false, error: 'double_opt_in_unverified', processed, apiCalls: client.calls, health: await rpc('health') };
      }
      return { enabled: true, processed, apiCalls: client.calls, health: await rpc('health') };
    } finally { await rpc('end_tick', { p_tick: tick.token }); }
  }
  return { process, health: () => rpc('health') };
}

export async function mailerliteRoute({ env, req, id, extra, db, fetchImpl }) {
  if (!productionApiEnabled(env, req)) return json(503, { error: 'preview_read_only' });
  if (!extra && id === 'webhook' && req.method === 'POST') return mailerliteWebhook({ env, req, db });
  if (extra || !((id === 'process' && req.method === 'POST') || (id === 'health' && req.method === 'GET'))) return json(404, { error: 'not_found' });
  // ADMIN_TOKEN is intentionally not accepted: only this narrowly scoped token can invoke the adapter.
  if (!await tokenMatches(env.MAILERLITE_PROCESS_TOKEN, req.headers.get('authorization'))) return json(401, { error: 'unauthorized' });
  const cfg = mailerliteConfig(env);
  if (!cfg.enabled) return json(200, { enabled: false, config: cfg, processed: [] });
  const processor = mailerliteProcessor({ env, db, fetchImpl });
  try {
    if (id === 'health') return json(200, { config: cfg, health: await processor.health(), notice: 'An unticked quote checkbox is not an unsubscribe instruction.' });
    const result = await processor.process();
    return json(result.error ? 503 : 200, result);
  } catch { return json(503, { error: 'mailerlite_processor_unavailable' }); }
}

async function boundedBytes(request, limit) {
  if (Number(request.headers.get('content-length') || 0) > limit) throw Error('webhook_too_large');
  const reader = request.body?.getReader(); if (!reader) throw Error('webhook_bad_body');
  const chunks = []; let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw Error('webhook_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}

async function hmac(secret, bytes) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Match documented payloads: event on the subscriber object, type+subscriber, and {events:[...],total:N} batches.
// Only permanent suppression signals are consumed. No callback can clear an existing tombstone.
export function mailerliteSuppressionEvents(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw Error('webhook_bad_shape');
  const batch = 'events' in payload;
  const entries = batch ? payload.events : [payload];
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > 100 || (batch && payload.total !== undefined && payload.total !== entries.length)) throw Error('webhook_bad_batch');
  const result = [];
  const eventReasons = { 'subscriber.unsubscribed': 'unsubscribed', 'subscriber.bounced': 'bounced', 'subscriber.spam_reported': 'junk', 'subscriber.deleted': 'deleted' };
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw Error('webhook_bad_event');
    const subscriber = entry.subscriber ?? entry, event = entry.type ?? entry.event;
    if (!subscriber || typeof subscriber !== 'object' || Array.isArray(subscriber)) throw Error('webhook_bad_subscriber');
    let reason = eventReasons[event] || (SUPPRESSED.has(subscriber.status) ? subscriber.status : null);
    if (subscriber.deleted_at) reason = 'deleted';
    if (subscriber.forget_at) reason = 'forgotten';
    if (!reason) continue; // Confirmations and activity never grant/regrant local consent.
    const email = typeof subscriber.email === 'string' ? subscriber.email.trim().toLowerCase() : '';
    if (!idOk(subscriber.id) || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('webhook_bad_subscriber');
    result.push({ email, subscriberId: subscriber.id, state: ['deleted', 'forgotten'].includes(reason) ? reason : 'suppressed', reason });
  }
  return result;
}

export async function mailerliteWebhook({ env, req, db }) {
  if (!productionApiEnabled(env, req)) return json(503, { error: 'preview_read_only' });
  const cfg = mailerliteConfig(env);
  if (!cfg.webhookSecretConfigured || !cfg.identitySecretConfigured) return json(503, { error: 'webhook_not_configured' });
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get('content-type') ?? '')) return json(415, { error: 'json_required' });
  const signature = req.headers.get('signature');
  if (!/^[0-9a-f]{64}$/i.test(signature ?? '')) return json(401, { error: 'invalid_signature' });
  let bytes;
  try { bytes = await boundedBytes(req, 262143); }
  catch (error) { return json(error.message === 'webhook_too_large' ? 413 : 400, { error: code(error.message) }); }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.MAILERLITE_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const candidate = Uint8Array.from(signature.match(/../g), byte => parseInt(byte, 16));
  if (!await crypto.subtle.verify('HMAC', key, candidate, bytes)) return json(401, { error: 'invalid_signature' });
  let entries;
  try { entries = mailerliteSuppressionEvents(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))); }
  catch { return json(400, { error: 'webhook_invalid_payload' }); }
  if (!entries.length) return json(200, { ok: true, outcome: 'ignored' });
  // Store only the existing keyed email identity, provider ID and a controlled reason; never the raw callback payload.
  const items = await Promise.all(entries.map(async entry => ({ identity_hash: await hmac(env.EMAIL_HASH_SECRET, new TextEncoder().encode('subject:' + entry.email)),
    subscriber_id: entry.subscriberId, state: entry.state, reason: entry.reason })));
  try {
    const result = await db('rpc/mailerlite_suppress', { method: 'POST', schema: 'revenue', body: { p_items: items, p_receipt_hash: signature.toLowerCase() } });
    if (typeof result?.duplicate !== 'boolean') throw Error('suppression_ack_invalid');
    return json(200, { ok: true, outcome: result?.duplicate ? 'duplicate' : 'accepted' });
  } catch { return json(503, { error: 'suppression_store_unavailable' }); }
}
