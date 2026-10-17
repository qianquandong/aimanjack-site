-- INERT ON INITIAL APPLICATION. Independent of ROS and the worksheet CRM funnel.
-- Captures only NEW explicit quote newsletter opt-ins after the database switch is enabled.
-- Applying this migration neither backfills contacts nor enables MailerLite or any campaign.
begin;

create table if not exists revenue.mailerlite_configuration (
  singleton boolean primary key default true check(singleton),
  enabled boolean not null default false,
  daily_limit integer not null default 25 check(daily_limit between 1 and 100),
  tick_limit integer not null default 2 check(tick_limit between 1 and 2),
  tick_token uuid,
  tick_until timestamptz
);
insert into revenue.mailerlite_configuration(singleton) values(true) on conflict do nothing;

create table if not exists revenue.mailerlite_sync_events (
  id bigserial primary key,
  consent_event_id bigint not null unique references revenue.consent_events(event_id),
  receipt_id uuid not null references revenue.intake_receipts(receipt_id) on delete cascade,
  identity_hash text check(identity_hash is null or identity_hash ~ '^[0-9a-f]{64}$'),
  group_id text check(group_id is null or group_id ~ '^[0-9]{1,30}$'),
  status text not null default 'pending' check(status in('pending','processing','retry','uncertain','delivered','suppressed','cancelled','dead')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default clock_timestamp(),
  lease_token uuid,
  lease_until timestamptz,
  mutation_started_at timestamptz,
  last_code text,
  outcome text,
  created_at timestamptz not null default clock_timestamp(),
  completed_at timestamptz
);
create index if not exists mailerlite_sync_due on revenue.mailerlite_sync_events(status,next_attempt_at);

-- Persistent local history prevents a fresh quote event from repeating an uncertain DOI request.
-- No raw email is copied here. This HMAC remains stable under the existing EMAIL_HASH_SECRET.
create table if not exists revenue.mailerlite_identities (
  identity_hash text not null check(identity_hash ~ '^[0-9a-f]{64}$'),
  group_id text not null check(group_id ~ '^[0-9]{1,30}$'),
  state text not null check(state in('attempted','known','suppressed','deleted','forgotten')),
  subscriber_id text check(subscriber_id is null or subscriber_id ~ '^[0-9]{1,30}$'),
  event_id bigint,
  updated_at timestamptz not null default clock_timestamp(),
  primary key(identity_hash,group_id)
);
create table if not exists revenue.mailerlite_daily_budget (
  day date primary key,
  mutations integer not null default 0 check(mutations >= 0)
);
-- Global, durable tombstones survive quote erasure and provider lookup 404. They never contain raw email.
create table if not exists revenue.mailerlite_suppressions (
  identity_hash text primary key check(identity_hash ~ '^[0-9a-f]{64}$'),
  subscriber_id text not null check(subscriber_id ~ '^[0-9]{1,30}$'),
  state text not null check(state in('suppressed','deleted','forgotten')),
  reason text not null check(reason in('unsubscribed','bounced','junk','deleted','forgotten')),
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists mailerlite_suppressions_subscriber on revenue.mailerlite_suppressions(subscriber_id);
create table if not exists revenue.mailerlite_webhook_receipts (
  receipt_hash text primary key check(receipt_hash ~ '^[0-9a-f]{64}$'),
  received_at timestamptz not null default clock_timestamp()
);
alter table revenue.mailerlite_configuration enable row level security;
alter table revenue.mailerlite_sync_events enable row level security;
alter table revenue.mailerlite_identities enable row level security;
alter table revenue.mailerlite_daily_budget enable row level security;
alter table revenue.mailerlite_suppressions enable row level security;
alter table revenue.mailerlite_webhook_receipts enable row level security;

create or replace function revenue.mailerlite_capture_consent() returns trigger
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
begin
  if new.source<>'quote_form' or new.consent_type<>'newsletter' or not new.granted then return new; end if;
  if not exists(select 1 from revenue.mailerlite_configuration where enabled) then return new; end if;
  if not exists(select 1 from revenue.intake_receipts where receipt_id=new.receipt_id) then return new; end if;
  -- Consent events append even when the quote receipt dedupes. Never rely on its immutable initial checkbox value.
  insert into revenue.mailerlite_sync_events(consent_event_id,receipt_id,identity_hash)
    values(new.event_id,new.receipt_id,new.subject_email_hash) on conflict do nothing;
  return new;
end $$;
drop trigger if exists mailerlite_quote_consent on revenue.consent_events;
create trigger mailerlite_quote_consent after insert on revenue.consent_events
for each row execute function revenue.mailerlite_capture_consent();

create or replace function revenue.mailerlite_begin_tick() returns jsonb
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare c revenue.mailerlite_configuration; token uuid;
begin
  select * into strict c from revenue.mailerlite_configuration where singleton for update;
  if not c.enabled then return jsonb_build_object('enabled',false); end if;
  if c.tick_until>clock_timestamp() then return jsonb_build_object('enabled',true,'busy',true); end if;
  token:=gen_random_uuid();
  update revenue.mailerlite_configuration set tick_token=token,tick_until=clock_timestamp()+interval '120 seconds' where singleton;
  return jsonb_build_object('enabled',true,'token',token);
end $$;

create or replace function revenue.mailerlite_end_tick(p_tick uuid) returns boolean
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
begin
  update revenue.mailerlite_configuration set tick_token=null,tick_until=null where singleton and tick_token=p_tick;
  return found;
end $$;

create or replace function revenue.mailerlite_claim(p_tick uuid,p_limit integer default 2)
returns setof revenue.mailerlite_sync_events
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare cap integer;
begin
  select tick_limit into cap from revenue.mailerlite_configuration where singleton and enabled and tick_token=p_tick and tick_until>clock_timestamp();
  if cap is null then return; end if;
  update revenue.mailerlite_sync_events set status=case when attempts>=8 then 'dead' when mutation_started_at is not null then 'uncertain' else 'retry' end,
    lease_token=null,lease_until=null,last_code='lease_expired',next_attempt_at=clock_timestamp()
    where status='processing' and lease_until<clock_timestamp();
  return query with due as (
    select id from revenue.mailerlite_sync_events where status in('pending','retry','uncertain') and attempts<8 and next_attempt_at<=clock_timestamp()
    order by id for update skip locked limit greatest(1,least(coalesce(p_limit,2),cap,2))
  ) update revenue.mailerlite_sync_events e set status='processing',attempts=e.attempts+1,
    lease_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '120 seconds'
    from due where e.id=due.id returning e.*;
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
  select * into latest from revenue.consent_events c where c.subject_email_hash=e.identity_hash and c.consent_type in('newsletter','erasure') order by c.event_id desc limit 1;
  if not found or latest.consent_type<>'newsletter' or not latest.granted then return jsonb_build_object('eligible',false,'reason','latest_consent_not_granted'); end if;
  if latest.occurred_at<clock_timestamp()-interval '30 days' then return jsonb_build_object('eligible',false,'reason','consent_expired'); end if;
  if e.group_id is not null and e.group_id<>p_group then return jsonb_build_object('eligible',false,'reason','group_changed_after_attempt'); end if;
  select * into identity from revenue.mailerlite_identities where identity_hash=e.identity_hash and group_id=p_group;
  select * into tombstone from revenue.mailerlite_suppressions where identity_hash=e.identity_hash or subscriber_id=identity.subscriber_id order by created_at limit 1;
  return jsonb_build_object('eligible',true,'email',address,'name',left(coalesce(r.payload->>'name',''),100),
    'language',case when r.payload->>'lang'='zh' then 'zh' else 'en' end,'local_state',coalesce(tombstone.state,identity.state),
    'creation_history',exists(select 1 from revenue.mailerlite_identities where identity_hash=e.identity_hash),
    'uncertain_history',exists(select 1 from revenue.mailerlite_identities where identity_hash=e.identity_hash and state='attempted'));
end $$;

create or replace function revenue.mailerlite_reserve(p_id bigint,p_token uuid,p_group text,p_creating boolean default false) returns boolean
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare e revenue.mailerlite_sync_events; cap integer; spent integer; today date:=(clock_timestamp() at time zone 'UTC')::date; ctx jsonb;
begin
  select daily_limit into cap from revenue.mailerlite_configuration where singleton and enabled for update;
  if cap is null then return false; end if;
  ctx:=revenue.mailerlite_context(p_id,p_token,p_group);
  if not coalesce((ctx->>'eligible')::boolean,false) or ctx->>'local_state' is not null then return false; end if;
  if coalesce((ctx->>'uncertain_history')::boolean,false) or (coalesce(p_creating,false) and coalesce((ctx->>'creation_history')::boolean,false)) then return false; end if;
  select * into e from revenue.mailerlite_sync_events where id=p_id and lease_token=p_token and status='processing' and mutation_started_at is null for update;
  if not found then return false; end if;
  insert into revenue.mailerlite_daily_budget(day) values(today) on conflict do nothing;
  select mutations into spent from revenue.mailerlite_daily_budget where day=today for update;
  if spent>=cap then return false; end if;
  insert into revenue.mailerlite_identities(identity_hash,group_id,state,event_id) values(e.identity_hash,p_group,'attempted',p_id) on conflict do nothing;
  if not found then return false; end if;
  update revenue.mailerlite_daily_budget set mutations=mutations+1 where day=today;
  update revenue.mailerlite_sync_events set mutation_started_at=clock_timestamp(),group_id=p_group where id=p_id;
  return true;
end $$;

create or replace function revenue.mailerlite_finish(p_id bigint,p_token uuid,p_group text,p_outcome text,p_reason text,p_subscriber text default null) returns boolean
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare e revenue.mailerlite_sync_events; terminal boolean;
begin
  if p_outcome not in('delivered','suppressed','cancelled','retry','retry_rejected','uncertain','dead') or p_reason is null or p_reason !~ '^[a-z0-9_:.-]{1,96}$' or p_group !~ '^[0-9]{1,30}$' or (p_subscriber is not null and p_subscriber !~ '^[0-9]{1,30}$') then raise exception 'invalid_delivery_result'; end if;
  select * into e from revenue.mailerlite_sync_events where id=p_id and status='processing' and lease_token=p_token and lease_until>clock_timestamp() for update;
  if not found then return false; end if;
  terminal:=p_outcome in('delivered','suppressed','cancelled','dead') or e.attempts>=8;
  if p_reason='double_opt_in_unverified' then
    update revenue.mailerlite_configuration set enabled=false where singleton;
  end if;
  update revenue.mailerlite_sync_events set status=case when p_outcome in('retry','retry_rejected','uncertain') and e.attempts>=8 then 'dead' when p_outcome='retry_rejected' then 'retry' else p_outcome end,
    last_code=p_reason,outcome=p_outcome,lease_token=null,lease_until=null,
    mutation_started_at=case when p_outcome='retry_rejected' then null else mutation_started_at end,
    next_attempt_at=clock_timestamp()+make_interval(mins=>(array[1,5,15,30,60,120,240,240])[least(e.attempts,8)]),
    completed_at=case when terminal then clock_timestamp() else null end where id=p_id;
  if e.identity_hash is not null then
    if p_outcome='retry_rejected' then
      -- A documented 429 rejects the attempt. The consumed daily budget is intentionally NOT refunded.
      delete from revenue.mailerlite_identities where identity_hash=e.identity_hash and group_id=p_group and state='attempted' and event_id=p_id;
    elsif p_outcome in('delivered','suppressed') then
      insert into revenue.mailerlite_identities(identity_hash,group_id,state,subscriber_id,event_id)
        values(e.identity_hash,p_group,case when p_outcome='suppressed' then 'suppressed' else 'known' end,p_subscriber,p_id)
      on conflict(identity_hash,group_id) do update set state=case when revenue.mailerlite_identities.state in('suppressed','deleted','forgotten') then revenue.mailerlite_identities.state else excluded.state end,
        subscriber_id=coalesce(excluded.subscriber_id,revenue.mailerlite_identities.subscriber_id),event_id=p_id,updated_at=clock_timestamp();
      if p_outcome='suppressed' and p_subscriber is not null and p_reason in('provider_unsubscribed','provider_bounced','provider_junk','provider_deleted','provider_forgotten') then
        insert into revenue.mailerlite_suppressions(identity_hash,subscriber_id,state,reason)
          values(e.identity_hash,p_subscriber,case when p_reason='provider_forgotten' then 'forgotten' when p_reason='provider_deleted' then 'deleted' else 'suppressed' end,substring(p_reason from 10))
        on conflict(identity_hash) do nothing;
      end if;
    end if;
  end if;
  return true;
end $$;

create or replace function revenue.mailerlite_health() returns jsonb
language sql security definer set search_path=pg_catalog,pg_temp as $$
  select jsonb_build_object('enabled',c.enabled,'dailyLimit',c.daily_limit,'tickLimit',c.tick_limit,
    'mutationsToday',coalesce((select mutations from revenue.mailerlite_daily_budget where day=(clock_timestamp() at time zone 'UTC')::date),0),
    'pending',(select count(*) from revenue.mailerlite_sync_events where status in('pending','processing','retry')),
    'uncertain',(select count(*) from revenue.mailerlite_sync_events where status='uncertain'),
    'dead',(select count(*) from revenue.mailerlite_sync_events where status='dead'),
    'delivered',(select count(*) from revenue.mailerlite_sync_events where status='delivered'),
    'pendingConfirmation',(select count(*) from revenue.mailerlite_sync_events where status='delivered' and last_code='pending_confirmation'),
    'suppressed',(select count(*) from revenue.mailerlite_sync_events where status='suppressed'),
    'suppressionTombstones',(select count(*) from revenue.mailerlite_suppressions),
    'cancelled',(select count(*) from revenue.mailerlite_sync_events where status='cancelled'))
  from revenue.mailerlite_configuration c where singleton;
$$;

create or replace function revenue.mailerlite_suppress(p_items jsonb,p_receipt_hash text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,pg_temp as $$
declare item jsonb; state_value text;
begin
  if p_receipt_hash is null or p_receipt_hash !~ '^[0-9a-f]{64}$' or p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then raise exception 'invalid_suppression'; end if;
  for item in select value from jsonb_array_elements(p_items) loop
    if item->>'identity_hash' is null or item->>'identity_hash' !~ '^[0-9a-f]{64}$' or item->>'subscriber_id' is null or item->>'subscriber_id' !~ '^[0-9]{1,30}$'
      or coalesce(item->>'state','') not in('suppressed','deleted','forgotten') or coalesce(item->>'reason','') not in('unsubscribed','bounced','junk','deleted','forgotten') then raise exception 'invalid_suppression'; end if;
  end loop;
  insert into revenue.mailerlite_webhook_receipts(receipt_hash) values(p_receipt_hash) on conflict do nothing;
  if not found then return jsonb_build_object('duplicate',true); end if;
  for item in select value from jsonb_array_elements(p_items) loop
    state_value:=item->>'state';
    insert into revenue.mailerlite_suppressions(identity_hash,subscriber_id,state,reason)
      values(item->>'identity_hash',item->>'subscriber_id',state_value,item->>'reason')
    on conflict(identity_hash) do update set
      state=case when revenue.mailerlite_suppressions.state='forgotten' or excluded.state='forgotten' then 'forgotten' when revenue.mailerlite_suppressions.state='deleted' or excluded.state='deleted' then 'deleted' else 'suppressed' end,
      reason=case when revenue.mailerlite_suppressions.state in('deleted','forgotten') then revenue.mailerlite_suppressions.reason else excluded.reason end;
    update revenue.mailerlite_identities set state=case when state='forgotten' or state_value='forgotten' then 'forgotten' when state='deleted' or state_value='deleted' then 'deleted' else 'suppressed' end,
      updated_at=clock_timestamp() where identity_hash=item->>'identity_hash' or subscriber_id=item->>'subscriber_id';
    update revenue.mailerlite_sync_events set status='suppressed',last_code='webhook_'||(item->>'reason'),outcome='suppressed',
      lease_token=null,lease_until=null,completed_at=clock_timestamp()
      where identity_hash=item->>'identity_hash' and status in('pending','processing','retry','uncertain');
  end loop;
  return jsonb_build_object('duplicate',false);
end $$;

revoke all on revenue.mailerlite_configuration,revenue.mailerlite_sync_events,revenue.mailerlite_identities,revenue.mailerlite_daily_budget,revenue.mailerlite_suppressions,revenue.mailerlite_webhook_receipts from public,anon,authenticated,service_role;
revoke all on sequence revenue.mailerlite_sync_events_id_seq from public,anon,authenticated,service_role;
do $$ declare f regprocedure; begin
  for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='revenue' and p.proname like 'mailerlite_%'
  loop
    execute format('revoke all on function %s from public,anon,authenticated',f);
    if f::text not like '%mailerlite_capture_consent%' then execute format('grant execute on function %s to service_role',f); end if;
  end loop;
end $$;
commit;
