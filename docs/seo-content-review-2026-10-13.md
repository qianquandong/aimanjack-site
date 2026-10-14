# SEO content correction — 2026-10-13

Scope: correct verified content problems in the current website; do not change pricing, booking, backend behaviour, deployment controls or publish a new fixed retreat offer.

Base: `production` commit `7be173581f02302570b5c11b1ba8572c5dac5cae`.

## Changes

- Both languages of the office-manager and employee-training guides now use the current three formats. The old half-day format and unsupported 5–60 / ten-person capacity wording have been removed.
- The office-manager comparison table and both articles' format answers use shared service-page content and configuration. Links to the comparison now target `/ai-training/#team-paths` (and the Chinese equivalent). Original publication dates are retained; article update dates are 2026-10-13.
- The Chinese pricing guide opens with the actual four-session price and explains scoped quotes. Unsupported retention, industry-task-count, competitor and market-price claims were replaced with concrete questions about scope. Software licences are explicitly separate from the training fee, consistent with the offer pages.
- The Chinese provider-selection guide no longer claims all rankings are advertising or that other courses are ineffective. It asks for disclosed criteria, appropriate samples, relevant experience and verifiable evidence.
- Program FAQs now distinguish deterministic code, AI workflows and agents, and clarify that training does not include CRM/ERP integration or automatic writes to production systems. Visible answers and FAQ structured data use the same array.
- Workshop FAQs explain what information is needed to scope a leadership/strategy-retreat session, without adding a fixed three-hour package or a new price.
- Onsite FAQs explain how to discuss around 40 attendees or multiple departments, without guaranteeing a single-session capacity or individual coaching for every attendee.
- The former blanket blog exemption for retired formats was removed from site tests. New regression tests cover shared offer facts, bilingual links, scope boundaries, unsupported claims and links/fragments across all twelve reviewed pages.

## Page scope (12 URLs)

`/ai-training/`, `/ai-training/team-workshop/`, `/ai-training/onsite-texas/`, `/blog/ai-training-for-office-managers/`, `/blog/ai-training-for-employees-start-with-one-task/`, their five `/zh/` equivalents, `/zh/ai-peixun-shi/`, and `/zh/ai-peixun-najia-zuihao/`.

## Preserved

The configured $499/person starting price and four 90-minute sessions; scoped-quote-only workshop and onsite pricing; existing consultation duration, contact details, review counts, approved-tools policy and data boundaries. No new city pages, new testimonials, unverified outcomes or customer-identifying information. No database migration, booking submission, message sending, production credential access or production deployment.

## Verification

- Static build: 102 indexable pages.
- Local site and content tests: 31 passed, 0 failed.
- Browser review: four affected pages rendered from local HTML with embedded local assets at 390px and 1440px; no document-level horizontal overflow. The desktop/mobile comparison table and expanded retreat FAQ were visually inspected. Network navigation is restricted in this environment, so these are static render checks, not live HTTP tests.
- Full offline CI suite: 157 passed, 0 failed, 0 skipped, using Node 22 and the locked test dependency. Evidence: GitHub Actions run 38479052623, job 115576857721, completed 2026-10-13; test artifact `seo-review-test-results` (11855946822). The reviewed source SHA-256 checks passed before the build. Source and generated HTML were committed together as `6cd50658d1317d19b21e50ae5b84a228b94b3622`.
- The temporary source-transfer/build workflow and application script were removed after the successful run; existing deployment and CI configuration remain unchanged in the final diff.
- This is a bounded content correction, not a Search Console analysis. No private GSC data, search volume, ranking gains or AI-search visibility have been claimed.

Production publishing remains a separate, explicit deployment under the existing `deploy.sh --production` controls. Preview environments are read-only and are not proof that production booking or email works.
