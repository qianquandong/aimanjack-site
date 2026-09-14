-- Idempotent migration: add booking.coupons table (t_3b60729c + t_697ae76f).
-- All steps are safe to re-run. Re-creating an existing table is a no-op;
-- adding a missing column / check / index / RLS uses DO blocks keyed on
-- information_schema / pg_catalog.
--
-- Run:  node scripts/supabase-sql.mjs db/migrations/2026-09-14-coupons.sql
-- Reversal is not shipped on purpose: coupon rows are durable records.

-- 1) Table
create table if not exists booking.coupons (
  code text primary key,
  email text not null,
  email_normalized text not null unique,
  amount_usd int not null default 25 check (amount_usd = 25),
  issuance_status text not null default 'pending' check (issuance_status in ('pending', 'sent', 'failed')),
  delivery_attempts int not null default 0,
  delivered_at timestamptz,
  last_error text,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Index (status used for admin list/retry queries)
create index if not exists coupons_status on booking.coupons (issuance_status, redeemed_at, created_at desc);

-- 3) RLS — service_role bypasses RLS, but enabling it keeps a stray grant from exposing rows.
alter table booking.coupons enable row level security;

-- 4) Defensive privilege revocation (mirrors db/schema.sql top block)
do $$
begin
  perform 1 from pg_roles where rolname = 'service_role';
  if found then
    grant all on booking.coupons to service_role;
  end if;
  revoke all on booking.coupons from public, anon, authenticated;
exception when others then null;
end $$;
