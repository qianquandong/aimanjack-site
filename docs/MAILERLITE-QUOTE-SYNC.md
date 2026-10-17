# Get Quote -> MailerLite subscription sync

**Operational as of 2026-10-17:** website production PR #29 was merged at `6a0b13c` and published at <https://57cf7651.aimanjack.pages.dev>. The live quote forms use `privacy-2026-10-17-mailerlite`. Website enrollment, database consent capture and the CRM processor are enabled. The suppression callback is enabled with `batchable=true`; an invalid signature returned `401`, and a valid signed active/no-op event returned `200` with an ignored result. Production secrets remain server-side and the existing quote identity HMAC key is unchanged.

Acceptance used one owner-authorized quote, receipt `90300ae6-b029-4174-aaf7-eab543132617`. Outbox event `1` reached `delivered` on attempt `1`, with provider status `active`, in group `201548479243224466` (`Website - Get Quote Marketing`). The owner was already active in MailerLite; the test preserved that status. Independent API GET and dashboard checks confirmed one owner in the group. A repeated processor invocation returned `processed: []`, `mutationsToday: 1`, and zero pending, dead or uncertain events, demonstrating no second mutation for that test.

The shared native ten-minute Cron was observed running in production on 2026-10-17 at 05:40:41 UTC. Cloudflare reported `outcome=ok`, no exceptions, and `mailerlite_process_complete` with `state=complete`, `processed=0`, `synced=0`, `suppressed=0`, `cancelled=0`; the already-processed owner test was not repeated. No campaign or automation was configured or sent, and no historical import was performed. This existing-subscriber test does **not** verify fresh-subscriber double-opt-in delivery/confirmation or delivery of the separate owner notification. Account API/integrations DOI and the sender were manually checked in the MailerLite UI; they are not an email-delivery attestation.

## Behavior

The quote API and Microsoft 365 owner/booking messages keep their existing behavior. An optional, unticked newsletter checkbox is already present on both the full and quick quote forms. The required "contact me about this request" box does not grant marketing permission. A newsletter checkbox left unticked is recorded as not granting enrollment; it is **not an instruction to unsubscribe an already subscribed person**.

Only new explicit newsletter consent events created after the database capture switch is enabled enter this independent outbox. The existing receipt's initial `consent_newsletter` is not used as the current preference: a same-day quote retry can append a changed consent while keeping the original receipt. No historical subscribers or quote receipts are imported.

The processor rechecks the latest consent across that keyed identity, requires it to be granted within 30 days, checks local suppression, then reads MailerLite's current subscriber status. It creates a new subscriber without `status`, `resubscribe`, or invented confirmation timestamps; the account's API/integrations double opt-in must be enabled. Existing active/unconfirmed subscribers are added to the dedicated group using only the group-assignment endpoint. Other groups and confirmation status are preserved. Unconfirmed means waiting for the recipient's confirmation, not marketing-ready.

The adapter never creates, starts, or sends a marketing campaign. Adding a person to a group can trigger any automation already attached to that group, so the group and automation content must be reviewed before enrollment is enabled. Use an empty dedicated group during initial verification.

## Durability and limits

- A trigger on the append-only quote consent ledger creates the outbox row in the same transaction. It does not replace `record_intake`, touch ROS delivery, or depend on the separate worksheet -> CRM funnel draft.
- A global 120-second processor lease prevents overlapping ticks. Each event also has a 120-second lease, and late results cannot overwrite a recovered or suppressed event.
- At most two events and 16 MailerLite calls per tick. Group validation reads only `https://connect.mailerlite.com/api/groups?limit=100&page=N`, up to 10 numbered pages; response-provided URLs are ignored. Each network request has a four-second timeout, refuses redirects, and caps JSON response bytes.
- The database atomically reserves a maximum of 25 mutations per UTC day by default, configurable up to 100. A rejected or uncertain request still consumes its reservation; no automatic budget refund can allow a burst. Pending events remain queued when the budget is full.
- Retry delays: 1, 5, 15, 30, 60, 120, and 240 minutes, up to eight attempts. Scheduled invocations can be later. A due retry always rereads consent and provider suppression.
- A POST may already have sent a confirmation even when the network response is lost. Before any POST, a persistent per-identity/group attempt record is committed. Ambiguous outcomes (network error, timeout, 5xx, malformed acknowledgement) become lookup-only recovery: subsequent ticks never blindly repeat that POST, including when a new quote creates another event. Unobserved results eventually require manual review. An explicit HTTP 429 rejection may retry after backoff and a fresh lookup; its spent daily reservation remains counted.
- Creation/uncertain history is checked across all groups, including inside the atomic reservation. Changing the configured group cannot turn an uncertain or previously known identity into a new subscriber when provider lookup returns 404.
- A process crash after reserving but before sending is deliberately conservative: lookup-only recovery may require manual review rather than risking duplicate DOI. No public replay/reset route is included.
- An unexpectedly `active` response to a new-subscriber create is treated as unverified DOI: the event becomes uncertain, the database switch is atomically turned off, and the current tick stops with an error. Review the account DOI setting before an explicit re-enable; it is never reported as a confirmed new subscriber.

