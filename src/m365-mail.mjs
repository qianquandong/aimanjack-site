// Microsoft 365 (Microsoft Graph) mail transport for booking and coupon email (GitHub qianquandong/revenue-os#2).
//
// Owner decision 2026-10-09: no Cloudflare Workers Paid ⇒ no Cloudflare Email Sending. Site email goes out through
// Jack's own Microsoft 365 mailbox, as jack@aimanjack.com. aimanjack.com is a GoDaddy-federated tenant
// (7b2782a2-fd4d-42e2-b5e5-97d3999d2f0f), so two ways are supported:
//
//   M365_AUTH=delegated (default, least privilege): an app registration (public client flows allowed) with the Graph
//     delegated permission Mail.Send. The owner signs in ONCE from /admin/bookings/ ("Connect Microsoft 365",
//     device-code sign-in on any device) and approves "Send mail as you". The site can only send as the mailbox that
//     signed in, and the connection is refused unless that mailbox is M365_SENDER. The refresh token is stored
//     AES-256-GCM-sealed (Pages secret M365_TOKEN_KEY) in booking.mail_tokens; the device code never leaves the server.
//   M365_AUTH=app: application permission Mail.Send + admin consent (client credentials, M365_CLIENT_SECRET). It can send
//     as ANY mailbox in the tenant unless an Exchange application access policy limits it. Fallback only.
//
// Result mapping (Graph sendMail has no per-recipient result, no message id and no idempotency key):
//   202 → 'queued' = accepted by Microsoft 365. NOT proof of inbox delivery; bounces come back as NDRs to the mailbox.
//   400 ErrorInvalidRecipients → 'bounced' (never retried) · 429/503 → 'failed' (retried, then dead)
//   500/502/504 or a network error after the request → 'uncertain' (it may have been accepted: never auto-resent)
//   the Workers runtime refusing the request before it left (subrequest limit) → 'failed' (retried; nothing was sent)
//   missing setup / not connected / sign-in expired or revoked → configuration gap (waits, alerts, never dies of it)
//
// Disconnect is authoritative: every send re-reads the connection row (generation number), so a disconnect stops all
// isolates on their next send, and a refresh racing a disconnect cannot write its rotated token back.
// Nothing here logs or returns tokens, codes or message contents.

export const GRAPH = 'https://graph.microsoft.com/v1.0';
export const LOGIN = 'https://login.microsoftonline.com';
export const M365_SENDER_DEFAULT = 'jack@aimanjack.com';
export const M365_DELEGATED_SCOPE = 'offline_access User.Read Mail.Send';
export const M365_DEVICE_LOGIN_URL = 'https://microsoft.com/devicelogin';
export const KEEPALIVE_DAYS = 7;                 // refresh at least weekly so an idle connection never hits the 90-day expiry

const short = (s, n = 240) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, n);
const nowIso = () => new Date().toISOString();
const tokenCache = new Map();                    // per isolate: cacheKey → { token, exp, gen }

export function m365Config(env) {
  return { auth: env.M365_AUTH || 'delegated', tenant: env.M365_TENANT_ID || null, clientId: env.M365_CLIENT_ID || null,
    secret: env.M365_CLIENT_SECRET || null, sender: env.M365_SENDER || M365_SENDER_DEFAULT, tokenKey: env.M365_TOKEN_KEY || null };
}
const cacheKey = (c) => `${c.auth}:${c.tenant}:${c.clientId}`;

/** Static configuration gap (null when the settings are complete). Connection state is checked separately. */
export function m365ConfigGap(env) {
  const c = m365Config(env);
  if (c.auth !== 'delegated' && c.auth !== 'app') return 'config_invalid:M365_AUTH';
  if (!c.tenant) return 'config_missing:M365_TENANT_ID';
  if (!c.clientId) return 'config_missing:M365_CLIENT_ID';
  if (c.auth === 'app' && !c.secret) return 'config_missing:M365_CLIENT_SECRET';
  if (c.auth === 'delegated') {
    if (!c.tokenKey) return 'config_missing:M365_TOKEN_KEY';
    try { if (b64bytes(c.tokenKey).length !== 32) return 'config_invalid:M365_TOKEN_KEY'; } catch { return 'config_invalid:M365_TOKEN_KEY'; }
  }
  return null;
}

