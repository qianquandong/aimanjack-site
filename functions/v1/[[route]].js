// Booking API — Cloudflare Pages Function, served at https://aimanjack.com/v1/* (BOOKING-PLAN.md §1–2).
//   GET    /v1/availability?business=&service=[&from=YYYY-MM-DD&to=YYYY-MM-DD&staff=]
//   POST   /v1/bookings            { business, service, start_at, customer_name, customer_phone, customer_email?, note?, staff? }
//   GET    /v1/bookings/:id
//   PATCH  /v1/bookings/:id        { start_at }                      reschedule
//   DELETE /v1/bookings/:id                                          cancel
//   GET    /v1/bookings?business=  (Authorization: Bearer ADMIN_TOKEN) read-only list
// Writes take an Idempotency-Key header and an X-Source header (web | voice | sms | admin; default web).
// Instants are stored as UTC ISO; responses render them in the business tz with an offset (ISO 8601).

const SOURCES = new Set(['web', 'voice', 'sms', 'admin']);
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status, error, message) => json({ error, message }, status);

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
  const biz = bizId && await env.DB.prepare('SELECT * FROM businesses WHERE id=?').bind(bizId).first();
  if (!biz) return { error: fail(404, 'business_not_found', 'Unknown business.') };
  const svc = svcId && await env.DB.prepare('SELECT * FROM services WHERE business_id=? AND id=? AND active=1').bind(bizId, svcId).first();
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
  const staffQ = 'SELECT id, name FROM staff WHERE business_id=? AND active=1' + (staffId ? ' AND id=?' : '');
  const staff = (await env.DB.prepare(staffQ).bind(...(staffId ? [biz.id, staffId] : [biz.id])).all()).results;
  const rules = (await env.DB.prepare('SELECT staff_id, weekday, start_hm, end_hm FROM availability_rules WHERE business_id=?').bind(biz.id).all()).results;
  const lo = new Date(localToUtc(from, '00:00', tz) - 864e5).toISOString(), hi = new Date(localToUtc(addDays(to, 1), '00:00', tz) + 864e5).toISOString();
  const blocks = (await env.DB.prepare('SELECT staff_id, start_at, end_at FROM blocks WHERE business_id=? AND end_at>? AND start_at<?').bind(biz.id, lo, hi).all()).results;
  const booked = (await env.DB.prepare("SELECT id, staff_id, start_at, end_at FROM bookings WHERE business_id=? AND status='confirmed' AND end_at>? AND start_at<?").bind(biz.id, lo, hi).all()).results
    .filter((b) => b.id !== excludeId);
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
        if (s < earliest || hits(blocks, st.id, s, e) || hits(booked, st.id, s - buf, e + buf) >= svc.capacity) continue;
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

const BOOKING_SQL = `SELECT b.*, s.name AS service_name, s.duration_min, s.buffer_min, s.capacity, st.name AS staff_name,
  bz.name AS business_name, bz.tz, bz.cancel_window_hours
  FROM bookings b JOIN businesses bz ON bz.id=b.business_id
  JOIN services s ON s.business_id=b.business_id AND s.id=b.service_id
  JOIN staff st ON st.business_id=b.business_id AND st.id=b.staff_id`;
const getBooking = (env, id) => env.DB.prepare(BOOKING_SQL + ' WHERE b.id=?').bind(id).first();

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
  env.DB.prepare('INSERT INTO events (business_id, booking_id, type, source, payload) VALUES (?,?,?,?,?)').bind(b.business_id, b.id, type, source, JSON.stringify(payload)).run();

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

