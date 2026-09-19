import { SITE, BRAND, EMAIL, SMS_TEL, SMS_DISPLAY, GA4_ID, BOOK_URL, OG_CARD, langPath, zhPath } from './config.mjs';
import { T } from './i18n.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const L = (lang, p) => langPath(lang, p);

// Route → page object for one language. `indexable: false` on the route = noindex,follow + out of the sitemap
// for both languages, so legacy routes are hidden in one place (build.mjs and tests both go through here).
// A route may omit `zh` (EN-only resource pages): then no /zh/ file, no zh hreflang, no language switch.
export const langsOf = (p) => ['en', 'zh'].filter((l) => p[l]);
export const pageOf = (p, lang) => ({ path: p.path, ...p[lang], langs: langsOf(p), noindex: p.indexable === false || !!p[lang].noindex });

export const href = (lang, p) => L(lang, p);   // kept as a seam: a route without a zh twin would be special-cased here

// ── Primary CTA: Book a Workshop → /book/ ────────────────────────────
export const planBtn = (lang, { pos = '', cls = '', id = '', label } = {}) =>
  `<a class="btn btn-primary ${cls}"${id ? ` id="${id}"` : ''} href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="${pos}">${label || T[lang].cta.plan}</a>`;

export const emailBtn = (lang, { pos = '', cls = 'btn-secondary' } = {}) =>
  `<a class="btn ${cls}" href="mailto:${EMAIL}?subject=${encodeURIComponent(lang === 'zh' ? '团队 AI 培训' : 'AI training for our team')}" data-event="email_training_click" data-pos="${pos}">${T[lang].cta.email}</a>`;

export const textLink = (lang, { pos = '', body = 'TRAINING - ' } = {}) =>
  `<a href="sms:${SMS_TEL}${body ? '?body=' + encodeURIComponent(body) : ''}" data-event="sms_training_click" data-pos="${pos}">${T[lang].cta.text} · ${SMS_DISPLAY}</a>`;

// ── Header / footer / hero / CTA band (design canvas 2026-09) ─────────────
const LOGO = `<svg width="36" height="36" viewBox="0 0 64 64" aria-hidden="true"><rect class="mark-bg" width="64" height="64" rx="16"/><g transform="translate(15 49)"><path class="mark-j" d="M0.88 -9.328V-11.616H7.744V-9.328Q7.744 -8.052 8.58 -7.04Q9.416 -6.028 11.44 -6.028Q13.42 -6.028 14.256 -6.996Q15.092 -7.964 15.092 -9.592V-32.56H22.22V-9.152Q22.22 -6.38 20.922 -4.18Q19.624 -1.98 17.226 -0.704Q14.828 0.572 11.528 0.572Q7.964 0.572 5.588 -0.726Q3.212 -2.024 2.046 -4.268Q0.88 -6.512 0.88 -9.328Z"/></g><circle cx="46.5" cy="18" r="5.5" fill="#A8552F"/></svg>`;
const logo = (lang) => `<a class="logo" href="${L(lang, '/')}" aria-label="${BRAND}">${LOGO}<span>AI Man Jack</span></a>`;

