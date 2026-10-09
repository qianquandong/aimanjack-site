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
// Email: after every write, a confirmation goes to customer_email (if given) and a notice to OWNER_EMAIL, via the
// Cloudflare Email Sending REST API (Pages Functions have no send_email binding) — env.CF_ACCOUNT_ID + env.CF_EMAIL_TOKEN
// + env.EMAIL_FROM. No token = no email, booking still succeeds. Sent in waitUntil so the response never waits on it.
// Instants are timestamptz; responses render them in the business tz with an offset (ISO 8601).

const SOURCES = new Set(['web', 'voice', 'sms', 'admin']);
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

const logEvent = (env, b, type, source, payload) =>
  sb(env, 'events', { method: 'POST', body: { business_id: b.business_id, booking_id: b.id, type, source, payload }, headers: { prefer: 'return=minimal' } });

// ── email (Cloudflare Email Sending, REST) ──
const whenFmt = {};
const fmtWhen = (b) => (whenFmt[b.tz] ??= new Intl.DateTimeFormat('en-US', { timeZone: b.tz, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })).format(new Date(b.start_at));
const prettyPhone = (p) => { const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(p || ''); return m ? `(${m[1]}) ${m[2]}-${m[3]}` : p; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function sendMail(env, { to, subject, text, reply_to }) {
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
  if (!env.CF_EMAIL_TOKEN || !env.EMAIL_FROM) return fail(503, 'email_unavailable', 'Coupon email is temporarily unavailable.');

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
    await sendMail(env, { to: email, subject: `Your $25 AI Man Jack coupon: ${coupon.code}`, text, reply_to: env.OWNER_EMAIL });
  } catch (e) {
    await couponPatch(env, coupon.code, { issuance_status: 'failed', delivery_attempts: (coupon.delivery_attempts || 0) + 1, last_error: String(e.message || e).slice(0, 240) }).catch((dbError) => console.error('coupon failure persistence', dbError.message));
    return fail(502, 'email_failed', 'The coupon email was not accepted by the email provider.');
  }
  await couponPatch(env, coupon.code, { issuance_status: 'sent', delivery_attempts: (coupon.delivery_attempts || 0) + 1, delivered_at: new Date().toISOString(), last_error: null }).catch((e) => console.error('coupon sent persistence', e.message));
  if (env.OWNER_EMAIL && ctx.waitUntil) ctx.waitUntil(sendMail(env, { to: env.OWNER_EMAIL, subject: `[coupon] ${coupon.code} issued`, text: `${coupon.code} issued to ${email}. Manual redemption is still required.`, reply_to: email }).catch((e) => console.error('coupon owner email', e.message)));
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
// Then, never blocking the response: owner notice via sendMail (only if configured) and a signed event to the Revenue OS
// operational store (only if ROS_WEBHOOK_URL + ROS_WEBHOOK_SECRET are set).
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
const INTAKE_CONSENT_NOTICE_VERSION = 'privacy-2026-10-08-draft';   // keep equal to CONSENT_NOTICE_VERSION in src/config.mjs (tested)
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
  const utm = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) { const s = clean(b[`ft_${k}`], 120); if (s) utm[k] = s; }
  const ref = hostOf(clean(b.ft_ref, 120)); if (ref) utm.referrer_host = ref;
  const landing = clean(b.ft_landing, 200); if (landing.startsWith('/')) utm.landing_path = landing;
  const ts = Number(b.ft_ts); if (Number.isFinite(ts) && ts > 0) utm.first_touch_at = new Date(ts).toISOString();
  v.utm = utm;
  return { errors: [...new Set(errors)], v };
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

// Signed event for the Revenue OS operational store: x-ros-signature = sha256=<hex HMAC-SHA256 of "${t}.${body}">.
// The event carries the receipt minus any IP data. Failure is logged by status only and never fails the request.
async function postRosEvent(env, event) {
  const body = JSON.stringify(event), t = String(Math.floor(Date.now() / 1000));
  const signature = await hmacHex(env.ROS_WEBHOOK_SECRET, `${t}.${body}`);
  const r = await fetch(env.ROS_WEBHOOK_URL, { method: 'POST', body, headers: { 'content-type': 'application/json', 'x-ros-timestamp': t, 'x-ros-signature': `sha256=${signature}`, 'x-ros-event-id': event.receipt_id } });
  if (!r.ok) console.error('ros webhook rejected', r.status);
}

