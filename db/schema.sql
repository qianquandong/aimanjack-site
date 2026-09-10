-- Booking system schema (BOOKING-PLAN.md §1–2) — Postgres on Supabase, project aimanjack-crm, schema `booking`.
-- Apply (idempotent):  node scripts/supabase-sql.mjs db/schema.sql
-- Then once:           node scripts/supabase-sql.mjs --expose booking     (PostgREST must serve the schema)
-- Only service_role can touch this schema; anon/authenticated get nothing. The API uses the secret key.

create schema if not exists booking;

create table if not exists booking.businesses (
  id text primary key,                          -- slug, e.g. 'aimanjack'
  name text not null,
  tz text not null default 'America/Chicago',
  min_lead_min int not null default 60,
  max_days_ahead int not null default 30,
  cancel_window_hours int not null default 2,
  owner_phone text,                             -- gets the summary SMS (W3)
  created_at timestamptz not null default now()
);

create table if not exists booking.services (
  business_id text not null references booking.businesses(id),
  id text not null,
  name text not null,
  duration_min int not null,
  buffer_min int not null default 0,
  capacity int not null default 1,              -- bookings allowed in the same slot per staff (time-window services)
  active boolean not null default true,
  primary key (business_id, id)
);

create table if not exists booking.staff (
  business_id text not null references booking.businesses(id),
  id text not null,
  name text not null,
  active boolean not null default true,
  primary key (business_id, id)
);

-- Weekly opening hours. staff_id null = every staff member. Lunch = two rows per day.
create table if not exists booking.availability_rules (
  id bigserial primary key,
  business_id text not null references booking.businesses(id),
  staff_id text,
  weekday smallint not null check (weekday between 0 and 6),   -- 0 = Sunday (business tz)
  start_hm text not null,                       -- 'HH:MM' local
  end_hm text not null
);

-- Holidays, PTO, one-off closures. staff_id null = whole business.
create table if not exists booking.blocks (
  id bigserial primary key,
  business_id text not null references booking.businesses(id),
  staff_id text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text
);

create table if not exists booking.bookings (
  id text primary key,                          -- random; also the customer's manage token (/book/?id=…)
  business_id text not null references booking.businesses(id),
  service_id text not null,
  staff_id text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  customer_name text not null,
  customer_phone text not null,                 -- E.164
  customer_email text,
  note text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  source text not null default 'web' check (source in ('web', 'voice', 'sms', 'admin')),
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (business_id, service_id) references booking.services (business_id, id),
  foreign key (business_id, staff_id) references booking.staff (business_id, id)
);
create index if not exists bookings_slot on booking.bookings (business_id, staff_id, status, start_at);
create unique index if not exists bookings_idem on booking.bookings (business_id, idempotency_key);

-- One row per write. Case-study numbers come from here.
create table if not exists booking.events (
  id bigserial primary key,
  business_id text not null,
  booking_id text not null,
  type text not null,                           -- created | rescheduled | cancelled
  source text not null,
  payload jsonb,
  at timestamptz not null default now()
);
create index if not exists events_biz on booking.events (business_id, at);

-- Everything the API needs to render a booking, in one read.
create or replace view booking.bookings_full as
  select b.*, s.name as service_name, s.duration_min, s.buffer_min, s.capacity, st.name as staff_name,
         bz.name as business_name, bz.tz, bz.cancel_window_hours
  from booking.bookings b
  join booking.businesses bz on bz.id = b.business_id
  join booking.services s on s.business_id = b.business_id and s.id = b.service_id
  join booking.staff st on st.business_id = b.business_id and st.id = b.staff_id;

