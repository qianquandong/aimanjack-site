// /workflows/ directory + one page per object in src/content/workflows.mjs.
import { WORKFLOWS, workflowBySlug } from '../content/workflows.mjs';
import { templateBySlug } from '../content/templates.mjs';
import { useCaseBySlug } from '../content/usecases.mjs';
import { SITE, DEPARTMENTS, card, directory, resourceHero, related, copyBlock, copyScript, trainingCta, crumbs, list, page, tag } from '../resources.mjs';

export const workflowCard = (w, hl = 'h3') => card({ href: `/workflows/${w.slug}/`, kicker: `${DEPARTMENTS[w.department]} · ${w.group}`, title: w.title.replace(/ with AI$/, ''), text: w.description.split('. ')[0] + '.', tags: w.tools, cat: w.department, search: w.group, event: 'workflow_click', hl });
export const templateCard = (t, hl = 'h3') => card({ href: `/templates/${t.slug}/`, kicker: DEPARTMENTS[t.category], title: t.title, text: t.description, tags: t.tools.slice(0, 3), cta: 'View template', cat: t.category, search: t.roles.join(' '), event: 'template_click', hl });

const detail = (w) => {
  const uc = useCaseBySlug[w.department], path = `/workflows/${w.slug}/`;
  const bc = crumbs([['Use Cases', '/use-cases/'], [DEPARTMENTS[w.department], `/use-cases/${w.department}/`], [w.title, path]]);
  const tpl = w.template && templateBySlug[w.template];
  const steps = w.steps.map(([h, p], i) => `<li><span class="num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join('');
  return page({
    path, view: 'workflow_view', title: `${w.title}: Steps, Prompt and Checklist | AI Man Jack`, description: w.description,
    body: `${resourceHero({ crumbs: bc.html, eyebrow: `AI workflow · ${DEPARTMENTS[w.department]}`, h1: w.title, lead: w.outcome,
      extra: `<p class="tags" style="margin-top:18px">${w.tools.map(tag).join('')}${tag(w.difficulty)}</p>` })}
<section class="wrap narrow prose res-body">
<h2>How this usually goes today</h2>${list(w.before)}
<h2>The AI-assisted workflow</h2></section>
<section class="wrap"><ol class="steps">${steps}</ol></section>
<section class="wrap narrow prose res-body">
<h2>The prompt</h2><p>The core instruction. ${tpl ? `The full reusable version, with input fields and customisation notes, is the <a href="/templates/${tpl.slug}/">${tpl.title}</a>.` : 'Adapt the bracketed parts to your situation.'}</p>
${copyBlock('wf-prompt', w.prompt, { label: 'Copy prompt', event: 'template_copy' })}
<h2>Example output</h2><p class="muted">Illustrative. The company and people are fictional.</p><pre class="example"><code>${w.example.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre>
<h2>Human review checklist</h2><p>Before the output is used:</p>${list(w.humanReview, 'checks')}
<h2>When not to use this workflow</h2>${list(w.notFor)}
<p class="callout">Part of <a href="/use-cases/${uc.slug}/">${uc.title}</a>. Not sure your team is ready for workflows like this? Take the <a href="/tools/ai-readiness-assessment/">AI Readiness Assessment</a> — 10 questions, no email required.</p>
</section>${copyScript}
${related('Related workflows', w.related.map((s) => workflowCard(workflowBySlug[s])))}
${trainingCta({ h: 'Want your team to build this on its own work?', sub: 'In a hands-on workshop each person builds one workflow like this on a task they already do, and learns to check the output before it is used.', pos: `workflow-${w.slug}` })}`,
    jsonld: [{ '@type': 'HowTo', '@id': `${SITE}${path}#howto`, name: w.title, description: w.outcome, inLanguage: 'en', author: { '@id': `${SITE}/#jack` }, publisher: { '@id': `${SITE}/#business` },
      tool: w.tools.map((t) => ({ '@type': 'HowToTool', name: t })), step: w.steps.map(([h, p], i) => ({ '@type': 'HowToStep', position: i + 1, name: h, text: p })) }, bc.ld],
  });
};

const index = () => {
  const bc = crumbs([['AI Workflows', '/workflows/']]);
  return page({
    path: '/workflows/', priority: 0.8, changefreq: 'weekly', view: 'workflow_view',
    title: 'AI Workflows for Work: Steps, Prompts and Checklists | AI Man Jack',
    description: 'A library of practical AI workflows for sales, marketing, operations and leadership. Each one has the steps, the prompt, an example and a human review checklist.',
    body: `${resourceHero({ crumbs: bc.html, eyebrow: 'Library', h1: 'AI Workflows', lead: 'Practical, step-by-step workflows for everyday work. Each one starts from material you already have, shows the prompt, and ends with what a person must check before the output is used.' })}
<section class="wrap" style="padding-bottom:72px">${directory({ noun: 'workflows', cards: WORKFLOWS.map((w) => workflowCard(w, 'h2')), filters: Object.entries(DEPARTMENTS) })}</section>
${trainingCta({ h: 'Build these with your team, on your own work.', sub: 'A half-day workshop: each person leaves with one working workflow for a task they already do.', pos: 'workflows-index' })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}/workflows/`, name: 'AI Workflows', inLanguage: 'en', isPartOf: { '@id': `${SITE}/#website` }, hasPart: WORKFLOWS.map((w) => ({ '@type': 'HowTo', name: w.title, url: `${SITE}/workflows/${w.slug}/` })) }, bc.ld],
  });
};

export const pages = [index(), ...WORKFLOWS.map(detail)];
