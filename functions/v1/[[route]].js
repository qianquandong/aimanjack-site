import { rosEventsRoute, rosEnabled } from '../../src/ros-events.mjs';
// Booking API — Cloudflare Pages Function, served at https://aimanjack.com/v1/* (BOOKING-PLAN.md §1–2).
//   GET    /v1/availability?business=&service=[&from=YYYY-MM-DD&to=YYYY-MM-DD&staff=]
//   POST   /v1/bookings            { business, service, start_at, customer_name, customer_phone, customer_email?, note?, staff? }
//   GET    /v1/bookings/:id
//   PATCH  /v1/bookings/:id        { start_at }                      reschedule
//   DELETE /v1/bookings/:id                                          cancel
//   GET    /v1/bookings?business=[&phone=&status=&from=]  (Authorization: Bearer ADMIN_TOKEN) read-only list; phone= finds a caller's bookings
//   POST   /v1/intake              training quote request (JSON or form POST) → revenue.intake_receipts (see intake() below)
// Writes take an Idempotency-Key header and an X-Source header (web | voice | sms | admin; default web).
// Data: Supabase Postgres (schema `booking`, db/schema.sql) via PostgREST with the secret key — env.SUPABASE_URL + env.SB_SECRET_KEY.
// Email: after every write, a confirmation goes to customer_email (if given) and a notice to OWNER_EMAIL. Transport
// (MAIL_TRANSPORT): 'm365' = Jack's Microsoft 365 mailbox via Graph, sent as M365_SENDER (owner decision 2026-10-09,
// src/m365-mail.mjs); 'cloudflare' = Cloudflare Email Sending REST (needs Workers Paid; not used). Booking mail goes
// through a durable ledger (booking.notifications, src/booking-notify.mjs): per-recipient result, bounded retries, no
// double send, alerts. An email problem never fails or undoes a booking. Coupons use the same transport.
//   GET  /v1/admin/email-config                 (admin) effective sender settings, owner address masked
//   POST /v1/admin/m365/connect | poll | disconnect  (admin) one-time Microsoft 365 sign-in (device code) from the owner page
//   GET  /v1/bookings?business=…&with=notifications (admin) adds per-message email states (owner page)
//   GET  /v1/notifications?status=&booking=     (admin) ledger rows
//   POST /v1/notifications/process              (admin) mark stale sends uncertain, send everything due
//   POST /v1/notifications/requeue {ids:[…], include_bounced?}  (admin) owner-requested resend (bounced only if explicit)
//   GET|POST /v1/admin/texts                    (admin; GET also TEXTS_READ_TOKEN) owner text inbox on the Twilio numbers (src/texts.mjs)
// Instants are timestamptz; responses render them in the business tz with an offset (ISO 8601).
// Revenue OS delivery is captured transactionally by database triggers; src/ros-events.mjs drains that outbox.

import { createNotifier, composeMessages, describeMailConfig, alertFromEnv, bookingMailConfig, parseOwnerEmails, maskEmail, mailTransport, transportGap, BATCH } from '../../src/booking-notify.mjs';
import { m365Send, m365Status, m365StartConnect, m365PollConnect, m365Disconnect, m365Ready } from '../../src/m365-mail.mjs';
import { reserveMailSend, isMailQuotaError } from '../../src/mail-quota.mjs';
import { productionApiEnabled } from '../../src/deployment-safety.mjs';
import { mailerliteRoute } from '../mailerlite.mjs';
import { renderIntakeErrorPage } from '../../src/intake-error-page.mjs';
import { ownerPush, suggestedReply } from '../../src/owner-push.mjs';
import { textsRoute } from '../../src/texts.mjs';

const SOURCES = new Set(['web', 'voice', 'sms', 'admin']);
// 'admin' suppresses the owner's own notice, so it is honoured only with the admin token; anything else is 'web'.
const sourceOf = (env, req) => { const s = req.headers.get('x-source'); if (s === 'admin') return adminOk(env, req) ? 'admin' : 'web'; return SOURCES.has(s) ? s : 'web'; };
const errCode = (e) => String(e?.code ?? e?.message ?? e).split(':')[0].slice(0, 60);   // logs: status/code only, never ids or addresses
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status, error, message) => json({ error, message }, status);

// ── Supabase (PostgREST, schema `booking`) ──
const q = (o) => new URLSearchParams(o).toString();
// `schema` picks the PostgREST profile: 'booking' (default, every existing call) or 'revenue' (quote intake, 2026-10).
async function sb(env, path, { method = 'GET', body, headers, schema = 'booking' } = {}) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { method, body: body && JSON.stringify(body), headers: {
    apikey: env.SB_SECRET_KEY, authorization: `Bearer ${env.SB_SECRET_KEY}`, 'content-type': 'application/json',
    'accept-profile': schema, 'content-profile': schema, prefer: 'return=representation', ...headers } });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { if (r.ok) throw new Error(`supabase ${r.status} ${path}: non-JSON body`); }
  if (!r.ok) { const e = new Error(`supabase ${r.status} ${path}: ${text}`); e.code = data?.code; e.status = r.status; throw e; }
  return data;
}
const one = async (env, path) => (await sb(env, path + '&limit=1'))[0] ?? null;

