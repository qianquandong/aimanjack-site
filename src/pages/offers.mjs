// Team-format pages (Revenue OS v6, W-001 / W-005, 2026-10-08): /ai-training/team-workshop/ and /ai-training/onsite-texas/.
// Both formats are OWNER-UNAPPROVED for public pricing: no amount appears here, only "Request a scoped quote" (tests/site.test.mjs
// fails on any other $ figure on these pages). /ai-training/ stays the canonical four-session page; there is no duplicate of it.
// JSON-LD: Service + BreadcrumbList + business reference only — no Offer price, no Review / AggregateRating / FAQPage.
// Copy describes a proposed format: the owner reviews agenda, inclusions and group-size wording before production.
import { SITE, BOOK_URL, OFFERS, QUOTE_URL } from '../config.mjs';
import { L } from '../layout.mjs';
import { T } from '../i18n.mjs';
import { breadcrumb } from '../components.mjs';
import { BUSINESS_REF, AREA } from '../schema.mjs';
import { localTrainingProof } from '../training-buyers.mjs';
import { buyerQuestions } from '../training-questions.mjs';

// Quote CTA: carries the format so the form preselects it. The /book/ CTA is the 20-minute workflow call.
export const quoteBtn = (lang, { format, label, pos, cls = 'btn-primary', id = '' }) =>
  `<a class="btn ${cls}"${id ? ` id="${id}"` : ''} href="${L(lang, QUOTE_URL)}?format=${format}" data-event="quote_cta_click" data-pos="${pos}">${label}</a>`;
const bookBtn = (lang, pos) => `<a class="btn btn-secondary" href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="${pos}">${T[lang].cta.book}</a>`;

// Three-path chooser for / and /ai-training/. Deliberately NOT the `.prog` offer card: the four-session program stays the only
// priced offer card on the site; these are navigation cards, and only the program shows a price.
const CHOOSER = {
  en: { k: 'For teams', h: 'Pick a starting point', p: 'Every format is AI training on your team’s real work. Need the workflow built for you instead? See <a href="/ai-workflow-build/">AI workflow builds</a>.',
    cards: [
      ['workshop', '90-minute workshop', 'One live session for one team: test one or two AI workflows on tasks people already do.', 'Scoped quote', 'See the workshop'],
      ['onsite', 'Full-day onsite (Texas)', 'A full day at your office: data safety, department use cases and guided labs on real work.', 'Scoped quote · travel outside Dallas–Fort Worth quoted separately', 'See onsite training'],
      ['program', '4 × 90-min program', 'Four live sessions built around the work you already do, one workflow at a time.', 'Priced by quote', 'See the program'],
    ] },
  zh: { k: '团队培训', h: '选一个起点', p: '每种形式都是围绕团队真实工作的 AI 培训。想让我们直接把工作流搭好？请看 <a href="/zh/ai-workflow-build/">AI 工作流搭建</a>。',
    cards: [
      ['workshop', '90 分钟团队工作坊', '一个团队、一次实时课程：用大家手头的真实任务，测试一到两条 AI 工作流。', '按需报价', '了解工作坊'],
      ['onsite', '全天上门培训（德州）', '到贵公司现场一整天：数据安全、各部门应用场景，以及围绕真实工作的实操练习。', '按需报价 · 达拉斯—沃斯堡以外差旅另计', '了解上门培训'],
      ['program', '4 × 90 分钟课程项目', '四节实时课程，围绕你已经在做的工作，一次落地一条工作流。', '按需报价', '查看课程项目'],
    ] },
};
export function chooser(lang, { pos, programHref }) {
  const c = CHOOSER[lang];
  const to = { workshop: L(lang, OFFERS.workshop.path), onsite: L(lang, OFFERS.onsite.path), program: programHref || L(lang, '/ai-training/') + '#formats' };
  return `<section class="sec tight" id="team-paths"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${c.k}</div><h2>${c.h}</h2><p class="lead">${c.p}</p></div></div>
<div class="chooser">${c.cards.map(([key, h, p, price, go]) => `<a class="choose" href="${to[key]}" data-event="${key === 'program' ? 'training_program_click' : 'offer_path_click'}" data-pos="${pos}-${key}"><h3>${h}</h3><p>${p}</p><span class="price">${price}</span><span class="go">${go} →</span></a>`).join('')}</div></div></section>`;
}

