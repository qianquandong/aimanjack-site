---
name: seo-content-builder
description: Use when generating AI Man Jack service pages or blog posts that need to rank in Google and be cited by ChatGPT / Claude / Perplexity. Builds static-HTML pages with the full 80+ on-page signal checklist, Lighthouse 100/100 hygiene, and the company's training-focused voice. Triggers: "write a service page", "write a blog post", "seo write a page for X", "create a pillar page".
---

# SEO Content Builder — AI Man Jack (Training Positioning)

Build SEO pages for **aimanjack.com** that rank and convert. Pages must be
HTML, hand-written (no template engines), Lighthouse 100/100, and obey the
80+ on-page signal checklist. The site's positioning is **AI enterprise
training**, not AI receptionist — AI receptionist is only a *demo case study*
inside blog posts and the `/ai-receptionist/` pages; never the subject of a
service page or pillar.

## When to load this skill

- User asks for a new service page or blog post.
- User says "写一个 service page", "写一个 blog", "seo 优化 X 页", "pillar page for X".
- Marketing specialist gets a research CSV back and needs to materialise it.

## When NOT to load this skill

- Tweaks to a single meta tag, link, or schema field on an existing page
  (use the existing `aimanjack-site` patterns instead).
- Anything that is *not* a publishable page (Slack messages, internal docs).
- Sales / curriculum / training design (use those specialist skills instead).

## Inputs you must collect before writing

1. **Target URL** — exact path under `https://aimanjack.com` (or `/zh/`). Must
   match an existing pillar in `state/seo/topic-cluster-map-{zh,en}.md`.
2. **Primary keyword** — one head term the page must rank for.
3. **Keyword cluster** — list of 3-8 satellite keywords from the research CSV.
4. **Language** — `en` or `zh-CN`. The page's `<html lang>` attribute must
   match. For `zh-CN` the page lives under `/zh/`.
5. **Content type** — `service` (landing page) or `blog` (article).
6. **Pillar URL** — for blog posts, the parent service page the post links
   back to. For service pages, the closest parent pillar.
7. **Internal links** — list of ≥ 3 sibling pages to cross-link.

If any of these is missing, return a short blocker:
"Need: target URL, primary keyword, cluster, lang, pillar URL."

## Voice rules (company positioning)

- Core business: **AI enterprise training** (not AI receptionist / phone
  answering / chatbot agency).
- Voice: short sentences, concrete examples, no AI slop. Forbidden phrases:
  "in today's fast-paced world", "leverage", "unlock", "delve", "in this
  article we will", "navigate the complexities".
- Pricing facts (when needed): "半天工作坊 $1,500 起，10 人以内，到公司现场"
  — pulled from existing `/pricing/` and `/zh/pricing/`, **never invented**.
- Use real Jack voice: 5.0 Google reviews, 50+ attendees per talk, 37-guest
  hackathon, Dallas–Fort Worth, English / Chinese / Spanish. The numbers are
  real; do not round up.
- **AI receptionist is allowed only as a demo case study** inside blog posts
  ("学员回去给店里装了个 AI 前台..."). Never as the subject of a service page
  or pillar under the new training positioning.

## Output location

The site is **generated**: `src/` is the source, root HTML is the build output (both committed). Never hand-write HTML into the root.

- **Blog post** → `node scripts/blog-new.mjs <slug>` creates `src/posts/<slug>.mjs` from `src/posts/_TEMPLATE.mjs`. Fill `en` and `zh` in the same file (every URL is a language pair: `/blog/<slug>/` + `/zh/blog/<slug>/`). Keep `status: 'draft'` until Jack approves; `node scripts/build.mjs` skips drafts. Validate with `node scripts/blog-check.mjs <slug>` (0 FAIL required). The renderer in `src/blog.mjs` adds head/meta/hreflang, Article + FAQPage + BreadcrumbList JSON-LD, takeaways box, byline, dates and the CTA, so the post file only holds content.
- **Service page** → a new module in `src/pages/<name>.mjs` exporting `pages` (see `src/pages/cases.mjs` for the shape), or a new entry in an existing module. Chinese path is derived automatically (`/zh/...`).
- Then `node scripts/build.mjs` → sitemap updates itself. Publishing steps: HANDOFF.md §6 and the Agent OS `workflows/seo-blog.md` §5.

