# Booking email: sender, delivery ledger, owner view

Tracked in GitHub `qianquandong/revenue-os#2`.

**Owner decision (2026-10-09):** "好，那就用 booking-no-reply@aimanjack.com 吧"

Transactional booking mail is sent from `AI Man Jack <booking-no-reply@aimanjack.com>`, with `Reply-To: jack@aimanjack.com`. Cold outbound never uses `aimanjack.com`; it lives on `getaimanjack.com`.

## 1. Email paths inventory (nothing moved silently)

| Lane | Code | From | Reply-To | To | Changed by #2? |
|---|---|---|---|---|---|
| Booking: created, rescheduled, cancelled (customer) | `src/booking-notify.mjs` via `notify()` | `BOOKING_EMAIL_FROM` = booking-no-reply@aimanjack.com | `BOOKING_REPLY_TO` = jack@aimanjack.com | `customer_email`, if given | **yes** |
| Booking: owner notice | same | same | the customer's email | `OWNER_EMAIL` (secret) | **yes** |
| $25 coupon (customer) | `claimCoupon()` / `sendMail()` | `EMAIL_FROM` = bookings@aimanjack.com | `OWNER_EMAIL` | claimant | no (inventoried only) |
| Coupon owner notice | same | same | claimant | `OWNER_EMAIL` | no |

Changing the coupon lane would need its own owner decision.

## 2. What changed in code

- **Durable ledger.** `booking.notifications` (migration `db/migrations/2026-10-09-booking-notifications.sql`) gets one row per booking event per recipient role. The row is written before sending.
- **Provider result per recipient.** Cloudflare's REST response lists `delivered`, `queued` and `permanent_bounces` for each recipient. It returns **no message id, and there are no delivery webhooks**. So:
  - `delivered` means the recipient's mail server accepted the message. It is **not** proof the message reached the inbox.
  - Only the live end-to-end check (§6) proves inbox receipt.
- **Retries.** Provider errors (HTTP 429, 5xx or 4xx) back off at 1 min, 5 min, 30 min and 2 h. After 5 attempts the row becomes `dead` and the owner is alerted.
  - Bounces are never retried. The owner page will not resend to a bounced address; only an explicit `include_bounced` request does.
  - **Configuration gaps** (`config_missing:CF_EMAIL_TOKEN` / `OWNER_EMAIL` / `CF_ACCOUNT_ID`) do not use up attempts. They re-check every 30 min until fixed, and the owner is alerted once if a row is still failing after 30 min.
- **No double send, no out-of-order mail.**
  - A row is claimed with an optimistic-concurrency update before sending.
  - The `dedupe_key` comes from the booking state, so a double-submitted cancel, a replayed create or two identical concurrent reschedules produce **one** message.
  - A cancel that changed nothing, because the booking was already cancelled, sends nothing.
  - An unsent older message is marked `superseded` when a newer message to the same recipient exists. A "Confirmed" retry never arrives after "Cancelled".
  - A row is marked `uncertain` and never auto-resent when either:
    - a worker died while the row was in `sending`;
    - the request failed on the network after it was sent.

    The message may already be out. The owner decides on `/admin/bookings/`, and resending asks for confirmation.
- **An email problem never fails a booking.** The event log and notifications run after the booking has committed, so neither can turn it into a 500.
- **When retries run.** Pages Functions have no cron, so due rows are retried:
  - right after each write;
  - on public `/v1/availability` traffic (at most once a minute per isolate);
  - on `POST /v1/notifications/process` (admin; the owner page has a button). **With no traffic, retries wait.** A scheduled caller, for example a Revenue OS scheduler job hitting `/process` every 10 min, is the recommended follow-up. It is not built yet.
- **Alerts.** Optional `ALERT_NTFY_URL` (ntfy topic) alerts on `bounced`, `dead` and `uncertain`. Alerts carry ids and codes only, never addresses or names.
- **Owner view.** `https://aimanjack.com/admin/bookings/` is iPhone-friendly. Enter the admin token once per tab (stored in session storage). It shows upcoming bookings by day with:
  - name, phone, email, note and source;
  - per-message email status;
  - a "Resend these" button for failed or uncertain messages;
  - the effective email settings.
- **Settings check.** `GET /v1/admin/email-config` (admin) shows the **effective** sender, Reply-To and `OWNER_EMAIL` of the running deployment. The owner email is masked, for example `j***k@aimanjack.com`.
- **`source='admin'` is an explicit choice.** When the owner changes a booking from the admin side, the customer is told but the owner gets no notice about their own action. `X-Source: admin` is honoured **only with the admin token**; a public caller claiming it is treated as `web`, so it cannot suppress the owner's notice. Web, voice and SMS notify both.
- **The agents' list response is unchanged.** `GET /v1/bookings?business=…` (used by the voice and SMS agents) keeps its old shape. Only `&with=notifications` (the owner page) adds email states, and only ids, kinds, roles, states and error codes; the ledger's addresses are not returned.
- **Logs** carry status and error codes only: no addresses, names or booking ids.
- **Coupon lane.** Its Reply-To falls back to `BOOKING_REPLY_TO` (jack@aimanjack.com) when the `OWNER_EMAIL` secret is absent. That keeps the previous effective value after `OWNER_EMAIL` left `[vars]`.
- **`deploy.sh` and `.deployignore`.**
  - The test gate now runs `node --test tests/*.test.mjs`. The old `tests/` directory form fails on Node 22, which made every deploy refuse.
  - `tests/` is no longer copied into the published site.