// ── time (all math in UTC ms; the tz only matters when reading rules and rendering) ──
const pad = (n) => String(n).padStart(2, '0');
const partsFmt = {};
function tzOffset(ms, tz) {
  partsFmt[tz] ??= new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const p = Object.fromEntries(partsFmt[tz].formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
}
function localToUtc(date, hm, tz) {            // 'YYYY-MM-DD' + 'HH:MM' in tz → UTC ms (DST-safe: two passes)
  const guess = Date.parse(`${date}T${hm}:00Z`);
  let t = guess - tzOffset(guess, tz);
  const off2 = tzOffset(t, tz);
  if (guess - off2 !== t) t = guess - off2;
  return t;
}
function isoLocal(ms, tz) {                    // UTC ms → 'YYYY-MM-DDTHH:MM:SS-05:00'
  const off = tzOffset(ms, tz), d = new Date(ms + off), a = Math.abs(off) / 60000;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${off < 0 ? '-' : '+'}${pad(a / 60 | 0)}:${pad(a % 60)}`;
}
const localDate = (ms, tz) => isoLocal(ms, tz).slice(0, 10);
const weekdayOf = (date) => new Date(date + 'T12:00:00Z').getUTCDay();
const addDays = (date, n) => { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');

// ── data ──
async function loadBizSvc(env, bizId, svcId) {
  const biz = bizId && await one(env, 'businesses?' + q({ id: 'eq.' + bizId }));
  if (!biz) return { error: fail(404, 'business_not_found', 'Unknown business.') };
  const svc = svcId && await one(env, 'services?' + q({ business_id: 'eq.' + bizId, id: 'eq.' + svcId, active: 'is.true' }));
  if (!svc) return { error: fail(404, 'service_not_found', 'Unknown service.') };
  return { biz, svc };
}

// Open slots per day for [from, to] (business-local dates), honouring rules, blocks, existing
// bookings (+buffer, capacity), min lead and max days ahead. excludeId: the booking being moved.
async function openSlots(env, biz, svc, { from, to, staffId, excludeId, now = Date.now() }) {
  const tz = biz.tz, today = localDate(now, tz), last = addDays(today, biz.max_days_ahead);
  from = isDate(from) && from > today ? from : today;
  to = isDate(to) && to < last ? to : last;
  if (to > addDays(from, 31)) to = addDays(from, 31);
  const lo = new Date(localToUtc(from, '00:00', tz) - 864e5).toISOString(), hi = new Date(localToUtc(addDays(to, 1), '00:00', tz) + 864e5).toISOString();
  const [staff, rules, blocks, booked] = await Promise.all([
    sb(env, 'staff?' + q({ business_id: 'eq.' + biz.id, active: 'is.true', select: 'id,name', ...(staffId ? { id: 'eq.' + staffId } : {}) })),
    sb(env, 'availability_rules?' + q({ business_id: 'eq.' + biz.id, select: 'staff_id,weekday,start_hm,end_hm' })),
    sb(env, 'blocks?' + q({ business_id: 'eq.' + biz.id, end_at: 'gt.' + lo, start_at: 'lt.' + hi, select: 'staff_id,start_at,end_at' })),
    sb(env, 'bookings?' + q({ business_id: 'eq.' + biz.id, status: 'eq.confirmed', end_at: 'gt.' + lo, start_at: 'lt.' + hi, select: 'id,staff_id,start_at,end_at' })),
  ]);
  const bookedRows = booked.filter((b) => b.id !== excludeId);
  const len = svc.duration_min * 60000, buf = svc.buffer_min * 60000, earliest = now + biz.min_lead_min * 60000;
  const hits = (rows, sid, s, e) => rows.filter((r) => (r.staff_id == null || r.staff_id === sid) && Date.parse(r.end_at) > s && Date.parse(r.start_at) < e).length;
  const days = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const wd = weekdayOf(d), slots = [];
    for (const st of staff) for (const r of rules) {
      if (r.weekday !== wd || (r.staff_id != null && r.staff_id !== st.id)) continue;
      const rs = localToUtc(d, r.start_hm, tz), re = localToUtc(d, r.end_hm, tz);
      for (let s = rs; s + len <= re; s += len) {
        const e = s + len;
        if (s < earliest || hits(blocks, st.id, s, e) || hits(bookedRows, st.id, s - buf, e + buf) >= svc.capacity) continue;
        slots.push({ start_at: isoLocal(s, tz), end_at: isoLocal(e, tz), staff_id: st.id, staff_name: st.name, _ms: s });
      }
    }
    slots.sort((a, b) => a._ms - b._ms);
    if (slots.length) days.push({ date: d, slots });
  }
  return { from, to, days };
}

// Does `startAt` name an open slot? Returns the slot (with staff) or null.
async function findSlot(env, biz, svc, startAt, opts) {
  const ms = Date.parse(startAt || '');
  if (Number.isNaN(ms)) return null;
  const date = localDate(ms, biz.tz);
  const { days } = await openSlots(env, biz, svc, { ...opts, from: date, to: date });
  return days[0]?.slots.find((s) => s._ms === ms) ?? null;
}

const getBooking = (env, id) => one(env, 'bookings_full?' + q({ id: 'eq.' + id }));
const byIdem = (env, biz, key) => one(env, 'bookings_full?' + q({ business_id: 'eq.' + biz, idempotency_key: 'eq.' + key }));

function view(b, origin) {
  const start = Date.parse(b.start_at), until = start - b.cancel_window_hours * 3600e3;
  return {
    id: b.id, business: b.business_id, business_name: b.business_name, service: b.service_id, service_name: b.service_name,
    staff: b.staff_id, staff_name: b.staff_name, start_at: isoLocal(start, b.tz), end_at: isoLocal(Date.parse(b.end_at), b.tz), tz: b.tz,
    customer_name: b.customer_name, customer_phone: b.customer_phone, customer_email: b.customer_email, note: b.note,
    status: b.status, source: b.source, created_at: b.created_at, updated_at: b.updated_at,
    can_change_until: isoLocal(until, b.tz), changeable: b.status === 'confirmed' && Date.now() < until,
    manage_url: `${origin}/book/?id=${b.id}`,
  };
}

const logEvent = async (env, b, type, source, payload) =>
  (await sb(env, 'events', { method: 'POST', body: { business_id: b.business_id, booking_id: b.id, type, source, payload }, headers: { prefer: 'return=representation' } }))?.[0]?.id ?? null;

// ── email (Cloudflare Email Sending, REST) ──
const whenFmt = {};
const fmtWhen = (b) => (whenFmt[b.tz] ??= new Intl.DateTimeFormat('en-US', { timeZone: b.tz, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })).format(new Date(b.start_at));
const prettyPhone = (p) => { const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(p || ''); return m ? `(${m[1]}) ${m[2]}-${m[3]}` : p; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function sendMail(env, { to, subject, text, reply_to }) {
  if (mailTransport(env) === 'm365') {
    // Owner decision 2026-10-09: all site mail goes out through the Microsoft 365 mailbox (From = M365_SENDER).
    const res = await m365Send(env, { to, subject, text, reply_to }, { db: (p, o) => sb(env, p, o) });
    if (res.status !== 'queued') throw Object.assign(new Error(`email m365 ${res.status}: ${res.error ?? ''}`), { code: res.error });
    return;
  }
  const quota = await reserveMailSend(env, (p, o) => sb(env, p, o), env.EMAIL_FROM);
  if (!quota.ok) throw Object.assign(new Error(quota.error), { code: quota.error });
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
    method: 'POST', headers: { authorization: `Bearer ${env.CF_EMAIL_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ to, from: { address: env.EMAIL_FROM, name: 'AI Man Jack' }, reply_to, subject, text, html: `<pre style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap;margin:0">${esc(text)}</pre>` }),
  });
  const responseText = await r.text();
  let result = null;
  try { result = responseText ? JSON.parse(responseText) : null; } catch {}
  if (!r.ok || result?.success === false) throw new Error(`email ${r.status}: ${responseText.slice(0, 300)}`);
}

// ── $25 coupon (one per normalized email; one manual redemption) ──
const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
const couponCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', bytes = crypto.getRandomValues(new Uint8Array(8));
  return 'AMJ25-' + [...bytes].map((n) => chars[n % chars.length]).join('');
};
const couponByEmail = (env, email) => one(env, 'coupons?' + q({ email_normalized: 'eq.' + email, select: '*' }));
const couponPatch = (env, code, body) => sb(env, 'coupons?' + q({ code: 'eq.' + code }), { method: 'PATCH', body: { ...body, updated_at: new Date().toISOString() }, headers: { prefer: 'return=minimal' } });
const acquireFailedCoupon = async (env, coupon) => (await sb(env, 'coupons?' + q({ code: 'eq.' + coupon.code, issuance_status: 'eq.failed' }), {
  method: 'PATCH', body: { issuance_status: 'pending', updated_at: new Date().toISOString() }, headers: { prefer: 'return=representation' },
}))[0] ?? null;
const adminOk = (env, req) => env.ADMIN_TOKEN && req.headers.get('authorization') === `Bearer ${env.ADMIN_TOKEN}`;
// Dedicated, least-privilege scheduler credential: can ONLY process due notifications, never list bookings,
// requeue arbitrary messages, connect M365, or access any other admin endpoint.
const notificationProcessorOk = (env, req) => typeof env.NOTIFICATION_PROCESS_TOKEN === 'string' &&
  env.NOTIFICATION_PROCESS_TOKEN.length >= 32 &&
  req.headers.get('authorization') === `Bearer ${env.NOTIFICATION_PROCESS_TOKEN}`;
const sha256 = async (value) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const hmacHex = async (secret, message) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)))].map((x) => x.toString(16).padStart(2, '0')).join('');
};
// Keyed hashes for anything derived from an email or IP (lifecycle/privacy review 2026-10-08: no unsalted email or IP hash).
//   emailHmac: HMAC-SHA256(EMAIL_HASH_SECRET, `${purpose}:${email}`), or null when the secret is unset (never a bare sha256).
//   ipHmac:    HMAC-SHA256(IP_HASH_SALT, `${purpose}:${ip}`), or null when the salt is unset.
//   rateKey:   rate-limit window keys only (rows expire within a day). Keyed with EMAIL_HASH_SECRET, else the service
//              secret SB_SECRET_KEY (always present when the database is reachable) so limiting still works unconfigured.
const emailHmac = (env, purpose, email) => (env.EMAIL_HASH_SECRET ? hmacHex(env.EMAIL_HASH_SECRET, `${purpose}:${email}`) : null);
const ipHmac = (env, purpose, ip) => (env.IP_HASH_SALT && ip ? hmacHex(env.IP_HASH_SALT, `${purpose}:${ip}`) : null);
const rateKey = async (env, key) => {
  const secret = env.EMAIL_HASH_SECRET || env.SB_SECRET_KEY;
  if (!secret) throw Object.assign(new Error('no rate-limit key'), { code: 'rate_key_unavailable' });   // callers fail closed
  return hmacHex(secret, `rate:${key}`);
};

async function couponRateLimit(env, req, normalizedEmail) {
  const ip = clean(req.headers.get('cf-connecting-ip'), 64);
  if (!ip) return fail(503, 'rate_limit_unavailable', 'Coupon requests are temporarily unavailable.');
  try {
    const ipAllowed = await sb(env, 'rpc/take_coupon_rate_limit', { method: 'POST', body: { p_key_hash: await rateKey(env, `coupon-ip:${ip}`), p_limit: 5, p_window_seconds: 60 } });
    if (ipAllowed !== true) return fail(429, 'rate_limited', 'Too many coupon requests. Try again in a minute.');
    const emailAllowed = await sb(env, 'rpc/take_coupon_rate_limit', { method: 'POST', body: { p_key_hash: await rateKey(env, `coupon-email:${normalizedEmail}`), p_limit: 5, p_window_seconds: 60 } });
    if (emailAllowed !== true) return fail(429, 'rate_limited', 'Too many coupon requests. Try again in a minute.');
  } catch (e) {
    console.error('coupon rate limiter', e);
    return fail(503, 'rate_limit_unavailable', 'Coupon requests are temporarily unavailable.');
  }
  return null;
}

