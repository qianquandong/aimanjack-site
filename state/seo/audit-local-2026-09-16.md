# aimanjack.com SEO Audit (Local, no GSC)

Generated: 2026-09-16T19:59:48

Source: 80+ on-page signal checklist from `.claude/skills/seo-content-builder/SKILL.md`.

Pages audited: **42** · Average score: **93/100**

| score band | count |
|---|---|
| 90+ | 40 |
| 80-89 | 0 |
| 70-79 | 0 |
| 60-69 | 0 |
| 0-59 | 2 |
| MISSING | 0 |

## Per-page scores

| score | path | lang | type | top issues |
|---:|---|---|---|---|
| **0** | `/ai-training/` | en | pillar | BLOCKED by robots noindex |
| **0** | `/zh/ai-training/` | zh-CN | pillar | title len 27 (target 50-60); description len 73 (target 150-160); BLOCKED by robots noindex |
| **96** | `/industries/` | en | index | thin content: 592 words |
| **96** | `/zh/about/` | zh-CN | utility | thin content: 345 words |
| **96** | `/zh/ai-peixun-najia-zuihao/` | zh-CN | service | thin content: 556 words |
| **96** | `/zh/ai-peixun-shi/` | zh-CN | service | thin content: 577 words |
| **96** | `/zh/book/` | zh-CN | utility | thin content: 290 words |
| **96** | `/zh/case-studies/` | zh-CN | index | thin content: 226 words |
| **96** | `/zh/case-studies/ai-man-jack/` | zh-CN | blog | thin content: 263 words |
| **96** | `/zh/case-studies/car-dealership-sms/` | zh-CN | blog | thin content: 233 words |
| **96** | `/zh/contact/` | zh-CN | utility | thin content: 260 words |
| **96** | `/zh/industries/` | zh-CN | index | thin content: 218 words |
| **96** | `/zh/industries/clinics/` | zh-CN | service | thin content: 370 words |
| **96** | `/zh/industries/home-services/` | zh-CN | service | thin content: 342 words |
| **96** | `/zh/industries/med-spas/` | zh-CN | service | thin content: 372 words |
| **96** | `/zh/industries/repair-services/` | zh-CN | service | thin content: 352 words |
| **96** | `/zh/industries/salons/` | zh-CN | service | thin content: 366 words |
| **96** | `/zh/integrations/` | zh-CN | utility | thin content: 253 words |
| **96** | `/zh/pricing/` | zh-CN | service | thin content: 468 words |
| **96** | `/zh/privacy` | zh-CN | utility | thin content: 222 words |
| **96** | `/zh/sms-terms` | zh-CN | utility | thin content: 213 words |
| **96** | `/zh/terms` | zh-CN | utility | thin content: 248 words |
| **97** | `/case-studies/ai-man-jack/` | en | blog | description len 89 (target 150-160) |
| **97** | `/contact/` | en | utility | no /book/ CTA |
| **97** | `/privacy` | en | utility | no /book/ CTA |
| **97** | `/sms-terms` | en | utility | no /book/ CTA |
| **97** | `/terms` | en | utility | description len 25 (target 150-160) |
| **100** | `/` | en | landing | ✓ |
| **100** | `/about/` | en | utility | ✓ |
| **100** | `/ai-receptionist/` | en | service | ✓ |
| **100** | `/book/` | en | utility | ✓ |
| **100** | `/case-studies/` | en | index | ✓ |
| **100** | `/case-studies/car-dealership-sms/` | en | blog | ✓ |
| **100** | `/industries/clinics/` | en | service | ✓ |
| **100** | `/industries/home-services/` | en | service | ✓ |
| **100** | `/industries/med-spas/` | en | service | ✓ |
| **100** | `/industries/repair-services/` | en | service | ✓ |
| **100** | `/industries/salons/` | en | service | ✓ |
| **100** | `/integrations/` | en | utility | ✓ |
| **100** | `/pricing/` | en | service | ✓ |
| **100** | `/zh/` | zh-CN | landing | ✓ |
| **100** | `/zh/ai-receptionist/` | zh-CN | service | ✓ |

## Most common issues

| issue | pages affected |
|---|---:|
| thin content | 20 |
| no /book/ CTA | 3 |
| BLOCKED by robots noindex | 2 |
| description len 89 (target 150-160) | 1 |
| description len 25 (target 150-160) | 1 |
| title len 27 (target 50-60) | 1 |
| description len 73 (target 150-160) | 1 |

## Priority fixes (worst first)

### /ai-training/ (en, score 0)
- **title**: `AI Training for Dallas Teams, Hands-On | AI Man Jack` (52 chars)
- **desc**: (155 chars)
- **h1**: 'Hands-on AI training for Dallas teams, in English or Chinese'
- **schema types**: AdministrativeArea, AggregateRating, Answer, City, Country, FAQPage, Offer, Organization, Person, PostalAddress, ProfessionalService, Question, Rating, Review, Service, State, WebSite
- **internal links**: 33, **external**: 2
- **images**: 3 (alt 3, dims 3, lazy 2)
- **word count**: 2486
- **issues**: BLOCKED by robots noindex

### /zh/ai-training/ (zh-CN, score 0)
- **title**: `达拉斯团队 AI 实战培训 | AI Man Jack` (27 chars)
- **desc**: (73 chars)
- **h1**: '给达拉斯团队的 AI 实战培训，中文或英文都行'
- **schema types**: AdministrativeArea, AggregateRating, Answer, City, Country, FAQPage, Offer, Organization, Person, PostalAddress, ProfessionalService, Question, Rating, Review, Service, State, WebSite
- **internal links**: 37, **external**: 2
- **images**: 3 (alt 3, dims 3, lazy 2)
- **word count**: 660
- **issues**: title len 27 (target 50-60); description len 73 (target 150-160); BLOCKED by robots noindex

## Things the local audit cannot see (need GSC)

- Real keyword rankings and CTR by query
- Impressions and clicks per page
- Cannibalization between two pages competing on the same query
- Index coverage / excluded pages
- Core Web Vitals from field data (CrUX)
- Backlink profile

Run `python3 scripts/seo-keyword-tool/cli.py audit <gsc-export.csv> --out state/seo/cannibalization-audit-$(date +%F)` once you have a Search Console page×query export.
