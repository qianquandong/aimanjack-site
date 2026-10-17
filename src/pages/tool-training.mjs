// Tool-specific team training pages (2026-10-17): /ai-training/copilot/, /chatgpt/, /claude/, /grok/.
// Why: buyers search by tool ("Copilot training Dallas", "ChatGPT training for employees Dallas") and the 2026-10-16 rank check had
// us outside the top 30 for those; real inquiries name the tool (Housing Forward: Copilot + Claude; a McKinney retreat: Claude Skills).
// Jack's rules for these pages: answer every buyer question in the FAQ, print NO price anywhere (not even the program price, and no
// Offer/price in JSON-LD — so BUSINESS_REF, not business()), and end with the short quote form (src/quick-quote.mjs).
// Vendor facts are kept to what each vendor's own page says; data terms always point to the vendor's page and "your plan".
import { SITE, GBP_URL, PROOF, OFFERS, BOOK_URL } from '../config.mjs';
import { L } from '../layout.mjs';
import { breadcrumb, BUSINESS_REF } from '../components.mjs';
import { person, faqPage, AREA } from '../schema.mjs';
import { EVENT_STATS } from '../content/events.mjs';
import { REVIEWS } from './dallas.mjs';
import { quickQuote } from '../quick-quote.mjs';

export const TOOL_PAGES = ['copilot', 'chatgpt', 'claude', 'grok'];
const pathOf = (k) => `/ai-training/${k}/`;
const NAME = { copilot: 'Microsoft Copilot', chatgpt: 'ChatGPT', claude: 'Claude', grok: 'Grok' };

// Shared copy: formats (no prices), local block, proof, FAQs that apply to every tool.
const SHARED = {
  en: {
    crumb: 'AI training', getQuote: 'Get a quote', book: 'Book a 20-minute call',
    eyebrow: 'Dallas–Fort Worth onsite · Live online across the U.S. · English or Chinese',
    stats: [[String(EVENT_STATS.hosted), 'community AI sessions hosted in Dallas–Fort Worth in 2026'], [String(EVENT_STATS.registrations), 'people signed up for those sessions'], [`${PROOF.rating} ★`, `<a href="${GBP_URL}" target="_blank" rel="noopener">${PROOF.reviews} Google reviews ↗</a>`]],
    formatsK: 'Formats', formatsH: 'Three ways to run it', formatsP: 'Every format is hands-on and built around your team’s own tasks. Each is quoted for your group; tell us your headcount in the form below.',
    formats: [['90-minute team workshop', 'One live session for one team on one or two real workflows. Onsite in Dallas–Fort Worth or online.', OFFERS.workshop.path], ['Full-day onsite training', 'A day at your office: fundamentals, data rules, department use cases and guided labs.', OFFERS.onsite.path], ['Four-session program', `Four live 90-minute sessions over a few weeks, one workflow at a time, with a two-week check-in at the end.`, '/ai-training/']],
    byQuote: 'Priced by quote', see: 'See the format',
    localK: 'Local', localH: 'Taught in Dallas–Fort Worth by the person who runs the sessions',
    localP: `Jack Qian lives in the Dallas area and teaches every session himself: onsite at your office in Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Irving, Arlington and the cities between, or live online anywhere in the U.S. He also runs free community AI sessions in Dallas and Plano; see the dates, venues and photos on the <a href="/ai-training/dallas/">corporate AI training in Dallas–Fort Worth</a> page.`,
    revK: 'Reviewed on Google', revH: 'What attendees say', revMore: `Read all ${PROOF.reviews} on Google →`,
    otherK: 'Other tools', otherH: 'Training for the other AI tools teams use',
    faqK: 'Questions', faqH: (t) => `${t} training, answered`,
    faq: [
      ['How much does it cost?', 'It depends on how many people attend, the format and how much preparation your workflows need, so each team gets its own quote. Use the short form at the bottom of this page: your name, email, headcount and, if you have one, a budget range. Jack replies by email with a recommended format and a written price. Nothing is agreed until you confirm it in writing.'],
      ['Do you come onsite in Dallas–Fort Worth?', 'Yes. Onsite sessions run at your office anywhere in the metroplex: Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Irving, Arlington and the cities between. Elsewhere in Texas is available on request, with travel quoted separately. Live online sessions work for teams anywhere in the U.S.'],
      ['How many people can attend?', 'It is agreed in the quote. Every format is hands-on, so Jack needs to see each person’s work; larger groups are split into two sessions or run as a full day with department blocks.'],
      ['Is it taught in English or Chinese?', 'Either. Sessions run in whichever language the room works in, and the materials come in both.'],
      ['Do people get a certificate?', 'No. The outcome is a working workflow on a task each person already does, plus a checklist for checking the output. Two weeks after a program ends, Jack checks which workflows were kept, changed or stopped.'],
    ],
    ldType: (t) => `${t} training for business teams`,
  },
  zh: {
    crumb: 'AI 培训', getQuote: '获取报价', book: '预约 20 分钟通话',
    eyebrow: '达拉斯—沃斯堡上门 · 全美线上直播 · 中英文授课',
    stats: [[String(EVENT_STATS.hosted), '场社区 AI 活动，2026 年在达拉斯—沃斯堡举办'], [String(EVENT_STATS.registrations), '人报名参加'], [`${PROOF.rating} ★`, `<a href="${GBP_URL}" target="_blank" rel="noopener">${PROOF.reviews} 条 Google 评价 ↗</a>`]],
    formatsK: '培训形式', formatsH: '三种上课方式', formatsP: '每种形式都是实操，围绕你团队自己的任务来设计，按团队情况单独报价。在页面底部的表格里告诉我们人数即可。',
    formats: [['90 分钟团队工作坊', '一个团队、一次直播课，处理一到两条真实工作流。达拉斯—沃斯堡上门或线上。', OFFERS.workshop.path], ['全天上门培训', '到贵公司现场一整天：基础、数据规则、各部门用例和带练。', OFFERS.onsite.path], ['四次课程项目', '几周内四节 90 分钟直播课，一次一条工作流，结束两周后回访。', '/ai-training/']],
    byQuote: '按需报价', see: '查看详情',
    localK: '本地', localH: '在达拉斯—沃斯堡授课，讲课的就是办活动的人',
    localP: `Jack Qian 住在达拉斯地区，每一节课都亲自讲：到贵公司现场（Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Irving、Arlington 及周边），或全美线上直播。他也在 Dallas 和 Plano 办免费的社区 AI 活动，日期、场地和照片见<a href="/zh/ai-training/dallas/">达拉斯—沃斯堡企业 AI 培训</a>。`,
    revK: 'Google 评价', revH: '学员怎么说', revMore: `查看全部 ${PROOF.reviews} 条评价 →`,
    otherK: '其他工具', otherH: '团队常用的其他 AI 工具培训',
    faqK: '常见问题', faqH: (t) => `${t} 培训，直接回答`,
    faq: [
      ['费用是多少？', '取决于参加人数、培训形式，以及你们的工作流需要多少准备，所以每个团队单独报价。用页面底部的简短表格，留下姓名、邮箱、人数，有预算范围的话也填上。Jack 会通过邮件回复推荐的形式和书面报价。在你书面确认之前，不会约定任何事项。'],
      ['可以在达拉斯—沃斯堡上门吗？', '可以。上门培训覆盖整个大都会区：Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Irving、Arlington 及中间的城市。德州其他城市可按需安排，差旅另行报价。全美任何地方都可以线上直播。'],
      ['一次能有多少人参加？', '在报价中确定。每种形式都是实操，Jack 需要看到每个人的工作；人多的团队拆成两场，或安排成按部门分块的全天培训。'],
      ['中文还是英文授课？', '都可以。用团队最顺手的语言上课，资料中英文都有。'],
      ['有结业证书吗？', '没有。成果是每个人在自己已经在做的任务上有一条能用的工作流，外加一份核验输出的清单。课程项目结束两周后，Jack 会回访哪些工作流留下了、改了、停了。'],
    ],
    ldType: (t) => `${t} 企业团队培训`,
  },
};