async function claimCoupon(env, req, ctx) {
  const origin = req.headers.get('origin');
  const allowed = env.SITE_ORIGIN || 'https://aimanjack.com';
  if (!origin || (origin !== allowed && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) return fail(403, 'origin_not_allowed', 'Use the coupon form on aimanjack.com.');
  const body = await req.json().catch(() => null);
  if (!body) return fail(400, 'bad_json', 'Body must be JSON.');
  if (clean(body.company_url, 200)) return json({ status: 'accepted' }, 201); // honeypot: do not send
  const email = clean(body.email, 254), normalized = email.toLowerCase();
  if (!emailOk(normalized)) return fail(400, 'email_invalid', 'Enter a valid email address.');
  const limited = await couponRateLimit(env, req, normalized);
  if (limited) return limited;
  if (mailTransport(env) === 'm365' ? !(await m365Ready(env, (p, o) => sb(env, p, o))) : (!env.CF_EMAIL_TOKEN || !env.EMAIL_FROM)) return fail(503, 'email_unavailable', 'Coupon email is temporarily unavailable.');

  let coupon = await couponByEmail(env, normalized);
  if (coupon) {
    if (coupon.issuance_status !== 'failed') return fail(409, 'already_claimed', 'A coupon has already been issued to this email.');
    coupon = await acquireFailedCoupon(env, coupon);
    if (!coupon) return fail(409, 'already_claimed', 'A coupon request is already in progress for this email.');
  }
  if (!coupon) {
    const row = { code: couponCode(), email, email_normalized: normalized, amount_usd: 25, issuance_status: 'pending', delivery_attempts: 0 };
    try { coupon = (await sb(env, 'coupons', { method: 'POST', body: row }))[0] || row; }
    catch (e) {
      if (e.code !== '23505') throw e;
      coupon = await couponByEmail(env, normalized);
      if (coupon?.issuance_status !== 'failed') return fail(409, 'already_claimed', 'A coupon has already been issued to this email.');
      coupon = await acquireFailedCoupon(env, coupon);
      if (!coupon) return fail(409, 'already_claimed', 'A coupon request is already in progress for this email.');
    }
  }

  const text = `Your $25 coupon for any AI Man Jack service\n\nCoupon code: ${coupon.code}\n\nUse this coupon once on any AI Man Jack service. No minimum spend, expiration or new-customer restriction. Reply to this email when you are ready to use it.\n\nJack\nAI Man Jack`;
  try {
    await sendMail(env, { to: email, subject: `Your $25 AI Man Jack coupon: ${coupon.code}`, text, reply_to: parseOwnerEmails(env.OWNER_EMAIL).list[0] || env.BOOKING_REPLY_TO });
  } catch (e) {
    const quotaBlocked = isMailQuotaError(e.code);
    await couponPatch(env, coupon.code, { issuance_status: 'failed', delivery_attempts: (coupon.delivery_attempts || 0) + (quotaBlocked ? 0 : 1), last_error: String(e.message || e).slice(0, 240) }).catch((dbError) => console.error('coupon failure persistence', dbError.message));
    if (quotaBlocked) return fail(503, 'email_unavailable', 'Coupon email is temporarily unavailable. Please try again later.');
    return fail(502, 'email_failed', 'The coupon email was not accepted by the email provider.');
  }
  await couponPatch(env, coupon.code, { issuance_status: 'sent', delivery_attempts: (coupon.delivery_attempts || 0) + 1, delivered_at: new Date().toISOString(), last_error: null }).catch((e) => console.error('coupon sent persistence', e.message));
  // OWNER_EMAIL may list several inboxes (comma-separated); each gets its own notice (the provider call takes one address).
  const owners = parseOwnerEmails(env.OWNER_EMAIL).list;
  if (owners.length && ctx.waitUntil) ctx.waitUntil(Promise.allSettled(owners.map((to) => sendMail(env, { to, subject: `[coupon] ${coupon.code} issued`, text: `${coupon.code} issued to ${email}. Manual redemption is still required.`, reply_to: email })))
    .then((rs) => rs.forEach((r) => r.status === 'rejected' && console.error('coupon owner email', r.reason?.message))));
  return json({ status: 'accepted' }, 201);
}

async function listCoupons(env, req, url) {
  if (!adminOk(env, req)) return fail(401, 'unauthorized', 'Bearer token required.');
  const status = url.searchParams.get('status');
  const rows = await sb(env, 'coupons?' + q({ ...(status ? { issuance_status: 'eq.' + status } : {}), order: 'created_at.desc', limit: '500' }));
  return json({ count: rows.length, coupons: rows });
}

async function redeemCoupon(env, req, code) {
  if (!adminOk(env, req)) return fail(401, 'unauthorized', 'Bearer token required.');
  const coupon = await one(env, 'coupons?' + q({ code: 'eq.' + code, select: '*' }));
  if (!coupon) return fail(404, 'coupon_not_found', 'No such coupon.');
  if (coupon.issuance_status !== 'sent') return fail(409, 'coupon_not_issued', 'This coupon was not sent successfully.');
  if (coupon.redeemed_at) return fail(409, 'coupon_already_redeemed', 'This coupon has already been redeemed.');
  const redeemed_at = new Date().toISOString();
  const updated = await sb(env, 'coupons?' + q({ code: 'eq.' + code, redeemed_at: 'is.null' }), {
    method: 'PATCH', body: { redeemed_at, updated_at: redeemed_at }, headers: { prefer: 'return=representation' },
  });
  if (!updated.length) return fail(409, 'coupon_already_redeemed', 'This coupon has already been redeemed.');
  return json({ code, redeemed_at });
}

// ── Training quote intake (Revenue OS v6, W-002) ──
// POST /v1/intake — JSON from the inline script on /contact/quote/, or a plain form POST without JS (answered with
// 303 → /contact/quote/#received or #not-sent, which the page shows with :target).
// Order: origin allowlist → honeypot / fill-time (silent drop) → consent → field validation → fail-closed rate limit →
// revenue.record_intake RPC (one receipt per dedupe_key per (lower(email), company_domain, UTC day) + append-only consent ledger).
// Hashes (see emailHmac / ipHmac): subject_email_hash and ip_hash are keyed HMACs or null — never unsalted. dedupe_key is an
// HMAC with EMAIL_HASH_SECRET; only when that secret is unset does it fall back to the day-scoped sha256, which is guessable
// by someone who already knows email + domain + day, so it is kept only in the receipt row (stripped from the ROS event, never
// logged, erased with the receipt). Missing secrets log a code-only warning.
// Then: owner notice via the configured transport. Revenue OS delivery is captured by the same DB transaction,
// and drained in a separate authenticated request so mailbox work and sync retries do not share a request budget.
// PII rule: responses carry only ok / receipt_id / error codes / field NAMES; console output carries only codes and statuses.
// Option values must match the <select>s rendered by src/pages/contact.mjs (tests/intake-api.test.mjs submits every one).
const INTAKE_ENUMS = {
  industry: ['professional_services', 'manufacturing', 'distribution', 'construction', 'healthcare', 'finance', 'real_estate', 'retail', 'technology', 'nonprofit_education', 'public_sector', 'other'],
  headcount: ['1-19', '20-49', '50-99', '100-249', '250-999', '1000+'],
  format: ['workshop_90', 'onsite_day', 'four_session', 'not_sure'],
  location: ['remote', 'dfw_onsite', 'other_texas'],
  timing: ['within_month', 'one_to_three', 'three_plus', 'exploring'],
  source: ['search', 'ai_assistant', 'linkedin', 'referral', 'event', 'social_other', 'other'],
};
const INTAKE_CONSENT_NOTICE_VERSION = 'privacy-2026-10-17-mailerlite';   // keep equal to CONSENT_NOTICE_VERSION in src/config.mjs (tested)
const INTAKE_MIN_FILL_MS = 3000;
const yes = (v) => v === true || v === 'yes' || v === 'on' || v === 'true';
const errInfo = (e) => `${e?.status ?? ''} ${e?.code ?? e?.name ?? 'error'}`.trim();   // never the message: it may quote a row

const hostOf = (raw) => {
  if (!raw) return '';
  try {
    const h = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.toLowerCase().replace(/^www\./, '');
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(h) ? h : null;
  } catch { return null; }
};

async function readIntakeBody(req) {
  const type = (req.headers.get('content-type') || '').toLowerCase();
  if (type.includes('application/json')) return { form: false, body: await req.json().catch(() => null) };
  if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
    const fd = await req.formData().catch(() => null);
    return { form: true, body: fd ? Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === 'string')) : null };
  }
  return { form: false, body: null };
}

