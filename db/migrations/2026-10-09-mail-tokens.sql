-- Idempotent migration: Microsoft 365 connection for site mail (GitHub qianquandong/revenue-os#2).
-- Owner decision 2026-10-09: booking email goes out through Jack's Microsoft 365 mailbox (jack@aimanjack.com) via Graph,
-- delegated permission Mail.Send. One row (provider='m365') holds the refresh token, AES-256-GCM-sealed with the Pages
-- secret M365_TOKEN_KEY (the database never sees it in clear), plus a pending device-code sign-in while one runs.
-- See src/m365-mail.mjs.
--
-- Run (owner-authorized production change):  node scripts/supabase-sql.mjs db/migrations/2026-10-09-mail-tokens.sql
-- Reversal: `drop table booking.mail_tokens;` (disconnects the mailbox; also revoke the app's consent in My Account →
--           https://myapps.microsoft.com or delete the app registration).

create table if not exists booking.mail_tokens (
  provider text primary key check (provider in ('m365')),
  account text,                         -- the connected mailbox (must equal M365_SENDER; enforced in code)
  refresh_token_enc text,               -- 'v1.' + base64(iv|AES-GCM ciphertext); null = not connected
  pending_device_enc text,              -- sealed device code of a sign-in in progress (never sent to the browser)
  pending_expires_at timestamptz,
  connected_at timestamptz,
  generation int not null default 0,    -- bumped by every connect/disconnect; token rotation only writes if unchanged
  needs_reconnect boolean not null default false,   -- set when Microsoft refuses the refresh (revoked / expired)
  last_error text,                      -- error code only
  last_refresh_at timestamptz,          -- keep-alive refreshes weekly (refresh tokens die after 90 idle days)
  updated_at timestamptz not null default now()
);

alter table booking.mail_tokens enable row level security;

do $$
begin
  perform 1 from pg_roles where rolname = 'service_role';
  if found then
    grant all on booking.mail_tokens to service_role;
  end if;
  revoke all on booking.mail_tokens from public, anon, authenticated;
exception when others then null;
end $$;
