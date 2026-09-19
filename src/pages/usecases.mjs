// /use-cases/ hub + one page per category in src/content/usecases.mjs (design: UseCase-Sales; every category uses the same template).
import { USE_CASES } from '../content/usecases.mjs';
import { WORKFLOWS, workflowBySlug } from '../content/workflows.mjs';
import { TEMPLATES } from '../content/templates.mjs';
import { TRAINING } from '../config.mjs';
import { photoHero } from '../layout.mjs';
import { SITE, R, L, href, loc, card, secHead, band, crumbs, ticks, page } from '../resources.mjs';
import { workflowCard, templateCard } from './workflows.mjs';

const PRICE = `$${TRAINING.halfDayFrom.toLocaleString()}`;
const S = {
  en: { answerK: 'The short answer', fitK: 'Where AI fits', fitH: (team) => `The work, grouped the way ${team} runs it`, fitLead: 'Linked items have a full workflow with steps, a prompt and a review checklist.',
    startK: 'Start here', startH: (d) => `${d} workflows to run this week`, chargeK: 'Where a person stays in charge', chargeH: 'AI drafts. A person signs.',
    trainK: 'Training', trainH: (team) => `Train ${team} on these workflows`, trainP: 'A half-day workshop where each person builds one of these on their own real work, and catches one deliberately flawed output.', trainTags: ['Half day', `From ${PRICE}`],
    suffix: 'Practical Workflows and Templates', heroAlt: 'A team demonstrating what it built at a Dallas session',
    hubTitle: 'AI Use Cases for Real Teams: Sales, Marketing, Operations, Leadership | AI Man Jack', hubDesc: 'See where AI saves time and improves quality in everyday work, by team: sales, marketing, operations and leadership. Every use case links to a step-by-step workflow.',
    hubK: 'Use cases', hubH: 'AI use cases for <em>real</em> teams', hubP: 'See where AI can save time, improve quality and change how everyday work gets done. Pick a team; every linked use case opens a workflow with steps, a prompt and a review checklist.',
    rowsK: 'Explore by team', rowsH: 'Where does your team start?', more: 'Search all workflows →', count: (n) => `${n} workflows` },
  zh: { answerK: '核心结论', fitK: '适用环节', fitH: (team) => `按${team}的工作方式分组`, fitLead: '带箭头的条目提供完整工作流，包括操作步骤、提示词和核验清单。',
    startK: '从这里开始', startH: (d) => `本周即可上手的${d}工作流`, chargeK: '由人把关的环节', chargeH: 'AI 负责起草，人负责签字。',
    trainK: '培训', trainH: (team) => `为${team}培训这些工作流`, trainP: '半天工作坊中，每位学员基于自己的真实工作搭建其中一条工作流，并找出一个刻意设置的错误输出。', trainTags: ['半天', `${PRICE} 起`],
    suffix: '实用工作流与模板', heroAlt: '达拉斯的一场课程中，一个小组正在演示自己搭建的成果',
    hubTitle: '面向真实团队的 AI 应用场景：销售、市场、运营、管理层 | AI Man Jack', hubDesc: '按团队了解 AI 在日常工作中节省时间、提升质量的环节：销售、市场、运营与管理层。每个应用场景都关联到一条分步骤的工作流。',
    hubK: '应用场景', hubH: '面向<em>真实</em>团队的 AI 应用场景', hubP: '了解 AI 能在哪些环节节省时间、提升质量，并改变日常工作的方式。选择一个团队；每个带链接的应用场景都会打开一条包含步骤、提示词与核验清单的工作流。',
    rowsK: '按团队浏览', rowsH: '你的团队从哪里开始？', more: '搜索全部工作流 →', count: (n) => `${n} 条工作流` },
};