// Returns { errors: [field names], v: normalized values }. Lengths match the maxlength attributes on the form.
function validateIntake(b) {
  const errors = [], v = {};
  const str = (k) => (typeof b[k] === 'string' ? b[k].trim() : typeof b[k] === 'number' ? String(b[k]) : '');
  const text = (k, max, required) => { const s = str(k); if (s.length > max || (required && !s)) errors.push(k); return s.slice(0, max); };
  const pick = (k, required) => { const s = str(k); if (s ? !INTAKE_ENUMS[k].includes(s) : required) errors.push(k); return INTAKE_ENUMS[k].includes(s) ? s : null; };
  v.name = text('name', 100, true);
  v.email = str('email').toLowerCase();
  if (!emailOk(v.email)) errors.push('email');
  v.company = text('company', 120, true);
  const site = text('company_website', 200, false), host = hostOf(site);
  if (host === null) errors.push('company_website');
  v.company_website = host || '';
  v.industry = pick('industry', true); v.headcount = pick('headcount', true); v.format = pick('format', true); v.location = pick('location', true);
  const n = Number(str('attendees'));
  if (!Number.isInteger(n) || n < 1 || n > 500) errors.push('attendees');
  v.attendees = Number.isInteger(n) ? n : null;
  v.location_city = text('location_city', 80, v.location === 'other_texas');
  v.workflows = text('workflows', 2000, true);
  v.tools = text('tools', 300, false);
  v.timing = pick('timing', true);
  v.source = pick('source', false);
  v.source_detail = text('source_detail', 120, false);
  v.lang = str('lang') === 'zh' ? 'zh' : 'en';
  const fv = str('form_version');
  v.form_version = /^intake-\d{4}-\d{2}-\d{2}$/.test(fv) ? fv : 'unknown';
  // First-touch attribution from sessionStorage (hidden ft_* fields). Self-reported "how did you hear" is stored separately.
  v.utm = firstTouchOf(b);
  return { errors: [...new Set(errors)], v };
}

// Quick quote (2026-10-17): the short "Get an easy quote" form on the tool pages (src/quick-quote.mjs). Only name, email and
// the request consent are required; people, budget (free text, so no price ranges are printed on our pages) and message are
// optional. `page` must be one of our training paths: the no-JS 303 returns there. Same store, consent ledger and rate limit.
// Tool pages send the tool; department pages (2026-10-18) send the department.
const QUICK_TOOLS = ['copilot', 'chatgpt', 'claude', 'grok', 'sales', 'marketing', 'operations', 'leadership', 'nonprofits', 'general'];
const QUICK_PAGE = /^\/(zh\/)?(ai-training\/([a-z0-9-]+\/)?)?$/;   // also the home pages, which carry the quick form since 2026-10-17
function validateQuickIntake(b) {
  const errors = [], v = { kind: 'quick' };
  const str = (k) => (typeof b[k] === 'string' ? b[k].trim() : typeof b[k] === 'number' ? String(b[k]) : '');
  const text = (k, max, required) => { const s = str(k); if (s.length > max || (required && !s)) errors.push(k); return s.slice(0, max); };
  v.name = text('name', 100, true);
  v.email = str('email').toLowerCase();
  if (!emailOk(v.email)) errors.push('email');
  const a = str('attendees'), n = Number(a);
  if (a && (!Number.isInteger(n) || n < 1 || n > 500)) errors.push('attendees');
  v.attendees = a && Number.isInteger(n) ? n : null;
  v.budget = text('budget', 100, false);
  v.workflows = text('workflows', 2000, false);
  v.tool = QUICK_TOOLS.includes(str('tool')) ? str('tool') : 'general';
  v.page = QUICK_PAGE.test(str('page')) ? str('page') : null;
  v.lang = str('lang') === 'zh' ? 'zh' : 'en';
  const fv = str('form_version');
  v.form_version = /^intake-\d{4}-\d{2}-\d{2}$/.test(fv) ? fv : 'unknown';
  v.utm = firstTouchOf(b);
  return { errors: [...new Set(errors)], v };
}

// First-touch attribution from ft_* fields (see src/layout.mjs). Campaign tags, referring host, landing path, first-seen time. No PII.
function firstTouchOf(b) {
  const utm = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) { const s = clean(b[`ft_${k}`], 120); if (s) utm[k] = s; }
  const ref = hostOf(clean(b.ft_ref, 120)); if (ref) utm.referrer_host = ref;
  const landing = clean(b.ft_landing, 200); if (landing.startsWith('/')) utm.landing_path = landing;
  const ts = Number(b.ft_ts); if (Number.isFinite(ts) && ts > 0) utm.first_touch_at = new Date(ts).toISOString();
  return utm;
}

async function intakeRateLimit(env, req, email) {
  const ip = clean(req.headers.get('cf-connecting-ip'), 64);
  if (!ip) return 'unavailable';
  try {
    for (const [key, limit] of [[`intake-ip:${ip}`, 10], [`intake-email:${email}`, 5]]) {
      const allowed = await sb(env, 'rpc/take_intake_rate_limit', { method: 'POST', schema: 'revenue', body: { p_key_hash: await rateKey(env, key), p_limit: limit, p_window_seconds: 600 } });
      if (allowed !== true) return 'limited';
    }
  } catch (e) {
    console.error('intake rate limiter unavailable', errInfo(e));
    return 'unavailable';
  }
  return null;
}

function intakeOwnerText(v, receiptId) {
  const label = (k, x) => `${k}: ${x ?? ''}`;
  if (v.kind === 'quick') return [`New quick quote request (${receiptId})`, '', label('Name', v.name), label('Email', v.email), label('Tool page', v.tool),
    label('People', v.attendees), label('Approximate budget', v.budget), label('Page', v.page), label('Newsletter opt-in', v.consent_newsletter ? 'yes' : 'no'), '', 'Message:', v.workflows,
    '', 'This is a quote request, not a booked meeting. Reply to the sender directly.',
    '', '--- Suggested reply (hit Reply, paste, edit if needed) ---', suggestedReply(v, { quick: v.kind === 'quick' })].join('\n');
  return [`New training quote request (${receiptId})`, '', label('Name', v.name), label('Email', v.email), label('Company', v.company), label('Website', v.company_website),
    label('Industry', v.industry), label('Company size', v.headcount), label('Attendees', v.attendees), label('Format', v.format),
    label('Location', v.location + (v.location_city ? ` (${v.location_city})` : '')), label('Timing', v.timing), label('Tools', v.tools),
    label('Heard about us', [v.source, v.source_detail].filter(Boolean).join(' — ')), label('Newsletter opt-in', v.consent_newsletter ? 'yes' : 'no'), '', 'Workflows:', v.workflows,
    '', 'This is a quote request, not a booked meeting. Reply to the sender directly.',
    '', '--- Suggested reply (hit Reply, paste, edit if needed) ---', suggestedReply(v, { quick: v.kind === 'quick' })].join('\n');
}

// 2026-10-17 (Jack): every new quote request also becomes a lead + a task for Grok's Inbox Manager in the 行云 CRM, which
// is how Jack hears about it. Signed with CRM_INTAKE_SECRET: X-Intake-Signature = v1=HMAC-SHA256(secret, `intake.v1.${ts}.${body}`).
// Text fields are always strings (the CRM schema rejects null). Supabase stays the record; a failed forward is logged (no PII) and never fails the visitor's request.
const CRM_INTAKE_URL = 'https://crm.aimanjack.com/api/webhooks/website-quote';
async function crmForward(env, payload) {
  const body = JSON.stringify(payload), ts = String(Math.floor(Date.now() / 1000));
  const r = await fetch(env.CRM_INTAKE_URL || CRM_INTAKE_URL, { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(8000),
    headers: { 'content-type': 'application/json', 'x-intake-timestamp': ts, 'x-intake-signature': `v1=${await hmacHex(env.CRM_INTAKE_SECRET, `intake.v1.${ts}.${body}`)}` }, body });
  await r.body?.cancel();
  if (!r.ok) throw Object.assign(new Error('crm forward'), { status: r.status });
}