## 80+ on-page signals checklist

Run through this list and verify each item before returning the page.

### Meta & head
- [ ] `<title>` 50-60 chars: `[Primary Keyword] - [Modifier] | AI Man Jack`
- [ ] `<meta name="description">` 150-160 chars, contains primary keyword + CTA
- [ ] `<link rel="canonical">` self-referencing absolute URL
- [ ] Open Graph: `og:title`, `og:description`, `og:image` (1200x630),
      `og:type=website`, `og:url`, `og:locale`
- [ ] Twitter Card: `twitter:card=summary_large_image`, matching title,
      description, image
- [ ] `<html lang="en">` or `<html lang="zh-CN">` — must match the language
- [ ] `viewport` meta with `width=device-width, initial-scale=1`
- [ ] Favicon + apple-touch-icon
- [ ] For zh: `<link rel="alternate" hreflang="en" href=".../path/without/zh/">`
      and the reverse on the en page. `x-default` points to the en URL.

### Content structure
- [ ] Exactly one `<h1>` containing the primary keyword
- [ ] Logical `<h2>` / `<h3>` outline that mirrors the search intent
- [ ] First 100 words mention the primary keyword naturally
- [ ] Word count matches or exceeds the median of top-5 SERP competitors
- [ ] No keyword stuffing — keyword density reads naturally
- [ ] At least one FAQ section with 5-7 Q&A pairs (use `<details>` or
      FAQ schema)
- [ ] One inline CTA visible above the fold (e.g. "Book a 30-min call")

### Internal / external linking
- [ ] ≥ 3 contextual internal links to sibling pages in the same cluster
- [ ] ≥ 1 contextual internal link back to the parent pillar
- [ ] ≥ 1 contextual internal link forward from pillar (verify after publish)
- [ ] ≥ 1 external link to a credible authoritative source (E-E-A-T signal)
- [ ] All links absolute on production, root-relative on dev

### Media
- [ ] Hero image: WebP or AVIF, < 100 KB, descriptive alt containing keyword
- [ ] All images have alt text; decorative images use `alt=""`
- [ ] All images use `loading="lazy"` except above-the-fold hero
- [ ] All images have explicit `width` and `height` attributes
- [ ] No third-party image hosts (Pexels images must be downloaded into
      `img/pexels-cache/<keyword>-<id>.webp` via `scripts/pexels-search.py`)
