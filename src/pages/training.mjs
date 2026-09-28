// /ai-training/ — the corporate AI training pillar (design canvas: Training / ZH-Training). Indexable, self-canonical.
import { SITE, EMAIL, SMS_TEL, SMS_DISPLAY, GBP_URL, TRAINING, PROOF, PROGRAM_PRICE, BOOK_URL } from '../config.mjs';
import { planBtn, photoHero, ctaBand, L } from '../layout.mjs';
import { breadcrumb } from '../components.mjs';
import { caseProof, clientProof } from './cases.mjs';
import { business, person, faqPage } from '../schema.mjs';

const SMS = `sms:${SMS_TEL}?body=TRAINING%20-%20`;
const PRICE = `$${TRAINING.halfDayFrom.toLocaleString()}`, MAX = TRAINING.halfDayMax, S = TRAINING.sessions, M = TRAINING.sessionMin;

const C = {
  en: {
    title: 'Customized AI Training for Teams | 4-Session Program | AI Man Jack',
    description: `Four live ${M}-minute AI training sessions built around your real work. Programs start at ${PROGRAM_PRICE}/person. Custom team pricing. Remote across the U.S. and onsite in Dallas–Fort Worth.`,
    og: { title: 'AI Training Built Around the Work You Already Do', description: `Four live ${M}-minute sessions on your real work. Starting at ${PROGRAM_PRICE}/person. Remote across the U.S., onsite in Dallas–Fort Worth, in English or Chinese.`, alt: 'Hands-on AI training for your business or team, in English or Chinese' },
    crumb: 'AI training', eyebrow: 'Customized AI training · Remote across the U.S. · Dallas–Fort Worth onsite · English or Chinese', h1: 'AI training built around the work you <em>already do</em>',
    sub: 'No fixed curriculum. We start with the work you already do, choose the tasks where AI can actually help, and build repeatable workflows together.',
    seePricing: 'See pricing & format', text: 'Prefer to text? Send TRAINING to', heroAlt: 'A full classroom in Dallas at one of Jack Qian’s hands-on AI workshops',
    stats: [[`${PROGRAM_PRICE}/person`, `${S}-session program starts here`], [`${S} × ${M} min`, 'Live sessions'], ['Customized', 'Your work determines the curriculum'], ['Remote U.S.', 'Dallas–Fort Worth onsite available']],
    teamsK: 'Who it’s for', teamsH: 'Owners and teams who don’t write code and do repeat work', teamsP: 'Everyone works on tasks they already do. These are the workflows people build in the sessions.',
    teams: [['sales', 'Sales', ['Account research before a first call, from the prospect’s site and your CRM notes', 'Meeting prep: five points to raise, drafted from last call’s notes', 'Follow-up emails drafted from call notes, in your voice', 'First-draft proposals from an approved template']], ['operations', 'Operations', ['The same weekly report, built from the same spreadsheet, every week', 'Process documentation from a recorded walkthrough', 'Meeting notes turned into action items with owners', 'Fields pulled out of invoices, forms and PDFs into a table']], ['marketing', 'Marketing', ['Research synthesis from a stack of articles into one brief', 'Campaign briefs from a filled-in template', 'One piece of content repurposed into three formats', 'Performance summaries from exported numbers']], ['leaders', 'Leaders & managers', ['Which tasks are worth AI, scored on four questions', 'Where a human must sign off before an output is used', 'What data may go into a tool and what may not', 'A two-week check: keep, change or stop each workflow']], ['owners', 'Owners & operators', ['Website updates and content', 'Research and decision support', 'SOPs and recurring admin', 'Marketing workflows', 'Day-to-day business operations']]],
    curK: 'What we cover', curH: 'Task first, tool second.', curP: 'Non-technical teams arrive overwhelmed by AI products, or with an impressive chatbot answer that doesn’t fit their job. A product tour makes both worse. So every session works through one real task in five parts.', curNote: 'Two weeks later: was it tested, was it accurate enough to use, should it continue, change or stop?',
    cur: [['Choose a suitable task', 'Each person lists three things they repeat every week and scores them: often enough to matter, clear input and output, quick to check, testable without sensitive information.', '“Prepare a five-point meeting brief from these approved notes” is teachable. “Run my department” is not.'], ['Give the AI useful context', 'A prompt is a work instruction, not a secret formula: a goal, an approved source, constraints, a usable format, and what to flag for a person to verify.'], ['Move from chat to workflow', 'A chat produces an answer. A workflow moves information through steps: collect approved notes, extract decisions, identify owners, draft follow-ups, put the result in a review queue.', 'This is where a team learns the difference between a chatbot and an agent.'], ['Verify the output', 'Can every claim be traced to the source? What context is missing? Who approves it before use? At least one output in every session is deliberately flawed — finding it teaches more than another perfect demo.'], ['Apply data and approval guardrails', 'Every participant leaves with a clear answer to three questions: which tools are approved, which information is off-limits, and where a human must sign off.']],
    fmtK: 'Formats and pricing', fmtH: 'Ways to work together', fmtP: 'All three follow the same five parts. The four-session program goes furthest: you use the workflows between sessions, and the next session fixes what broke.',
    fmt: [
      { k: 'Core program', big: `${S} sessions`, sub: `${S} × ${M}-minute live sessions`, chip: `Starting at ${PROGRAM_PRICE}/person`,
        p: 'This is the core AI Man Jack program. Instead of following a fixed curriculum, the sessions are designed around the work you or your team already does.',
        items: ['Session 1: identify the right tasks and build the first workflow', 'Session 2: improve context, inputs and repeatability', 'Session 3: connect the workflow to the way the business actually operates', 'Session 4: review what worked, fix what broke and create a repeatable playbook'],
        note: 'Exact content changes based on the business. Custom team pricing available.' },
      { k: 'Team session', big: '90 min', sub: 'One task · one live build · one checklist', items: ['A live build on a task taken from your team, not a canned demo', 'The five-part instruction template, reusable the same afternoon', 'A one-page verification checklist'], cta: 'Ask about a 90-minute session', note: 'Good for a first look across a whole department.' },
      { k: 'Workshop', big: 'Half day', sub: 'Everyone builds · bring laptops and one real task each', items: ['Each person leaves with a working workflow for a task they already do', 'A deliberately flawed output to catch', 'A pilot plan with an owner, a tool and a first test date'], cta: 'Ask about a half-day workshop', note: `From ${PRICE} · up to ${MAX} people. This is the format the Google reviews are about.` },
    ],
    revK: 'Reviewed on Google', revH: 'What attendees say', revP: `${PROOF.rating} across ${PROOF.reviews} Google reviews, all from people who came to a community AI workshop in Dallas.`, revMore: `Read all ${PROOF.reviews} on Google →`, revBy: 'Google review · Dallas AI workshop',
    rev: [['emily xu', '“I had such a great experience at this AI workshop. It was practical, inspiring, and genuinely fun. Jack, the host, did an amazing job of breaking down complex AI concepts in a way that was easy to understand…”'], ['U Rachel', '“I really enjoyed Jack’s AI seminar! He has a very forward-thinking perspective on AI and does a great job of explaining everything from understanding AI to actually using it in real life…”'], ['Yuqi Guan', '“This AI course was very informative and easy to follow. It covered the fundamentals of AI and its basic applications, making it especially suitable for beginners with little or no prior experience.”']],
    fromK: 'Where the method came from', fromH: 'Five talks, one hackathon, and a lot of rewriting.', fromP: 'The task-scoring exercise, the deliberately flawed output, the two-week check-in — each one earned its place by working in front of fifty people, or got cut. The five parts above are the ones that survived.', fromAlt: 'Jack Qian teaching a hands-on community AI workshop in Dallas',
    faqK: 'Common questions', faqH: 'The training, answered plainly',
    faq: [['Who is the AI training for?', 'Business owners and non-technical teams that do repeat knowledge work — sales, operations, marketing, admin, planning, customer service and the managers who lead them. No coding is required. Everyone works on tasks they already do.'], ['What do people actually build during the training?', 'Working workflows for tasks they already do every week — a meeting brief from approved notes, a first-draft customer reply, a weekly report pulled from a spreadsheet, a website update. The first one runs by the end of the first session; the next sessions improve it and add the next task. Each person also leaves with a checklist for verifying the output before it goes out.'], ['Is the training in English or Chinese?', 'Either. The community series in Dallas in 2026 ran in Chinese; company sessions run in whichever language the room works in, and the materials come in both.'], ['Which AI tools does the training use?', 'Whatever your company has already approved — ChatGPT, Claude, Gemini, Copilot. The method is the same across tools. The first thing covered is which data may go into a tool and which may not.'], ['How much does the training cost?', `The ${S}-session customized program starts at ${PROGRAM_PRICE} per person and includes four live ${M}-minute sessions. Team pricing is customized based on group size, goals and how much preparation is required. 90-minute sessions and half-day workshops (from ${PRICE} for up to ${MAX} people) are also available for teams that want a shorter format. <a href="/book/">Book a 30-minute workflow call</a> and you’ll have a recommendation and a written price within 24 hours.`], ['How do you know whether the training worked?', 'Each session starts with what happened since the last one: which workflow was used on real work, whether the result was accurate enough to use, and where review took too long. Two weeks after the last session we check again whether each workflow should continue, change or stop. Attendance and satisfaction scores are not the measure.'], ['Is the training remote, or can it run at our office?', 'Remote training is available anywhere in the U.S., over video. Onsite sessions are available across Dallas–Fort Worth — Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington, and everywhere between.']],
    bioK: 'Who teaches it', bio: '“I run community AI workshops here in Dallas because useful AI education should be accessible, and I teach companies the same way. Every session starts with one real task and an honest answer about whether AI belongs there.”', bioBy: 'founder, AI Man Jack', bioMore: 'More about Jack →',
  },
  zh: {
    title: '为团队定制的 AI 培训 | 四次课程项目 | AI Man Jack',
    description: `四节 ${M} 分钟的实时 AI 培训课，围绕你的真实工作设计。每人 ${PROGRAM_PRICE} 起，团队可定制报价。全美远程授课，达拉斯—沃斯堡可上门。`,
    og: { title: '围绕你手头工作设计的 AI 培训', description: `四节 ${M} 分钟实时课程，围绕真实工作展开。每人 ${PROGRAM_PRICE} 起。全美远程，达拉斯—沃斯堡可上门，中英文授课。`, alt: '为企业和团队定制的实操型 AI 培训，中英文授课' },
    crumb: 'AI 培训', eyebrow: '定制 AI 培训 · 全美远程 · 达拉斯—沃斯堡可上门 · 中英文授课', h1: '围绕你<em>手头工作</em>设计的<br>AI 培训',
    sub: '没有固定大纲。我们从你已经在做的工作出发，挑出 AI 真正帮得上忙的任务，一起搭建可复用的工作流。',
    seePricing: '查看价格与形式', text: '更习惯短信？发送 TRAINING 至', heroAlt: '达拉斯，Jack Qian 主讲的一场 AI 实操工作坊，教室座无虚席',
    stats: [[`${PROGRAM_PRICE}/人`, '四次课程项目起步价'], [`${S} × ${M} 分钟`, '实时课程'], ['定制', '课程内容由你的工作决定'], ['全美远程', '达拉斯—沃斯堡可上门']],
    teamsK: '适用对象', teamsH: '适合不写代码、但有大量重复性工作的老板和团队', teamsP: '每个人都基于自己已有的工作任务练习。以下是课程中实际搭建过的工作流。',
    teams: [['sales', '销售', ['首次通话前的客户调研：基于对方官网与 CRM 记录', '会前准备：根据上次通话记录整理五个要点', '根据通话记录起草跟进邮件，保持个人风格', '基于已审批模板生成方案初稿']], ['operations', '运营', ['基于同一份表格，每周生成固定格式的周报', '根据操作录屏整理流程文档', '将会议纪要转化为明确负责人的待办事项', '从发票、表单和 PDF 中提取字段并整理成表格']], ['marketing', '市场', ['将大量文章综合为一份研究简报', '根据模板生成投放简报', '将一篇内容改编为三种形式', '根据导出的数据撰写效果总结']], ['leaders', '管理者', ['用四个问题评估哪些任务值得引入 AI', '明确哪些输出在使用前必须由人审批', '规定哪些数据可以输入工具、哪些不可以', '两周复盘：每条工作流是保留、调整还是停止']], ['owners', '老板与经营者', ['网站更新与内容', '调研与决策支持', 'SOP 与日常行政', '市场营销工作流', '日常经营']]],
    curK: '课程内容', curH: '先定任务，再选工具。', curP: '非技术团队通常面临两种困境：要么被层出不穷的 AI 产品弄得无所适从，要么试过聊天机器人、得到了令人印象深刻的回答，却不知道如何融入自己的工作。产品演示只会让问题更严重。因此，每一次课程都围绕一项真实任务，分五个部分展开。', curNote: '两周后回访：是否经过实测？结果是否足够准确？应继续、调整还是停止？',
    cur: [['选择合适的任务', '每位学员列出三项每周重复的工作，并按四个标准打分：频率是否足够高、输入输出能否清晰描述、能否快速核验、能否在不涉及敏感信息的情况下测试。', '“根据这份已批准的会议记录整理五点会议简报”可以教；“帮我管理整个部门”则不行。'], ['为 AI 提供有效上下文', '提示词是一份工作指令，而不是什么秘诀：明确目标、指定可信来源、设定约束、规定输出格式，并标出需要人工核验的内容。'], ['从对话升级为工作流', '对话产出的是一个回答；工作流则让信息按步骤流转：收集已批准的记录、提取决策、明确负责人、起草跟进、进入审核队列。', '团队会在这一步理解聊天机器人与智能体（Agent）的区别。'], ['核验输出结果', '每条结论能否追溯到来源？缺少哪些上下文？使用前由谁审批？每场课程至少有一个刻意设置的错误输出——找出它，比再看一次完美演示更有价值。'], ['落实数据与审批规范', '每位学员都能明确回答三个问题：哪些工具已获批准、哪些信息不得输入、哪些环节必须由人签字确认。']],
    fmtK: '形式与价格', fmtH: '合作方式', fmtP: '三种形式都遵循同样的五个部分。四次课程项目走得最深：课间你会实际使用这些工作流，下一节课再修正出问题的地方。',
    fmt: [
      { k: '核心项目', big: `${S} 节课`, sub: `${S} 节 ${M} 分钟实时课程`, chip: `每人 ${PROGRAM_PRICE} 起`,
        p: '这是 AI Man Jack 的核心项目。不照固定大纲走，每节课都围绕你或团队已经在做的工作来设计。',
        items: ['第 1 节：找准任务，搭建第一条工作流', '第 2 节：完善上下文和输入，让结果稳定可复用', '第 3 节：把工作流接进企业实际的运作方式', '第 4 节：复盘哪些有效、修正出错的地方，沉淀一份可复用的操作手册'],
        note: '具体内容会根据企业情况调整。团队可定制报价。' },
      { k: '团队专题', big: '90 分钟', sub: '一项任务 · 一次现场搭建 · 一份核验清单', items: ['基于团队真实任务的现场演示，而非预设案例', '当天即可复用的五要素指令模板', '一页纸的输出核验清单'], cta: '咨询 90 分钟专题', note: '适合整个部门初步了解。' },
      { k: '工作坊', big: '半天', sub: '人人动手 · 请携带电脑和一项真实任务', items: ['每位学员带走一条针对自身任务的可用工作流', '找出刻意设置的错误输出，养成核验习惯', '一份包含负责人、工具和首次测试日期的试点计划'], cta: '咨询半天工作坊', note: `${PRICE} 起 · 最多 ${MAX} 人。Google 评价所涉及的正是这一形式。` },
    ],
    revK: 'Google 评价', revH: '学员反馈', revP: `Google 上共 ${PROOF.reviews} 条评价，均为 ${PROOF.rating} 分，全部来自参加过达拉斯社区 AI 工作坊的学员。`, revMore: `查看全部 ${PROOF.reviews} 条评价 →`, revBy: 'Google 评价 · 达拉斯 AI 工作坊 （译自英文原评）',
    rev: [['emily xu', '“这次 AI 工作坊的体验非常好：实用、有启发，而且真的很有趣。Jack 把复杂的 AI 概念讲解得通俗易懂……”'], ['U Rachel', '“非常喜欢 Jack 的 AI 讲座！他对 AI 有很前瞻的视角，从理解 AI 到在实际生活中使用，都讲得非常清楚……”'], ['Yuqi Guan', '“这门 AI 课程信息量大、容易跟上，涵盖了 AI 的基础知识和基本应用，尤其适合几乎没有相关经验的初学者。”']],
    fromK: '方法的由来', fromH: '五场讲座、一场黑客松，以及反复打磨。', fromP: '任务评分练习、刻意设置的错误输出、两周回访——每一个环节都在五十人的课堂上经过检验，有效的保留，无效的删除。上面的五个部分，正是经过检验留下来的。', fromAlt: 'Jack Qian 在达拉斯主讲一场社区 AI 实操工作坊',
    faqK: '常见问题', faqH: '关于培训，直接回答',
    faq: [['培训适合哪些人？', '企业老板，以及以非技术背景为主、有大量重复性知识工作的团队：销售、运营、市场、行政、计划、客服，以及带领这些团队的管理者。无需编程，每个人都基于自己已有的任务练习。'], ['学员在培训中实际会搭建什么？', '针对每周固定任务的可用工作流：例如根据已批准的记录整理会议简报、起草客户回复、从表格生成周报，或更新网站内容。第一条在第一节课结束前就能运行，之后的课程继续改进它，并加入下一项任务。每位学员还会带走一份核验清单，用于在输出发出前逐项检查。'], ['培训使用中文还是英文？', '均可。2026 年在达拉斯举办的社区系列讲座以中文进行；企业课程则采用团队最习惯的语言，课程资料提供中英文两个版本。'], ['培训使用哪些 AI 工具？', '使用贵公司已批准的工具，例如 ChatGPT、Claude、Gemini 或 Copilot。方法适用于各类工具。课程首先明确的，是哪些数据可以输入工具、哪些不可以。'], ['培训费用是多少？', `四次定制课程项目每人 ${PROGRAM_PRICE} 起，包含四节 ${M} 分钟的实时课程。团队价格根据人数、目标和所需准备工作量定制。如果希望时间更短，也可以选择 90 分钟专题分享或半天工作坊（${PRICE} 起，最多 ${MAX} 人）。<a href="/zh/book/">预约 30 分钟工作流咨询</a>，24 小时内即可收到建议方案与书面报价。`], ['如何判断培训是否有效？', '每节课都从上次以来的情况开始：哪条工作流用在了真实工作中、结果是否足够准确、哪个核验环节耗时过长。最后一节课结束两周后，我们还会再确认每条工作流应继续、调整还是停止。出勤率与满意度评分不作为衡量标准。'], ['可以远程培训吗？能到我们办公室授课吗？', '都可以。远程培训覆盖全美，通过视频进行。上门授课覆盖达拉斯—沃斯堡都会区，包括 Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及周边城市。']],
    bioK: '授课讲师', bio: '“我在达拉斯举办社区 AI 工作坊，因为实用的 AI 教育应当人人可及；为企业授课，我也秉持同样的方式。每一次课程都从一项真实任务开始，并坦诚回答：这件事是否真的适合交给 AI。”', bioBy: 'AI Man Jack 创始人', bioMore: '了解更多 →',
  },
};
export const TRAINING_FAQ = { en: C.en.faq, zh: C.zh.faq };

