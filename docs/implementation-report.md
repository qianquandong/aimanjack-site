# Implementation report — Frontend + SEO/GEO + Free Tools PRD (2026-09-18)

Scope delivered: PRD phases 0–5 and 7 at MVP size. Audit and decisions: `docs/site-audit.md`. Not deployed at the time of writing.

## What changed
- **Positioning/CTA**: primary CTA is now "Book a Workshop" (was "Plan a Team Workshop"). Home title `AI Man Jack | Practical AI Training for Teams`, H1 "Make AI useful at work."
- **Homepage rebuilt** to the PRD's 11 sections: white split hero with a real workshop photo, proof strip, what teams learn, explore by team, free tools, featured workflows, programs, real rooms, how engagement works, resources, final CTA. The five-step method, detailed formats, reviews and FAQ now live only on `/ai-training/`, so home and training no longer read as the same page.
- **Navigation**: Training · Use Cases · Free Tools · Templates · Resources · About + CTA. Every item is a distinct page (the two anchor links Jack flagged are gone). `aria-current` on the active section.
- **Footer**: Product / Use Cases / Resources / Company, service-area line underneath, A2P legal text unchanged.
- **Resource library** (English only): use cases, workflows, templates, tools — all generated from data objects.
- **AI Readiness Assessment** shipped.
- **Build** supports EN-only routes (no `/zh/` twin, no zh hreflang, no language switch on those pages).
- Mobile nav is not laid out while closed; two mobile overflow bugs found in preview were fixed and turned into a regression test.

## New routes (all indexable, self-canonical, in sitemap; 47 URLs total)
- `/tools/`, `/tools/ai-readiness-assessment/`
- `/use-cases/`, `/use-cases/{sales,marketing,operations,leadership}/`
- `/workflows/` + 10: prospect-research, sales-meeting-preparation, sales-follow-up, content-repurposing, customer-research, competitive-research, meeting-notes-to-action-items, sop-creation, internal-document-summary, executive-brief
- `/templates/` + 8: sales-meeting-prep, prospect-research, follow-up-email, customer-interview-analysis, weekly-executive-summary, content-repurposing, sop-builder, ai-use-case-discovery-worksheet

## Removed routes / redirects
None removed, no new redirects. `/ai-training/` and `/blog/` were kept instead of moving to `/training/` and `/resources/` (audit D1, D2). Legacy receptionist routes stay 200 + noindex + unlinked.

## New components (`src/resources.mjs`)
`card`, `directory` (search + category filter + empty state, ~15 lines of inline JS, all cards visible and crawlable without JS), `resourceHero`, `related`, `copyBlock` + `copyScript`, `trainingCta`, `tag`, `page`. Page modules: `src/pages/{workflows,templates,usecases,freetools}.mjs`. One `workflowCard`/`templateCard`/`useCaseCard`/`toolCard` each — no per-department variants.

## Content/data architecture
`src/content/workflows.mjs`, `templates.mjs`, `usecases.mjs`: arrays of plain objects with JSDoc typedefs. Adding a workflow = adding one object; page, metadata, HowTo schema, breadcrumbs, sitemap entry, directory card and use-case link are generated. A use-case group item only becomes a link when its workflow exists, so there are no empty links.

## SEO
Unique title/description, one H1, self canonical, OG/Twitter, breadcrumbs (visible + JSON-LD) on every new page. Answer-first lead paragraph on every workflow, use case and the tool. Internal linking rules of PRD §33 are enforced by a test: workflow → use case, ≥2 related workflows, tool, training, template; template → workflow, use case. `llms.txt` regenerated with the library. `lastmod` only moves when a page's HTML changes.

## Schema
`HowTo` (workflows), `CreativeWork` (templates), `CollectionPage` (hubs, use cases), `WebApplication` + `FAQPage` (assessment), `BreadcrumbList` everywhere, `ProfessionalService` reference. Home: `ProfessionalService` + `Person` + `WebSite` (FAQ schema removed with the FAQ). All schema describes visible content.

## Analytics
See `docs/analytics-events.md`. New: `tool_start`, `tool_complete` (with score and band), `tool_result_view`, `tool_resource_click`, `book_workshop_click`, `template_copy`, `workflow_view`, `template_view`, `use_case_view`, `free_tools_view`, `home_view`. **Jack: mark `workshop_cta_click`, `book_workshop_click` and `booking_complete` as key events in GA4.**

