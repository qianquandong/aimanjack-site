# Analytics events — aimanjack.com

GA4 `G-H7EF9HVN02`. Loaded after `load`, production hostname only. Every event carries `page`, `language`, `device`; click events add `cta_position`.
Two mechanisms, both in `src/layout.mjs`: any element with `data-event="x"` fires `x` on click; pages set `data-view="x"` on `<body>` to fire `x` once on load. Page scripts call `window.amjTrack(name, props)`.

| Event | Trigger | Extra properties | Business meaning |
|---|---|---|---|
| `workshop_cta_click` | Any "Book a Workshop" button: header, hero, program cards, final CTA, sticky bar, resource-page CTA | `cta_position` (`header`, `hero`, `home-programs`, `workflow-<slug>`, `template-<slug>`, `use-case-<slug>`, `tool-ara`, `sticky`…) | Intent to buy. `cta_position` answers *which page type produces booking intent*. **Key event.** |
| `book_workshop_click` | "Book a Workshop" on the assessment result screen | `cta_position=tool-result` | Tool-driven lead intent; the score travels to `/book/?goal=`. **Key event.** |
| `booking_start` | `/book/` page view; Contact page "Book a call" | — | Reached the booking form. |
| `booking_complete` | Booking API returned success | — | A real booked call. **Key event.** The only one that may be reported as a lead. |
| `booking_reschedule` / `booking_cancel` | Customer changes or cancels | — | Booking quality. |
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