// ── sealing (AES-256-GCM, random 96-bit IV, field-bound AAD so a sealed device code can never be read as a refresh token)
const b64bytes = (s) => Uint8Array.from(atob(String(s).trim()), (ch) => ch.charCodeAt(0));
const bytesB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); };
const aesKey = (b64) => crypto.subtle.importKey('raw', b64bytes(b64), 'AES-GCM', false, ['encrypt', 'decrypt']);
const aad = (field) => new TextEncoder().encode(`mail_tokens:m365:${field}`);
export async function seal(keyB64, field, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(field) }, await aesKey(keyB64), new TextEncoder().encode(text)));
  const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
  return 'v1.' + bytesB64(out);
}
export async function unseal(keyB64, field, sealed) {
  if (!String(sealed ?? '').startsWith('v1.')) throw new Error('unsealable');
  const buf = b64bytes(sealed.slice(3));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12), additionalData: aad(field) }, await aesKey(keyB64), buf.slice(12));
  return new TextDecoder().decode(pt);
}

const maskEmail = (a) => { if (!a) return null; const [l, d] = String(a).split('@'); return d ? `${l.slice(0, 1)}***${l.length > 1 ? l.slice(-1) : ''}@${d}` : '***'; };
const sameAddr = (a, b) => !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
const isTooManySubrequests = (e) => /too many subrequests/i.test(String(e?.message ?? ''));
const isMissingTable = (e) => ['42P01', 'PGRST205', 'PGRST106'].includes(e?.code) || /does not exist|could not find the table/i.test(String(e?.message ?? ''));

async function tokenRequest(c, params, fetchImpl) {
  // The client secret goes only with app (confidential) auth; a public client sending one fails with AADSTS700025.
  const body = new URLSearchParams({ client_id: c.clientId, ...(c.auth === 'app' ? { client_secret: c.secret } : {}), ...params });
  let r;
  try { r = await fetchImpl(`${LOGIN}/${c.tenant}/oauth2/v2.0/token`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: body.toString() }); }
  catch { return { ok: false, error: 'network_error' }; }
  const j = await r.json().catch(() => ({}));
  return r.ok && j.access_token ? { ok: true, ...j } : { ok: false, status: r.status, error: j.error || `http_${r.status}` };
}

const tokenRow = async (db) => (await db('mail_tokens?provider=eq.m365&select=*'))?.[0] ?? null;
const upsertRow = (db, fields) => db('mail_tokens?on_conflict=provider', { method: 'POST', body: { provider: 'm365', ...fields, updated_at: nowIso() },
  headers: { prefer: 'resolution=merge-duplicates,return=minimal' } });
/** PATCH only if the connection generation is unchanged (a disconnect/reconnect in between wins). */
const patchGen = (db, gen, fields, extra = '') => db(`mail_tokens?provider=eq.m365&generation=eq.${gen}${extra}`, { method: 'PATCH', body: { ...fields, updated_at: nowIso() },
  headers: { prefer: 'return=representation' } });

const RECONNECT_ERRORS = /invalid_grant|interaction_required|invalid_client|unauthorized_client|consent_required/;

/**
 * → { token } | { gap } (setup/connection problem: wait, alert) | { error, notSent } (transient: retry). Never throws.
 * opts.force: ignore the cached access token. opts.onReconnectRequired(code): called once when the connection breaks.
 */
