// Booking notifications with a durable ledger (GitHub qianquandong/revenue-os#2).
//
// Before: notify() fired emails inside waitUntil and only console.error'd failures — a booking could succeed while every
// email silently failed, and a 200 from the provider was treated as delivered even when the address bounced.
//
// Now:
//   * every notification is a row in booking.notifications BEFORE anything is sent (dedupe_key = booking state + recipient
//     ⇒ one message per event per recipient, ever; each OWNER_EMAIL inbox is its own recipient); the booking itself never
//     depends on email;
//   * a row is CLAIMED with an optimistic-concurrency update before sending, so two workers can never both send it;
//   * the provider's per-recipient result is recorded: delivered (accepted by the recipient's mail server — NOT proof it
//     reached the inbox), queued, bounced (permanent, alert, never retried); transport/HTTP errors retry with backoff
//     up to MAX_ATTEMPTS, then 'dead' (alert);
//   * a row stuck in 'sending' (worker died mid-send), or whose request died on the network, becomes 'uncertain' and is
//     NOT retried automatically — the message may already have gone out; the owner decides (no duplicate emails);
//   * a newer message to the same recipient about the same booking supersedes an unsent older one (never out of order);
//   * missing configuration (token, sender, OWNER_EMAIL) is recorded as a failure with the missing name — never silent.
// Addresses live only in the database (like the bookings themselves); logs and alerts carry ids and codes only.

import { m365Config, m365ConfigGap, m365Send, m365KeepAlive } from './m365-mail.mjs';

export const BOOKING_FROM_DEFAULT = 'booking-no-reply@aimanjack.com';
export const BOOKING_REPLY_TO_DEFAULT = 'jack@aimanjack.com';
export const MAX_ATTEMPTS = 5;
export const BACKOFF_MIN = [1, 5, 30, 120];             // minutes before attempts 2..5
export const STALE_SENDING_MIN = 10;
export const CONFIG_RETRY_MIN = 30;                      // configuration gaps wait (without using up attempts) until fixed
export const ALERT_FAILED_AFTER_MIN = 30;                // a row still failing after this long alerts the owner once
// Explicit choice (issue #2 §5): when the OWNER makes a change from the admin side, the customer is still told; the
// owner does not get a notice about their own action. Every other source notifies both.
export const OWNER_NOTIFIED_SOURCES = new Set(['web', 'voice', 'sms']);
// Abuse guard (the site now sends from Jack's real mailbox — a flood would get the whole mailbox blocked):
export const MAIL_DAILY_CAP_DEFAULT = 40;                // all site mail per rolling 24 h (env MAIL_DAILY_CAP overrides)
export const RECIPIENT_DAILY_CAP = 4;                    // per customer address per rolling 24 h (owner inboxes exempt)
export const CUSTOMER_STALE_HOURS = 24;                  // a customer email still unsent after this is expired, not sent late
// Batch sizes keep one invocation under the Workers Free limit of 50 subrequests (≈5–8 per message).
export const BATCH = { afterWrite: 1, sweep: 3, process: 6 };

const nowIso = (ms = Date.now()) => new Date(ms).toISOString();
const plusMin = (ms, m) => nowIso(ms + m * 60000);
const short = (s, n = 240) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, n);

// OWNER_EMAIL may name several owner inboxes, separated by commas (semicolons/whitespace also accepted), e.g.
// "jack@aimanjack.com, someone@gmail.com". Each inbox gets its OWN message and ledger row, so one bouncing address can
// never hide or block the other.
export const MAX_OWNER_RECIPIENTS = 5;
const EMAIL_RE = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/;
export const isEmail = (a) => typeof a === 'string' && a.length <= 254 && EMAIL_RE.test(a.trim());

/** Parse OWNER_EMAIL → { list (valid, de-duplicated case-insensitively, at most MAX_OWNER_RECIPIENTS), invalid, dropped }. */
export function parseOwnerEmails(raw) {
  const seen = new Set(); const list = []; let invalid = 0, dropped = 0;
  for (const part of String(raw ?? '').split(/[,;\s]+/)) {
    const a = part.trim();
    if (!a) continue;
    if (a.length > 254 || !EMAIL_RE.test(a)) { invalid += 1; continue; }
    const k = a.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (list.length >= MAX_OWNER_RECIPIENTS) { dropped += 1; continue; }
    list.push(a);
  }
  return { list, invalid, dropped };
}

