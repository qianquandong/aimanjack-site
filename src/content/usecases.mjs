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
    slug: 'sales', team: 'a sales team', hero: 'Use AI to research accounts, prepare meetings, write follow-ups and keep the pipeline honest — each with steps, prompts and a human review checklist.',
    zh: { title: '销售团队的 AI 应用', team: '销售团队', card: '客户调研、会前准备、跟进邮件与销售管线复盘。', hero: '借助 AI 完成客户调研、会前准备、跟进邮件与销售管线复盘——每项都配有操作步骤、提示词和人工核验清单。',
      description: '面向销售团队的实用 AI 工作流：潜在客户调研、会议准备、跟进邮件与管线复盘，每条均附操作步骤、提示词与人工核验清单。',
      answer: '销售团队从 AI 中获益最大的，往往是围绕客户沟通的工作，而非沟通本身：外联前的客户调研、基于既有记录的会前准备，以及趁热撰写跟进邮件。这些工作都有清晰的输入、可核验的输出，以及对结果负责的人。',
      groups: [['获客与线索', [{ wf: 'prospect-research' }, '现有客户调研', '线索资格评估记录', '个性化外联草稿']], ['会议准备', [{ wf: 'sales-meeting-preparation' }, { wf: 'competitive-research' }, '会议议程']], ['销售执行', [{ wf: 'sales-follow-up' }, { wf: 'meeting-notes-to-action-items' }, '方案初稿']], ['销售管理', ['管线复盘准备', '交易风险记录', '业绩预测说明']]],
      watch: ['价格、折扣与合同条款始终由人负责。', '任何提供给客户的内容，都需先对照来源核实。', '客户数据只能输入公司已批准的工具。'] },
    title: 'AI for Sales', card: 'Use AI to research accounts, prepare meetings, write follow-ups and keep the pipeline honest.',
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
    slug: 'marketing', team: 'a marketing team', hero: 'Research, create, repurpose and analyse content faster — without sounding like everyone else. Each workflow has steps, a prompt and a review checklist.',
    zh: { title: '市场团队的 AI 应用', team: '市场团队', card: '更高效地完成调研、创作、内容再利用与数据分析，同时保持品牌辨识度。', hero: '更高效地完成调研、创作、内容再利用与数据分析，同时保持品牌辨识度。每条工作流都配有操作步骤、提示词和核验清单。',
      description: '面向市场团队的实用 AI 工作流：客户访谈分析、竞品调研与内容再利用，均附提示词、示例与核验清单。',
      answer: '市场团队运用 AI 的最佳场景，是手头已有素材的工作：需要归纳的访谈记录、需要对比的竞品页面、需要改编的成稿。从一个空白提示词开始，只会得到其他团队同样在发布的泛泛之作。',
      groups: [['调研', [{ wf: 'customer-research' }, { wf: 'competitive-research' }, '问卷开放题编码']], ['内容制作', [{ wf: 'content-repurposing' }, '基于模板生成投放简报', '基于信息文档撰写文案初稿']], ['分析', ['基于导出数据的效果总结', '投放活动复盘']]],
      watch: ['所有主张与数据均来自自有资料，而非模型。', '品牌语气以样例形式提供，并由人编辑定稿。', '客户引述必须为原话，并做匿名处理。'] },
    title: 'AI for Marketing', card: 'Research, create, repurpose and analyse content faster — without sounding like everyone else.',
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
    slug: 'operations', team: 'an operations team', hero: 'Turn repetitive knowledge work — notes, reports, procedures — into AI-assisted workflows people trust, each with steps, a prompt and a review checklist.',
    zh: { title: '运营团队的 AI 应用', team: '运营团队', card: '将会议纪要、报告、流程文档等重复性知识工作，转化为值得信赖的 AI 辅助工作流。', hero: '将会议纪要、报告、流程文档等重复性知识工作，转化为值得信赖的 AI 辅助工作流，每条都配有操作步骤、提示词和核验清单。',
      description: '面向运营团队的实用 AI 工作流：会议纪要转待办、SOP 编写与文档总结，均附操作步骤、提示词与核验清单。',
      answer: '运营工作中充满每周重复、形态固定的任务：需要整理待办的会议、基于同一份导出数据的报告、只存在于某位同事头脑中的流程。这类 AI 工作流最容易核验，因此也是团队起步的最佳选择。',
      groups: [['会议', [{ wf: 'meeting-notes-to-action-items' }, '例会议程']], ['流程文档', [{ wf: 'sop-creation' }, '将现有 SOP 整理为检查清单', '基于 SOP 编写入职指南']], ['知识工作', [{ wf: 'internal-document-summary' }, '基于同一份表格导出的周报', '从发票和表单中提取字段并整理成表格']]],
      watch: ['涉及安全或受监管的流程，须经正式的人工审核。', '每次都需对照来源核对数字。', '每份生成的文档都应注明负责人与复核日期。'] },
    title: 'AI for Operations', card: 'Turn repetitive knowledge work — notes, reports, procedures — into AI-assisted workflows people trust.',
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
    slug: 'leadership', team: 'a leadership team', hero: 'Help teams adopt AI safely and productively: which tasks, which tools, who signs off, how to measure.',
    zh: { title: '管理层的 AI 应用', team: '管理团队', card: '帮助团队安全、高效地落地 AI：选什么任务、用什么工具、由谁审批、如何衡量。', hero: '帮助团队安全、高效地落地 AI：选什么任务、用什么工具、由谁审批、如何衡量。',
      description: '管理者如何使用 AI 并推动团队落地：管理层简报、应用场景排序、数据边界、人工核验与效果衡量。',
      answer: '对管理者而言，AI 的重点不在于撰写提示词，而在于四项决策：哪些任务值得投入、允许使用哪些工具与数据、哪些环节必须由人签字，以及两周后如何判断一条工作流是否应当继续。这里的工作流即为这些决策提供支持。',
      groups: [['汇报', [{ wf: 'executive-brief' }, { wf: 'internal-document-summary' }]], ['落地推进', ['用四个问题为应用场景排序', '已批准的工具与数据边界', '工作流的负责人与签字机制']], ['效果衡量', ['两周工作流复盘：保留、调整或停止', '按团队检查落地情况']]],
      watch: ['对个人的绩效判断不交由模型完成。', '面向董事会与投资人的汇报保留正式的审核流程。', '制度由人制定，工具仅负责起草。'] },
    title: 'AI for Leaders and Managers', card: 'Help teams adopt AI safely and productively: which tasks, which tools, who signs off, how to measure.',
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
