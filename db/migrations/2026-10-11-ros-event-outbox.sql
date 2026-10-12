-- NOT APPLIED. Requires db/schema.sql and 2026-10-08-revenue-intake.sql.
-- Transactional source triggers: saving a booking/intake and its delivery intent is one transaction.
-- No historical backfill, scheduler activation, credentials or outbound requests in this migration.
-- Event bodies containing inquiry PII are reconstructed from the original receipt, never copied here.
-- Deleting the original receipt/booking also deletes pending delivery and replay records.
begin;
alter table booking.bookings add column if not exists ros_utm jsonb not null default '{}'::jsonb;
create or replace function booking.create_booking(p jsonb) returns boolean language plpgsql as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext((p->>'business_id') || '/' || (p->>'staff_id')));
  select count(*) into n from booking.bookings
   where business_id = p->>'business_id' and staff_id = p->>'staff_id' and status = 'confirmed'
     and end_at > (p->>'lo')::timestamptz and start_at < (p->>'hi')::timestamptz;
  if n >= (p->>'capacity')::int then return false; end if;
  insert into booking.bookings (id, business_id, service_id, staff_id, start_at, end_at, customer_name, customer_phone, customer_email, note, source, idempotency_key, ros_utm)
  values (p->>'id', p->>'business_id', p->>'service_id', p->>'staff_id', (p->>'start_at')::timestamptz, (p->>'end_at')::timestamptz,
          p->>'customer_name', p->>'customer_phone', p->>'customer_email', p->>'note', coalesce(p->>'source', 'web'), p->>'idempotency_key', coalesce(p->'ros_utm','{}'::jsonb));
  return true;
end $$;

create table if not exists revenue.ros_events (
  id bigserial primary key,
  event_id text not null unique default ('site:' || gen_random_uuid()::text),
  target text not null check (target in ('booking','website')),
  stream_key text not null,
  booking_id text references booking.bookings(id) on delete cascade,
  receipt_id uuid references revenue.intake_receipts(receipt_id) on delete cascade,
  event_data jsonb not null,
  status text not null default 'pending' check (status in ('pending','sending','retry','delivered','dead')),
  attempts int not null default 0,
  total_attempts int not null default 0,
  replays int not null default 0,
  next_attempt_at timestamptz not null default now(),
  lease_token uuid,
  lease_until timestamptz,
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  alerted_at timestamptz,
  alert_token uuid,
  alert_lease_until timestamptz,
  next_alert_at timestamptz not null default now(),
  check ((target='booking' and booking_id is not null and receipt_id is null)
      or (target='website' and receipt_id is not null and booking_id is null))
);
create unique index if not exists ros_intake_once on revenue.ros_events(receipt_id) where receipt_id is not null;
create index if not exists ros_events_due on revenue.ros_events(status,next_attempt_at);
create index if not exists ros_events_stream on revenue.ros_events(stream_key,id);
alter table revenue.ros_events enable row level security;

create table if not exists revenue.ros_event_replays (
  id bigserial primary key,
  event_row_id bigint not null references revenue.ros_events(id) on delete cascade,
  requested_at timestamptz not null default now(),
  previous_status text not null,
  previous_attempts int not null
);
alter table revenue.ros_event_replays enable row level security;

create or replace function revenue.ros_capture_booking() returns trigger
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
declare kind text; duration integer; zone text;
begin
  if new.business_id <> 'aimanjack' or new.service_id <> 'demo-call' then return new; end if;
  if tg_op='INSERT' then kind := case when new.status='cancelled' then 'canceled' else 'created' end;
  elsif new.status='cancelled' and old.status is distinct from new.status then kind := 'canceled';
  elsif new.status='confirmed' and (old.start_at,old.staff_id) is distinct from (new.start_at,new.staff_id) then kind := 'rescheduled';
  else return new; end if;
  select s.duration_min,b.tz into strict duration,zone from booking.services s
    join booking.businesses b on b.id=s.business_id where s.business_id=new.business_id and s.id=new.service_id;
  insert into revenue.ros_events(target,stream_key,booking_id,event_data)
  values ('booking','booking:'||new.id,new.id,jsonb_build_object(
    'schema','aimanjack.booking.v1','event_type','booking.'||kind,'booking_id',new.id,
    'business_id',new.business_id,'service_id',new.service_id,'starts_at',new.start_at,
    'duration_min',duration,'timezone',zone,'occurred_at',clock_timestamp(),'utm',new.ros_utm));
  return new;
end $$;
drop trigger if exists ros_booking_event on booking.bookings;
create trigger ros_booking_event after insert or update on booking.bookings
  for each row execute function revenue.ros_capture_booking();

create or replace function revenue.ros_capture_intake() returns trigger
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  insert into revenue.ros_events(target,stream_key,receipt_id,event_data)
  values ('website','intake:'||new.receipt_id,new.receipt_id,jsonb_build_object('event_type','intake.received'));
  return new;
