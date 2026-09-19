// /workflows/ library + one page per object in src/content/workflows.mjs (design: Workflows / Workflow-Detail).
import { WORKFLOWS, workflowBySlug } from '../content/workflows.mjs';
import { templateBySlug } from '../content/templates.mjs';
import { useCaseBySlug } from '../content/usecases.mjs';
import { SITE, R, L, href, loc, card, directory, related, darkCode, copyScript, band, crumbs, ticks, meta, page } from '../resources.mjs';

const short = (t) => t.replace(/ with AI$/, '');
export const workflowCard = (w0, lang = 'en', hl = 'h3') => { const w = loc(w0, lang), r = R[lang];
  return card({ href: href(lang, `/workflows/${w.slug}/`), kicker: r.dept[w.department], title: w.title, text: w.description.split(/(?<=[.。])\s*/)[0], tags: [r.level[w.difficulty], ...w.tools.slice(0, 2)], cta: r.openWorkflow, cat: w.department, search: w.group, event: 'workflow_click', hl }); };
export const templateCard = (t0, lang = 'en', hl = 'h3', oak = false) => { const t = loc(t0, lang), r = R[lang];
  return card({ href: href(lang, `/templates/${t.slug}/`), kicker: `${r.templates.replace(/s$/, '')} · ${r.dept[t.category]}`, title: t.title, text: t.description, tags: t.roles.slice(0, 2), cta: r.openTemplate, cat: t.category, search: t.tools.join(' '), event: 'template_click', hl, oak }); };

const S = {
  en: { eyebrow: 'AI workflow', team: 'Team', level: 'Level', tools: 'Tools', usual: 'How it usually goes', flow: (n) => `The workflow · ${n} steps`, prompt: 'The prompt · copy and paste', copy: 'Copy prompt', example: 'Example output · fictional company',
    full: (t, h) => `The full reusable version, with input fields and customisation notes: <a href="${h}">${t}</a>.`, checkK: 'Before it goes out · a person checks', checkH: 'Review checklist', stopK: 'Don’t use it for', stopH: 'Where this workflow stops',
    part: (uc, h, a, tr) => `Part of <a href="${h}">${uc}</a>. Not sure your team is ready for workflows like this? Take the <a href="${a}">AI Readiness Assessment</a> — 10 questions, no email. Want your team to build this on its own work? <a href="${tr}">See how training works</a>.`,
    relK: 'Related', relH: 'Workflows that pair with this one', titleSuffix: 'Steps, Prompt and Checklist',
    hubTitle: 'AI Workflows for Work: Steps, Prompts and Checklists | AI Man Jack', hubDesc: 'A library of practical AI workflows for sales, marketing, operations and leadership. Each one has the steps, the prompt, an example and a human review checklist.',
    hubK: 'AI workflow library · free', hubH: 'Step-by-step, with the prompt and the review checklist.', hubP: (n) => `${n} workflows that teams build in the sessions. Each one has the steps, a copy-ready prompt, an example output, and what a person must check before it’s used.`,
    noun: 'workflows', promoTool: ['Free tool', 'Not sure where to start? Take the 3-minute AI Readiness Assessment.', 'Start assessment'], promoTpl: ['Template', 'AI Use Case Discovery Worksheet: score three weekly tasks on four questions.', 'Open template'],
    bandH: 'Want your team to build these? We’ll do it on <em>your</em> work.', imgA: 'Hands-on session in Dallas', imgB: 'Jack presenting at a Dallas session' },
  zh: { eyebrow: 'AI 工作流', team: '团队', level: '难度', tools: '工具', usual: '常见现状', flow: (n) => `工作流 · ${n} 个步骤`, prompt: '提示词 · 可直接复制', copy: '复制提示词', example: '示例输出 · 虚构公司',
    full: (t, h) => `包含输入字段与定制说明的完整可复用版本：<a href="${h}">${t}</a>。`, checkK: '发出之前 · 由人核验', checkH: '核验清单', stopK: '不适用场景', stopH: '这条工作流的边界',
    part: (uc, h, a, tr) => `本工作流属于<a href="${h}">${uc}</a>。不确定团队是否已准备好采用这类工作流？可先完成 <a href="${a}">AI 准备度评估</a>：10 个问题，无需邮箱。希望团队基于自己的工作搭建这条工作流？<a href="${tr}">了解培训方式</a>。`,
    relK: '相关工作流', relH: '与本工作流搭配使用', titleSuffix: '步骤、提示词与核验清单',
    hubTitle: 'AI 工作流库：步骤、提示词与核验清单 | AI Man Jack', hubDesc: '面向销售、市场、运营与管理层的实用 AI 工作流库。每条工作流均包含操作步骤、提示词、示例输出与人工核验清单。',
    hubK: 'AI 工作流库 · 免费', hubH: '分步骤操作，附提示词与核验清单。', hubP: (n) => `团队在课程中实际搭建的${n}条工作流。每条都包含操作步骤、可直接复制的提示词、示例输出，以及使用前必须由人核验的内容。`,
    noun: '工作流', promoTool: ['免费工具', '不确定从哪里开始？花 3 分钟完成 AI 准备度评估。', '开始评估'], promoTpl: ['模板', 'AI 应用场景发掘表：用四个问题为三项每周任务打分。', '查看模板'],
    bandH: '希望团队也搭建这些工作流？<br>我们基于<em>你们的</em>工作来做。', imgA: '达拉斯的一场实操课程', imgB: 'Jack 在达拉斯的一场课程中讲解' },
};
const ZH_NUM = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
const EN_NUM = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