export async function m365AccessToken(env, db, fetchImpl = (...a) => fetch(...a), opts = {}) {
  const gap = m365ConfigGap(env); if (gap) return { gap };
  const c = m365Config(env); const key = cacheKey(c);
  try {
    if (c.auth === 'app') {
      const hit = tokenCache.get(key); if (!opts.force && hit && hit.exp > Date.now()) return { token: hit.token };
      const t = await tokenRequest(c, { grant_type: 'client_credentials', scope: 'https://graph.microsoft.com/.default' }, fetchImpl);
      if (!t.ok) return RECONNECT_ERRORS.test(t.error) ? { gap: `m365_app_auth_failed:${t.error}` } : { error: `token_${t.error}` };
      tokenCache.set(key, { token: t.access_token, exp: Date.now() + Math.max(60, (Number(t.expires_in) || 3600) - 120) * 1000, gen: 0 });
      return { token: t.access_token };
    }
    let row;
    try { row = await tokenRow(db); } catch (e) { return isMissingTable(e) ? { gap: 'config_missing:mail_tokens_table' } : { error: short('token_store_' + (e?.code || 'error'), 60) }; }
    if (!row?.refresh_token_enc) return { gap: 'config_missing:M365_CONNECTION' };
    if (row.needs_reconnect) return { gap: `m365_reconnect_required:${row.last_error || 'unknown'}` };
    if (!sameAddr(row.account, c.sender)) return { gap: 'm365_connected_account_mismatch' };
    const gen = row.generation ?? 0;
    const hit = tokenCache.get(key);
    if (!opts.force && hit && hit.gen === gen && hit.exp > Date.now()) return { token: hit.token };
    let rt; try { rt = await unseal(c.tokenKey, 'refresh', row.refresh_token_enc); } catch { return { gap: 'm365_reconnect_required:unsealable' }; }
    const t = await tokenRequest(c, { grant_type: 'refresh_token', refresh_token: rt, scope: M365_DELEGATED_SCOPE }, fetchImpl);
    if (!t.ok) {
      if (!RECONNECT_ERRORS.test(t.error)) return { error: `token_${t.error}` };
      // Record it on the connection (the owner page shows it) and alert once (only the false→true transition alerts).
      const flipped = await patchGen(db, gen, { needs_reconnect: true, last_error: short(t.error, 60) }, '&needs_reconnect=is.false').catch(() => []);
      if (flipped?.length && opts.onReconnectRequired) { try { await opts.onReconnectRequired(t.error); } catch { /* best effort */ } }
      return { gap: `m365_reconnect_required:${t.error}` };
    }
    // Rotation, conditional on the generation: a disconnect that happened meanwhile is never undone.
    const stored = await patchGen(db, gen, { ...(t.refresh_token ? { refresh_token_enc: await seal(c.tokenKey, 'refresh', t.refresh_token) } : {}), last_refresh_at: nowIso(), last_error: null }).catch(() => null);
    if (Array.isArray(stored) && stored.length === 0) { tokenCache.delete(key); return { gap: 'config_missing:M365_CONNECTION' }; }   // disconnected mid-refresh
    tokenCache.set(key, { token: t.access_token, exp: Date.now() + Math.max(60, (Number(t.expires_in) || 3600) - 120) * 1000, gen });
    return { token: t.access_token };
  } catch (e) {
    if (isTooManySubrequests(e)) return { error: 'subrequest_limit_not_sent' };
    return { error: short('token_exception ' + (e?.name || 'Error'), 80) };
  }
}

/** Send one message (one recipient). Same result shape as the Cloudflare transport: {status, retry, error?, configGap?, provider?}. */
export async function m365Send(env, msg, { db, fetchImpl = (...a) => fetch(...a), onReconnectRequired } = {}) {
  const c = m365Config(env);
  const message = { subject: msg.subject, body: { contentType: 'Text', content: msg.text }, toRecipients: [{ emailAddress: { address: msg.to } }] };
  if (msg.reply_to && !sameAddr(msg.reply_to, c.sender)) message.replyTo = [{ emailAddress: { address: msg.reply_to } }];
  const url = c.auth === 'app' ? `${GRAPH}/users/${encodeURIComponent(c.sender)}/sendMail` : `${GRAPH}/me/sendMail`;
  for (let pass = 0; pass < 2; pass += 1) {
    const t = await m365AccessToken(env, db, fetchImpl, { force: pass > 0, onReconnectRequired });
    if (t.gap) return { status: 'failed', retry: true, configGap: true, error: t.gap };
    if (t.error) return { status: 'failed', retry: true, error: short(t.error) };
    let r;
    try { r = await fetchImpl(url, { method: 'POST', headers: { authorization: `Bearer ${t.token}`, 'content-type': 'application/json' }, body: JSON.stringify({ message, saveToSentItems: true }) }); }
    catch (e) {
      if (isTooManySubrequests(e)) return { status: 'failed', retry: true, error: 'subrequest_limit_not_sent' };   // refused before leaving: nothing sent
      return { status: 'uncertain', retry: false, error: short('network_error_after_request ' + (e?.name || 'Error')) };
    }
    if (r.status === 202) return { status: 'queued', retry: false, provider: { transport: 'm365', accepted: true } };
    const j = await r.json().catch(() => null); const code = j?.error?.code ?? '';
    const err = short(`http_${r.status}${code ? ' code_' + code : ''}`);
    if (r.status === 401 && pass === 0) { tokenCache.delete(cacheKey(c)); continue; }        // stale token: one immediate retry
    if (r.status === 400 && /InvalidRecipients/i.test(code)) return { status: 'bounced', retry: false, error: err };
    if (r.status === 401 || r.status === 403) return { status: 'failed', retry: true, configGap: true, error: short(`m365_not_permitted:${err}`) };
    if (r.status === 500 || r.status === 502 || r.status === 504) return { status: 'uncertain', retry: false, error: err };   // may have been accepted
    return { status: 'failed', retry: true, error: err };
  }
  return { status: 'failed', retry: true, error: 'unreachable' };
}

