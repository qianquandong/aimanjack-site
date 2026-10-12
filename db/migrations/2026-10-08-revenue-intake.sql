-- Revenue OS v6 (W-002): training quote intake receipts + append-only consent ledger, in a NEW schema `revenue`
-- (the `booking` schema is not reused). Written 2026-10-08, revised 2026-10-08 after the lifecycle/privacy review
-- (revenue-os evidence M-005_M-010_I-024_lifecycle.md: FK from the append-only ledger blocked DSAR deletion; unsalted email hash).
-- NOT APPLIED — the owner reviews, then runs:
--   node scripts/supabase-sql.mjs db/migrations/2026-10-08-revenue-intake.sql
--   node scripts/supabase-sql.mjs --expose revenue          # PostgREST must serve the schema for POST /v1/intake
-- Until both have run, /v1/intake answers 503 intake_unavailable (fail closed) and the form tells people to email instead.
-- Idempotent. Only service_role (the Pages Function's secret key) can reach it: RLS on, no anon/authenticated policies or grants.
-- PII rules:
--   * the raw IP is never stored; ip_hash is HMAC-salted (IP_HASH_SALT) or null — never an unsalted IP hash;
--   * subject_email_hash = hex HMAC-SHA256(EMAIL_HASH_SECRET, 'subject:' || lower(email)), or null when the secret is unset
--     (no unsalted email hash is ever stored);
--   * PII lives only in intake_receipts (payload). The consent ledger holds no PII and no foreign key to receipts, so a
--     receipt can be deleted for a deletion request (revenue.erase_subject / revenue.erase_receipt) while the consent
--     EVIDENCE (what was granted, when, under which notice version) stays provable by the salted subject hash alone.

create schema if not exists revenue;
revoke all on schema revenue from public, anon, authenticated;
grant usage on schema revenue to service_role;

-- One row per (email, company domain, UTC day): a retried or double-submitted form makes ONE receipt (dedupe_key unique).
-- dedupe_key = HMAC-SHA256(EMAIL_HASH_SECRET, 'dedupe:' || email|domain|day) when the secret is set. Fallback when it is
-- unset: sha256(email|domain|day). Trade-off: that fallback is guessable by anyone who already knows the email, company
-- domain and day, so it lives ONLY in this row (never in the consent ledger, the ROS webhook or logs) and disappears with
-- the receipt on erasure. Set EMAIL_HASH_SECRET before go-live.
create table if not exists revenue.intake_receipts (
  receipt_id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique check (dedupe_key ~ '^[0-9a-f]{64}$'),
  received_at timestamptz not null default now(),
  form_version text not null,
  payload jsonb not null,                                   -- validated form fields (name, email, company, …); never raw IP
  consent_request boolean not null check (consent_request), -- the request consent is required; a row cannot exist without it
  consent_newsletter boolean not null default false,        -- optional, unticked by default, independent of the request consent
  consent_notice_version text,
  utm jsonb not null default '{}'::jsonb,                   -- first-touch utm_* / referrer_host / landing_path / first_touch_at
  self_reported_source text,                                -- "how did you hear about us" (self-reported, kept apart from utm)
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  subject_email_hash text check (subject_email_hash is null or subject_email_hash ~ '^[0-9a-f]{64}$')   -- salted HMAC or null
);
alter table revenue.intake_receipts add column if not exists subject_email_hash text
  check (subject_email_hash is null or subject_email_hash ~ '^[0-9a-f]{64}$');
create index if not exists intake_receipts_received_at on revenue.intake_receipts (received_at desc);
create index if not exists intake_receipts_subject on revenue.intake_receipts (subject_email_hash) where subject_email_hash is not null;
alter table revenue.intake_receipts enable row level security;

-- Append-only consent ledger: every accepted submission appends one row per consent type, including retries that dedupe
-- onto an existing receipt (the person did tick the box again). Updates, deletes and truncates are refused by trigger.
-- No PII and NO foreign key: receipt_id is a plain reference that may dangle after the receipt is erased (a random UUID
-- identifies no one once the receipt is gone). Erasures are themselves recorded here as consent_type 'erasure'.
create table if not exists revenue.consent_events (
  event_id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  receipt_id uuid,                                          -- deliberately not a foreign key (see above)
  subject_email_hash text check (subject_email_hash is null or subject_email_hash ~ '^[0-9a-f]{64}$'),   -- salted HMAC or null
  consent_type text not null check (consent_type in ('request_contact', 'newsletter', 'erasure')),
  granted boolean not null,
  notice_version text,
  source text not null default 'quote_form' check (source in ('quote_form', 'dsar_erasure'))
);
-- Upgrade path if an earlier draft of this file was ever applied (it was not, per HANDOFF): drop the blocking FK and NOT NULL.
alter table revenue.consent_events drop constraint if exists consent_events_receipt_id_fkey;
alter table revenue.consent_events alter column receipt_id drop not null;
alter table revenue.consent_events alter column subject_email_hash drop not null;
alter table revenue.consent_events drop constraint if exists consent_events_consent_type_check;
alter table revenue.consent_events add constraint consent_events_consent_type_check
  check (consent_type in ('request_contact', 'newsletter', 'erasure'));
alter table revenue.consent_events drop constraint if exists consent_events_source_check;
alter table revenue.consent_events add constraint consent_events_source_check check (source in ('quote_form', 'dsar_erasure'));
create index if not exists consent_events_subject on revenue.consent_events (subject_email_hash, consent_type, occurred_at desc);
alter table revenue.consent_events enable row level security;

create or replace function revenue.consent_events_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'revenue.consent_events is append-only (record a new event instead)';
end;
$$;
drop trigger if exists consent_events_no_update on revenue.consent_events;
create trigger consent_events_no_update before update or delete on revenue.consent_events
  for each row execute function revenue.consent_events_append_only();
drop trigger if exists consent_events_no_truncate on revenue.consent_events;
create trigger consent_events_no_truncate before truncate on revenue.consent_events
  for each statement execute function revenue.consent_events_append_only();

-- Fixed-window rate limit, same design as booking.take_coupon_rate_limit. key_hash is a hex HMAC-SHA256 computed by the
-- Pages Function (keyed with EMAIL_HASH_SECRET, or the service secret when that is unset); rows expire after a day.
create table if not exists revenue.intake_rate_limits (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null default now(),
  requests integer not null default 1 check (requests > 0),
  updated_at timestamptz not null default now()
);
create index if not exists intake_rate_limits_updated_at on revenue.intake_rate_limits (updated_at);
alter table revenue.intake_rate_limits enable row level security;

create or replace function revenue.take_intake_rate_limit(
  p_key_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 600
) returns boolean
language plpgsql
security definer
set search_path = revenue, pg_temp
as $$
declare
  current_requests integer;
  cutoff timestamptz := clock_timestamp() - make_interval(secs => p_window_seconds);
begin
  if p_key_hash is null or p_limit is null or p_window_seconds is null
     or p_key_hash !~ '^[0-9a-f]{64}$' or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid intake rate-limit input';
  end if;

  delete from revenue.intake_rate_limits where updated_at < clock_timestamp() - interval '1 day';

  insert into revenue.intake_rate_limits (key_hash, window_start, requests, updated_at)
  values (p_key_hash, clock_timestamp(), 1, clock_timestamp())
  on conflict (key_hash) do update set
    requests = case when intake_rate_limits.window_start <= cutoff then 1 else intake_rate_limits.requests + 1 end,
    window_start = case when intake_rate_limits.window_start <= cutoff then clock_timestamp() else intake_rate_limits.window_start end,
    updated_at = clock_timestamp()
  returning requests into current_requests;

  return current_requests <= p_limit;
end;
$$;

-- One transaction: insert the receipt unless its dedupe_key exists, then append the consent events.
-- p: { dedupe_key, form_version, payload, consent_request, consent_newsletter, consent_notice_version, utm,
--      self_reported_source, ip_hash, subject_email_hash }   (ip_hash / subject_email_hash may be null: salt or secret unset)
-- p_consents: [{ consent_type, granted }, …]
-- Returns { receipt_id, received_at, deduped }.
create or replace function revenue.record_intake(p jsonb, p_consents jsonb default '[]'::jsonb) returns jsonb
language plpgsql
security definer
set search_path = revenue, pg_temp
as $$
declare
  rid uuid;
  rat timestamptz;
  was_deduped boolean := false;
begin
  if p is null or coalesce((p->>'consent_request')::boolean, false) is not true then
    raise exception 'record_intake: request consent is required';
  end if;

  insert into revenue.intake_receipts (dedupe_key, form_version, payload, consent_request, consent_newsletter,
                                       consent_notice_version, utm, self_reported_source, ip_hash, subject_email_hash)
  values (p->>'dedupe_key', coalesce(p->>'form_version', 'unknown'), p->'payload', true,
          coalesce((p->>'consent_newsletter')::boolean, false), p->>'consent_notice_version',
          coalesce(p->'utm', '{}'::jsonb), p->>'self_reported_source', p->>'ip_hash', p->>'subject_email_hash')
  on conflict (dedupe_key) do nothing
  returning receipt_id, received_at into rid, rat;

  if rid is null then
    select receipt_id, received_at into rid, rat from revenue.intake_receipts where dedupe_key = p->>'dedupe_key';
    was_deduped := true;
  end if;

  insert into revenue.consent_events (receipt_id, subject_email_hash, consent_type, granted, notice_version, source)
  select rid, p->>'subject_email_hash', c->>'consent_type', coalesce((c->>'granted')::boolean, false), p->>'consent_notice_version', 'quote_form'
  from jsonb_array_elements(coalesce(p_consents, '[]'::jsonb)) as c
  where c->>'consent_type' in ('request_contact', 'newsletter');   -- 'erasure' is written only by the erase functions

  return jsonb_build_object('receipt_id', rid, 'received_at', rat, 'deduped', was_deduped);
end;
$$;

-- Deletion request (DSAR) by subject: deletes every receipt (and with it all PII: payload, dedupe_key, ip_hash) whose
-- subject_email_hash matches, then appends ONE 'erasure' event keyed by the same salted hash. Prior consent events stay
-- (append-only, PII-free), so "consent X was granted/declined at T under notice V" remains provable after erasure.
-- The operator computes p_subject_hash = hex HMAC-SHA256(EMAIL_HASH_SECRET, 'subject:' || lower(trim(email))).
-- Returns { subject_hash, receipts_deleted, erasure_event_id }. service_role only.
create or replace function revenue.erase_subject(p_subject_hash text) returns jsonb
language plpgsql
security definer
set search_path = revenue, pg_temp
as $$
declare
  n integer;
  eid bigint;
begin
  if p_subject_hash is null or p_subject_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'erase_subject: subject hash must be 64 lowercase hex characters';
  end if;
  delete from revenue.intake_receipts where subject_email_hash = p_subject_hash;
  get diagnostics n = row_count;
  insert into revenue.consent_events (receipt_id, subject_email_hash, consent_type, granted, notice_version, source)
  values (null, p_subject_hash, 'erasure', false, null, 'dsar_erasure')
  returning event_id into eid;
  return jsonb_build_object('subject_hash', p_subject_hash, 'receipts_deleted', n, 'erasure_event_id', eid);
end;
$$;

-- Deletion by receipt id, for receipts stored while EMAIL_HASH_SECRET was unset (subject_email_hash null). The erasure
-- event carries the receipt's subject hash if it had one, else only the (now dangling) receipt id. service_role only.
create or replace function revenue.erase_receipt(p_receipt_id uuid) returns jsonb
language plpgsql
security definer
set search_path = revenue, pg_temp
as $$
declare
  subj text;
  n integer;
  eid bigint;
begin
  if p_receipt_id is null then raise exception 'erase_receipt: receipt id required'; end if;
  delete from revenue.intake_receipts where receipt_id = p_receipt_id returning subject_email_hash into subj;
  get diagnostics n = row_count;
  insert into revenue.consent_events (receipt_id, subject_email_hash, consent_type, granted, notice_version, source)
  values (p_receipt_id, subj, 'erasure', false, null, 'dsar_erasure')
  returning event_id into eid;
  return jsonb_build_object('receipt_id', p_receipt_id, 'receipts_deleted', n, 'erasure_event_id', eid);
end;
$$;

grant select, insert on revenue.intake_receipts to service_role;
grant select, insert on revenue.consent_events to service_role;
grant all on revenue.intake_rate_limits to service_role;
revoke update, delete, truncate on revenue.consent_events from service_role;
revoke update, delete, truncate on revenue.intake_receipts from service_role;   -- receipts are removed only via erase_*
revoke all on revenue.intake_receipts, revenue.consent_events, revenue.intake_rate_limits from public, anon, authenticated;

grant execute on function revenue.take_intake_rate_limit(text, integer, integer) to service_role;
grant execute on function revenue.record_intake(jsonb, jsonb) to service_role;
grant execute on function revenue.erase_subject(text) to service_role;
grant execute on function revenue.erase_receipt(uuid) to service_role;
revoke execute on function revenue.take_intake_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function revenue.record_intake(jsonb, jsonb) from public, anon, authenticated;
revoke execute on function revenue.erase_subject(text) from public, anon, authenticated;
revoke execute on function revenue.erase_receipt(uuid) from public, anon, authenticated;
revoke execute on function revenue.consent_events_append_only() from public, anon, authenticated;
