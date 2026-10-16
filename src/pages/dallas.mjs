// /ai-training/dallas/ — the one page that owns the local intent "AI training Dallas / Dallas–Fort Worth" (decided 2026-10-13 after the
// visibility probe in docs/ai-search-visibility-2026-10-13.md: every competitor ranking above us had a dedicated Dallas page; we had
// three pages sharing the term). The home page and /ai-training/ stay brand + corporate-training pages and link here; the onsite
// offer page keeps the format, this page keeps the place. Every number comes from src/content/events.mjs (Luma) or config PROOF.
// JSON-LD: business + person + a Service with the DFW area + FAQPage + breadcrumbs. No Review/AggregateRating (self-serving), no
// Offer price except the approved program price in the shared Service, no unapproved format prices anywhere on the page.
import { SITE, GBP_URL, PROOF, PROGRAM_PRICE, TRAINING, OFFERS } from '../config.mjs';
import { planBtn, ctaBand, L } from '../layout.mjs';
import { breadcrumb } from '../components.mjs';
import { business, person, faqPage, AREA } from '../schema.mjs';
import { chooser } from './offers.mjs';
import { EVENTS, VENUES, EVENT_STATS, LUMA_PROFILE, EVENTS_CHECKED_ON, eventDate } from '../content/events.mjs';

const PATH = '/ai-training/dallas/';
const S = TRAINING.sessions, M = TRAINING.sessionMin;

// Photos: 1600px webp + jpg pairs in img/events/ (originals and GBP copies in img/events/raw/, gitignored). All are ours.
const PHOTOS = [
  ['dallas-hackathon-room-teams-building', 1600, 900, { en: 'Teams building at the Dallas AI hackathon, April 18, 2026', zh: '2026 年 4 月 18 日达拉斯 AI 黑客松，各组在现场开工' }],
  ['dallas-hackathon-final-presentations', 1600, 900, { en: 'Final presentations at the Dallas AI hackathon', zh: '达拉斯 AI 黑客松的最终演示' }],
  ['dfwit-fireside-2026-07-25-jack-podium', 1600, 1066, { en: 'Jack Qian speaking at the DFW IT Association fireside chat, Plano, July 25, 2026', zh: '2026 年 7 月 25 日，Jack Qian 在 Plano 为 DFW IT Association 的炉边谈话主讲' }],
  ['dallas-session3-group-demo', 1600, 1066, { en: 'A group demo at the AI workflow automation session in Dallas, July 18, 2026', zh: '2026 年 7 月 18 日达拉斯 AI 工作流自动化分享会上的小组演示' }],
  ['dallas-hackathon-team-laptops', 1600, 900, { en: 'A hackathon team working through a workflow on laptops', zh: '黑客松上的一个小组围着笔记本电脑推进工作流' }],
  ['dallas-session3-audience-view', 1600, 1066, { en: 'The room at a Dallas community AI session', zh: '达拉斯社区 AI 分享会的课堂' }],
];

