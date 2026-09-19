// /templates/ library + one page per object in src/content/templates.mjs. Not drawn in the design canvas: follows the Workflows / Workflow-Detail patterns.
import { TEMPLATES, templateBySlug } from '../content/templates.mjs';
import { workflowBySlug } from '../content/workflows.mjs';
import { useCaseBySlug } from '../content/usecases.mjs';
import { SITE, R, L, href, loc, directory, related, darkCode, copyScript, band, crumbs, ticks, meta, page } from '../resources.mjs';
import { workflowCard, templateCard } from './workflows.mjs';

const S = {
  en: { eyebrow: 'Template', team: 'Team', roles: 'For', tools: 'Tools', body: 'The template · copy and paste', copy: 'Copy template', needK: 'Before you start', needH: 'What you need first', howK: 'Four steps', howH: 'How to use it', tipsK: 'Customise', tipsH: 'Make it yours',
    part: (wf, h, uc, uh, tr) => `This template is the reusable half of the <a href="${h}">${wf}</a> workflow, which covers the full process, an example output and the review checklist. More for this team: <a href="${uh}">${uc}</a>. Want it adapted to your team’s work? <a href="${tr}">See how training works</a>.`,
    sheet: (wf, h, uc, uh, tr, ar) => `A planning worksheet, not a prompt: fill it in with your team. It pairs with the <a href="${h}">${wf}</a> workflow. See where it fits in <a href="${uh}">${uc}</a>, or take the <a href="${ar}">AI Readiness Assessment</a> to find your team’s weakest area. Want to work through it with Jack? <a href="${tr}">See how training works</a>.`,
    relK: 'Related', relH: 'Templates that pair with this one', wfK: 'Workflows', wfH: 'Workflows that use this template', suffix: '(Free, Copy and Paste)',
    hubTitle: 'AI Templates for Work: Prompts, Worksheets and Checklists | AI Man Jack', hubDesc: 'Free, copy-and-paste AI templates for sales, marketing, operations and leadership: prompts, worksheets and checklists, each linked to the workflow it belongs to.',
    hubK: 'AI template library · free · no sign-up', hubH: 'Copy one, fill the brackets, run it on real work.', hubP: 'Reusable prompts, worksheets and checklists for teams using AI. Each template links to the workflow it belongs to, with the full process and the review checklist.', noun: 'templates',
    bandH: 'A template is a start.<br>A trained team is the <em>point.</em>' },
  zh: { eyebrow: '模板', team: '团队', roles: '适用角色', tools: '工具', body: '模板 · 可直接复制', copy: '复制模板', needK: '开始之前', needH: '需要先准备的内容', howK: '使用步骤', howH: '如何使用', tipsK: '定制', tipsH: '按团队情况调整',
    part: (wf, h, uc, uh, tr) => `本模板是<a href="${h}">${wf}</a>工作流中可复用的部分；该工作流页面提供完整流程、示例输出与核验清单。更多面向该团队的内容：<a href="${uh}">${uc}</a>。希望按团队的实际工作进行定制？<a href="${tr}">了解培训方式</a>。`,
    sheet: (wf, h, uc, uh, tr, ar) => `这是一份规划用的工作表，而不是提示词，请与团队一起填写。它可与<a href="${h}">${wf}</a>工作流搭配使用。了解它在整体中的位置，请见<a href="${uh}">${uc}</a>；也可以先完成 <a href="${ar}">AI 准备度评估</a>，找出团队最薄弱的维度。希望与 Jack 一起完成？<a href="${tr}">了解培训方式</a>。`,
    relK: '相关模板', relH: '与本模板搭配使用', wfK: '工作流', wfH: '使用本模板的工作流', suffix: '（免费，可直接复制）',
    hubTitle: 'AI 工作模板：提示词、工作表与清单 | AI Man Jack', hubDesc: '面向销售、市场、运营与管理层的免费 AI 模板：提示词、工作表与清单，均可直接复制，并关联到对应的工作流。',
    hubK: 'AI 模板库 · 免费 · 无需注册', hubH: '复制模板，填写括号内容，用于真实工作。', hubP: '供团队使用的可复用提示词、工作表与清单。每个模板都关联到所属的工作流，其中包含完整流程与核验清单。', noun: '模板',
    bandH: '模板只是起点，<br>真正的目标是<em>训练有素的团队</em>。' },
};

