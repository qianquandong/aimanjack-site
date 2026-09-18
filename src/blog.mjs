// Blog post renderer. A post module in src/posts/<slug>.mjs exports `post` (see src/posts/_TEMPLATE.mjs);
// src/pages/blog.mjs turns every published post into a page pair (/blog/<slug>/ + /zh/blog/<slug>/) and builds the index.
// Why a renderer instead of hand-written HTML: every post gets the same head/meta/hreflang, Article + FAQPage + Breadcrumb
// JSON-LD, the takeaway block AI answer engines quote, and the CTA rules from HANDOFF.md, without re-checking 80 signals per post.
import { SITE } from './config.mjs';
import { L, esc } from './layout.mjs';
import { pageHero, breadcrumb, faq, faqJsonLd, finalCta, BUSINESS_REF, T } from './components.mjs';

export const BLOG_PATH = '/blog/';
const JACK_REF = { '@id': `${SITE}/#jack` };

const STR = {
  en: { crumb: 'Resources', by: 'By', published: 'Published', updated: 'Updated', takeaways: 'Key takeaways', related: 'Read next', minutes: 'min read', faq: 'Questions people ask', ctaH: 'Want this done with your own team?', ctaSub: 'Book a 30-minute call. Jack looks at one task your team does every week and tells you which format fits, or whether training is not the answer yet.' },
  zh: { crumb: '资源', by: '作者', published: '发布', updated: '更新', takeaways: '要点', related: '接着读', minutes: '分钟读完', faq: '大家常问', ctaH: '想让自己的团队也这样做？', ctaSub: '约一个 30 分钟的电话。Jack 看一个你们每周都在做的任务，告诉你哪种形式合适，或者现在还不该上培训。' },
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

// post: { slug, date, updated?, status: 'draft'|'published', en: {...}, zh: {...} }
// per-language: { keyword, title, description, h1, sub, takeaways: [], sections: html, faq: [[q, a]], pillar: [label, path], related: [[label, path]], sources?: [[label, url]] }
export function postPage(post, lang) {
  const s = STR[lang], c = post[lang], path = postPath(post.slug);
  const bc = breadcrumb(lang, [[s.crumb, BLOG_PATH], [c.h1, path]]);
  const mins = readingMinutes(lang, c.sections);
  const meta = `<p class="post-meta">${s.by} <a href="${L(lang, '/about/')}">Jack Qian</a> · ${s.published} <time datetime="${post.date}">${dateText(lang, post.date)}</time>${post.updated && post.updated !== post.date ? ` · ${s.updated} <time datetime="${post.updated}">${dateText(lang, post.updated)}</time>` : ''} · ${mins} ${s.minutes}</p>`;
  const takeaways = c.takeaways?.length ? `<aside class="takeaways" aria-label="${s.takeaways}"><h2 class="h3">${s.takeaways}</h2><ul>${c.takeaways.map((t) => `<li>${t}</li>`).join('')}</ul></aside>` : '';
  const related = c.related?.length ? `<section class="section soft"><div class="wrap narrow"><h2 class="h3">${s.related}</h2><ul class="related">${c.related.map(([l, p]) => `<li><a href="${L(lang, p)}">${l}</a></li>`).join('')}</ul></div></section>` : '';
  const sources = c.sources?.length ? `<h2 class="h3">${lang === 'zh' ? '来源' : 'Sources'}</h2><ul class="sources">${c.sources.map(([l, u]) => `<li><a href="${u}" rel="noopener">${l}</a></li>`).join('')}</ul>` : '';
  const faqHtml = c.faq?.length ? `<h2 class="h3">${s.faq}</h2>${faq(lang, c.faq, { heading: false })}` : '';
  const article = {
    '@type': 'Article', '@id': `${SITE}${L(lang, path)}`, headline: strip(c.h1), description: c.description, inLanguage: lang,
    datePublished: post.date, dateModified: post.updated || post.date, author: JACK_REF, publisher: { '@id': `${SITE}/#business` },
    mainEntityOfPage: `${SITE}${L(lang, path)}`, keywords: c.keyword, wordCount: strip(c.sections).length,
  };
  const jsonld = [article, BUSINESS_REF, bc.ld];
  if (c.faq?.length) jsonld.push(faqJsonLd(c.faq));
  return {
    title: c.title, description: c.description, view: 'blog_view', ogType: 'article', bodyClass: 'post',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: s.crumb, h1: c.h1, sub: c.sub, ctas: false })}
<article class="wrap prose post-body">${meta}${takeaways}${c.sections}
<p class="callout">${lang === 'zh' ? '这篇里讲的做法，在' : 'The approach in this post is what we teach in'} <a href="${L(lang, c.pillar[1])}">${c.pillar[0]}</a>${lang === 'zh' ? '里有完整版。' : '.'}</p>
${faqHtml}${sources}</article>
${related}${finalCta(lang, { h: s.ctaH, sub: s.ctaSub })}`,
    jsonld,
  };
}

export function indexPage(posts, lang) {
  const s = STR[lang], bc = breadcrumb(lang, [[s.crumb, BLOG_PATH]]);
  const c = lang === 'zh'
    ? { title: '资源：员工 AI 培训与 AI 工作流笔记 | AI Man Jack', description: 'Jack Qian 写给团队负责人的 AI 笔记：怎么挑任务、怎么教不写代码的同事用 AI、一条工作流怎么才算跑通。只写真做过的。', h1: '课堂笔记', sub: '每篇讲一件在达拉斯的课上真发生过的事：一个练习、一次现场提问、一条跑起来的工作流。没有数字就不编数字。' }
    : { title: 'Resources: AI Training and AI Workflow Notes | AI Man Jack', description: 'Notes from Jack Qian for team leads: how to pick the task, how to teach non-technical staff to use AI, when a workflow is really working. Only what was actually done.', h1: 'Field notes', sub: 'Each post covers one thing that actually happened in a Dallas session: an exercise, a question from the room, a workflow that ran. No invented numbers.' };
  const cards = posts.map((p) => {
    const x = p[lang];
    return `<a class="card link-card post-card" href="${L(lang, postPath(p.slug))}"><p class="post-meta"><time datetime="${p.date}">${dateText(lang, p.date)}</time> · ${readingMinutes(lang, x.sections)} ${s.minutes}</p><h2 class="h3">${x.h1}</h2><p>${x.description}</p></a>`;
  }).join('');
  return {
    title: c.title, description: c.description, view: 'blog_view',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: s.crumb, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap" style="padding-bottom:64px"><div class="grid-2 post-grid">${cards || `<p class="lead">${lang === 'zh' ? '第一篇在路上。' : 'First post coming soon.'}</p>`}</div></section>${finalCta(lang)}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, BLOG_PATH)}`, name: strip(c.h1), description: c.description, inLanguage: lang, isPartOf: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
}

export { T, esc };
