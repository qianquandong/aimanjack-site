// Booking API — Cloudflare Pages Function, served at https://aimanjack.com/v1/* (BOOKING-PLAN.md §1–2).
//   GET    /v1/availability?business=&service=[&from=YYYY-MM-DD&to=YYYY-MM-DD&staff=]
//   POST   /v1/bookings            { business, service, start_at, customer_name, customer_phone, customer_email?, note?, staff? }
//   GET    /v1/bookings/:id
//   PATCH  /v1/bookings/:id        { start_at }                      reschedule
//   DELETE /v1/bookings/:id                                          cancel
//   GET    /v1/bookings?business=[&phone=&status=&from=]  (Authorization: Bearer ADMIN_TOKEN) read-only list; phone= finds a caller's bookings
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
async function sb(env, path, { method = 'GET', body, headers } = {}) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { method, body: body && JSON.stringify(body), headers: {
    apikey: env.SB_SECRET_KEY, authorization: `Bearer ${env.SB_SECRET_KEY}`, 'content-type': 'application/json',
    'accept-profile': 'booking', 'content-profile': 'booking', prefer: 'return=representation', ...headers } });
  const text = await r.text(), data = text ? JSON.parse(text) : null;
  if (!r.ok) { const e = new Error(`supabase ${r.status} ${path}: ${text}`); e.code = data?.code; throw e; }
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
  if (!r.ok) throw new Error(`email ${r.status}: ${(await r.text()).slice(0, 300)}`);
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
    return fail(404, 'not_found', 'No such route.');
  } catch (e) {
    console.error('booking api', e);
    return fail(500, 'internal', 'Something went wrong on our side.');
  }
}
