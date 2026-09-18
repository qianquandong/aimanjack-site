// Shared primitives for the resource library (tools, use cases, workflows, templates). EN-only at launch (docs/site-audit.md D4).
// One card, one directory, one hero, one related block — new content is a data object, never a new layout.
import { SITE } from './config.mjs';
import { L, esc, planBtn } from './layout.mjs';
import { breadcrumb, BUSINESS_REF } from './components.mjs';

export const LANG = 'en';
export const DEPARTMENTS = { sales: 'Sales', marketing: 'Marketing', operations: 'Operations', leadership: 'Leadership' };

export const tag = (s) => `<span class="tag">${s}</span>`;

// card: whole surface is the link. `search` = extra text the directory filter matches on; `cat` = filter key.
export const card = ({ href, kicker = '', title, text, tags = [], cta = '', cat = '', search = '', event = '', hl = 'h3' }) =>
  `<a class="card link-card res-card" href="${href}"${cat ? ` data-cat="${cat}"` : ''} data-search="${esc([title, text, kicker, ...tags, search].join(' ').toLowerCase())}"${event ? ` data-event="${event}"` : ''}>
${kicker ? `<p class="res-kicker">${kicker}</p>` : ''}<${hl} class="h3">${title}</${hl}><p>${text}</p>${tags.length ? `<p class="tags">${tags.map(tag).join('')}</p>` : ''}${cta ? `<span class="res-cta">${cta} <span aria-hidden="true">&rarr;</span></span>` : '<span class="arrow" aria-hidden="true">&rarr;</span>'}</a>`;

// directory: search box + optional category buttons + card grid + no-match state. Filtering is ~15 lines of inline JS;
// with JS off, every card is simply visible (and every link crawlable).
export const directory = ({ noun, cards, filters = [] }) => `<div class="dir" data-dir>
<div class="dir-controls"><label class="dir-search"><span class="sr-only">Search ${noun}</span><input type="search" placeholder="Search ${noun}…" autocomplete="off" data-dir-q></label>
${filters.length ? `<div class="filters" role="group" aria-label="Filter by category"><button type="button" class="filter" aria-pressed="true" data-dir-f="">All</button>${filters.map(([k, l]) => `<button type="button" class="filter" aria-pressed="false" data-dir-f="${k}">${l}</button>`).join('')}</div>` : ''}</div>
<div class="grid-3 res-grid">${cards.join('\n')}</div>
<p class="dir-empty" data-dir-empty hidden role="status">No ${noun} found for “<span data-dir-term></span>”. Try another search or <button type="button" class="linkish" data-dir-reset>browse all ${noun}</button>.</p>
</div>
<script>(function(){var d=document.querySelector('[data-dir]');if(!d)return;var q=d.querySelector('[data-dir-q]'),cs=[].slice.call(d.querySelectorAll('.res-card')),fs=[].slice.call(d.querySelectorAll('[data-dir-f]')),em=d.querySelector('[data-dir-empty]'),cat='';
function run(){var t=q.value.trim().toLowerCase(),n=0;cs.forEach(function(c){var ok=(!t||c.dataset.search.indexOf(t)>-1)&&(!cat||c.dataset.cat===cat);c.hidden=!ok;if(ok)n++});em.hidden=n>0;d.querySelector('[data-dir-term]').textContent=q.value.trim()||cat}
q.addEventListener('input',run);fs.forEach(function(b){b.addEventListener('click',function(){cat=b.dataset.dirF;fs.forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});run()})});
d.querySelector('[data-dir-reset]').addEventListener('click',function(){q.value='';cat='';fs.forEach(function(x,i){x.setAttribute('aria-pressed',String(i===0))});run();q.focus()})})();</script>`;

export const resourceHero = ({ crumbs, eyebrow = '', h1, lead = '', extra = '' }) =>
  `<div class="wrap">${crumbs}</div><section class="page-hero res-hero"><div class="wrap narrow">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${h1}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}${extra}</div></section>`;

// related: a titled grid of cards. Empty list → nothing rendered.
export const related = (title, cards) => cards.length ? `<section class="section soft"><div class="wrap"><h2 class="h2-sm">${title}</h2><div class="grid-3 res-grid">${cards.join('\n')}</div></div></section>` : '';

// Copyable block (templates, workflow prompts). The copy button is tracked through the global [data-event] listener.
export const copyBlock = (id, text, { label = 'Copy template', event = 'template_copy' } = {}) =>
  `<div class="tpl"><div class="tpl-bar"><button type="button" class="btn btn-secondary btn-sm" data-copy="${id}" data-event="${event}" data-pos="${id}">${label}</button><span class="copy-status" role="status" aria-live="polite"></span></div><pre id="${id}" tabindex="0"><code>${esc(text)}</code></pre></div>`;
export const copyScript = `<script>document.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;var t=document.getElementById(b.dataset.copy).textContent,s=b.parentNode.querySelector('.copy-status');
function ok(){s.textContent='Copied';setTimeout(function(){s.textContent=''},2000)}
if(navigator.clipboard&&isSecureContext)navigator.clipboard.writeText(t).then(ok);else{var r=document.createRange();r.selectNodeContents(document.getElementById(b.dataset.copy));var sel=getSelection();sel.removeAllRanges();sel.addRange(r);s.textContent='Selected — press Ctrl/Cmd+C'}});</script>`;

// Contextual commercial CTA for resource pages (PRD §29: 80–90% useful content, one relevant ask).
export const trainingCta = ({ h, sub, pos, goal = '' }) => `<section class="section final-cta"><div class="wrap narrow center"><h2>${h}</h2><p class="lead">${sub}</p>
<div class="cta-row center">${planBtn(LANG, { pos, cls: 'btn-lg' })}<a class="btn btn-secondary btn-lg" href="/ai-training/" data-event="training_page_click" data-pos="${pos}">See how training works</a></div></div></section>`;

export const crumbs = (items) => breadcrumb(LANG, items);
export const list = (items, cls = '') => `<ul${cls ? ` class="${cls}"` : ''}>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
export const page = ({ path, title, description, body, jsonld, view, priority = 0.7, changefreq = 'monthly' }) => ({ path, priority, changefreq, en: { title, description, body, jsonld: [...jsonld, BUSINESS_REF], view } });

export { SITE, L, esc, BUSINESS_REF };
