# AI Man Jack Frontend PRD

**Document:** `frontend-prd.md`  
**Project:** AI Man Jack / aimanjack.com  
**Status:** Ready for implementation  
**Primary reference:** Cal.com homepage  
**Primary business goal:** Convert local service-business owners into qualified sales conversations by making the AI receptionist immediately understandable and directly testable by phone.  
**Primary UX goal:** A visitor should understand what the product does and be able to call the AI demo within 5 seconds.  
**Priority order:** SEO/GEO → conversion → speed → clarity → brand design → animation.
**Decisions log:** Section 49 records Jack's answers from 2026-09-09. Where a section below conflicts with Section 49, Section 49 wins.

---

# 1. Product thesis

AI Man Jack should not look like a generic “AI agency” site.

The homepage should behave like a lightweight product landing page:

1. Explain the product in one sentence.
2. Let the visitor experience the product immediately.
3. Show how the AI turns a call into an appointment.
4. Answer practical buying questions.
5. Provide proof.
6. Give the visitor one obvious next step.

The core product story is:

> **A customer calls → AI answers → AI handles common questions → AI books the appointment → the business receives the booking.**

The website must make this flow obvious without requiring the user to read long paragraphs.

---

# 2. Design direction

## 2.1 Reference direction

Use **Cal.com** as the primary interaction and layout reference.

Borrow:

- large, clear typography;
- generous whitespace;
- product UI as the visual;
- neutral color palette;
- strong contrast;
- short sections;
- simple cards;
- visible product workflow;
- minimal decorative imagery;
- clear navigation;
- restrained motion;
- obvious CTA hierarchy.

Do **not** clone:

- exact layout;
- exact typeface;
- exact spacing;
- exact iconography;
- exact wording;
- exact UI components.

AI Man Jack should feel like its own product.

## 2.2 Brand personality

Target feeling:

- calm;
- credible;
- modern;
- local;
- useful;
- technically capable;
- easy to buy.

Avoid:

- “AI futuristic” visual clichés;
- purple/blue gradient overload;
- glowing blobs;
- robot illustrations;
- 3D floating objects;
- dashboard-for-the-sake-of-dashboard;
- excessive glassmorphism;
- startup buzzword copy;
- overly playful consumer-app styling.

Working design name:

> **Quiet AI**

---

# 3. Primary customer

Initial frontend should be optimized for **appointment-based local businesses in DFW**, with examples such as:

- salons;
- beauty businesses;
- med spas where appropriate;
- repair/service businesses;
- home-service businesses;
- other appointment-driven SMBs.

Do not make the homepage feel like a healthcare-only website unless the business strategy changes and healthcare proof/compliance is available.

**Decision 2026-09-09:** the product on the homepage is AI customer service + booking only (training stays on `/ai-training`). Salons, med spas **and clinics** (dental, chiropractic/PT, acupuncture) appear on the first screen alongside repair and home services. Clinics are named as an audience; no healthcare compliance claims are made anywhere (see Section 17).

The first version should sell the common pain:

> **The owner or staff cannot answer every call while working with customers.**

---

# 4. Primary conversion action

The homepage has one dominant action:

# **CALL THE AI**

The demo phone number is not secondary contact information. It is the product demo.

It should visually function like a SaaS “Try Product” button.

Recommended CTA hierarchy:

### Primary
**Call the AI**

Behavior:
- mobile: `tel:` link;
- desktop: open a lightweight modal with the number and a QR code / “Call from your phone” instruction;
- if desktop calling is supported, also allow the `tel:` action.

### Secondary
**Book a 15-min demo**

Behavior:
- open the actual scheduling page/calendar;
- never silently convert this CTA into email, SMS, or phone;
- CTA wording and actual destination must always match.