async function intake(env, req, ctx) {
  const origin = req.headers.get('origin'), allowed = env.SITE_ORIGIN || 'https://aimanjack.com';
  if (!origin || (origin !== allowed && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) return fail(403, 'origin_not_allowed', 'Use the quote form on aimanjack.com.');
  const { form, body } = await readIntakeBody(req);
  const lang = body?.lang === 'zh' ? 'zh' : 'en';
  const quick = body?.kind === 'quick';
  const quickPage = quick && typeof body.page === 'string' && QUICK_PAGE.test(body.page) ? body.page : null;
  const back = (anchor) => new Response(null, { status: 303, headers: { location: quickPage ? `${quickPage}#quote-${anchor}` : `${lang === 'zh' ? '/zh' : ''}/contact/quote/#${anchor}`, 'cache-control': 'no-store' } });
  const reply = (status, data, anchor) => (form ? back(anchor) : json(data, status));
  if (!body || typeof body !== 'object') return reply(400, { ok: false, error: 'bad_body' }, 'not-sent');
  // Bots: honeypot filled, or submitted faster than a person can fill the form. Answer like a success; store nothing.
  const fill = body.fill_ms === undefined || body.fill_ms === '' ? null : Number(body.fill_ms);
  if (clean(body.company_url, 200) || (fill !== null && Number.isFinite(fill) && fill < INTAKE_MIN_FILL_MS)) return reply(200, { ok: true }, 'received');
  if (!yes(body.consent_request)) return reply(400, { ok: false, error: 'consent_required', fields: ['consent_request'] }, 'not-sent');
  const { errors, v } = quick ? validateQuickIntake(body) : validateIntake(body);
  if (errors.length) return reply(400, { ok: false, error: 'invalid', fields: errors }, 'not-sent');
  v.consent_newsletter = yes(body.consent_newsletter);   // optional, never assumed: absent or unticked = false

  const limited = await intakeRateLimit(env, req, v.email);
  if (limited === 'limited') return reply(429, { ok: false, error: 'rate_limited' }, 'not-sent');
  if (limited) return reply(503, { ok: false, error: 'intake_unavailable' }, 'not-sent');

  const day = new Date().toISOString().slice(0, 10);
  const companyDomain = v.company_website || v.email.split('@')[1];
  const dedupeBasis = `${v.email}|${companyDomain}|${day}`;
  const dedupeKey = (await emailHmac(env, 'dedupe', dedupeBasis)) ?? (await sha256(dedupeBasis));   // fallback: day-scoped, receipt row only
  const subjectHash = await emailHmac(env, 'subject', v.email);
  if (!subjectHash) console.warn('intake: EMAIL_HASH_SECRET unset; subject_email_hash stored as null');
  const ip = clean(req.headers.get('cf-connecting-ip'), 64);
  const ipHash = await ipHmac(env, 'intake-ip', ip);
  if (!ipHash) console.warn('intake: IP_HASH_SALT unset; ip_hash stored as null');
  const payload = quick
    ? { kind: 'quick', name: v.name, email: v.email, company: null, company_domain: companyDomain, attendees: v.attendees, budget: v.budget || null,
      workflows: v.workflows || null, tool: v.tool, page: v.page, lang: v.lang, fill_ms: fill, timer: fill === null ? 'absent' : 'ok' }
    : { name: v.name, email: v.email, company: v.company, company_website: v.company_website || null, company_domain: companyDomain, industry: v.industry, headcount: v.headcount,
      attendees: v.attendees, format: v.format, location: v.location, location_city: v.location_city || null, workflows: v.workflows, tools: v.tools || null,
      timing: v.timing, source: v.source, source_detail: v.source_detail || null, lang: v.lang, fill_ms: fill, timer: fill === null ? 'absent' : 'ok' };
  const receipt = { dedupe_key: dedupeKey, form_version: v.form_version, payload, consent_request: true, consent_newsletter: v.consent_newsletter,
    consent_notice_version: INTAKE_CONSENT_NOTICE_VERSION, utm: v.utm, self_reported_source: v.source, ip_hash: ipHash,
    subject_email_hash: subjectHash };
  const consents = [{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: v.consent_newsletter }];
  let rec;
  try {
    rec = await sb(env, 'rpc/record_intake', { method: 'POST', schema: 'revenue', body: { p: receipt, p_consents: consents } });
  } catch (e) {
    console.error('intake store unavailable', errInfo(e));
    return reply(503, { ok: false, error: 'intake_unavailable' }, 'not-sent');
  }
  const receiptId = rec?.receipt_id;
  if (!receiptId) { console.error('intake store returned no receipt'); return reply(503, { ok: false, error: 'intake_unavailable' }, 'not-sent'); }

  if (!rec.deduped) {
    const later = (p, what) => { const job = p.catch((e) => console.error(what, errInfo(e))); if (ctx.waitUntil) ctx.waitUntil(job); };
    if (!transportGap(env)) for (const to of parseOwnerEmails(env.OWNER_EMAIL).list) {
      const subject = quick ? `[quote request] ${v.tool} · ${v.attendees ?? '?'} people · ${companyDomain}` : `[quote request] ${v.company} · ${v.format}`;
      later(sendMail(env, { to, subject, text: intakeOwnerText(v, receiptId), reply_to: v.email }), 'intake owner email failed');
    }
    later(ownerPush(env, v, { quick, companyDomain }), 'intake owner push failed');
    if (env.CRM_INTAKE_SECRET) later(crmForward(env, { receipt_id: receiptId, kind: quick ? 'quick' : 'full', name: v.name || '', email: v.email, company: v.company || '',
      company_domain: companyDomain || '', attendees: v.attendees ?? null, budget: v.budget || '', workflows: v.workflows || '', tool: (quick ? v.tool : v.format) || '',
      page: v.page || '', lang: v.lang === 'zh' ? 'zh' : 'en', consent_newsletter: v.consent_newsletter === true, received_at: new Date().toISOString() }), 'intake crm forward failed');

  }
  return reply(rec.deduped ? 200 : 201, { ok: true, receipt_id: receiptId }, 'received');
}

// ── Quote intake v2 (PR02, 2026-10-19; db/migrations/2026-10-19-intake-submissions.sql). Off unless INTAKE_V2_ENABLED=true. ──
// One receipt per SUBMISSION instead of per (email, company domain, UTC day):
//   * with JS the browser sends a random submission_key per submission attempt (kept across network retries, replaced when the
//     content changes); without JS the content fingerprint is the submission identity;
//   * same submission + same content → the existing receipt, nothing sent again; same key + different content → 409 conflict,
//     nothing stored; a new submission → a new receipt, linked to the same person's previous one (owner decision: a second
//     request the same day is a NEW request, forwarded in full).
// Owner decisions (2026-10-19): a too-fast submission is not dropped — the visitor is asked to confirm and the second press
// is stored; a no-JS error re-renders the form with what was typed (src/intake-error-page.mjs).
// Every accepted request answers 201 { ok, receipt_id }: a retry and a first submission look the same, and nothing tells a
// caller whether an email address was seen before. Hashes are keyed with EMAIL_HASH_SECRET; without it v2 fails closed.
const INTAKE_MAX_BYTES = 32 * 1024;
const SUBMISSION_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const intakeV2Enabled = (env) => env.INTAKE_V2_ENABLED === 'true';

// Counts bytes while streaming and cancels the upload as soon as it passes the limit (no Content-Length needed).
async function readBounded(req, max) {
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader(), chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(size); let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.byteLength; }
  return out;
}

async function readIntakeBodyLimited(req) {
  const header = req.headers.get('content-type') || '', type = header.toLowerCase();   // keep `header` as sent: multipart boundaries are case-sensitive
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > INTAKE_MAX_BYTES) { await req.body?.cancel().catch(() => {}); return { tooLarge: true }; }
  let raw;
  try { raw = await readBounded(req, INTAKE_MAX_BYTES); } catch { return { form: false, body: null }; }
  if (raw === null) return { tooLarge: true };
  if (type.includes('application/json')) { try { return { form: false, body: JSON.parse(new TextDecoder().decode(raw)) }; } catch { return { form: false, body: null }; } }
  if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
    const fd = await new Response(raw, { headers: { 'content-type': header } }).formData().catch(() => null);
    return { form: true, body: fd ? Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === 'string')) : null };
  }
  return { form: false, body: null };
}

