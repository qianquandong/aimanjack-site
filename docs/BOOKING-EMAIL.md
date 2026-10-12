# Booking email: sender, delivery ledger, owner view

Tracked in GitHub `qianquandong/revenue-os#2`.

## 0. Owner decisions

- 2026-10-09 (first): "好，那就用 booking-no-reply@aimanjack.com 吧", via Cloudflare Email Sending. **Superseded** by the decisions below.
- 2026-10-09 20:32 CT:
  - "不升级": no Cloudflare Workers Paid. Cloudflare Email Sending is not available on Workers Free.
  - Customer email goes through **Jack's Microsoft 365 mailbox, sent as `jack@aimanjack.com`**. Chosen option: "用 M365 邮箱发 — 以 jack@aimanjack.com 发".
  - Owner notices go to `jack@aimanjack.com` ("那就jack@aimanjack.com吧").
  - Built in `src/m365-mail.mjs`, selected by `MAIL_TRANSPORT = "m365"` in `wrangler.toml`.
- 2026-10-09 21:55 CT, owner: "可以，预约就aimanjack一个吧".
  - **Coupon emails** use the same M365 transport (confirmed). The Cloudflare path cannot send on Free, so without this they could not go out at all.
  - Owner booking notices go **only** to `jack@aimanjack.com` (confirmed). No second inbox.

Cold outbound never uses `aimanjack.com`; it lives on `getaimanjack.com`.

## 1. Email paths

| Lane | From | Reply-To | To |
|---|---|---|---|
| Booking confirmation, change or cancel (customer) | `jack@aimanjack.com` (M365) | none (replies reach the sending mailbox) | `customer_email`, if given and valid |
| Booking owner notice | `jack@aimanjack.com` (M365) | the customer's email, if valid | `OWNER_EMAIL` = `jack@aimanjack.com` (`[env.production.vars]`; comma-separated for several, max 5) |
| $25 coupon (customer) | `jack@aimanjack.com` (M365) | none | claimant |
| Coupon owner notice | `jack@aimanjack.com` (M365) | claimant | each `OWNER_EMAIL` inbox |

Every message sent through M365 is also saved in the mailbox's **Sent Items**.

## 2. Microsoft 365 transport

- **Tenant:** aimanjack.com is a **GoDaddy-federated** Microsoft 365 tenant, `7b2782a2-fd4d-42e2-b5e5-97d3999d2f0f`. Sign-in goes through `sso.godaddy.com`.
- **Delegated permission (default, least privilege).**
  - An app registration with Graph **delegated `Mail.Send`**, with public client flows allowed.
  - The owner connects **once** on `/admin/bookings/` → **Connect Microsoft 365**. The page shows a code; the owner opens https://microsoft.com/devicelogin on any device, signs in as jack@aimanjack.com and accepts "Send mail as you".
  - The site can send **only as the mailbox that signed in**. Connecting any mailbox other than `M365_SENDER` is refused.
  - No admin consent is needed if the tenant allows user consent.
- **Token storage.**
  - The refresh token is sealed with AES-256-GCM, using the Pages secret `M365_TOKEN_KEY`, and stored in `booking.mail_tokens` (migration `db/migrations/2026-10-09-mail-tokens.sql`). The device code never reaches the browser.
  - A weekly keep-alive refresh prevents the 90-day idle expiry.
  - A revoked or expired sign-in is flagged on the owner page and alerted **once**.
  - **Disconnect** stops every isolate at its next send. To revoke at Microsoft too, use https://myapps.microsoft.com.
