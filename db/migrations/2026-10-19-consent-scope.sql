-- 2026-10-19 PR01 (M01/M02): consent scope by brand × channel × purpose, source time, explicit decision. EXPAND ONLY.
-- NOT APPLIED. Apply only after a separate owner approval, AFTER 2026-10-08-revenue-intake.sql, 2026-10-11-ros-event-outbox.sql
-- and 2026-10-16-mailerlite-quote-outbox.sql. Re-running 2026-10-08-revenue-intake.sql after this file would narrow the
-- consent_type/source checks again; re-run this file after it in that case.
--
-- Owner decisions (2026-10-19): 行云 is the only CRM (D2); RAUC (realagentusecases.com, on Substack) and aimanjack.com
-- marketing consent stay separate (D3). No code writes brand 'rauc' today; the value exists so that a RAUC consent can never
-- be mistaken for aimanjack.com consent if one is ever recorded here.
--
-- Compatibility:
--   * Every new column has a default or is nullable, so record_intake, erase_* and ROS capture keep working unchanged.
--     Existing rows read as brand 'aimanjack', channel 'email', decision NULL (derived from `granted`), source time NULL.
--   * The ledger stays append-only: no UPDATE/backfill (the existing trigger forbids it). Column defaults are catalog-only.
--   * occurred_at keeps its meaning (when this database recorded the event = received time). source_occurred_at is the
--     time the source says it happened (e.g. a provider callback), used for ordering when present.
--   * decision: 'granted' | 'not_granted' (box left unticked: "no new permission", never a revocation) |
--     'withdrawn' (explicit opt-out). NULL on old rows means granted ? 'granted' : 'not_granted'.
--   * mailerlite_capture_consent / mailerlite_context are redefined with added guards only: brand/channel/decision, and the
--     effective state from revenue.consent_state (erasure without owner-reviewed recovery; out-of-order withdrawal). The rest
--     of each body is byte-identical to 2026-10-16-mailerlite-quote-outbox.sql (tests/consent-scope.test.mjs checks this).
--     With today's production data (all aimanjack, email, decision NULL, no erasures; evidence 2026-10-19) behaviour is unchanged.
--   * New: revenue.erasure_replay_guards + two triggers on intake_receipts (an erased request cannot be resubmitted verbatim).
--   * Production facts this file relies on were read 2026-10-19 (constraint names, RLS on every revenue table, no policies,
--     security-definer functions owned by postgres); see the private plan repository, evidence/pr01.
begin;

alter table revenue.consent_events add column if not exists brand text not null default 'aimanjack';
alter table revenue.consent_events add column if not exists channel text not null default 'email';
alter table revenue.consent_events add column if not exists source_occurred_at timestamptz;
alter table revenue.consent_events add column if not exists decision text;

alter table revenue.consent_events drop constraint if exists consent_events_brand_check;
alter table revenue.consent_events add constraint consent_events_brand_check check (brand in ('aimanjack', 'rauc'));
alter table revenue.consent_events drop constraint if exists consent_events_channel_check;
alter table revenue.consent_events add constraint consent_events_channel_check check (channel in ('email'));
alter table revenue.consent_events drop constraint if exists consent_events_decision_check;
alter table revenue.consent_events add constraint consent_events_decision_check
  check (decision is null or (decision in ('granted', 'not_granted', 'withdrawn') and (decision = 'granted') = granted and consent_type <> 'erasure'));
-- Purposes: request_contact (handle this request), kit_sequence (short Rollout Kit series), newsletter (long-term),
-- analytics, transactional (booking/receipt notices). erasure is written only by the erase functions.
alter table revenue.consent_events drop constraint if exists consent_events_consent_type_check;
alter table revenue.consent_events add constraint consent_events_consent_type_check
  check (consent_type in ('request_contact', 'kit_sequence', 'newsletter', 'analytics', 'transactional', 'erasure'));
alter table revenue.consent_events drop constraint if exists consent_events_source_check;
alter table revenue.consent_events add constraint consent_events_source_check
  check (source in ('quote_form', 'dsar_erasure', 'kit_form', 'provider_webhook', 'owner_manual'));
-- Quote forms exist on aimanjack.com only.
alter table revenue.consent_events drop constraint if exists consent_events_quote_form_brand_check;
alter table revenue.consent_events add constraint consent_events_quote_form_brand_check check (source <> 'quote_form' or brand = 'aimanjack');
-- A source clock may not run ahead of receipt by more than 5 minutes.
alter table revenue.consent_events drop constraint if exists consent_events_source_time_check;
alter table revenue.consent_events add constraint consent_events_source_time_check
  check (source_occurred_at is null or source_occurred_at <= occurred_at + interval '5 minutes');