// What the person actually asked for, in a stable order. Attribution, form version and timing are not part of the content.
const CONTENT_FIELDS = ['kind', 'name', 'email', 'company', 'company_website', 'industry', 'headcount', 'attendees', 'format', 'location', 'location_city',
  'workflows', 'tools', 'timing', 'source', 'source_detail', 'budget', 'tool', 'page', 'lang', 'consent_newsletter'];
const canonicalContent = (v) => JSON.stringify(CONTENT_FIELDS.map((k) => [k, v[k] ?? null]));

async function intakeV2(env, req, ctx) {
  const origin = req.headers.get('origin'), allowed = env.SITE_ORIGIN || 'https://aimanjack.com';
  if (!origin || (origin !== allowed && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) return fail(403, 'origin_not_allowed', 'Use the quote form on aimanjack.com.');
  const read = await readIntakeBodyLimited(req);
  const isForm = (req.headers.get('content-type') || '').toLowerCase().match(/x-www-form-urlencoded|multipart\/form-data/) !== null;
  const { body } = read;
  const lang = body?.lang === 'zh' ? 'zh' : 'en';
  const quick = body?.kind === 'quick';
  const quickPage = quick && typeof body.page === 'string' && QUICK_PAGE.test(body.page) ? body.page : null;
  const back = (anchor) => new Response(null, { status: 303, headers: { location: quickPage ? `${quickPage}#quote-${anchor}` : `${lang === 'zh' ? '/zh' : ''}/contact/quote/#${anchor}`, 'cache-control': 'no-store' } });
  // No-JS problems the visitor can fix: show the form again with what they typed.
  const page = (status, reason, errors = []) => new Response(renderIntakeErrorPage({ lang, kind: quick ? 'quick' : 'full', body, errors, reason, backPath: quickPage }),
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
  const reply = (status, data, anchor) => (isForm ? back(anchor) : json(data, status));
  if (read.tooLarge) return reply(413, { ok: false, error: 'too_large' }, 'not-sent');
  if (!body || typeof body !== 'object') return reply(400, { ok: false, error: 'bad_body' }, 'not-sent');
  // Bots: a filled honeypot is answered like a success, nothing stored, no receipt (the page fires no conversion without one).
  if (clean(body.company_url, 200)) return reply(200, { ok: true }, 'received');
  if (!yes(body.consent_request)) return isForm ? page(400, 'consent_required', ['consent_request']) : json({ ok: false, error: 'consent_required', fields: ['consent_request'] }, 400);
  const { errors, v } = quick ? validateQuickIntake(body) : validateIntake(body);
  if (errors.length) return isForm ? page(400, 'invalid', errors) : json({ ok: false, error: 'invalid', fields: errors }, 400);
  v.consent_newsletter = yes(body.consent_newsletter);
  // Too fast for a person typing (autofill can be): ask once to confirm instead of silently dropping the request.
  const fill = body.fill_ms === undefined || body.fill_ms === '' ? null : Number(body.fill_ms);
  const fast = fill !== null && Number.isFinite(fill) && fill < INTAKE_MIN_FILL_MS;
  if (fast && body.confirm !== 'yes') return isForm ? page(409, 'confirm_required') : json({ ok: false, error: 'confirm_required' }, 409);

  // From here on the body is parsed: a no-JS visitor gets the form back with what they typed for anything they can retry.
  const retry = (status, error) => (isForm ? page(status, error) : json({ ok: false, error }, status));
  const limited = await intakeRateLimit(env, req, v.email);
  if (limited === 'limited') return retry(429, 'rate_limited');
  if (limited) return retry(503, 'intake_unavailable');
  if (!env.EMAIL_HASH_SECRET) { console.error('intake v2: EMAIL_HASH_SECRET unset'); return retry(503, 'intake_unavailable'); }

  const companyDomain = v.company_website || v.email.split('@')[1];
  const bodyHash = await hmacHex(env.EMAIL_HASH_SECRET, `body:${canonicalContent({ ...v, kind: quick ? 'quick' : 'full' })}`);
  const key = typeof body.submission_key === 'string' && SUBMISSION_KEY.test(body.submission_key.toLowerCase()) ? body.submission_key.toLowerCase() : null;
  const dedupeKey = await hmacHex(env.EMAIL_HASH_SECRET, key ? `submission:${key}` : `submission-body:${bodyHash}`);
  const subjectHash = await emailHmac(env, 'subject', v.email);
  const ipHash = await ipHmac(env, 'intake-ip', clean(req.headers.get('cf-connecting-ip'), 64));
  const payload = quick
    ? { kind: 'quick', name: v.name, email: v.email, company: null, company_domain: companyDomain, attendees: v.attendees, budget: v.budget || null,
      workflows: v.workflows || null, tool: v.tool, page: v.page, lang: v.lang, fill_ms: fill, timer: fill === null ? 'absent' : 'ok' }
    : { name: v.name, email: v.email, company: v.company, company_website: v.company_website || null, company_domain: companyDomain, industry: v.industry, headcount: v.headcount,
      attendees: v.attendees, format: v.format, location: v.location, location_city: v.location_city || null, workflows: v.workflows, tools: v.tools || null,
      timing: v.timing, source: v.source, source_detail: v.source_detail || null, lang: v.lang, fill_ms: fill, timer: fill === null ? 'absent' : 'ok' };
  const receipt = { dedupe_key: dedupeKey, body_hash: bodyHash, form_version: v.form_version, payload, consent_request: true, consent_newsletter: v.consent_newsletter,
    consent_notice_version: INTAKE_CONSENT_NOTICE_VERSION, utm: v.utm, self_reported_source: v.source ?? null, ip_hash: ipHash, subject_email_hash: subjectHash,
    risk: fast || body.confirm === 'yes' ? 'fast_fill_confirmed' : null };
  const consents = [{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: v.consent_newsletter }];
  let rec;
  try { rec = await sb(env, 'rpc/record_intake_v2', { method: 'POST', schema: 'revenue', body: { p: receipt, p_consents: consents } }); }
  catch (e) { console.error('intake v2 store unavailable', errInfo(e)); return retry(503, 'intake_unavailable'); }
  if (rec?.conflict) return isForm ? page(409, 'submission_conflict') : json({ ok: false, error: 'submission_conflict' }, 409);
  const receiptId = rec?.receipt_id;
  if (!receiptId) { console.error('intake v2 store returned no receipt'); return retry(503, 'intake_unavailable'); }

  if (!rec.deduped) {
    const prev = typeof rec.previous_receipt_id === 'string' ? rec.previous_receipt_id : null;
    const later = (p, what) => { const job = p.catch((e) => console.error(what, errInfo(e))); if (ctx.waitUntil) ctx.waitUntil(job); };
    if (!transportGap(env)) for (const to of parseOwnerEmails(env.OWNER_EMAIL).list) {
      const subject = quick ? `[quote request] ${v.tool} · ${v.attendees ?? '?'} people · ${companyDomain}` : `[quote request] ${v.company} · ${v.format}`;
      const text = intakeOwnerText(v, receiptId) + (prev ? `\n\nSame person sent an earlier request: ${prev}. This one may be a revision; the earlier one is kept.` : '');
      later(sendMail(env, { to, subject, text, reply_to: v.email }), 'intake owner email failed');
    }
    // The CRM receiver's schema is strict, so the link to the earlier receipt travels as a note at the top of the message.
    const note = prev ? `[可能是回执 ${prev.slice(0, 8)} 的修改 / possibly a revision of receipt ${prev.slice(0, 8)}]\n` : '';
    later(ownerPush(env, v, { quick, companyDomain }), 'intake owner push failed');
    if (env.CRM_INTAKE_SECRET) later(crmForward(env, { receipt_id: receiptId, kind: quick ? 'quick' : 'full', name: v.name || '', email: v.email, company: v.company || '',
      company_domain: companyDomain || '', attendees: v.attendees ?? null, budget: v.budget || '', workflows: note + (v.workflows || ''), tool: (quick ? v.tool : v.format) || '',
      page: v.page || '', lang: v.lang === 'zh' ? 'zh' : 'en', consent_newsletter: v.consent_newsletter === true, received_at: new Date().toISOString() }), 'intake crm forward failed');
  }
  return reply(201, { ok: true, receipt_id: receiptId }, 'received');
}

// kind: created | rescheduled | cancelled. Customer gets a confirmation, the owner a one-line notice.
// Durable: rows are written to booking.notifications first, then sent in waitUntil (src/booking-notify.mjs).
const notifierFor = (env) => createNotifier({ db: (path, o) => sb(env, path, o), env, alert: alertFromEnv(env) });
async function notify(env, ctx, b, kind, source, eventId, meta) {
  const origin = env.SITE_ORIGIN || 'https://aimanjack.com';
  const messages = composeMessages(env, b, kind, source, { fmtWhen, prettyPhone, manageUrl: view(b, origin).manage_url, siteOrigin: origin });
  if (!messages.length) return;
  const n = notifierFor(env);
  let rows = null;
  try { rows = await n.enqueue(b, eventId, kind, messages, meta); }
  catch (e) { console.error('booking notification ledger unavailable', errCode(e)); }
  // Leave subrequest headroom for quota reservations and token refresh; remaining rows stay pending.
  if (rows) { ctx.waitUntil(Promise.allSettled(rows.slice(0, 2).map((r) => n.attempt(r))).then(() => n.processDue({ limit: BATCH.afterWrite })).catch(() => {})); return; }
  // Ledger unavailable (migration not applied / DB error): still try to send, loudly logged — never silently dropped.
  const c = bookingMailConfig(env);
  const gap = transportGap(env);
  if (gap) { console.error('booking email NOT sent (no ledger):', gap); return; }
  messages.filter((m) => !m.to).forEach((m) => console.error('booking email NOT sent (no ledger):', m.role === 'owner' ? 'config_missing:OWNER_EMAIL' : 'no_customer_email'));
  ctx.waitUntil(Promise.allSettled(messages.filter((m) => m.to).map((m) => sendMail({ ...env, EMAIL_FROM: c.from }, { to: m.to, subject: m.subject, text: m.text, reply_to: m.reply_to })))
    .then((rs) => rs.forEach((r, i) => r.status === 'rejected' && console.error('booking email (no ledger) failed', messages.filter((m) => m.to)[i].role, errCode(r.reason)))));
}

// Post-commit side effects (event log, notifications) must never turn a committed booking into an error response.
async function afterWrite(env, ctx, b, kind, source, payload, meta = {}) {
  let eventId = null;
  try { eventId = await logEvent(env, b, kind, source, payload); } catch (e) { console.error('booking event log failed', errCode(e)); }
  try { await notify(env, ctx, b, kind, source, eventId, meta); } catch (e) { console.error('booking notify failed', errCode(e)); }
}

function normPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10) return '+1' + d;
  if (d.length === 11 && d[0] === '1') return '+' + d;
  return d.length >= 7 && d.length <= 15 ? '+' + d : null;
}
const clean = (s, max) => (typeof s === 'string' ? s.trim().slice(0, max) : '');