function header(lang, path, langs) {
  const t = T[lang], n = t.nav;
  const other = lang === 'zh' ? path : zhPath(path);
  const links = [['/ai-training/', n.training], ['/use-cases/', n.useCasesNav], ['/tools/', n.tools], ['/templates/', n.templates], ['/blog/', n.resources], ['/about/', n.about]]
    .map(([p, l]) => `<a href="${href(lang, p)}"${path.startsWith(p) || (p === '/use-cases/' && path.startsWith('/workflows/')) ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  const langLink = !langs.includes(t.otherLangCode) ? '' : `<a class="lang-pill" href="${other}" lang="${t.otherLangCode}" hreflang="${t.otherLangCode}" data-event="language_change">${t.otherLang}</a>`;
  return `<header class="hdr"><div class="wrap hdr-row">
${logo(lang)}
<nav class="hdr-nav" aria-label="Primary">${links}</nav><span class="spacer"></span>
${langLink}
${planBtn(lang, { pos: 'header', cls: 'btn-sm hdr-cta' })}
<details class="hdr-menu"><summary aria-label="${t.menu}"><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" stroke-width="2"/></svg></summary>
<nav class="hdr-menu-panel" aria-label="Primary, mobile">${links}${planBtn(lang, { pos: 'menu' })}</nav></details>
</div></header>`;
}

function footer(lang) {
  const f = T[lang].footer;
  const col = (title, items) => `<div><h2>${title}</h2>${items.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</div>`;
  return `<footer class="ftr"><div class="wrap">
<div class="ftr-top"><div class="ftr-brand">${logo(lang)}<p>${f.tagline}</p></div>
<div class="ftr-cols">
${col(f.training, [[L(lang, '/ai-training/'), f.corporate], [L(lang, '/ai-training/') + '#formats', f.workshops], [href(lang, '/tools/'), f.tools], [href(lang, '/templates/'), f.templates], [href(lang, '/workflows/'), f.workflows]])}
${col(f.teams, [[href(lang, '/use-cases/sales/'), f.sales], [href(lang, '/use-cases/marketing/'), f.marketing], [href(lang, '/use-cases/operations/'), f.operations], [href(lang, '/use-cases/leadership/'), f.leadership]])}
${col(f.resources, [[L(lang, '/blog/'), f.guides], ['https://realagentusecases.com/', f.newsletter]])}
${col(f.company, [[L(lang, '/about/'), f.about], [L(lang, '/contact/'), f.contact], [L(lang, BOOK_URL), f.book]])}
</div></div>
<p class="ftr-legal">${f.legal}</p>
<div class="ftr-bottom"><span>© 2026 AI Man Jack LLC · ${f.where}</span><div><a href="${L(lang, '/privacy')}">${f.privacy}</a><a href="${L(lang, '/terms')}">${f.terms}</a><a href="${L(lang, '/sms-terms')}">${f.sms}</a><a href="mailto:${EMAIL}" data-event="email_training_click" data-pos="footer">${EMAIL}</a><a href="sms:${SMS_TEL}?body=TRAINING%20-%20" data-event="sms_training_click" data-pos="footer">${SMS_DISPLAY}</a></div></div>
</div></footer>`;
}

// Stat bar under a photo hero: [[big, label]] — numbers come from config (PROOF / TRAINING) at the call site.
export const statBar = (items) => `<div class="stat-bar">${items.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>`;

// Full-bleed photo hero. img: { src, srcset?, portrait?, w, h, alt, pos? }. `inner` is the markup above the stat bar.
export const PHOTOS = {
  workshop: { src: '/img/hero-workshop-1600.webp', srcset: '/img/hero-workshop-960.webp 960w, /img/hero-workshop-1600.webp 1600w, /img/hero-workshop-2400.webp 2400w', portrait: '/img/hero-workshop-portrait-960.webp', w: 1600, h: 1067, pos: '50% 40%' },
  demo: { src: '/img/events/dallas-ai-hackathon-live-demo.webp', w: 1200, h: 900, pos: '50% 35%' },
  teaching: { src: '/img/jack-teaching.webp', w: 1100, h: 825, pos: '50% 30%' },
  classroom: { src: '/img/jack-classroom.webp', w: 1000, h: 750 },
};
export function photoHero({ photo, alt, size = '', inner, stats }) {
  const p = PHOTOS[photo];
  const img = `<img src="${p.src}"${p.srcset ? ` srcset="${p.srcset}" sizes="100vw"` : ''} width="${p.w}" height="${p.h}" fetchpriority="high" decoding="async" alt="${esc(alt)}" style="object-position:${p.pos || '50% 50%'}">`;
  return `<section class="photo-hero on-dark ${size}">${p.portrait ? `<picture><source media="(max-width:720px)" srcset="${p.portrait}">${img}</picture>` : img}
<div class="wrap">${inner}${stats ? statBar(stats) : ''}</div></section>`;
}

// Closing call to action on every main page: photo, dark wash, one button, email + text alternatives.
export function ctaBand(lang, { h, sub, pos = 'band' } = {}) {
  const b = T[lang].band;
  return `<section class="cta-band on-dark" id="start"><img src="${PHOTOS.classroom.src}" width="${PHOTOS.classroom.w}" height="${PHOTOS.classroom.h}" loading="lazy" decoding="async" alt="">
<div><h2>${h || b.h}</h2><p>${sub || b.sub}</p>${planBtn(lang, { pos, cls: 'btn-lg' })}
<p class="alt">${b.email} <a href="mailto:${EMAIL}" data-event="email_training_click" data-pos="${pos}">${EMAIL}</a> · ${b.text} <a href="sms:${SMS_TEL}?body=TRAINING%20-%20" data-event="sms_training_click" data-pos="${pos}">${SMS_DISPLAY}</a></p></div></section>`;
}

// Mobile sticky bar: appears once the hero CTA (#hero-cta) has scrolled out of view.
const sticky = (lang) => `<div class="sticky-call" id="sticky-cta" hidden><a href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="sticky"><span>${T[lang].sticky}</span></a></div>`;

const script = `<script>
(function(){var D=document;
var desk=matchMedia('(hover:hover) and (pointer:fine)').matches&&navigator.maxTouchPoints===0;
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
function track(n,p){gtag('event',n,Object.assign({page:location.pathname,language:D.documentElement.lang,device:desk?'desktop':'mobile'},p||{}))}
window.amjTrack=track;
D.addEventListener('click',function(e){var l=e.target.closest('[data-event]');if(l)track(l.dataset.event,{cta_position:l.dataset.pos||''});
 var m=e.target.closest('.menu nav a');if(m)m.closest('details').open=false});
var bar=D.getElementById('sticky-cta'),hero=D.getElementById('hero-cta');
if(bar&&hero&&'IntersectionObserver' in window)new IntersectionObserver(function(en){bar.hidden=en[0].isIntersecting||en[0].boundingClientRect.top>0}).observe(hero);
if(!/(^|\\.)aimanjack\\.com$/.test(location.hostname))return;
addEventListener('load',function(){var s=D.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA4_ID}';D.head.appendChild(s);
 gtag('js',new Date());gtag('config','${GA4_ID}');var v=D.body.dataset.view;if(v)track(v)});
})();
</script>`;

// ── Page shell ────────────────────────────────────────────────────────────
// page: { path (EN path), title, description, og?, jsonld:[], body, view?, noindex?, bodyClass?, hero?: 'photo' }
// hero:'photo' → the page opens with photoHero(); the header floats over it, white on transparent. Otherwise: light header bar.
export function render(page, lang) {
  const t = T[lang];
  const canonicalPath = page.canonicalPath ?? page.path;
  const url = SITE + L(lang, canonicalPath);
  const og = page.og || {}, langs = page.langs || ['en', 'zh'];
  const ogImage = og.image || OG_CARD[lang];
  const ogAlt = og.alt || (lang === 'zh' ? 'AI Man Jack：团队 AI 实战培训与 AI 工作流培训，达拉斯' : 'AI Man Jack: corporate AI training and practical AI workflows for teams, Dallas');
  const twitterImage = page.path === '/' ? `<meta name="twitter:image" content="${SITE}${ogImage}">
<meta name="twitter:image:alt" content="${esc(ogAlt)}">
` : '';
  const ld = page.jsonld?.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': page.jsonld })}</script>` : '';
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#F2EEE6">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${SITE + canonicalPath}">${langs.includes('zh') ? `
<link rel="alternate" hreflang="zh" href="${SITE + zhPath(canonicalPath)}">` : ''}
<link rel="alternate" hreflang="x-default" href="${SITE + canonicalPath}">
<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(og.title || page.title)}">
<meta property="og:description" content="${esc(og.description || page.description)}">
<meta property="og:image" content="${SITE}${ogImage}">
<meta property="og:image:alt" content="${esc(ogAlt)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${t.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(og.title || page.title)}">
<meta name="twitter:description" content="${esc(og.description || page.description)}">
${twitterImage}${ld}
<link rel="preload" href="/fonts/Satoshi-latin-2.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/style.css?v=0">
</head>
<body${page.view ? ` data-view="${page.view}"` : ''}${page.hero === 'photo' || page.bodyClass ? ` class="${[page.hero === 'photo' ? 'on-photo' : '', page.bodyClass || ''].join(' ').trim()}"` : ''}>
<a class="skip-link" href="#main">${t.skip}</a>
${header(lang, page.path, langs)}
<main id="main">
${page.body}
</main>
${footer(lang)}
${sticky(lang)}
${script}
</body>
</html>
`;
}