const PROG = (lang) => `${L(lang, '/ai-training/')}#formats`;

const C = {
  workshop: {
    en: {
      title: '90-Minute AI Workshop for Teams | Scoped Quote | AI Man Jack',
      description: 'A 90-minute, hands-on AI workshop for one team: choose one or two real workflows, test them with your approved AI tools and leave with a review checklist. Remote or Dallas–Fort Worth onsite. Priced by scoped quote.',
      crumb: '90-minute workshop', eyebrow: 'Team workshop · 90 minutes · Remote or Dallas–Fort Worth onsite · English or Chinese',
      h1: 'A 90-minute AI workshop for your team',
      sub: 'One live session on real work. Your team picks one or two tasks it already repeats, we build and test AI workflows for them with the tools your company has approved, and you decide what is worth keeping. This is AI training, not a custom ERP or CRM build.',
      quote: 'Request a scoped quote',
      forK: 'Who it’s for', forH: 'Teams that want one practical session before committing to more',
      for: ['Non-technical teams that repeat a lot of knowledge work: sales, operations, marketing, admin, customer service', 'Managers who want a first, low-commitment test before a longer program', 'Companies that have approved AI tools (ChatGPT, Claude, Gemini, Copilot) or are deciding which one to use'],
      notForH: 'Not the right fit', notFor: ['Individuals looking for a course or a certificate', 'Companies that want a system or automation built for them'],
      agendaK: 'Agenda', agendaH: 'What happens in the 90 minutes',
      agenda: [['Data rules first', 'Which AI tools are approved, which information stays out, and where a person must sign off before an output is used.'], ['Choose the tasks', 'Each person lists tasks they repeat every week and scores them: frequent enough to matter, clear input and output, quick to check, safe to practise without sensitive data.'], ['Build and test one or two workflows', 'We turn the strongest one or two tasks into written AI workflows and run them on synthetic or approved sample material.'], ['Check the output', 'At least one result is deliberately flawed. Finding it is how the team learns what to review before anything goes out.'], ['Decide what happens next', 'Keep, change or stop each workflow, who owns it, and whether a longer program is worth it. There is no obligation to continue.']],
      outK: 'Outcomes', outH: 'What your team leaves with',
      out: ['One or two AI workflows tested on tasks the team already does', 'A short checklist for reviewing AI output before it is used', 'Written answers on approved tools, off-limits information and sign-off', 'A recommendation on whether further training makes sense, and in what form'],
      incH: 'Included', inc: ['A 90-minute live session, remote or onsite in Dallas–Fort Worth', 'Agreeing the practice tasks in advance, by email or on the 20-minute workflow call', 'Workflow instructions and prompts written during the session', 'The review checklist and data-boundary notes, in English or Chinese'],
      excH: 'Not included', exc: ['Building or integrating software; that is a separate <a href="/ai-workflow-build/">workflow build</a>', 'AI tool licences or accounts', 'Support after the session, unless it is scoped separately', 'Travel outside Dallas–Fort Worth, which is quoted separately'],
      prepK: 'Preparation and data safety', prepH: 'Practise safely, on tools you are allowed to use',
      prep: ['We use only the AI tools your company has approved. If none are approved yet, we agree on one before the session.', 'Exercises use synthetic or redacted material. No customer personal data, passwords or confidential documents go into a tool during the workshop.', 'Each attendee brings two or three tasks they repeat every week; no slides or homework are needed.', 'Every attendee needs a laptop with access to the approved tool.'],
      fmtK: 'Format and location', fmtH: 'How and where it runs',
      fmt: [['Length', '90 minutes, live'], ['Delivery', 'Remote by video anywhere in the U.S., or onsite in Dallas–Fort Worth'], ['Elsewhere in Texas', 'On request; travel is quoted separately'], ['Language', 'English or Chinese'], ['Group size', 'Agreed in the quote, so the trainer can check each person’s workflow']],
      priceK: 'Pricing', priceH: 'Scoped quote',
      priceP: 'Pricing depends on team size, location and preparation. Send the quote request or book a 20-minute workflow call; you receive a written scope and price before anything is agreed.',
      priceNote: `We do not publish prices: every format, including the <a href="${PROG('en')}">four-session program</a>, is quoted in writing for your team.`,
      faqK: 'Common questions', faqH: 'About the workshop',
      faq: [['Is this a software or automation build?', 'No. It is AI training. Your team learns to use approved AI tools on its own tasks. In the workshop we work on the parts around your ERP, CRM or other systems — preparing notes, drafting updates, checking exports — not on the systems themselves. If a task needs a workflow built into those systems, that is a separate <a href="/ai-workflow-build/">AI workflow build</a>, scoped and quoted on its own.'], ['How many people can attend?', 'It is agreed in the quote. The session is hands-on, so the trainer needs to see each person’s workflow; a larger group can be split into two sessions.'], ['Which AI tools do you use?', 'The ones your company has already approved — for example ChatGPT, Claude, Gemini or Microsoft Copilot. The method works the same across tools.'], ['Can the workshop lead into the four-session program?', `Yes, if the workshop shows the team would benefit from more. The <a href="${PROG('en')}">four-session program</a> is quoted the same way and continues on the same kind of real tasks. There is no obligation.`], ['Why is there no price on this page?', 'Because the price depends on how many people attend, where the session runs and how much preparation the tasks need. You get a written quote for your team instead of a number that may not fit.']],
      ctaH: 'Plan your team’s workshop', ctaP: 'Tell us about the team and the work, or talk it through on a 20-minute workflow call first.',
      ld: { name: '90-Minute AI Team Workshop', desc: 'A 90-minute, hands-on AI training session for one team, built on one or two of the team’s real workflows, using company-approved AI tools and synthetic or approved data. Remote or onsite in Dallas–Fort Worth. AI training, not software implementation. Priced by scoped quote.' },
    },
    zh: {
      title: '90 分钟团队 AI 工作坊 | 按需报价 | AI Man Jack',
      description: '为一个团队安排的 90 分钟 AI 实操工作坊：挑选一到两项真实工作任务，用公司已批准的 AI 工具搭建并测试工作流，带走一份核验清单。远程或达拉斯—沃斯堡上门，按需报价。',
      crumb: '90 分钟工作坊', eyebrow: '团队工作坊 · 90 分钟 · 远程或达拉斯—沃斯堡上门 · 中英文授课',
      h1: '为你的团队安排一场<br>90 分钟 AI 工作坊',
      sub: '一次实时课程，只做真实工作。团队挑出一到两项每周都在重复的任务，我们用公司已批准的工具为它们搭建并测试 AI 工作流，再一起决定哪些值得保留。这是 AI 培训，不是 ERP 或 CRM 定制开发。',
      quote: '申请报价',
      forK: '适合谁', forH: '想先上一次实用课程、再决定是否继续的团队',
      for: ['以非技术岗位为主、有大量重复性知识工作的团队：销售、运营、市场、行政、客服', '想先小范围试一次、再考虑长期项目的管理者', '已经批准了 AI 工具（ChatGPT、Claude、Gemini、Copilot 等），或正在决定用哪一个的公司'],
      notForH: '不太适合', notFor: ['想自己报班学习或考证的个人', '希望我们直接为其开发系统或自动化的公司'],
      agendaK: '课程安排', agendaH: '90 分钟里做什么',
      agenda: [['先定数据规则', '哪些 AI 工具已获批准、哪些信息不能输入、哪些输出必须由人签字确认后才能使用。'], ['挑选任务', '每个人列出每周重复的工作，按四个标准打分：频率够不够高、输入输出是否清楚、能否快速核验、能否在不涉及敏感信息的情况下练习。'], ['搭建并测试一到两条工作流', '把得分最高的一两项任务写成 AI 工作流，用模拟数据或已批准的样例材料实际跑一遍。'], ['核验输出', '至少有一个结果刻意设置了错误。找出它，团队就知道东西发出去之前该检查什么。'], ['决定下一步', '每条工作流是保留、调整还是停止，由谁负责，以及是否值得安排更长的项目。没有续约义务。']],
      outK: '成果', outH: '团队带走什么',
      out: ['一到两条基于团队现有任务、已经测试过的 AI 工作流', '一份简短的核验清单，用于在使用前检查 AI 输出', '关于已批准工具、禁止输入的信息和签字环节的书面说明', '一份建议：是否需要进一步培训，以及适合哪种形式'],
      incH: '包含', inc: ['一次 90 分钟实时课程，远程或在达拉斯—沃斯堡上门', '课前通过邮件或 20 分钟工作流咨询确定练习任务', '课上写好的工作流说明与提示词', '核验清单与数据边界说明，中英文皆可'],
      excH: '不包含', exc: ['软件开发或系统对接，这属于单独的<a href="/zh/ai-workflow-build/">工作流搭建</a>', 'AI 工具的许可证或账号', '课后支持（如有需要，另行确定范围）', '达拉斯—沃斯堡以外的差旅，另行报价'],
      prepK: '课前准备与数据安全', prepH: '在允许使用的工具上安全地练习',
      prep: ['只使用贵公司已批准的 AI 工具；如果还没有批准任何工具，课前先商定一个。', '练习使用模拟或脱敏材料。工作坊期间，客户个人信息、密码和保密文件一律不输入任何工具。', '每位学员带上两三项每周重复的任务即可，不需要准备幻灯片或作业。', '每位学员需要一台能访问已批准工具的笔记本电脑。'],
      fmtK: '形式与地点', fmtH: '怎么上、在哪里上',
      fmt: [['时长', '90 分钟，实时授课'], ['授课方式', '全美远程视频授课，或在达拉斯—沃斯堡上门'], ['德州其他城市', '可按需安排，差旅另行报价'], ['语言', '中文或英文'], ['人数', '在报价中确定，确保讲师能逐一检查每个人的工作流']],
      priceK: '价格', priceH: '按需报价',
      priceP: '价格取决于团队人数、授课地点和准备工作量。提交报价申请，或预约 20 分钟工作流咨询；在确认任何安排之前，你都会先收到书面的服务范围和报价。',
      priceNote: `本站不公开标价：包括<a href="${PROG('zh')}">四次课程项目</a>在内，每种形式都按团队书面报价。影响团队培训价格的因素，见<a href="/zh/ai-peixun-shi/">《AI 培训学费一般是多少》</a>。`,
      faqK: '常见问题', faqH: '关于工作坊',
      faq: [['这是软件或自动化开发项目吗？', '不是，这是 AI 培训。团队学的是用已批准的 AI 工具处理自己的任务。工作坊处理的是 ERP、CRM 等系统之外的那部分工作，比如整理记录、起草更新、核对导出的数据，而不是系统本身。如果某项任务需要把工作流搭进这些系统，那是单独的<a href="/zh/ai-workflow-build/">AI 工作流搭建</a>项目，另行确定范围和报价。'], ['可以有多少人参加？', '人数在报价中确定。工作坊以实操为主，讲师需要看到每个人的工作流；人多的话可以拆成两场。'], ['用哪些 AI 工具？', '贵公司已批准的工具，例如 ChatGPT、Claude、Gemini 或 Microsoft Copilot。方法在各种工具上通用。'], ['工作坊之后可以接着上四次课程项目吗？', `可以，前提是工作坊证明团队确实需要更多培训。<a href="${PROG('zh')}">四次课程项目</a>同样按团队报价，继续围绕同类真实任务展开，没有续约义务。`], ['为什么这一页没有标价？', '因为价格取决于参加人数、授课地点和任务所需的准备工作量。与其给一个未必合适的数字，不如为你的团队出一份书面报价。']],
      ctaH: '规划团队的工作坊', ctaP: '告诉我们团队和工作的情况，或先预约一次 20 分钟工作流咨询聊一聊。',
      ld: { name: '90 分钟团队 AI 工作坊', desc: '为一个团队安排的 90 分钟 AI 实操培训，围绕团队的一到两项真实工作流，使用公司已批准的 AI 工具和模拟或已批准的数据。远程或达拉斯—沃斯堡上门。属于 AI 培训，不是软件实施。按需报价。' },
    },
  },
  onsite: {
    en: {
      // 2026-10-13: this page owns the full-day FORMAT; /ai-training/dallas/ owns the PLACE. Keep "Dallas–Fort Worth" out of the title and H1.
      title: 'Full-Day Onsite AI Training at Your Office | Texas | AI Man Jack',
      description: 'One full day of hands-on AI training at your office: fundamentals, data safety, department use cases and guided labs on real work. Onsite in Dallas–Fort Worth; elsewhere in Texas with travel quoted separately. Priced by scoped quote.',
      crumb: 'Full-day onsite', eyebrow: 'Onsite training · One full day · Dallas–Fort Worth, elsewhere in Texas on request · English or Chinese',
      h1: 'A full day of onsite AI training at your office',
      sub: 'One day at your office, built around the work your team already does: AI fundamentals, safe use of company data, use cases by department and guided labs, ending with a plan for what comes next. This is AI training, not a custom ERP or CRM build.',
      quote: 'Request onsite quote',
      forK: 'Who it’s for', forH: 'Companies that want a whole team trained on the same day',
      for: ['Companies that want a whole team, or several departments, trained on the same day', 'Leaders who want shared rules on approved tools, data and review before people use AI on real work', 'Teams in Dallas–Fort Worth, or elsewhere in Texas when travel is agreed in advance', 'Non-technical staff: no coding is required'],
      notForH: 'Not the right fit', notFor: ['Individuals looking for a course or a certificate', 'Companies that want a workflow built rather than taught: see <a href="/ai-workflow-build/">workflow builds</a>'],
      agendaK: 'Agenda', agendaH: 'How the day runs',
      agenda: [['AI fundamentals', 'What current AI tools do well, where they fail, and how a prompt becomes a work instruction.'], ['Safe use of company data', 'Approved tools, information that must stay out, and where a person signs off — written down for your company before the labs start.'], ['Use cases by department', 'Each department lists and scores the tasks it repeats, and picks the ones worth testing.'], ['Guided labs', 'Attendees build and test workflows on their own tasks with synthetic or approved material, and the trainer checks each one.'], ['AI around your existing CRM and ERP processes', 'How to use AI for the work around those systems — notes, summaries, drafts, checking exports — without integrating or changing the systems.'], ['Next-step plan', 'Which workflows to keep, change or stop, who owns each one, and how to check them two weeks later.']],
      agendaNote: 'The day includes breaks. The exact schedule is agreed in the quote.',
      outK: 'Outcomes', outH: 'What your company leaves with',
      out: ['Each attendee has tried at least one workflow on their own work', 'Written company rules on approved tools, off-limits data and sign-off', 'A ranked list of use cases for each department', 'A next-step plan with an owner for each workflow'],
      incH: 'Included', inc: ['One onsite training day, breaks included', 'Preparation from your team’s task list before the day', 'Materials, workflow instructions and review checklists in English or Chinese', 'The written data rules and next-step plan from the day'],
      excH: 'Not included', exc: ['System integration or custom software; that is a separate <a href="/ai-workflow-build/">workflow build</a>', 'AI tool licences or accounts', 'Travel and lodging outside Dallas–Fort Worth, quoted separately', 'Support after the day, unless it is scoped separately'],
      prepK: 'Preparation and data safety', prepH: 'Real work, safe material, approved tools',
      prep: ['We use only AI tools your company has approved; if none are approved yet, we agree on one before the day.', 'Labs use synthetic or redacted material. No customer personal data, credentials or confidential documents go into a tool during training.', 'We need a room with a screen or projector and reliable Wi-Fi, and every attendee needs a laptop with access to the approved tool.', 'Before the day, attendees send two or three tasks they repeat every week, so the labs use real work.'],
      fmtK: 'Format and location', fmtH: 'Where the day can run',
      fmt: [['Length', 'One full day, breaks included'], ['Dallas–Fort Worth', 'Onsite at your office — Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington and everywhere between. <a href="/ai-training/dallas/">The sessions we have run in Dallas–Fort Worth →</a>'], ['Elsewhere in Texas', 'On request — for example Austin, Houston, San Antonio or Odessa. Travel and lodging are quoted separately; there is no flat price outside Dallas–Fort Worth'], ['Language', 'English or Chinese'], ['Group size', 'Agreed in the quote, based on the room and how many people the trainer can check during the labs']],
      priceK: 'Pricing', priceH: 'Scoped quote',
      priceP: 'Pricing depends on team size, location and preparation. Travel outside Dallas–Fort Worth is quoted separately. Send the onsite quote request or book a 20-minute workflow call to receive a written scope and price.',
      priceNote: `We do not publish prices: every format, including the <a href="${PROG('en')}">four-session program</a>, is quoted in writing for your team.`,
      faqK: 'Common questions', faqH: 'About onsite training',
      faq: [['Do you set up AI inside our CRM or ERP?', `Not during the training day. This is AI training, not a custom ERP or CRM build: we teach people to use approved AI tools for the work around those systems. If you want a workflow set up inside them, that is a separate <a href="/ai-workflow-build/">AI workflow build</a>, scoped and quoted on its own.`], ['Can you come to Odessa or another Texas city?', 'Yes, on request. Travel and lodging are quoted separately for any location outside Dallas–Fort Worth, so there is no flat price for those days.'], ['Can the day be split across departments?', 'Yes. The use-case and lab blocks can be grouped by department; the data-safety block is shared, so everyone works to the same rules.'], ['What do we need to provide?', 'A room with a screen and Wi-Fi, a laptop for each attendee with the approved AI tool, and two or three real tasks from each person before the day.'], ['Is there a remote option?', `Yes. The <a href="${L('en', OFFERS.workshop.path)}">90-minute team workshop</a> and the <a href="${PROG('en')}">four-session program</a> can both run remotely.`]],
      ctaH: 'Plan an onsite day', ctaP: 'Tell us where, how many people and which teams, or talk it through on a 20-minute workflow call first.',
      ld: { name: 'Full-Day Onsite AI Training (Texas)', desc: 'One full day of onsite, hands-on AI training: fundamentals, approved-data safety, department use cases, guided labs and a next-step plan. Onsite in Dallas–Fort Worth; elsewhere in Texas on request with travel quoted separately. AI training, not CRM or ERP implementation. Priced by scoped quote.' },
    },
    zh: {
      title: '全天上门 AI 培训 | 到贵公司现场的实操课 | AI Man Jack',
      description: '到贵公司现场一整天的 AI 实操培训：AI 基础、数据安全、各部门应用场景，以及围绕真实工作的实操练习。达拉斯—沃斯堡上门；德州其他城市可安排，差旅另行报价。按需报价。',
      crumb: '全天上门培训', eyebrow: '上门培训 · 全天 · 达拉斯—沃斯堡，德州其他城市可按需安排 · 中英文授课',
      h1: '到贵公司现场的<br>全天 AI 培训',
      sub: '在贵公司现场安排一整天，围绕团队已经在做的工作展开：AI 基础、公司数据的安全使用、各部门的应用场景和实操练习，最后形成下一步计划。这是 AI 培训，不是 ERP 或 CRM 定制开发。',
      quote: '申请上门培训报价',
      forK: '适合谁', forH: '希望全员在同一天完成培训的公司',
      for: ['希望整个团队或几个部门在同一天接受培训的公司', '希望在员工把 AI 用到真实工作之前，先统一工具、数据和审核规则的管理者', '达拉斯—沃斯堡地区的团队，或提前商定好差旅的德州其他城市团队', '非技术岗位员工，无需编程基础'],
      notForH: '不太适合', notFor: ['想报班学习或考证的个人', '想让我们直接搭好工作流、而不是学怎么做的公司：请看<a href="/zh/ai-workflow-build/">工作流搭建</a>'],
      agendaK: '课程安排', agendaH: '这一天怎么安排',
      agenda: [['AI 基础', '当前的 AI 工具擅长什么、在哪里会出错，以及提示词如何变成一份工作指令。'], ['公司数据的安全使用', '已批准的工具、不得输入的信息、需要人工签字的环节——在实操开始前，先为贵公司写成书面规则。'], ['各部门的应用场景', '每个部门列出并评估自己的重复性任务，选出值得测试的几项。'], ['实操练习', '学员用模拟或已批准的材料，围绕自己的任务搭建并测试工作流，讲师逐一检查。'], ['在现有 CRM 和 ERP 流程中使用 AI', '如何把 AI 用在这些系统周边的工作上——记录、摘要、草稿、核对导出数据——而不对系统本身做对接或改动。'], ['下一步计划', '哪些工作流保留、调整或停止，每条由谁负责，以及两周后如何复盘。']],
      agendaNote: '全天包含休息时间，具体日程在报价中确定。',
      outK: '成果', outH: '公司带走什么',
      out: ['每位学员都在自己的工作上试过至少一条工作流', '关于已批准工具、禁止输入的数据和签字环节的书面公司规则', '按部门排序的应用场景清单', '一份每条工作流都有负责人的下一步计划'],
      incH: '包含', inc: ['一天现场培训，含休息时间', '根据团队的任务清单提前准备', '中英文的课程材料、工作流说明和核验清单', '当天形成的书面数据规则与下一步计划'],
      excH: '不包含', exc: ['系统对接或定制软件开发，这属于单独的<a href="/zh/ai-workflow-build/">工作流搭建</a>', 'AI 工具的许可证或账号', '达拉斯—沃斯堡以外的差旅和住宿，另行报价', '培训后的支持（如有需要，另行确定范围）'],
      prepK: '课前准备与数据安全', prepH: '真实工作、安全材料、已批准的工具',
      prep: ['只使用贵公司已批准的 AI 工具；如果还没有批准任何工具，培训前先商定一个。', '实操使用模拟或脱敏材料。培训期间，客户个人信息、账号密码和保密文件一律不输入任何工具。', '需要一间有投影或大屏幕、Wi-Fi 稳定的会议室；每位学员需要一台能访问已批准工具的笔记本电脑。', '培训前，每位学员提交两三项每周重复的任务，让练习用上真实工作。'],
      fmtK: '形式与地点', fmtH: '可以在哪里上',
      fmt: [['时长', '一整天，含休息时间'], ['达拉斯—沃斯堡', '到贵公司现场授课：Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及周边。<a href="/zh/ai-training/dallas/">我们在达拉斯—沃斯堡办过的活动 →</a>'], ['德州其他城市', '可按需安排，例如 Austin、Houston、San Antonio 或 Odessa。差旅和住宿另行报价，达拉斯—沃斯堡以外没有固定价格'], ['语言', '中文或英文'], ['人数', '在报价中确定，取决于场地以及讲师在实操环节能照顾到的人数']],
      priceK: '价格', priceH: '按需报价',
      priceP: '价格取决于团队人数、授课地点和准备工作量，达拉斯—沃斯堡以外的差旅另行报价。提交上门培训报价申请，或预约 20 分钟工作流咨询，即可获得书面的服务范围和报价。',
      priceNote: `本站不公开标价：包括<a href="${PROG('zh')}">四次课程项目</a>在内，每种形式都按团队书面报价。影响团队培训价格的因素，见<a href="/zh/ai-peixun-shi/">《AI 培训学费一般是多少》</a>。`,
      faqK: '常见问题', faqH: '关于上门培训',
      faq: [['你们会在我们的 CRM 或 ERP 里部署 AI 吗？', '培训当天不会。这是 AI 培训，不是 ERP 或 CRM 定制开发：我们教员工把已批准的 AI 工具用在这些系统周边的工作上。如果需要把工作流搭进这些系统，那是单独的<a href="/zh/ai-workflow-build/">AI 工作流搭建</a>项目，另行确定范围和报价。'], ['可以到 Odessa 或德州其他城市上门吗？', '可以，按需安排。达拉斯—沃斯堡以外的地点，差旅和住宿都另行报价，因此没有固定价格。'], ['一天的培训可以按部门分开吗？', '可以。应用场景和实操环节可以按部门分组；数据安全部分大家一起上，确保所有人遵守同一套规则。'], ['我们需要准备什么？', '一间有屏幕和 Wi-Fi 的会议室，每位学员一台能使用已批准 AI 工具的笔记本电脑，以及每人在培训前提交的两三项真实任务。'], ['有远程的选择吗？', `有。<a href="${L('zh', OFFERS.workshop.path)}">90 分钟团队工作坊</a>和<a href="${PROG('zh')}">四次课程项目</a>都可以远程进行。`]],
      ctaH: '规划一天上门培训', ctaP: '告诉我们地点、人数和涉及的团队，或先预约一次 20 分钟工作流咨询聊一聊。',
      ld: { name: '德州全天上门 AI 培训', desc: '一整天的现场 AI 实操培训：AI 基础、数据安全、各部门应用场景、实操练习和下一步计划。达拉斯—沃斯堡上门；德州其他城市可按需安排，差旅另行报价。属于 AI 培训，不是 CRM 或 ERP 实施。按需报价。' },
    },
  },
};