const C = {
  en: {
    title: 'Corporate AI Training & Workshops in Dallas–Fort Worth | AI Man Jack',
    description: `Hands-on AI training for Dallas–Fort Worth teams, onsite or live online. ${EVENT_STATS.hosted} community sessions, ${EVENT_STATS.registrations} sign-ups and ${PROOF.reviews} Google reviews at ${PROOF.rating} in 2026. From ${PROGRAM_PRICE}/person.`,
    og: { title: 'Corporate AI training & workshops in Dallas–Fort Worth', description: `Onsite in Dallas, Plano, Frisco, Richardson or Fort Worth, or live online. Real sessions, real sign-up counts, real reviews. From ${PROGRAM_PRICE}/person.` },
    crumb: 'Dallas–Fort Worth',
    eyebrow: 'Dallas · Plano · Frisco · Richardson · Irving · McKinney · Fort Worth · Live online across the U.S. · English or Chinese',
    h1: 'AI training for <em>Dallas–Fort Worth</em> business teams, built on the work you already do',
    sub: `Jack Qian has taught hands-on AI sessions to more than ${Math.floor(EVENT_STATS.registrations / 100) * 100} sign-ups across Dallas and Plano in 2026 and trains company teams the same way: one real task per person, a company-approved tool, a workflow you can check. Onsite at your office anywhere in the metroplex, or live online.`,
    seeSessions: 'See the sessions',
    stats: [[String(EVENT_STATS.hosted), `community AI sessions hosted in Dallas–Fort Worth since April 2026`], [String(EVENT_STATS.registrations), `sign-ups across those sessions (Luma, checked ${EVENTS_CHECKED_ON})`], [`${PROOF.rating} ★`, `<a href="${GBP_URL}" target="_blank" rel="noopener">${PROOF.reviews} Google reviews ↗</a>`]],
    galK: 'Real rooms', galH: 'What the sessions look like',
    evK: 'Track record', evH: `${EVENT_STATS.hosted} sessions in Dallas–Fort Worth in 2026, plus one invitation`,
    evP: `Every row is a real event with a public sign-up page. Registrations are the sign-up counts shown on Luma on ${EVENTS_CHECKED_ON}; the number of people in the room is usually a little lower. The DFW IT Association talk was by invitation, so it is listed but not counted.`,
    evHead: ['Date', 'Session', 'Where', 'Sign-ups'], evSpeaker: 'Invited speaker', evMore: 'All sessions and the next one on Luma ↗',
    dfwK: 'Invited to speak', dfwH: 'DFW IT Association fireside chat, July 25, 2026',
    dfwP: ['The DFW IT Association invited Jack as the featured speaker for a fireside chat at Schimelpfenig Library in Plano: “Work Smarter, Think Deeper, Live Better — Leveraging AI to Elevate Your Work, Skills & Life.”', 'The session covered AI productivity tools and workflows, turning experience into reusable assets, a personal knowledge base in Obsidian, how to communicate with AI effectively, and what AI changes about careers. It is the same material the company training is built from, delivered to a room of IT professionals who had not met Jack before.'],
    whereK: 'Where we train', whereH: 'Community sessions in Dallas and Plano. Company training at your office.',
    whereVenuesH: 'Community session venues', whereOnsiteH: 'Onsite for companies', whereRemoteH: 'Live online',
    whereOnsite: 'At your office anywhere in Dallas–Fort Worth: Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Irving, Arlington, Carrollton, Garland and everywhere between. Elsewhere in Texas on request, with travel quoted separately.',
    whereRemote: 'Any team in the U.S., over video. The four-session program and the 90-minute workshop both run remotely; the full onsite day does not.',
    whereNeed: 'For an onsite day we need a room with a screen or projector, reliable Wi-Fi, and a laptop per attendee with access to the approved AI tool.',
    toolsK: 'Tools', toolsH: 'ChatGPT, Microsoft Copilot, Claude or Gemini — whichever your company has approved',
    toolsP: 'The method is the same across tools: pick a task, give the AI a work instruction, turn the chat into a workflow, verify the output, and write down which data may go in. The first thing covered in any Dallas session is the last point.',
    tools: [['ChatGPT', 'The default for most small and mid-sized teams: drafting, summarizing, extracting fields from documents, first-pass research. We cover Projects and custom instructions so a team’s approved sources travel with the chat.'], ['Microsoft Copilot', 'For companies on Microsoft 365: AI inside Word, Excel, Outlook and Teams, with the data boundary your IT team already manages. Most Dallas companies we meet are here.'], ['Claude', 'Long documents, careful writing and reviewing, and Projects that hold a team’s approved material. Our own workflows are built on it.'], ['Gemini', 'For teams in Google Workspace: Docs, Sheets and Gmail, plus NotebookLM for working through a stack of documents.']],
    revK: 'Reviewed on Google', revH: 'What Dallas attendees say', revP: `${PROOF.rating} across ${PROOF.reviews} Google reviews. Checked ${PROOF.reviewsCheckedOn}.`, revMore: `Read all ${PROOF.reviews} on Google →`, revBy: 'Google review · Dallas AI session',
    rev: [['Jason Jia', '“Jack is very professional. His professionalism comes not only from his knowledge of AI, but also from how he teaches us different workflows. What makes him stand out is that he uses real-life examples and teaches us how to use these tools in our day-to-day work.”'], ['emily xu', '“I had such a great experience at this AI workshop. It was practical, inspiring, and genuinely fun. Jack, the host, did an amazing job of breaking down complex AI concepts in a way that was easy to understand…”'], ['U Rachel', '“I really enjoyed Jack’s AI seminar! He has a very forward-thinking perspective on AI and does a great job of explaining everything from understanding AI to actually using it in real life…”'], ['Dian Fan', '“Jack is amazingly energetic and sharp. He is in the cutting edge of tools and technologies.”'], ['Yuqi Guan', '“This AI course was very informative and easy to follow. It covered the fundamentals of AI and its basic applications, making it especially suitable for beginners with little or no prior experience.”']],
    whyK: 'Why a local trainer', whyH: 'Someone who will be in the room, and in the city afterwards',
    why: ['Jack lives in the Dallas area, runs the community sessions himself and teaches company sessions himself. There is no sales team and no subcontracted trainer.', 'Sessions run in English or Chinese. The 2026 community series ran in Chinese; company sessions run in whichever language the room works in, with materials in both.', 'Two weeks after a program ends, Jack checks which workflows were kept, changed or stopped. Attendance and satisfaction scores are not the measure.'],
    bioK: 'Who teaches it', bio: '“I run free community AI sessions here in Dallas because useful AI education should be accessible, and I teach companies the same way. Every session starts with one real task and an honest answer about whether AI belongs there.”', bioBy: 'founder, AI Man Jack', bioMore: 'More about Jack →',
    faqK: 'Common questions', faqH: 'AI training in Dallas–Fort Worth, answered plainly',
    faq: [
      ['Do you come onsite to Plano, Frisco or Fort Worth?', 'Yes. Onsite training runs at your office anywhere in Dallas–Fort Worth — Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Irving, Arlington and the cities between. Elsewhere in Texas is available on request, with travel quoted separately. Remote sessions over video are available anywhere in the U.S.'],
      ['How many people can you train at once?', 'It is agreed in the quote. Every format is hands-on, so Jack needs to see each person’s workflow; a larger group is split into two sessions or run as a full onsite day with department blocks. The four-session program is priced per person, so a team of four and a team of fourteen both work.'],
      ['What does AI training cost in Dallas?', `The ${S}-session customized program starts at ${PROGRAM_PRICE} per person and includes four live ${M}-minute sessions; team pricing depends on group size, goals and preparation. The 90-minute team workshop and the full onsite day are priced by scoped quote. You receive a written scope and price before anything is agreed.`],
      ['Is the training in English or Chinese?', 'Either. The 2026 community series in Dallas ran in Chinese; company sessions run in whichever language the room works in, and the materials come in both.'],
      ['Which AI tools do you teach?', 'Whichever your company has already approved — ChatGPT, Microsoft Copilot, Claude or Gemini. If none is approved yet, we agree on one before the first session. The method is the same across tools, and the first thing covered is which data may go into a tool and which may not.'],
      ['What do we need to prepare?', 'Each attendee brings two or three tasks they repeat every week and a laptop with access to the approved tool. For an onsite day, a room with a screen and reliable Wi-Fi. No slides, no homework, no coding.'],
      ['How is this different from a public AI class in Dallas?', 'There is no product tour and no certificate. People work on their own tasks, with their own company’s rules on data, and at least one output in every session is deliberately flawed so the team learns what to check before anything goes out. Two weeks later we check what was kept.'],
      ['Can we attend a community session before booking?', `Yes. The community sessions in Dallas are free and listed on Luma, where you can see the next date. Come, watch how a session runs, then decide. ${EVENT_STATS.registrations} people signed up for them in 2026.`],
    ],
    ld: { name: 'AI Training for Dallas–Fort Worth Teams', desc: `Hands-on corporate AI training for business teams in Dallas–Fort Worth: onsite at the company’s office in Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Irving or Arlington, or live online. Taught by Jack Qian in English or Chinese. ${S} live ${M}-minute sessions from ${PROGRAM_PRICE} per person; 90-minute workshop and full onsite day by scoped quote.` },
  },
  zh: {
    title: '达拉斯—沃斯堡企业 AI 培训与团队工作坊 | AI Man Jack',
    description: `为达拉斯—沃斯堡团队提供实操 AI 培训，上门或线上直播。2026 年已办 ${EVENT_STATS.hosted} 场社区活动、${EVENT_STATS.registrations} 人报名，Google ${PROOF.reviews} 条评价 ${PROOF.rating} 分。每人 ${PROGRAM_PRICE} 起。`,
    og: { title: '达拉斯—沃斯堡团队 AI 培训', description: `Dallas、Plano、Frisco、Richardson、Fort Worth 上门，或线上直播。真实活动、真实报名数、真实评价。每人 ${PROGRAM_PRICE} 起。` },
    crumb: '达拉斯—沃斯堡',
    eyebrow: 'Dallas · Plano · Frisco · Richardson · Irving · McKinney · Fort Worth · 全美线上直播 · 中英文授课',
    h1: '<em>达拉斯—沃斯堡</em>企业团队的 AI 培训，从你手头的工作出发',
    sub: `2026 年，Jack Qian 在 Dallas 和 Plano 办的实操 AI 分享会累计超过 ${Math.floor(EVENT_STATS.registrations / 100) * 100} 人报名；给企业团队上课用的是同一套方法：每人一项真实任务、一个公司批准的工具、一条能核验的工作流。到你公司现场，大都会区内任何地方都可以，也可以线上直播。`,
    seeSessions: '看看办过的活动',
    stats: [[String(EVENT_STATS.hosted), '场社区 AI 活动，2026 年 4 月起在达拉斯—沃斯堡举办'], [String(EVENT_STATS.registrations), `人报名（Luma 数据，核对于 ${EVENTS_CHECKED_ON}）`], [`${PROOF.rating} ★`, `<a href="${GBP_URL}" target="_blank" rel="noopener">${PROOF.reviews} 条 Google 评价 ↗</a>`]],
    galK: '真实课堂', galH: '活动现场是什么样',
    evK: '活动记录', evH: `2026 年在达拉斯—沃斯堡办了 ${EVENT_STATS.hosted} 场，另受邀主讲 1 场`,
    evP: `每一行都是有公开报名页的真实活动。报名数是 ${EVENTS_CHECKED_ON} 在 Luma 上看到的数字，实际到场通常略少。DFW IT Association 那场是受邀主讲，列出但不计入。`,
    evHead: ['日期', '活动', '地点', '报名'], evSpeaker: '受邀主讲', evMore: '全部活动和下一场，见 Luma ↗',
    dfwK: '受邀主讲', dfwH: 'DFW IT Association 炉边谈话，2026 年 7 月 25 日',
    dfwP: ['DFW IT Association 邀请 Jack 作为特邀讲者，在 Plano 的 Schimelpfenig 图书馆做了一场炉边谈话：“Work Smarter, Think Deeper, Live Better — 用 AI 提升你的工作、技能与生活”。', '内容包括 AI 生产力工具与工作流、把经验沉淀成可复用的资产、用 Obsidian 搭建个人知识库、如何有效地跟 AI 沟通，以及 AI 会怎样改变职业。企业培训用的正是同一套材料，这次讲给了一屋子此前并不认识 Jack 的 IT 从业者。'],
    whereK: '在哪里上课', whereH: '社区活动在 Dallas 和 Plano。企业培训到你公司现场。',
    whereVenuesH: '社区活动场地', whereOnsiteH: '企业上门', whereRemoteH: '线上直播',
    whereOnsite: '到贵公司现场，达拉斯—沃斯堡任何地方都可以：Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Irving、Arlington、Carrollton、Garland 及周边。德州其他城市可按需安排，差旅另行报价。',
    whereRemote: '全美任何团队，视频直播。四次课程项目和 90 分钟工作坊都可以远程；全天上门培训不行。',
    whereNeed: '上门培训需要一间有投影或大屏幕、Wi-Fi 稳定的会议室，每位学员一台能访问已批准 AI 工具的笔记本电脑。',
    toolsK: '工具', toolsH: 'ChatGPT、Microsoft Copilot、Claude 或 Gemini，用贵公司批准的那一个',
    toolsP: '方法在各种工具上是一样的：选任务、给 AI 一份工作指令、把对话变成工作流、核验输出、写清楚哪些数据可以输入。在达拉斯的每一场，最先讲的都是最后这一条。',
    tools: [['ChatGPT', '多数中小团队的默认选择：起草、摘要、从文件里提取字段、初步调研。我们会讲 Projects 和自定义指令，让团队批准过的资料跟着对话走。'], ['Microsoft Copilot', '用 Microsoft 365 的公司：AI 直接在 Word、Excel、Outlook 和 Teams 里，数据边界由你们的 IT 团队本来就在管。我们见到的达拉斯企业大多在这里。'], ['Claude', '长文档、需要斟酌的写作和审阅，以及能装下团队批准材料的 Projects。我们自己的工作流就建在它上面。'], ['Gemini', '用 Google Workspace 的团队：Docs、Sheets、Gmail，再加上用 NotebookLM 啃一摞文档。']],
    revK: 'Google 评价', revH: '达拉斯学员怎么说', revP: `Google 上共 ${PROOF.reviews} 条评价，平均 ${PROOF.rating} 分。核对于 ${PROOF.reviewsCheckedOn}。`, revMore: `查看全部 ${PROOF.reviews} 条评价 →`, revBy: 'Google 评价 · 达拉斯 AI 活动（译自英文原评）',
    rev: [['Jason Jia', '“Jack 非常专业。这种专业不只来自他对 AI 的了解，更来自他教我们不同工作流的方式。他的特别之处在于用真实例子，教我们把这些工具用到日常工作里。”'], ['emily xu', '“这次 AI 工作坊的体验非常好：实用、有启发，而且真的很有趣。Jack 把复杂的 AI 概念讲解得通俗易懂……”'], ['U Rachel', '“非常喜欢 Jack 的 AI 讲座！他对 AI 有很前瞻的视角，从理解 AI 到在实际生活中使用，都讲得非常清楚……”'], ['Dian Fan', '“Jack 精力充沛、思路敏锐，对工具和技术的前沿了如指掌。”'], ['Yuqi Guan', '“这门 AI 课程信息量大、容易跟上，涵盖了 AI 的基础知识和基本应用，尤其适合几乎没有相关经验的初学者。”']],
    whyK: '为什么找本地讲师', whyH: '一个会出现在课堂上、课后也还在这座城市的人',
    why: ['Jack 住在达拉斯地区，社区活动自己办，企业课程自己讲。没有销售团队，也不外包讲师。', '中英文授课。2026 年的社区系列用中文；企业课程用团队最顺手的语言，资料中英文都有。', '课程项目结束两周后，Jack 会回访：哪些工作流留下了、改了、停了。出勤率和满意度不是衡量标准。'],
    bioK: '授课讲师', bio: '“我在达拉斯办免费的社区 AI 活动，因为实用的 AI 教育应当人人可及；给企业上课，我也用同样的方式。每一次课程都从一项真实任务开始，并坦诚回答：这件事是否真的适合交给 AI。”', bioBy: 'AI Man Jack 创始人', bioMore: '了解更多 →',
    faqK: '常见问题', faqH: '关于达拉斯—沃斯堡的 AI 培训，直接回答',
    faq: [
      ['可以到 Plano、Frisco 或 Fort Worth 上门吗？', '可以。上门培训覆盖达拉斯—沃斯堡任何地方：Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Irving、Arlington 及中间的城市。德州其他城市可按需安排，差旅另行报价。全美范围内都可以视频远程。'],
      ['一次能培训多少人？', '在报价中确定。每种形式都是实操，Jack 需要看到每个人的工作流；人多的团队拆成两场，或者安排成按部门分块的全天上门培训。四次课程项目按人计价，四个人的团队和十四个人的团队都可以。'],
      ['在达拉斯做 AI 培训要多少钱？', `四次定制课程项目每人 ${PROGRAM_PRICE} 起，包含四节 ${M} 分钟实时课程；团队价格取决于人数、目标和准备工作量。90 分钟团队工作坊和全天上门培训按需报价。在确认任何安排之前，你都会先收到书面的范围和报价。`],
      ['中文还是英文授课？', '都可以。2026 年在达拉斯办的社区系列用中文；企业课程用团队最顺手的语言，资料提供中英文两个版本。'],
      ['教哪些 AI 工具？', '贵公司已经批准的那个：ChatGPT、Microsoft Copilot、Claude 或 Gemini。还没批准任何工具的，第一节课之前先商定一个。方法在各种工具上通用，最先讲的是哪些数据能输入工具、哪些不能。'],
      ['我们需要准备什么？', '每位学员带两三项每周重复的任务，以及一台能访问已批准工具的笔记本电脑。上门培训还需要一间有屏幕、Wi-Fi 稳定的会议室。不用做幻灯片，没有作业，不用写代码。'],
      ['和达拉斯的公开 AI 课有什么不同？', '没有产品导览，也不发证书。每个人做的是自己的任务，遵守自己公司的数据规则；每场至少有一个刻意做错的输出，让团队学会东西发出去之前该查什么。两周后再看留下了什么。'],
      ['预约之前可以先来参加一次社区活动吗？', `可以。达拉斯的社区活动免费，都在 Luma 上，能看到下一场的日期。来看看一场活动是怎么进行的，再决定。2026 年有 ${EVENT_STATS.registrations} 人报名参加过。`],
    ],
    ld: { name: '达拉斯—沃斯堡企业团队 AI 培训', desc: `面向达拉斯—沃斯堡企业团队的实操 AI 培训：到公司现场（Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Irving、Arlington）或线上直播。Jack Qian 中英文授课。${S} 节 ${M} 分钟实时课程每人 ${PROGRAM_PRICE} 起；90 分钟工作坊和全天上门培训按需报价。` },
  },
};