const detail = (u0) => page({
  path: `/use-cases/${u0.slug}/`, priority: 0.8,
  build: (lang) => {
    const u = loc(u0, lang), s = S[lang], r = R[lang], path = `/use-cases/${u.slug}/`;
    const bc = crumbs(lang, [[r.useCases, '/use-cases/'], [r.dept[u.slug], path]]);
    const mine = WORKFLOWS.filter((w) => w.department === u.slug), tpl = TEMPLATES.find((t) => t.category === u.slug);
    // A group item that names a workflow becomes a link; plain strings stay text until that page exists.
    const item = (i) => typeof i === 'string' ? `<div style="padding:14px 0;border-bottom:1px solid var(--line);font-size:16px;color:var(--muted)">${i}</div>`
      : `<a href="${href(lang, `/workflows/${i.wf}/`)}" style="display:flex;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);font-size:16px;font-weight:700;text-decoration:none"><span>${loc(workflowBySlug[i.wf], lang).short || loc(workflowBySlug[i.wf], lang).title.replace(/ with AI$/, '')}</span><span style="color:var(--accent)" aria-hidden="true">→</span></a>`;
    return {
      view: 'use_case_view', hero: 'photo', title: `${u.title}: ${s.suffix} | AI Man Jack`, description: u.description,
      body: `${photoHero({ photo: 'demo', alt: s.heroAlt, size: 'sm', inner: `<div class="hero-main" style="padding-bottom:56px"><div class="col-a" style="grid-column:span 7;gap:20px">${bc.html}<h1 class="lg">${u.title}</h1></div><p style="grid-column:span 5">${u.hero || u.card}</p></div>` })}
<section class="sec" style="padding-bottom:96px"><div class="wrap g12" style="row-gap:16px"><div style="grid-column:span 3"><div class="eyebrow">${s.answerK}</div></div><p class="answer" style="grid-column:4 / span 9">${u.answer}</p></div></section>
<section class="sec tight"><div class="wrap">${secHead(s.fitK, s.fitH(u.team), { lead: s.fitLead })}
<div class="g4">${u.groups.map(([g, items], i) => `<div class="card" style="padding:28px;display:flex;flex-direction:column"><span style="font-size:13px;font-weight:700;color:var(--accent-text);margin-bottom:6px">${String(i + 1).padStart(2, '0')}</span><h3 style="margin-bottom:10px">${g}</h3>${items.map(item).join('')}</div>`).join('')}</div></div></section>
<section class="sec tight"><div class="wrap">${secHead(s.startK, s.startH(r.dept[u.slug]), { more: [href(lang, '/workflows/'), r.allWorkflows] })}<div class="g3">${mine.map((w) => workflowCard(w, lang)).join('\n')}</div></div></section>
<section class="sec tight"><div class="wrap"><div class="panel-dark g12" style="row-gap:20px"><div style="grid-column:span 5;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${s.chargeK}</div><h2>${s.chargeH}</h2></div><div style="grid-column:7 / span 6">${ticks(u.watch, 'bang')}</div></div></div></section>
<section class="sec tight"><div class="wrap"><div class="g2">${tpl ? templateCard(tpl, lang, 'h3', true) : ''}${card({ href: L(lang, '/ai-training/'), kicker: s.trainK, title: s.trainH(u.team), text: s.trainP, tags: s.trainTags, cta: R[lang].seeTraining.replace(' →', ''), event: 'training_page_click', oak: true })}</div></div></section>
${band(lang, { pos: `use-case-${u.slug}` })}`,
      jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, path)}`, name: u.title, description: u.description, inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
    };
  },
});

const index = () => page({
  path: '/use-cases/', priority: 0.8, changefreq: 'weekly',
  build: (lang) => {
    const s = S[lang], r = R[lang], bc = crumbs(lang, [[r.useCases, '/use-cases/']]);
    return {
      view: 'use_case_view', hero: 'photo', title: s.hubTitle, description: s.hubDesc,
      body: `${photoHero({ photo: 'demo', alt: s.heroAlt, size: 'sm', inner: `<div class="hero-main" style="padding-bottom:56px"><div class="col-a" style="grid-column:span 7;gap:20px">${bc.html}<h1 class="lg">${s.hubH}</h1></div><p style="grid-column:span 5">${s.hubP}</p></div>` })}
<section class="sec"><div class="wrap">${secHead(s.rowsK, s.rowsH, { more: [href(lang, '/workflows/'), s.more] })}
<div class="rows">${USE_CASES.map((u0, i) => { const u = loc(u0, lang); return `<a href="${href(lang, `/use-cases/${u.slug}/`)}" data-event="use_case_click" data-pos="hub"><span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${u.title}</h3><p>${u.card} <b style="color:var(--accent-text);font-weight:700;white-space:nowrap">${s.count(WORKFLOWS.filter((w) => w.department === u.slug).length)}</b></p><span class="go" aria-hidden="true">→</span></a>`; }).join('')}</div></div></section>
${band(lang, { pos: 'use-cases-index' })}`,
      jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, '/use-cases/')}`, name: s.hubH.replace(/<[^>]+>/g, ''), inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
    };
  },
});

export const useCaseCard = (u, lang = 'en') => card({ href: href(lang, `/use-cases/${u.slug}/`), title: loc(u, lang).title, text: loc(u, lang).card, event: 'use_case_click' });
export const pages = [index(), ...USE_CASES.map(detail)];
