-- 2026-10-19 PR02 (M03): quote intake by submission, not by (email, company domain, UTC day). EXPAND ONLY.
-- NOT APPLIED. Apply only after a separate owner approval, AFTER 2026-10-19-consent-scope.sql (it extends that file's erasure
-- replay guard). The API keeps using revenue.record_intake until INTAKE_V2_ENABLED=true, so applying this file alone changes
-- nothing for visitors.
--
-- Owner decisions (2026-10-19): a second request from the same person on the same day is a NEW request (stored in full and
-- forwarded), linked to the person's previous receipt; a too-fast submission asks the visitor to confirm instead of being
-- dropped; a no-JS error page keeps what was typed.
--
-- Identity of one submission (computed by functions/v1/[[route]].js, keyed with the existing EMAIL_HASH_SECRET):
--   dedupe_key = HMAC('submission:' || browser submission key)   with JS (one random key per submission attempt), or
--                HMAC('submission-body:' || body_hash)           without JS (identical content = the same submission).
--   body_hash  = HMAC('body:' || canonical JSON of the validated fields).
-- Same dedupe_key + same body_hash → the existing receipt (a retry). Same dedupe_key + different body_hash → conflict, nothing
-- stored. New dedupe_key → a new receipt; previous_receipt_id points at the same person's latest earlier receipt.
-- Old rows (submission_version 1) keep their day-scoped dedupe_key and are never rewritten.
begin;

alter table revenue.intake_receipts add column if not exists submission_version smallint not null default 1;
alter table revenue.intake_receipts add column if not exists body_hash text;
alter table revenue.intake_receipts add column if not exists previous_receipt_id uuid;   -- deliberately no FK: erasure deletes receipts
alter table revenue.intake_receipts add column if not exists risk text;

alter table revenue.intake_receipts drop constraint if exists intake_receipts_submission_version_check;
alter table revenue.intake_receipts add constraint intake_receipts_submission_version_check check (submission_version in (1, 2));
alter table revenue.intake_receipts drop constraint if exists intake_receipts_body_hash_check;
alter table revenue.intake_receipts add constraint intake_receipts_body_hash_check
  check ((submission_version = 1 and body_hash is null) or (submission_version = 2 and body_hash ~ '^[0-9a-f]{64}$'));
alter table revenue.intake_receipts drop constraint if exists intake_receipts_risk_check;
alter table revenue.intake_receipts add constraint intake_receipts_risk_check check (risk is null or risk in ('fast_fill_confirmed'));
create index if not exists intake_receipts_subject_recent on revenue.intake_receipts (subject_email_hash, received_at desc);

-- Erasure replay guard (2026-10-19-consent-scope.sql), extended: also keep the content fingerprint, so after an erasure the same
-- content is refused on any day and under any new submission key. Rows hold keyed hashes only.
create or replace function revenue.intake_receipts_keep_replay_guard() returns trigger
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  insert into revenue.erasure_replay_guards (dedupe_key, subject_email_hash) values (old.dedupe_key, old.subject_email_hash)
  on conflict (dedupe_key) do nothing;
  if old.body_hash is not null then
    insert into revenue.erasure_replay_guards (dedupe_key, subject_email_hash) values (old.body_hash, old.subject_email_hash)
    on conflict (dedupe_key) do nothing;
  end if;
  return old;
end $$;

create or replace function revenue.intake_receipts_refuse_replay() returns trigger
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  if exists (select 1 from revenue.erasure_replay_guards g where g.dedupe_key = new.dedupe_key or g.dedupe_key = new.body_hash) then
    raise exception 'record_intake: erased_replay' using errcode = 'P0001';
  end if;
  return new;
end $$;

-- One submission → at most one receipt. Returns { receipt_id, received_at, deduped, previous_receipt_id } or { conflict: true }.
create or replace function revenue.record_intake_v2(p jsonb, p_consents jsonb default '[]'::jsonb) returns jsonb
language plpgsql
security definer
set search_path = revenue, pg_temp
as $$
declare
  ex revenue.intake_receipts;
  rid uuid;
  rat timestamptz;
  prev uuid;
begin
  if p is null or coalesce((p->>'consent_request')::boolean, false) is not true then
    raise exception 'record_intake_v2: request consent is required';
  end if;
  if coalesce(p->>'dedupe_key', '') !~ '^[0-9a-f]{64}$' or coalesce(p->>'body_hash', '') !~ '^[0-9a-f]{64}$' then
    raise exception 'record_intake_v2: submission keys are required';
  end if;

  select * into ex from revenue.intake_receipts where dedupe_key = p->>'dedupe_key';
  if found then
    if ex.body_hash is distinct from p->>'body_hash' then return jsonb_build_object('conflict', true); end if;
    return jsonb_build_object('receipt_id', ex.receipt_id, 'received_at', ex.received_at, 'deduped', true, 'previous_receipt_id', ex.previous_receipt_id);
  end if;

  if p->>'subject_email_hash' is not null then
    select receipt_id into prev from revenue.intake_receipts
    where subject_email_hash = p->>'subject_email_hash' order by received_at desc, receipt_id desc limit 1;
  end if;

  insert into revenue.intake_receipts (dedupe_key, form_version, payload, consent_request, consent_newsletter, consent_notice_version,
                                       utm, self_reported_source, ip_hash, subject_email_hash, submission_version, body_hash,
                                       previous_receipt_id, risk)
  values (p->>'dedupe_key', coalesce(p->>'form_version', 'unknown'), p->'payload', true, coalesce((p->>'consent_newsletter')::boolean, false),
          p->>'consent_notice_version', coalesce(p->'utm', '{}'::jsonb), p->>'self_reported_source', p->>'ip_hash', p->>'subject_email_hash',
          2, p->>'body_hash', prev, p->>'risk')
  on conflict (dedupe_key) do nothing
  returning receipt_id, received_at into rid, rat;

  if rid is null then   -- a concurrent request with the same submission won the insert
    select * into ex from revenue.intake_receipts where dedupe_key = p->>'dedupe_key';
    if ex.body_hash is distinct from p->>'body_hash' then return jsonb_build_object('conflict', true); end if;
    return jsonb_build_object('receipt_id', ex.receipt_id, 'received_at', ex.received_at, 'deduped', true, 'previous_receipt_id', ex.previous_receipt_id);
  end if;

  insert into revenue.consent_events (receipt_id, subject_email_hash, consent_type, granted, notice_version, source)
  select rid, p->>'subject_email_hash', c->>'consent_type', coalesce((c->>'granted')::boolean, false), p->>'consent_notice_version', 'quote_form'
  from jsonb_array_elements(coalesce(p_consents, '[]'::jsonb)) as c
  where c->>'consent_type' in ('request_contact', 'newsletter');

  return jsonb_build_object('receipt_id', rid, 'received_at', rat, 'deduped', false, 'previous_receipt_id', prev);
end;
$$;

revoke all on function revenue.record_intake_v2(jsonb, jsonb) from public, anon, authenticated;
grant execute on function revenue.record_intake_v2(jsonb, jsonb) to service_role;
revoke all on function revenue.intake_receipts_keep_replay_guard() from public, anon, authenticated, service_role;
revoke all on function revenue.intake_receipts_refuse_replay() from public, anon, authenticated, service_role;
commit;