function intakeOwnerText(v, receiptId) {
  const label = (k, x) => `${k}: ${x ?? ''}`;
  return [`New training quote request (${receiptId})`, '', label('Name', v.name), label('Email', v.email), label('Company', v.company), label('Website', v.company_website),
    label('Industry', v.industry), label('Company size', v.headcount), label('Attendees', v.attendees), label('Format', v.format),
    label('Location', v.location + (v.location_city ? ` (${v.location_city})` : '')), label('Timing', v.timing), label('Tools', v.tools),
    label('Heard about us', [v.source, v.source_detail].filter(Boolean).join(' — ')), label('Newsletter opt-in', v.consent_newsletter ? 'yes' : 'no'), '', 'Workflows:', v.workflows,
    '', 'This is a quote request, not a booked meeting. Reply to the sender directly.'].join('\n');
}

async function intake(env, req, ctx) {
  const origin = req.headers.get('origin'), allowed = env.SITE_ORIGIN || 'https://aimanjack.com';
  if (!origin || (origin !== allowed && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) return fail(403, 'origin_not_allowed', 'Use the quote form on aimanjack.com.');
  const { form, body } = await readIntakeBody(req);
  const back = (anchor, lang) => new Response(null, { status: 303, headers: { location: `${lang === 'zh' ? '/zh' : ''}/contact/quote/#${anchor}`, 'cache-control': 'no-store' } });
  const lang = body?.lang === 'zh' ? 'zh' : 'en';
  const reply = (status, data, anchor) => (form ? back(anchor, lang) : json(data, status));
  if (!body || typeof body !== 'object') return reply(400, { ok: false, error: 'bad_body' }, 'not-sent');
  // Bots: honeypot filled, or submitted faster than a person can fill the form. Answer like a success; store nothing.
  const fill = body.fill_ms === undefined || body.fill_ms === '' ? null : Number(body.fill_ms);
  if (clean(body.company_url, 200) || (fill !== null && Number.isFinite(fill) && fill < INTAKE_MIN_FILL_MS)) return reply(200, { ok: true }, 'received');
  if (!yes(body.consent_request)) return reply(400, { ok: false, error: 'consent_required', fields: ['consent_request'] }, 'not-sent');
  const { errors, v } = validateIntake(body);
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
  const payload = { name: v.name, email: v.email, company: v.company, company_website: v.company_website || null, company_domain: companyDomain, industry: v.industry, headcount: v.headcount,
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
    if (env.CF_EMAIL_TOKEN && env.EMAIL_FROM && env.OWNER_EMAIL) later(sendMail(env, { to: env.OWNER_EMAIL, subject: `[quote request] ${v.company} · ${v.format}`, text: intakeOwnerText(v, receiptId), reply_to: v.email }), 'intake owner email failed');
    if (env.ROS_WEBHOOK_URL && env.ROS_WEBHOOK_SECRET) {
      const { ip_hash, subject_email_hash, dedupe_key, ...rest } = receipt;   // the operational store gets no IP data or hashes
      later(postRosEvent(env, { event_type: 'intake.received', receipt_id: receiptId, received_at: rec.received_at || new Date().toISOString(), ...rest }), 'ros webhook failed');
    }
  }
  return reply(rec.deduped ? 200 : 201, { ok: true, receipt_id: receiptId }, 'received');
}

// kind: created | rescheduled | cancelled. Customer gets a confirmation, the owner a one-line notice.
function notify(env, ctx, b, kind, source) {
  if (!env.CF_EMAIL_TOKEN || !env.EMAIL_FROM) return;
  const v = view(b, env.SITE_ORIGIN || 'https://aimanjack.com'), when = fmtWhen(b), phone = prettyPhone(b.customer_phone), who = `${b.customer_name} · ${phone}${b.customer_email ? ' · ' + b.customer_email : ''}`;
  const subj = { created: `Confirmed: your ${b.service_name} with Jack, ${when}`, rescheduled: `Moved: your ${b.service_name} is now ${when}`, cancelled: `Cancelled: your ${b.service_name} on ${when}` }[kind];
  const line = { created: `You're booked. Jack will call ${phone} on ${when}.`, rescheduled: `Your call is moved. Jack will call ${phone} on ${when}.`, cancelled: `Your call on ${when} is cancelled. Book a new time any time.` }[kind];
  const manage = kind === 'cancelled' ? `Book again: ${env.SITE_ORIGIN || 'https://aimanjack.com'}/book/` : `Change or cancel (up to ${b.cancel_window_hours}h before): ${v.manage_url}`;
  const customer = `Hi ${b.customer_name},\n\n${line}\n\n${manage}\n\nQuestions? Just reply to this email.\n\nJack\nAI Man Jack`;
  const head = `${kind} (${source}): ${b.service_name} ${when}`;
  const owner = [head, who, b.note, v.manage_url].filter(Boolean).join('\n');
  const jobs = [];
  if (b.customer_email) jobs.push(sendMail(env, { to: b.customer_email, subject: subj, text: customer, reply_to: env.OWNER_EMAIL }));
  if (env.OWNER_EMAIL && source !== 'admin') jobs.push(sendMail(env, { to: env.OWNER_EMAIL, subject: `[booking] ${head}`, text: owner, reply_to: b.customer_email || undefined }));
  ctx.waitUntil(Promise.allSettled(jobs).then((rs) => rs.forEach((r, i) => r.status === 'rejected' && console.error('booking email', i, r.reason?.message))));
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
  const { biz, svc } = r, source = SOURCES.has(req.headers.get('x-source')) ? req.headers.get('x-source') : 'web';
  const idem = clean(req.headers.get('idempotency-key'), 128) || null;
  if (idem) { const ex = await byIdem(env, biz.id, idem); if (ex) return json(view(ex, origin), 200); }
  const name = clean(body.customer_name, 80), phone = normPhone(body.customer_phone);
  if (!name) return fail(400, 'name_required', 'customer_name is required.');
  if (!phone) return fail(400, 'phone_invalid', 'customer_phone must be a valid phone number.');
  const slot = await findSlot(env, biz, svc, body.start_at, { staffId: body.staff || undefined });
  if (!slot) return fail(409, 'slot_unavailable', 'That time is not available. Pick another one.');
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const start = new Date(slot._ms).toISOString(), end = new Date(slot._ms + svc.duration_min * 60000).toISOString();
  const buf = svc.buffer_min * 60000, lo = new Date(slot._ms - buf).toISOString(), hi = new Date(slot._ms + svc.duration_min * 60000 + buf).toISOString();
  let ok;
  try {
    // booking.create_booking(): advisory lock + capacity check + insert in one transaction.
    ok = await sb(env, 'rpc/create_booking', { method: 'POST', body: { p: { id, business_id: biz.id, service_id: svc.id, staff_id: slot.staff_id, start_at: start, end_at: end, lo, hi, capacity: svc.capacity,
      customer_name: name, customer_phone: phone, customer_email: clean(body.customer_email, 120) || null, note: clean(body.note, 500) || null, source, idempotency_key: idem } } });
  } catch (e) {
    if (idem && e.code === '23505') { const ex = await byIdem(env, biz.id, idem); if (ex) return json(view(ex, origin), 200); }
    throw e;
  }
  if (!ok) return fail(409, 'slot_unavailable', 'That time was just taken. Pick another one.');
  const b = await getBooking(env, id);
  await logEvent(env, b, 'created', source, { start_at: b.start_at, service: b.service_id, staff: b.staff_id });
  notify(env, ctx, b, 'created', source);
  return json(view(b, origin), 201);
}

async function reschedule(env, req, b, origin, ctx) {
  const body = await req.json().catch(() => null);
  if (!body?.start_at) return fail(400, 'start_at_required', 'start_at is required.');
  if (b.status !== 'confirmed') return fail(409, 'booking_cancelled', 'This appointment was cancelled. Book a new one.');
  if (windowClosed(b)) return fail(409, 'cancel_window', windowMsg(b));
  const source = SOURCES.has(req.headers.get('x-source')) ? req.headers.get('x-source') : 'web';
  const { biz, svc } = await loadBizSvc(env, b.business_id, b.service_id);
  const slot = await findSlot(env, biz, svc, body.start_at, { staffId: body.staff || b.staff_id, excludeId: b.id });
  if (!slot) return fail(409, 'slot_unavailable', 'That time is not available. Pick another one.');
  const start = new Date(slot._ms).toISOString(), end = new Date(slot._ms + b.duration_min * 60000).toISOString();
  const buf = b.buffer_min * 60000, lo = new Date(slot._ms - buf).toISOString(), hi = new Date(slot._ms + b.duration_min * 60000 + buf).toISOString();
  const ok = await sb(env, 'rpc/move_booking', { method: 'POST', body: { p: { id: b.id, business_id: b.business_id, staff_id: slot.staff_id, start_at: start, end_at: end, lo, hi, capacity: b.capacity } } });
  if (!ok) return fail(409, 'slot_unavailable', 'That time was just taken. Pick another one.');
  const nb = await getBooking(env, b.id);
  await logEvent(env, nb, 'rescheduled', source, { from: b.start_at, to: nb.start_at });
  notify(env, ctx, nb, 'rescheduled', source);
  return json(view(nb, origin));
}

async function cancel(env, req, b, origin, ctx) {
  if (b.status !== 'confirmed') return json(view(b, origin));
  if (windowClosed(b)) return fail(409, 'cancel_window', windowMsg(b));
  const source = SOURCES.has(req.headers.get('x-source')) ? req.headers.get('x-source') : 'web';
  await sb(env, 'bookings?' + q({ id: 'eq.' + b.id, status: 'eq.confirmed' }), { method: 'PATCH', body: { status: 'cancelled', updated_at: new Date().toISOString() }, headers: { prefer: 'return=minimal' } });
  const nb = await getBooking(env, b.id);
  await logEvent(env, nb, 'cancelled', source, { start_at: b.start_at });
  notify(env, ctx, nb, 'cancelled', source);
  return json(view(nb, origin));
}

async function list(env, req, url, origin) {
  const auth = req.headers.get('authorization') || '';
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) return fail(401, 'unauthorized', 'Bearer token required.');
  const biz = url.searchParams.get('business');
  if (!biz) return fail(400, 'business_required', 'business is required.');
  const from = url.searchParams.get('from'), status = url.searchParams.get('status'), phone = normPhone(url.searchParams.get('phone'));
  const rows = await sb(env, 'bookings_full?' + q({ business_id: 'eq.' + biz, start_at: 'gte.' + (isDate(from) ? from : new Date(Date.now() - 864e5).toISOString().slice(0, 10)),
    ...(status ? { status: 'eq.' + status } : {}), ...(phone ? { customer_phone: 'eq.' + phone } : {}), order: 'start_at.asc', limit: '500' }));
  return json({ business: biz, count: rows.length, bookings: rows.map((b) => view(b, origin)) });
}

