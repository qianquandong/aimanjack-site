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
export const FEATURES = {
  receptionistMarketing: false,   // no receptionist copy, offers or CTAs on indexable pages
  aiDemoGlobalCTA: false,         // no "Call our AI demo" header/sticky/dialog
  legacyReceptionistRoutes: true, // /ai-receptionist/, /pricing/, /industries/… still render (noindex, unlinked)
};

// Training proof and price anchor. Real counts only — never bump these for marketing.
export const PROOF = { talks: 5, perTalk: '50+', hackathon: 37, reviews: 10, rating: '5.0' };
export const TRAINING = { halfDayFrom: 1500, halfDayMax: 10 };

export const BUSINESS_SAME_AS = [GBP_URL, 'https://nextdoor.com/page/ai-man-jack-melissa-tx/', 'https://www.linkedin.com/in/quandong-qian-156563191/', 'https://www.youtube.com/@JackBuildAI', 'https://x.com/JackQianAI', 'https://www.facebook.com/profile.php?id=100084925451350'];
export const JACK_SAME_AS = ['https://realagentusecases.com/', 'https://luma.com/user/usr-FlERJUF6Mcrie58', 'https://github.com/qianquandong', 'https://www.linkedin.com/in/quandong-qian-156563191/', 'https://www.youtube.com/@JackBuildAI', 'https://x.com/JackQianAI', 'https://www.threads.com/@jack_qian616', 'https://www.facebook.com/profile.php?id=100084925451350', 'https://nextdoor.com/page/ai-man-jack-melissa-tx/'];

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
