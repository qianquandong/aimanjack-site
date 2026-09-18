// Use-case categories. One object → /use-cases/<slug>/ (template: src/pages/usecases.mjs).
// `groups` lists the work a department does; an item that names a workflow slug becomes a link, a plain string stays text
// (no empty links: a page only gets linked once it exists).
//
// @typedef {Object} UseCase
// @property {string} slug
// @property {string} title        H1, e.g. "AI for Sales"
// @property {string} card         homepage / hub card text
// @property {string} description  meta description
// @property {string} answer       answer-first paragraph under the H1
// @property {[string, (string|{wf:string})[]][]} groups
// @property {string[]} watch      where human judgement stays in charge for this department
export const USE_CASES = [
  {
    slug: 'sales', title: 'AI for Sales', card: 'Use AI to research accounts, prepare meetings, write follow-ups and keep the pipeline honest.',
    description: 'Practical AI workflows for sales teams: prospect research, meeting preparation, follow-up and pipeline review — each with steps, prompts and a human review checklist.',
    answer: 'Sales teams get the most from AI on the work around the conversation, not the conversation itself: researching an account before outreach, preparing for a meeting from existing notes, and writing the follow-up while it is fresh. Each of these has a clear input, a checkable output and a person who owns the result.',
    groups: [
      ['Lead generation', [{ wf: 'prospect-research' }, 'Account research for existing customers', 'Lead qualification notes', 'Personalised outreach drafts']],
      ['Meeting preparation', [{ wf: 'sales-meeting-preparation' }, { wf: 'competitive-research' }, 'Meeting agenda']],
      ['Sales execution', [{ wf: 'sales-follow-up' }, { wf: 'meeting-notes-to-action-items' }, 'Proposal first drafts']],
      ['Sales management', ['Pipeline review preparation', 'Deal risk notes', 'Forecast commentary']],
    ],
    watch: ['Pricing, discounts and contract language stay with a person.', 'Anything quoted to a customer is checked against its source first.', 'Customer data only goes into tools your company has approved.'],
  },
  {
    slug: 'marketing', title: 'AI for Marketing', card: 'Research, create, repurpose and analyse content faster — without sounding like everyone else.',
    description: 'Practical AI workflows for marketing teams: customer research synthesis, competitive research and content repurposing, with prompts, examples and review checklists.',
    answer: 'Marketing teams use AI best where there is source material to work from: interview transcripts to synthesise, competitor pages to compare, a finished piece to repurpose. Starting from a blank prompt produces the generic copy every other team is also publishing.',
    groups: [
      ['Research', [{ wf: 'customer-research' }, { wf: 'competitive-research' }, 'Survey open-text coding']],
      ['Content production', [{ wf: 'content-repurposing' }, 'Campaign briefs from a filled-in template', 'First-draft copy from a messaging document']],
      ['Analysis', ['Performance summaries from exported numbers', 'Campaign retrospectives']],
    ],
    watch: ['Claims and statistics come from your sources, never from the model.', 'Brand voice is supplied as samples, then edited by a person.', 'Customer quotes are verbatim and anonymised.'],
  },
  {
    slug: 'operations', title: 'AI for Operations', card: 'Turn repetitive knowledge work — notes, reports, procedures — into AI-assisted workflows people trust.',
    description: 'Practical AI workflows for operations teams: meeting notes to action items, SOP creation and document summaries, each with steps, prompts and review checklists.',
    answer: 'Operations work is full of tasks that repeat weekly with the same shape: the meeting that needs action items, the report built from the same export, the procedure that lives in one person’s head. These are the easiest AI workflows to verify, which makes them the best place for a team to start.',
    groups: [
      ['Meetings', [{ wf: 'meeting-notes-to-action-items' }, 'Recurring meeting agendas']],
      ['Process documentation', [{ wf: 'sop-creation' }, 'Checklist versions of existing SOPs', 'Onboarding guides from SOPs']],
      ['Knowledge work', [{ wf: 'internal-document-summary' }, 'Weekly report from the same spreadsheet export', 'Fields extracted from invoices and forms into a table']],
    ],
    watch: ['Safety-critical and regulated procedures get formal human review.', 'Numbers are checked against the source every time.', 'An owner and a review date go on every generated document.'],
  },
  {
    slug: 'leadership', title: 'AI for Leaders and Managers', card: 'Help teams adopt AI safely and productively: which tasks, which tools, who signs off, how to measure.',
    description: 'How leaders and managers use AI and guide adoption: executive briefs, use-case prioritisation, data boundaries, human review and measurement.',
    answer: 'For leaders, AI is less about writing prompts and more about four decisions: which tasks are worth it, which tools and data are allowed, where a human must sign off, and how to tell after two weeks whether a workflow should continue. The workflows here support those decisions.',
    groups: [
      ['Reporting', [{ wf: 'executive-brief' }, { wf: 'internal-document-summary' }]],
      ['Adoption', ['Use-case prioritisation with the four-question score', 'Approved tools and data boundaries', 'Workflow ownership and sign-off']],
      ['Measurement', ['Two-week workflow review: keep, change or stop', 'Adoption check by team']],
    ],
    watch: ['Performance judgments about individuals are not delegated to a model.', 'Board and investor reporting keeps its formal review.', 'Policy is set by people; the tool only drafts.'],
  },
];

export const useCaseBySlug = Object.fromEntries(USE_CASES.map((u) => [u.slug, u]));
