-- Idempotent migration: durable booking-notification ledger (GitHub qianquandong/revenue-os#2).
-- One row per (booking event × recipient role). Rows are written BEFORE sending; the send result is recorded per row.
--   status: pending → sending → delivered | queued | bounced | failed (retried) → dead
--           sending rows that outlive a worker, or whose request died on the network, become 'uncertain' (never auto-resent)
--           an unsent row made obsolete by a newer message to the same recipient becomes 'superseded'
--   'delivered' = accepted by the recipient's mail server per Cloudflare's per-recipient result — NOT proof of inbox.
--
-- Run (owner-authorized production change):  node scripts/supabase-sql.mjs db/migrations/2026-10-09-booking-notifications.sql
-- Apply BEFORE deploying the code that uses it (the code falls back to un-ledgered sending and logs loudly if absent).
-- Reversal: `drop table booking.notifications;` (loses delivery history only; bookings are untouched).

create table if not exists booking.notifications (
  id bigserial primary key,
  business_id text not null,
  booking_id text not null references booking.bookings(id),
  event_id bigint references booking.events(id),
  kind text not null check (kind in ('created', 'rescheduled', 'cancelled')),
  role text not null check (role in ('customer', 'owner')),
  dedupe_key text not null unique,                    -- derived from booking state (see src/booking-notify.mjs): no duplicates
  to_address text,                                    -- null = configuration gap (e.g. OWNER_EMAIL unset) — recorded, not silent
  reply_to text,
  subject text not null,
  body_text text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'delivered', 'queued', 'bounced', 'failed', 'dead', 'uncertain', 'superseded')),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  alerted_at timestamptz,
  last_error text,
  provider_result jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_due on booking.notifications (status, next_attempt_at);
create index if not exists notifications_booking on booking.notifications (booking_id);

alter table booking.notifications enable row level security;

do $$
begin
  perform 1 from pg_roles where rolname = 'service_role';
  if found then
    grant all on booking.notifications to service_role;
    grant all on sequence booking.notifications_id_seq to service_role;
  end if;
  revoke all on booking.notifications from public, anon, authenticated;
exception when others then null;
end $$;
