# Website → Revenue OS event delivery

Status: implemented on the isolated integration branch; **not enabled or deployed**. No existing database was changed. SQL tests use a disposable in-memory PostgreSQL engine; integration tests use a disposable in-memory Revenue OS store and loopback HTTP. No customer email or real alert was sent.

## What changes

The old post-write webhook logged failures and forgot them. Source-table triggers now create a delivery row in the **same transaction** as a quote receipt or sales booking change. A failed outbox insert rolls back that source write; the API cannot report a successfully stored source without its event. Booking capture is limited to `aimanjack` / `demo-call`. It snapshots created/rescheduled/canceled event state and first-touch attribution. Other tenant appointments stay outside the sales pipeline.

The processor signs each attempt, requires HTTPS at the exact receiver routes, and requires the receiver acknowledgement `{ok:true,outcome:"accepted"}` or `duplicate`. A 2xx HTML/error body is not success. Requests time out after 5 seconds and redirects are refused. The receiver must keep its existing durable event-ID deduplication.

Delivery is at least once. Retries preserve the signed booking `event_id` or intake `receipt_id`, so a lost response after receiver commit can be retried safely. Attempts use a 90-second claim lease; stale claims are reclaimed and late workers cannot overwrite a newer worker's result. Claims use database row locks. Events for one booking wait for all earlier events to be delivered, including earlier failed events. Dead events must be reviewed/replayed before later events in that booking can proceed.

A row gets at most five automatic attempts, separated by minimum waits of 1, 5, 30 and 120 minutes. A scheduled run may occur later than those minimums. One dedicated processor invocation handles at most two events and one alert, keeping request work bounded. Source requests only persist the event: scheduled or owner-initiated draining runs separately, so booking email work and event retries do not compete for the same request budget. The scheduler is required for unattended delivery.

## Setup prepared for a later, separately authorized rollout

Do not execute these steps as part of this review.

1. Apply the existing base `db/schema.sql` and PR #1 intake migration `db/migrations/2026-10-08-revenue-intake.sql` if needed. Review the PR #2 mail migrations separately; event delivery does not require changing mailbox permissions.
2. Review and apply `db/migrations/2026-10-11-ros-event-outbox.sql`. It adds `booking.bookings.ros_utm`, updates the existing `booking.create_booking` RPC to persist it, and adds the event/replay tables, triggers and service-role-only RPCs in schema `revenue`. It performs no historical backfill. Verify PostgREST exposes the existing `revenue` schema and refresh its schema cache as needed. Confirm `revenue.ros_ready()` is true. Review permissions using the project's actual roles before rollout.
3. Deploy the integrated API only after approval. Initially leave `ROS_EVENTS_ENABLED=false` (the checked-in production default). Triggers capture new source changes once installed; the processor remains inert while disabled. The enabled API refuses new booking/intake writes before writing if the trigger readiness check fails.
4. Configure the HTTPS receiver and secrets below in **production only**, verify both handlers, arrange the scheduler and alert channel, then explicitly enable event processing. Old target URLs alone do not enable transmission. Run a separately approved synthetic end-to-end check before trusting live traffic.
5. Enable the optional GitHub schedule only after verifying the above and obtaining rollout approval: set the matching process secret and repository variable `ROS_EVENT_RETRY_ENABLED=true`. This branch does not set either. Scheduled workflows run from the repository default branch, so merely committing this feature branch does not activate the schedule. GitHub schedules can be delayed or disabled by the platform; monitor workflow health independently.

| Setting | Purpose |
| --- | --- |
| `ROS_EVENTS_ENABLED` | Exact string `true` enables sends; otherwise processing/replay is disabled. |
| `ROS_WEBHOOK_URL` / `ROS_WEBHOOK_SECRET` | Intake receiver at `https://<approved-host>/v1/events/website`; no query, fragment or embedded credentials. |
| `ROS_BOOKING_WEBHOOK_URL` / `ROS_BOOKING_WEBHOOK_SECRET` | Booking receiver at `https://<approved-host>/v1/events/booking`. |
| `EMAIL_HASH_SECRET` | Must equal the Revenue OS contact identity salt to link a booking to an existing contact. Keep stable while events are pending. Booking delivery stops with a visible error if missing. |
| `IP_HASH_SALT` | Keyed IP rate limits; no unsalted booking IP digest is stored. If absent, the booking IP limit is unavailable (existing mailbox budget remains enforced). |
| `ROS_EVENT_PROCESS_TOKEN` | Dedicated random credential, at least 32 characters. Allows only `POST /v1/ros-events/process`; cannot list, replay, book, send mail, or connect Microsoft 365. Never use `ADMIN_TOKEN` in the scheduler. |
| `ROS_ALERT_NTFY_URL` / `ROS_ALERT_NTFY_TOKEN` | Owner-controlled HTTPS ntfy topic and optional bearer; separate from booking email alerts. Configure a private topic before enabling. |

