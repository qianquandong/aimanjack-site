import { readFileSync } from 'node:fs';
import { SITE, BRAND, EMAIL, DEMO_TEL, DEMO_DISPLAY, SMS_TEL, SMS_DISPLAY, GA4_ID, BOOK_URL, langPath, zhPath } from './config.mjs';
import { T } from './i18n.mjs';

const QR = readFileSync(new URL('./qr-demo.svg', import.meta.url), 'utf8').replace('<svg ', '<svg role="img" aria-hidden="true" focusable="false" ');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const L = (lang, p) => langPath(lang, p);

// ── CTAs ──────────────────────────────────────────────────────────────────
export const callBtn = (lang, { event = 'demo_call_click', pos = '', cls = '', label } = {}) =>
  `<a class="btn btn-primary ${cls}" href="tel:${DEMO_TEL}" data-call data-event="${event}" data-pos="${pos}">${label || T[lang].cta.call}</a>`;

export const secondaryBtn = (lang, { pos = '', cls = '' } = {}) => BOOK_URL
  ? `<a class="btn btn-secondary ${cls}" href="${BOOK_URL.startsWith('/') ? L(lang, BOOK_URL) : BOOK_URL}" data-event="book_demo_click" data-pos="${pos}">${T[lang].cta.book}</a>`
  : `<a class="btn btn-secondary ${cls}" href="mailto:${EMAIL}?subject=${encodeURIComponent(lang === 'zh' ? 'AI 前台咨询' : 'AI receptionist demo')}" data-event="email_click" data-pos="${pos}">${T[lang].cta.email}</a>`;

export const textLink = (lang, { pos = '', body = '' } = {}) =>
  `<a href="sms:${SMS_TEL}${body ? '?body=' + encodeURIComponent(body) : ''}" data-event="sms_click" data-pos="${pos}">${T[lang].cta.text} · ${SMS_DISPLAY}</a>`;

// ── Header / footer / dialog / sticky ─────────────────────────────────────
function header(lang, path) {
  const t = T[lang], n = t.nav;
  const other = lang === 'zh' ? path : zhPath(path);
  const links = [
    [L(lang, '/') + '#how', n.how], [L(lang, '/industries/'), n.useCases], [L(lang, '/pricing/'), n.pricing],
    [L(lang, '/case-studies/'), n.cases], [L(lang, '/about/'), n.about],
  ].map(([h, l]) => `<a href="${h}">${l}</a>`).join('');
  return `<header class="site-header"><div class="wrap head-row">
<a class="brand" href="${L(lang, '/')}" aria-label="${BRAND}">AI Man <span>Jack</span></a>
<nav class="nav" aria-label="Primary">${links}<a class="lang" href="${other}" lang="${t.otherLangCode}" hreflang="${t.otherLangCode}" data-event="language_change">${t.otherLang}</a></nav>
<details class="menu"><summary aria-label="${t.menu}"><span class="menu-icon" aria-hidden="true"></span><span class="menu-label">${t.menu}</span></summary>
<nav class="nav mobile-nav" aria-label="Primary, mobile">${links}<a class="lang" href="${other}" lang="${t.otherLangCode}" hreflang="${t.otherLangCode}" data-event="language_change">${t.otherLang}</a></nav></details>
${callBtn(lang, { event: 'header_call_click', pos: 'header', cls: 'btn-sm head-call' })}
</div></header>`;
}