create index if not exists consent_events_scope on revenue.consent_events (subject_email_hash, brand, channel, consent_type);

-- Erasure replay guard. erase_subject / erase_receipt delete the receipt (and its day-scoped dedupe key). Without a trace, an
-- identical resubmission of the same request would recreate the personal data and re-queue enrollment. Before a receipt row
-- is deleted, its dedupe key (already a keyed HMAC, no raw email) is kept here; record_intake then refuses that exact key
-- (the API answers 503 intake_unavailable). Dedupe keys are scoped to one UTC day, so rows older than two days are inert and
-- may be purged later (owner decision); a new request on another day is a new submission.
create table if not exists revenue.erasure_replay_guards (
  dedupe_key text primary key check (dedupe_key ~ '^[0-9a-f]{64}$'),
  subject_email_hash text check (subject_email_hash is null or subject_email_hash ~ '^[0-9a-f]{64}$'),
  guarded_at timestamptz not null default clock_timestamp()
);
alter table revenue.erasure_replay_guards enable row level security;
revoke all on revenue.erasure_replay_guards from public, anon, authenticated, service_role;

create or replace function revenue.intake_receipts_keep_replay_guard() returns trigger
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  insert into revenue.erasure_replay_guards (dedupe_key, subject_email_hash) values (old.dedupe_key, old.subject_email_hash)
  on conflict (dedupe_key) do nothing;
  return old;
end $$;
drop trigger if exists intake_receipts_replay_guard on revenue.intake_receipts;
create trigger intake_receipts_replay_guard before delete on revenue.intake_receipts
  for each row execute function revenue.intake_receipts_keep_replay_guard();

create or replace function revenue.intake_receipts_refuse_replay() returns trigger
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  if exists (select 1 from revenue.erasure_replay_guards g where g.dedupe_key = new.dedupe_key) then
    raise exception 'record_intake: erased_replay' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists intake_receipts_refuse_replay on revenue.intake_receipts;
create trigger intake_receipts_refuse_replay before insert on revenue.intake_receipts
  for each row execute function revenue.intake_receipts_refuse_replay();

-- Ordering time for one consent event (mirrored by src/consent.mjs eventTime), at millisecond precision (what JavaScript and
-- PostgREST clients can represent; ties are resolved explicitly below, never by sub-millisecond digits):
--   * a grant counts from the time its source reports, but never later than when this database received it, so a clock
--     running ahead cannot make an old grant beat a withdrawal;
--   * a withdrawal counts from the later of the two, so a provider clock running behind cannot hide an opt-out.
-- Errors on this side only ever keep marketing off.
create or replace function revenue.consent_event_time(p_source_at timestamptz, p_received_at timestamptz, p_decision text) returns timestamptz
language sql immutable set search_path = pg_catalog, pg_temp as $$
  select date_trunc('milliseconds', case when p_decision = 'withdrawn' then greatest(coalesce(p_source_at, p_received_at), p_received_at)
                                         else least(coalesce(p_source_at, p_received_at), p_received_at) end)
$$;