function windowClosed(b) {
  return Date.now() > Date.parse(b.start_at) - b.cancel_window_hours * 3600e3;
}
const windowMsg = (b) => `Changes must be made at least ${b.cancel_window_hours} hour${b.cancel_window_hours === 1 ? '' : 's'} before the appointment. Contact ${b.business_name} directly.`;

// ── handlers ──
// Pages Functions have no cron: public availability traffic also drives retries (at most once a minute per isolate).
let lastSweep = 0;
const sweep = (env, ctx) => { if (!ctx?.waitUntil || transportGap(env) || Date.now() - lastSweep < 60000) return; lastSweep = Date.now(); ctx.waitUntil(notifierFor(env).processDue({ limit: BATCH.sweep }).catch(() => {})); };

async function availability(env, url) {
  const q = url.searchParams, r = await loadBizSvc(env, q.get('business'), q.get('service'));
  if (r.error) return r.error;
  const out = await openSlots(env, r.biz, r.svc, { from: q.get('from'), to: q.get('to'), staffId: q.get('staff') || undefined });
  out.days.forEach((d) => d.slots.forEach((s) => delete s._ms));
  return json({ business: r.biz.id, service: r.svc.id, service_name: r.svc.name, duration_min: r.svc.duration_min, tz: r.biz.tz, ...out });
}

async function create(env, req, origin, ctx) {
  const body = await req.json().catch(() => null);
  if (!body) return fail(400, 'bad_json', 'Body must be JSON.');
  const r = await loadBizSvc(env, body.business, body.service);
  if (r.error) return r.error;
  const { biz, svc } = r, source = sourceOf(env, req);
  const idem = clean(req.headers.get('idempotency-key'), 128) || null;
  if (idem) { const ex = await byIdem(env, biz.id, idem); if (ex) return json(view(ex, origin), 200); }
  const name = clean(body.customer_name, 80), phone = normPhone(body.customer_phone);
  if (!name) return fail(400, 'name_required', 'customer_name is required.');
  if (!phone) return fail(400, 'phone_invalid', 'customer_phone must be a valid phone number.');
  const email = clean(body.customer_email, 120);
  if (email && !emailOk(email.toLowerCase())) return fail(400, 'email_invalid', 'customer_email must be a valid email address (or leave it out).');
  // Public bookings are rate-limited per IP: each booking makes the owner's real mailbox send email, so a scripted
  // book/cancel loop must not be able to spam through it. Fails open (a booking matters more); the email ledger also
  // caps sends per address and per day.
  if (source === 'web' && !adminOk(env, req)) {
    const ip = clean(req.headers.get('cf-connecting-ip'), 64);
    const ipKey = await ipHmac(env, 'booking-ip', ip);
    if (ipKey) {
      try {
        const allowed = await sb(env, 'rpc/take_coupon_rate_limit', { method: 'POST', body: { p_key_hash: ipKey, p_limit: 6, p_window_seconds: 3600 } });
        if (allowed === false) return fail(429, 'rate_limited', 'Too many bookings from this connection. Try again later or call us.');
      } catch (e) { console.error('booking rate limiter unavailable', errCode(e)); }
    } else if (ip) console.warn('booking: IP_HASH_SALT unset; IP rate limit unavailable');
  }
  const slot = await findSlot(env, biz, svc, body.start_at, { staffId: body.staff || undefined });
  if (!slot) return fail(409, 'slot_unavailable', 'That time is not available. Pick another one.');
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const start = new Date(slot._ms).toISOString(), end = new Date(slot._ms + svc.duration_min * 60000).toISOString();
  const buf = svc.buffer_min * 60000, lo = new Date(slot._ms - buf).toISOString(), hi = new Date(slot._ms + svc.duration_min * 60000 + buf).toISOString();
  let ok;
  try {
    // booking.create_booking(): advisory lock + capacity check + insert in one transaction.
    ok = await sb(env, 'rpc/create_booking', { method: 'POST', body: { p: { id, business_id: biz.id, service_id: svc.id, staff_id: slot.staff_id, start_at: start, end_at: end, lo, hi, capacity: svc.capacity,
      customer_name: name, customer_phone: phone, customer_email: email || null, note: clean(body.note, 500) || null, source, idempotency_key: idem, ros_utm: firstTouchOf(body) } } });
  } catch (e) {
    if (idem && e.code === '23505') { const ex = await byIdem(env, biz.id, idem); if (ex) return json(view(ex, origin), 200); }
    throw e;
  }
  if (!ok) return fail(409, 'slot_unavailable', 'That time was just taken. Pick another one.');
  const b = await getBooking(env, id);
  await afterWrite(env, ctx, b, 'created', source, { start_at: b.start_at, service: b.service_id, staff: b.staff_id });
  return json(view(b, origin), 201);
}

async function reschedule(env, req, b, origin, ctx) {
  const body = await req.json().catch(() => null);
  if (!body?.start_at) return fail(400, 'start_at_required', 'start_at is required.');
  if (b.status !== 'confirmed') return fail(409, 'booking_cancelled', 'This appointment was cancelled. Book a new one.');
  if (windowClosed(b)) return fail(409, 'cancel_window', windowMsg(b));
  const source = sourceOf(env, req);
  const { biz, svc } = await loadBizSvc(env, b.business_id, b.service_id);
  const slot = await findSlot(env, biz, svc, body.start_at, { staffId: body.staff || b.staff_id, excludeId: b.id });
  if (!slot) return fail(409, 'slot_unavailable', 'That time is not available. Pick another one.');
  const start = new Date(slot._ms).toISOString(), end = new Date(slot._ms + b.duration_min * 60000).toISOString();
  const buf = b.buffer_min * 60000, lo = new Date(slot._ms - buf).toISOString(), hi = new Date(slot._ms + b.duration_min * 60000 + buf).toISOString();
  const ok = await sb(env, 'rpc/move_booking', { method: 'POST', body: { p: { id: b.id, business_id: b.business_id, staff_id: slot.staff_id, start_at: start, end_at: end, lo, hi, capacity: b.capacity } } });
  if (!ok) return fail(409, 'slot_unavailable', 'That time was just taken. Pick another one.');
  const nb = await getBooking(env, b.id);
  if (Date.parse(nb.start_at) !== Date.parse(b.start_at)) await afterWrite(env, ctx, nb, 'rescheduled', source, { from: b.start_at, to: nb.start_at }, { from: b.start_at });
  return json(view(nb, origin));
}

