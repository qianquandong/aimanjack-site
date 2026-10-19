// Consent rules (PR01, 2026-10-19; M01/M02 of the enterprise plan). Pure functions, no I/O.
// Mirrors revenue.consent_effective / revenue.consent_allows in db/migrations/2026-10-19-consent-scope.sql;
// tests/consent-scope.test.mjs runs both on the same cases so they cannot drift apart.
// Not wired into any request path yet: intake keeps calling record_intake exactly as before.
//
// Owner decisions: 行云 is the only CRM (D2). aimanjack.com and RAUC (realagentusecases.com, on Substack) marketing
// consent are separate (D3): a permission for one brand, channel or purpose never implies another.

export const BRANDS = ['aimanjack', 'rauc'];
export const CHANNELS = ['email'];
// request_contact: handle this one request. kit_sequence: the short Rollout Kit series. newsletter: long-term marketing.
// analytics and transactional are recorded for completeness; they never authorise marketing.
export const PURPOSES = ['request_contact', 'kit_sequence', 'newsletter', 'analytics', 'transactional'];
export const MARKETING_PURPOSES = ['kit_sequence', 'newsletter'];
export const DECISIONS = ['granted', 'not_granted', 'withdrawn'];

// Identity key, unchanged since 2026-10-08 (functions/v1/[[route]].js emailHmac): trim + lowercase only. Dots, plus tags and
// provider aliases are kept: two spellings are two identities until a reviewed merge says otherwise.
export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();
export async function identityKey(secret, email) {
  if (!secret) return null;   // never an unsalted hash
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode('subject:' + normalizeEmail(email)));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Ledger rows as stored: { event_id, subject_email_hash, consent_type, granted, decision?, brand?, channel?, source?,
// occurred_at, source_occurred_at? }. Timestamps may be Date objects or ISO strings.
export const decisionOf = (e) => e.decision ?? (e.granted ? 'granted' : 'not_granted');
const ms = (t) => {
  if (t == null) return null;
  const v = Math.floor(new Date(t).getTime());
  if (!Number.isFinite(v)) throw new Error('invalid_consent_event');
  return v;
};
// Same as revenue.consent_event_time, at millisecond precision. Grants carry only our receipt time (see assertValid); a
// withdrawal counts from the later of its source time and receipt time. Clock errors can only keep marketing off.
export const eventTime = (e) => {
  const received = ms(e.occurred_at), source = ms(e.source_occurred_at) ?? received;
  return decisionOf(e) === 'withdrawn' ? Math.max(source, received) : Math.min(source, received);
};
// Rows the database rejects (checks in db/migrations/2026-10-19-consent-scope.sql) are not guessed at: the whole answer fails
// closed. Supported domain = rows the database accepts; timestamps are compared at millisecond precision on both sides.
const SKEW_MS = 5 * 60 * 1000;
export const GRANT_SOURCES = ['quote_form', 'kit_form', 'owner_manual'];   // fresh, first-party actions only
function assertValid(e) {
  const d = decisionOf(e);
  if (ms(e.occurred_at) === null || !DECISIONS.includes(d) || (e.decision != null && (d === 'granted') !== Boolean(e.granted))
    || !BRANDS.includes(e.brand ?? 'aimanjack') || !CHANNELS.includes(e.channel ?? 'email') || !PURPOSES.includes(e.consent_type)
    || (e.source_occurred_at != null && ms(e.source_occurred_at) > ms(e.occurred_at) + SKEW_MS)
    || (Boolean(e.granted) && (!GRANT_SOURCES.includes(e.source ?? 'quote_form') || e.source_occurred_at != null))) throw new Error('invalid_consent_event');
}

// State for one identity × brand × channel × purpose: 'granted' | 'withdrawn' | 'suppressed' | 'erased' | 'none'.
// Same rules, in the same order, as revenue.consent_effective (db/migrations/2026-10-19-consent-scope.sql):
//   suppressed: provider tombstone for aimanjack.com email marketing; nothing in the ledger clears it.
//   erased: an erasure voids everything at or before it; afterwards only a withdrawal or an owner-reviewed recovery
//           (source 'owner_manual', granted) counts, and events after that recovery count again.
//   latest granted/withdrawn wins by eventTime; on a tie the withdrawal wins, then the higher event_id.
//   'not_granted' (unticked box) never changes the state. Rows of any other identity, or without one, are ignored.
//   A tombstone or an erasure decides even with no row for the scope. Malformed rows throw (allowsMarketing → false).
export function effectiveState(events, { subject, brand, channel = 'email', purpose, suppressed = false }) {
  if (!subject) return 'none';
  const own = events.filter((e) => e.subject_email_hash === subject);
  const erasures = own.filter((e) => e.consent_type === 'erasure').map((e) => ms(e.occurred_at));
  if (erasures.some((t) => t === null)) throw new Error('invalid_consent_event');
  const erasedAt = erasures.length ? Math.max(...erasures) : null;
  own.filter((e) => e.consent_type !== 'erasure').forEach(assertValid);   // any malformed row for this person fails the answer
  const scoped = own.filter((e) => e.consent_type !== 'erasure' && (e.brand ?? 'aimanjack') === brand
    && (e.channel ?? 'email') === channel && e.consent_type === purpose);
  // A tombstone or an erasure decides even when this scope has no ledger row (same as the view's keys).
  if (brand === 'aimanjack' && channel === 'email' && MARKETING_PURPOSES.includes(purpose) && suppressed) return 'suppressed';
  if (!scoped.length) return erasedAt !== null && BRANDS.includes(brand) && channel === 'email' && PURPOSES.includes(purpose) ? 'erased' : 'none';
  const recoveries = erasedAt === null ? [] : scoped
    .filter((e) => (e.source ?? null) === 'owner_manual' && decisionOf(e) === 'granted' && eventTime(e) > erasedAt).map(eventTime);
  const recoveredAt = recoveries.length ? Math.min(...recoveries) : null;
  const live = scoped.filter((e) => erasedAt === null
    || (eventTime(e) > erasedAt && (decisionOf(e) === 'withdrawn' || (recoveredAt !== null && eventTime(e) >= recoveredAt))));
  const decisive = live.filter((e) => ['granted', 'withdrawn'].includes(decisionOf(e))).sort((a, b) =>
    eventTime(b) - eventTime(a) || (decisionOf(b) === 'withdrawn') - (decisionOf(a) === 'withdrawn') || b.event_id - a.event_id)[0];
  if (decisive) return decisionOf(decisive);
  return erasedAt !== null ? 'erased' : 'none';
}

// The only question a marketing sender may ask. Request handling, analytics or transactional notices never qualify,
// and a missing identity never does.
export function allowsMarketing(events, scope) {
  if (!scope?.subject || !MARKETING_PURPOSES.includes(scope.purpose)) return false;
  try { return effectiveState(events, scope) === 'granted'; } catch { return false; }   // malformed input never allows
}

// Server-side consent evidence for a form submission: the request consent must be present on the server side, the notice
// version is always the server's approved constant (anything the browser sends is ignored), newsletter defaults to not granted.
export function quoteConsents(body, approvedNoticeVersion) {
  const yes = (v) => v === true || v === 'yes' || v === 'on' || v === 'true';
  if (!yes(body?.consent_request)) return { ok: false, error: 'consent_required' };
  return { ok: true, notice_version: approvedNoticeVersion, brand: 'aimanjack', channel: 'email',
    events: [{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: yes(body.consent_newsletter) }] };
}