- **App permission (fallback, `M365_AUTH = "app"`).** Application `Mail.Send` with admin consent and `M365_CLIENT_SECRET`. It can send as *any* mailbox in the tenant unless an Exchange application access policy limits it. Use it only if delegated consent is blocked and admin consent is possible.
- **Result mapping.** Graph `sendMail` returns no per-recipient result and no message id.

  | Graph result | Ledger state |
  |---|---|
  | 202 | `queued` = accepted by Microsoft 365, **not** inbox proof. Bounces come back as NDRs to jack@aimanjack.com. |
  | 400 `ErrorInvalidRecipients` | `bounced` (never retried) |
  | 429 / 503 | retried with backoff |
  | 500 / 502 / 504, or network error after the request | `uncertain`: may have been accepted, never auto-resent |
  | Request refused by the runtime before leaving | retried; nothing was sent |
  | Stale-token 401 | retried once immediately with a fresh token |
  | 401 / 403 after that | configuration gap (`m365_not_permitted`) |

- **Abuse guards.** The site now sends from the real business mailbox, and a flood could get that mailbox blocked.
  - `customer_email` must be a valid address (400 otherwise).
  - Public bookings are limited to 6 per IP per hour.
  - Each customer address gets at most **4 emails per 24 h**. The next is `held`, alerted, and releasable by the owner.
  - Booking mail, coupon customer mail and coupon owner notices all reserve from the same mailbox budget before dispatch. `MAIL_DAILY_CAP` defaults to **40**, accepts integers **1–100**, and limits attempts over a rolling 24 hours. Each slot allows one attempt per 24 hours using the existing `booking.take_coupon_rate_limit` RPC with a hashed mailbox/slot key. Concurrent Workers cannot spend the same slot. No new table or migration is required. Storage failures and invalid limits block sending.
  - Slots are deliberately not refunded after errors or ambiguous provider outcomes. A known stale-token 401 retry remains one logical attempt. Recent booking ledger entries conservatively reduce the available slot set during rollout, so prior sends do not receive a fresh full budget. New booking entries may consequently count twice and reduce throughput; the cap is an upper bound, not a guaranteed daily allowance. Keep one consistent cap per mailbox across deployments; change the cap after a 24-hour pause in sending so old/new slot sets cannot overlap under different limits.
  - At the cap, booking messages wait without spending retry attempts; coupon requests return 503 and can be retried later. Coupon owner notices remain best-effort and can be suppressed when the customer email used the last slot.
- **Stale mail.** A customer email still unsent after **24 h** (for example, created before the mailbox was connected) becomes `expired` instead of arriving late. Owner notices still go. The owner can resend from the page.
- **Request budget.** Quota reservations add shared-store requests. At most two newly enqueued rows are attempted immediately, followed by one due row; availability sweeps process two, and "Retry due emails now" processes three. Remaining rows stay in the ledger for a later sweep. Contention retries are bounded.

## 3. Delivery ledger (both transports)

- **Durable ledger.** `booking.notifications` (migration `db/migrations/2026-10-09-booking-notifications.sql`) gets one row per booking event per recipient role. The row is written before sending.
- **Several owner inboxes.** `OWNER_EMAIL` may list up to 5 addresses, comma-separated (for example `jack@aimanjack.com, other@example.com`).
  - Each inbox gets its **own** message and ledger row: one bouncing address never hides or blocks the other, and "newer message supersedes older" is per inbox.
  - Invalid entries are ignored and counted in `/v1/admin/email-config` (`owner_email_invalid_entries`), which also lists every inbox masked (`owner_emails`).
  - An owner notice recorded while `OWNER_EMAIL` was unset is **re-addressed** to the configured inboxes on its next retry (or on "Resend" from the owner page), once per inbox. Before this, such a row kept failing with `config_missing:OWNER_EMAIL` even after the setting was fixed.
  - The coupon lane uses the first inbox as the customer Reply-To and sends its owner notice to each inbox.