async function cancel(env, req, b, origin, ctx) {
  if (b.status !== 'confirmed') return json(view(b, origin));
  if (windowClosed(b)) return fail(409, 'cancel_window', windowMsg(b));
  const source = sourceOf(env, req);
  const changed = await sb(env, 'bookings?' + q({ id: 'eq.' + b.id, status: 'eq.confirmed' }), { method: 'PATCH', body: { status: 'cancelled', updated_at: new Date().toISOString() }, headers: { prefer: 'return=representation' } });
  const nb = await getBooking(env, b.id);
  // A concurrent second cancel changes no row: it returns the cancelled booking but sends nothing.
  if (changed?.length) await afterWrite(env, ctx, nb, 'cancelled', source, { start_at: b.start_at });
  return json(view(nb, origin));
}

async function list(env, req, url, origin, ctx) {
  const auth = req.headers.get('authorization') || '';
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) return fail(401, 'unauthorized', 'Bearer token required.');
  const biz = url.searchParams.get('business');
  if (!biz) return fail(400, 'business_required', 'business is required.');
  const from = url.searchParams.get('from'), status = url.searchParams.get('status'), phone = normPhone(url.searchParams.get('phone'));
  const rows = await sb(env, 'bookings_full?' + q({ business_id: 'eq.' + biz, start_at: 'gte.' + (isDate(from) ? from : new Date(Date.now() - 864e5).toISOString().slice(0, 10)),
    ...(status ? { status: 'eq.' + status } : {}), ...(phone ? { customer_phone: 'eq.' + phone } : {}), order: 'start_at.asc', limit: '500' }));
  const withNotes = url.searchParams.get('with') === 'notifications';   // owner page only; agents keep the old shape
  let notes = [];
  if (withNotes && rows.length) {
    try { notes = await sb(env, 'notifications?' + q({ booking_id: `in.(${rows.map((b) => b.id).join(',')})`, select: 'id,booking_id,kind,role,to_address,status,attempts,last_error,sent_at,updated_at', order: 'id.asc' })); }
    catch { notes = null; }
  }
  if (!withNotes) return json({ business: biz, count: rows.length, bookings: rows.map((b) => view(b, origin)) });
  return json({ business: biz, count: rows.length, notifications_ledger: notes === null ? 'unavailable' : 'ok',
    bookings: rows.map((b) => ({ ...view(b, origin), notifications: (notes || []).filter((n) => n.booking_id === b.id)
      // Owner rows carry a MASKED recipient so two owner inboxes can be told apart; raw ledger addresses are never returned.
      .map(({ booking_id, to_address, ...n }) => (n.role === 'owner' ? { ...n, recipient: maskEmail(to_address) } : n)) })) });
}

async function notificationsApi(env, req, url, id, ctx) {
  const scheduledProcessOnly = id === 'process' && req.method === 'POST' && notificationProcessorOk(env, req);
  if (!adminOk(env, req) && !scheduledProcessOnly) return fail(401, 'unauthorized', 'Bearer token required.');
  const n = notifierFor(env);
  if (!id && req.method === 'GET') {
    const status = url.searchParams.get('status'), booking = url.searchParams.get('booking');
    const rows = await sb(env, 'notifications?' + q({ select: 'id,booking_id,kind,role,status,attempts,last_error,sent_at,next_attempt_at,created_at,updated_at',
      ...(status ? { status: 'eq.' + status } : {}), ...(booking ? { booking_id: 'eq.' + booking } : {}), order: 'id.desc', limit: '200' }));
    return json({ count: rows.length, notifications: rows });
  }
  if (id === 'process' && req.method === 'POST') return json(await n.processDue({ limit: BATCH.process }));
  if (id === 'requeue' && req.method === 'POST') {
    const body = await req.json().catch(() => null);
    const rows = await n.requeue(Array.isArray(body?.ids) ? body.ids : [], { includeBounced: body?.include_bounced === true });
    if (ctx?.waitUntil) ctx.waitUntil(n.processDue({ limit: BATCH.process }).catch(() => {}));
    return json({ requeued: rows.map((r) => r.id) });
  }
  return fail(404, 'not_found', 'No such route.');
}

export async function onRequest(ctx) {
  const { request: req, env, params } = ctx;
  if (!productionApiEnabled(env, req)) return fail(503, 'preview_read_only', 'Read-only preview. Booking and email APIs are disabled.');
  const url = new URL(req.url), origin = url.origin, [res, id, extra] = params.route || [];
  try {
    if (res === 'mailerlite') return await mailerliteRoute({env,req,id,extra,db:(path,o)=>sb(env,path,o)});
    if (res === 'ros-events') return await rosEventsRoute({env,req,id,extra,db:(path,o)=>sb(env,path,o)});
    if (rosEnabled(env) && ((res === 'bookings' && ['POST','PATCH','DELETE'].includes(req.method)) || (res === 'intake' && req.method === 'POST'))) {
      try { if (await sb(env,'rpc/ros_ready',{method:'POST',schema:'revenue',body:{}}) !== true) throw Error('not_ready'); }
      catch { return fail(503,'customer_sync_unavailable','Please try again later.'); }
    }
    if (res === 'availability' && req.method === 'GET') { sweep(env, ctx); return await availability(env, url); }
    if (res === 'bookings' && !id) {
      if (req.method === 'POST') return await create(env, req, origin, ctx);
      if (req.method === 'GET') return await list(env, req, url, origin, ctx);
    }
    if (res === 'bookings' && id && !extra) {
      const b = await getBooking(env, id);
      if (!b) return fail(404, 'booking_not_found', 'No such booking.');
      if (req.method === 'GET') return json(view(b, origin));
      if (req.method === 'PATCH') return await reschedule(env, req, b, origin, ctx);
      if (req.method === 'DELETE') return await cancel(env, req, b, origin, ctx);
    }
    if (res === 'notifications' && !extra) return await notificationsApi(env, req, url, id, ctx);
    if (res === 'admin' && id === 'email-config' && req.method === 'GET') {
      if (!adminOk(env, req)) return fail(401, 'unauthorized', 'Bearer token required.');
      const cfg = describeMailConfig(env);
      return json(mailTransport(env) === 'm365' ? { ...cfg, m365: await m365Status(env, (p, o) => sb(env, p, o)) } : cfg);
    }
    if (res === 'admin' && id === 'texts' && !extra) return await textsRoute({ env, req, url, admin: adminOk(env, req) });
    // One-time Microsoft 365 connection (delegated sign-in from the owner page): connect → poll until connected.
    if (res === 'admin' && id === 'm365' && req.method === 'POST' && ['connect', 'poll', 'disconnect'].includes(extra)) {
      if (!adminOk(env, req)) return fail(401, 'unauthorized', 'Bearer token required.');
      const db = (p, o) => sb(env, p, o);
      if (extra === 'connect') { const r = await m365StartConnect(env, db); return json(r, r.ok ? 200 : 409); }
      if (extra === 'poll') return json(await m365PollConnect(env, db));
      return json(await m365Disconnect(env, db));
    }
    if (res === 'coupons' && !id) {
      if (req.method === 'POST') return await claimCoupon(env, req, ctx);
      if (req.method === 'GET') return await listCoupons(env, req, url);
    }
    if (res === 'coupons' && id && !extra && req.method === 'PATCH') return await redeemCoupon(env, req, id);
    if (res === 'intake' && !id && req.method === 'POST') {
      try { return await (intakeV2Enabled(env) ? intakeV2(env, req, ctx) : intake(env, req, ctx)); }
      catch (e) { console.error('intake api', errInfo(e)); return fail(500, 'internal', 'Something went wrong on our side.'); }   // codes only: no PII in logs
    }
    return fail(404, 'not_found', 'No such route.');
  } catch (e) {
    console.error('booking api', errInfo(e));
    return fail(500, 'internal', 'Something went wrong on our side.');
  }
}