export async function onRequest(ctx) {
  const { request: req, env, params } = ctx;
  const url = new URL(req.url), origin = url.origin, [res, id, extra] = params.route || [];
  try {
    if (res === 'availability' && req.method === 'GET') return await availability(env, url);
    if (res === 'bookings' && !id) {
      if (req.method === 'POST') return await create(env, req, origin, ctx);
      if (req.method === 'GET') return await list(env, req, url, origin);
    }
    if (res === 'bookings' && id && !extra) {
      const b = await getBooking(env, id);
      if (!b) return fail(404, 'booking_not_found', 'No such booking.');
      if (req.method === 'GET') return json(view(b, origin));
      if (req.method === 'PATCH') return await reschedule(env, req, b, origin, ctx);
      if (req.method === 'DELETE') return await cancel(env, req, b, origin, ctx);
    }
    if (res === 'coupons' && !id) {
      if (req.method === 'POST') return await claimCoupon(env, req, ctx);
      if (req.method === 'GET') return await listCoupons(env, req, url);
    }
    if (res === 'coupons' && id && !extra && req.method === 'PATCH') return await redeemCoupon(env, req, id);
    if (res === 'intake' && !id && req.method === 'POST') {
      try { return await intake(env, req, ctx); }
      catch (e) { console.error('intake api', errInfo(e)); return fail(500, 'internal', 'Something went wrong on our side.'); }   // codes only: no PII in logs
    }
    return fail(404, 'not_found', 'No such route.');
  } catch (e) {
    console.error('booking api', e);
    return fail(500, 'internal', 'Something went wrong on our side.');
  }
}