const page = (lang) => {
  const c = C[lang], zh = lang === 'zh', url = `${SITE}${L(lang, PATH)}`;
  const bc = breadcrumb(lang, [[zh ? 'AI 培训' : 'AI training', '/ai-training/'], [c.crumb, PATH]]);
  const head = (k, h, p, more) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div>${more || ''}</div>`;
  const venues = Object.entries(VENUES).filter(([k]) => k !== 'online').map(([k, v]) => `<dt>${v[lang]}</dt><dd>${EVENTS.filter((e) => e.venue === k).map((e) => eventDate(e.date, lang)).join(' · ')}</dd>`).join('');
  const rows = EVENTS.map((e) => `<tr><th scope="row"><time datetime="${e.date}">${eventDate(e.date, lang)}</time></th><td data-label="${c.evHead[1]}">${e[lang]}${e.org ? ` <span class="muted">· ${e.org}</span>` : ''}</td><td data-label="${c.evHead[2]}">${VENUES[e.venue].short[lang]}</td><td data-label="${c.evHead[3]}">${e.role === 'speaker' ? c.evSpeaker : e.registrations}</td></tr>`).join('');
  return {
    title: c.title, description: c.description, og: c.og, view: 'dallas_page_view', bodyClass: 'training-page dallas-page',
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${c.eyebrow}</p><h1 class="brand-hero-title" style="max-width:1080px">${c.h1}</h1><p class="lead" style="max-width:760px">${c.sub}</p>
<div class="cta-row">${planBtn(lang, { pos: 'dallas-hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="#sessions" data-event="dallas_sessions_click" data-pos="dallas-hero">${c.seeSessions}</a></div>
<div class="stat-cards" style="margin-top:32px">${c.stats.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div></div></section>

<section class="sec tight" id="photos"><div class="wrap">${head(c.galK, c.galH)}
<div class="g3">${PHOTOS.map(([f, w, h, alt], i) => `<figure class="art-fig"><img src="/img/events/${f}.webp" width="${w}" height="${h}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" alt="${alt[lang]}"><figcaption>${alt[lang]}</figcaption></figure>`).join('')}</div></div></section>

<section class="sec" id="sessions"><div class="wrap">${head(c.evK, c.evH, c.evP, `<a class="more" href="${LUMA_PROFILE}" target="_blank" rel="noopener">${c.evMore}</a>`)}
<div class="table-wrap"><table class="events-t"><caption class="sr-only">${c.evH}</caption><thead><tr>${c.evHead.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></div></section>

<section class="split-photo" id="dfw-it"><img src="/img/events/dfwit-fireside-2026-07-25-two-speakers.webp" width="1600" height="1066" loading="lazy" decoding="async" alt="${zh ? 'Jack Qian 与联合讲者在 DFW IT Association 炉边谈话上答问' : 'Jack Qian and a co-speaker taking questions at the DFW IT Association fireside chat'}">
<div><div class="eyebrow">${c.dfwK}</div><h2>${c.dfwH}</h2>${c.dfwP.map((p) => `<p>${p}</p>`).join('')}</div></section>

<section class="sec" id="where"><div class="wrap">${head(c.whereK, c.whereH)}
<div class="g3"><div class="oak"><h3>${c.whereVenuesH}</h3><dl class="kv">${venues}</dl></div><div class="oak"><h3>${c.whereOnsiteH}</h3><p>${c.whereOnsite}</p><p class="muted">${c.whereNeed}</p></div><div class="oak"><h3>${c.whereRemoteH}</h3><p>${c.whereRemote}</p></div></div></div></section>

${chooser(lang, { pos: 'dallas' })}

<section class="sec tight" id="tools"><div class="wrap">${head(c.toolsK, c.toolsH, c.toolsP)}
<div class="g4">${c.tools.map(([h, p]) => { const k = { ChatGPT: 'chatgpt', 'Microsoft Copilot': 'copilot', Claude: 'claude' }[h]; return `<div class="card"><h3>${k ? `<a href="${L(lang, `/ai-training/${k}/`)}">${h} ${zh ? '培训' : 'training'} →</a>` : h}</h3><p>${p}</p></div>`; }).join('')}</div>
<p style="margin-top:20px">${zh ? `也教 <a href="${L(lang, '/ai-training/grok/')}">Grok 与 Grok Bot</a>（实时调研和能在你们工具里干活的 AI 智能体）。` : `We also teach <a href="${L(lang, '/ai-training/grok/')}">Grok and Grok Bot</a>: real-time research and AI agents that work inside your tools.`}</p></div></section>

<section class="sec tight" id="testimonials"><div class="wrap">${head(c.revK, c.revH, c.revP, `<a class="more" href="${GBP_URL}" target="_blank" rel="noopener">${c.revMore}</a>`)}
<div class="quote-grid">${c.rev.map(([name, q]) => `<figure class="quote"><span class="stars" aria-label="5 stars">★★★★★</span><blockquote style="margin:0;flex-grow:1"><p>${q}</p></blockquote><figcaption><b>${name}</b> <span>· ${c.revBy}</span></figcaption></figure>`).join('')}</div></div></section>

<section class="sec tight" id="why-local"><div class="wrap">${head(c.whyK, c.whyH)}<ul class="ticks arrow">${c.why.map((x) => `<li><span>${x}</span></li>`).join('')}</ul>
<div class="big-card" style="flex-direction:row;align-items:center;gap:32px;flex-wrap:wrap;margin-top:28px"><img src="/img/jack-portrait-256.webp" width="256" height="256" loading="lazy" decoding="async" alt="Jack Qian" style="width:120px;height:120px;border-radius:50%;object-fit:cover;flex:none">
<div style="display:flex;flex-direction:column;gap:10px;flex:1 1 320px"><div class="eyebrow">${c.bioK}</div><p style="font-size:clamp(17px,1.4vw,20px);line-height:1.6">${c.bio}</p><span style="font-size:15px;color:var(--muted)"><strong style="color:var(--ink)">Jack Qian</strong> · ${c.bioBy}</span></div><a class="more" href="${L(lang, '/about/')}">${c.bioMore}</a></div></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${c.faqK}</div><h2 style="font-size:clamp(32px,3.6vw,52px)">${c.faqH}</h2></div>
<div class="faq" style="grid-column:6 / span 7">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>
${ctaBand(lang, { pos: 'dallas-final' })}`,
    jsonld: [
      business(lang), person(),
      { '@type': 'Service', '@id': `${url}#service`, name: c.ld.name, serviceType: zh ? '企业 AI 培训' : 'Corporate AI training', description: c.ld.desc, url,
        provider: { '@id': `${SITE}/#business` }, availableLanguage: ['en', 'zh'], areaServed: AREA,
        hasOfferCatalog: { '@type': 'OfferCatalog', name: zh ? '团队培训形式' : 'Team training formats', itemListElement: [
          { '@type': 'Offer', itemOffered: { '@id': `${SITE}/#training` } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: zh ? '90 分钟团队 AI 工作坊' : '90-Minute AI Team Workshop', url: `${SITE}${L(lang, OFFERS.workshop.path)}` } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: zh ? '全天上门 AI 培训' : 'Full-Day Onsite AI Training', url: `${SITE}${L(lang, OFFERS.onsite.path)}` } },
        ] } },
      ...Object.entries(VENUES).filter(([, v]) => v.address?.streetAddress).map(([k, v]) => ({ '@type': 'Place', '@id': `${url}#venue-${k}`, name: v.en, address: v.address })),
      faqPage(c.faq, `${url}#faq`), bc.ld,
    ],
  };
};

export const pages = [{ path: PATH, priority: 0.9, changefreq: 'monthly', en: page('en'), zh: page('zh') }];

// Shared with the tool pages (src/pages/tool-training.mjs) so the same verified Google review quotes are used everywhere.
export const REVIEWS = { en: C.en.rev, zh: C.zh.rev, by: { en: C.en.revBy, zh: C.zh.revBy } };