// Per-tool copy. Keep claims to what the vendor publishes; anything plan-specific says "your plan".
const TOOLS = {
  copilot: {
    vendorUrl: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy',
    en: {
      title: 'Microsoft Copilot Training for Teams in Dallas | AI Man Jack',
      description: 'Hands-on Microsoft 365 Copilot training for Dallas teams: Word, Excel, Outlook, Teams and PowerPoint on your own work. Onsite or online. Get a quote by email.',
      h1: 'Microsoft Copilot training for your team, on the work it already does',
      sub: 'Your company is paying for Copilot. Most people still use it like a search box. In a hands-on session, each person takes a task from their own week in Word, Excel, Outlook or Teams and leaves with a Copilot workflow they will use on Monday, and a habit of checking what it produced.',
      whyK: 'What changes', whyH: 'What your team can do after the session',
      why: ['Draft and rewrite in Word and Outlook from your own files and email threads, in your company’s voice.', 'Ask Excel questions in plain English, build formulas and summaries, and check the numbers before they go anywhere.', 'Turn a Teams meeting into decisions, owners and dates, and a follow-up email the same afternoon.', 'Know which work Copilot should not touch, and what has to be reviewed by a person every time.'],
      modK: 'Curriculum', modH: 'What the Copilot training covers',
      mods: [['Copilot Chat vs. Copilot in the apps', 'What the free work chat does, what the Microsoft 365 Copilot license adds inside Word, Excel, PowerPoint, Outlook and Teams, and which one each task needs.'], ['Prompts that use your files', 'Point Copilot at the right document, thread or meeting instead of pasting text. Give it a role, a source and a format.'], ['Excel with Copilot', 'Summaries, formulas and charts from a table, and the three checks that catch a wrong number before it reaches a report.'], ['Outlook and Teams', 'Inbox triage, thread summaries, meeting recaps and follow-ups that a person still approves before sending.'], ['Word and PowerPoint', 'First drafts from approved source documents, rewrites for a different reader, and decks from an outline you wrote.'], ['Agents, carefully', 'Where a Copilot agent helps with a repeated task, what it can see, and who in IT needs to approve it.']],
      wfK: 'By team', wfH: 'Example Copilot workflows we build in the room',
      wfs: [['Sales', 'Meeting prep from the account’s email history in Outlook, and a follow-up drafted from the Teams recap.'], ['Operations', 'A weekly status report pulled together from a spreadsheet and two email threads, checked against the source.'], ['Marketing', 'A campaign brief rewritten into three versions for different readers, kept to approved claims.'], ['Managers', 'A one-page summary of a long document or meeting series, with decisions and open questions separated.']],
      dataH: 'Data, permissions and your IT team',
      dataP: 'Microsoft 365 Copilot works inside the permissions your company already set: people see through Copilot only what they could already open. That makes messy sharing settings visible fast, so we start with which files and sites are in scope and which data never goes into a prompt. For how Microsoft handles prompts and responses, read <a href="https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy" target="_blank" rel="noopener">Microsoft’s Copilot privacy and protections page ↗</a>; we check it against your plan with your IT lead before the session.',
      faq: [
        ['Do we need Microsoft 365 Copilot licenses for the training?', 'For the in-app features (Copilot in Word, Excel, Outlook, Teams and PowerPoint), yes: each attendee needs the license on the account they use in the session. If your team only has Copilot Chat, we train on that and show what the license would add, so you can decide where it is worth paying for.'],
        ['Is our company data safe with Copilot?', 'Copilot respects the access your company already set, so it does not open anything a person could not open before. The real risk is over-shared files, so the first part of the session covers which sites and folders are in scope and what never goes into a prompt. We review Microsoft’s published data terms with your IT lead before the session.'],
        ['Does our IT team need to be involved?', 'Briefly. We ask your IT lead to confirm licenses, which apps are enabled, whether meeting transcription is on, and whether agents are allowed. A 15-minute call is usually enough.'],
        ['Can you teach Copilot in Excel to non-technical staff?', 'Yes, and it is usually the most useful hour. People learn to ask for summaries, formulas and charts in plain English, and then to check the result against the source before it is used.'],
        ['What about Copilot agents and Copilot Studio?', 'We cover where an agent helps with a task that repeats, what it can read, and who should approve it. Building production agents in Copilot Studio is a separate project; the training gets your team to the point of knowing which one is worth building.'],
        ['We use Google Workspace or ChatGPT too. Is that a problem?', `No. The method is the same across tools, and many teams use two. See <a href="${pathOf('chatgpt')}">ChatGPT training</a> or <a href="${pathOf('claude')}">Claude training</a>, or ask for a session that covers both.`],
        ['What does each person leave with?', 'At least one Copilot workflow on a task from their own week, written down so a colleague could repeat it, and a short checklist of what to verify before the output is used.'],
      ],
    },
    zh: {
      title: 'Microsoft Copilot 企业团队培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯团队的 Microsoft 365 Copilot 实操培训：在 Word、Excel、Outlook、Teams、PowerPoint 里处理自己的真实工作。上门或线上，留邮箱获取报价。',
      h1: 'Microsoft Copilot 团队培训，用在你们本来就在做的工作上',
      sub: '公司已经在为 Copilot 付费，大多数人却还把它当搜索框用。实操课上，每个人从自己这周的工作里挑一项任务，在 Word、Excel、Outlook 或 Teams 里做成一条周一就能用的 Copilot 工作流，并养成核验输出的习惯。',
      whyK: '改变什么', whyH: '课后团队能做到的事',
      why: ['在 Word 和 Outlook 里，基于自己的文件和邮件往来起草、改写，保持公司的口吻。', '用大白话问 Excel，生成公式和汇总，并在数字发出去之前先核对。', '把一场 Teams 会议变成决定、负责人和日期，当天下午就发出跟进邮件。', '知道哪些工作不该交给 Copilot，哪些每次都必须由人复核。'],
      modK: '课程内容', modH: 'Copilot 培训讲什么',
      mods: [['Copilot Chat 与应用内 Copilot', '免费的工作版对话能做什么，Microsoft 365 Copilot 许可证在 Word、Excel、PowerPoint、Outlook、Teams 里多了什么，每项任务该用哪个。'], ['用你自己文件的提示词', '让 Copilot 直接引用对的文档、邮件串或会议，而不是粘贴文字。给它角色、资料来源和输出格式。'], ['Excel 里的 Copilot', '从表格生成汇总、公式和图表，以及在数字进入报告之前抓出错误的三项检查。'], ['Outlook 和 Teams', '整理收件箱、总结邮件串、会议纪要和跟进邮件，发送前仍由人确认。'], ['Word 和 PowerPoint', '基于批准过的资料起草初稿，按不同读者改写，用你写好的大纲生成幻灯片。'], ['谨慎使用智能体', 'Copilot 智能体适合哪些重复任务、它能看到什么、IT 里谁需要批准。']],
      wfK: '按团队', wfH: '课上搭建的 Copilot 工作流示例',
      wfs: [['销售', '根据 Outlook 里与客户的往来邮件做会前准备，再用 Teams 会议纪要起草跟进邮件。'], ['运营', '从一张表格和两串邮件里汇总出每周状态报告，并对照原始资料核对。'], ['市场', '把一份活动简报改写成三个版本给不同读者，只用批准过的说法。'], ['管理层', '把一份长文档或一系列会议总结成一页，决定和待定问题分开写。']],
      dataH: '数据、权限和你们的 IT 团队',
      dataP: 'Microsoft 365 Copilot 在公司已有的权限范围内工作：通过 Copilot 能看到的，只是本人原本就能打开的内容。这会让混乱的共享设置很快暴露出来，所以我们从哪些文件和站点在范围内、哪些数据绝不进提示词讲起。微软如何处理提示和回复，见<a href="https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy" target="_blank" rel="noopener">微软 Copilot 隐私与保护说明 ↗</a>；课前我们会和你们的 IT 负责人对照你们的方案确认。',
      faq: [
        ['培训需要 Microsoft 365 Copilot 许可证吗？', '应用内功能（Word、Excel、Outlook、Teams、PowerPoint 里的 Copilot）需要：每位学员上课用的账号要有许可证。如果团队只有 Copilot Chat，我们就用它来教，并演示许可证能多做什么，方便你们判断值不值得买。'],
        ['公司数据用 Copilot 安全吗？', 'Copilot 遵守公司已有的访问权限，不会打开本人原本打不开的内容。真正的风险是共享过度的文件，所以课程一开始就讲清楚哪些站点和文件夹在范围内、哪些内容绝不进提示词。课前我们会和你们的 IT 负责人一起看微软公布的数据条款。'],
        ['需要 IT 团队参与吗？', '简单参与即可。请 IT 负责人确认许可证、启用了哪些应用、会议转录是否开启、是否允许使用智能体。通常 15 分钟通话就够了。'],
        ['能教非技术员工用 Excel 里的 Copilot 吗？', '能，而且这往往是最有用的一小时。学员学会用大白话要汇总、公式和图表，再在使用前对照原始数据核对结果。'],
        ['Copilot 智能体和 Copilot Studio 呢？', '我们会讲智能体适合哪些重复任务、它能读取什么、应该由谁批准。在 Copilot Studio 里开发正式的智能体是另一个项目；培训的目标是让团队知道哪一个值得做。'],
        ['我们同时也用 Google Workspace 或 ChatGPT，有影响吗？', `没有。方法在各种工具上通用，很多团队同时用两个。可以看看 <a href="/zh${pathOf('chatgpt')}">ChatGPT 培训</a>或 <a href="/zh${pathOf('claude')}">Claude 培训</a>，也可以安排一次两个工具都讲的课。`],
        ['每个人能带走什么？', '至少一条基于自己本周任务的 Copilot 工作流，写清楚到同事也能照做，再加一份使用前要核验的简短清单。'],
      ],
    },
  },
  chatgpt: {
    vendorUrl: 'https://openai.com/enterprise-privacy/',
    en: {
      title: 'ChatGPT Training for Employees in Dallas | AI Man Jack',
      description: 'Hands-on ChatGPT training for Dallas teams: Projects, custom GPTs, files and data analysis on your own work, with data rules. Onsite or online. Get a quote by email.',
      h1: 'ChatGPT training for employees, built on the work they already do',
      sub: 'Most teams already use ChatGPT, one person at a time, each with their own habits and their own account. A hands-on session turns that into shared workflows on company accounts: each person brings a real task, builds it in ChatGPT, and learns what to check before anything goes out.',
      whyK: 'What changes', whyH: 'What your team can do after the session',
      why: ['Write instructions ChatGPT can follow: role, source material, format and what to leave out.', 'Keep a team’s approved material in a Project or a custom GPT so everyone starts from the same sources.', 'Pull fields out of documents, compare versions and analyze a spreadsheet without retyping anything.', 'Move off personal accounts and know which data never goes into a chat.'],
      modK: 'Curriculum', modH: 'What the ChatGPT training covers',
      mods: [['From prompt to work instruction', 'The same five parts every time: task, context, source, format, check. Practised on each person’s own work.'], ['Projects and custom GPTs', 'Store the team’s approved instructions and files once, so a new hire gets the same results on day one.'], ['Files and data analysis', 'Upload a spreadsheet or PDF, ask for a summary or a chart, and verify the numbers against the source.'], ['Research with sources', 'When web search and deep research help, and how to check that a cited source says what the answer claims.'], ['Writing in your voice', 'Customer replies, proposals and internal updates that sound like your company, built from your own past examples.'], ['Rules for company use', 'Business accounts vs. personal ones, what never goes in, and who signs off before an output is used.']],
      wfK: 'By team', wfH: 'Example ChatGPT workflows we build in the room',
      wfs: [['Sales', 'Account research and a first-call brief from public sources and your CRM notes, checked before the call.'], ['Operations', 'A weekly report from a spreadsheet export, with the same structure every week and a check on every number.'], ['Marketing', 'One approved message turned into email, post and web copy, without new claims.'], ['Support and admin', 'Reply drafts for common requests from your own policy documents, reviewed before sending.']],
      dataH: 'Company accounts and data rules',
      dataP: 'The first step is moving work off personal accounts. On its business plans OpenAI states that it does not train on your business data by default; read <a href="https://openai.com/enterprise-privacy/" target="_blank" rel="noopener">OpenAI’s enterprise privacy page ↗</a> for the current terms. Terms differ by plan and change, so we check the plan you actually buy, on the day, and write a one-page list of what may and may not go in.',
      faq: [
        ['Which ChatGPT plan do we need?', 'A business plan on company accounts is best, so data rules and shared Projects apply to everyone. If people are still on personal accounts, the session starts by deciding which plan to approve; we do not sell licenses and do not take a cut.'],
        ['Is it safe to put company data into ChatGPT?', 'Some of it, on the right plan. We agree with you on three lists: never goes in (passwords, ID numbers, health data, contracts that forbid it), check first, and fine to use. Then we check your plan’s current terms on OpenAI’s own pages.'],
        ['Our people already use ChatGPT. What will they learn?', 'Most self-taught users write short prompts and accept the first answer. The session teaches the work instruction, shared Projects, working from files, and the habit of checking output against the source. The difference shows up in the first hour.'],
        ['Do you build custom GPTs for us?', 'In the session, each team builds one or two simple ones around its own approved material, so they know how to maintain them. A larger build is a separate project.'],
        ['Can ChatGPT work with our spreadsheets and PDFs?', 'Yes. Upload a file, ask for a summary, comparison or chart, then verify the numbers against the original. We practise this on a real file from your team with sensitive columns removed.'],
        ['What about agents and automation?', 'We cover where an agent or a scheduled task is worth it and where a person should stay in the loop. Most teams get more from five reliable workflows than from one complex automation.'],
        ['What does each person leave with?', 'At least one ChatGPT workflow on a task from their own week, saved in a Project or written down so a colleague can repeat it, and a short checklist of what to verify.'],
      ],
    },
    zh: {
      title: 'ChatGPT 员工培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯团队的 ChatGPT 实操培训：Projects、自定义 GPT、文件与数据分析，用在自己的真实工作上，并讲清数据规则。上门或线上，留邮箱获取报价。',
      h1: 'ChatGPT 员工培训，从他们手头的工作出发',
      sub: '大多数团队早就在用 ChatGPT，只是各用各的账号、各有各的习惯。实操课把它变成公司账号上的共享工作流：每人带一项真实任务，在 ChatGPT 里做出来，并学会在任何东西发出去之前该查什么。',
      whyK: '改变什么', whyH: '课后团队能做到的事',
      why: ['写出 ChatGPT 能照做的工作指令：角色、资料来源、格式，以及哪些不要写。', '把团队批准过的资料放进 Project 或自定义 GPT，大家从同一套资料出发。', '从文件里提取字段、对比版本、分析表格，不用重新录入。', '离开个人账号，清楚哪些数据绝不能进对话。'],
      modK: '课程内容', modH: 'ChatGPT 培训讲什么',
      mods: [['从提示词到工作指令', '每次都用同样的五部分：任务、背景、资料、格式、核验。用每个人自己的工作来练。'], ['Projects 和自定义 GPT', '把团队批准过的指令和文件存一次，新员工第一天就能得到同样的结果。'], ['文件与数据分析', '上传表格或 PDF，要汇总或图表，再对照原始数据核对数字。'], ['带来源的调研', '什么时候用联网搜索和深度研究，以及怎么确认引用的来源真的说了答案里的话。'], ['用你们的口吻写作', '客户回复、方案和内部通报，用你们以往的真实例子，写出公司自己的味道。'], ['公司使用规则', '企业账号与个人账号、哪些内容绝不输入、输出被使用前由谁签字。']],
      wfK: '按团队', wfH: '课上搭建的 ChatGPT 工作流示例',
      wfs: [['销售', '根据公开资料和 CRM 备注做客户调研和首次通话简报，通话前先核对。'], ['运营', '用导出的表格生成每周报告，每周结构一致，每个数字都核对。'], ['市场', '把一条批准过的信息改成邮件、帖子和网页文案，不添加新的说法。'], ['客服与行政', '根据公司自己的政策文件起草常见请求的回复，发送前复核。']],
      dataH: '公司账号与数据规则',
      dataP: '第一步是把工作从个人账号上移走。OpenAI 表示，在其企业类方案上默认不会用你们的业务数据训练模型；最新条款见 <a href="https://openai.com/enterprise-privacy/" target="_blank" rel="noopener">OpenAI 企业隐私说明 ↗</a>。不同方案的条款不同，也会变化，所以我们按你们实际购买的方案、在当天核对，并写一页清单：哪些可以输入，哪些不行。',
      faq: [
        ['需要哪个 ChatGPT 方案？', '最好是公司账号上的企业类方案，这样数据规则和共享的 Projects 对每个人都适用。如果大家还在用个人账号，课程就从决定批准哪个方案开始；我们不卖许可证，也不拿分成。'],
        ['把公司数据放进 ChatGPT 安全吗？', '在合适的方案上，部分数据可以。我们会和你一起列三张清单：绝不输入（密码、证件号、健康信息、合同禁止的内容）、先确认、可以使用。然后在 OpenAI 官方页面上核对你们方案的最新条款。'],
        ['员工已经在用 ChatGPT 了，还能学到什么？', '自学的用户大多写短提示、接受第一个答案。课程教的是工作指令、共享 Projects、基于文件工作，以及对照资料核验输出的习惯。第一个小时就能看出差别。'],
        ['你们帮我们做自定义 GPT 吗？', '课上每个团队会围绕自己批准过的资料做一两个简单的 GPT，学会自己维护。更大的开发是另一个项目。'],
        ['ChatGPT 能处理我们的表格和 PDF 吗？', '能。上传文件，要汇总、对比或图表，再对照原件核对数字。我们会用你们团队的一份真实文件来练，敏感列先删掉。'],
        ['智能体和自动化呢？', '我们会讲哪些地方值得用智能体或定时任务、哪些地方必须有人把关。多数团队从五条可靠的工作流里得到的，比从一个复杂的自动化里多。'],
        ['每个人能带走什么？', '至少一条基于自己本周任务的 ChatGPT 工作流，存在 Project 里或写下来让同事也能照做，再加一份简短的核验清单。'],
      ],
    },
  },
  claude: {
    vendorUrl: 'https://www.anthropic.com/legal/commercial-terms',
    en: {
      title: 'Claude AI Training for Business Teams in Dallas | AI Man Jack',
      description: 'Hands-on Claude training for Dallas teams: Projects, Skills, long documents and careful writing on your own work, with data rules. Onsite or online. Get a quote by email.',
      h1: 'Claude training for business teams, built around your real work',
      sub: 'Claude is strong at long documents, careful writing and following detailed instructions, and our own workflows run on it. In a hands-on session each person sets up Claude for a task they repeat every week, using your approved material, and learns where it still needs a human check.',
      whyK: 'What changes', whyH: 'What your team can do after the session',
      why: ['Work through long contracts, reports and transcripts and get answers tied to the page they came from.', 'Keep a team’s instructions and reference files in a Project so everyone works from the same material.', 'Package a repeated task as a Skill so it runs the same way every time.', 'Write and review proposals, policies and customer replies in your company’s voice.'],
      modK: 'Curriculum', modH: 'What the Claude training covers',
      mods: [['Instructions Claude follows', 'Role, source, format and limits, written once and reused. Practised on each person’s own task.'], ['Projects', 'A shared space for a team’s instructions and approved documents, so answers start from your material, not the open web.'], ['Skills', 'Turn a task you repeat, such as call prep or a meeting follow-up, into a reusable Skill the whole team can run.'], ['Long documents', 'Summaries, comparisons and extraction from long files, with quotes you can check against the original.'], ['Writing and review', 'Drafts in your voice from past examples, and a second pass that checks tone, facts and missing points.'], ['Connectors and limits', 'Which of your tools Claude can connect to, what it can then read, and what stays out.']],
      wfK: 'By team', wfH: 'Example Claude workflows we build in the room',
      wfs: [['Leadership and consulting', 'Call prep from your notes and calendar, and a follow-up written from the meeting transcript.'], ['Operations', 'A standard operating procedure drafted from a recorded walkthrough, then checked step by step.'], ['Sales', 'Proposals assembled from approved past proposals and the client’s own words, without new promises.'], ['HR and policy', 'Policy questions answered from your handbook in a Project, with the section quoted.']],
      dataH: 'Commercial accounts and data rules',
      dataP: 'For business use we recommend Claude’s team or enterprise plans on company accounts. Anthropic’s <a href="https://www.anthropic.com/legal/commercial-terms" target="_blank" rel="noopener">commercial terms ↗</a> cover how customer content is handled on those plans; we read the current version with you and write a one-page list of what may and may not go into a Project or a chat.',
      faq: [
        ['Why Claude instead of ChatGPT or Copilot?', 'Many teams use more than one. Claude tends to suit long documents, careful writing and detailed instructions; Copilot suits teams living in Microsoft 365. We help you decide which tasks belong where, and the method we teach works in both.'],
        ['What are Claude Skills, and will we build one?', 'A Skill packages instructions and files for a repeated task so Claude handles it the same way each time. In the session each person or team builds one around a real task, such as call prep or a meeting follow-up, and learns how to keep it current.'],
        ['Which Claude plan do we need?', 'A team or enterprise plan on company accounts, so Projects can be shared and the commercial terms apply. If you are still deciding, we cover the differences before the session; we do not sell licenses.'],
        ['Is our data safe in Claude?', 'On commercial plans Anthropic’s commercial terms apply; we check the current version with you. Then we agree on what never goes in, what needs a check first, and what is fine, and write it down for the team.'],
        ['Can Claude connect to our email, drive or CRM?', 'Some tools can be connected, depending on your plan and what your admin allows. We show what a connection lets Claude read, and we start with the smallest scope that does the job.'],
        ['Can you train us to build agents with Claude?', 'Yes, at the level of workflows a non-technical team can own: Projects, Skills and connected tools with a human approval step. A custom software build is a separate project.'],
        ['What does each person leave with?', 'A working Claude setup for at least one of their own tasks, saved as a Project or Skill so a colleague can run it, and a short checklist of what to verify before the output is used.'],
      ],
    },
    zh: {
      title: 'Claude AI 企业团队培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯团队的 Claude 实操培训：Projects、Skills、长文档与严谨写作，用在自己的真实工作上，并讲清数据规则。上门或线上，留邮箱获取报价。',
      h1: 'Claude 企业团队培训，围绕你们的真实工作',
      sub: 'Claude 擅长长文档、严谨的写作和遵循详细指令，我们自己的工作流就跑在它上面。实操课上，每个人用公司批准的资料，为一项每周重复的任务配置好 Claude，并学会它在哪里仍然需要人来核对。',
      whyK: '改变什么', whyH: '课后团队能做到的事',
      why: ['处理长合同、报告和会议转录，得到能对应到原文页码的答案。', '把团队的指令和参考文件放进 Project，大家从同一套资料出发。', '把重复任务打包成 Skill，每次都用同样的方式运行。', '用公司的口吻撰写和审阅方案、制度和客户回复。'],
      modK: '课程内容', modH: 'Claude 培训讲什么',
      mods: [['Claude 能照做的指令', '角色、资料、格式和限制，写一次、反复用。用每个人自己的任务来练。'], ['Projects', '团队共享的空间，放指令和批准过的文档，让回答从你们的资料出发，而不是从公开网络。'], ['Skills', '把通话准备、会后跟进这类重复任务做成可复用的 Skill，全队都能用。'], ['长文档', '对长文件做摘要、对比和提取，附上能对照原文核对的引文。'], ['写作与审阅', '参照以往的例子用你们的口吻起草，再做一轮检查语气、事实和遗漏。'], ['连接器与边界', 'Claude 能连接你们的哪些工具、连接后能读到什么、哪些内容不碰。']],
      wfK: '按团队', wfH: '课上搭建的 Claude 工作流示例',
      wfs: [['管理层与咨询', '根据笔记和日历做通话准备，再根据会议转录写跟进。'], ['运营', '根据一段录制的操作演示起草标准作业流程，再逐步核对。'], ['销售', '用批准过的往期方案和客户自己的原话拼出方案，不添加新的承诺。'], ['人事与制度', '在 Project 里根据员工手册回答制度问题，并引用对应章节。']],
      dataH: '商业账号与数据规则',
      dataP: '企业使用建议在公司账号上用 Claude 的团队版或企业版。Anthropic 的<a href="https://www.anthropic.com/legal/commercial-terms" target="_blank" rel="noopener">商业条款 ↗</a>说明了这些方案如何处理客户内容；我们会和你一起看最新版本，并写一页清单：哪些可以放进 Project 或对话，哪些不行。',
      faq: [
        ['为什么用 Claude，而不是 ChatGPT 或 Copilot？', '很多团队不止用一个。Claude 通常更适合长文档、严谨写作和详细指令；Copilot 适合整天在 Microsoft 365 里的团队。我们帮你判断哪些任务放哪里，教的方法两边都通用。'],
        ['什么是 Claude Skills？课上会做吗？', 'Skill 把一项重复任务的指令和文件打包起来，让 Claude 每次都用同样的方式处理。课上每个人或每个团队会围绕一项真实任务（比如通话准备或会后跟进）做一个，并学会怎么保持更新。'],
        ['需要哪个 Claude 方案？', '公司账号上的团队版或企业版，这样 Projects 可以共享，商业条款也适用。如果还在选，课前我们会讲清楚区别；我们不卖许可证。'],
        ['数据放在 Claude 里安全吗？', '在商业方案上适用 Anthropic 的商业条款，我们会和你一起核对最新版本。然后约定哪些绝不输入、哪些先确认、哪些可以用，并写下来给团队。'],
        ['Claude 能连接我们的邮箱、网盘或 CRM 吗？', '部分工具可以连接，取决于你们的方案和管理员的设置。我们会演示连接之后 Claude 能读到什么，并从能完成任务的最小范围开始。'],
        ['能教我们用 Claude 搭智能体吗？', '可以，限于非技术团队自己能维护的工作流：Projects、Skills 和连接的工具，外加人工确认这一步。定制软件开发是另一个项目。'],
        ['每个人能带走什么？', '至少一项自己任务的可用 Claude 配置，存成 Project 或 Skill 让同事也能运行，再加一份使用前要核验的简短清单。'],
      ],
    },
  },
  grok: {
    vendorUrl: 'https://x.ai/grok/business',
    en: {
      title: 'Grok AI Training for Business Teams in Dallas | AI Man Jack',
      description: 'Hands-on Grok and Grok Bot training for Dallas teams: real-time research, drafting and AI agents that work in your tools, with approvals and data rules. Get a quote by email.',
      h1: 'Grok and Grok Bot training for business teams',
      sub: 'Grok brings real-time search across the web and X into a chat, and Grok Bot goes further: AI agents that sign in to your tools and come back with finished work. Both are powerful and both need rules. In a hands-on session your team sets them up on real tasks, with a person approving anything that leaves the building.',
      whyK: 'What changes', whyH: 'What your team can do after the session',
      why: ['Research a market, competitor or account with live sources, and check that each source says what the answer claims.', 'Track what people are saying about your brand or industry on X, summarized into what matters this week.', 'Hand a repeated task to a Grok Bot agent with a clear scope, a review step and a record of what it did.', 'Know which accounts and data an agent may touch, and which it never gets access to.'],
      modK: 'Curriculum', modH: 'What the Grok training covers',
      mods: [['Grok for research', 'Real-time web and X search, asking for sources, and the checks that catch an outdated or misread source.'], ['Writing and summaries', 'Drafts, rewrites and summaries in your company’s voice, with the facts checked against your own material.'], ['Grok Bot: agents that do the work', 'What a Bot is, how it uses your tools the way you do, and which tasks are worth handing over first.'], ['Scope, approvals and memory', 'Give each agent one job, hold sends and payments for a person’s OK, and review what it learned before you rely on it.'], ['Business accounts and security', 'Company accounts, single sign-on, and what xAI’s business plan says about your data, checked on the day.'], ['When not to use it', 'Tasks where a wrong action costs more than the time saved, and where a simpler tool or no AI is the better answer.']],
      wfK: 'By team', wfH: 'Example Grok workflows we build in the room',
      wfs: [['Sales', 'Overnight account research with draft outreach left in a review list for a person to approve.'], ['Marketing', 'A weekly brief on what customers and competitors posted on X, with links to every post cited.'], ['Operations', 'An agent that files routine reports or expense items, with every submission held for approval at first.'], ['Leadership', 'A morning summary of industry news with sources, kept separate from opinion.']],
      dataH: 'Agents need tighter rules than chat',
      dataP: 'A chat answer can be ignored; an agent that signs in to your tools can send, file and change things. So we start with the smallest scope that does the job, a person approving every outgoing action until the agent has earned trust, and separate accounts where possible. For xAI’s business security and data controls, see <a href="https://x.ai/grok/business" target="_blank" rel="noopener">xAI’s business page ↗</a>; we check the current terms of the plan you choose before the session.',
      faq: [
        ['What is Grok Bot?', 'Grok Bot is xAI’s product for AI agents: you give a Bot a job, it signs in to your tools, uses them the way you do, and comes back with finished work or drafts for you to approve. It is newer than chat tools, so the training focuses on scoping a job, approvals and what an agent may access.'],
        ['Is Grok suitable for company use?', 'For some work, on a business plan. Its strength is real-time search across the web and X. We cover the business account options and check the current data terms with you before anyone puts company material in.'],
        ['Is it safe to let an AI agent use our accounts?', 'Only with limits. We give each agent one job and the minimum access it needs, hold anything that sends, pays or deletes for a person’s approval, and review its actions for the first weeks. Some tasks should never be handed to an agent, and we say which.'],
        ['Do you teach Grok on its own or alongside other tools?', `Usually alongside. Many teams use Grok for live research and another tool for documents and writing; see <a href="${pathOf('chatgpt')}">ChatGPT</a>, <a href="${pathOf('claude')}">Claude</a> or <a href="${pathOf('copilot')}">Copilot</a> training. The method is the same across tools.`],
        ['How do we know the sources Grok cites are right?', 'We practise it: open the cited source, find the exact sentence, check the date. Posts on X are opinions or news, not facts, until a second source confirms them.'],
        ['What does an agent rollout look like after the training?', 'Start with one low-risk job, approvals on every action, and a weekly review of what the agent did. Widen its scope only when its work stops needing corrections.'],
        ['What does each person leave with?', 'At least one Grok research workflow or one scoped Bot job on a real task, written down with its approval steps, and a short checklist of what to verify.'],
      ],
    },
    zh: {
      title: 'Grok AI 企业团队培训（达拉斯）| AI Man Jack',
      description: '面向达拉斯团队的 Grok 与 Grok Bot 实操培训：实时调研、写作，以及在你们工具里干活的 AI 智能体，配好审批和数据规则。留邮箱获取报价。',
      h1: 'Grok 与 Grok Bot 企业团队培训',
      sub: 'Grok 把网络和 X 上的实时搜索放进对话里；Grok Bot 更进一步：AI 智能体会登录你们的工具，把活干完再交回来。两者都很强，也都需要规则。实操课上，团队用真实任务把它们配置好，任何要发出公司的东西都由人来批准。',
      whyK: '改变什么', whyH: '课后团队能做到的事',
      why: ['用实时来源调研市场、竞争对手或客户，并确认每个来源真的说了答案里的话。', '追踪 X 上关于你们品牌或行业的讨论，汇总成本周真正重要的内容。', '把一项重复任务交给 Grok Bot 智能体，范围清楚、有复核步骤、有操作记录。', '知道智能体能碰哪些账号和数据，哪些永远不给它权限。'],
      modK: '课程内容', modH: 'Grok 培训讲什么',
      mods: [['用 Grok 做调研', '网络和 X 的实时搜索、要求给出来源，以及发现过时或被误读来源的检查方法。'], ['写作与摘要', '用公司口吻起草、改写和总结，并对照你们自己的资料核对事实。'], ['Grok Bot：能干活的智能体', 'Bot 是什么、它如何像你一样使用你们的工具、哪些任务最适合先交给它。'], ['范围、审批与记忆', '每个智能体只干一件事，发送和付款等操作留给人确认，依赖它之前先检查它学到了什么。'], ['企业账号与安全', '公司账号、单点登录，以及 xAI 企业方案对你们数据的说明，当天核对。'], ['什么时候不该用', '出错代价大于省下时间的任务，以及更简单的工具或不用 AI 反而更好的情况。']],
      wfK: '按团队', wfH: '课上搭建的 Grok 工作流示例',
      wfs: [['销售', '夜间完成客户调研，外联草稿放进待审列表，由人批准。'], ['市场', '每周汇总客户和竞争对手在 X 上发了什么，每条引用都附链接。'], ['运营', '让智能体提交例行报告或报销，起初每一次提交都先等人批准。'], ['管理层', '每天早上一份带来源的行业新闻摘要，事实和观点分开。']],
      dataH: '智能体比对话需要更严的规则',
      dataP: '对话的回答可以不理；能登录你们工具的智能体却会发送、提交和修改东西。所以我们从能完成任务的最小范围开始，在智能体赢得信任之前每个外发操作都由人批准，能分开的账号就分开。xAI 的企业安全与数据控制见 <a href="https://x.ai/grok/business" target="_blank" rel="noopener">xAI 企业页面 ↗</a>；课前我们会核对你们所选方案的最新条款。',
      faq: [
        ['Grok Bot 是什么？', 'Grok Bot 是 xAI 的 AI 智能体产品：给 Bot 一份工作，它会登录你们的工具，像你一样操作，把完成的工作或待你批准的草稿交回来。它比对话工具新，所以培训重点是界定任务、审批，以及智能体可以访问什么。'],
        ['Grok 适合公司使用吗？', '在企业方案上，适合部分工作。它的强项是网络和 X 的实时搜索。我们会讲企业账号的选项，并在任何人放入公司资料之前，和你一起核对最新的数据条款。'],
        ['让 AI 智能体使用我们的账号安全吗？', '必须有限制。每个智能体只干一件事、只给完成任务所需的最小权限，凡是发送、付款或删除的操作都留给人批准，头几周逐一检查它的操作。有些任务永远不该交给智能体，我们会说清楚是哪些。'],
        ['只教 Grok，还是和其他工具一起教？', `通常一起。很多团队用 Grok 做实时调研，用另一个工具处理文档和写作；可以看看 <a href="/zh${pathOf('chatgpt')}">ChatGPT</a>、<a href="/zh${pathOf('claude')}">Claude</a> 或 <a href="/zh${pathOf('copilot')}">Copilot</a> 培训。方法在各种工具上通用。`],
        ['怎么确认 Grok 引用的来源是对的？', '我们会练：打开引用的来源，找到原句，看日期。X 上的帖子在被第二个来源证实之前，只是观点或消息，不是事实。'],
        ['培训之后智能体怎么落地？', '从一项低风险的工作开始，每个操作都要审批，每周回顾一次智能体做了什么。等它的工作不再需要修改时，才扩大范围。'],
        ['每个人能带走什么？', '至少一条基于真实任务的 Grok 调研工作流，或一个界定清楚的 Bot 任务，连同审批步骤写下来，再加一份简短的核验清单。'],
      ],
    },
  },
};