const detail = (w0) => page({
  path: `/workflows/${w0.slug}/`,
  build: (lang) => {
    const w = loc(w0, lang), s = S[lang], r = R[lang], path = `/workflows/${w.slug}/`, uc = loc(useCaseBySlug[w.department], lang);
    const bc = crumbs(lang, [[r.workflows, '/workflows/'], [r.dept[w.department], `/use-cases/${w.department}/`], [short(w.title), path]]);
    const tpl = w.template && loc(templateBySlug[w.template], lang);
    return {
      view: 'workflow_view', title: `${w.title}: ${s.titleSuffix} | AI Man Jack`, description: w.description,
      body: `<section class="sec" style="padding:64px 0 72px"><div class="wrap g12" style="align-items:end">
<div style="grid-column:span 8;display:flex;flex-direction:column;gap:22px">${bc.html}<div class="eyebrow">${s.eyebrow} · ${r.dept[w.department]} · ${w.group}</div><h1>${w.title}</h1><p style="font-size:clamp(18px,1.55vw,22px);line-height:1.6;max-width:780px">${w.outcome}</p></div>
<div style="grid-column:10 / span 3">${meta([[s.team, r.dept[w.department]], [s.level, r.level[w.difficulty]], [s.tools, w.tools.join(' · ')]])}</div></div></section>
<section class="sec tight" style="padding-bottom:96px"><div class="wrap g12">
<div class="oak" style="grid-column:span 4;align-self:start;padding:32px"><div class="eyebrow">${s.usual}</div>${ticks(w.before, 'x')}</div>
<div style="grid-column:6 / span 7"><div class="eyebrow" style="margin-bottom:16px">${s.flow(w.steps.length)}</div><ol class="nums compact">${w.steps.map(([h, p], i) => `<li><span class="n">${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div></div></section>
<section class="sec dark" style="padding:96px 0"><div class="wrap"><div class="g2" style="gap:24px">${darkCode(lang, { id: 'wf-prompt', label: s.prompt, text: w.prompt, copy: s.copy })}${darkCode(lang, { label: s.example, text: w.example })}</div>
${tpl ? `<p style="margin-top:24px;font-size:16px">${s.full(tpl.title, href(lang, `/templates/${tpl.slug}/`)).replace('<a ', '<a style="color:#fff;font-weight:700" ')}</p>` : ''}</div></section>${copyScript}
<section class="sec" style="padding:96px 0"><div class="wrap"><div class="g2" style="gap:24px">
<div class="big-card" style="border-radius:var(--r);padding:36px"><div class="eyebrow">${s.checkK}</div><h2 class="h2-sm">${s.checkH}</h2>${ticks(w.humanReview, 'box')}</div>
<div class="big-card oakc" style="border-radius:var(--r);padding:36px"><div class="eyebrow">${s.stopK}</div><h2 class="h2-sm">${s.stopH}</h2>${ticks(w.notFor, 'dash')}</div></div>
<p class="callout" style="margin-top:24px">${s.part(uc.title, href(lang, `/use-cases/${uc.slug}/`), href(lang, '/tools/ai-readiness-assessment/'), L(lang, '/ai-training/'))}</p></div></section>
${related(s.relK, s.relH, w.related.map((x) => workflowCard(workflowBySlug[x], lang)), [href(lang, '/workflows/'), r.allWorkflows])}
${band(lang, { pos: `workflow-${w.slug}` })}`,
      jsonld: [{ '@type': 'HowTo', '@id': `${SITE}${L(lang, path)}#howto`, name: w.title, description: w.outcome, inLanguage: lang, author: { '@id': `${SITE}/#jack` }, publisher: { '@id': `${SITE}/#business` },
        tool: w.tools.map((t) => ({ '@type': 'HowToTool', name: t })), step: w.steps.map(([h, p], i) => ({ '@type': 'HowToStep', position: i + 1, name: h, text: p })) }, bc.ld],
    };
  },
});