// One programme card, shared by / and /ai-training/. The primary card is dark with a filled button; the others are deliberately
// quieter (a text link, price in the note) so the four-session program reads as the default offer.
export const progCard = ({ k, big, sub, chip, p, items, note }, cta, primary) => `<div class="prog${primary ? ' dark on-dark' : ''}"><span class="k">${k}</span><span class="big">${big}</span>${sub ? `<span class="sub">${sub}</span>` : ''}${chip ? `<span class="chip">${chip}</span>` : ''}${p ? `<p${items ? '' : ' class="grow"'}>${p}</p>` : ''}${items ? `<ul class="ticks">${items.map((x) => `<li><span>${x}</span></li>`).join('')}</ul>` : ''}${cta}${note ? `<span class="note">${note}</span>` : ''}</div>`;
export const askLink = (lang, label, pos) => `<a class="more" href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="${pos}">${label} →</a>`;

const page = (lang) => {
  const c = C[lang], bc = breadcrumb(lang, [[c.crumb, '/ai-training/']]);
  const head = (k, h, p, more) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div>${more || ''}</div>`;
  return {
    title: c.title, description: c.description, og: c.og, view: 'training_page_view', hero: 'photo',
    body: `${photoHero({ photo: 'workshop', alt: c.heroAlt, size: 'md', stats: c.stats, inner: `<div class="hero-main stack">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="lg" style="font-size:clamp(44px,6.4vw,92px)">${c.h1}</h1><p style="max-width:720px">${c.sub}</p>
<div class="cta-row" style="gap:20px">${planBtn(lang, { pos: 'training-hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="#formats" data-event="training_program_click" data-pos="training-hero">${c.seePricing}</a><span style="font-size:15px;color:var(--on-photo)">${c.text} <a href="${SMS}" data-event="sms_training_click" data-pos="training-hero">${SMS_DISPLAY}</a></span></div></div>` })}

<section class="sec" id="teams"><div class="wrap">${head(c.teamsK, c.teamsH, c.teamsP)}
<div class="g4">${c.teams.map(([slug, name, items]) => `<div class="oak${slug === 'owners' ? ' wide' : ''}" id="team-${slug}" style="gap:18px;padding:30px 28px"><h3 style="font-size:26px">${name}</h3><ul class="ticks">${items.map((i) => `<li><span>${i}</span></li>`).join('')}</ul></div>`).join('')}</div></div></section>

<section class="sec dark" id="curriculum"><div class="wrap g12">
<div style="grid-column:span 4;display:flex;flex-direction:column;gap:20px"><div class="eyebrow">${c.curK}</div><h2 style="font-size:clamp(36px,4.4vw,64px);line-height:1">${c.curH}</h2><p style="font-size:17px;line-height:1.65">${c.curP}</p><p style="margin-top:12px;padding-top:20px;border-top:1px solid var(--dark-line);font-size:15.5px;line-height:1.65">${c.curNote}</p></div>
<ol class="nums" style="grid-column:6 / span 7">${c.cur.map(([h, p, why], i) => `<li><span class="n">${i + 1}</span><div><h3 style="font-size:26px">${h}</h3><p>${p}</p>${why ? `<span class="why">${why}</span>` : ''}</div></li>`).join('')}</ol></div></section>

${caseProof(lang)}
<section class="sec" id="formats"><div class="wrap">${head(c.fmtK, c.fmtH, c.fmtP)}
<div class="g3" style="align-items:stretch">${c.fmt.map((x, i) => progCard(x, i === 0 ? planBtn(lang, { pos: 'training-format' }) : askLink(lang, x.cta, 'training-format'), i === 0)).join('')}</div></div></section>
${clientProof(lang, 'training')}

<section class="sec tight" id="testimonials"><div class="wrap">${head(c.revK, c.revH, c.revP, `<a class="more" href="${GBP_URL}" target="_blank" rel="noopener">${c.revMore}</a>`)}
<div class="quote-grid">${c.rev.map(([name, q]) => `<figure class="quote"><span class="stars" aria-label="5 stars">★★★★★</span><blockquote style="margin:0;flex-grow:1"><p>${q}</p></blockquote><figcaption><b>${name}</b> <span>· ${c.revBy}</span></figcaption></figure>`).join('')}</div></div></section>

<section class="split-photo" id="community-proof"><img src="/img/events/dallas-multi-agent-workshop.webp" width="1200" height="900" loading="lazy" decoding="async" alt="${c.fromAlt}">
<div><div class="eyebrow">${c.fromK}</div><h2>${c.fromH}</h2><p>${c.fromP}</p></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${c.faqK}</div><h2 style="font-size:clamp(32px,3.6vw,52px)">${c.faqH}</h2></div>
<div class="faq" style="grid-column:6 / span 7">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>

<section class="sec tight" id="about"><div class="wrap"><div class="big-card" style="flex-direction:row;align-items:center;gap:32px;flex-wrap:wrap"><img src="/img/jack-portrait-256.webp" width="256" height="256" loading="lazy" decoding="async" alt="Jack Qian" style="width:120px;height:120px;border-radius:50%;object-fit:cover;flex:none">
<div style="display:flex;flex-direction:column;gap:10px;flex:1 1 320px"><div class="eyebrow">${c.bioK}</div><p style="font-size:clamp(17px,1.4vw,20px);line-height:1.6">${c.bio}</p><span style="font-size:15px;color:var(--muted)"><strong style="color:var(--ink)">Jack Qian</strong> · ${c.bioBy}</span></div><a class="more" href="${L(lang, '/about/')}">${c.bioMore}</a></div></div></section>
${ctaBand(lang, { pos: 'training-final' })}`,
    jsonld: [business(lang, { full: true }), person(), faqPage(c.faq, `${SITE}${L(lang, '/ai-training/')}#faq`), bc.ld],
  };
};

export const pages = [{ path: '/ai-training/', priority: 0.9, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