- **Provider result per recipient.** M365: see §2. Cloudflare (legacy): the REST response lists `delivered`, `queued` and `permanent_bounces` per recipient; `delivered` means the recipient's server accepted it. Neither is inbox proof; only the live end-to-end check (§6) proves receipt.
- **Retries.** Provider errors (HTTP 429, 5xx or 4xx) back off at 1 min, 5 min, 30 min and 2 h. After 5 attempts the row becomes `dead` and the owner is alerted.
  - Bounces are never retried. The owner page will not resend to a bounced address; only an explicit `include_bounced` request does.
  - **Configuration gaps** (for example `config_missing:M365_CLIENT_ID`, `config_missing:M365_CONNECTION`, `m365_reconnect_required:*`, `config_missing:OWNER_EMAIL`) do not use up attempts. They re-check every 30 min until fixed, and the owner is alerted once if a row is still failing after 30 min.
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
  - on `POST /v1/notifications/process` (admin; the owner page has a button).
  - an **optional, explicitly enabled** GitHub Actions 15-minute schedule (`.github/workflows/booking-notification-retries.yml`). It has no production effect until the owner provisions matching scoped tokens AND sets `BOOKING_EMAIL_RETRY_ENABLED=true`. The default is **off**. GitHub schedules can run late; this is not a strict 15-minute delivery SLA.
- **Alerts.** Optional `ALERT_NTFY_URL` (ntfy topic) alerts on `bounced`, `dead` and `uncertain`. Alerts carry ids and codes only, never addresses or names.
- **Owner view.** `https://aimanjack.com/admin/bookings/` is iPhone-friendly. Enter the admin token once per tab (stored in session storage). It shows upcoming bookings by day with:
  - name, phone, email, note and source;
  - per-message email status;
  - a "Resend" button for failed, uncertain, held or expired messages;
  - the **Microsoft 365 mailbox** card: connection state, Connect / Reconnect / Disconnect;
  - the effective email settings.
- **Settings check.** `GET /v1/admin/email-config` (admin) shows the **effective** transport, sender, Reply-To, `OWNER_EMAIL` (masked, for example `j***k@aimanjack.com`) and the Microsoft 365 connection state of the running deployment.
- **`source='admin'` is an explicit choice.** When the owner changes a booking from the admin side, the customer is told but the owner gets no notice about their own action. `X-Source: admin` is honoured **only with the admin token**; a public caller claiming it is treated as `web`, so it cannot suppress the owner's notice. Web, voice and SMS notify both.
- **The agents' list response is unchanged.** `GET /v1/bookings?business=…` (used by the voice and SMS agents) keeps its old shape. Only `&with=notifications` (the owner page) adds email states, and only ids, kinds, roles, states and error codes; the ledger's addresses are not returned.
- **Logs** carry status and error codes only: no addresses, names or booking ids.
- **`deploy.sh` and `.deployignore`.**
  - The test gate now runs `node --test tests/*.test.mjs`. The old `tests/` directory form fails on Node 22, which made every deploy refuse.
  - `tests/` is no longer copied into the published site.
  - No argument / `--prepare-preview` only builds, tests and stages `.preview/site`. It never uploads.
  - `--preview` publishes an inert Worker and public assets to the separate `aimanjack-review` project with an explicit `review-<commit>` branch. It never sends IndexNow notifications. Check this project's production branch is still `main` before uploading.
  - `--production` is explicit and rejected outside the `production` Git branch; it supplies `--branch production` to Wrangler.
  - `wrangler.toml` defaults and `env.preview` contain only `SITE_ENV=preview`. Live variables are restricted to `env.production.vars`; the API also checks production host/branch before any database, background processing or mail call. Preview remains inert even if stale dashboard secrets exist.
  - Shared credentials, environment files, source code, internal state and migrations are excluded from preview assets. Never copy production secrets into preview. A functional preview requires separately authorized isolated data and mailbox setup; it is not enabled by this patch.

**Connection concurrency.** Starting a login reserves a new generation before contacting Microsoft. Poll completion/cleanup require both that generation and the same pending login; Disconnect conditionally advances the generation and clears credentials. A late device-code response, old poll or competing poll cannot restore a disconnected connection or overwrite a newer login. The owner page also stops displaying/polling an obsolete login flow.