-- Effective marketing permission per identity × brand × channel × purpose (mirrored by src/consent.mjs effectiveState):
--   1. aimanjack.com email marketing (kit_sequence, newsletter): a MailerLite tombstone (unsubscribed / bounced / junk /
--      deleted / forgotten) → 'suppressed', with or without any ledger row. Nothing in the ledger clears it; recovery is a
--      reviewed process, never a tombstone delete. Request handling and transactional notices are not suppressed by it.
--   2. Erasure of the identity (any brand): everything at or before the latest erasure is void. After it, only a withdrawal
--      or an owner-reviewed recovery (source 'owner_manual', decision 'granted') counts; once recovered, later events count
--      again. No such event → 'erased' (for every brand and purpose). Replays can never revive anyone.
--   3. Otherwise the latest 'granted' or 'withdrawn' event wins by consent_event_time; on equal time a withdrawal wins,
--      then the higher event_id. 'not_granted' never changes the state: an unticked box is neither unsubscribe nor grant.
--   4. No decisive event → 'none'. Identities with no ledger row, erasure or tombstone have no row (= not allowed).
create or replace view revenue.consent_effective with (security_barrier = true) as
with events as (
  select c.subject_email_hash, c.brand, c.channel, c.consent_type as purpose, c.event_id, c.source,
         coalesce(c.decision, case when c.granted then 'granted' else 'not_granted' end) as decision,
         revenue.consent_event_time(c.source_occurred_at, c.occurred_at, coalesce(c.decision, case when c.granted then 'granted' else 'not_granted' end)) as t
  from revenue.consent_events c
  where c.subject_email_hash is not null and c.consent_type <> 'erasure'
), erasures as (
  select subject_email_hash, max(date_trunc('milliseconds', occurred_at)) as erased_at
  from revenue.consent_events where consent_type = 'erasure' and subject_email_hash is not null group by 1
), recoveries as (
  select e.subject_email_hash, e.brand, e.channel, e.purpose, min(e.t) as recovered_at
  from events e join erasures x using (subject_email_hash)
  where e.source = 'owner_manual' and e.decision = 'granted' and e.t > x.erased_at
  group by 1, 2, 3, 4
), live as (
  select e.* from events e
  left join erasures x using (subject_email_hash)
  left join recoveries r using (subject_email_hash, brand, channel, purpose)
  where x.erased_at is null
     or (e.t > x.erased_at and (e.decision = 'withdrawn' or (r.recovered_at is not null and e.t >= r.recovered_at)))
), decisive as (
  select distinct on (subject_email_hash, brand, channel, purpose) *
  from live where decision in ('granted', 'withdrawn')
  order by subject_email_hash, brand, channel, purpose, t desc, (decision = 'withdrawn') desc, event_id desc
), keys as (
  select subject_email_hash, brand, channel, purpose from events
  union
  select x.subject_email_hash, b.brand, 'email', p.purpose from erasures x
    cross join (values ('aimanjack'), ('rauc')) b(brand)
    cross join (values ('request_contact'), ('kit_sequence'), ('newsletter'), ('analytics'), ('transactional')) p(purpose)
  union
  select s.identity_hash, 'aimanjack', 'email', p.purpose from revenue.mailerlite_suppressions s
    cross join (values ('kit_sequence'), ('newsletter')) p(purpose)
)
select k.subject_email_hash, k.brand, k.channel, k.purpose,
  case
    when k.brand = 'aimanjack' and k.channel = 'email' and k.purpose in ('kit_sequence', 'newsletter')
      and exists (select 1 from revenue.mailerlite_suppressions s where s.identity_hash = k.subject_email_hash) then 'suppressed'
    when d.decision = 'granted' then 'granted'
    when d.decision = 'withdrawn' then 'withdrawn'
    when x.erased_at is not null then 'erased'
    else 'none'
  end as state,
  d.event_id as decided_by_event_id,
  d.t as decided_at
from keys k
left join decisive d using (subject_email_hash, brand, channel, purpose)
left join erasures x using (subject_email_hash);

-- Single gate for any future marketing enrollment or send: exact brand, channel and marketing purpose; nothing inherited.
-- A null or unknown identity is never allowed.
create or replace function revenue.consent_allows(p_subject text, p_brand text, p_channel text, p_purpose text) returns boolean
language sql stable security definer set search_path = pg_catalog, pg_temp as $$
  select p_subject is not null and p_purpose in ('kit_sequence', 'newsletter') and coalesce((select e.state = 'granted' from revenue.consent_effective e
    where e.subject_email_hash = p_subject and e.brand = p_brand and e.channel = p_channel and e.purpose = p_purpose), false)
$$;

-- Effective state for one scope ('none' when there is no row). The MailerLite path uses it.
create or replace function revenue.consent_state(p_subject text, p_brand text, p_channel text, p_purpose text) returns text
language sql stable security definer set search_path = pg_catalog, pg_temp as $$
  select coalesce((select e.state from revenue.consent_effective e
    where e.subject_email_hash = p_subject and e.brand = p_brand and e.channel = p_channel and e.purpose = p_purpose), 'none')
$$;

create or replace function revenue.mailerlite_capture_consent() returns trigger
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
begin
  if new.source<>'quote_form' or new.consent_type<>'newsletter' or not new.granted then return new; end if;
  -- 2026-10-19 (D3): only aimanjack.com email consent may enroll in the aimanjack.com MailerLite group.
  if new.brand<>'aimanjack' or new.channel<>'email' or coalesce(new.decision,'granted')<>'granted' then return new; end if;
  -- 2026-10-19 (D3): after an erasure, nothing is queued until an owner-reviewed recovery.
  if revenue.consent_state(new.subject_email_hash,'aimanjack','email','newsletter')='erased' then return new; end if;
  if not exists(select 1 from revenue.mailerlite_configuration where enabled) then return new; end if;
  if not exists(select 1 from revenue.intake_receipts where receipt_id=new.receipt_id) then return new; end if;
  -- Consent events append even when the quote receipt dedupes. Never rely on its immutable initial checkbox value.
  insert into revenue.mailerlite_sync_events(consent_event_id,receipt_id,identity_hash)
    values(new.event_id,new.receipt_id,new.subject_email_hash) on conflict do nothing;
  return new;
