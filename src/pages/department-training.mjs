// Department training pages (2026-10-18): /ai-training/sales-teams/, /marketing-teams/, /operations-teams/, /leadership-teams/.
// Why: buyers also search by team ("AI training for sales teams"), and the benchmark sites (Caravan /departments/, Teamland
// /for/ai-training/<role>/) each have one page per department. These are the BUYING pages; /use-cases/<team>/ stays the
// informational page ("what can a sales team do with AI") and the two link to each other so they do not compete for one query.
// Same rules as the tool pages: no price anywhere (BUSINESS_REF, no Offer), full FAQ, short quote form at the end.
// Copy is drawn from src/content/usecases.mjs (groups, watch), the workflow and template library — no outcome numbers, no client names.
import { SITE, BOOK_URL } from '../config.mjs';
import { L } from '../layout.mjs';
import { breadcrumb, BUSINESS_REF } from '../components.mjs';
import { person, faqPage, AREA } from '../schema.mjs';
import { WORKFLOWS } from '../content/workflows.mjs';
import { TEMPLATES } from '../content/templates.mjs';
import { quickQuote } from '../quick-quote.mjs';
import { kitForm } from '../kit-form.mjs';
import { SHARED, head, sharedBlocks, TOOL_NAME, toolPath } from './tool-training.mjs';
import { workflowCard } from './workflows.mjs';
import { caseProof } from './cases.mjs';
import { loc } from '../resources.mjs';
import { useCaseBySlug } from '../content/usecases.mjs'; // watch lists (where a person stays in charge), reused so both pages agree

export const DEPT_PAGES = ['sales', 'marketing', 'operations', 'leadership'];
export const deptPath = (k) => `/ai-training/${k}-teams/`;
const WF = { sales: ['prospect-research', 'sales-meeting-preparation', 'sales-follow-up'], marketing: ['customer-research', 'competitive-research', 'content-repurposing'],
  operations: ['meeting-notes-to-action-items', 'sop-creation', 'internal-document-summary'], leadership: ['executive-brief', 'internal-document-summary'] };
const TPL = { sales: ['prospect-research', 'sales-meeting-prep', 'follow-up-email'], marketing: ['customer-interview-analysis', 'content-repurposing'],
  operations: ['sop-builder', 'ai-workflow-one-pager', 'approved-source-inventory'], leadership: ['ai-use-case-discovery-worksheet', 'ai-tool-approval-checklist', 'ai-data-boundaries-one-pager', 'two-week-workflow-review', 'weekly-executive-summary'] };

const UI = {
  en: { crumb: 'AI training', getQuote: 'Get a quote', book: 'Book a 20-minute call', wfK: 'Workflows', wfP: 'Each workflow has a public page with steps, a prompt and a review checklist, so you can see the material before you book.',
    tplK: 'Templates the team takes home:', ucMore: (n) => `All ${n} use cases →`, toolsK: 'Tools', toolsH: 'Taught in the AI tool your company already approved', toolsP: 'The workflows are the same in every tool. If you have not chosen one yet, the session starts by comparing them on your own tasks and data terms. We do not sell licenses.',
    toolCard: (t) => `${t} training →`, otherK: 'Other teams', otherH: 'AI training for the other teams in your company', faqK: 'Questions', faqH: (d) => `AI training for ${d}, answered`,
    costQ: (d) => `How much does AI training for ${d} cost?`, ldType: (d) => `AI training for ${d}` },
  zh: { crumb: 'AI 培训', getQuote: '获取报价', book: '预约 20 分钟通话', wfK: '工作流', wfP: '每条工作流都有公开页面，含操作步骤、提示词和核验清单，预约之前就能看到课上用的材料。',
    tplK: '团队带走的模板：', ucMore: (n) => `查看全部${n}应用场景 →`, toolsK: '工具', toolsH: '用公司已经批准的 AI 工具来教', toolsP: '工作流在各种工具上都一样。如果还没选定工具，课程就从用你们自己的任务和数据条款来比较开始。我们不卖许可证。',
    toolCard: (t) => `${t} 培训 →`, otherK: '其他团队', otherH: '公司里其他团队的 AI 培训', faqK: '常见问题', faqH: (d) => `${d} AI 培训，直接回答`,
    costQ: (d) => `${d} AI 培训费用是多少？`, ldType: (d) => `${d} AI 培训` },
};