end $$;
drop trigger if exists ros_intake_event on revenue.intake_receipts;
create trigger ros_intake_event after insert on revenue.intake_receipts
  for each row execute function revenue.ros_capture_intake();

create or replace function revenue.ros_claim(p_limit integer default 2) returns setof revenue.ros_events
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  -- Timeout may mean the receiver committed. Retry SAME id: receiver deduplication makes that safe.
  update revenue.ros_events set status=case when attempts>=5 then 'dead' else 'retry' end,
    lease_token=null,lease_until=null,last_error='lease_expired',next_attempt_at=clock_timestamp()
    where status='sending' and lease_until<clock_timestamp();
  return query
    with due as (
      select e.id from revenue.ros_events e
      where e.status in ('pending','retry') and e.attempts<5 and e.next_attempt_at<=clock_timestamp()
        and not exists(select 1 from revenue.ros_events prior where prior.stream_key=e.stream_key
          and prior.id<e.id and prior.status<>'delivered')
      order by e.id for update of e skip locked limit greatest(1,least(coalesce(p_limit,2),2))
    )
    update revenue.ros_events e set status='sending',attempts=e.attempts+1,total_attempts=e.total_attempts+1,
      lease_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '90 seconds'
    from due where e.id=due.id returning e.*;
end $$;

create or replace function revenue.ros_finish(p_id bigint,p_token uuid,p_ok boolean,p_error text default null) returns boolean
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  if p_ok is null or (not p_ok and (p_error is null or p_error !~ '^[a-z0-9_:.-]{1,96}$')) then
    raise exception 'invalid delivery result';
  end if;
  update revenue.ros_events set
    status=case when p_ok then 'delivered' when attempts>=5 then 'dead' else 'retry' end,
    delivered_at=case when p_ok then clock_timestamp() else null end,
    next_attempt_at=clock_timestamp()+make_interval(mins => (array[1,5,30,120,120])[least(attempts,5)]),
    last_error=case when p_ok then null else p_error end,lease_token=null,lease_until=null
  where id=p_id and status='sending' and lease_token=p_token;
  return found;
end $$;

create or replace function revenue.ros_replay(p_id bigint) returns boolean
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
declare r revenue.ros_events;
begin
  select * into r from revenue.ros_events where id=p_id for update;
  if not found or r.status not in ('retry','dead') then return false; end if;
  insert into revenue.ros_event_replays(event_row_id,previous_status,previous_attempts) values(r.id,r.status,r.attempts);
  update revenue.ros_events set status='pending',attempts=0,replays=replays+1,next_attempt_at=clock_timestamp(),
    last_error='owner_replay',alerted_at=null,alert_token=null,alert_lease_until=null,next_alert_at=clock_timestamp()
    where id=p_id;
  return true;
end $$;

create or replace function revenue.ros_claim_alert() returns setof revenue.ros_events
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  return query
    with due as (
      select id from revenue.ros_events where alerted_at is null and next_alert_at<=clock_timestamp()
        and (alert_token is null or alert_lease_until<clock_timestamp())
        and (status='dead' or (status in ('pending','retry') and created_at<clock_timestamp()-interval '30 minutes'))
      order by id for update skip locked limit 1
    ) update revenue.ros_events e set alert_token=gen_random_uuid(),alert_lease_until=clock_timestamp()+interval '90 seconds'
      from due where e.id=due.id returning e.*;
end $$;

create or replace function revenue.ros_finish_alert(p_id bigint,p_token uuid,p_ok boolean) returns boolean
language plpgsql security definer set search_path = pg_catalog, pg_temp as $$
begin
  update revenue.ros_events set alerted_at=case when p_ok then clock_timestamp() else null end,
    alert_token=null,alert_lease_until=null,next_alert_at=clock_timestamp()+interval '5 minutes'
    where id=p_id and alert_token=p_token;
  return found;
end $$;

create or replace function revenue.ros_ready() returns boolean
language sql security definer set search_path = pg_catalog, pg_temp as $$
  select count(*)=2 from pg_trigger where not tgisinternal and tgenabled in ('O','A') and
    ((tgrelid='booking.bookings'::regclass and tgname='ros_booking_event') or
     (tgrelid='revenue.intake_receipts'::regclass and tgname='ros_intake_event'));
$$;

-- RLS + service-role only; triggers/RPCs run with a fixed, qualified search path.
revoke all on revenue.ros_events,revenue.ros_event_replays from public,anon,authenticated,service_role;
grant select on revenue.ros_events,revenue.ros_event_replays to service_role;
revoke all on sequence revenue.ros_events_id_seq,revenue.ros_event_replays_id_seq from public,anon,authenticated,service_role;
do $$ declare f regprocedure; begin
  for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='revenue' and p.proname like 'ros_%'
  loop
    execute format('revoke all on function %s from public,anon,authenticated',f);
    execute format('grant execute on function %s to service_role',f);
  end loop;
end $$;
commit;
