// Single source of business facts. Every page reads from here, so a fact changes once.
export const SITE = 'https://aimanjack.com';
export const BRAND = 'AI Man Jack';
export const LEGAL_NAME = 'AI Man Jack LLC';
export const EMAIL = 'jack@aimanjack.com';

// Two numbers, both correct — never merge them (A2P review requires every sms: CTA to use SMS_TEL).
export const DEMO_TEL = '+14695172968';          // the AI demo line — tel: CTAs
export const DEMO_DISPLAY = '(469) 517-2968';
export const SMS_TEL = '+14694254142';           // main / SMS number — sms: CTAs
export const SMS_DISPLAY = '(469) 425-4142';

// Secondary CTA. Empty = Jack's booking system is not live yet → CTA is "Email Jack" (mailto).
// Set to the real booking page URL and the label switches to "Book a 15-min demo" everywhere.
export const BOOK_URL = '';

export const GA4_ID = 'G-H7EF9HVN02';
export const GBP_URL = 'https://g.page/r/CWX_rCfFduC1EAI';

// Pricing — approved 2026-09-09 (PRD §15). Change here only with Jack's decision.
export const PRICING = {
  overage: 0.45,
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
