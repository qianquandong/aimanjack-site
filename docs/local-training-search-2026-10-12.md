# Local training search update — 2026-10-12

Home now owns the broad Dallas–Fort Worth corporate-training intent. `/ai-training/` owns employee training and the four-session program. `/ai-training/team-workshop/` owns the short team workshop; `/ai-training/onsite-texas/` owns onsite logistics in DFW, with travel elsewhere in Texas scoped separately. No new city routes were created. English and Chinese remain paired and self-canonical.

## Changes

1. Home title, description, H1 and opening explanation now identify DFW business teams, the instructor and practical AI work. U.S. remote delivery stays visible.
2. Training opens with an instructor/delivery/language brief and an accessible comparison of the three existing formats, linking to each format and its price or scoped-quote terms. Mobile uses stacked rows. The existing four-session price is unchanged.
3. The onsite page now leads with DFW, includes a real community-session photo, planning details, founder and case-study links, plus the dated Google review source. Community teaching experience is explicitly distinguished from measured business outcomes.
4. Remove self-serving Review/AggregateRating JSON-LD from the business. Visible reviews and their source stay. Add provider and service-area detail to the core training Service, and resolve the DFW area on offer pages. Normalize CRLF when comparing generated pages so line endings do not refresh sitemap dates.

## Evidence and limits

Google Maps showed 17 reviews, all five-star, on 2026-10-12: https://g.page/r/CWX_rCfFduC1EAI . Counts are a checked snapshot, not an automatic growth counter.

Google profile publicly remains Website designer and shows an older missed-call offer. The owner editor includes Computer training school as a secondary category and a pending mixed-business description. The profile was audited, not edited, during this website release. Recommended changes and the current search baseline are delivered privately to the owner, not in this public repository.

Official rules reviewed: https://developers.google.com/search/docs/appearance/structured-data/review-snippet and https://support.google.com/business/answer/3038177?hl=en . Self-serving business reviews are not eligible for review rich results; retaining visible sourced reviews does not require rating markup. No ranking or rich-result guarantee is made.

## Verification

Build the generated files with `node scripts/build.mjs`; run `npm test` (Git's `sh` must be on PATH on Windows). Tests cover metadata, hreflang, indexability, internal links, pricing, booking/quote isolation and the revised proof markup. Verify homepage, training comparison and onsite pages at desktop and phone widths, in both languages. Production uses the explicit existing Cloudflare Pages production deployment flow; backend and mail settings are unchanged.