**Original-project automatic previews.** Cloudflare Pages `aimanjack` uses the build command `node scripts/cloudflare-preview-build.mjs` and the existing `.deploy` output directory. `.node-version` selects Node 22. The command requires `CF_PAGES=1`, a nonempty non-production `CF_PAGES_BRANCH`, and `SITE_ENV=preview`; it refuses other contexts before any build or file changes. It builds the site, runs the complete offline test suite, then stages only public assets and the inert `_worker.js`. Pages advanced mode ignores the root `/functions` when that output Worker exists. Even if old preview secrets remain configured remotely, the Worker contains no database or email client. Build/test failures stop publication. Production is still a separately authorized manual deployment; the shared automatic build command deliberately refuses the production branch. Roll back this build-setting change by restoring an empty build command (the prior automatic check would again fail for missing output); this does not roll back or deploy the production site.

### Optional automated retry scheduler (off by default)

This is a separate, later owner-authorized activation step, **not part of merging a PR**:

1. Generate one high-entropy secret (minimum 32 characters) in a secure local shell. Do not print it or commit it to GitHub.
2. Add it in the Cloudflare Pages **production** environment as `NOTIFICATION_PROCESS_TOKEN`. This key is accepted **only** for `POST /v1/notifications/process`; it cannot list appointments, requeue arbitrary messages or connect a mailbox. The existing `ADMIN_TOKEN` still works for the owner UI.
3. Configure the matching GitHub Actions repository secret `BOOKING_NOTIFICATION_PROCESS_TOKEN`. Never put `ADMIN_TOKEN` into this scheduled workflow.
4. After the production PR is approved and deployed, M365 is connected, DB migrations are applied, and the real E2E confirms both owner and customer inbox receipt, explicitly approve enablement and set the repository variable `BOOKING_EMAIL_RETRY_ENABLED=true`.
5. Run the workflow manually once, inspect its status and the restricted notification ledger, then monitor scheduled workflow failures. Turn the repository variable back to `false` to stop it immediately; revoke both tokens to disable the credential.

The workflow calls only `https://aimanjack.com/v1/notifications/process`; it never queries personal booking data, never requeues `bounced` or `uncertain` records, and never retries HTTP POSTs at the client. The server's idempotent ledger remains authoritative. A GitHub Actions outage or delayed schedule can delay retries, so failure monitoring is still necessary.

## 4. Owner setup and deployment (each production step needs Jack's explicit OK)

**A. App registration (Jack, about 5 minutes; only he can sign in).**
1. Open https://entra.microsoft.com and sign in as jack@aimanjack.com. The GoDaddy sign-in page is expected.
2. **Applications → App registrations → New registration**:
   - Name `aimanjack-site mail`.
   - **Accounts in this organizational directory only**.
   - No redirect URI.
   - Register.
3. Copy the **Application (client) ID**. It is not a secret. It goes into `wrangler.toml` as `M365_CLIENT_ID`.
4. **Authentication → Advanced settings → Allow public client flows → Yes → Save.** Without this, the sign-in fails with AADSTS7000218.
5. **API permissions → Add a permission → Microsoft Graph → Delegated → `Mail.Send` → Add.** `User.Read` is already there. No "Grant admin consent" is needed.

If step 2 is refused because GoDaddy restricts app registration: stop. The options then are app registration through GoDaddy support, defederating the tenant from GoDaddy, or another sender. Each is an owner decision.

**B. Deploy.**
1. Commit `M365_CLIENT_ID` into `wrangler.toml [env.production.vars]`.
2. Set the token key **without ever displaying it**, for production only:
   `openssl rand -base64 32 | npx wrangler pages secret put M365_TOKEN_KEY --project-name aimanjack`
3. Apply the migrations:
   - `node scripts/supabase-sql.mjs db/migrations/2026-10-09-booking-notifications.sql`
   - `node scripts/supabase-sql.mjs db/migrations/2026-10-09-mail-tokens.sql`