async function create(env, req, origin) {
  const body = await req.json().catch(() => null);
  if (!body) return fail(400, 'bad_json', 'Body must be JSON.');
  const r = await loadBizSvc(env, body.business, body.service);
  if (r.error) return r.error;
  const { biz, svc } = r, source = SOURCES.has(req.headers.get('x-source')) ? req.headers.get('x-source') : 'web';
  const idem = clean(req.headers.get('idempotency-key'), 128) || null;
  if (idem) {
    const ex = await env.DB.prepare(BOOKING_SQL + ' WHERE b.business_id=? AND b.idempotency_key=?').bind(biz.id, idem).first();
    if (ex) return json(view(ex, origin), 200);
  }
  const name = clean(body.customer_name, 80), phone = normPhone(body.customer_phone);
  if (!name) return fail(400, 'name_required', 'customer_name is required.');
  if (!phone) return fail(400, 'phone_invalid', 'customer_phone must be a valid phone number.');
  const slot = await findSlot(env, biz, svc, body.start_at, { staffId: body.staff || undefined });
  if (!slot) return fail(409, 'slot_unavailable', 'That time is not available. Pick another one.');
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const start = new Date(slot._ms).toISOString(), end = new Date(slot._ms + svc.duration_min * 60000).toISOString();
  const buf = svc.buffer_min * 60000, lo = new Date(slot._ms - buf).toISOString(), hi = new Date(slot._ms + svc.duration_min * 60000 + buf).toISOString();
  let res;
  try {
    // Single conditional INSERT = atomic capacity check; no read-then-write race.
    res = await env.DB.prepare(`INSERT INTO bookings (id, business_id, service_id, staff_id, start_at, end_at, customer_name, customer_phone, customer_email, note, source, idempotency_key)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM bookings WHERE business_id=? AND staff_id=? AND status='confirmed' AND end_at>? AND start_at<?) < ?`)
      .bind(id, biz.id, svc.id, slot.staff_id, start, end, name, phone, clean(body.customer_email, 120) || null, clean(body.note, 500) || null, source, idem,
        biz.id, slot.staff_id, lo, hi, svc.capacity).run();
  } catch (e) {
    if (idem && /UNIQUE/.test(String(e))) { const ex = await env.DB.prepare(BOOKING_SQL + ' WHERE b.business_id=? AND b.idempotency_key=?').bind(biz.id, idem).first(); if (ex) return json(view(ex, origin), 200); }
    throw e;
  }
  if (!res.meta.changes) return fail(409, 'slot_unavailable', 'That time was just taken. Pick another one.');
  const b = await getBooking(env, id);
  await logEvent(env, b, 'created', source, { start_at: b.start_at, service: b.service_id, staff: b.staff_id });
  return json(view(b, origin), 201);
}

async function reschedule(env, req, b, origin) {
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
  const res = await env.DB.prepare(`UPDATE bookings SET start_at=?, end_at=?, staff_id=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id=? AND status='confirmed' AND (SELECT COUNT(*) FROM bookings WHERE business_id=? AND staff_id=? AND status='confirmed' AND id<>? AND end_at>? AND start_at<?) < ?`)
    .bind(start, end, slot.staff_id, b.id, b.business_id, slot.staff_id, b.id, lo, hi, b.capacity).run();
  if (!res.meta.changes) return fail(409, 'slot_unavailable', 'That time was just taken. Pick another one.');
  const nb = await getBooking(env, b.id);
  await logEvent(env, nb, 'rescheduled', source, { from: b.start_at, to: nb.start_at });
  return json(view(nb, origin));
}

async function cancel(env, req, b, origin) {
  if (b.status !== 'confirmed') return json(view(b, origin));
  if (windowClosed(b)) return fail(409, 'cancel_window', windowMsg(b));
  const source = SOURCES.has(req.headers.get('x-source')) ? req.headers.get('x-source') : 'web';
  await env.DB.prepare("UPDATE bookings SET status='cancelled', updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(b.id).run();
  const nb = await getBooking(env, b.id);
  await logEvent(env, nb, 'cancelled', source, { start_at: b.start_at });
  return json(view(nb, origin));
}

async function list(env, req, url, origin) {
  const auth = req.headers.get('authorization') || '';
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) return fail(401, 'unauthorized', 'Bearer token required.');
  const biz = url.searchParams.get('business');
  if (!biz) return fail(400, 'business_required', 'business is required.');
  const from = url.searchParams.get('from'), status = url.searchParams.get('status');
  const rows = (await env.DB.prepare(BOOKING_SQL + ' WHERE b.business_id=? AND b.start_at>=? ' + (status ? 'AND b.status=? ' : '') + 'ORDER BY b.start_at LIMIT 500')
    .bind(...[biz, isDate(from) ? from : new Date(Date.now() - 864e5).toISOString().slice(0, 10), ...(status ? [status] : [])]).all()).results;
  return json({ business: biz, count: rows.length, bookings: rows.map((b) => view(b, origin)) });
}

export async function onRequest({ request: req, env, params }) {
  const url = new URL(req.url), origin = url.origin, [res, id, extra] = params.route || [];
  try {
    if (res === 'availability' && req.method === 'GET') return await availability(env, url);
    if (res === 'bookings' && !id) {
      if (req.method === 'POST') return await create(env, req, origin);
      if (req.method === 'GET') return await list(env, req, url, origin);
    }
    if (res === 'bookings' && id && !extra) {
      const b = await getBooking(env, id);
      if (!b) return fail(404, 'booking_not_found', 'No such booking.');
      if (req.method === 'GET') return json(view(b, origin));
      if (req.method === 'PATCH') return await reschedule(env, req, b, origin);
      if (req.method === 'DELETE') return await cancel(env, req, b, origin);
    }
    return fail(404, 'not_found', 'No such route.');
  } catch (e) {
    console.error('booking api', e);
    return fail(500, 'internal', 'Something went wrong on our side.');
  }
}
