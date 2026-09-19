// Shared primitives for the resource library (tools, use cases, workflows, templates), EN + ZH.
// One card, one directory, one related block — new content is a data object, never a new layout.
// Content objects carry English at the top level and Chinese under `zh`; loc() overlays it.
import { SITE } from './config.mjs';
import { L, esc, ctaBand, href } from './layout.mjs';
import { breadcrumb, BUSINESS_REF } from './components.mjs';

export const loc = (o, lang) => (lang === 'zh' && o.zh ? { ...o, ...o.zh } : o);

export const R = {
  en: {
    dept: { sales: 'Sales', marketing: 'Marketing', operations: 'Operations', leadership: 'Leadership' },
    level: { beginner: 'Beginner', intermediate: 'Intermediate' },
    all: 'All', filterBy: 'Filter by team', search: (n) => `Search ${n}…`, empty: (n) => [`No ${n} found for “`, `”. Try another search or `, `browse all ${n}`, '.'],
    openWorkflow: 'Open workflow', openTemplate: 'Open template', copied: 'Copied', selected: 'Selected — press Ctrl/Cmd+C',
    workflows: 'Workflows', templates: 'Templates', useCases: 'Use cases', tools: 'Free tools', allWorkflows: 'All workflows →', allTemplates: 'All templates →',
    seeTraining: 'See how training works →',
  },
  zh: {
    dept: { sales: '销售', marketing: '市场', operations: '运营', leadership: '管理层' },
    level: { beginner: '入门', intermediate: '进阶' },
    all: '全部', filterBy: '按团队筛选', search: (n) => `搜索${n}`, empty: (n) => [`未找到与“`, `”相关的${n}。请尝试其他关键词，或`, `浏览全部${n}`, '。'],
    openWorkflow: '查看工作流', openTemplate: '查看模板', copied: '已复制', selected: '已选中，请按 Ctrl/Cmd+C 复制',
    workflows: '工作流', templates: '模板', useCases: '应用场景', tools: '免费工具', allWorkflows: '全部工作流 →', allTemplates: '全部模板 →',
    seeTraining: '了解培训方式 →',
  },
};

export const tag = (s) => `<span class="tag">${s}</span>`;

// card: whole surface is the link. `search` = extra text the directory filter matches on; `cat` = filter key; oak = --card fill.
export const card = ({ href: h, kicker = '', title, text, tags = [], cta = '', cat = '', search = '', event = '', hl = 'h3', oak = false }) =>
  `<a class="card link-card res-card${oak ? ' oakc' : ''}" href="${h}"${cat ? ` data-cat="${cat}"` : ''} data-search="${esc([title, text, kicker, ...tags, search].join(' ').toLowerCase())}"${event ? ` data-event="${event}"` : ''}>
${kicker ? `<div class="eyebrow">${kicker}</div>` : ''}<${hl} class="h3">${title}</${hl}><p>${text}</p>${tags.length ? `<div class="tags">${tags.map(tag).join('')}</div>` : ''}${cta ? `<span class="res-cta">${cta} →</span>` : ''}</a>`;

