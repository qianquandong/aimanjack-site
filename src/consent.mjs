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

// Ledger rows as stored: { event_id, consent_type, granted, decision?, brand?, channel?, occurred_at, source_occurred_at? }.
export const decisionOf = (e) => e.decision ?? (e.granted ? 'granted' : 'not_granted');
const ms = (t) => (t == null ? null : new Date(t).getTime());
const when = (e) => ms(e.source_occurred_at) ?? ms(e.occurred_at);

// State for one identity × brand × channel × purpose: 'granted' | 'withdrawn' | 'suppressed' | 'erased' | 'none'.
//   suppressed: provider tombstone for aimanjack.com email; nothing in the ledger can clear it.
//   erased: an erasure voids everything received or dated before it; only newer consent counts.
//   'not_granted' (unticked box) never changes the state.
export function effectiveState(events, { brand, channel = 'email', purpose, suppressed = false }) {
  const mine = events.filter((e) => e.consent_type !== 'erasure');
  const erasedAt = Math.max(-Infinity, ...events.filter((e) => e.consent_type === 'erasure').map((e) => ms(e.occurred_at)));
  const scoped = mine.filter((e) => (e.brand ?? 'aimanjack') === brand && (e.channel ?? 'email') === channel && e.consent_type === purpose);
  if (brand === 'aimanjack' && channel === 'email' && suppressed && scoped.length) return 'suppressed';
  const live = scoped.filter((e) => erasedAt === -Infinity || (ms(e.occurred_at) > erasedAt && when(e) > erasedAt));
  const decisive = live.filter((e) => ['granted', 'withdrawn'].includes(decisionOf(e)))
    .sort((a, b) => when(b) - when(a) || b.event_id - a.event_id)[0];
  if (decisive) return decisionOf(decisive);
  if (scoped.length && erasedAt !== -Infinity) return 'erased';
  return 'none';
}

// The only question a marketing sender may ask. Request handling, analytics or transactional notices never qualify.
export function allowsMarketing(events, scope) {
  if (!MARKETING_PURPOSES.includes(scope.purpose)) return false;
  return effectiveState(events, scope) === 'granted';
}

// Server-side consent evidence for a form submission: the request consent must be present on the server side, the notice
// version is always the server's approved constant (anything the browser sends is ignored), newsletter defaults to not granted.
export function quoteConsents(body, approvedNoticeVersion) {
  const yes = (v) => v === true || v === 'yes' || v === 'on' || v === 'true';
  if (!yes(body?.consent_request)) return { ok: false, error: 'consent_required' };
  return { ok: true, notice_version: approvedNoticeVersion, brand: 'aimanjack', channel: 'email',
    events: [{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: yes(body.consent_newsletter) }] };
}