/** j***k@aimanjack.com — enough for the owner to recognise an address without exposing it. */
export function maskEmail(a) {
  if (!a) return null;
  const [l, d] = String(a).split('@');
  return d ? `${l.slice(0, 1)}***${l.length > 1 ? l.slice(-1) : ''}@${d}` : '***';
}

/** Stable short tag for a recipient (FNV-1a of the lower-cased address) — keeps addresses out of dedupe keys. */
export function recipientTag(addr) {
  if (!addr) return 'none';
  let h = 0x811c9dc5;
  for (const ch of String(addr).toLowerCase()) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

/**
 * Mail transport: 'm365' (owner decision 2026-10-09: Jack's Microsoft 365 mailbox via Graph, see src/m365-mail.mjs) or
 * 'cloudflare' (Cloudflare Email Sending REST; needs Workers Paid — not used).
 */
export const mailTransport = (env) => (env.MAIL_TRANSPORT === 'm365' ? 'm365' : 'cloudflare');

/** Static setup gap of the active transport (null = settings complete; an M365 connection is checked at send time). */
export function transportGap(env) {
  if (mailTransport(env) === 'm365') return m365ConfigGap(env);
  if (!env.CF_EMAIL_TOKEN) return 'config_missing:CF_EMAIL_TOKEN';
  if (!env.CF_ACCOUNT_ID) return 'config_missing:CF_ACCOUNT_ID';
  return null;
}

/** Effective sender settings (booking lane). With M365 the sender is always the connected mailbox (M365_SENDER). */
export function bookingMailConfig(env) {
  const owners = parseOwnerEmails(env.OWNER_EMAIL).list;
  const m365 = mailTransport(env) === 'm365';
  return {
    transport: mailTransport(env),
    from: m365 ? m365Config(env).sender : (env.BOOKING_EMAIL_FROM || BOOKING_FROM_DEFAULT),
    replyTo: env.BOOKING_REPLY_TO || BOOKING_REPLY_TO_DEFAULT,
    ownerTos: owners,
    token: !!env.CF_EMAIL_TOKEN, account: !!env.CF_ACCOUNT_ID,
  };
}

/** Owner-safe view of the effective configuration (no secrets, owner addresses masked). */
export function describeMailConfig(env) {
  const c = bookingMailConfig(env);
  const o = parseOwnerEmails(env.OWNER_EMAIL);
  return { transport: c.transport, booking_from: c.from, booking_reply_to: c.replyTo,
    owner_email: maskEmail(o.list[0]), owner_emails: o.list.map(maskEmail), owner_email_count: o.list.length,
    owner_email_domain: o.list[0]?.split('@')[1] ?? null,
    ...(o.invalid ? { owner_email_invalid_entries: o.invalid } : {}),
    ...(o.dropped ? { owner_email_over_limit_ignored: o.dropped } : {}),
    coupon_from: c.transport === 'm365' ? c.from : (env.EMAIL_FROM || null), transport_setup_gap: transportGap(env),
    ...(c.transport === 'cloudflare' ? { cf_email_token_present: c.token, cf_account_id_present: c.account } : {}),
    note: `owner_emails are masked; compare them with the addresses you expect (comma-separated in OWNER_EMAIL, at most ${MAX_OWNER_RECIPIENTS}). Values come from the running deployment.` };
}

/** Build the messages for one booking event. Pure; returns [{role, to, subject, text, reply_to}] (to may be null ⇒ config gap). */
export function composeMessages(env, b, kind, source, { fmtWhen, prettyPhone, manageUrl, siteOrigin }) {
  const c = bookingMailConfig(env);
  const when = fmtWhen(b), phone = prettyPhone(b.customer_phone);
  const out = [];
  const custEmail = isEmail(b.customer_email) ? b.customer_email.trim() : null;   // never send to / reply to a malformed address
  if (custEmail) {
    const subject = { created: `Confirmed: your ${b.service_name} with Jack, ${when}`, rescheduled: `Moved: your ${b.service_name} is now ${when}`, cancelled: `Cancelled: your ${b.service_name} on ${when}` }[kind];
    const line = { created: `You're booked. Jack will call ${phone} on ${when}.`, rescheduled: `Your call is moved. Jack will call ${phone} on ${when}.`, cancelled: `Your call on ${when} is cancelled. Book a new time any time.` }[kind];
    const manage = kind === 'cancelled' ? `Book again: ${siteOrigin}/book/` : `Change or cancel (up to ${b.cancel_window_hours}h before): ${manageUrl}`;
    out.push({ role: 'customer', to: custEmail, reply_to: c.replyTo, subject,
      text: `Hi ${b.customer_name},\n\n${line}\n\n${manage}\n\nQuestions? Just reply to this email.\n\nJack\nAI Man Jack` });
  }
  if (OWNER_NOTIFIED_SOURCES.has(source)) {
    const head = `${kind} (${source}): ${b.service_name} ${when}`;
    const who = `${b.customer_name} · ${phone}${b.customer_email ? ' · ' + b.customer_email : ''}${b.customer_email && !custEmail ? ' (invalid address — no confirmation sent)' : ''}`;
    const text = [head, who, b.note, manageUrl, `All upcoming bookings: ${siteOrigin}/admin/bookings/`].filter(Boolean).join('\n');
    // One message per owner inbox; none configured ⇒ one row with to=null, recorded as config_missing (never silent).
    for (const to of (c.ownerTos.length ? c.ownerTos : [null])) {
      out.push({ role: 'owner', to, reply_to: custEmail || undefined, subject: `[booking] ${head}`, text });
    }
  }
  return out;
}

/** Interpret Cloudflare Email Sending's response for one recipient. */
export function classifyProviderResult(status, body) {
  // One recipient per call, so a non-empty list is about that recipient (no fragile address matching).
  const n = (arr) => Array.isArray(arr) && arr.length > 0;
  if (status >= 200 && status < 300 && body?.success !== false) {
    const r = body?.result ?? {};
    if (n(r.permanent_bounces)) return { status: 'bounced', retry: false, error: 'permanent_bounce' };
    if (n(r.delivered)) return { status: 'delivered', retry: false };
    if (n(r.queued)) return { status: 'queued', retry: false };
    return { status: 'queued', retry: false, error: 'accepted_without_per_recipient_result' };
  }
  const code = body?.errors?.[0]?.code ?? null; const msg = body?.errors?.[0]?.message ?? '';
  // 429 / 5xx ⇒ the provider says it did not take the message: retry. 4xx (bad sender, token, schema, disabled zone) ⇒
  // retried too because the usual fix is configuration, but it dies after MAX_ATTEMPTS.
  return { status: 'failed', retry: true, error: short(`http_${status}${code ? ' code_' + code : ''} ${msg}`) };
}

async function cfSend(env, msg, fetchImpl) {
  const c = bookingMailConfig(env);
  let r;
  try {
    r = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
      method: 'POST', headers: { authorization: `Bearer ${env.CF_EMAIL_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ to: msg.to, from: { address: c.from, name: 'AI Man Jack' }, reply_to: msg.reply_to, subject: msg.subject, text: msg.text,
        html: `<pre style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap;margin:0">${String(msg.text).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))}</pre>` }),
    });
  } catch (e) {
    if (/too many subrequests/i.test(String(e?.message ?? ''))) return { status: 'failed', retry: true, error: 'subrequest_limit_not_sent' };
    // The request may have reached the provider before the connection failed, and the API has no idempotency key or
    // message id: resending could duplicate. Never auto-retry — the owner decides (no duplicate emails).
    return { status: 'uncertain', retry: false, error: short('network_error_after_request ' + (e?.name || 'Error')) };
  }
  let body = null; const text = await r.text().catch(() => '');
  try { body = text ? JSON.parse(text) : null; } catch { body = null; }
  return { ...classifyProviderResult(r.status, body), provider: body?.result ? { delivered: (body.result.delivered || []).length, queued: (body.result.queued || []).length, permanent_bounces: (body.result.permanent_bounces || []).length } : null };
}