// directory: search box + team filter + card grid + no-match state. ~15 lines of inline JS; with JS off every card is visible and crawlable.
export const directory = ({ lang, noun, cards, filters = true }) => {
  const r = R[lang], e = r.empty(noun);
  return `<div class="dir" data-dir>
<div class="dir-controls"><label class="dir-search"><span class="sr-only">${r.search(noun)}</span><input type="search" placeholder="${r.search(noun)}" autocomplete="off" data-dir-q></label>
${filters ? `<div class="filters" role="group" aria-label="${r.filterBy}"><button type="button" class="filter" aria-pressed="true" data-dir-f="">${r.all}</button>${Object.entries(r.dept).map(([k, l]) => `<button type="button" class="filter" aria-pressed="false" data-dir-f="${k}">${l}</button>`).join('')}</div>` : ''}</div>
<div class="g3">${cards.join('\n')}</div>
<p class="dir-empty" data-dir-empty hidden role="status">${e[0]}<span data-dir-term></span>${e[1]}<button type="button" class="linkish" data-dir-reset>${e[2]}</button>${e[3]}</p>
</div>
<script>(function(){var d=document.querySelector('[data-dir]');if(!d)return;var q=d.querySelector('[data-dir-q]'),cs=[].slice.call(d.querySelectorAll('.res-card')),fs=[].slice.call(d.querySelectorAll('[data-dir-f]')),em=d.querySelector('[data-dir-empty]'),cat='';
function run(){var t=q.value.trim().toLowerCase(),n=0;cs.forEach(function(c){var ok=(!t||c.dataset.search.indexOf(t)>-1)&&(!cat||c.dataset.cat===cat);c.hidden=!ok;if(ok)n++});em.hidden=n>0;d.querySelector('[data-dir-term]').textContent=q.value.trim()||cat}
q.addEventListener('input',run);fs.forEach(function(b){b.addEventListener('click',function(){cat=b.dataset.dirF;fs.forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});run()})});
d.querySelector('[data-dir-reset]').addEventListener('click',function(){q.value='';cat='';fs.forEach(function(x,i){x.setAttribute('aria-pressed',String(i===0))});run();q.focus()})})();</script>`;
};

export const secHead = (k, h, { lead = '', more } = {}) => `<div class="sec-head"><div>${k ? `<div class="eyebrow">${k}</div>` : ''}<h2>${h}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>${more ? `<a class="more" href="${more[0]}">${more[1]}</a>` : ''}</div>`;

// related: a titled grid of cards. Empty list → nothing rendered.
export const related = (k, title, cards, more) => cards.length ? `<section class="sec tight"><div class="wrap">${secHead(k, title, { more })}<div class="g3">${cards.join('\n')}</div></div></section>` : '';

// Copyable block on a dark ground (workflow prompt, template body). The button is tracked by the global [data-event] listener.
export const darkCode = (lang, { id, label, text, copy, event = 'template_copy' }) =>
  `<div style="min-width:0"><div class="code-head"><div class="eyebrow">${label}</div>${copy ? `<span><span class="copy-status" role="status" aria-live="polite"></span> <button type="button" class="copy-dark" data-copy="${id}" data-copied="${R[lang].copied}" data-selected="${R[lang].selected}" data-event="${event}" data-pos="${id}">${copy}</button></span>` : ''}</div>
<div class="code-dark"><pre${id ? ` id="${id}"` : ''} tabindex="0">${esc(text)}</pre></div></div>`;
export const copyScript = `<script>document.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;var el=document.getElementById(b.dataset.copy),s=b.parentNode.querySelector('.copy-status');
function ok(){s.textContent=b.dataset.copied;setTimeout(function(){s.textContent=''},2000)}
if(navigator.clipboard&&isSecureContext)navigator.clipboard.writeText(el.textContent).then(ok);else{var r=document.createRange();r.selectNodeContents(el);var sel=getSelection();sel.removeAllRanges();sel.addRange(r);s.textContent=b.dataset.selected}});</script>`;

export const band = (lang, opts) => ctaBand(lang, opts);
export const crumbs = (lang, items) => breadcrumb(lang, items);
export const ticks = (items, cls = '') => `<ul class="ticks ${cls}">${items.map((i) => `<li><span>${i}</span></li>`).join('')}</ul>`;
export const list = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
export const meta = (pairs) => `<div class="meta-grid">${pairs.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;

// Route factory: build(lang) → { title, description, body, jsonld, view, hero? } for both languages.
export const page = ({ path, priority = 0.7, changefreq = 'monthly', build }) => {
  const one = (lang) => { const p = build(lang); return { ...p, jsonld: [...p.jsonld, BUSINESS_REF] }; };
  return { path, priority, changefreq, en: one('en'), zh: one('zh') };
};

export { SITE, L, esc, href, BUSINESS_REF };
