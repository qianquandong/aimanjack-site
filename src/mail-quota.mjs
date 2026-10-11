// Shared rolling mailbox budget. Reuses the existing coupon_rate_limits table/RPC;
// no migration is required. Each slot admits one attempt per 24 hours, atomically.
export const MAIL_DAILY_CAP_DEFAULT = 40;
const MAX_CAP = 100; // bounds the PostgREST query size and per-request work
const WINDOW_SECONDS = 86400;
const hash = async (text) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('');
const missingTable = (e) => ['42P01', 'PGRST205', 'PGRST106'].includes(e?.code);
const denied = (error) => ({ ok: false, error });
export const isMailQuotaError = (code) => /^(daily_send_cap_reached|mail_quota_(unavailable|busy)|config_invalid:MAIL_DAILY_CAP)$/.test(code || '');

export async function reserveMailSend(env, db, sender) {
  const cap = env.MAIL_DAILY_CAP == null || env.MAIL_DAILY_CAP === '' ? MAIL_DAILY_CAP_DEFAULT : Number(env.MAIL_DAILY_CAP);
  if (!Number.isInteger(cap) || cap < 1 || cap > MAX_CAP) return denied('config_invalid:MAIL_DAILY_CAP');
  if (!sender || typeof db !== 'function') return denied('mail_quota_unavailable');
  try {
    // Preserve the old ledger cap during rollout, including sends made before slot accounting existed.
    const since = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString();
    const recent = await db(`notifications?select=id&status=in.(queued,delivered,bounced)&sent_at=gte.${since}&limit=${cap}`).catch(e => {
      if (missingTable(e)) return []; // legacy fallback still has the atomic slot budget below
      throw e;
    });
    if (!Array.isArray(recent)) return denied('mail_quota_unavailable');
    if (recent.length >= cap) return denied('daily_send_cap_reached');
    const mailbox = String(sender).trim().toLowerCase();
    // Conservatively reserve part of the budget for existing ledger sends. Counting
    // new ledger sends here too may reduce throughput, but cannot grant a fresh
    // full budget on top of mail sent before slot accounting was introduced.
    const keys = await Promise.all(Array.from({ length: cap - recent.length }, (_, i) => hash(`site-mail-slot:v1:${mailbox}:${i}`)));
    const rows = await db(`coupon_rate_limits?key_hash=in.(${keys.join(',')})&select=key_hash,window_start&limit=${cap}`);
    if (!Array.isArray(rows)) return denied('mail_quota_unavailable');
    const occupied = new Set(rows.filter(r => !Number.isFinite(Date.parse(r.window_start)) || Date.parse(r.window_start) > Date.now() - WINDOW_SECONDS * 1000).map(r => r.key_hash));
    const available = keys.filter(k => !occupied.has(k));
    if (!available.length) return denied('daily_send_cap_reached');
    // Another isolate may pick the same slot. The RPC (not this snapshot) decides who wins.
    // Bounded retries protect the Worker subrequest budget; contention fails closed.
    for (let attempt = 0; available.length && attempt < 3; attempt++) {
      const [key] = available.splice(crypto.getRandomValues(new Uint32Array(1))[0] % available.length, 1);
      const won = await db('rpc/take_coupon_rate_limit', { method: 'POST', body: { p_key_hash: key, p_limit: 1, p_window_seconds: WINDOW_SECONDS } });
      if (won === true) return { ok: true };
      if (won !== false) return denied('mail_quota_unavailable');
    }
    return denied('mail_quota_busy');
  } catch { return denied('mail_quota_unavailable'); } // Never send when the shared store cannot enforce the cap.
}