const DEPTS = {
  sales: {
    en: {
      name: 'sales teams', short: 'Sales', ucName: 'sales',
      title: 'AI Training for Sales Teams in Dallas | AI Man Jack',
      description: 'Hands-on AI training for Dallas sales teams: account research, call prep, follow-ups and pipeline notes on your own deals. Onsite or online. Get a quote by email.',
      h1: 'AI training for sales teams, built on your own accounts and deals',
      sub: 'Most reps already paste notes into ChatGPT or Copilot, each in their own way. In a hands-on session every rep takes a real account from their pipeline, builds the research, call prep and follow-up workflow on it, and learns which facts to check before anything reaches a customer.',
      whyK: 'What changes', whyH: 'What your sales team can do after the session',
      why: ['Turn a company website, a LinkedIn profile and CRM notes into a one-page account brief before the first call.', 'Walk into each meeting with the account history, open questions and a short agenda, prepared from notes you already have.', 'Send a follow-up the same afternoon that matches what was actually said, with next steps and owners.', 'Write pipeline review notes and deal-risk summaries a manager can trust, because every claim points to a source.'],
      modK: 'Curriculum', modH: 'What the sales training covers',
      mods: [['Account research with sources', 'A fixed brief format from public pages and CRM history, a source after every claim, and the two facts each rep verifies before quoting them.'], ['Call and meeting prep', 'Account history, likely questions and a proposed agenda, built from your own notes and email threads.'], ['Follow-ups from call notes', 'A follow-up email from the call notes or transcript, in the rep’s voice, with what was agreed and what happens next.'], ['Competitive questions', 'A short comparison built from competitors’ own published pages, and how to answer when a buyer brings one up.'], ['Proposal first drafts', 'First drafts assembled from approved past proposals and the buyer’s own words, without new promises.'], ['Pipeline and deal reviews', 'Deal notes, risk flags and forecast commentary drafted for the manager, with the judgment left to people.']],
      wfH: 'The sales workflows each rep builds',
      chargeH: 'Where a person stays in charge',
      chargeP: 'We agree on these rules with your sales leader before the session and write them on one page the team keeps.',
      faq: [
        ['Our reps are not technical. Will they keep up?', 'Yes. No coding is involved. Reps work in the AI tool your company already approved, on an account from their own pipeline, and the session moves at the pace of real examples, not a demo.'],
        ['Which AI tools do you train sales teams on?', `The ones your company approves: usually Microsoft Copilot, ChatGPT or Claude, sometimes Grok for live research. The workflows are the same across tools; see <a href="${toolPath('copilot')}">Copilot</a>, <a href="${toolPath('chatgpt')}">ChatGPT</a> or <a href="${toolPath('claude')}">Claude</a> training for tool-specific detail.`],
        ['Can AI work with our CRM?', 'Usually through what reps paste or export: account history, notes and past emails. Some AI tools can connect to a CRM directly, depending on your plan and what your admin allows; we start with the smallest access that does the job. We do not build integrations.'],
        ['Will AI-written emails sound generic?', 'Not if the instructions carry your voice. Reps give the tool two or three of their own past emails that worked, the call notes, and a list of what never to say. A person reads every email before it is sent.'],
        ['Is it safe to put customer information into AI?', 'Only into tools your company has approved, on business accounts, and only what the task needs. We agree on what never goes in, such as contract terms and personal data, what needs a check first, and what is fine.'],
        ['Can sales managers join, or get their own session?', `Either. Managers often join the rep session and stay for a short block on pipeline notes and coaching, or they take the <a href="${deptPath('leadership')}">leadership team training</a>.`],
        ['What does each rep leave with?', 'At least one working workflow on a real account, such as a research brief, call prep or a follow-up, written down so a colleague could repeat it, and a checklist of what to verify before it reaches a customer.'],
      ],
    },
    zh: {
      name: '销售团队', short: '销售', ucName: '销售',
      title: '销售团队 AI 培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯销售团队的 AI 实操培训：客户调研、会前准备、跟进邮件和管线复盘，用在你们自己的客户和商机上。上门或线上，留邮箱获取报价。',
      h1: '销售团队 AI 培训，用你们自己的客户和商机来练',
      sub: '大多数销售已经在把笔记粘进 ChatGPT 或 Copilot，只是各用各的方法。实操课上，每位销售从自己的管线里拿一个真实客户，把调研、会前准备和跟进邮件做成工作流，并学会在任何内容发给客户之前该核对哪些事实。',
      whyK: '改变什么', whyH: '课后销售团队能做到的事',
      why: ['在第一次通话前，把公司官网、LinkedIn 资料和 CRM 备注整理成一页客户简报。', '每次开会前都带着客户往来记录、待解决的问题和简短议程，全部来自已有的笔记。', '当天下午就发出与会上实际内容一致的跟进邮件，写明下一步和负责人。', '写出经理信得过的管线复盘和商机风险摘要，因为每条说法都注明来源。'],
      modK: '课程内容', modH: '销售培训讲什么',
      mods: [['带来源的客户调研', '基于公开页面和 CRM 记录的固定简报格式，每条说法后注明来源，引用前由销售亲自核对两条关键事实。'], ['通话与会议准备', '根据你们自己的笔记和邮件往来，整理客户历史、可能的问题和建议议程。'], ['根据通话记录写跟进', '用通话笔记或转录写跟进邮件，保持销售本人的语气，写清约定事项和下一步。'], ['竞品问题', '根据竞争对手自己公开的页面做简短对比，以及客户提到竞品时怎么回答。'], ['方案初稿', '用批准过的往期方案和客户自己的原话拼出初稿，不添加新的承诺。'], ['管线与商机复盘', '为经理起草商机备注、风险提示和预测说明，判断留给人来做。']],
      wfH: '每位销售都会搭建的工作流',
      chargeH: '由人把关的环节',
      chargeP: '课前我们会和销售负责人约定这些规则，写成一页纸留给团队。',
      faq: [
        ['销售都不懂技术，跟得上吗？', '跟得上。不涉及写代码。销售在公司已批准的 AI 工具里，用自己管线里的客户来练，节奏跟着真实案例走，而不是看演示。'],
        ['销售培训用哪些 AI 工具？', `用公司批准的工具：通常是 Microsoft Copilot、ChatGPT 或 Claude，有时用 Grok 做实时调研。工作流在各工具上通用；各工具的细节见 <a href="/zh${toolPath('copilot')}">Copilot</a>、<a href="/zh${toolPath('chatgpt')}">ChatGPT</a> 或 <a href="/zh${toolPath('claude')}">Claude</a> 培训。`],
        ['AI 能配合我们的 CRM 吗？', '通常通过销售粘贴或导出的内容：客户历史、备注和往来邮件。部分 AI 工具可以直接连接 CRM，取决于你们的方案和管理员设置；我们从能完成任务的最小权限开始。我们不做系统对接开发。'],
        ['AI 写的邮件会不会千篇一律？', '只要指令里带着你们的口吻就不会。销售给工具两三封自己写过、效果好的邮件、通话笔记和一份绝不能说的话的清单。每封邮件发送前都由人读过。'],
        ['把客户信息放进 AI 安全吗？', '只能放进公司已批准、企业账号下的工具，而且只放任务需要的内容。我们会约定哪些绝不输入（例如合同条款和个人信息）、哪些先确认、哪些可以用。'],
        ['销售经理可以一起上，或者单独上吗？', `都可以。经理常常和销售一起上课，再留下来加一小段管线复盘和辅导的内容；也可以参加<a href="/zh${deptPath('leadership')}">管理层 AI 培训</a>。`],
        ['每位销售能带走什么？', '至少一条基于真实客户的可用工作流，比如调研简报、会前准备或跟进邮件，写清楚到同事也能照做，再加一份发给客户前要核对的清单。'],
      ],
    },
  },
  marketing: {
    en: {
      name: 'marketing teams', short: 'Marketing', ucName: 'marketing',
      title: 'AI Training for Marketing Teams in Dallas | AI Man Jack',
      description: 'Hands-on AI training for Dallas marketing teams: customer research, competitor research, briefs and content repurposing in your own brand voice. Get a quote by email.',
      h1: 'AI training for marketing teams that keeps your brand voice',
      sub: 'AI can produce a hundred posts by lunch, and most of them will sound like everyone else’s. In a hands-on session your team builds research, briefing and repurposing workflows on its own material, with your approved claims and voice written into the instructions and a person checking every piece before it is published.',
      whyK: 'What changes', whyH: 'What your marketing team can do after the session',
      why: ['Pull themes, quotes and objections out of customer interviews and survey answers, with every theme linked to the words customers used.', 'Build a competitor comparison from competitors’ own pages, with dates and sources.', 'Turn one approved piece, such as a webinar, a case study or a long article, into email, social and web versions without adding new claims.', 'Write campaign briefs and first drafts from your messaging document, so everyone starts from the same positioning.'],
      modK: 'Curriculum', modH: 'What the marketing training covers',
      mods: [['Customer research synthesis', 'Interview transcripts and open-text survey answers grouped into themes, with quotes you can check against the original.'], ['Competitive research', 'A structured comparison from competitors’ own published pages, with dates and sources instead of guesses.'], ['Briefs from a template', 'Campaign briefs filled in from your messaging document and goals, the same structure every time.'], ['Repurposing without drift', 'One approved source turned into channel versions that keep the claims, numbers and tone of the original.'], ['Your voice, written down', 'A voice and claims guide the AI follows, built from your best past work, plus the words you never use.'], ['Review before publishing', 'The fact, claim, tone and permission checks a person runs before anything goes live.']],
      wfH: 'The marketing workflows your team builds',
      chargeH: 'Where a person stays in charge',
      chargeP: 'We agree on these rules with your marketing lead before the session and write them on one page the team keeps.',
      faq: [
        ['Will AI make our content sound generic?', 'It will if it starts from a blank prompt. The session builds instructions from your own best work, a list of approved claims and words you never use, and a review step before publishing. That is what keeps the voice yours.'],
        ['Which AI tools do you cover for marketing?', `The ones your company approves, usually ChatGPT, Claude or Microsoft Copilot; <a href="${toolPath('grok')}">Grok</a> is useful for following what people post on X. We teach the method, so it carries across tools.`],
        ['Can we use customer interviews and survey data?', 'Yes, with names and contact details removed first, and only in tools your company has approved. The workflow keeps a link from every theme back to the quote it came from, so nobody has to trust a summary blindly.'],
        ['What about copyright and AI-generated content?', 'We are not lawyers and do not give legal advice. In the session we keep to work your team can stand behind: drafts built from your own material, claims checked against sources, and a person who edits and approves before publishing. Your counsel sets the policy.'],
        ['Can the training cover SEO and blog content?', 'Yes, as a workflow: research, outline, a first draft from your own sources, and an editing pass for accuracy and voice. We do not promise rankings; the training is about producing accurate, useful pages with less effort.'],
        ['We are a marketing team of two or three. Is it worth it?', 'Often more so, because the same few people do the research, writing and reporting. It can be a single workshop on the two workflows that take most of your week.'],
        ['What does each person leave with?', 'At least one workflow on real material, such as a research summary, a brief or a repurposed piece, with its instructions saved so a colleague can repeat it, and a review checklist for publishing.'],
      ],
    },
    zh: {
      name: '市场团队', short: '市场', ucName: '市场',
      title: '市场团队 AI 培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯市场团队的 AI 实操培训：客户调研、竞品调研、营销简报和内容再利用，保持你们自己的品牌语气。上门或线上，留邮箱获取报价。',
      h1: '市场团队 AI 培训，保住你们的品牌语气',
      sub: 'AI 一上午就能写出一百条帖子，大多数却和别人的没什么两样。实操课上，团队用自己的素材搭建调研、简报和内容再利用的工作流，把批准过的说法和品牌语气写进指令，每条内容发布前都由人检查。',
      whyK: '改变什么', whyH: '课后市场团队能做到的事',
      why: ['从客户访谈和问卷回答里提炼主题、原话和顾虑，每个主题都能追溯到客户的原话。', '根据竞争对手自己的页面做竞品对比，注明日期和来源。', '把一份批准过的内容（网络研讨会、案例、长文）改成邮件、社媒和网页版本，不添加新的说法。', '根据信息框架文档写营销简报和初稿，大家从同一个定位出发。'],
      modK: '课程内容', modH: '市场培训讲什么',
      mods: [['客户调研汇总', '把访谈转录和问卷开放题归纳成主题，附上能对照原文核对的引用。'], ['竞品调研', '根据竞争对手自己公开的页面做结构化对比，写明日期和来源，不靠猜。'], ['用模板写简报', '根据信息框架文档和目标填写营销简报，每次结构一致。'], ['内容再利用不走样', '把一份批准过的素材改成各渠道版本，保留原文的说法、数字和语气。'], ['把品牌语气写下来', '用你们以往最好的作品整理一份 AI 遵循的语气和说法指南，外加绝不使用的词。'], ['发布前的审核', '内容上线前，由人检查事实、说法、语气和授权。']],
      wfH: '市场团队会搭建的工作流',
      chargeH: '由人把关的环节',
      chargeP: '课前我们会和市场负责人约定这些规则，写成一页纸留给团队。',
      faq: [
        ['AI 会让我们的内容变得千篇一律吗？', '如果从空白提示词开始，会。课程用你们自己最好的作品、批准过的说法清单和不用的词来写指令，再加一道发布前的审核。这样语气才是你们自己的。'],
        ['市场培训用哪些 AI 工具？', `用公司批准的工具，通常是 ChatGPT、Claude 或 Microsoft Copilot；<a href="/zh${toolPath('grok')}">Grok</a> 适合追踪 X 上的讨论。我们教的是方法，换工具也能用。`],
        ['可以用客户访谈和问卷数据吗？', '可以，先去掉姓名和联系方式，并且只在公司已批准的工具里使用。工作流会让每个主题都能链接回对应的原话，没人需要盲目相信摘要。'],
        ['AI 生成内容的版权问题怎么办？', '我们不是律师，不提供法律意见。课上我们只做团队站得住脚的工作：基于自有素材的草稿、对照来源核对的说法，以及发布前由人编辑和批准。具体政策由你们的法律顾问决定。'],
        ['培训能涵盖 SEO 和博客内容吗？', '能，作为一条工作流来教：调研、提纲、基于自有资料的初稿，以及核对准确性和语气的编辑。我们不承诺排名；培训的目标是更省力地做出准确、有用的页面。'],
        ['我们市场部只有两三个人，值得吗？', '往往更值得，因为调研、写作和汇报都是同样几个人在做。可以只上一次工作坊，专讲最占时间的两条工作流。'],
        ['每个人能带走什么？', '至少一条基于真实素材的工作流，比如调研摘要、简报或改写的内容，指令存好让同事也能照做，再加一份发布前的审核清单。'],
      ],
    },
  },
  operations: {
    en: {
      name: 'operations teams', short: 'Operations', ucName: 'operations',
      title: 'AI Training for Operations Teams in Dallas | AI Man Jack',
      description: 'Hands-on AI training for Dallas operations and admin teams: meeting notes, SOPs, weekly reports and document summaries, with a human check on each. Get a quote by email.',
      h1: 'AI training for operations teams, on the work that repeats every week',
      sub: 'Operations work is full of tasks with clear inputs and a checkable output: notes, procedures, reports and forms. That makes it the best place to start with AI, and the place where a wrong number costs the most. In a hands-on session each person builds a workflow on a task they repeat, and a check that catches errors before they spread.',
      whyK: 'What changes', whyH: 'What your operations team can do after the session',
      why: ['Turn meeting notes or a transcript into decisions, owners and dates, sent the same day.', 'Draft a standard operating procedure from a recorded walkthrough, then turn it into a checklist and an onboarding guide.', 'Produce the weekly report from the same spreadsheet export, in the same structure, with every number checked.', 'Summarize long internal documents and pull fields from invoices and forms into a table.'],
      modK: 'Curriculum', modH: 'What the operations training covers',
      mods: [['Meetings to action items', 'Decisions, owners and dates from notes or a transcript, with anything unclear flagged instead of guessed.'], ['SOPs from walkthroughs', 'A procedure drafted from a recorded walkthrough or rough notes, then tested step by step by someone who did not write it.'], ['Weekly reports', 'The same report from the same export every week, with a fixed structure and each figure checked against the source.'], ['Documents and forms', 'Summaries of long documents, and fields pulled from invoices and forms into a table, with spot checks.'], ['Approved sources', 'A short inventory of which files and systems the AI may use, so answers come from current documents.'], ['Owner and review', 'One named owner per workflow, a review step, and a two-week check on whether to keep, change or stop it.']],
      wfH: 'The operations workflows your team builds',
      chargeH: 'Where a person stays in charge',
      chargeP: 'We agree on these rules with your operations lead before the session and write them on one page the team keeps.',
      faq: [
        ['Where should an operations team start?', 'With a task that repeats every week, has clear inputs and produces something a person can check: meeting follow-ups, a weekly report or a procedure. We pick it with you before the session.'],
        ['Can AI handle our spreadsheets and numbers?', 'It can summarize, restructure and draft from them, and it can also get a number wrong while sounding certain. Every reporting workflow we build includes a check against the source export before the report goes out.'],
        ['Will this replace our documentation tools?', 'No. The workflows produce drafts that go into the tools you already use, such as a shared drive, wiki or SharePoint. We do not install or configure software.'],
        ['Can we use documents from vendors and contractors?', 'Only what your agreements allow, and only in approved tools. Part of the session is an approved-source inventory: which documents may be used, by whom, and which stay out.'],
        ['Can you help us automate a whole process?', 'The training covers where automation is worth it and where a person stays in the loop. Most teams start with assisted workflows a person runs and checks; a full automation build is a separate project.'],
        ['Is this suitable for admin and office staff?', 'Yes. Office managers and admin teams are often a good first group, because their work is varied and repeats. See also <a href="/blog/ai-training-for-office-managers/">AI training for office managers</a>.'],
        ['What does each person leave with?', 'At least one workflow on a task they repeat, written as a one-page procedure a colleague could follow, with a named owner and a review step.'],
      ],
    },
    zh: {
      name: '运营团队', short: '运营', ucName: '运营',
      title: '运营团队 AI 培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯运营和行政团队的 AI 实操培训：会议纪要、SOP、每周报告和文档摘要，每一项都有人工核对。上门或线上，留邮箱获取报价。',
      h1: '运营团队 AI 培训，从每周重复的工作做起',
      sub: '运营工作里满是输入清楚、结果可核对的任务：纪要、流程、报告、表单。这让它成为最适合开始用 AI 的地方，也是一个数字出错代价最大的地方。实操课上，每个人用一项自己重复做的任务搭建工作流，外加一道在错误扩散之前把它拦下来的检查。',
      whyK: '改变什么', whyH: '课后运营团队能做到的事',
      why: ['把会议笔记或转录整理成决定、负责人和日期，当天发出。', '根据一段录制的操作演示起草 SOP，再转成检查清单和入职指南。', '用同一份导出表格生成每周报告，结构不变，每个数字都核对。', '总结冗长的内部文档，把发票和表单里的字段提取成表格。'],
      modK: '课程内容', modH: '运营培训讲什么',
      mods: [['会议转待办', '从笔记或转录中整理决定、负责人和日期，不确定的地方标出来，而不是猜。'], ['从演示写 SOP', '根据录制的操作演示或零散笔记起草流程，再由没参与写作的人逐步试一遍。'], ['每周报告', '每周用同一份导出生成同一份报告，结构固定，每个数字都对照来源核对。'], ['文档与表单', '长文档摘要，以及把发票和表单字段提取到表格里，并做抽查。'], ['批准的资料来源', '一份简短清单，列出 AI 可以使用哪些文件和系统，让答案来自最新的文档。'], ['负责人与复核', '每条工作流有一位指定负责人、一道复核步骤，两周后检查是保留、调整还是停用。']],
      wfH: '运营团队会搭建的工作流',
      chargeH: '由人把关的环节',
      chargeP: '课前我们会和运营负责人约定这些规则，写成一页纸留给团队。',
      faq: [
        ['运营团队应该从哪里开始？', '从一项每周重复、输入清楚、结果能由人核对的任务开始：会后跟进、每周报告或一份流程文档。课前我们和你一起选。'],
        ['AI 能处理我们的表格和数字吗？', '它能基于表格做汇总、重组和起草，也可能一本正经地算错数字。我们搭建的每条报告类工作流，在报告发出前都包含一道对照原始导出的核对。'],
        ['这会取代我们的文档工具吗？', '不会。工作流产出的是草稿，放进你们已在用的工具里，比如共享盘、Wiki 或 SharePoint。我们不安装或配置软件。'],
        ['供应商和外包方的文档能用吗？', '只能用协议允许的部分，并且只在批准的工具里使用。课程里有一项是整理批准资料清单：哪些文档可以用、谁可以用、哪些不碰。'],
        ['能帮我们把整个流程自动化吗？', '培训会讲哪些地方值得自动化、哪些地方要留人把关。多数团队先从由人运行和核对的辅助工作流开始；完整的自动化开发是另一个项目。'],
        ['适合行政和办公室人员吗？', '适合。办公室主管和行政团队往往是很好的第一批学员，因为他们的工作种类多、又重复。也可以看看<a href="/zh/blog/ai-training-for-office-managers/">行政主管 AI 培训</a>。'],
        ['每个人能带走什么？', '至少一条基于自己重复任务的工作流，写成同事也能照做的一页流程，有指定负责人和复核步骤。'],
      ],
    },
  },
  leadership: {
    en: {
      name: 'leadership teams', short: 'Leadership', ucName: 'leadership',
      title: 'AI Training for Leadership Teams in Dallas | AI Man Jack',
      description: 'AI training for leaders and managers in Dallas: which tasks to start with, approved tools, data rules, sign-off and measuring adoption. Get a quote by email.',
      h1: 'AI training for leadership teams: decide what to adopt, then lead it',
      sub: 'Leaders do not need to write the best prompts in the company. They need to decide which work is worth handing to AI, which tools and data are allowed, who signs off, and how to tell after two weeks whether it is working. This session covers those decisions on your own priorities, and gives each leader workflows of their own.',
      whyK: 'What changes', whyH: 'What your leaders and managers can do after the session',
      why: ['Pick the first use cases with a four-question score instead of a vendor demo.', 'Agree on approved tools and a one-page data boundary the whole company can follow.', 'Name an owner and a sign-off step for every workflow, so AI output never goes out unchecked.', 'Use AI themselves for briefs and document summaries, so the rules they set come from experience.'],
      modK: 'Curriculum', modH: 'What the leadership training covers',
      mods: [['Where AI fits in your business', 'A plain account of what current tools do well and badly, using tasks from your own teams, not demos.'], ['Use-case prioritisation', 'The four-question score applied to a list your managers bring, to pick the first two or three workflows.'], ['Tools and data boundaries', 'An approved tool list and a one-page data boundary: never goes in, check first, fine to use.'], ['Ownership and sign-off', 'Who owns each workflow, who reviews the output, and which decisions stay with people.'], ['Measuring adoption', 'A two-week review per workflow (keep, change or stop) and how to tell real use from early enthusiasm.'], ['Your own workflows', 'Executive briefs and long-document summaries, built on your own material during the session.']],
      wfH: 'Workflows and templates leaders use',
      chargeH: 'Decisions that stay with people',
      chargeP: 'The session ends with these written into a short draft policy your managers can apply the same way.',
      faq: [
        ['Should leaders be trained before their teams?', 'Usually first, or at the same time. Teams adopt faster when the tool list, data rules and sign-off steps are decided first; otherwise every team invents its own. A short leadership session can come before the team workshops.'],
        ['Do we need an AI policy before training?', 'A short one helps, and the session can produce the first version: approved tools, a data boundary and review rules. Our free guide shows what to include: <a href="/blog/ai-policy-for-small-business-employees/">an AI policy for small business employees</a>.'],
        ['How do we measure whether AI training worked?', 'Not with claims about hours saved. We use a two-week review per workflow: is it still used, does the output need fewer corrections, should it continue. The template is free: <a href="/templates/two-week-workflow-review/">Two-Week AI Workflow Review</a>.'],
        ['How do we choose between Copilot, ChatGPT, Claude and Grok?', `Start from the work and the systems you already have. Companies on Microsoft 365 often start with <a href="${toolPath('copilot')}">Copilot</a>; teams with heavy writing and long documents often add <a href="${toolPath('claude')}">Claude</a> or <a href="${toolPath('chatgpt')}">ChatGPT</a>. We compare them on your tasks and data terms; we do not sell licenses or take a cut.`],
        ['Can this be a short session for executives only?', 'Yes. A single session for a leadership team covers prioritisation, tools, data rules and measurement, and ends with a draft plan. Department workshops can follow.'],
        ['What about AI in decisions about people?', 'Performance and hiring judgments about individuals are not delegated to a model, and board reporting keeps its formal review. We help you write those limits down so every manager applies them the same way.'],
        ['What does each leader leave with?', 'A shortlist of first workflows with owners, a draft tool and data policy, a way to measure adoption, and at least one workflow of their own, such as a weekly executive brief.'],
      ],
    },
    zh: {
      name: '管理层', short: '管理层', ucName: '管理层',
      title: '管理层 AI 培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯管理者的 AI 培训：先做哪些任务、批准哪些工具和数据规则、由谁签字，以及如何衡量落地效果。上门或线上，留邮箱获取报价。',
      h1: '管理层 AI 培训：先决定用什么，再带团队落地',
      sub: '管理者不需要成为公司里提示词写得最好的人。他们要决定哪些工作值得交给 AI、允许用哪些工具和数据、由谁签字，以及两周后怎么判断是否有效。这门课围绕你们自己的优先事项讲这些决定，也让每位管理者有自己能用的工作流。',
      whyK: '改变什么', whyH: '课后管理者能做到的事',
      why: ['用四个问题给应用场景打分，选出第一批，而不是看厂商演示做决定。', '定下批准的工具和一页纸的数据边界，全公司都能照着执行。', '为每条工作流指定负责人和签字环节，AI 的输出不会未经检查就发出去。', '自己用 AI 写简报、总结文档，让定下的规则来自亲身经验。'],
      modK: '课程内容', modH: '管理层培训讲什么',
      mods: [['AI 在你们业务里的位置', '用你们团队自己的任务，而不是演示，直白地讲清当前工具擅长和不擅长什么。'], ['应用场景排序', '用四个问题给经理们带来的清单打分，选出最先做的两三条工作流。'], ['工具与数据边界', '批准的工具清单和一页纸数据边界：绝不输入、先确认、可以使用。'], ['负责人与签字', '每条工作流由谁负责、谁复核输出、哪些决定必须留给人。'], ['衡量落地效果', '每条工作流两周一复盘（保留、调整或停用），以及如何区分真正在用和一时热情。'], ['你自己的工作流', '课上用你们自己的资料做管理层简报和长文档摘要。']],
      wfH: '管理者使用的工作流与模板',
      chargeH: '必须留给人的决定',
      chargeP: '课程结束时，这些会写进一份简短的制度草案，让每位经理都按同样的方式执行。',
      faq: [
        ['管理层应该比团队先培训吗？', '通常先培训，或同时进行。先定好工具清单、数据规则和签字环节，团队落地更快；否则每个团队各搞一套。可以在团队工作坊之前安排一次简短的管理层课程。'],
        ['培训前需要先有 AI 制度吗？', `有一份简短的会有帮助，课程也可以产出第一版：批准的工具、数据边界和复核规则。免费指南里写了该包含什么：<a href="/zh/blog/ai-policy-for-small-business-employees/">小企业员工 AI 使用制度</a>。`],
        ['怎么衡量 AI 培训有没有效果？', '不靠「节省了多少小时」的说法。我们对每条工作流做两周复盘：是否还在用、输出需要的修改是否变少、要不要继续。模板免费：<a href="/zh/templates/two-week-workflow-review/">两周 AI 工作流复盘</a>。'],
        ['Copilot、ChatGPT、Claude 和 Grok 怎么选？', `从工作内容和已有系统出发。用 Microsoft 365 的公司通常先从 <a href="/zh${toolPath('copilot')}">Copilot</a> 开始；写作多、长文档多的团队常常再加 <a href="/zh${toolPath('claude')}">Claude</a> 或 <a href="/zh${toolPath('chatgpt')}">ChatGPT</a>。我们用你们的任务和数据条款来比较；我们不卖许可证，也不拿分成。`],
        ['能只给高管上一次短课吗？', '可以。为管理团队上一次课，讲应用场景排序、工具、数据规则和效果衡量，结束时形成一份计划草案。之后可以再安排各部门工作坊。'],
        ['涉及员工的决定能用 AI 吗？', '对个人的绩效和招聘判断不交给模型，面向董事会的汇报保留正式审核。我们帮你把这些边界写下来，让每位经理执行一致。'],
        ['每位管理者能带走什么？', '一份第一批工作流的清单（含负责人）、一份工具与数据制度草案、一套衡量落地的方法，以及至少一条自己的工作流，比如每周管理层简报。'],
      ],
    },
  },
};

