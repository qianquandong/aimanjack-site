// Blog post renderer (design canvas: Article / ZH-Article). A post module in src/posts/<slug>.mjs exports `post` (see _TEMPLATE.mjs);
// src/pages/blog.mjs turns every published post into a page pair and builds the index.
// Every post gets the same head/meta/hreflang, Article + FAQPage + Breadcrumb JSON-LD, a takeaways card, an "on this page" list
// generated from its <h2>s, one inline CTA and three onward links (workflow, template, tool).
import { SITE, TRAINING } from './config.mjs';
import { L, esc, href, planBtn, ctaBand } from './layout.mjs';
import { breadcrumb, faq, faqJsonLd, BUSINESS_REF, T } from './components.mjs';
import { card, R, loc } from './resources.mjs';
import { workflowBySlug } from './content/workflows.mjs';
import { templateBySlug } from './content/templates.mjs';

export const BLOG_PATH = '/blog/';
const JACK_REF = { '@id': `${SITE}/#jack` };
const PRICE = `$${TRAINING.halfDayFrom.toLocaleString()}`;

const STR = {
  en: { crumb: 'Resources', guide: 'Guide', by: 'By', published: 'Published', updated: 'Updated', takeaways: 'Key takeaways', toc: 'On this page', minutes: 'min read', faq: 'Questions people ask', sources: 'Sources',
    pillar: (l, h) => `The approach in this post is what we teach in <a href="${h}">${l}</a>.`, ctaH: 'Want your team to run this exercise with Jack?', ctaSub: `Half-day workshops from ${PRICE}, up to ${TRAINING.halfDayMax} people.`,
    moreK: 'Keep reading', moreH: 'Field notes from the sessions', all: 'All resources →', figAlt: 'Hands-on session in Dallas: everyone working on a task they already do.',
    tool: ['Free tool', 'AI Readiness Assessment', 'Measure how prepared your team is across eight areas, in three minutes.', ['3 min', 'No sign-up'], 'Start assessment'],
    idxTitle: 'Resources: AI Training and AI Workflow Notes | AI Man Jack', idxDesc: 'Notes from Jack Qian for team leads: how to pick the task, how to teach non-technical staff to use AI, when a workflow is really working. Only what was actually done.', idxH: 'Field notes from the sessions', idxSub: 'Each post covers one thing that actually happened in a Dallas session: an exercise, a question from the room, a workflow that ran. No invented numbers.', soon: 'First post coming soon.' },
  zh: { crumb: '资源', guide: '指南', by: '作者', published: '发布于', updated: '更新于', takeaways: '核心要点', toc: '本页目录', minutes: '分钟阅读', faq: '常见问题', sources: '资料来源',
    pillar: (l, h) => `本文介绍的方法，正是我们在<a href="${h}">${l}</a>中讲授的内容。`, ctaH: '希望团队与 Jack 一起完成这个练习？', ctaSub: `半天工作坊 ${PRICE} 起，最多 ${TRAINING.halfDayMax} 人。`,
    moreK: '延伸阅读', moreH: '来自课堂的实践笔记', all: '全部资源 →', figAlt: '达拉斯实操课堂：每位学员都在处理自己的真实任务。',
    tool: ['免费工具', 'AI 准备度评估', '三分钟，从八个维度评估团队的 AI 准备程度。', ['3 分钟', '无需注册'], '开始评估'],
    idxTitle: '资源：员工 AI 培训与 AI 工作流实践笔记 | AI Man Jack', idxDesc: 'Jack Qian 为团队负责人撰写的实践笔记：如何选择任务、如何培训非技术员工使用 AI、如何判断一条工作流是否真正有效。只记录实际做过的事。', idxH: '来自课堂的实践笔记', idxSub: '每篇文章记录达拉斯课堂上真实发生的一件事：一个练习、一个现场提问，或一条成功运行的工作流。没有数据，就不编造数据。', soon: '第一篇文章即将发布。' },
};

const dateText = (lang, iso) => lang === 'zh' ? iso.replace(/(\d+)-0?(\d+)-0?(\d+)/, '$1 年 $2 月 $3 日') : new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// Reading time: 220 English words/min or 400 Chinese characters/min. Rounded up, minimum 1.
export const readingMinutes = (lang, html) => {
  const text = strip(html);
  const n = lang === 'zh' ? text.replace(/\s/g, '').length : text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(n / (lang === 'zh' ? 400 : 220)));
};

export const postPath = (slug) => `${BLOG_PATH}${slug}/`;
const onward = (lang) => { const s = STR[lang], r = R[lang], wf = loc(workflowBySlug['meeting-notes-to-action-items'], lang), tp = loc(templateBySlug['ai-use-case-discovery-worksheet'], lang);
  return [card({ href: href(lang, `/workflows/${wf.slug}/`), kicker: r.workflows.replace(/s$/, ''), title: wf.title, text: wf.description.split(/(?<=[.。])\s*/)[0], tags: [r.dept[wf.department]], cta: r.openWorkflow, event: 'resource_to_training_click' }),
    card({ href: href(lang, `/templates/${tp.slug}/`), kicker: r.templates.replace(/s$/, ''), title: tp.title, text: tp.description, tags: [r.dept[tp.category]], cta: r.openTemplate, event: 'template_click' }),
    card({ href: href(lang, '/tools/ai-readiness-assessment/'), kicker: s.tool[0], title: s.tool[1], text: s.tool[2], tags: s.tool[3], cta: s.tool[4], event: 'tool_click' })]; };