const detail = (t0) => page({
  path: `/templates/${t0.slug}/`,
  build: (lang) => {
    const t = loc(t0, lang), s = S[lang], r = R[lang], path = `/templates/${t.slug}/`, parent = loc(workflowBySlug[t.workflows[0]], lang);
    const bc = crumbs(lang, [[r.templates, '/templates/'], [t.title, path]]);
    return {
      view: 'template_view', title: `${t.title} ${s.suffix} | AI Man Jack`, description: t.description,
      body: `<section class="sec" style="padding:64px 0 72px"><div class="wrap g12" style="align-items:end">
<div style="grid-column:span 8;display:flex;flex-direction:column;gap:22px">${bc.html}<div class="eyebrow">${s.eyebrow} · ${r.dept[t.category]}</div><h1>${t.title}</h1><p style="font-size:clamp(18px,1.55vw,22px);line-height:1.6;max-width:780px">${t.description}</p></div>
<div style="grid-column:10 / span 3">${meta([[s.team, r.dept[t.category]], [s.roles, t.roles.join(' · ')], [s.tools, t.tools.join(' · ')]])}</div></div></section>
<section class="sec dark" style="padding:96px 0"><div class="wrap">${darkCode(lang, { id: 'tpl-body', label: s.body, text: t.body, copy: s.copy })}</div></section>${copyScript}
<section class="sec" style="padding:96px 0"><div class="wrap"><div class="g2" style="gap:24px">
<div class="big-card oakc" style="border-radius:var(--r);padding:36px"><div class="eyebrow">${s.needK}</div><h2 class="h2-sm">${s.needH}</h2>${ticks(t.inputs)}</div>
<div class="big-card" style="border-radius:var(--r);padding:36px"><div class="eyebrow">${s.howK}</div><h2 class="h2-sm">${s.howH}</h2><ol class="nums mini">${t.howTo.map((x, i) => `<li><span class="n">${i + 1}</span><p>${x}</p></li>`).join('')}</ol></div></div>
<div class="big-card" style="border-radius:var(--r);padding:36px;margin-top:24px"><div class="eyebrow">${s.tipsK}</div><h2 class="h2-sm">${s.tipsH}</h2>${ticks(t.tips, 'arrow')}</div>
<p class="callout" style="margin-top:24px">${(t.standalone ? s.sheet : s.part)(parent.title, href(lang, `/workflows/${parent.slug}/`), loc(useCaseBySlug[t.category], lang).title, href(lang, `/use-cases/${t.category}/`), L(lang, '/ai-training/'), href(lang, '/tools/ai-readiness-assessment/'))}</p></div></section>
${related(s.relK, s.relH, t.related.map((x) => templateCard(templateBySlug[x], lang)), [href(lang, '/templates/'), r.allTemplates])}
${related(s.wfK, s.wfH, t.workflows.map((x) => workflowCard(workflowBySlug[x], lang)), [href(lang, '/workflows/'), r.allWorkflows])}
${band(lang, { pos: `template-${t.slug}` })}`,
      jsonld: [{ '@type': 'CreativeWork', '@id': `${SITE}${L(lang, path)}#template`, name: t.title, description: t.description, inLanguage: lang, isAccessibleForFree: true, learningResourceType: 'Template', author: { '@id': `${SITE}/#jack` }, publisher: { '@id': `${SITE}/#business` }, url: `${SITE}${L(lang, path)}` }, bc.ld],
    };
  },
});

const index = () => page({
  path: '/templates/', priority: 0.8, changefreq: 'weekly',
  build: (lang) => {
    const s = S[lang], r = R[lang], bc = crumbs(lang, [[r.templates, '/templates/']]);
    return {
      view: 'template_view', title: s.hubTitle, description: s.hubDesc,
      body: `<section style="padding:72px 0 56px"><div class="wrap g12" style="align-items:end;row-gap:20px">
<div style="grid-column:span 7;display:flex;flex-direction:column;gap:20px">${bc.html}<div class="eyebrow">${s.hubK}</div><h1 class="lg" style="font-size:clamp(42px,6.1vw,88px)">${s.hubH}</h1></div>
<p class="lead" style="grid-column:9 / span 4;font-size:18px">${s.hubP}</p></div></section>
<section class="sec tight"><div class="wrap">${directory({ lang, noun: s.noun, cards: TEMPLATES.map((t) => templateCard(t, lang, 'h2')) })}</div></section>
${band(lang, { h: s.bandH, pos: 'templates-index' })}`,
      jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, '/templates/')}`, name: s.hubH, inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
    };
  },
});

export const pages = [index(), ...TEMPLATES.map(detail)];
