// Owner text inbox (2026-10-28, Jack: "那就自己做吧" — a do-it-ourselves OpenPhone for the Twilio numbers).
// Reads the conversations on our own Twilio numbers straight from Twilio's Messages API and lets Jack reply from the
// same number on /admin/texts/. Nothing is stored here: Twilio keeps the history, so no new table and no phone numbers
// or message text in our database, logs or repo. Inbound handling (the SMS agent's webhook) is untouched.
//   GET  /v1/admin/texts                  (admin or TEXTS_READ_TOKEN) conversation list, newest first
//   GET  /v1/admin/texts?with=+1XXXXXXXXXX (admin or TEXTS_READ_TOKEN) one conversation, oldest first
//   POST /v1/admin/texts {to, body, from?} (admin only) Jack's reply; `from` must be one of TEXT_NUMBERS
// Config: TEXT_NUMBERS (var, comma-separated E.164); secrets TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET
// (a Standard API key); optional TEXT_HIDE_NUMBERS (secret, counterparts to leave out, e.g. Jack's own phone that
// receives the line alerts); optional TEXTS_READ_TOKEN (32+ chars) for the cloud mailbox sync — it can read, never send.

const E164 = /^\+[1-9]\d{7,14}$/;
const MAX_BODY = 1600;
const PAGE = 100;
const list = (s) => String(s ?? '').split(',').map((x) => x.trim()).filter((x) => E164.test(x));
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status, error, extra = {}) => json({ error, ...extra }, status);

export const textNumbers = (env) => list(env.TEXT_NUMBERS);

export function textsConfigGap(env) {
  const missing = ['TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY', 'TWILIO_API_SECRET'].filter((k) => !(typeof env[k] === 'string' && env[k].trim()));
  if (!textNumbers(env).length) missing.push('TEXT_NUMBERS');
  return missing;
}

// Read-only scheduler credential, same shape as NOTIFICATION_PROCESS_TOKEN: GET only, never sends.
export const textsReaderOk = (env, req) => typeof env.TEXTS_READ_TOKEN === 'string' && env.TEXTS_READ_TOKEN.length >= 32 &&
  req.method === 'GET' && req.headers.get('authorization') === `Bearer ${env.TEXTS_READ_TOKEN}`;

async function twilio(env, path, { method = 'GET', form } = {}) {
  const sid = env.TWILIO_ACCOUNT_SID.trim();
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/${path}`, {
    method, signal: AbortSignal.timeout(10000),
    headers: { authorization: 'Basic ' + btoa(`${env.TWILIO_API_KEY.trim()}:${env.TWILIO_API_SECRET.trim()}`),
      ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error('twilio'), { status: r.status, code: data?.code ?? r.status });
  return data;
}
const messages = async (env, filter) => (await twilio(env, 'Messages.json?' + new URLSearchParams({ ...filter, PageSize: String(PAGE) }))).messages ?? [];

// One Twilio message → what the page needs. `in` = the other person wrote to us.
export function shape(m, own) {
  const inbound = own.includes(m.to) && !own.includes(m.from);
  return { sid: m.sid, direction: inbound ? 'in' : 'out', with: inbound ? m.from : m.to, via: inbound ? m.to : m.from,
    body: String(m.body ?? ''), media: Number(m.num_media) || 0, status: m.status, error_code: m.error_code ?? null,
    at: new Date(m.date_sent || m.date_created).toISOString() };
}

// Group into one row per other person, newest conversation first. `via` is the number they last used with us,
// so a reply goes out from the line they know.
export function threads(rows, hide = []) {
  const by = new Map();
  for (const m of rows) {
    if (hide.includes(m.with)) continue;
    const t = by.get(m.with) ?? { with: m.with, via: m.via, count: 0, last: null, last_in_at: null };
    t.count++;
    if (!t.last || m.at > t.last.at) { t.last = { body: m.body.slice(0, 140), media: m.media, direction: m.direction, at: m.at }; t.via = m.via; }
    if (m.direction === 'in' && (!t.last_in_at || m.at > t.last_in_at)) t.last_in_at = m.at;
    by.set(m.with, t);
  }
  return [...by.values()].sort((a, b) => (a.last.at < b.last.at ? 1 : -1));
}

const dedupe = (rows) => [...new Map(rows.map((m) => [m.sid, m])).values()];

export async function textsRoute({ env, req, url, admin }) {
  const reader = textsReaderOk(env, req);
  if (!admin && !reader) return fail(401, 'unauthorized');
  const missing = textsConfigGap(env);
  if (missing.length) return fail(503, 'texts_not_configured', { missing });
  const own = textNumbers(env), hide = list(env.TEXT_HIDE_NUMBERS);
  try {
    if (req.method === 'GET') {
      const peer = url.searchParams.get('with');
      if (peer !== null) {
        if (!E164.test(peer)) return fail(400, 'bad_number');
        if (hide.includes(peer)) return json({ with: peer, via: own[0], messages: [] });
        const pages = await Promise.all(own.flatMap((n) => [messages(env, { From: peer, To: n }), messages(env, { From: n, To: peer })]));
        const rows = dedupe(pages.flat()).map((m) => shape(m, own)).sort((a, b) => (a.at < b.at ? -1 : 1));
        return json({ with: peer, via: rows.length ? rows[rows.length - 1].via : own[0], messages: rows });
      }
      const pages = await Promise.all(own.flatMap((n) => [messages(env, { To: n }), messages(env, { From: n })]));
      return json({ numbers: own, threads: threads(dedupe(pages.flat()).map((m) => shape(m, own)), hide) });
    }
    if (req.method === 'POST') {
      if (!admin) return fail(401, 'unauthorized');
      const b = await req.json().catch(() => null);
      const to = String(b?.to ?? '').trim(), text = String(b?.body ?? '').trim(), from = String(b?.from ?? own[0]).trim();
      if (!E164.test(to) || own.includes(to)) return fail(400, 'bad_number');
      if (!own.includes(from)) return fail(400, 'bad_from');
      if (!text || text.length > MAX_BODY) return fail(400, 'bad_body');
      const m = await twilio(env, 'Messages.json', { method: 'POST', form: { To: to, From: from, Body: text } });
      return json({ sent: shape(m, own) });
    }
    return fail(405, 'method_not_allowed');
  } catch (e) {
    console.error('texts api', e?.message === 'twilio' ? `twilio ${e.status} ${e.code}` : String(e?.name ?? 'error'));   // codes only
    return fail(502, req.method === 'POST' ? 'send_failed' : 'twilio_unavailable', { code: e?.code ?? null });
  }
}