const page = (key, lang) => {
  const u = UI[lang], s = SHARED[lang], d = DEPTS[key][lang], zh = lang === 'zh', path = deptPath(key), url = `${SITE}${L(lang, path)}`;
  const uc = loc(useCaseBySlug[key], lang);
  const bc = breadcrumb(lang, [[u.crumb, '/ai-training/'], [zh ? d.name : d.short, path]]);
  const faq = [...d.faq, ...s.faq.map(([q, a]) => [/cost\?|费用是多少？/.test(q) ? u.costQ(d.name) : q, a])];
  const wfs = WF[key].map((slug) => WORKFLOWS.find((w) => w.slug === slug));
  const tpls = TPL[key].map((slug) => loc(TEMPLATES.find((t) => t.slug === slug), lang));
  const others = DEPT_PAGES.filter((k) => k !== key);
  return {
    title: d.title, description: d.description, view: 'department_training_view', bodyClass: 'training-page tool-page dept-page',
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${s.eyebrow}</p><h1 class="brand-hero-title" style="max-width:1080px">${d.h1}</h1><p class="lead" style="max-width:780px">${d.sub}</p>
<div class="cta-row"><a class="btn btn-primary" id="hero-cta" href="#quote" data-event="quote_cta_click" data-pos="${key}-hero">${u.getQuote}</a><a class="btn btn-secondary" href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="${key}-hero">${u.book}</a></div>
<div class="stat-cards" style="margin-top:32px">${s.stats.map(([b, x]) => `<div><b>${b}</b><span>${x}</span></div>`).join('')}</div></div></section>

<section class="sec tight" id="outcomes"><div class="wrap">${head(d.whyK, d.whyH)}<ul class="ticks arrow">${d.why.map((x) => `<li><span>${x}</span></li>`).join('')}</ul></div></section>

<section class="sec tight" id="curriculum"><div class="wrap">${head(d.modK, d.modH)}
<div class="g3">${d.mods.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>

<section class="sec tight" id="workflows"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${u.wfK}</div><h2>${d.wfH}</h2><p class="lead">${u.wfP}</p></div><a class="more" href="${L(lang, `/use-cases/${key}/`)}" data-event="use_case_click" data-pos="${key}-dept">${u.ucMore(d.ucName)}</a></div>
<div class="g3">${wfs.map((w) => workflowCard(w, lang)).join('\n')}</div>
<p style="margin-top:20px;max-width:860px">${u.tplK} ${tpls.map((t) => `<a href="${L(lang, `/templates/${t.slug}/`)}">${t.title}</a>`).join(' · ')}</p></div></section>
${key === 'operations' ? caseProof(lang, { real: true }) : ''}
<section class="sec tight" id="in-charge"><div class="wrap"><div class="big-card oakc"><h2>${d.chargeH}</h2><ul class="ticks bang">${uc.watch.map((x) => `<li><span>${x}</span></li>`).join('')}</ul><p>${d.chargeP}</p></div></div></section>

<section class="sec tight" id="tools"><div class="wrap">${head(u.toolsK, u.toolsH, u.toolsP)}
<div class="g4">${['copilot', 'chatgpt', 'claude', 'grok'].map((k) => `<a class="card" href="${L(lang, toolPath(k))}" style="text-decoration:none;color:inherit"><h3>${u.toolCard(TOOL_NAME[k])}</h3></a>`).join('')}</div></div></section>

${sharedBlocks(lang, key)}

<section class="sec tight" id="other-teams"><div class="wrap">${head(u.otherK, u.otherH)}
<div class="g3">${others.map((k) => `<a class="card" href="${L(lang, deptPath(k))}" style="text-decoration:none;color:inherit"><h3>${DEPTS[k][lang].title.split(/ in Dallas|（达拉斯）/)[0]} →</h3><p>${DEPTS[k][lang].description.split(/[:：]/)[1].split(/\. |。/)[0].trim().replace(/^./, (c) => c.toUpperCase())}</p></a>`).join('')}</div></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${u.faqK}</div><h2 style="font-size:clamp(32px,3.6vw,52px)">${u.faqH(d.name)}</h2></div>
<div class="faq" style="grid-column:6 / span 7">${faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>

${kitForm(lang, `dept-${key}`)}
${quickQuote(lang, { tool: key, path })}`,
    jsonld: [
      BUSINESS_REF, person(),
      { '@type': 'Service', '@id': `${url}#service`, name: d.title.split(' | ')[0], serviceType: u.ldType(d.name), description: d.description, url,
        provider: { '@id': `${SITE}/#business` }, availableLanguage: ['en', 'zh'], areaServed: AREA,
        audience: { '@type': 'BusinessAudience', audienceType: zh ? d.name : d.short + ' teams' } },
      faqPage(faq, `${url}#faq`), bc.ld,
    ],
  };
};

export const pages = DEPT_PAGES.map((k) => ({ path: deptPath(k), priority: 0.8, changefreq: 'monthly', en: page(k, 'en'), zh: page(k, 'zh') }));