const configGap = (env, msg) => {
  const t = transportGap(env); if (t) return t;
  if (!msg.to) return msg.role === 'owner' ? 'config_missing:OWNER_EMAIL' : 'no_customer_email';
  return null;
};

/**
 * Ledger operations over an injected `db` (the Supabase PostgREST helper `sb`, or a fake in tests):
 *   db(path, {method, body, headers}) → rows
 */
export function createNotifier({ db, env, fetchImpl = (...a) => fetch(...a), alert = null, log = (...a) => console.error(...a) }) {
  /**
   * dedupe_key is derived from the BOOKING STATE, not the event: a double-submitted cancel or two identical concurrent
   * reschedules map to the same key, so the customer never gets two copies.
   *   created   → <booking>:created:<role>                      (once per booking)
   *   cancelled → <booking>:cancelled:<role>                    (terminal, once)
   *   rescheduled → <booking>:rescheduled:<from>-><to>:<minute>:<role>
   * <role> is `customer`, or `owner.<recipientTag>` (one per owner inbox; `owner.none` = OWNER_EMAIL not configured).
   */
  const roleKey = (m) => (m.role === 'owner' ? `owner.${recipientTag(m.to)}` : m.role);
  const dedupeKey = (b, kind, m, meta = {}) => kind === 'rescheduled'
    ? `${b.id}:rescheduled:${meta.from ?? ''}->${b.start_at}:${Math.floor(Date.now() / 60000)}:${roleKey(m)}` : `${b.id}:${kind}:${roleKey(m)}`;
  const insert = (rows) => db('notifications?on_conflict=dedupe_key', { method: 'POST', body: rows, headers: { prefer: 'resolution=ignore-duplicates,return=representation' } });
  const enqueue = async (b, eventId, kind, messages, meta = {}) => {
    if (!messages.length) return [];
    const rows = messages.map((m) => ({ business_id: b.business_id, booking_id: b.id, event_id: eventId ?? null, kind, role: m.role,
      dedupe_key: dedupeKey(b, kind, m, meta), to_address: m.to, reply_to: m.reply_to ?? null, subject: m.subject, body_text: m.text,
      status: 'pending', attempts: 0, next_attempt_at: nowIso() }));
    // on_conflict + ignore-duplicates: a replayed or double-submitted event never creates a second message.
    return insert(rows);
  };

  /**
   * An owner notice recorded while OWNER_EMAIL was unset (to_address null) is re-addressed once the setting exists:
   * one new row per configured inbox (same content, dedupe key with the real recipient tag, so concurrent workers
   * cannot create duplicates), and the placeholder row is closed as superseded. Without this, such a row would keep
   * failing with config_missing forever even after the owner fixed the setting.
   */
  async function readdressOwnerGap(row, owners) {
    const copies = owners.map((to) => ({ business_id: row.business_id, booking_id: row.booking_id, event_id: row.event_id ?? null, kind: row.kind, role: 'owner',
      dedupe_key: /owner\.none$/.test(row.dedupe_key) ? row.dedupe_key.replace(/owner\.none$/, `owner.${recipientTag(to)}`) : `${row.dedupe_key}:${recipientTag(to)}`,
      to_address: to, reply_to: row.reply_to ?? null, subject: row.subject, body_text: row.body_text, status: 'pending', attempts: 0, next_attempt_at: nowIso() }));
    const created = (await insert(copies)) ?? [];
    await db(`notifications?id=eq.${row.id}&status=in.(pending,failed)`, { method: 'PATCH', headers: { prefer: 'return=minimal' },
      body: { status: 'superseded', last_error: 'readdressed_to_configured_owner_email', updated_at: nowIso() } });
    for (const r of created) await attempt(r);
    return 'readdressed';
  }

  async function claim(row) {
    const got = await db(`notifications?id=eq.${row.id}&status=eq.${row.status}&attempts=eq.${row.attempts}`, {
      method: 'PATCH', body: { status: 'sending', attempts: row.attempts + 1, claimed_at: nowIso(), updated_at: nowIso() }, headers: { prefer: 'return=representation' } });
    return got?.[0] ?? null;
  }

  async function finish(row, res) {
    let attempts = row.attempts; // already incremented by claim
    let status = res.status; let next = null;
    if (res.configGap) { attempts -= 1; next = plusMin(Date.now(), CONFIG_RETRY_MIN); }   // waits for the fix; never dies of it
    else if (res.retry) { if (attempts >= MAX_ATTEMPTS) status = 'dead'; else next = plusMin(Date.now(), BACKOFF_MIN[attempts - 1] ?? BACKOFF_MIN.at(-1)); }
    await db(`notifications?id=eq.${row.id}&status=eq.sending`, { method: 'PATCH', headers: { prefer: 'return=minimal' },
      body: { status, attempts, last_error: res.error ?? null, provider_result: res.provider ?? null, next_attempt_at: next ?? row.next_attempt_at,
        sent_at: ['delivered', 'queued', 'bounced'].includes(status) ? nowIso() : null, updated_at: nowIso() } });
    if ((status === 'bounced' || status === 'dead' || status === 'uncertain') && alert) {
      try { await alert(`Booking email ${status}: notification #${row.id} (${row.role}, ${row.kind}) — ${String(res.error ?? '').split(' ')[0]}. Open /admin/bookings/.`); } catch { /* best effort */ }
    }
    if (status !== 'delivered' && status !== 'queued') log('booking notification', row.id, row.role, row.kind, status, String(res.error ?? '').split(' ')[0]);
    return status;
  }

  const reconnectAlert = alert ? (code) => alert(`Microsoft 365 connection needs renewing (${String(code).split(' ')[0]}): booking emails are waiting. Open /admin/bookings/ → Reconnect.`) : null;

  /** Send one claimed-able row. Never throws. */
  async function attempt(row) {
    try {
      // A newer message to the same recipient about the same booking makes this one obsolete (e.g. a "Confirmed" retry
      // after the booking was cancelled): never send it out of order. Scoped to the recipient, so the two owner inboxes
      // of one event never supersede each other. An unaddressed owner placeholder is obsolete once ANY newer owner row exists.
      const sameRecipient = row.to_address == null ? '' : `&to_address=eq.${encodeURIComponent(row.to_address)}`;
      const newer = await db(`notifications?booking_id=eq.${row.booking_id}&role=eq.${row.role}${sameRecipient}&id=gt.${row.id}&select=id&limit=1`);
      if (newer?.length) {
        await db(`notifications?id=eq.${row.id}&status=in.(pending,failed)`, { method: 'PATCH', headers: { prefer: 'return=minimal' }, body: { status: 'superseded', updated_at: nowIso() } });
        return 'superseded';
      }
      if (row.role === 'owner' && row.to_address == null) {
        const owners = bookingMailConfig(env).ownerTos;
        if (owners.length) return await readdressOwnerGap(row, owners);
      }
      const byOwner = row.last_error === 'requeued_by_owner';
      // A customer email that could not go out for a day (e.g. before the mailbox was connected) is not sent late:
      // "Confirmed" for an appointment that may already be over helps nobody. The owner can still resend it.
      if (row.role === 'customer' && !byOwner && Date.parse(row.created_at) < Date.now() - CUSTOMER_STALE_HOURS * 3600000) {
        await db(`notifications?id=eq.${row.id}&status=in.(pending,failed)`, { method: 'PATCH', headers: { prefer: 'return=minimal' }, body: { status: 'expired', last_error: 'too_old_not_sent', updated_at: nowIso() } });
        return 'expired';
      }
      if (row.to_address) {
        const cap = Math.max(1, Number(env.MAIL_DAILY_CAP) || MAIL_DAILY_CAP_DEFAULT);
        const recent = await db(`notifications?select=to_address&status=in.(queued,delivered,bounced)&sent_at=gte.${nowIso(Date.now() - 86400000)}&limit=${cap + 1}`);
        if ((recent?.length ?? 0) >= cap) {
          await db(`notifications?id=eq.${row.id}&status=in.(pending,failed)`, { method: 'PATCH', headers: { prefer: 'return=minimal' },
            body: { status: 'failed', last_error: 'daily_send_cap_reached', next_attempt_at: plusMin(Date.now(), CONFIG_RETRY_MIN), updated_at: nowIso() } });
          return 'deferred_daily_cap';
        }
        const toSame = (recent ?? []).filter((r) => String(r.to_address ?? '').toLowerCase() === row.to_address.toLowerCase()).length;
        if (row.role === 'customer' && !byOwner && toSame >= RECIPIENT_DAILY_CAP) {
          const held = await db(`notifications?id=eq.${row.id}&status=in.(pending,failed)`, { method: 'PATCH', headers: { prefer: 'return=representation' }, body: { status: 'held', last_error: 'recipient_daily_cap', updated_at: nowIso() } });
          if (held?.length && alert) { try { await alert(`Booking email held: notification #${row.id} — this address already got ${toSame} emails in 24 h (possible abuse). Open /admin/bookings/ to release it.`); } catch { /* best effort */ } }
          return 'held';
        }
      }
      const claimed = await claim(row);
      if (!claimed) return 'skipped_claimed_elsewhere';
      const msg = { role: claimed.role, to: claimed.to_address, reply_to: claimed.reply_to ?? undefined, subject: claimed.subject, text: claimed.body_text };
      const gap = configGap(env, msg);
      const res = gap ? { status: 'failed', retry: true, configGap: true, error: gap }
        : mailTransport(env) === 'm365' ? await m365Send(env, msg, { db, fetchImpl, onReconnectRequired: reconnectAlert }) : await cfSend(env, msg, fetchImpl);
      return await finish(claimed, res);
    } catch (e) { log('booking notification error', row?.id, short(e?.message, 80)); return 'error'; }
  }

  /** Mark rows stuck in 'sending' as 'uncertain' (no automatic resend), then send everything due. */
  async function processDue({ limit = BATCH.process } = {}) {
    if (mailTransport(env) === 'm365') await m365KeepAlive(env, db, fetchImpl, { onReconnectRequired: reconnectAlert }).catch(() => {});
    const stale = nowIso(Date.now() - STALE_SENDING_MIN * 60000);
    const stuck = await db(`notifications?status=eq.sending&claimed_at=lt.${stale}`, { method: 'PATCH', headers: { prefer: 'return=representation' },
      body: { status: 'uncertain', last_error: 'worker_stopped_mid_send_may_have_been_sent', updated_at: nowIso() } }).catch(() => []);
    if (stuck?.length && alert) { try { await alert(`Booking email uncertain: ${stuck.length} notification(s) may or may not have been sent. Review /admin/bookings/.`); } catch { /* best effort */ } }
    const old = nowIso(Date.now() - ALERT_FAILED_AFTER_MIN * 60000);
    const lingering = await db(`notifications?status=eq.failed&created_at=lt.${old}&alerted_at=is.null`, { method: 'PATCH', headers: { prefer: 'return=representation' },
      body: { alerted_at: nowIso() } }).catch(() => []);
    if (lingering?.length && alert) {
      const codes = [...new Set(lingering.map((r) => String(r.last_error ?? '').split(' ')[0]))].join(', ');
      try { await alert(`Booking email still failing: ${lingering.length} notification(s) (${codes}). Open /admin/bookings/.`); } catch { /* best effort */ }
    }
    const due = await db(`notifications?status=in.(pending,failed)&next_attempt_at=lte.${nowIso()}&order=next_attempt_at.asc&limit=${limit}`);
    const results = [];
    for (const row of due) results.push({ id: row.id, status: await attempt(row) });
    return { uncertain: stuck?.length ?? 0, processed: results };
  }

  /** Requeue specific rows by id (owner action from the admin page), including 'dead' and 'uncertain' ones. */
  async function requeue(ids, { includeBounced = false } = {}) {
    const clean = ids.map(Number).filter(Number.isInteger);
    if (!clean.length) return [];
    // Bounced addresses are not resent unless the owner explicitly says so (repeated hard bounces hurt the sender).
    const states = includeBounced ? 'dead,uncertain,failed,held,expired,bounced' : 'dead,uncertain,failed,held,expired';
    return db(`notifications?id=in.(${clean.join(',')})&status=in.(${states})`, { method: 'PATCH', headers: { prefer: 'return=representation' },
      body: { status: 'pending', attempts: 0, alerted_at: null, next_attempt_at: nowIso(), last_error: 'requeued_by_owner', updated_at: nowIso() } });
  }

  return { enqueue, attempt, processDue, requeue };
}

/** ntfy-compatible alert (optional): POST text to env.ALERT_NTFY_URL with optional bearer. Carries no personal data. */
export function alertFromEnv(env, fetchImpl = (...a) => fetch(...a)) {
  if (!env.ALERT_NTFY_URL) return null;
  return async (text) => {
    await fetchImpl(env.ALERT_NTFY_URL, { method: 'POST', body: text, headers: { title: 'AI Man Jack booking email', ...(env.ALERT_NTFY_TOKEN ? { authorization: `Bearer ${env.ALERT_NTFY_TOKEN}` } : {}) } });
  };
}