## Performance
No framework, no new dependency, no new font, no new image. Added CSS ≈ 5 KB raw. JS is inline and per page: directory filter ≈ 1 KB, copy ≈ 0.5 KB, assessment ≈ 3 KB. Home hero image is the existing responsive WebP with `fetchpriority=high` and explicit dimensions. Lighthouse was **not** run in this session (no Chrome Lighthouse CLI in the toolchain); run PSI on `/` and `/tools/ai-readiness-assessment/` after deploy. Targets: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.

## Accessibility
Assessment uses `fieldset`/`legend` + native radios (keyboard works without custom code), focus moves to the next question and to the result, progress is text ("Question 3 of 10") plus a decorative bar, result region is `aria-live`. Directory search has a label, filters are `aria-pressed` buttons, empty state is `role=status`. Copy buttons announce "Copied". All questions render without JS. `prefers-reduced-motion` respected. Not yet done: a screen-reader pass with VoiceOver.

## Verified
`node scripts/build.mjs` (47 indexable pages), `node --test tests/` 12/12, 0 broken internal links, preview checked at 375 px and desktop for home (EN/ZH), assessment (full run: 10 answers → score 30 = hand calculation, band, weakest three, booking link carries the score, state survives reload), workflows directory (search, filter, empty state), workflow, use case, template. No console errors.

## Known limitations
1. **Workflows and templates were written from the training method and standard practice; Jack has not run each one on real work.** Examples are labelled illustrative and use fictional companies. Run them and replace examples with real (anonymised) output before promoting them as tested.
2. Library is English only. ZH home links to the English pages and says so.
3. No email capture on the tool; the score reaches Jack only if the visitor books.
4. `HowTo` no longer produces a Google rich result; it is there because it is accurate and helps AI parsers.
5. OG image is the generic training card on every new page.
6. No lint/typecheck (no toolchain in this repo by design).

## Remaining TODOs
P1: training detail pages under `/ai-training/`; AI Use Case Finder; AI ROI Calculator; ZH for top pages; two real case studies; tool-specific OG images. P2: see `docs/site-audit.md`.

## Recommended next 10 pages
1. `/tools/ai-roi-calculator/` — deterministic, high intent, links to every workflow
2. `/tools/ai-use-case-finder/` — digital version of the worksheet
3. `/ai-training/ai-workshops/` — "corporate AI workshop" has no owner page yet
4. `/ai-training/ai-workflow-training/`
5. `/workflows/weekly-report-from-spreadsheet/` — the most common operations task in sessions
6. `/workflows/pipeline-review-preparation/` — fills the empty Sales management group
7. `/workflows/ai-data-boundaries-one-pager/` + matching template — the assessment's most common weak area has no dedicated page
8. `/case-studies/dallas-ai-hackathon/` — real photos, real numbers, already in hand
9. `/blog/ai-agent-vs-ai-workflow/` — definition query, feeds the workflow hub
10. `/use-cases/hr/` — only once three HR workflows exist

## 2026-09-19 — First current case study: livestream agency scheduling

- **New indexable pages (EN + ZH):** `/case-studies/` and `/case-studies/livestream-agency-scheduling/`. Build is now 90 indexable URLs.
- **`/case-studies/` is no longer legacy.** It lists current cases only (`src/content/cases.mjs` → `CURRENT_CASES`). The two receptionist-era case details (`/case-studies/ai-man-jack/`, `/case-studies/car-dealership-sms/`) stay HTTP 200 + `noindex, follow`, out of the sitemap, and unlinked from every indexable page (test-enforced).
- **Page type:** a proof page in the article layout — summary, key facts, before/now, what was built, why deterministic code and not an LLM, implementation notes, two measured tables, six failures, unvalidated items, six lessons, onward links, Book a Workshop. Schema: `Article` + `BreadcrumbList` + business reference. No Review schema, no custom OG image (no privacy-safe real image exists yet).
- **The ~6-hour figure is scoped to first-draft construction only.** It always appears next to "a person still reviews, edits and publishes". "6 hours saved", ROI, revenue and net time are not claimed; review time has not been measured. A test fails the build if that wording appears.
- **Internal proof links:** one compact card (`caseProof()` in `src/pages/cases.mjs`) on the home page, `/ai-training/`, `/use-cases/operations/` and `/workflows/`; "Case studies" added to the footer Resources column. No seventh header item — revisit at 2–3 current cases.
- **llms.txt** (via `src/llms.mjs`) carries the case facts and URL; also corrected the stale line that said the library was English-only.
- **health.mjs:** `/case-studies/` moved from `LEGACY` to the monitored indexable set together with the new case; the two old case details are now the legacy canaries.
- **Not done on purpose:** no spin-off blog/workflow/city pages from this case. Create related content later from real query data.
