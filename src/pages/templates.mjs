// /templates/ directory + one page per object in src/content/templates.mjs.
import { TEMPLATES, templateBySlug } from '../content/templates.mjs';
import { workflowBySlug } from '../content/workflows.mjs';
import { SITE, DEPARTMENTS, directory, resourceHero, related, copyBlock, copyScript, trainingCta, crumbs, list, page, tag } from '../resources.mjs';
import { workflowCard, templateCard } from './workflows.mjs';

const detail = (t) => {
  const path = `/templates/${t.slug}/`, bc = crumbs([['Templates', '/templates/'], [t.title, path]]);
  const parent = workflowBySlug[t.workflows[0]];
  return page({
    path, view: 'template_view', title: `${t.title} (Free, Copy and Paste) | AI Man Jack`, description: t.description,
    body: `${resourceHero({ crumbs: bc.html, eyebrow: `Template · ${DEPARTMENTS[t.category]}`, h1: t.title, lead: t.description,
      extra: `<p class="tags" style="margin-top:18px">${[...t.tools, ...t.roles].map(tag).join('')}</p>` })}
<section class="wrap narrow prose res-body">
${copyBlock('tpl-body', t.body)}
<h2>What you need first</h2>${list(t.inputs)}
<h2>How to use it</h2><ol>${t.howTo.map((s) => `<li>${s}</li>`).join('')}</ol>
<h2>Make it yours</h2>${list(t.tips)}
<p class="callout">This template is the reusable half of the <a href="/workflows/${parent.slug}/">${parent.title}</a> workflow, which covers the full process, an example output and the human review checklist. More for this team: <a href="/use-cases/${t.category}/">AI for ${DEPARTMENTS[t.category]}</a>.</p>
</section>${copyScript}
${related('Related templates', t.related.map((s) => templateCard(templateBySlug[s])))}
${related('Workflows that use this', t.workflows.map((s) => workflowCard(workflowBySlug[s])))}
${trainingCta({ h: 'A template is a start. A trained team is the point.', sub: 'In a workshop, your team adapts templates like this to its own tasks and tools, and sets who checks the output.', pos: `template-${t.slug}` })}`,
    jsonld: [{ '@type': 'CreativeWork', '@id': `${SITE}${path}#template`, name: t.title, description: t.description, inLanguage: 'en', isAccessibleForFree: true, learningResourceType: 'Template', author: { '@id': `${SITE}/#jack` }, publisher: { '@id': `${SITE}/#business` }, url: `${SITE}${path}` }, bc.ld],
  });
};

const index = () => {
  const bc = crumbs([['Templates', '/templates/']]);
  return page({
    path: '/templates/', priority: 0.8, changefreq: 'weekly', view: 'template_view',
    title: 'AI Templates for Work: Prompts, Worksheets and Checklists | AI Man Jack',
    description: 'Free, copy-and-paste AI templates for sales, marketing, operations and leadership: prompts, worksheets and checklists, each linked to the workflow it belongs to.',
    body: `${resourceHero({ crumbs: bc.html, eyebrow: 'Library', h1: 'AI Templates for Work', lead: 'Reusable prompts, worksheets and checklists for teams using AI. Copy one, fill the brackets, run it on real work. No sign-up.' })}
<section class="wrap" style="padding-bottom:72px">${directory({ noun: 'templates', cards: TEMPLATES.map((t) => templateCard(t, 'h2')), filters: Object.entries(DEPARTMENTS) })}</section>
${trainingCta({ h: 'Want these adapted to your team’s real work?', sub: 'That is what a workshop is: your tasks, your tools, your review rules.', pos: 'templates-index' })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}/templates/`, name: 'AI Templates for Work', inLanguage: 'en', isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
  });
};

export const pages = [index(), ...TEMPLATES.map(detail)];