const index = () => page({
  path: '/workflows/', priority: 0.8, changefreq: 'weekly',
  build: (lang) => {
    const s = S[lang], r = R[lang], bc = crumbs(lang, [[r.workflows, '/workflows/']]), n = (lang === 'zh' ? ZH_NUM : EN_NUM)[WORKFLOWS.length] || WORKFLOWS.length;
    const promo = ([k, t, cta], h, ev) => `<a class="card link-card res-card oakc" href="${h}" data-event="${ev}" data-pos="workflows-hub"><div class="eyebrow">${k}</div><h3 class="h3">${t}</h3><span class="res-cta">${cta} →</span></a>`;
    return {
      view: 'workflow_view', title: s.hubTitle, description: s.hubDesc,
      body: `<section style="padding:72px 0 56px"><div class="wrap g12" style="align-items:end;row-gap:20px">
<div style="grid-column:span 7;display:flex;flex-direction:column;gap:20px">${bc.html}<div class="eyebrow">${s.hubK}</div><h1 class="lg" style="font-size:clamp(42px,6.1vw,88px)">${s.hubH}</h1></div>
<div style="grid-column:9 / span 4;display:flex;flex-direction:column;gap:16px"><p class="lead" style="font-size:18px">${s.hubP(n)}</p><div style="display:flex;gap:10px"><img src="/img/events/dallas-session3-hands-on.webp" width="1600" height="1066" alt="${s.imgA}" style="width:50%;height:120px;object-fit:cover;border-radius:14px"><img src="/img/events/dallas-session3-jack-presenting.webp" width="1600" height="1066" alt="${s.imgB}" style="width:50%;height:120px;object-fit:cover;border-radius:14px"></div></div></div></section>
<section style="padding-bottom:64px"><div class="wrap">${directory({ lang, noun: s.noun, cards: WORKFLOWS.map((w) => workflowCard(w, lang, 'h2')) })}</div></section>
<section class="sec tight"><div class="wrap"><div class="g2">${promo(s.promoTool, href(lang, '/tools/ai-readiness-assessment/'), 'tool_click')}${promo(s.promoTpl, href(lang, '/templates/ai-use-case-discovery-worksheet/'), 'template_click')}</div></div></section>
${band(lang, { h: s.bandH, pos: 'workflows-index' })}`,
      jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, '/workflows/')}`, name: s.hubH, inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` }, hasPart: WORKFLOWS.map((w) => ({ '@type': 'HowTo', name: loc(w, lang).title, url: `${SITE}${L(lang, `/workflows/${w.slug}/`)}` })) }, bc.ld],
    };
  },
});

export const pages = [index(), ...WORKFLOWS.map(detail)];