/** True when a send could be attempted right now (used to keep the coupon form honest). One read in delegated mode. */
export async function m365Ready(env, db) {
  if (m365ConfigGap(env)) return false;
  if (m365Config(env).auth === 'app') return true;
  try { const row = await tokenRow(db); return !!row?.refresh_token_enc && !row.needs_reconnect && sameAddr(row.account, m365Config(env).sender); } catch { return false; }
}

/** Refresh an idle delegated connection at least every KEEPALIVE_DAYS (refresh tokens expire after 90 idle days). */
export async function m365KeepAlive(env, db, fetchImpl = (...a) => fetch(...a), opts = {}) {
  if (m365ConfigGap(env) || m365Config(env).auth !== 'delegated') return 'skipped';
  let row; try { row = await tokenRow(db); } catch { return 'skipped'; }
  if (!row?.refresh_token_enc || row.needs_reconnect) return 'skipped';
  const last = Date.parse(row.last_refresh_at || row.connected_at || 0);
  if (Date.now() - last < KEEPALIVE_DAYS * 86400000) return 'fresh';
  const t = await m365AccessToken(env, db, fetchImpl, { ...opts, force: true });
  return t.token ? 'refreshed' : (t.gap || t.error);
}

// ── one-time owner connection (delegated): device-code sign-in started and finished from the owner page ───────────
export async function m365StartConnect(env, db, fetchImpl = (...a) => fetch(...a)) {
  const gap = m365ConfigGap(env); if (gap) return { ok: false, error: gap };
  const c = m365Config(env);
  if (c.auth !== 'delegated') return { ok: false, error: 'not_needed_for_app_auth' };
  let r;
  try { r = await fetchImpl(`${LOGIN}/${c.tenant}/oauth2/v2.0/devicecode`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: c.clientId, scope: M365_DELEGATED_SCOPE }).toString() }); }
  catch { return { ok: false, error: 'network_error' }; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.device_code) return { ok: false, error: short(j.error || `http_${r.status}`, 80) };
  try {
    await upsertRow(db, { pending_device_enc: await seal(c.tokenKey, 'device', j.device_code), pending_expires_at: new Date(Date.now() + (Number(j.expires_in) || 900) * 1000).toISOString() });
  } catch (e) { return { ok: false, error: isMissingTable(e) ? 'config_missing:mail_tokens_table' : 'token_store_error' }; }
  // The sign-in page is always Microsoft's fixed device-login URL (never a URL taken from a response).
  return { ok: true, user_code: String(j.user_code ?? '').slice(0, 32), verification_uri: M365_DEVICE_LOGIN_URL, expires_in: Number(j.expires_in) || 900, interval: Number(j.interval) || 5, sign_in_as: c.sender };
}