// post: { slug, date, updated?, status: 'draft'|'published'|'hidden', en: {...}, zh: {...} }
// per-language: { keyword, title, description, h1, sub, takeaways: [], sections: html, faq: [[q, a]], pillar: [label, path], related: [[label, path]], sources?: [[label, url]] }
export function postPage(post, lang) {
  const s = STR[lang], c = post[lang], path = postPath(post.slug);
  const bc = breadcrumb(lang, [[s.crumb, BLOG_PATH], [s.guide, path]]);
  const mins = readingMinutes(lang, c.sections);
  // "On this page": every <h2> in the body gets an id and an entry.
  const heads = []; let n = 0;
  const sections = c.sections.replace(/<h2>(.*?)<\/h2>/g, (_, t) => { n += 1; heads.push([`s${n}`, strip(t)]); return `<h2 id="s${n}">${t}</h2>`; });
  const toc = `<aside class="toc" aria-label="${s.toc}"><div class="eyebrow">${s.toc}</div>${c.takeaways?.length ? `<a href="#takeaways">${s.takeaways}</a>` : ''}${heads.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</aside>`;
  const takeaways = c.takeaways?.length ? `<div class="takeaways" id="takeaways"><div class="eyebrow">${s.takeaways}</div><ul>${c.takeaways.map((t) => `<li><span>${t}</span></li>`).join('')}</ul></div>` : '';
  const related = c.related?.length ? `<ul class="related">${c.related.map(([l, p]) => `<li><a href="${L(lang, p)}">${l}</a></li>`).join('')}</ul>` : '';
  const sources = c.sources?.length ? `<h2>${s.sources}</h2><ul class="sources">${c.sources.map(([l, u]) => `<li><a href="${u}" rel="noopener">${l}</a></li>`).join('')}</ul>` : '';
  const when = post.updated && post.updated !== post.date ? `${s.updated} <time datetime="${post.updated}">${dateText(lang, post.updated)}</time>` : `${s.published} <time datetime="${post.date}">${dateText(lang, post.date)}</time>`;
  const article = {
    '@type': 'Article', '@id': `${SITE}${L(lang, path)}`, headline: strip(c.h1), description: c.description, inLanguage: lang,
    datePublished: post.date, dateModified: post.updated || post.date, author: JACK_REF, publisher: { '@id': `${SITE}/#business` },
    mainEntityOfPage: `${SITE}${L(lang, path)}`, keywords: c.keyword, wordCount: strip(c.sections).length,
  };
  const jsonld = [article, BUSINESS_REF, bc.ld];
  if (c.faq?.length) jsonld.push(faqJsonLd(c.faq));
  return {
    title: c.title, description: c.description, view: 'blog_view', ogType: 'article', bodyClass: 'post',
    body: `<div class="wrap"><header class="art-head" style="background:none;border:0">${bc.html}<div class="eyebrow">${s.guide} · ${mins} ${s.minutes} · ${c.keyword}</div><h1 class="sm">${c.h1}</h1><p class="lead">${c.sub}</p>
<div class="art-by"><img src="/img/jack-portrait-256.webp" width="256" height="256" alt=""><span><strong><a href="${L(lang, '/about/')}" style="text-decoration:none">Jack Qian</a></strong> · ${when}</span></div></header>
<figure class="art-fig"><img src="/img/events/dallas-session3-hands-on.webp" width="1600" height="1066" fetchpriority="high" decoding="async" alt="${s.figAlt}"><figcaption>${s.figAlt}</figcaption></figure>
<div class="art-grid">${toc}<article class="art-body post-body">${takeaways}${sections}
<p class="callout">${s.pillar(c.pillar[0], L(lang, c.pillar[1]))}</p>${related}
${c.faq?.length ? `<h2>${s.faq}</h2>${faq(lang, c.faq, { heading: false })}` : ''}${sources}
<div class="cta-card on-dark"><div><b>${s.ctaH}</b><span>${s.ctaSub}</span></div>${planBtn(lang, { pos: 'article', cls: 'btn-sm' })}</div></article></div></div>
<section class="sec tight"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${s.moreK}</div><h2>${s.moreH}</h2></div><a class="more" href="${L(lang, BLOG_PATH)}">${s.all}</a></div><div class="g3">${onward(lang).join('')}</div></div></section>`,
    jsonld,
  };
}

export function indexPage(posts, lang) {
  const s = STR[lang], bc = breadcrumb(lang, [[s.crumb, BLOG_PATH]]);
  const cards = posts.map((p) => { const x = p[lang];
    return card({ href: L(lang, postPath(p.slug)), kicker: `${s.guide} · ${readingMinutes(lang, x.sections)} ${s.minutes}`, title: x.h1, text: x.description, tags: [dateText(lang, p.date)], cta: lang === 'zh' ? '阅读全文' : 'Read the guide', event: 'resource_click', hl: 'h2' }); }).join('');
  return {
    title: s.idxTitle, description: s.idxDesc, view: 'blog_view',
    body: `<section style="padding:72px 0 56px"><div class="wrap g12" style="align-items:end;row-gap:20px"><div style="grid-column:span 7;display:flex;flex-direction:column;gap:20px">${bc.html}<div class="eyebrow">${s.crumb}</div><h1 class="lg" style="font-size:clamp(42px,6.1vw,88px)">${s.idxH}</h1></div><p class="lead" style="grid-column:9 / span 4;font-size:18px">${s.idxSub}</p></div></section>
<section class="sec tight"><div class="wrap"><div class="g3">${cards || `<p class="lead">${s.soon}</p>`}${onward(lang).slice(0, cards ? 2 : 3).join('')}</div></div></section>${ctaBand(lang, { pos: 'blog-index' })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, BLOG_PATH)}`, name: strip(s.idxH), description: s.idxDesc, inLanguage: lang, isPartOf: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
}

export { T, esc };