-- Atomic create: per-staff advisory lock → capacity check → insert. No read-then-write race across requests.
-- p: {id, business_id, service_id, staff_id, start_at, end_at, lo, hi, capacity, customer_name, customer_phone, customer_email, note, source, idempotency_key}
create or replace function booking.create_booking(p jsonb) returns boolean language plpgsql as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext((p->>'business_id') || '/' || (p->>'staff_id')));
  select count(*) into n from booking.bookings
   where business_id = p->>'business_id' and staff_id = p->>'staff_id' and status = 'confirmed'
     and end_at > (p->>'lo')::timestamptz and start_at < (p->>'hi')::timestamptz;
  if n >= (p->>'capacity')::int then return false; end if;
  insert into booking.bookings (id, business_id, service_id, staff_id, start_at, end_at, customer_name, customer_phone, customer_email, note, source, idempotency_key)
  values (p->>'id', p->>'business_id', p->>'service_id', p->>'staff_id', (p->>'start_at')::timestamptz, (p->>'end_at')::timestamptz,
          p->>'customer_name', p->>'customer_phone', p->>'customer_email', p->>'note', coalesce(p->>'source', 'web'), p->>'idempotency_key');
  return true;
end $$;

-- Atomic reschedule. p: {id, business_id, staff_id, start_at, end_at, lo, hi, capacity}
create or replace function booking.move_booking(p jsonb) returns boolean language plpgsql as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext((p->>'business_id') || '/' || (p->>'staff_id')));
  select count(*) into n from booking.bookings
   where business_id = p->>'business_id' and staff_id = p->>'staff_id' and status = 'confirmed' and id <> p->>'id'
     and end_at > (p->>'lo')::timestamptz and start_at < (p->>'hi')::timestamptz;
  if n >= (p->>'capacity')::int then return false; end if;
  update booking.bookings set start_at = (p->>'start_at')::timestamptz, end_at = (p->>'end_at')::timestamptz, staff_id = p->>'staff_id', updated_at = now()
   where id = p->>'id' and status = 'confirmed';
  return found;
end $$;

-- Access: service_role only. RLS on (service_role bypasses it) so a stray grant still exposes nothing.
revoke all on schema booking from public, anon, authenticated;
grant usage on schema booking to service_role;
grant all on all tables in schema booking to service_role;
grant all on all sequences in schema booking to service_role;
grant execute on all functions in schema booking to service_role;
alter default privileges in schema booking grant all on tables to service_role;
alter default privileges in schema booking grant all on sequences to service_role;
alter default privileges in schema booking grant execute on functions to service_role;
alter table booking.businesses enable row level security;
alter table booking.services enable row level security;
alter table booking.staff enable row level security;
alter table booking.availability_rules enable row level security;
alter table booking.blocks enable row level security;
alter table booking.bookings enable row level security;
alter table booking.events enable row level security;

-- Seed: AI Man Jack itself (W1). Hours mirror the SMS agent: Mon–Fri 7–9 PM, Sat 10 AM–6 PM, Sunday off.
insert into booking.businesses (id, name, tz, min_lead_min, max_days_ahead, cancel_window_hours, owner_phone)
  values ('aimanjack', 'AI Man Jack', 'America/Chicago', 60, 30, 2, '+18328886016') on conflict do nothing;
insert into booking.services (business_id, id, name, duration_min, buffer_min, capacity)
  values ('aimanjack', 'demo-call', '15-minute demo call with Jack', 15, 0, 1) on conflict do nothing;
insert into booking.staff (business_id, id, name) values ('aimanjack', 'jack', 'Jack Qian') on conflict do nothing;
insert into booking.availability_rules (business_id, staff_id, weekday, start_hm, end_hm)
  select 'aimanjack', null, w, '19:00', '21:00' from generate_series(1, 5) w
  where not exists (select 1 from booking.availability_rules where business_id = 'aimanjack');
insert into booking.availability_rules (business_id, staff_id, weekday, start_hm, end_hm)
  select 'aimanjack', null, 6, '10:00', '18:00'
  where not exists (select 1 from booking.availability_rules where business_id = 'aimanjack' and weekday = 6);
