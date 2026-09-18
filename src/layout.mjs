import { SITE, BRAND, EMAIL, SMS_TEL, SMS_DISPLAY, GA4_ID, BOOK_URL, langPath, zhPath } from './config.mjs';
import { T } from './i18n.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const L = (lang, p) => langPath(lang, p);

// Route → page object for one language. `indexable: false` on the route = noindex,follow + out of the sitemap
// for both languages, so legacy routes are hidden in one place (build.mjs and tests both go through here).
// A route may omit `zh` (EN-only resource pages): then no /zh/ file, no zh hreflang, no language switch.
export const langsOf = (p) => ['en', 'zh'].filter((l) => p[l]);
export const pageOf = (p, lang) => ({ path: p.path, ...p[lang], langs: langsOf(p), noindex: p.indexable === false || !!p[lang].noindex });

// Resource library routes exist in English only (docs/site-audit.md D4): link to them unprefixed from either language.
const EN_ONLY = ['/use-cases/', '/workflows/', '/templates/', '/tools/'];
export const href = (lang, p) => (EN_ONLY.some((x) => p.startsWith(x)) ? p : L(lang, p));

// ── Primary CTA: Book a Workshop → /book/ ────────────────────────────
export const planBtn = (lang, { pos = '', cls = '', id = '', label } = {}) =>
  `<a class="btn btn-primary ${cls}"${id ? ` id="${id}"` : ''} href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="${pos}">${label || T[lang].cta.plan}</a>`;

export const emailBtn = (lang, { pos = '', cls = 'btn-secondary' } = {}) =>
  `<a class="btn ${cls}" href="mailto:${EMAIL}?subject=${encodeURIComponent(lang === 'zh' ? '团队 AI 培训' : 'AI training for our team')}" data-event="email_training_click" data-pos="${pos}">${T[lang].cta.email}</a>`;

export const textLink = (lang, { pos = '', body = 'TRAINING - ' } = {}) =>
  `<a href="sms:${SMS_TEL}${body ? '?body=' + encodeURIComponent(body) : ''}" data-event="sms_training_click" data-pos="${pos}">${T[lang].cta.text} · ${SMS_DISPLAY}</a>`;

// ── Header / footer / sticky ──────────────────────────────────────────────
function header(lang, path, langs) {
  const t = T[lang], n = t.nav;
  const other = lang === 'zh' ? path : zhPath(path);
  const links = [['/ai-training/', n.training], ['/use-cases/', n.useCasesNav], ['/tools/', n.tools], ['/templates/', n.templates], ['/blog/', n.resources], ['/about/', n.about]]
    .map(([p, l]) => `<a href="${href(lang, p)}"${path.startsWith(p) ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  const langLink = !langs.includes(t.otherLangCode) ? '' : `<a class="lang" href="${other}" lang="${t.otherLangCode}" hreflang="${t.otherLangCode}" data-event="language_change">${t.otherLang}</a>`;
  return `<header class="site-header"><div class="wrap head-row">
<a class="brand" href="${L(lang, '/')}" aria-label="${BRAND}">AI Man <span>Jack</span></a>
<nav class="nav" aria-label="Primary">${links}${langLink}</nav>
<details class="menu"><summary aria-label="${t.menu}"><span class="menu-icon" aria-hidden="true"></span><span class="menu-label">${t.menu}</span></summary>
<nav class="nav mobile-nav" aria-label="Primary, mobile">${links}${langLink}</nav></details>
${planBtn(lang, { pos: 'header', cls: 'btn-sm head-call' })}
</div></header>`;
}

function footer(lang) {
  const f = T[lang].footer;
  const col = (title, items) => `<div><h2 class="foot-h">${title}</h2><ul>${items.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
  return `<footer class="site-footer"><div class="wrap">
<div class="foot-grid">
${col(f.product, [[L(lang, '/ai-training/'), f.training], ['/tools/', f.tools], ['/templates/', f.templates], ['/workflows/', f.workflows]])}
${col(f.useCases, [['/use-cases/sales/', f.sales], ['/use-cases/marketing/', f.marketing], ['/use-cases/operations/', f.operations], ['/use-cases/leadership/', f.leadership]])}
${col(f.resources, [[L(lang, '/blog/'), f.guides], ['https://realagentusecases.com/', f.newsletter]])}
${col(f.company, [[L(lang, '/about/'), f.about], [L(lang, '/contact/'), f.contact], [L(lang, BOOK_URL), f.book], [L(lang, '/privacy'), f.privacy], [L(lang, '/terms'), f.terms], [L(lang, '/sms-terms'), f.sms]])}
</div>
<p class="foot-serves">${f.loc} · ${f.serves}</p>
<div class="foot-id"><span>© 2026 AI Man Jack LLC</span><a href="mailto:${EMAIL}">${EMAIL}</a><a href="sms:${SMS_TEL}" data-event="sms_training_click" data-pos="footer">${SMS_DISPLAY}</a></div>
<p class="legal">${f.legal}</p>
</div></footer>`;
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
// page: { path (EN path), title, description, og?:{title,description,image,alt}, jsonld:[], body, view?, noindex?, bodyClass? }
export function render(page, lang) {
  const t = T[lang];
  const canonicalPath = page.canonicalPath ?? page.path;
  const url = SITE + L(lang, canonicalPath);
  const og = page.og || {}, langs = page.langs || ['en', 'zh'];
  const ogImage = og.image || (lang === 'zh' ? '/img/og-training-zh.jpg' : '/img/og-training.jpg');
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
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/favicon.ico" sizes="any">
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
<body${page.view ? ` data-view="${page.view}"` : ''}${page.bodyClass ? ` class="${page.bodyClass}"` : ''}>
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