export async function m365PollConnect(env, db, fetchImpl = (...a) => fetch(...a)) {
  const gap = m365ConfigGap(env); if (gap) return { status: 'error', error: gap };
  const c = m365Config(env);
  const row = await tokenRow(db);
  if (!row?.pending_device_enc) return { status: row?.refresh_token_enc && !row.needs_reconnect ? 'connected' : 'none' };
  const clearPending = () => upsertRow(db, { pending_device_enc: null, pending_expires_at: null });
  if (row.pending_expires_at && row.pending_expires_at < nowIso()) { await clearPending(); return { status: 'expired' }; }
  let deviceCode; try { deviceCode = await unseal(c.tokenKey, 'device', row.pending_device_enc); } catch { await clearPending(); return { status: 'error', error: 'unsealable' }; }
  const t = await tokenRequest(c, { grant_type: 'urn:ietf:params:oauth:grant-type:device_code', device_code: deviceCode }, fetchImpl);
  if (!t.ok) {
    // Still waiting, or Microsoft/network briefly unavailable: keep the sign-in alive.
    if (['authorization_pending', 'slow_down', 'network_error', 'temporarily_unavailable'].includes(t.error) || (t.status ?? 0) >= 500) return { status: 'pending' };
    await clearPending();
    if (t.error === 'expired_token') return { status: 'expired' };
    if (/access_denied|authorization_declined/.test(t.error)) return { status: 'denied' };
    return { status: 'error', error: short(t.error, 80) };
  }
  // Only the configured sender mailbox may be connected (the site sends as whoever signed in).
  let mail = null, upn = null;
  try {
    const me = await fetchImpl(`${GRAPH}/me?$select=mail,userPrincipalName`, { headers: { authorization: `Bearer ${t.access_token}` } });
    const mj = await me.json().catch(() => ({})); mail = mj.mail || null; upn = mj.userPrincipalName || null;
  } catch { /* handled below */ }
  if (!mail && !upn) { await clearPending(); return { status: 'error', error: 'account_lookup_failed' }; }
  if (!sameAddr(mail, c.sender) && !sameAddr(upn, c.sender)) { await clearPending(); return { status: 'wrong_account', account: maskEmail(mail || upn), expected: c.sender }; }
  if (!t.refresh_token) { await clearPending(); return { status: 'error', error: 'no_refresh_token_offline_access_missing' }; }
  const gen = (row.generation ?? 0) + 1;
  await upsertRow(db, { refresh_token_enc: await seal(c.tokenKey, 'refresh', t.refresh_token), account: c.sender, generation: gen, needs_reconnect: false, last_error: null,
    connected_at: nowIso(), last_refresh_at: nowIso(), pending_device_enc: null, pending_expires_at: null });
  tokenCache.set(cacheKey(c), { token: t.access_token, exp: Date.now() + Math.max(60, (Number(t.expires_in) || 3600) - 120) * 1000, gen });
  return { status: 'connected', account: c.sender };
}

/** Stops sending on every isolate at its next send. Revoking consent (https://myapps.microsoft.com) also kills the token at Microsoft. */
export async function m365Disconnect(env, db) {
  const c = m365Config(env);
  const row = await tokenRow(db).catch(() => null);
  await upsertRow(db, { refresh_token_enc: null, account: null, connected_at: null, pending_device_enc: null, pending_expires_at: null,
    needs_reconnect: false, last_error: null, generation: (row?.generation ?? 0) + 1 });
  tokenCache.delete(cacheKey(c));
  return { status: 'disconnected', note: 'To also revoke it at Microsoft immediately: https://myapps.microsoft.com → the app → Revoke.' };
}

/** Owner-safe status for /v1/admin/email-config. */
export async function m365Status(env, db) {
  const c = m365Config(env); const gap = m365ConfigGap(env);
  const out = { auth: c.auth, sender: c.sender, tenant_id: c.tenant, client_id_present: !!c.clientId, setup_gap: gap };
  if (c.auth === 'app') return { ...out, connected: !gap, client_secret_present: !!c.secret };
  let row = null; let table = 'ok';
  try { row = await tokenRow(db); } catch (e) { table = isMissingTable(e) ? 'missing' : 'unavailable'; }
  return { ...out, mail_tokens_table: table, token_key_present: !!c.tokenKey,
    connected: !!row?.refresh_token_enc && !row.needs_reconnect && sameAddr(row.account, c.sender),
    needs_reconnect: !!row?.needs_reconnect, last_error: row?.last_error ?? null, connected_account: row?.account ?? null,
    connected_at: row?.connected_at ?? null, last_refresh_at: row?.last_refresh_at ?? null, connect_pending: !!row?.pending_device_enc };
}

export function _resetM365CacheForTests() { tokenCache.clear(); }