**Decision 2026-09-09:** Jack is building his own booking system (it is also the product's booking system). Until it is live, the secondary CTA is labeled **Email Jack** and links to `mailto:jack@aimanjack.com`. The label changes to **Book a 15-min demo** only when the link opens the real booking page. One constant holds the booking URL so the swap is a one-line change.

**Phone numbers (hard rule):** `(469) 517-2968` is the AI demo line (`tel:` CTAs). `(469) 425-4142` is the SMS/main number and every `sms:` CTA must use it (A2P review requirement). Never merge the two.

### Tertiary
**See how it works**

Behavior:
- smooth anchor to the “How it works” section;
- no separate page needed initially.

---

# 5. Homepage success criteria

A new visitor should be able to answer these questions within 15 seconds:

1. What does AI Man Jack sell?
2. Is this relevant to my business?
3. Can I test it right now?
4. Can it actually book an appointment?
5. What happens if the AI cannot handle something?
6. How do I speak with Jack?
7. Is this local / available in DFW?

Primary KPI:

- qualified demo calls;
- booked sales calls.

Secondary KPI:

- CTA click-through;
- phone demo engagement;
- form submissions;
- case-study views.

Vanity metrics such as page views alone are not success criteria.

---

# 6. Homepage information architecture

Homepage order is mandatory unless user testing strongly disproves it.

---

## Section 0 — Header

### Desktop

Left:
- AI Man Jack wordmark/logo.

Center/right:
- How it works
- Use cases
- Pricing
- Case studies
- About

Right-most CTA:
- **Call the AI**

Optional secondary text link:
- EN / 中文

### Mobile

Header:
- logo;
- menu button;
- persistent small **Call AI** button if it does not crowd the layout.

Do not use a large mega-menu.

Navigation should remain simple.

---

## Section 1 — Hero

### Goal

The visitor must understand the offer and see the demo phone action without scrolling.

### Recommended content

Eyebrow:

> **AI receptionist for appointment businesses**

H1:

> **Your phone can answer itself.**

Alternative H1 to A/B test later:

> **Never miss another booking call.**

Supporting text:

> AI answers common questions, checks availability, and books appointments while you work.

Primary CTA:

> **Call the AI**

Under CTA:

> No signup. Just call.

Secondary CTA:

> Book a 15-min demo

Local credibility microcopy:

> Built and supported in Dallas–Fort Worth.

### Product visual

Do not use a stock image.

Use a lightweight HTML/CSS **live-call product mockup**.

Example:

```
● LIVE CALL
AI RECEPTIONIST
00:37

Customer
“Do you have anything Friday afternoon?”

AI
“Yes — I have 2:30 PM and 4:00 PM.”

Customer
“2:30 works.”

✓ Appointment booked
Friday · 2:30 PM
```

The visual must make the outcome obvious:

> **call → conversation → booking**

### Hero rules

- H1 max ~8 words.
- Supporting copy max 2 lines on desktop.
- Primary CTA visible without scrolling on common laptop sizes.
- Phone number should be visible or one interaction away.
- No carousel.
- No hero video.
- No background video.
- No autoplay media.
- No decorative animation that delays LCP.
- No large raster hero image.

---

# 7. Phone demo module

This is the most important custom component on the site.

## Component name

`PhoneDemoCard`

## Required states

### Default

Displays:

- “Try the AI receptionist”
- demo phone number;
- **Call now**
- English / 中文 / Español if truly supported;
- availability status if reliable.

### Desktop click

Open modal:

**Call the AI receptionist**

- demo number;
- QR code encoding `tel:+1...` or landing URL;
- short instruction:
  - “Ask about price.”
  - “Ask for an appointment.”
  - “Try changing the time.”
- close button.

Do not require an email before the demo.

**Decision 2026-09-09:**
- Demo number: `(469) 517-2968`, online 24/7, so the card may say "Always on".
- Languages: English, Spanish, Chinese are all supported and all three are shown.
- QR code encodes `tel:+14695172968` (direct dial), not a URL.
- Current demo behavior: answers questions about the service. Availability check, booking into a calendar, reschedule and cancel are **being built by Jack**; he approved writing them into the copy and the three "try asking" prompts now. Every transcript on the site is labeled "Example conversation" until a real anonymized call replaces it.

### Mobile click

Immediate `tel:` action.

### Tracking

Track:

- `demo_call_click`
- device type
- page
- CTA location
- language

Do not count repeat clicks as unique leads.

---

# 8. Section 2 — Social proof / credibility strip

Keep this visually small.

Do not display meaningless logo walls.

Use only verifiable proof.

Possible content:

- DFW-based;
- number of businesses served, only if true;
- number of calls handled, only if true;
- real review count, only if sourced correctly;
- client logos with permission.

Until stronger proof exists, prefer:

> **Built locally in DFW. Configured and tested with real business workflows.**

Never fabricate customer metrics.

**Decision 2026-09-09:** the Google reviews (5.0 across 10 reviews, all from workshop attendees), the five 50+ person talks and the 37-person hackathon go on `/ai-training` and `/about` only. They are not shown on the homepage as proof for the AI receptionist.

---

# 9. Section 3 — How it works

Heading:

> **From phone call to booked appointment.**

Three steps only.

### 01 — Customer calls

Copy:

> Keep your current number or route calls to the AI, depending on setup.

### 02 — AI handles the conversation

Copy:

> It answers approved questions, checks availability, and follows your booking rules.

### 03 — Appointment is booked

Copy:

> The booking goes into the connected scheduling workflow and the customer gets confirmation.

Each step should include a small product UI visual.

Do not use generic icons alone.

---

# 10. Section 4 — Real conversation demo

Heading:

> **What a real call looks like**

Use a transcript-style product module.

Example:

Customer:

> “How much is a haircut?”

AI:

> “Haircuts start at $45. Would you like me to check available times?”

Customer:

> “Tomorrow after 4.”

AI:

> “I have 4:30 PM and 5:15 PM.”

Customer:

> “4:30.”

Result:

> **Booked · Tomorrow · 4:30 PM**

Important:

- example must accurately reflect supported product behavior;
- mark a synthetic example as “Example conversation” if it is not an actual customer call;
- real anonymized transcript is preferable once available.

Optional:

Small **Call it yourself** CTA immediately under the demo.

---

# 11. Section 5 — What it can handle

Heading:

> **The calls your team answers every day.**

Use a clean 2-column or 3-column grid.

Cards:

### Business questions
- hours;
- location;
- service information;
- approved pricing information.

### Scheduling
- check availability;
- book;
- reschedule;
- cancel, only if supported.

### Lead capture
- caller name;
- phone;
- requested service;
- preferred time.

### Handoff
- transfer;
- message;
- escalation;
- fallback behavior.

Avoid generic cards such as:

- “AI powered”
- “smart automation”
- “next-generation intelligence”

Every card must correspond to a real customer job.

**Decision 2026-09-09:** transfer to a person is supported. Fallback behavior is configurable per business: take a message, transfer, or text the owner. The Handoff card says exactly that.

---

# 12. Section 6 — Who it is for

Heading:

> **Built for businesses that run on appointments.**

Initial vertical cards:

- Salon & beauty
- Med spa
- Repair & service
- Home services
- Other appointment businesses

Each card should link to an eventual industry landing page.

Do not publish 20 thin industry pages at launch.

Create vertical pages only when each page can include genuinely differentiated:

- call scenarios;
- FAQs;
- integrations;
- operational details;
- examples;
- proof.

**Decision 2026-09-09:** Jack chose to build all vertical pages at launch: `/industries/salons`, `/industries/med-spas`, `/industries/clinics`, `/industries/home-services`, `/industries/repair-services`. To avoid thin pages, each one must carry its own call scenarios, an example transcript, industry FAQ and a stated fallback. Proof is "Pilot results coming soon" until a real case exists. No city clones.

---

# 13. Section 7 — Integrations

Heading:

> **Works with the tools you already use.**

Only show integrations that are actually supported or have been tested.

Possible categories:

- calendar;
- booking software;
- CRM;
- SMS;
- phone system.

Each integration gets one of these labels:

- **Supported**
- **Pilot**
- **Ask us**

Never visually imply a full integration if it is only theoretically possible.

Link to a dedicated `/integrations` page later.

**Decision 2026-09-09:** no third-party integration has been tested yet. Labels at launch: AI Man Jack booking system (the product's own) = **Supported**; Google Calendar = **Pilot**; Square, Booksy, Vagaro, Fresha, Calendly, phone systems, CRMs, SMS = **Ask us**. `/integrations` ships at launch with these labels. TODO for Jack: test and upgrade labels.

---

# 14. Section 8 — Case study

This section is mandatory once at least one valid case exists.

Heading example:

> **How [Business] handled more calls without adding front-desk hours**

Case-study card should contain:

- customer/business name;
- business type;
- initial problem;
- implementation;
- measurement period;
- total relevant calls;
- bookings;
- actual attended appointments if known;
- exceptions/failures;
- customer quote;
- link to full case study.

Do not substitute a website screenshot for business results.

If no production case exists yet:

Use:

> **Pilot results coming soon**

Then show:
- tested workflow;
- what was measured;
- what still needs validation.

Never fake case-study statistics.

**Decision 2026-09-09:** two case studies ship at launch, both approved by Jack as public:

1. `/case-studies/ai-man-jack` — AI Man Jack's own demo line. Business type: AI service provider. Problem: prospects should try the receptionist before a sales call. Implementation: the live line at (469) 517-2968. Status: pilot; call counts and bookings reported only once measured. List what was measured and what still needs validation.
2. `/case-studies/car-dealership-sms` — SMS booking agent built for a used-car dealership in DFW (live on Cloudflare Workers): inbound text → collects the request and offers time slots → confirmed bookings stored → dealer receives a summary text. No metrics published until Jack supplies them. Dealership name withheld unless Jack approves.

---

# 15. Section 9 — Pricing

Pricing should be understandable in less than 20 seconds.

Avoid seven plans.

**Approved pricing decision — 2026-09-09:** display three priced tiers: **Starter / Growth / Pro**. Mark **Growth** as the recommended plan. Place a separate **Contact Sales** block below the comparison for custom needs; it is not a fourth priced tier.

These are Jack's approved initial prices for market testing. Actual delivery costs and customer willingness to pay have not yet been validated. Do not change the approved prices automatically based on cost assumptions.

### Public pricing table

| Feature | Starter | Growth — Recommended | Pro |
|---|---|---|---|
| Monthly fee | **$199 / month** | **$299 / month** | **$599 / month** |
| One-time setup fee | **$750** | **$1,500** | **$2,000** |
| Included voice usage | 200 minutes / month | 300 minutes / month | 1,000 minutes / month |
| Voice overage | $0.45 / minute | $0.45 / minute | $0.45 / minute |
| AI FAQs, messages and call transfers | Included | Included | Included |
| AI booking, rescheduling and cancellation | Not included | One standard booking workflow | Multiple staff and service routing within one location |
| Website | Use the client's existing website; no website build included | One-page booking-focused website | Business website with up to 3 pages |
| Mobile-friendly website, call and booking entry points | No website work included | Included | Included |
| Basic website SEO setup | Not included | Included | Included |
| Website hosting | Not included | Included | Included |
| Call review and reporting | Monthly summary | Monthly spot checks and summary | Weekly spot checks and monthly summary |

### Presentation and conversion

- Show the one-time setup fee next to the monthly fee on every pricing card. Both are payable for the selected plan; they are not alternative purchases.
- Starter serves businesses that need basic phone reception and already have a website. Growth is the main AI receptionist + booking + website offer. Pro adds voice allowance and more complex reception within a single location.
- All three tiers cover one business location. Define the supported staff count, calendars and service-routing rules before quoting Pro; do not imply unlimited complexity.
- Do not convert minutes into an estimated number of calls. Remove the old “300 minutes (~150 calls)” claim.
- Do not display Google Business Profile / GBP services in the public pricing table, pricing cards or package copy.
- Do not display a routine information-change allowance or “routine changes included” in public pricing copy. Maintenance boundaries belong in the service agreement; omitting the row does not promise unlimited changes.
- Remove the former Setup / Managed / Custom presentation and the separate $500 website + GBP add-on. Website delivery is bundled into Growth and Pro at the prices above.
- Public feature claims must match verified delivery. Booking, rescheduling, cancellation and Pro routing remain subject to testing; their presence in the approved package does not certify that development is complete. This qualification takes precedence over earlier permission in this PRD to describe unfinished booking features as already supported.

### Contact Sales block

Suggested English copy:

> **Need multiple locations, a bilingual website or custom integrations?**
> Contact us to discuss scope and pricing.
> **Contact Sales**

- Also route additional pages, custom website design and sensitive or regulated workflows to this block.
- Use the existing approved contact destination (`mailto:jack@aimanjack.com`) until Jack's booking system is live. The label must not imply an instant appointment booking.
- Do not put standard prices behind a contact-sales wall.

### Website delivery and service agreement

- Included website pricing assumes one language, a reusable design template, client-provided text and images, and two revision rounds.
- Basic SEO means on-page titles and descriptions, indexing configuration and sitemap setup. Ongoing content creation and ranking campaigns are not included, and no ranking guarantee is made.
- Client website language scope is separate from AI Man Jack's own bilingual EN/ZH website requirements, which remain unchanged.
- Define routine maintenance, new pages, redesigns and additional features in the service agreement rather than the public pricing table. Corrections to agreed functionality are separate from client-requested scope additions.
- The client owns and pays renewal for the domain. The client retains website files and domain after cancellation; included hosting ends with the service. AI phone-number ownership remains TODO Jack.
- No SMS allowance or SMS overage price was approved in this final public table. Confirm any separately billable messaging or third-party charges before contracting; do not silently add them or imply unlimited SMS.
- Cancellation: month to month, stop any time, with the billing and offboarding details stated in the service agreement.
- Go-live: about one week after details are received for a verified standard workflow, followed by a tuning period of variable length. Confirm feasibility before promising this schedule.
- Turning the AI off: contact Jack. No response-time promise on support.

---

# 16. Section 10 — Founder/local trust

Heading:

> **Built locally. Supported by a real person.**

Use a real photo of Jack.

Short copy only:

> AI Man Jack helps DFW businesses install practical AI systems that save staff time and capture missed opportunities. Jack handles setup, testing, and ongoing support.

Optional:
- Dallas AI community activity;
- workshops;
- local events;
- relevant proof.

Do not use community event attendance as proof that the AI receptionist itself produces business results.

**Decision 2026-09-09:** photo is a crop of the existing `img/jack-headshot.jpg`. Community talks, hackathon and Google reviews live on `/about` and `/ai-training`, not on the homepage founder block. Brand name on pages is "AI Man Jack"; footer and schema use "AI Man Jack LLC".

---

# 17. Section 11 — FAQ

FAQ is important for:

- objections;
- SEO;
- AI/search retrieval;
- sales qualification.

Initial questions:

1. Do I need to change my phone number?
2. Can it use my existing booking system?
3. What happens when the AI does not know the answer?
4. Can it transfer the call to a person?
5. Can customers reschedule or cancel?
6. What languages can it speak?
7. What does the monthly fee include?
8. How long does setup take?
9. What happens if the phone or booking integration fails?
10. Can I turn the AI off?
11. Who owns the number and data?
12. Is this appropriate for healthcare businesses?

Answers must be accurate to the current implementation.

Do not make HIPAA/compliance claims unless verified.

**Decision 2026-09-09 — approved answers:**

1. Change my number? No. Keep your number and forward calls, or let the AI answer on a new number. Both are supported.
2. Existing booking system? Not yet tested with third-party systems; see `/integrations` labels. The included booking system works today.
3. AI does not know the answer? Configurable per business: take a message, transfer to a person, or text the owner. It does not invent answers.
4. Transfer to a person? Yes.
5. Reschedule or cancel? Being built; describe as supported per Jack's approval, labeled as part of the booking workflow.
6. Languages? English, Spanish, Chinese.
7. Monthly fee includes? The selected Starter, Growth or Pro allowance and services in Section 15. State the one-time setup fee separately; do not imply it is included in the monthly fee.
8. Setup time? About one week after details are received, then a tuning period that varies.
9. Integration fails? Fallback flow runs (message / transfer / text owner) and Jack is notified.
10. Turn it off? Contact Jack; forwarding can be switched off at any time.
11. Who owns number and data? Website and domain: the client. AI number: TODO Jack. Call data: stays with the client's account; not sold.
12. Healthcare? Clinics are welcome, but sensitive or regulated workflows are discussed first. No HIPAA claim is made.

Important SEO note:

FAQ content is useful for users and search understanding, but do not design the site around expecting FAQ rich-result stars/expansion in Google.

---

# 18. Section 12 — Final CTA

Large, simple section.

Heading:

> **Try it before you buy it.**

Subtext:

> Call the AI receptionist and ask it to book an appointment.

Primary:

> **Call the AI**

Secondary:

> **Book a 15-min demo**

Phone number visible.

No long form.

---

# 19. Footer

Keep compact.

Columns:

### Product
- How it works
- Pricing
- Integrations
- Case studies

### Solutions
- Salon & beauty
- Local service businesses
- Team training

### Company
- About
- Contact
- Privacy
- Terms

### Location
- Dallas–Fort Worth, Texas

Footer should include consistent business identity information where appropriate.

Do not keyword-stuff city names.

---

# 20. Dedicated pages

Initial site architecture:

```
/
├── /ai-receptionist
├── /pricing
├── /case-studies
│   └── /[client-slug]
├── /integrations
│   └── /[integration-slug]
├── /industries
│   ├── /salons
│   ├── /med-spas          [only when claims/compliance are appropriate]
│   ├── /home-services
│   └── /repair-services
├── /ai-training
├── /about
├── /contact
├── /privacy
└── /terms
```

Do not launch all pages at once if they are thin.

Initial launch priority:

1. `/`
2. `/ai-receptionist`
3. `/pricing`
4. `/about`
5. `/contact`
6. one real `/case-studies/...`
7. `/ai-training`
8. verified industry/integration pages

**Decision 2026-09-09:** everything in the tree above ships in this release, plus `/industries/clinics`, `/terms` (new, short, Jack reviews), and the existing `/sms-terms`. Every page has an EN and a ZH pair under `/zh/`. `/ai-training` keeps its content and schema and only gets the new header, footer and styles. The old `/case-studies/*` → `/` redirect is removed once the case-study pages exist; all other redirects in `_redirects` stay.

---

# 21. SEO requirements

## 21.1 Rendered content

Critical content must exist in rendered HTML.

Do not hide essential service copy inside:

- canvas;
- video;
- images;
- client-only widgets;
- JS-generated UI that is unavailable before hydration.

## 21.2 Metadata

Every indexable page needs:

- unique `<title>`;
- unique meta description;
- canonical URL;
- Open Graph title;
- Open Graph description;
- Open Graph image;
- Twitter/X card metadata if retained.

## 21.3 H-tags

One semantic H1 per page.

Use H2/H3 for logical content structure.

Do not select heading levels for visual styling.

## 21.4 Internal linking

Pages should intentionally link between:

- industry → product;
- integration → product;
- case study → product;
- blog/resource → relevant commercial page;
- product → pricing;
- product → case study.

No orphan pages.

## 21.5 Sitemap / robots

Maintain:

- `/sitemap.xml`;
- `/robots.txt`.

Only index pages with real user value.

Do not index:

- duplicate language URLs without proper alternate handling;
- tag/filter pages with no unique value;
- temporary test pages;
- thin location clones.

## 21.6 International/language

If English and Chinese versions remain:

- each language gets a stable URL;
- use correct `hreflang`;
- use self-referencing canonical within each language;
- avoid machine-translated low-quality pages;
- language selector should link to the equivalent page when available.

---

# 22. GEO / Generative Search requirements

Treat GEO as **good SEO + machine-readable facts + unique first-hand content**, not as a separate gimmick.

The site must make these facts easy to extract:

- company name;
- service;
- geographic area;
- who the service is for;
- supported tasks;
- pricing;
- integrations;
- languages;
- support model;
- owner/operator identity;
- customer results;
- limitations.

## Content principles

Prioritize first-hand, non-commodity content:

- real customer workflows;
- call transcripts;
- implementation notes;
- case-study data;
- integration details;
- “what failed and how we fixed it”;
- local customer questions;
- actual pricing logic.

Avoid:

- 50 generic “AI receptionist in [city]” pages;
- AI-written generic listicles;
- unsupported claims about ChatGPT/Gemini recommending a business;
- writing content only to target fan-out query variations.

## `llms.txt`

May be added for compatibility with services that use it, but:

- do not treat it as a Google ranking factor;
- do not make it part of the core SEO strategy.

---

# 23. Structured data

Use JSON-LD only where factually appropriate.

Potential schemas:

### Organization

Include:
- name;
- URL;
- logo;
- founder if appropriate;
- contact details;
- sameAs profiles if official.

### LocalBusiness / ProfessionalService

Use only if the business qualifies and information is accurate.

Include:
- service area;
- contact details;
- business identity;
- hours if meaningful.

### Service

Use on core service pages.

### BreadcrumbList

Use on nested pages.

### Article

Use for genuine articles/case-study editorial pages where appropriate.

### Review / AggregateRating

Do not self-mark up reviews in a way that violates Google eligibility rules.

Never fabricate ratings.

Structured data must match visible page content.

---

# 24. Local SEO requirements

For DFW positioning:

- maintain consistent business identity;
- clearly state Dallas–Fort Worth service area;
- build one strong Dallas/DFW service page before creating city variants;
- use real local case studies;
- earn local backlinks through customers, events, partners, community organizations and publications;
- connect relevant pages to the official Google Business Profile where appropriate.

Do not create Plano / Frisco / McKinney / Allen / Richardson clones unless each page has meaningful unique local evidence/content.

---

# 25. Performance budget

Performance is a product requirement, not post-launch cleanup.

## Hard targets

Google Core Web Vitals target:

- **LCP ≤ 2.5 s**
- **INP < 200 ms**
- **CLS < 0.1**

Internal engineering target on representative mobile pages:

- Lighthouse Performance: **95+**
- Lighthouse Accessibility: **95+**
- Lighthouse Best Practices: **95+**
- Lighthouse SEO: **100**, where technically reasonable

A perfect Lighthouse number is not itself the SEO goal; real user performance and usability are.

## Initial payload budget

Target homepage initial transfer:

- HTML: ≤ 80 KB compressed
- critical CSS: ≤ 50 KB compressed
- initial JS: ≤ 150 KB compressed preferred
- total above-the-fold image transfer: ≤ 250 KB
- no hero video
- no WebGL assets

These are engineering budgets, not search-engine thresholds.

---

# 26. Performance implementation rules

Mandatory:

- server-render or statically render public marketing content;
- use semantic HTML;
- defer noncritical JS;
- lazy-load below-fold media;
- specify image width/height;
- use AVIF/WebP where appropriate;
- responsive `srcset`;
- self-host or efficiently load fonts;
- preload only truly critical assets;
- avoid layout shifts;
- reserve space for dynamic content;
- minimize third-party scripts;
- load analytics after critical rendering where possible.

Avoid shipping JavaScript for purely visual layout that CSS can handle.

---

# 27. Explicitly prohibited frontend techniques

Do not use:

- WebGL;
- Three.js;
- autoplay hero/background video;
- full-screen loading animation;
- page-transition loaders;
- scroll-jacking;
- cursor-following effects;
- parallax that affects usability;
- continuously moving decorative objects;
- large Lottie animations;
- autoplay carousels;
- giant animated gradients;
- background particle systems;
- 3D robot assets;
- animation libraries solely for decoration.

Allowed motion:

- button hover;
- 100–200 ms UI transitions;
- subtle accordion expansion;
- small state changes;
- reduced-motion compliant interactions.

If an effect does not improve comprehension or conversion, remove it.

---

# 28. Typography

Target visual direction:

- clean sans-serif;
- strong hierarchy;
- high readability;
- not overly “startup futuristic.”

Prefer system or lightweight variable font strategy.

Recommended hierarchy:

### Desktop

H1:
- approx. 64–80px depending on final typeface;
- tight but readable line-height.

H2:
- approx. 40–52px.

Body:
- 17–19px.

Small:
- 13–15px.

### Mobile

H1:
- approx. 42–52px.

H2:
- approx. 30–38px.

Body:
- 16–18px.

Do not use tiny 12px body copy for core content.

---

# 29. Color system

Keep neutral.

Suggested system:

- background: warm white or clean white;
- primary text: near-black;
- secondary text: neutral gray;
- borders: light neutral gray;
- one brand accent;
- success: standard accessible green;
- warning/error: accessible semantic colors.

Do not build the brand around gradients.

Buttons need sufficient contrast.

**Decision 2026-09-09:** replace the current green (`#0b5d38`) with a neutral near-black / gray system and one blue accent, per this section. Keep the self-hosted Satoshi variable font (19 KB latin subset); Chinese pages fall back to system CJK faces.

---

# 30. Layout system

Max content width:
- ~1200–1280px.

Text blocks:
- generally 600–760px max width.

Spacing:
- large section spacing;
- strong vertical rhythm;
- avoid dense card walls.

Desktop:
- 12-column grid if useful.

Mobile:
- one-column first;
- never force desktop bento grids into cramped mobile cards.

The page should feel calm, not empty.

---

# 31. Component library

Initial components:

```
Header
MobileNav
Hero
PhoneDemoCard
CallDemoModal
BookingDemoCard
HowItWorksStep
FeatureCard
IndustryCard
IntegrationBadge
CaseStudyCard
PricingCard
FounderBlock
FAQAccordion
FinalCTA
Footer
LanguageSwitcher
AnalyticsLink
```

Avoid creating a generic design-system abstraction before these patterns actually repeat.

---

# 32. Mobile requirements

Mobile is the primary environment for the call CTA.

Mandatory:

- `tel:` CTA works;
- call CTA visible in first viewport;
- tap targets ≥ 44×44 CSS px;
- no horizontal overflow;
- readable body copy without zoom;
- sticky CTA may be used after the hero;
- modals fit small screens;
- FAQ usable with one hand;
- nav closes predictably;
- no hover-only information.

Recommended sticky footer CTA after user scrolls beyond hero:

> **Call AI**

Do not cover content.

---

# 33. Accessibility

Minimum:

- semantic landmark elements;
- keyboard-operable navigation;
- visible focus state;
- proper button vs link semantics;
- accessible modal focus management;
- Esc closes modal;
- form labels;
- error messages associated with fields;
- contrast meeting WCAG AA;
- meaningful alt text;
- decorative imagery gets empty alt;
- reduced-motion support;
- accordion uses accessible states;
- language attribute set correctly.

Do not use color alone to communicate status.

---

# 34. Forms

Prefer very short forms.

Primary lead form:

Fields:

- Name
- Business name
- Phone or email
- Business type
- Current booking system (optional)

Optional:
- approximate monthly calls.

Do not ask for 10+ fields before a sales conversation.

Success state must confirm:

- submission succeeded;
- what happens next;
- expected contact channel.

Do not rely on a silent redirect.

**Decision 2026-09-09:** no lead form at launch. The site is static with no backend, so `/contact` offers three actions: call the AI demo, email `jack@aimanjack.com`, or text `(469) 425-4142`. A form can be added later with a Cloudflare Pages Function.

---

# 35. Analytics and attribution

Analytics must map to the revenue funnel.

Required events:

```
hero_call_click
sticky_call_click
demo_call_click
book_demo_click
booking_started
booking_completed
lead_form_started
lead_form_submitted
case_study_view
pricing_view
integration_view
language_change
```

Where technically possible, capture:

- page;
- referrer;
- UTM parameters;
- device category;
- language;
- CTA position.

Do not include sensitive customer conversation data in analytics.

Revenue funnel dashboard should eventually show:

```
Session
→ Demo interaction
→ Qualified contact
→ Sales meeting booked
→ Meeting attended
→ Proposal
→ Paid
→ Renewed
```

A CTA click is not a sale.

**Decision 2026-09-09:** GA4 property stays (`G-H7EF9HVN02`). The existing generic `cta_click` event is replaced by the names above, sent with `page`, `cta_position`, `language`, device category and UTM fields where available. Analytics loads after first paint and only on `aimanjack.com` hosts. The daily health script (`scripts/health.mjs`) is updated to check for the new events.

---

# 36. CTA copy rules

Use verbs describing exactly what will happen.

Good:

- Call the AI
- Book a 15-min demo
- See how it works
- View pricing
- Read the case study

Bad:

- Get Started
- Transform Your Business
- Unlock AI
- Discover the Future
- Learn More everywhere

“Book a demo” must open booking.

“Call” must initiate or clearly facilitate a phone call.

---

# 37. Copywriting rules

Tone:

- short;
- literal;
- confident;
- human;
- specific.

Prefer:

> AI answers your calls and books appointments.

Avoid:

> Leverage cutting-edge conversational intelligence to transform your customer journey.

Claims must be measurable or qualified.

Avoid absolutes such as:

- “never miss a lead”;
- “100% accurate”;
- “always books correctly”;
- “replaces your receptionist”;
- “guaranteed AI search ranking.”

Use operational language instead:

- “handles approved FAQs”;
- “follows your booking rules”;
- “escalates when needed”;
- “configured for your business.”

---

# 38. Homepage draft copy v1

This is a starting point, not final approved copy.

## Hero

**AI receptionist for appointment businesses**

# Your phone can answer itself.

AI answers common questions, checks availability, and books appointments while you work.

**[Call the AI]**

No signup. Just call.

**[Book a 15-min demo]**

Built and supported in Dallas–Fort Worth.

---

## How it works

# From phone call to booked appointment.

**01 — Customer calls**  
Use your existing phone setup or route calls into the AI workflow.

**02 — AI answers**  
It follows your approved information and scheduling rules.

**03 — Appointment booked**  
The customer gets a confirmed time and your business receives the booking.

---

## Capabilities

# The calls your team answers every day.

**Questions**  
Hours, services, location and approved pricing.

**Appointments**  
Availability, booking and supported schedule changes.

**Lead capture**  
Name, phone, service and preferred time.

**Fallback**  
Transfer, message or escalation when the AI should not answer.

---

## Final CTA

# Try it before you buy it.

Call the AI receptionist. Ask about pricing. Ask for an appointment. Try changing the time.

**[Call the AI]**

**[Book a 15-min demo]**

---

# 39. SEO content strategy

Homepage should stay visually short.

SEO depth should come from high-intent supporting pages.

Initial content backlog:

## Commercial

1. AI receptionist for appointment businesses
2. AI receptionist pricing
3. AI receptionist for salons
4. AI receptionist for DFW local businesses
5. AI receptionist setup service
6. AI receptionist vs answering service

## Integration

Only after implementation exists:

- AI receptionist + [booking platform]
- AI phone booking + [calendar]
- AI receptionist + [CRM]

## Case studies

Highest priority content type.

Each case study should include original operational data and first-hand implementation details.

## Local expertise

Write about actual local-business workflows rather than generic Dallas SEO filler.

---

# 40. GEO-ready content modules

Every major commercial page should contain concise factual modules that can stand alone when retrieved by a search/AI system.

Example:

### What AI Man Jack does

> AI Man Jack installs and manages AI phone reception workflows for appointment-based businesses in Dallas–Fort Worth. The system can be configured to answer approved business questions, collect lead information and connect callers to supported scheduling workflows.

### What it does not do

> The AI should not invent information. Unsupported questions are handled using the configured fallback flow, such as transfer, message-taking or staff follow-up.

### Where service is available

> Dallas–Fort Worth and remote implementation where supported.

Facts must be updated whenever service scope changes.

---

# 41. Technical architecture preference

Do not rewrite the current stack solely to achieve this design.

Use the existing production framework if it can meet:

- SSR/SSG;
- semantic HTML;
- fast navigation;
- metadata control;
- schema injection;
- image optimization;
- analytics;
- language routing.

If choosing a new stack is unavoidable, prefer one optimized for static/server-rendered marketing content.

Do not introduce a SPA-only architecture for a simple marketing site.

---

# 42. Image strategy

Use very few images.

Preferred:

1. product UI built in HTML/CSS;
2. real founder photo;
3. real client/business photos;
4. real workshop photos on training page;
5. case-study evidence.

Avoid:

- AI-generated business-owner hero images;
- stock call-center photos;
- generic robot graphics;
- decorative illustrations with no product meaning.

---

# 43. Testing requirements

Before release:

## Functional

- all CTA destinations correct;
- phone number correct;
- `tel:` works on mobile;
- booking flow works;
- forms submit;
- success/error states work;
- navigation works;
- language links work;
- FAQ works;
- analytics events fire.

## Responsive

Check at least:

- 360×800
- 390×844
- 430×932
- 768×1024
- 1440×900
- 1728×1117

## Browser

Latest:

- Chrome;
- Safari;
- Edge;
- Firefox.

## SEO

- indexable status correct;
- canonical correct;
- title/meta unique;
- one H1;
- structured data valid;
- sitemap updated;
- robots correct;
- hreflang correct if multilingual;
- no accidental `noindex`.

## Performance

Test mobile Lighthouse and real deployment behavior.

Do not accept a local-only performance result.

---

# 44. Launch acceptance criteria

The redesign is not complete until all conditions below are met.

### Hero

- visitor can identify the product without scrolling;
- primary call CTA visible above fold on mobile and desktop;
- phone demo works;
- product visual clearly shows booking outcome.

### Conversion

- call CTA action matches wording;
- booking CTA opens real booking;
- lead form confirms success;
- analytics distinguishes demo calls from sales bookings.

### Performance

- good Core Web Vitals target met or no known frontend blocker remains;
- no WebGL/video dependency;
- no major layout shift;
- no unnecessary heavy animation library.

### SEO

- core content server/static rendered;
- metadata complete;
- canonical correct;
- schema matches visible content;
- sitemap/robots correct;
- internal links exist;
- important pages not orphaned.

### GEO

- business/service/location facts visible in text;
- at least one first-hand evidence page planned or published;
- unsupported ranking/AI-recommendation claims removed;
- no mass-generated thin local pages.

### Trust

- service boundaries are stated;
- fallback behavior stated;
- integration claims accurate;
- pricing scope understandable;
- real human/company identity visible.

---

# 45. Implementation priority

## P0 — Revenue path

Do first:

1. header;
2. hero;
3. phone demo CTA;
4. desktop phone modal;
5. mobile `tel:` flow;
6. booking CTA;
7. how-it-works section;
8. final CTA;
9. analytics;
10. performance baseline.

## P1 — Buyer confidence

Then:

1. capabilities;
2. integrations;
3. pricing;
4. founder/local trust;
5. FAQ;
6. case-study module;
7. accessibility pass.

## P2 — Search growth

Then:

1. product page;
2. first strong industry page;
3. real case study;
4. integration page(s);
5. improved internal linking;
6. supporting high-intent content.

## P3 — Optional polish

Only after P0–P2:

- subtle micro-interactions;
- refined transition timing;
- optional lightweight product-state demo;
- design refinements.

Never block launch on animation polish.

---

# 46. Agent instructions

The implementation agent must follow these rules:

1. **Do not redesign beyond this PRD without a concrete UX reason.**
2. **Do not add decorative features to “make it more premium.”**
3. **Do not add animation libraries unless interaction cannot reasonably be implemented with CSS/native browser APIs.**
4. **Do not invent testimonials, customer counts, revenue metrics, call metrics, integrations or compliance claims.**
5. **Use placeholders/TODOs for unavailable business facts.**
6. **Do not change existing URLs casually. Preserve SEO equity with redirects if URLs must change.**
7. **Do not remove existing valid structured data without replacing it appropriately.**
8. **Do not ship a CTA whose label does not match its destination.**
9. **Do not make the site healthcare-specific without explicit approval and supporting business/compliance requirements.**
10. **Do not create city-page clones.**
11. **Do not use AI-generated generic filler copy.**
12. **Performance regressions caused by decorative design are bugs.**
13. **SEO/GEO regressions caused by visual design are bugs.**
14. **Mobile call-demo usability is P0.**
15. **When uncertain, prefer simpler HTML, fewer dependencies and clearer text.**

---

# 47. Definition of done

The frontend is done when a DFW business owner can:

1. open the homepage;
2. understand the AI receptionist offer in under 5 seconds;
3. call the AI immediately;
4. understand that it can turn a conversation into a booking;
5. see what it can and cannot handle;
6. understand approximate pricing/scope;
7. verify who is behind the service;
8. book a real conversation with Jack;
9. use the page quickly on mobile;
10. find enough factual content for search engines and AI search systems to accurately describe the business.

The final website should make the visitor think:

> **“I understand what this does. I can try it right now.”**

Not:

> **“This website has impressive animations.”**

---

# 48. Reference notes

Primary design reference:
- https://cal.com/

Google Search / GEO references:
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/appearance/page-experience
- https://developers.google.com/search/docs/essentials

The PRD intentionally prioritizes clear, server-readable content, first-hand evidence and page experience. Google states that SEO best practices remain foundational for generative AI features in Search, and recommends useful, original/non-commodity content rather than scaled pages created primarily to manipulate rankings.

---

# 49. Decisions log (Jack, 2026-09-09)

Answers to the 38 pre-implementation questions. This section overrides any conflicting text above.

## Scope and process

| # | Question | Decision |
|---|---|---|
| 1 | Uncommitted blue "home-call" experiment in the repo | Discard. Rebuild from zero to this PRD. |
| 2 | Which pages | All pages in Section 20, plus `/industries/clinics` and `/terms`. |
| 3 | Chinese | Every page gets a `/zh/` pair, built together. |
| 4 | `/ai-training` | Content and schema unchanged; new header, footer, styles. |
| 5 | Release | Deploy to a preview branch first. Jack reviews, then production. |

## Positioning

| # | Question | Decision |
|---|---|---|
| 6 | Audience | AI customer service + booking only. Salons, med spas and clinics on the first screen, plus repair and home services. |
| 7 | Hero copy | PRD draft as written (Section 38). |
| 8 | Brand name | "AI Man Jack" on pages; "AI Man Jack LLC" in footer and schema. |

## Phone demo

| # | Question | Decision |
|---|---|---|
| 9 | Demo line today | Answers questions: yes. Check availability / book / reschedule / cancel: not yet, Jack is building them. Copy may describe them now. |
| 10 | Uptime | Always online, 24/7. |
| 11 | Languages | English, Spanish, Chinese. |
| 12 | Desktop QR | Encodes `tel:` for direct dial. |
| 13 | "Try asking" prompts | Write all three (price, appointment, change time). Jack will make them work. |
| 14 | Book-a-demo CTA | Jack is building his own booking system. Until live, secondary CTA = "Email Jack" (mailto). |
| 15 | Two phone numbers | Unchanged: (469) 517-2968 demo, (469) 425-4142 SMS/main. |

## Pricing

| # | Question | Decision |
|---|---|---|
| 16 | Structure | Approved initial tiers: Starter $199/month + $750 setup; Growth (recommended) $299/month + $1,500 setup; Pro $599/month + $2,000 setup. Separate Contact Sales block for custom requirements. Section 15 contains the full approved comparison. |
| 17 | Website inclusion | Starter uses the existing website with no website build. Growth includes a one-page website; Pro includes up to 3 pages. Remove the separate $500 website add-on. Omit GBP from public package copy. |
| 18 | Included minutes | Starter 200, Growth 300, Pro 1,000 minutes/month; all tiers $0.45/minute overage. No estimated call-count conversion. Prices approved for initial testing; actual cost validation remains open. |
| 19 | Support scope | Public table shows call review/reporting only: monthly summary / monthly spot checks and summary / weekly spot checks and monthly summary. Omit routine information-change allowances from public pricing; define maintenance in the service agreement. No response-time promise. |
| 20 | Ownership after cancel | Client retains website files and domain and pays domain renewal. Included hosting ends with service. AI number: TODO Jack. |
| 21 | Go-live | About one week, then a tuning period of variable length. |

## Product facts

| # | Question | Decision |
|---|---|---|
| 22 | Phone number change | Both options: forward existing number, or new number. |
| 23 | Unknown question | Configurable: message, transfer, or text the owner. |
| 24 | Transfer to human | Supported. |
| 25 | Booking software | Untested. Own system = Supported, Google Calendar = Pilot, others = Ask us. |
| 26 | Turn off | Contact Jack. |
| 27 | Healthcare | Talk first about sensitive workflows; no compliance claims. |

## Proof

| # | Question | Decision |
|---|---|---|
| 28 | Live customer | Jack's own demo line is the case study (pilot). |
| 29 | Car dealership SMS agent | Approved as a public case study. |
| 30 | Google reviews (5.0 / 10) | Show on `/ai-training`, not the homepage. |
| 31 | Talks and hackathon | `/about` only. |

## Visual, forms, analytics, SEO

| # | Question | Decision |
|---|---|---|
| 32 | Color | Neutral system + one accent, per Section 29. Green retired. |
| 33 | Font | Keep self-hosted Satoshi. |
| 34 | Founder photo | Crop of existing headshot. |
| 35 | Contact form | None. Email `jack@aimanjack.com`, SMS, and the demo line. |
| 36 | Analytics | Rename to PRD event names; update health script. |
| 37 | `/case-studies/*` redirect | Removed, because case-study pages now exist. Other redirects stay. |
| 38 | `/terms` | New short page; Jack reviews the text. |

## Open items for Jack

- Validate actual per-minute costs, setup hours and ongoing maintenance against the approved initial pricing in Section 15; obtain Jack's decision before any later price change.
- Finalize service-agreement maintenance boundaries, Pro staff/calendar limits, any messaging or third-party charges, and hosting/offboarding details without reintroducing GBP or routine-change rows into public pricing.
- Ownership of the AI phone number after cancellation.
- Booking system URL, to switch the secondary CTA to "Book a 15-min demo".
- Integration tests, to upgrade labels on `/integrations`.
- Dealership name and any measured numbers for the SMS case study.
- Review of `/terms` and `/privacy` wording.