end $$;

create or replace function revenue.mailerlite_context(p_id bigint,p_token uuid,p_group text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare e revenue.mailerlite_sync_events; r revenue.intake_receipts; latest revenue.consent_events; identity revenue.mailerlite_identities; tombstone revenue.mailerlite_suppressions; address text;
begin
  if p_group !~ '^[0-9]{1,30}$' then return jsonb_build_object('eligible',false,'reason','invalid_group'); end if;
  select * into e from revenue.mailerlite_sync_events where id=p_id and status='processing' and lease_token=p_token and lease_until>clock_timestamp();
  if not found then return jsonb_build_object('eligible',false,'reason','lease_unavailable'); end if;
  if not exists(select 1 from revenue.mailerlite_configuration where enabled) then return jsonb_build_object('eligible',false,'reason','database_disabled'); end if;
  select * into r from revenue.intake_receipts where receipt_id=e.receipt_id;
  if not found then return jsonb_build_object('eligible',false,'reason','source_erased'); end if;
  address:=lower(trim(r.payload->>'email'));
  if address is null or length(address)>254 or address !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then return jsonb_build_object('eligible',false,'reason','source_invalid'); end if;
  if e.identity_hash is null or e.identity_hash is distinct from r.subject_email_hash then return jsonb_build_object('eligible',false,'reason','identity_unavailable'); end if;
  -- Across all receipts for this person: a later unticked box cancels pending enrollment, but never calls unsubscribe.
  -- 2026-10-19 (D3): another brand's or channel's newsletter consent never counts here; erasure applies across brands.
  select * into latest from revenue.consent_events c where c.subject_email_hash=e.identity_hash and ((c.consent_type='newsletter' and c.brand='aimanjack' and c.channel='email') or c.consent_type='erasure') order by c.event_id desc limit 1;
  if not found or latest.consent_type<>'newsletter' or not latest.granted or coalesce(latest.decision,'granted')<>'granted' then return jsonb_build_object('eligible',false,'reason','latest_consent_not_granted'); end if;
  -- 2026-10-19 (D3): the effective state must agree too (out-of-order withdrawal, erasure without recovery); tombstones fall through to local_state below.
  if revenue.consent_state(e.identity_hash,'aimanjack','email','newsletter') in ('erased','withdrawn','none') then return jsonb_build_object('eligible',false,'reason','consent_not_effective'); end if;
  if latest.occurred_at<clock_timestamp()-interval '30 days' then return jsonb_build_object('eligible',false,'reason','consent_expired'); end if;
  if e.group_id is not null and e.group_id<>p_group then return jsonb_build_object('eligible',false,'reason','group_changed_after_attempt'); end if;
  select * into identity from revenue.mailerlite_identities where identity_hash=e.identity_hash and group_id=p_group;
  select * into tombstone from revenue.mailerlite_suppressions where identity_hash=e.identity_hash or subscriber_id=identity.subscriber_id order by created_at limit 1;
  return jsonb_build_object('eligible',true,'email',address,'name',left(coalesce(r.payload->>'name',''),100),
    'language',case when r.payload->>'lang'='zh' then 'zh' else 'en' end,'local_state',coalesce(tombstone.state,identity.state),
    'creation_history',exists(select 1 from revenue.mailerlite_identities where identity_hash=e.identity_hash),
    'uncertain_history',exists(select 1 from revenue.mailerlite_identities where identity_hash=e.identity_hash and state='attempted'));
end $$;

revoke all on revenue.consent_effective from public, anon, authenticated, service_role;
revoke all on function revenue.consent_event_time(timestamptz, timestamptz, text) from public, anon, authenticated;
revoke all on function revenue.consent_state(text, text, text, text) from public, anon, authenticated;
grant execute on function revenue.consent_state(text, text, text, text) to service_role;
revoke all on function revenue.intake_receipts_keep_replay_guard() from public, anon, authenticated, service_role;
revoke all on function revenue.intake_receipts_refuse_replay() from public, anon, authenticated, service_role;
revoke all on function revenue.consent_allows(text, text, text, text) from public, anon, authenticated;
grant execute on function revenue.consent_allows(text, text, text, text) to service_role;
revoke all on function revenue.mailerlite_capture_consent() from public, anon, authenticated, service_role;
revoke all on function revenue.mailerlite_context(bigint, uuid, text) from public, anon, authenticated;
grant execute on function revenue.mailerlite_context(bigint, uuid, text) to service_role;
commit;
