# Analytics events — aimanjack.com

GA4 `G-H7EF9HVN02`. Loaded after `load`, production hostname only. Every event carries `page`, `language`, `device`; click events add `cta_position`.
Two mechanisms, both in `src/layout.mjs`: any element with `data-event="x"` fires `x` on click; pages set `data-view="x"` on `<body>` to fire `x` once on load. Page scripts call `window.amjTrack(name, props)`.

| Event | Trigger | Extra properties | Business meaning |
|---|---|---|---|
| `workshop_cta_click` | Any "Book a Workshop" button: header, hero, program cards, final CTA, sticky bar, resource-page CTA | `cta_position` (`header`, `hero`, `home-programs`, `workflow-<slug>`, `template-<slug>`, `use-case-<slug>`, `tool-ara`, `sticky`…) | Intent to buy. `cta_position` answers *which page type produces booking intent*. **Key event.** |
| `book_workshop_click` | "Book a Workshop" on the assessment result screen | `cta_position=tool-result` | Tool-driven lead intent; the score travels to `/book/?goal=`. **Key event.** |
| `booking_start` | `/book/` page view; Contact page "Book a call" | — | Reached the booking form. |
| `booking_complete` | Cal.com iframe emits a verified `bookingSuccessfulV2` for the AI Workflow Call with status `ACCEPTED` and no payment required | `booking_provider=calcom`, `event_type=ai_workflow_call`, `location_type=phone` | An accepted booking in the embedded calendar. Candidate **primary conversion**, subject to GA4/Google Ads account configuration. A browser event does not prove attendance, qualification or email delivery. |
| `booking_calcom_click` | External Cal.com fallback link is clicked | `cta_position=book` | Calendar-link click only; no completed booking claim. |
| `booking_reschedule` / `booking_cancel` | Legacy booking-widget events; not emitted by the current Cal.com booking page | — | Not current Cal.com lifecycle tracking. |
| `home_view` | Home loads | — | — |
| `training_page_view` | `/ai-training/` loads | — | Commercial page reach. |
| `training_page_click` | Secondary link to `/ai-training/` from home or a resource CTA | `cta_position` | Resource → commercial page movement. |
| `free_tools_view` | `/tools/` loads | — | — |
| `free_tools_click` | Hero "Explore Free Tools" | `cta_position` | — |
| `tool_view` | A tool page loads | — | — |
| `tool_click` | Tool card clicked | — | — |
| `tool_start` | First answer in the assessment | `tool` | Started. |
| `tool_complete` | Last answer given | `tool`, `score`, `band` | Completed. `tool_complete / tool_start` = completion rate. |
| `tool_result_view` | Result screen shown (also when restored from session) | `tool` | — |
| `tool_template_click` | The "Free template: …" button under a recommended step on the assessment result | `cta_position` = area (people, governance…) | Flywheel step 2: result → template. Compare with `tool_complete` to see how many finishers take a template. Replaces `tool_resource_click` (2026-09-19). |
| `use_case_view` / `use_case_click` | Use-case page loads / card clicked | — | Which departments are interested. |
| `workflow_view` / `workflow_click` | Workflow page loads / card clicked | — | — |
| `template_view` / `template_click` | Template page loads / card clicked | — | — |
| `template_copy` | Copy button on a template or a workflow prompt | `cta_position` = block id | The resource was actually used, not just viewed. |
| `blog_view` / `resource_click` | Post loads / post card on home | — | — |
| `email_training_click` / `sms_training_click` | mailto: / sms: links | `cta_position` | Alternative contact. |
| `language_change` | EN ↔ 中文 switch | — | — |

Not tracked on purpose: scroll depth, every outbound click, time on page. `tool_email_capture` and `contact_submit` from the PRD do not exist because there is no email capture and no contact form (docs/site-audit.md D8).

Flywheel funnel (2026-09-19): `tool_complete` → `tool_template_click` → `template_copy` → `use_case_view` → `training_page_view` → `workshop_cta_click` → `booking_complete`.

Funnel to build in GA4 Explorations: organic landing → (`workflow_view` | `template_view` | `tool_view`) → (`template_copy` | `tool_complete`) → `training_page_view` → `workshop_cta_click` → `booking_complete`.
Never report `workshop_cta_click` as a booked meeting; only `booking_complete` is.