4. If an old `OWNER_EMAIL` **secret** was ever created, delete it. `OWNER_EMAIL` now lives in `[env.production.vars]`, and a var and a secret with the same name clash.
5. `sh deploy.sh` prepares a local read-only preview. After preview upload is authorized, `sh deploy.sh --preview` uploads it to the separate review project. Its `/v1/admin/email-config` must return `503 preview_read_only`. Real booking/mail tests require an isolated functional environment; do not point this preview at the production database. Production deployment is a separate authorized step: `sh deploy.sh --production` from the production branch.
6. On https://aimanjack.com/admin/bookings/: **Connect Microsoft 365**, enter the code, sign in, accept. The card turns **Connected**.
7. Run the live end-to-end check (§6).
8. Once M365 works, the Cloudflare token `aimanjack-site booking email` and the `CF_EMAIL_TOKEN` secret can be deleted.

**Rollback.** Click Disconnect (and revoke at myapps.microsoft.com), or redeploy the previous commit. Bookings never depend on email.

## 5. Legacy: Cloudflare Email Sending (not used; needs Workers Paid)


**Plan requirement (found 2026-10-09 by Muse in the dashboard, confirmed in Cloudflare's pricing docs):** Email Sending to arbitrary recipients requires the **Workers Paid** plan ($5/month; 3,000 outbound emails/month included, then $0.35 per 1,000). On Workers Free it is "Not available", and onboarding a domain cannot start. The AI Man Jack account is on Workers Free, so **upgrading is an owner purchase decision** and blocks every step below. Source: https://developers.cloudflare.com/email-service/platform/pricing/

Public DNS was checked 2026-10-09 via dns.google.

| Item | Observed | Meaning |
|---|---|---|
| Nameservers | `ziggy/dom.ns.cloudflare.com` | aimanjack.com is a Cloudflare zone, so it can be onboarded to Email Sending |
| MX | `mx1/2/3-usg2.ppe-hosted.com` (Proofpoint, then M365) | Inbound must stay exactly like this |
| Apex SPF | `v=spf1 include:_spf-usg2.ppe-hosted.com include:secureserver.net ~all` | Unchanged by sending onboarding (it uses a subdomain) |
| `_dmarc` | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` | Unaligned mail is quarantined |
| `cf-bounce._domainkey.aimanjack.com` | **NXDOMAIN** | aimanjack.com is **not onboarded** to Cloudflare Email Sending yet. Mail from booking-no-reply@ cannot pass DMARC today. |
| `CF_EMAIL_TOKEN` | Absent as of the 2026-09-15 secret listing (agent-os state); not re-checked | If still absent, **no booking email has been sent at all**. The old code returned silently. |
| `OWNER_EMAIL` | Now an `[env.production.vars]` entry in `wrangler.toml` | The repository value is the source of truth for production. Do not create a duplicate secret or copy this setting into preview. |

Sources:
- https://developers.cloudflare.com/email-service/configuration/domains/
- https://developers.cloudflare.com/email-service/api/send-emails/rest-api/
- https://developers.cloudflare.com/pages/functions/wrangler-configuration/

### DNS / onboarding plan (only if Workers Paid is ever bought)

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

### Cloudflare deployment order (legacy)

Every step is an owner-authorized production change.

1. Onboard the domain (§4) and confirm `cf-bounce._domainkey.aimanjack.com` resolves.
2. `npx wrangler pages secret put CF_EMAIL_TOKEN --project-name aimanjack` (Email Sending → Edit).
3. Confirm `OWNER_EMAIL` in `[env.production.vars]` in `wrangler.toml`; do not create a same-name secret. An unset owner address means owner notices are recorded as `config_missing:OWNER_EMAIL`.
4. Optional: `ALERT_NTFY_URL` (+ `ALERT_NTFY_TOKEN`).
5. Apply the migration: `node scripts/supabase-sql.mjs db/migrations/2026-10-09-booking-notifications.sql`.
6. The current preview is read-only: `sh deploy.sh --preview` targets the review project and its API returns 503. Do not use it for a live mail check. A production upload requires separate authorization and `sh deploy.sh --production` from the production branch.
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
