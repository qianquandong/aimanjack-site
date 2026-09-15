-- Idempotent migration: atomic fixed-window coupon request rate limits (t_dc9d6867).
-- Stores SHA-256 keys only; raw IP addresses and email addresses are not persisted here.
-- Run: node scripts/supabase-sql.mjs db/migrations/2026-09-14-coupon-rate-limits.sql

create table if not exists booking.coupon_rate_limits (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null default now(),
  requests integer not null default 1 check (requests > 0),
  updated_at timestamptz not null default now()
);

create index if not exists coupon_rate_limits_updated_at
  on booking.coupon_rate_limits (updated_at);

alter table booking.coupon_rate_limits enable row level security;

create or replace function booking.take_coupon_rate_limit(
  p_key_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 60
) returns boolean
language plpgsql
security definer
set search_path = booking, pg_temp
as $$
declare
  current_requests integer;
  cutoff timestamptz := clock_timestamp() - make_interval(secs => p_window_seconds);
begin
  if p_key_hash is null or p_limit is null or p_window_seconds is null
     or p_key_hash !~ '^[0-9a-f]{64}$' or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid coupon rate-limit input';
  end if;

  delete from booking.coupon_rate_limits
  where updated_at < clock_timestamp() - interval '1 day';

  insert into booking.coupon_rate_limits (key_hash, window_start, requests, updated_at)
  values (p_key_hash, clock_timestamp(), 1, clock_timestamp())
  on conflict (key_hash) do update set
    requests = case
      when coupon_rate_limits.window_start <= cutoff then 1
      else coupon_rate_limits.requests + 1
    end,
    window_start = case
      when coupon_rate_limits.window_start <= cutoff then clock_timestamp()
      else coupon_rate_limits.window_start
    end,
    updated_at = clock_timestamp()
  returning requests into current_requests;

  return current_requests <= p_limit;
end;
$$;

grant all on booking.coupon_rate_limits to service_role;
grant execute on function booking.take_coupon_rate_limit(text, integer, integer) to service_role;
revoke all on booking.coupon_rate_limits from public, anon, authenticated;
revoke execute on function booking.take_coupon_rate_limit(text, integer, integer) from public, anon, authenticated;