function footer(lang) {
  const f = T[lang].footer;
  const col = (title, items) => `<div><h2 class="foot-h">${title}</h2><ul>${items.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
  return `<footer class="site-footer"><div class="wrap">
<div class="foot-grid">
${col(f.product, [[L(lang, '/') + '#how', f.how], [L(lang, '/ai-receptionist/'), f.product_page], [L(lang, '/pricing/'), f.pricing], [L(lang, '/integrations/'), f.integrations], [L(lang, '/case-studies/'), f.cases]])}
${col(f.solutions, [[L(lang, '/industries/salons/'), f.salon], [L(lang, '/industries/'), f.local], [L(lang, '/ai-training/'), f.training]])}
${col(f.company, [[L(lang, '/about/'), f.about], [L(lang, '/contact/'), f.contact], [L(lang, '/privacy'), f.privacy], [L(lang, '/terms'), f.terms], [L(lang, '/sms-terms'), f.sms]])}
<div><h2 class="foot-h">${f.location}</h2><p class="foot-loc">${f.loc}</p><p class="foot-serves">${f.serves}</p></div>
</div>
<div class="foot-id"><span>© 2026 AI Man Jack LLC</span><a href="mailto:${EMAIL}">${EMAIL}</a><a href="sms:${SMS_TEL}" data-event="sms_click" data-pos="footer">${SMS_DISPLAY}</a><a href="https://realagentusecases.com/" rel="noopener">${f.newsletter}</a></div>
<p class="legal">${f.legal}</p>
</div></footer>`;
}

function dialog(lang) {
  const m = T[lang].modal, d = T[lang].demo, t = T[lang];
  return `<dialog id="call-dialog" class="call-dialog" aria-labelledby="call-dialog-title">
<form method="dialog"><button class="dialog-close" aria-label="${t.close}">&times;</button></form>
<h2 id="call-dialog-title">${m.title}</h2>
<a class="dialog-number" href="tel:${DEMO_TEL}" data-event="demo_call_click" data-pos="dialog">${DEMO_DISPLAY}</a>
<div class="dialog-body"><div class="dialog-qr" role="img" aria-label="${m.qrAlt}">${QR}</div>
<div><p class="dialog-scan">${m.scan}</p><p class="dialog-try">${m.tryAsking}</p><ul>${m.prompts.map((p) => `<li>${p}</li>`).join('')}</ul>
<p class="dialog-meta">${d.langs} · ${d.alwaysOn}</p>
<button type="button" class="copy-number" data-number="${DEMO_DISPLAY}" data-copied="${m.copied}">${m.copy}</button><span class="copy-status" role="status" aria-live="polite"></span></div></div>
</dialog>`;
}

const sticky = (lang) => `<div class="sticky-call" id="sticky-call" hidden><a href="tel:${DEMO_TEL}" data-event="sticky_call_click" data-pos="sticky"><span>${T[lang].sticky}</span><b>${DEMO_DISPLAY}</b></a></div>`;

const script = `<script>
(function(){var D=document,dlg=D.getElementById('call-dialog');
var desk=matchMedia('(hover:hover) and (pointer:fine)').matches&&navigator.maxTouchPoints===0;
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
function track(n,p){gtag('event',n,Object.assign({page:location.pathname,language:D.documentElement.lang,device:desk?'desktop':'mobile'},p||{}))}
D.addEventListener('click',function(e){var a=e.target.closest('a[data-call]');
 if(a&&desk&&dlg&&dlg.showModal){e.preventDefault();dlg.showModal();track(a.dataset.event,{cta_position:a.dataset.pos});return}
 var l=e.target.closest('[data-event]');if(l)track(l.dataset.event,{cta_position:l.dataset.pos||''});
 var m=e.target.closest('.menu nav a');if(m)m.closest('details').open=false});
var cp=D.querySelector('.copy-number'),st=D.querySelector('.copy-status');
if(cp){if(!(navigator.clipboard&&isSecureContext))cp.hidden=true;cp.addEventListener('click',function(){navigator.clipboard.writeText(cp.dataset.number).then(function(){st.textContent=cp.dataset.copied})})}
var bar=D.getElementById('sticky-call'),hero=D.getElementById('hero-call');
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
  const url = SITE + L(lang, page.path);
  const og = page.og || {};
  const twitterImage = page.path === '/' ? `<meta name="twitter:image" content="${SITE}${og.image || (lang === 'zh' ? '/img/og-receptionist-zh.jpg' : '/img/og-receptionist.jpg')}">
<meta name="twitter:image:alt" content="${esc(og.alt || (lang === 'zh' ? 'AI Man Jack：24 小时 AI 客服，拨打 (469) 517-2968 试听' : 'AI Man Jack: 24/7 AI customer service for appointment businesses. Call the AI: (469) 517-2968'))}">
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
<link rel="alternate" hreflang="en" href="${SITE + page.path}">
<link rel="alternate" hreflang="zh" href="${SITE + zhPath(page.path)}">
<link rel="alternate" hreflang="x-default" href="${SITE + page.path}">
<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(og.title || page.title)}">
<meta property="og:description" content="${esc(og.description || page.description)}">
<meta property="og:image" content="${SITE}${og.image || (lang === 'zh' ? '/img/og-receptionist-zh.jpg' : '/img/og-receptionist.jpg')}">
<meta property="og:image:alt" content="${esc(og.alt || (lang === 'zh' ? 'AI Man Jack：预约制商家的 AI 前台，拨打 (469) 517-2968 试听' : 'AI Man Jack: AI receptionist for appointment businesses. Call the AI: (469) 517-2968'))}">
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
${header(lang, page.path)}
<main id="main">
${page.body}
</main>
${footer(lang)}
${sticky(lang)}
${dialog(lang)}
${script}
</body>
</html>
`;
}