## Revenue OS v6 additions (2026-10-08)

| Event | Fires when | Params | Notes |
|---|---|---|---|
| `view_offer` | An offer page loads: `/ai-training/` (`custom-four`), `/ai-training/team-workshop/` (`team-intro-90`), `/ai-training/onsite-texas/` (`onsite-day`) | `offer_id` | From `<body data-offer>`. |
| `click_book_call` | Any click on a link to `/book/` or `/zh/book/` (in addition to that link's own `data-event`) | `cta_position` | A click is not a booking; only `booking_complete` is. |
| `offer_path_click` / `quote_cta_click` | Three-path chooser card / any "Request a scoped quote" link | `cta_position` | — |
| `request_quote_start` | First focus inside the quote form on `/contact/quote/` | `offer_format` | — |
| `submit_enterprise_inquiry` | Only after `POST /v1/intake` returned `ok` with a `receipt_id` | `receipt_id`, `offer_format` | The receipt id is a random UUID (joins GA4 to `revenue.intake_receipts`); never name, email or answers. |
| `opt_in_newsletter` | Same moment, only if the optional newsletter box was ticked | `form` | — |

`download_asset`: not implemented — the site has no downloadable files yet.
Privacy: on `/book/?id=…` (booking manage links) `page_location` is sent without the query string, and the next page's `page_referrer` is stripped the same way. Global Privacy Control, or the "Turn off analytics" button on `/privacy` (localStorage `amj_analytics_off`), stops GA4 from loading. First-touch UTM/referrer/landing data lives in `sessionStorage.amj_ft`; the quote request can include these fields. The Cal.com embed and fallback link can receive only the five nonpersonal campaign tags listed below.

## Cal.com accepted-booking bridge (2026-10-17)

Both `/book/` and `/zh/book/` use the same `cal.com/aimanjack/ai-workflow-call` iframe and bridge in `src/cal-booking-tracking.mjs`. The bridge accepts only trusted browser messages from that iframe's `contentWindow`, exact origin `https://cal.com`, and Cal's `CAL:true:bookingSuccessfulV2` envelope for event type `7521172`. The booking must have `ACCEPTED` status and `paymentRequired=false`. Deprecated, dry-run, reschedule, pending, cancelled, rejected, unknown and unpaid messages do not count.

Deduplication keeps at most 100 SHA-256 booking-UID hashes in this tab's `sessionStorage` under `amj_cal_booking_complete_v1`; blocked storage falls back to memory. Neither UID nor hash is sent to GA4. Analytics receives only the fixed properties above plus the site-wide page/language/device properties, never Cal's payload, attendee details, title, dates, form answers or contact information. The bridge checks the production hostname (`aimanjack.com` or `www.aimanjack.com`), Global Privacy Control and the analytics-off switch before delivery. Preview and local hosts never emit the completion event. This client-side signal is not a server-side audit trail; storage clearing, a new tab and event delivery failures can affect counting.

For campaign continuity, the iframe and existing external fallback link receive only `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and `utm_term`: first-touch values from `sessionStorage.amj_ft`, with current-query fallback. Values are bounded to 120 characters and restricted to campaign-style letters, digits, spaces, underscores, dots and hyphens; email addresses, URLs, control characters and phone-like digit sequences are discarded. Campaign tags must not contain personal data. No arbitrary query parameters, legacy `id`, name/email/phone fields or advertising click identifiers are copied. Preview and opt-out sessions forward no campaign tags. This does not alter the event's availability, form fields, duration, calendar integration or booking rules.

The parent bridge cannot observe completion after a visitor leaves for the external Cal.com fallback link, a Google Business Profile Cal.com link, or another direct Cal.com link. Do not report those clicks as bookings. Cross-domain/server-side attribution and Google Ads import must be verified separately; adding this code alone does not enable Google Ads bidding, import a conversion or establish attribution for ad click identifiers.

Sources: [Cal.com embed events](https://cal.com/help/embedding/embed-events), [Cal.com embedded UTM tracking](https://cal.com/help/embedding/utm-tracking-embed), [Cal.com booking UTM tracking](https://cal.com/help/bookings/utm-tracking).
