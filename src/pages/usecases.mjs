// /use-cases/ hub + one page per category in src/content/usecases.mjs.
import { USE_CASES } from '../content/usecases.mjs';
import { WORKFLOWS, workflowBySlug } from '../content/workflows.mjs';
import { TEMPLATES } from '../content/templates.mjs';
import { SITE, card, resourceHero, related, trainingCta, crumbs, list, page } from '../resources.mjs';
import { workflowCard, templateCard } from './workflows.mjs';

export const useCaseCard = (u, hl = 'h3') => card({ href: `/use-cases/${u.slug}/`, title: u.title.replace(/^AI for /, ''), text: u.card, cta: `${WORKFLOWS.filter((w) => w.department === u.slug).length} workflows`, event: 'use_case_click', hl });

const detail = (u) => {
  const path = `/use-cases/${u.slug}/`, bc = crumbs([['Use Cases', '/use-cases/'], [u.title, path]]);
  const mine = WORKFLOWS.filter((w) => w.department === u.slug);
  // A group item that names a workflow becomes a link; plain strings stay text until that page exists.
  const item = (i) => typeof i === 'string' ? `<li>${i}</li>` : `<li><a href="/workflows/${i.wf}/">${workflowBySlug[i.wf].title.replace(/ with AI$/, '')}</a></li>`;
  return page({
    path, priority: 0.8, view: 'use_case_view', title: `${u.title}: Practical Workflows and Templates | AI Man Jack`, description: u.description,
    body: `${resourceHero({ crumbs: bc.html, eyebrow: 'Use cases', h1: u.title, lead: u.answer })}
<section class="wrap" style="padding-bottom:56px"><div class="grid-${Math.min(u.groups.length, 4)} uc-groups">${u.groups.map(([g, items]) => `<div class="card"><h2 class="h3">${g}</h2><ul class="uc-list">${items.map(item).join('')}</ul></div>`).join('')}</div>
<p class="section-note">Linked items have a full workflow page: steps, prompt, example and review checklist. The rest are covered in training and will get pages as they are written up.</p></section>
<section class="section"><div class="wrap"><h2 class="h2-sm">Workflows for ${u.title.replace(/^AI for /, '').toLowerCase()}</h2><div class="grid-3 res-grid">${mine.map((w) => workflowCard(w)).join('\n')}</div></div></section>
<section class="section soft"><div class="wrap narrow prose"><h2 class="h2-sm">Where people stay in charge</h2>${list(u.watch, 'checks')}</div></section>
${related('Templates', TEMPLATES.filter((t) => t.category === u.slug).map((t) => templateCard(t)))}
${trainingCta({ h: `Train your ${u.title.replace(/^AI for /, '').toLowerCase()} team on its own work.`, sub: 'Each person brings one task they already do and leaves with a working workflow for it, plus the habit of checking the output.', pos: `use-case-${u.slug}` })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${path}`, name: u.title, description: u.description, inLanguage: 'en', isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
  });
};

const index = () => {
  const bc = crumbs([['Use Cases', '/use-cases/']]);
  return page({
    path: '/use-cases/', priority: 0.8, changefreq: 'weekly', view: 'use_case_view',
    title: 'AI Use Cases for Real Teams: Sales, Marketing, Operations, Leadership | AI Man Jack',
    description: 'See where AI saves time and improves quality in everyday work, by team: sales, marketing, operations and leadership. Every use case links to a step-by-step workflow.',
    body: `${resourceHero({ crumbs: bc.html, eyebrow: 'Library', h1: 'AI Use Cases for Real Teams', lead: 'See where AI can save time, improve quality and change how everyday work gets done. Pick a team; every linked use case opens a workflow with steps, a prompt and a review checklist.' })}
<section class="wrap" style="padding-bottom:72px"><div class="grid-2 res-grid">${USE_CASES.map((u) => useCaseCard(u, 'h2')).join('\n')}</div>
<p class="section-note">Looking for a specific task? <a href="/workflows/">Search all AI workflows</a> or browse <a href="/templates/">templates</a>. Not sure where your team should start? The <a href="/tools/ai-readiness-assessment/">AI Readiness Assessment</a> takes three minutes.</p></section>
${trainingCta({ h: 'Find your team’s first use case together.', sub: 'Every session opens with the same exercise: three weekly tasks per person, scored on four questions. The narrow one wins.', pos: 'use-cases-index' })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}/use-cases/`, name: 'AI Use Cases for Real Teams', inLanguage: 'en', isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
  });
};

export const pages = [index(), ...USE_CASES.map(detail)];
