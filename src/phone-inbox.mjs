// Private-phone text relay (2026-10-28, Jack: "我都信息都是在我的私人手机上的，你想办法连上").
// Jack's customers text his personal iPhone, which no server can read (iMessage needs an always-on Mac). An iOS
// Shortcuts personal automation ("When I get a message" → "Get contents of URL") forwards each incoming text here, and
// we keep the recent ones in KV (binding PHONE_INBOX, one JSON key, last 300 messages / 30 days) so the owner page and
// the cloud mailbox sync can read them. Verification codes and short-code senders are dropped on arrival, never stored.
// Read-only: replies still go from Jack's phone.
//   POST /v1/phone/inbound {from, body}   Bearer = forward token (write-only; HMAC of ADMIN_TOKEN, shown on the owner page)
//   GET  /v1/admin/phone                  (admin or TEXTS_READ_TOKEN) recent messages, newest first
//   GET  /v1/admin/phone/setup            (admin) the forward URL + token to paste into the Shortcut
// Rotating ADMIN_TOKEN rotates the forward token too (paste the new one into the Shortcut).

import { textsReaderOk } from './texts.mjs';

const KEY = 'recent';
const KEEP = 300;
const MAX_AGE_MS = 30 * 864e5;
const DUP_MS = 120e3;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status, error) => json({ error }, status);

export async function forwardToken(env) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.ADMIN_TOKEN), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('phone-forward-v1')));
  return [...sig].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

// A sender that looks like a phone number becomes E.164; a contact name stays as the Shortcut gave it.
export function sender(raw) {
  const s = String(raw ?? '').trim().slice(0, 120);
  if (/[a-zÀ-￿]/i.test(s.replace(/^\+/, ''))) return s;
  const d = s.replace(/[^\d]/g, '');
  if (d.length === 10) return '+1' + d;
  if (d.length === 11 && d[0] === '1') return '+' + d;
  return d.length > 11 ? '+' + d : s;
}

// Why a message is not stored, or null to keep it. Codes and bank/app alerts come from short codes or carry a one-time code.
export function dropReason(from, body) {
  if (/^\d{3,6}$/.test(from)) return 'short_code';
  if (/\b\d{4,8}\b/.test(body) && /(code|verif|passcode|otp|one[- ]time|2fa|security|log ?in|验证码|校验码|动态码)/i.test(body)) return 'one_time_code';
  return null;
}

const recent = async (env) => { try { return JSON.parse((await env.PHONE_INBOX.get(KEY)) || '[]'); } catch { return []; } };

export async function phoneInbound({ env, req }) {
  if (!env.PHONE_INBOX || !env.ADMIN_TOKEN) return fail(503, 'phone_inbox_not_configured');
  if (req.method !== 'POST') return fail(405, 'method_not_allowed');
  if (req.headers.get('authorization') !== `Bearer ${await forwardToken(env)}`) return fail(401, 'unauthorized');
  const b = await req.json().catch(() => null);
  const from = sender(b?.from), body = String(b?.body ?? '').trim().slice(0, 4000);
  if (!from && !body) return fail(400, 'empty');
  const reason = dropReason(from, body);
  if (reason) return json({ ok: true, stored: false, reason });
  const now = Date.now();
  const rows = (await recent(env)).filter((m) => now - Date.parse(m.at) < MAX_AGE_MS);
  if (rows.some((m) => m.from === from && m.body === body && now - Date.parse(m.at) < DUP_MS)) return json({ ok: true, stored: false, reason: 'duplicate' });
  rows.unshift({ id: crypto.randomUUID(), from, body, at: new Date(now).toISOString() });
  await env.PHONE_INBOX.put(KEY, JSON.stringify(rows.slice(0, KEEP)));
  return json({ ok: true, stored: true });
}

export async function phoneAdmin({ env, req, url, extra, admin }) {
  if (!admin && !textsReaderOk(env, req)) return fail(401, 'unauthorized');
  if (req.method !== 'GET') return fail(405, 'method_not_allowed');
  if (!env.PHONE_INBOX) return fail(503, 'phone_inbox_not_configured');
  if (extra === 'setup') {
    if (!admin) return fail(401, 'unauthorized');
    return json({ url: `${url.origin}/v1/phone/inbound`, token: await forwardToken(env) });
  }
  if (extra) return fail(404, 'not_found');
  const now = Date.now();
  return json({ messages: (await recent(env)).filter((m) => now - Date.parse(m.at) < MAX_AGE_MS) });
}
