// Single source of business facts. Every page, schema node and llms.txt reads from here, so a fact changes once.
export const SITE = 'https://aimanjack.com';
export const BRAND = 'AI Man Jack';
export const LEGAL_NAME = 'AI Man Jack LLC';
export const EMAIL = 'jack@aimanjack.com';

// Two numbers, both correct — never merge them (A2P review requires every sms: CTA to use SMS_TEL).
export const DEMO_TEL = '+14695172968';          // the AI demo line — tel: CTAs (legacy receptionist pages only)
export const DEMO_DISPLAY = '(469) 517-2968';
export const SMS_TEL = '+14694254142';           // main / SMS number — sms: CTAs
export const SMS_DISPLAY = '(469) 425-4142';

export const BOOK_URL = '/book/';   // src/pages/book.mjs; a site-relative path is localised per language

// Link-preview cards. /img/* is cached immutable for a year, so a new card = a new file name here, never an overwrite.
// Regenerate with: sh scripts/make-brand-assets.sh <new-suffix>
export const OG_CARD = { en: '/img/og-2026-09.jpg', zh: '/img/og-2026-09-zh.jpg' };

export const GA4_ID = 'G-H7EF9HVN02';
export const GBP_URL = 'https://g.page/r/CWX_rCfFduC1EAI';

// Positioning (PRD 2026-09-18): corporate AI training + practical AI workflow training. The AI receptionist
// source stays in the repo but its marketing, navigation, schema and sitemap presence are off.
// Retired AI-receptionist pages (EN paths; each also has a /zh twin). Not built while FEATURES.legacyReceptionistRoutes is false.
// The 410 itself comes from the Cloudflare Worker aimanjack-gone-410 (zone routes, outside this repo): every path here and its
// /zh twin must have a route there. scripts/health.mjs checks the live 410s. The page modules stay in src/ for reference.
export const RETIRED_PATHS = ['/ai-receptionist/', '/pricing/', '/industries/', '/industries/salons/', '/industries/med-spas/', '/industries/clinics/',
  '/industries/home-services/', '/industries/repair-services/', '/integrations/', '/tools/missed-call-calculator/', '/blog/how-much-do-missed-calls-cost/',
  '/case-studies/ai-man-jack/', '/case-studies/car-dealership-sms/'];

export const FEATURES = {
  receptionistMarketing: false,   // no receptionist copy, offers or CTAs on indexable pages
  aiDemoGlobalCTA: false,         // no "Call our AI demo" header/sticky/dialog
  legacyReceptionistRoutes: false, // 2026-10-17 (Jack): retired. RETIRED_PATHS are not built and answer 410 Gone (Cloudflare Worker aimanjack-gone-410)
};

// Training proof and price anchor. Real counts only — never bump these for marketing.
// Google Maps (GBP_URL), checked 2026-10-12: 17 reviews; histogram shows all 17 at five stars.
export const PROOF = { talks: 5, perTalk: '50+', hackathon: 37, reviews: 17, rating: '5.0', reviewsCheckedOn: '2026-10-12' };
// The only public offer since 2026-09-28: the four-session program, priced per person. The half-day workshop was taken off the
// site (not repriced); a 90-minute session is mentioned only as a shorter first step. Change a price here only.
export const TRAINING = { sessions: 4, sessionMin: 90 };   // no public price (Jack, 2026-10-17): every format is quoted per team

// Team formats (Revenue OS v6, W-001, 2026-10-08). Only custom-four has an owner-approved public price. The 90-minute team workshop
// and the full-day onsite day are OWNER-UNAPPROVED: they are published with NO price — "Request a scoped quote" only. Proposed
// amounts live in revenue-os config/offer_catalog.json and must never be copied here or into any page (tests/site.test.mjs fails).
// Routes are a reversible decision: rename the path here and in src/pages/offers.mjs if the owner prefers another slug.
export const OFFERS = {
  workshop: { id: 'team-intro-90', path: '/ai-training/team-workshop/', format: 'workshop_90', minutes: 90 },
  onsite: { id: 'onsite-day', path: '/ai-training/onsite-texas/', format: 'onsite_day' },
  program: { id: 'custom-four', path: '/ai-training/', format: 'four_session' },
};
export const QUOTE_URL = '/contact/quote/';   // quote-intake form (src/pages/contact.mjs) → POST /v1/intake
export const INTAKE_FORM_VERSION = 'intake-2026-10-08';
export const QUICK_FORM_VERSION = 'intake-2026-10-17';   // short "easy quote" form on the tool pages (src/quick-quote.mjs), kind=quick
export const CONSENT_NOTICE_VERSION = 'privacy-2026-10-17-mailerlite';   // owner approved publication; bump with quote consent or /privacy changes

export const BUSINESS_SAME_AS = [GBP_URL, 'https://nextdoor.com/page/ai-man-jack-melissa-tx/', 'https://www.linkedin.com/in/jackqiandallas/', 'https://www.youtube.com/@JackBuildAI', 'https://x.com/AIManJack_', 'https://www.facebook.com/profile.php?id=100084925451350'];
export const JACK_SAME_AS = ['https://realagentusecases.com/', 'https://luma.com/user/usr-FlERJUF6Mcrie58', 'https://github.com/qianquandong', 'https://www.linkedin.com/in/jackqiandallas/', 'https://www.youtube.com/@JackBuildAI', 'https://x.com/AIManJack_', 'https://www.threads.com/@jack_qian616', 'https://www.facebook.com/profile.php?id=100084925451350', 'https://nextdoor.com/page/ai-man-jack-melissa-tx/'];

// Legacy receptionist pricing — read only by the noindex legacy pages (src/pages/pricing.mjs, product.mjs, industries.mjs).
export const PRICING = {
  overage: 0.45,
  addon: { website: 500 },
  tiers: [
    { id: 'starter', monthly: 199, setup: 750,  minutes: 200,  recommended: false },
    { id: 'growth',  monthly: 299, setup: 1500, minutes: 300,  recommended: true },
    { id: 'pro',     monthly: 599, setup: 2000, minutes: 1000, recommended: false },
  ],
};

export const money = (n) => '$' + n.toLocaleString('en-US');

// Page pairs: EN path ↔ ZH path. '/' ↔ '/zh/', '/pricing/' ↔ '/zh/pricing/', '/privacy' ↔ '/zh/privacy'.
export const zhPath = (p) => (p === '/' ? '/zh/' : '/zh' + p);
export const langPath = (lang, p) => (lang === 'zh' ? zhPath(p) : p);