## Suppression callbacks

`POST https://aimanjack.com/v1/mailerlite/webhook` is a public provider callback protected by MailerLite's `Signature` HMAC-SHA256 over the **exact raw body**. The body must be JSON under 256 KiB. Signature verification precedes JSON parsing and all database writes. Only the controlled suppression fields are stored, not raw email, IP, full callback data, or custom fields.

Supported documented shapes are a subscriber object with `event`, an object with `type` and `subscriber`, and `{events:[...], total:N}` batches of up to 100 items. The adapter handles `subscriber.unsubscribed`, `subscriber.bounced`, `subscriber.spam_reported`, and `subscriber.deleted`; deleted/forget timestamps and provider suppression status are also accepted as suppression signals. Explicit event names take effect even if the sample subscriber status is still `active`. Active/confirmation callbacks never grant consent or remove suppression.

Register the callback for these four events with `batchable=true` (required for subscriber deletion). Save its returned secret as a server secret. Signed callbacks remain accepted while outbound enrollment is paused, once the schema and secrets exist. They only append permanent, keyed suppression tombstones and cancel queued work. Retries are idempotent, and a replay or late active event cannot clear or downgrade a tombstone. Tombstones survive source-receipt erasure, so provider lookup 404 cannot make an already deleted/forgotten address appear new. Keep the existing identity HMAC key stable; rotating it without a reviewed migration would break that protection.

## Configuration and repeat deployment/change guidance

The initial production rollout and owner acceptance above are complete. The configuration and checklist below apply when redeploying, changing credentials/group/consent behavior, or re-enabling after a pause; they are not a list of outstanding initial rollout steps.

| Setting | Location / purpose |
| --- | --- |
| `MAILERLITE_API_TOKEN` | Pages production secret, created in the intended MailerLite account; never browser JavaScript or this repository. |
| `MAILERLITE_QUOTE_GROUP_ID` | Pages production non-secret numeric ID of the reviewed dedicated quote newsletter group. |
| `MAILERLITE_PROCESS_TOKEN` | Pages production secret, random 32+ characters; grants only this adapter's process/health routes. |
| `MAILERLITE_WEBHOOK_SECRET` | Pages production secret from the registered provider callback; required before any enrollment. |
| `EMAIL_HASH_SECRET` | Existing production quote identity HMAC key, 32+ characters; must match existing consent rows and remain stable. Do not generate a replacement casually. |
| `MAILERLITE_DOI_ACKNOWLEDGED` | Production is true after the account API/integrations DOI switch and confirmation sender were verified in its UI on 2026-10-16. This is a manual acknowledgement, not a provider API attestation or a delivered-email test. |
| `MAILERLITE_SYNC_ENABLED` | Production is true after owner approval on 2026-10-17. Local/preview remain inert; database capture and CRM scheduler flags control the coordinated rollout. |
| `revenue.mailerlite_configuration.enabled` | Production is true after owner approval on 2026-10-17; SQL defaults to false for a new setup. Captures only new consent events after explicit activation. |
| `MAILERLITE_PROCESS_TOKEN` on the CRM Worker | Server secret matching the Pages production process token; never use `ADMIN_TOKEN`. The separate CRM project owns the scheduler. |
| `MAILERLITE_PROCESS_ENABLED` on the CRM Worker | Production is true. Exact true enables subscription sync on its shared native ten-minute Cron. Keep off during a new setup until this site's database, callback and processor are ready. |