- [ ] Pexels credit visible in footer / colophon (e.g. "Photo by Mikael
      Blomkvist on Pexels")

### Schema (JSON-LD)
- [ ] `Service` schema on every service page (name, provider, areaServed,
      description, offers)
- [ ] `LocalBusiness` schema on landing pages (Dallas, address from
      `contact/`)
- [ ] `FAQPage` schema when FAQ section exists
- [ ] `BreadcrumbList` reflecting site hierarchy
- [ ] `Article` + `author` schema on blog posts (author = Jack Qian with
      sameAs links)

### Lighthouse 100/100 hygiene
- [ ] Static HTML only — no client-side JS frameworks, no client-only
      rendering. JS used must be ≤ 70 KB total and load via `defer`.
- [ ] CSS ≤ 100 KB total; critical CSS inline in `<head>`
- [ ] All fonts preloaded; `font-display: swap`
- [ ] No blocking third-party scripts (no analytics inline in `<head>`)
- [ ] All external resources use HTTPS
- [ ] Cache headers set (Cloudflare Pages handles via `_headers`)
- [ ] `apple-touch-icon`, favicon, manifest referenced

### Conversion
- [ ] Lead form posts to `/functions/api/lead` (or the booking equivalent)
- [ ] Primary CTA "Book a 30-min call" links to `/book/` or `/zh/book/`
- [ ] Phone CTA visible: "Text TRAINING to (469) 425-4142"
- [ ] Trust signals visible (Google reviews 5.0 ★, workshop attendees, etc.)

## Service-page template (training positioning)

Each service page covers one training vertical (e.g. AI training for sales
teams, AI training for HR). 8 sections, in this order:

1. **Hero** — H1 with primary keyword, sub-headline about *what the team
   leaves with* (a working workflow), primary CTA.
2. **Why this team needs it** — 3 bullets, each a specific repetitive pain.
3. **Formats** — 90-min lunch-and-learn / 半天工作坊 $1,500 起 / multi-week
   project; pulled from existing `/pricing/` (do not invent new formats).
4. **Live demo or workshop clip** — embed link or static screenshot (no
   fabricated testimonials).
5. **Real outcomes** — 3 short paragraphs: a buyer outcome + a participant
   outcome + a measurable metric. Pull metrics from real data: 5.0 ★
   Google reviews, 50+ attendees per talk, 37 guests hackathon.
6. **FAQ** — 5-7 objections answered (e.g. "我们没技术背景", "数据安全吗",
   "学完能落地吗"). Use `<details>` or schema.
7. **Pricing + next step** — link to `/book/` for 30-min call; link to
   `/pricing/` for full breakdown. Never invent price.
8. **CTA + Schema** — Service + LocalBusiness + FAQPage JSON-LD.

## Blog-post template

Each blog post covers one search-intent topic from the cluster map. 8
sections:

1. **Hook** — concrete observation, *not* "AI is changing X". Open with a
   real example (Jack's workshop, a client's win, a measurable number).
2. **Numbers** — concrete data (e.g. "5 场讲座，每场 50+ 人"). Cite source
   inline.
3. **5-7 step framework** — actionable list. Each step is one sentence +
   one concrete example.
4. **Objection** — address one common pushback (e.g. "员工乱用怎么办").
5. **Industry inset** — show how the framework applies to one specific
   role (sales / HR / finance / operations).
6. **CTA** → `/book/` or the parent service page.
7. **Author byline + E-E-A-T schema** — author = Jack Qian, with sameAs
   links and credentials.
8. **Internal links** — ≥ 5 contextual links: 3 siblings, 1 pillar, 1
   external authoritative source.

## Pexels integration

Before writing the hero image, run:

```
python3 scripts/pexels-search.py "<primary keyword>" --count 3 --max-width 1600
```

Pick the most relevant photo, confirm the photographer credit, and embed it
with credit in the footer / colophon. Cache path is
`/img/pexels-cache/<slug>-<id>.webp`.

If the page is in zh, also search for the keyword in zh-CN:
`--locale zh-CN`. Both en and zh hero photos are pulled at the same time so
the bilingual pair stays visually aligned.

## Cannibalization guard

Before writing or modifying any title / H1, run:

```
python3 scripts/seo-keyword-tool/cli.py pages --lang <zh|en>
```

and check the existing pages list. If the proposed primary keyword is
already the *owner* of another URL in the same cluster, **stop and call
out the conflict** in the response — do not silently rewrite another page's
primary keyword.

## Post-write validation

After the file is written, run:

1. `python3 scripts/seo-keyword-tool/cli.py pages --lang <zh|en>` and confirm
   the new page is detected.
2. Append the URL to `state/seo/published-urls.txt`.
3. Trigger sitemap rebuild (the build script does it automatically once the
   file is present).
4. Verify with `curl -I` that the page returns 200.
5. Hand off to QA / Reality Checker if the page is a high-priority P0.

## Output contract

When you complete a page, return:

- Absolute path written
- Canonical URL
- Title + meta description
- Primary keyword + KD label + volume estimate
- Number of internal / external links added
- Pexels photo ID + photographer credit used
- Anything still pending (canonical link, schema field, image alt)