Use different webhook secrets for booking and intake, at least 32 random bytes. Do not print, commit, or copy any live credentials to preview. A later identity-key rotation needs a coordinated drain/reconciliation: booking identity is reconstructed from the source booking at delivery time, not stored as a second copy of customer PII in the outbox.

The optional `.github/workflows/ros-event-retries.yml` runs every 15 minutes when explicitly enabled. It uses only the scoped process token, checks server acknowledgements, and marks the workflow failed if processing is disabled, persistence fails, or a due owner alert cannot be delivered. Receiver failures remain in the durable retry queue and alert at the thresholds below. At two events per scheduled call the schedule drains at most eight events per hour, with an initial delay of up to 15 minutes when runs are on time. The owner can process due events sooner from the panel. Increase capacity only after measuring traffic and the platform's request limits.

## Owner review, alerts and replay

Open `/admin/bookings/` and use the existing owner token. The **Customer sync** panel shows up to 100 outstanding events, oldest first, with attempts, status and a code-only failure reason. The panel is unavailable until database setup exists; it says so rather than presenting an empty successful queue.

- **Retry due syncs now** drains currently eligible rows. It honors backoff and per-booking ordering.
- **Queue again** resets a failed/retrying row for another bounded attempt cycle. It preserves its event ID, total attempts and replay audit history. It does not bypass ordering and does not itself send email. Click “Retry due syncs now” or wait for the next processor run afterward.
- Delivered rows cannot be replayed through the API. Never manufacture a new ID to recover an uncertain response: that bypasses deduplication.
- A dead row, or a pending/retrying row older than 30 minutes, is eligible for an owner alert. Alert bodies contain only numeric event-row ID, state, attempt count and a controlled error code. No name, email, phone, booking ID or intake payload goes into the alert.
- A missing/failing alert channel never marks an alert delivered. It remains eligible after a five-minute wait; the owner panel and scheduled job expose the failure. A successful alert is sent once per event until manual replay resets the review cycle. The backlog remains visible even after an alert was sent.
- A database outage prevents both source persistence and outbox draining; the process endpoint fails and the scheduled job fails. This code cannot deliver its own alert if the scheduler never runs or the whole site is down. Configure independent workflow/site availability monitoring before unattended operation.

Authenticated API equivalents:

| Method and path | Credential and effect |
| --- | --- |
| `GET /v1/ros-events` | Owner; outstanding metadata only, never receipt payload or customer identity. |
| `POST /v1/ros-events/process` | Owner or dedicated process token; bounded drain and alert check. |
| `POST /v1/ros-events/<numeric-row-id>/replay` | Owner only; queues a retry/dead row and records the replay. Disabled processing returns 409. |

Pause sending with `ROS_EVENTS_ENABLED=false` and disable the scheduler variable. Source triggers may continue collecting events; do not delete failed rows as a substitute for recovery. Existing events lost before this migration are **not** recreated automatically. Historical reconciliation must inspect source records and receiver state with separate approval to avoid inventing or duplicating events.

## Privacy and preview boundaries

Booking events omit names, raw emails, phone numbers and notes. Intake delivery contains only the receiver's approved receipt fields, reconstructed from the original receipt at attempt time; private IP/subject/deduplication hashes are excluded. Erasing the source receipt (or booking) cascades its event and replay rows so retained queue data cannot recreate an erased payload. This does not undo an event already accepted by the receiver; its existing erasure process still applies.

PR #2's Microsoft 365 sender and PR #3's disconnect protection, shared mail budget and read-only preview controls remain. Intake owner notices use the configured transport and shared quota. Their old one-shot notification behavior is unchanged; durable **event** replay does not resend those notices. Customer sync code never calls an email provider.

All preview API routes, including intake, event processing and replay, fail closed before DB or background work, even if old production variables remain. The staged preview contains the inert advanced-mode Worker, public assets and no API implementation, database scripts or live configuration. Any separately requested hosted preview uses only that inert staged artifact in the independent `aimanjack-review` project. Production deployment remains outside this review.

## Local checks

Install locked development dependencies with `npm ci --ignore-scripts`, then run `npm run build` and `npm test`. `@electric-sql/pglite` is a test-only PostgreSQL runtime, instantiated without a data directory or connection URL. Its tests exercise the real migration SQL, rollback, claims, ordering, retry caps, replay, erasure and role permissions. Existing tests cover Microsoft 365, mailbox quota, coupon races, conversion pages and preview isolation. The integration evidence report also records actual website-processor → Revenue OS HTTP-receiver recovery tests with both stores in memory and external networking blocked.