For database changes, use the authorized Supabase management entry point to the existing website database. The initial migration was applied through the existing `aimanjack-crm` project's SQL Editor and its PostgREST schema cache was refreshed on 2026-10-16. The repository's `scripts/supabase-sql.mjs` is an alternative using the official Management API; it needs `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, and a locally configured `SB_ENV_FILE`. Its legacy default `/Users/joseesp/outreach-tool/.env` does not exist in this Windows task. **Do not attempt arbitrary SQL through the public website API.**

For a new environment, review and apply `db/migrations/2026-10-16-mailerlite-quote-outbox.sql` using the authorized management console/CLI/API. It depends on the existing revenue intake migration; it does not require applying ROS or worksheet funnel drafts. Refresh the PostgREST schema cache if needed. Keep the capture and processor switches off until the callback, identity key, group and opt-in state are verified. The published English/Chinese quote privacy disclosure names MailerLite, the email/name transferred, confirmation/unsubscribe purposes and keyed suppression retention. Quote consent is versioned `privacy-2026-10-17-mailerlite`. The existing SMS/A2P paragraphs are unchanged. Jack approved the previewed disclosure and publication on 2026-10-17; later wording changes require fresh owner review.

For subsequent changes, publish using the repository's explicit reviewed production flow (the existing HANDOFF controls apply). Register/test the signature callback without adding subscribers; verify protected health, unauthenticated rejection, and preview isolation. Enable capture, processor, and the scheduler only as a coordinated approved rollout. The CRM Worker reuses its existing Cron slot as `*/10 * * * *`, making a fixed POST to `https://aimanjack.com/v1/mailerlite/process` every ten minutes when enabled. Its controller runs the original CRM jobs only when the platform's trusted `scheduledTime` falls on the UTC hour. This needs no extra Cron slot. This site adds no GitHub scheduler, avoiding duplicate dispatch and another credential copy. A future fresh-subscriber DOI test requires an explicitly authorized owner-controlled address; the owner must confirm the received DOI themselves. Never auto-click subscriber confirmations. Test marketing content and automation activation are a separate explicit action.

## Operations

Only the dedicated process token can call:

| Method / route | Effect |
| --- | --- |
| `POST /v1/mailerlite/process` | Bounded drain; output is numeric event IDs, controlled codes and counts, no subscriber identities. |
| `GET /v1/mailerlite/health` | Configuration booleans and queue/budget/tombstone counts. No raw tokens, email addresses, group names or source payload. |

All preview/local invocations fail closed before opening the database or making provider calls, even if variables are accidentally inherited. Pause outbound enrollment with `MAILERLITE_SYNC_ENABLED=false` and set the CRM Worker's `MAILERLITE_PROCESS_ENABLED=false`; leave signed suppression collection running. Set the database flag false as well if new opt-in capture must stop. Do not delete uncertain events or tombstones to "fix" an error. Investigate an ambiguous DOI in MailerLite and obtain fresh explicit consent before any reviewed recovery.

Configure monitoring of the CRM scheduler's controlled results and this adapter's protected health; uncertain/dead events or failed persistence require review. Group validity, API availability, quota and DOI readiness are not inferred from successful domain authentication.

## Offline validation

`npm ci --ignore-scripts`, `node --test tests/mailerlite.test.mjs`, `npm test`, `npm run build`. New tests execute the real SQL against disposable in-memory PGlite with only mocked provider fetches. They cover consent changes on deduped receipts, source erasure, permissions, suppression, signed single/batched callbacks, replay, bounded IO, DOI uncertainty, leases, daily limits and preview protection. No live service is contacted by these tests.

Production publication passed 244/244 complete site tests. Preparation also verified 22/22 dedicated adapter tests, a build of 142 indexable pages, and local `.preview/site` staging. The separate CRM scheduler passed 15/15 tests and TypeScript checking. An extra `node scripts/verify-mailerlite-runtime.mjs <existing-local-dependency-root>` check executes the actual bundled adapter in workerd: fixed-host group read succeeds and a 302 is refused without following its Location (2/2). These offline/runtime fixtures do not establish email delivery; the separate production Cron observation is recorded above. The preinstalled test runtime supports compatibility dates through 2026-05-22, so that check explicitly uses 2026-05-15; it does not change the site's production compatibility date. The runtime dependencies are supplied explicitly by an existing local toolchain; this change adds no new production dependency.

Official integration references: [Subscribers](https://developers.mailerlite.com/api/subscribers), [Groups](https://developers.mailerlite.com/api/groups), [Webhooks and signed/batched payloads](https://developers.mailerlite.com/api/webhooks), [Double opt-in](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers).
