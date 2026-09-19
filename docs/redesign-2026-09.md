# Redesign 2026-09 — change list

Branch `redesign-2026-09`. Source: design canvas "AI Man Jack 网站改版" (32 artboards: EN/ZH × desktop/mobile × 8 pages). Not merged, not deployed to production.

## Design system (`style.css`)
- `:root` tokens replaced: `--bg #F2EEE6`, `--card #E6DCCB`, `--surface #FFFFFF`, `--ink #1D1A19`, `--muted #625C54`, `--line #D8CFBF`, `--accent #A8552F`, `--accent-text #9A4B28`, `--on-dark-accent #E8A27A`, `--on-dark-muted #BDB3A6`, `--on-photo #EFEAE1`. Legacy names (`--bg-soft`, `--tint`, `--accent-ink`, `--line-strong`) alias the new ones so the noindex pages inherit the look.
- Radii 20 / 24–28 / 999 (pills). No shadows anywhere: 1px `--line` or a `--card` fill. Transitions are colour-only, 150ms; the one width transition (assessment progress bar) was removed. `prefers-reduced-motion` still honoured.
- New components: `.hdr` (light bar / transparent over photo), `.photo-hero` + `.stat-bar`, `.sec`, `.sec-head`, `.oak`, `.rows`, `.prog`, `.split-photo`, `.photo-strip`, `.steps-line`, `.nums`, `.answer`, `.panel-dark`, `.quote`, `.faq`, `.res-card`, `.meta-grid`, `.code-dark`, article (`.art-*`, `.toc`, `.takeaways`, `.cta-card`), about (`.stat-cards`, `.big-card`, `.pills`, `.contact-rows`), book (`.book-grid`, `.bk*`), `.cta-band`, `.ftr`.
- Breakpoints 1000px (nav collapses to the menu, 12-col grids stack, 4-up → 2-up) and 720px (20px gutters, single column, full-width buttons, stat bar 2×2, photo strip 1+2).
- Chinese: `html[lang=zh]` display sizes ≈0.84×, line-height ≈1.2, letter-spacing 0, `<em>` upright in `--on-dark-accent` (`--accent-text` on light grounds), font stack per spec.
- Contrast audited for every text/ground pair: lowest body pair 4.53:1 (`--accent-text` on `--card`); `--accent` is used only for large numerals and glyphs (≥3.86:1).

## Templates
- `src/layout.mjs`: new logo mark (inline SVG), `header()` with desktop nav + language pill + CTA and a `<details>` mobile menu (logo, language, hamburger only), dark four-column `footer()` (A2P SMS paragraph kept, small, above the bottom row), `photoHero()`, `statBar()`, `ctaBand()`. Pages opt into the floating white header with `hero: 'photo'`.
- Home, `/ai-training/`, `/use-cases/*`, `/about/`: photo hero + stat bar. `/workflows/`, workflow detail, articles, `/book/` and everything not drawn (tools, templates, blog index, contact, legal, 404, legacy): light header.
- Closing photo CTA band on every main page except About and Book (as drawn). `finalCta()` now returns the band, so legacy callers get it too.
- Home keeps one "Free tools" band between programs and the photo strip (agreed deviation from the canvas).
- Article pages: centred head, figure, auto "On this page" from `<h2>`s, oak takeaways card, inline dark CTA card, three onward cards.
- Workflow detail: meta cards (team, level, tools — "time to set up" from the canvas is omitted: no measured data), oak "how it usually goes", numbered steps, dark prompt/example pair with copy, review checklist + "where this workflow stops", related, band. Templates follow the same pattern.
- Booking page: two-column layout; the booking script, element ids and `/v1/*` calls are unchanged. Step numerals come from a CSS counter, so reschedule mode still numbers correctly.
- Mobile sticky "Book a Workshop" bar kept and restyled (not in the canvas; keeps its GA4 event).

## Chinese
- All existing zh strings replaced with the canvas copy (formal register). CTA 「预约团队培训」. Terms fixed: 工作坊、工作流、提示词、核验、智能体（Agent）.
- **The resource library is now bilingual**: `/zh/tools/`, `/zh/tools/ai-readiness-assessment/`, `/zh/use-cases/*`, `/zh/workflows/*` (10), `/zh/templates/*` (8). Chinese lives in `src/content/zh.mjs` (workflows, templates), inline `zh` blocks in `usecases.mjs`, and `ZH`/`UI` in `freetools.mjs`. 47 → 74 indexable URLs. hreflang pairs and the language switch are on for all of them; zh pages link only to zh pages (tested).
- The assessment runs in Chinese with the same deterministic scoring; its result passes a Chinese summary to `/zh/book/?goal=`.
- Google reviews on zh pages are shown in translation and labelled 「（译自英文原评）」.
- The one published post was rewritten in zh to match; the hidden legacy post was left alone.

## Unchanged on purpose
Titles/descriptions/canonicals/hreflang logic, JSON-LD builders, every `data-event` / `data-pos`, booking script and API, FAQ `<details>`, directory search/filter script, assessment scoring, `indexable:false` legacy handling, numbers from `src/config.mjs` (`PROOF`, `TRAINING`, phones, email).

## Tooling
- `scripts/health.mjs`: `SITE=<origin>` runs the same checks against a preview deploy (drift and the daily snapshot are skipped there); page list now covers both languages of the library.
- Tests: 25 pass. New/changed: header items are never anchors; library is bilingual and zh never links to EN library pages; home strings.
- Fixed along the way: an inline 3-column grid on the legacy receptionist page that overflowed phones (pre-existing), a directory filter row that overflowed at 390px.

## Known gaps
1. `style.css` still carries the pre-redesign rules for the old header/footer/menu and legacy blocks (≈25 KB raw, dead on indexable pages). Safe to prune in a follow-up once the preview is approved.
2. Favicon and OG cards still use the old mark/colours.
3. Chinese workflows/templates were written for this release and, like the English ones, have not each been run by Jack on real work.
4. `docs/site-audit.md` D4 (English-only library) is superseded by this release.