export const head = (k, h, p) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div></div>`;
// Formats (no prices), local block and Google reviews: shared by the tool pages and the department pages (src/pages/department-training.mjs).
export const sharedBlocks = (lang, pos) => { const s = SHARED[lang], rev = REVIEWS[lang].slice(0, 3);
  return `<section class="sec tight" id="formats"><div class="wrap">${head(s.formatsK, s.formatsH, s.formatsP)}
<div class="g3">${s.formats.map(([h, p, href]) => `<a class="card" href="${L(lang, href)}" data-event="offer_path_click" data-pos="${pos}-formats" style="text-decoration:none;color:inherit"><h3>${h}</h3><p>${p}</p><span class="muted" style="font-size:14px;font-weight:600">${s.byQuote} · ${s.see} →</span></a>`).join('')}</div></div></section>

<section class="sec tight" id="local"><div class="wrap">${head(s.localK, s.localH)}<p style="max-width:860px">${s.localP}</p></div></section>

<section class="sec tight" id="testimonials"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${s.revK}</div><h2>${s.revH}</h2></div><a class="more" href="${GBP_URL}" target="_blank" rel="noopener">${s.revMore}</a></div>
<div class="quote-grid">${rev.map(([n, q]) => `<figure class="quote"><span class="stars" aria-label="5 stars">★★★★★</span><blockquote style="margin:0;flex-grow:1"><p>${q}</p></blockquote><figcaption><b>${n}</b> <span>· ${REVIEWS.by[lang]}</span></figcaption></figure>`).join('')}</div></div></section>`; };
export { SHARED, NAME as TOOL_NAME, pathOf as toolPath };

const page = (key, lang) => {
  const s = SHARED[lang], t = TOOLS[key][lang], zh = lang === 'zh', path = pathOf(key), url = `${SITE}${L(lang, path)}`, name = NAME[key];
  const bc = breadcrumb(lang, [[s.crumb, '/ai-training/'], [name, path]]);
  const faq = [...t.faq, ...s.faq.map(([q, a]) => [q.replace('How much does it cost?', `How much does ${name} training cost?`).replace('费用是多少？', `${name} 培训费用是多少？`), a])];
  const others = TOOL_PAGES.filter((k) => k !== key);
  return {
    title: t.title, description: t.description, view: 'tool_training_view', bodyClass: 'training-page tool-page',
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${s.eyebrow}</p><h1 class="brand-hero-title" style="max-width:1080px">${t.h1}</h1><p class="lead" style="max-width:780px">${t.sub}</p>
<div class="cta-row"><a class="btn btn-primary" id="hero-cta" href="#quote" data-event="quote_cta_click" data-pos="${key}-hero">${s.getQuote}</a><a class="btn btn-secondary" href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="${key}-hero">${s.book}</a></div>
<div class="stat-cards" style="margin-top:32px">${s.stats.map(([b, x]) => `<div><b>${b}</b><span>${x}</span></div>`).join('')}</div></div></section>

<section class="sec tight" id="outcomes"><div class="wrap">${head(t.whyK, t.whyH)}<ul class="ticks arrow">${t.why.map((x) => `<li><span>${x}</span></li>`).join('')}</ul></div></section>

<section class="sec tight" id="curriculum"><div class="wrap">${head(t.modK, t.modH)}
<div class="g3">${t.mods.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>

<section class="sec tight" id="workflows"><div class="wrap">${head(t.wfK, t.wfH)}
<div class="g4">${t.wfs.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>

<section class="sec tight" id="data"><div class="wrap"><div class="big-card oakc"><h2>${t.dataH}</h2><p>${t.dataP}</p></div></div></section>

${sharedBlocks(lang, key)}

<section class="sec tight" id="other-tools"><div class="wrap">${head(s.otherK, s.otherH)}
<div class="g3">${others.map((k) => `<a class="card" href="${L(lang, pathOf(k))}" style="text-decoration:none;color:inherit"><h3>${NAME[k]} ${zh ? '培训' : 'training'} →</h3><p>${TOOLS[k][lang].description.split(/[:：]/)[0]}</p></a>`).join('')}</div></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${s.faqK}</div><h2 style="font-size:clamp(32px,3.6vw,52px)">${s.faqH(name)}</h2></div>
<div class="faq" style="grid-column:6 / span 7">${faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>

${quickQuote(lang, { tool: key, path })}`,
    jsonld: [
      BUSINESS_REF, person(),
      { '@type': 'Service', '@id': `${url}#service`, name: t.title.split(' | ')[0], serviceType: s.ldType(name), description: t.description, url,
        provider: { '@id': `${SITE}/#business` }, availableLanguage: ['en', 'zh'], areaServed: AREA,
        audience: { '@type': 'BusinessAudience', audienceType: zh ? '企业团队' : 'Business teams' } },
      faqPage(faq, `${url}#faq`), bc.ld,
    ],
  };
};

export const pages = TOOL_PAGES.map((k) => ({ path: pathOf(k), priority: 0.8, changefreq: 'monthly', en: page(k, 'en'), zh: page(k, 'zh') }));