## 3. Findings that block "live"

Public DNS was checked 2026-10-09 via dns.google.

| Item | Observed | Meaning |
|---|---|---|
| Nameservers | `ziggy/dom.ns.cloudflare.com` | aimanjack.com is a Cloudflare zone, so it can be onboarded to Email Sending |
| MX | `mx1/2/3-usg2.ppe-hosted.com` (Proofpoint, then M365) | Inbound must stay exactly like this |
| Apex SPF | `v=spf1 include:_spf-usg2.ppe-hosted.com include:secureserver.net ~all` | Unchanged by sending onboarding (it uses a subdomain) |
| `_dmarc` | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` | Unaligned mail is quarantined |
| `cf-bounce._domainkey.aimanjack.com` | **NXDOMAIN** | aimanjack.com is **not onboarded** to Cloudflare Email Sending yet. Mail from booking-no-reply@ cannot pass DMARC today. |
| `CF_EMAIL_TOKEN` | Absent as of the 2026-09-15 secret listing (agent-os state); not re-checked | If still absent, **no booking email has been sent at all**. The old code returned silently. |
| `OWNER_EMAIL` | Was a `[vars]` entry in `wrangler.toml` | Cloudflare: *"When used in your Pages Functions projects, your Wrangler file is the source of truth… you will be able to see, but not edit"* the same fields in the dashboard. **A dashboard change to OWNER_EMAIL could not take effect while it lived in wrangler.toml.** It is now removed from `[vars]` and must be set as a secret. |

Sources:
- https://developers.cloudflare.com/email-service/configuration/domains/
- https://developers.cloudflare.com/email-service/api/send-emails/rest-api/
- https://developers.cloudflare.com/pages/functions/wrangler-configuration/

## 4. DNS / onboarding plan

This requires an **owner-signed DNS change**. Nothing has been applied.

1. Dashboard: **Compute → Email Service → Email Sending → Onboard Domain → aimanjack.com**. Cloudflare's documented additions, all on the `cf-bounce` subdomain:
   - `cf-bounce.aimanjack.com` MX → `route1/2/3.mx.cloudflare.net` (bounce processing)
   - `cf-bounce.aimanjack.com` TXT `v=spf1 include:_spf.mx.cloudflare.net ~all`
   - `cf-bounce._domainkey.aimanjack.com` TXT (DKIM key)
   - a `_dmarc` record. **Keep the existing `_dmarc` record** (`p=quarantine`). If the wizard proposes replacing it, for example with its `p=reject` example, decline and keep the current one.
2. **Do not touch** the apex MX, apex SPF, autodiscover or any Microsoft 365/Proofpoint record.
3. Alignment, once onboarded:
   - Return-Path `cf-bounce.aimanjack.com` is relaxed-aligned with `aimanjack.com`.
   - DKIM `d=aimanjack.com` is aligned.
   - DMARC passes.
4. Proofpoint risk: Proofpoint may quarantine an "external sender using our own domain" even when DMARC passes. If the owner notices land in quarantine, add a sender exception in Proofpoint. That is owner-side configuration.
5. Rollback:
   - delete the three `cf-bounce*` records;
   - remove the domain under Email Sending;
   - redeploy the previous commit.

   None of these affect inbound mail.

## 5. Deployment order

Every step is an owner-authorized production change.

1. Onboard the domain (§4) and confirm `cf-bounce._domainkey.aimanjack.com` resolves.
2. `npx wrangler pages secret put CF_EMAIL_TOKEN --project-name aimanjack` (Email Sending → Edit).
3. `npx wrangler pages secret put OWNER_EMAIL --project-name aimanjack`. Do this **before** deploying: the var was removed from `wrangler.toml`, so an unset secret means owner notices are recorded as `config_missing:OWNER_EMAIL`.
4. Optional: `ALERT_NTFY_URL` (+ `ALERT_NTFY_TOKEN`).
5. Apply the migration: `node scripts/supabase-sql.mjs db/migrations/2026-10-09-booking-notifications.sql`.
6. `sh deploy.sh --preview`. Check `GET /v1/admin/email-config` on the preview, then deploy production.
7. Run the live E2E (§6).

## 6. Live end-to-end (proves inbox receipt; owner approval required)

`ADMIN_TOKEN=… node scripts/booking-email-e2e.mjs https://aimanjack.com <owner-controlled test inbox> --approved "<owner quote>"`

The script:
1. books one labelled test appointment ("E2E TEST — DO NOT CALL") in the furthest-out slot;
2. reschedules it, then cancels it;
3. waits for the ledger after each step;
4. prints the inbox and header checklist (From, Reply-To, `spf/dkim/dmarc=pass`, Proofpoint quarantine).

It touches no other booking.

**Do not mark any acceptance criterion live without that checklist completed in real inboxes.**