const DFW = AREA[0]; // Define the area on each offer page, not an unresolved @id alone.
const TEXAS = { '@type': 'State', name: 'Texas', containedInPlace: { '@type': 'Country', name: 'United States' } };

const page = (key, lang) => {
  const o = OFFERS[key], c = C[key][lang], url = `${SITE}${L(lang, o.path)}`;
  const bc = breadcrumb(lang, [[T[lang].nav.training, '/ai-training/'], [c.crumb, o.path]]);
  const head = (k, h, p) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div></div>`;
  const ticks = (items, cls = '') => `<ul class="ticks${cls}">${items.map((x) => `<li><span>${x}</span></li>`).join('')}</ul>`;
  const ctas = (pos, first) => `<div class="cta-row">${quoteBtn(lang, { format: o.format, label: c.quote, pos, id: first ? 'hero-cta' : '' })}${bookBtn(lang, pos)}</div>`;
  return {
    title: c.title, description: c.description, offer: o.id, bodyClass: 'offer-page',   // body data-offer → GA4 view_offer {offer_id}
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${c.eyebrow}</p><h1 class="brand-hero-title">${c.h1}</h1><p class="lead" style="max-width:760px">${c.sub}</p>${ctas(`${key}-hero`, true)}</div></section>

${key === 'onsite' ? localTrainingProof(lang) : ''}
<section class="sec tight" id="who"><div class="wrap">${head(c.forK, c.forH)}
<div class="g2"><div class="oak">${ticks(c.for)}</div><div class="oak"><h3>${c.notForH}</h3>${ticks(c.notFor, ' x')}</div></div></div></section>

<section class="sec tight" id="agenda"><div class="wrap">${head(c.agendaK, c.agendaH, c.agendaNote)}
<ol class="nums">${c.agenda.map(([h, p], i) => `<li><span class="n">${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div></section>

<section class="sec tight" id="outcomes"><div class="wrap">${head(c.outK, c.outH)}
<div class="g2"><div class="oak">${ticks(c.out)}</div><div class="oak"><h3>${c.incH}</h3>${ticks(c.inc)}<h3>${c.excH}</h3>${ticks(c.exc, ' x')}</div></div></div></section>

<section class="sec tight" id="preparation"><div class="wrap">${head(c.prepK, c.prepH)}${ticks(c.prep, ' arrow')}</div></section>

<section class="sec tight" id="format"><div class="wrap g2" style="gap:24px"><div class="big-card"><h2>${c.fmtH}</h2><dl class="kv">${c.fmt.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>
<div class="big-card oakc" id="pricing"><div class="eyebrow">${c.priceK}</div><h2>${c.priceH}</h2><p>${c.priceP}</p><p>${c.priceNote}</p>${ctas(`${key}-pricing`, false)}</div></div></section>

<section class="sec tight" id="faq"><div class="wrap">${head(c.faqK, c.faqH)}
<div class="faq">${[...c.faq, ...buyerQuestions(lang, key)].map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>

<section class="sec tight" id="start"><div class="wrap"><div class="big-card oakc"><h2>${c.ctaH}</h2><p>${c.ctaP}</p>${ctas(`${key}-final`, false)}</div></div></section>`,
    jsonld: [
      { '@type': 'Service', '@id': `${url}#service`, name: c.ld.name, serviceType: lang === 'zh' ? '企业 AI 培训' : 'Corporate AI training', description: c.ld.desc, url,
        provider: { '@id': `${SITE}/#business` }, availableLanguage: ['en', 'zh'], areaServed: key === 'onsite' ? [DFW, TEXAS] : [DFW, { '@type': 'Country', name: 'United States' }] },
      BUSINESS_REF, bc.ld,
    ],
  };
};

export const pages = ['workshop', 'onsite'].map((key) => ({ path: OFFERS[key].path, priority: 0.8, en: page(key, 'en'), zh: page(key, 'zh') }));
