# /ai-training/dallas/ — the one local page (2026-10-13)

Why: the visibility probe in `docs/ai-search-visibility-2026-10-13.md` found every site ranking above us for "corporate AI training Dallas" / "AI workshop for my team Dallas" had a dedicated Dallas landing page, while we had three pages sharing the term (home title, `/ai-training/onsite-texas/` H1, `/ai-training/`). Google ranked the home page #16 and rewrote our training title. AI answers (Perplexity, Bing Copilot, Google AI Overview) never mentioned us.

Decision (owner-approved 2026-10-13):
- `/ai-training/dallas/` (EN + `/zh/`) owns the local intent. Title and H1 carry "Dallas–Fort Worth"; nothing else on the site does — `tests/site.test.mjs` guards this for `/`, `/ai-training/` and the onsite page.
- The home page went back to brand + corporate training ("Corporate AI Training for Business Teams"); DFW stays in its eyebrow (linked to the Dallas page) and body.
- `/ai-training/onsite-texas/` keeps the full-day FORMAT (title "Full-Day Onsite AI Training at Your Office | Texas"); the Dallas page keeps the PLACE and links to all three formats through the shared chooser.

Facts on the page and where they come from:
- Sessions, dates, venues, sign-up counts: `src/content/events.mjs`, copied from Jack's Luma account on 2026-10-13 (sign-ups, not headcount — the page says so). Add a row per new session; the stats recompute.
- DFW IT Association fireside chat, 2026-07-25, Schimelpfenig Library, Plano: from the organiser's poster (Jack was the featured speaker). Listed, not counted.
- Photos: `img/events/dallas-hackathon-*` (DJI stills from the 2026-04-18 hackathon), `dfwit-fireside-2026-07-25-*` (Sony, taken by Jack's family), `dallas-session3-*` (2026-07-18). Originals and 1200px GBP copies live in `img/events/raw/` (gitignored).
- Reviews: five Google reviews quoted verbatim (two new: Jason Jia, Dian Fan). No Review/AggregateRating markup, per the 2026-10-12 decision.
- Prices: only the approved program price. Workshop and onsite day stay "scoped quote".

Not done here, still open: GBP category/description (manual, Jack), directory listings (RevenueBase, Clutch, Alignable, dallas-ai.org), a public team-workshop price (owner decision).
