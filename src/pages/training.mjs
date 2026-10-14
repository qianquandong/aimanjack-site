// /ai-training/ — the corporate AI training pillar (design canvas: Training / ZH-Training). Indexable, self-canonical.
import { SITE, EMAIL, SMS_TEL, SMS_DISPLAY, GBP_URL, TRAINING, PROOF, PROGRAM_PRICE, OFFERS } from '../config.mjs';
import { planBtn, photoHero, ctaBand, L } from '../layout.mjs';
import { breadcrumb } from '../components.mjs';
import { caseProof, clientProof } from './cases.mjs';
import { business, person, faqPage } from '../schema.mjs';
import { trainingBrief } from '../training-buyers.mjs';
import { buyerQuestions } from '../training-questions.mjs';

const SMS = `sms:${SMS_TEL}?body=TRAINING%20-%20`;
const S = TRAINING.sessions, M = TRAINING.sessionMin;

const C = {
  en: {
    title: 'Corporate AI Training for Employees | 4 Sessions | AI Man Jack',
    description: `Practical AI training for business owners and nontechnical teams. Four live ${M}-minute sessions from ${PROGRAM_PRICE}/person. Online across the U.S. or onsite in Dallas–Fort Worth, in English or Chinese.`,
    og: { title: 'Corporate AI Training for Your Team’s Everyday Work', description: 'Work through familiar business tasks with Jack Qian using company-approved tools. Practise giving clear instructions, reviewing outputs and setting data boundaries.', alt: 'Jack Qian teaching a hands-on AI training session in Dallas' },
    crumb: 'AI training', eyebrow: 'Remote across the U.S. · Dallas–Fort Worth onsite · English or Chinese',
    h1: 'Corporate AI training for your team’s <em>everyday work</em>',
    sub: 'Learn to apply AI to the tasks your team already handles—from preparing for customer meetings to documenting processes and drafting reports.',
    intro: 'AI Man Jack offers practical training for business owners and nontechnical teams, personally designed and taught by Jack Qian.',
    seePricing: 'See pricing & format', text: 'Prefer to text? Send TRAINING to', heroAlt: 'A full classroom in Dallas at one of Jack Qian’s hands-on AI workshops',
    stats: [[PROGRAM_PRICE, `Per person · ${S}-session program starts here`], [`${S} × ${M} min`, 'Live sessions'], ['Custom', 'Your team’s tasks and approved tools'], ['Remote U.S.', 'Dallas–Fort Worth onsite available']],
    teams: [
      ['sales', 'Sales', 'Research an account, prepare for a meeting or draft a follow-up email from call notes.', 'Explore sales workflows'],
      ['operations', 'Operations and administration', 'Turn meeting notes into action items, draft a procedure from a walkthrough or prepare a weekly report from a spreadsheet export.', 'Explore operations workflows'],
      ['marketing', 'Marketing', 'Organize research, prepare a campaign brief or adapt existing content for another channel.', 'Explore marketing workflows'],
    ],
    cur: [
      ['Choose a suitable task.', 'Identify recurring work with clear inputs and an output someone can check.'],
      ['Provide useful context.', 'Supply approved material, explain the constraints and specify the required format.'],
      ['Build repeatable steps.', 'Write instructions the team can test and revise.'],
      ['Review the output.', 'Check facts, missing context and unsupported claims, including practice with a deliberately flawed example.'],
      ['Set clear boundaries.', 'Agree which information can be used and where a person must approve the result.'],
    ],
    fmt: { k: 'Core program', big: `${S} sessions`, sub: `${S} × ${M}-minute live sessions`, chip: `Starting at ${PROGRAM_PRICE}/person`,
      p: 'In the four-session program, participants try their workflows between meetings and bring back questions, errors and review difficulties. Later sessions address what needs improvement.',
      items: [`${S} live ${M}-minute sessions, workflow instructions and a repeatable playbook`, 'Two weeks after the final session, Jack checks whether each workflow should continue, change or stop', 'The review considers actual use, output accuracy and the effort needed to check the work'],
      note: 'Custom team pricing available. Exact content changes based on the team’s tasks.' },
    faq: [
      ['Which tools will we use?', 'Training uses tools your company has approved, which may include ChatGPT, Claude, Gemini or Microsoft Copilot. The selection depends on your team’s tasks and access.'],
      ['What should participants prepare?', `Bring a few recurring tasks and suitable sample material. Participants need a laptop and access to the agreed tool. Onsite sessions also require reliable Wi-Fi and a shared screen or projector. <a href="${OFFERS.onsite.path}">Onsite preparation details</a>.`],
      ['Does training include software implementation?', 'Training does not include software development or CRM/ERP configuration and integration. Connecting to live systems or automatically updating records requires a separate implementation scope, permissions and testing.'],
    ],
  },
  zh: {
    title: '企业员工 AI 培训 | 四次定制实操课程 | AI Man Jack',
    description: `四节 ${M} 分钟的实时 AI 培训课，围绕你的真实工作设计。每人 ${PROGRAM_PRICE} 起，团队可定制报价。全美远程授课，达拉斯—沃斯堡可上门。`,
    og: { title: '围绕你手头工作设计的 AI 培训', description: `四节 ${M} 分钟实时课程，围绕真实工作展开。每人 ${PROGRAM_PRICE} 起。全美远程，达拉斯—沃斯堡可上门，中英文授课。`, alt: '为企业和团队定制的实操型 AI 培训，中英文授课' },
    crumb: 'AI 培训', eyebrow: '定制 AI 培训 · 全美远程 · 达拉斯—沃斯堡可上门 · 中英文授课', h1: '围绕你<em>手头工作</em>设计的<br>AI 培训',
    sub: '面向非技术员工与企业老板的 AI 实操培训。Jack Qian 围绕团队的真实任务设计课程，使用公司已批准的 ChatGPT、Claude、Gemini 或 Copilot，一起搭建可复用的工作流。',
    seePricing: '查看价格与形式', text: '更习惯短信？发送 TRAINING 至', heroAlt: '达拉斯，Jack Qian 主讲的一场 AI 实操工作坊，教室座无虚席',
    stats: [[`${PROGRAM_PRICE}/人`, '四次课程项目起步价'], [`${S} × ${M} 分钟`, '实时课程'], ['定制', '课程内容由你的工作决定'], ['全美远程', '达拉斯—沃斯堡可上门']],
    teamsK: '适用对象', teamsH: '适合不写代码、但有大量重复性工作的老板和团队', teamsP: '每个人都基于自己已有的工作任务练习。以下是可以用来设计课程的工作流示例。',
    teams: [['sales', '销售', ['首次通话前的客户调研：基于对方官网与 CRM 记录', '会前准备：根据上次通话记录整理五个要点', '根据通话记录起草跟进邮件，保持个人风格', '基于已审批模板生成方案初稿']], ['operations', '运营', ['基于同一份表格，每周生成固定格式的周报', '根据操作录屏整理流程文档', '将会议纪要转化为明确负责人的待办事项', '从发票、表单和 PDF 中提取字段并整理成表格']], ['marketing', '市场', ['将大量文章综合为一份研究简报', '根据模板生成投放简报', '将一篇内容改编为三种形式', '根据导出的数据撰写效果总结']], ['leaders', '管理者', ['用四个问题评估哪些任务值得引入 AI', '明确哪些输出在使用前必须由人审批', '规定哪些数据可以输入工具、哪些不可以', '两周复盘：每条工作流是保留、调整还是停止']], ['owners', '老板与经营者', ['网站更新与内容', '调研与决策支持', 'SOP 与日常行政', '市场营销工作流', '日常经营']]],
    curK: '课程内容', curH: '先定任务，再选工具。', curP: '非技术团队通常面临两种困境：要么被层出不穷的 AI 产品弄得无所适从，要么试过聊天机器人、得到了令人印象深刻的回答，却不知道如何融入自己的工作。产品演示只会让问题更严重。因此，每一次课程都围绕一项真实任务，分五个部分展开。', curNote: '两周后回访：是否经过实测？结果是否足够准确？应继续、调整还是停止？',
    cur: [['选择合适的任务', '每位学员列出三项每周重复的工作，并按四个标准打分：频率是否足够高、输入输出能否清晰描述、能否快速核验、能否在不涉及敏感信息的情况下测试。', '“根据这份已批准的会议记录整理五点会议简报”可以教；“帮我管理整个部门”则不行。'], ['为 AI 提供有效上下文', '提示词是一份工作指令，而不是什么秘诀：明确目标、指定可信来源、设定约束、规定输出格式，并标出需要人工核验的内容。'], ['从对话升级为工作流', '对话产出的是一个回答；工作流则让信息按步骤流转：收集已批准的记录、提取决策、明确负责人、起草跟进、进入审核队列。', '团队会在这一步理解聊天机器人与智能体（Agent）的区别。'], ['核验输出结果', '每条结论能否追溯到来源？缺少哪些上下文？使用前由谁审批？每场课程至少有一个刻意设置的错误输出——找出它，比再看一次完美演示更有价值。'], ['落实数据与审批规范', '每位学员都能明确回答三个问题：哪些工具已获批准、哪些信息不得输入、哪些环节必须由人签字确认。']],
    fmtK: '项目与价格', fmtH: '四次课程项目', fmtP: `四节 ${M} 分钟实时课程，围绕你的工作展开，一次落地一条工作流。课间你会实际使用这些工作流，下一节课再修正出问题的地方。`, shorter: `想先从更短的开始？可以看看 <a href="/zh${OFFERS.workshop.path}" data-event="offer_path_click" data-pos="training-shorter">90 分钟团队工作坊</a>（按需报价）。`,
    fmt: { k: '核心项目', big: `${S} 节课`, sub: `${S} 节 ${M} 分钟实时课程`, chip: `每人 ${PROGRAM_PRICE} 起`,
        p: '这是 AI Man Jack 的核心项目。不照固定大纲走，每节课都围绕你或团队已经在做的工作来设计。',
        items: ['第 1 节：找准任务，搭建第一条工作流', '第 2 节：完善上下文和输入，让结果稳定可复用', '第 3 节：把工作流接进企业实际的运作方式', '第 4 节：复盘哪些有效、修正出错的地方，沉淀一份可复用的操作手册'],
        note: '具体内容会根据企业情况调整。团队可定制报价。' },
    revK: 'Google 评价', revH: '学员反馈', revP: `Google 上共 ${PROOF.reviews} 条评价，平均 ${PROOF.rating} 分。核对于 ${PROOF.reviewsCheckedOn}。`, revMore: `查看全部 ${PROOF.reviews} 条评价 →`, revBy: 'Google 评价 · 达拉斯 AI 工作坊 （译自英文原评）',
    rev: [['emily xu', '“这次 AI 工作坊的体验非常好：实用、有启发，而且真的很有趣。Jack 把复杂的 AI 概念讲解得通俗易懂……”'], ['U Rachel', '“非常喜欢 Jack 的 AI 讲座！他对 AI 有很前瞻的视角，从理解 AI 到在实际生活中使用，都讲得非常清楚……”'], ['Yuqi Guan', '“这门 AI 课程信息量大、容易跟上，涵盖了 AI 的基础知识和基本应用，尤其适合几乎没有相关经验的初学者。”']],
    fromK: '方法的由来', fromH: '五场讲座、一场黑客松，以及反复打磨。', fromP: '任务评分练习、刻意设置的错误输出、两周回访——每一个环节都在五十人的课堂上经过检验，有效的保留，无效的删除。上面的五个部分，正是经过检验留下来的。', fromAlt: 'Jack Qian 在达拉斯主讲一场社区 AI 实操工作坊',
    faqK: '常见问题', faqH: '关于培训，直接回答',
    faq: [['培训适合哪些人？', '企业老板，以及以非技术背景为主、有大量重复性知识工作的团队：销售、运营、市场、行政、计划、客服，以及带领这些团队的管理者。无需编程，每个人都基于自己已有的任务练习。'], ['学员在培训中实际会搭建什么？', '针对每周固定任务的可用工作流：例如根据已批准的记录整理会议简报、起草客户回复、从表格生成周报，或更新网站内容。第一条在第一节课结束前就能运行，之后的课程继续改进它，并加入下一项任务。每位学员还会带走一份核验清单，用于在输出发出前逐项检查。'], ['培训使用中文还是英文？', '均可。2026 年在达拉斯举办的社区系列讲座以中文进行；企业课程则采用团队最习惯的语言，课程资料提供中英文两个版本。'], ['培训使用哪些 AI 工具？', '使用贵公司已批准的工具，例如 ChatGPT、Claude、Gemini 或 Copilot。方法适用于各类工具。课程首先明确的，是哪些数据可以输入工具、哪些不可以。'], ['培训费用是多少？', `四次定制课程项目每人 ${PROGRAM_PRICE} 起，包含四节 ${M} 分钟的实时课程。团队价格根据人数、目标和所需准备工作量定制。如果想先从更短的开始，也可以安排一次 90 分钟的团队专题。<a href="/zh/book/">预约 20 分钟工作流咨询</a>，之后 Jack 会通过邮件发送建议方案与书面报价。`], ['如何判断培训是否有效？', '每节课都从上次以来的情况开始：哪条工作流用在了真实工作中、结果是否足够准确、哪个核验环节耗时过长。最后一节课结束两周后，我们还会再确认每条工作流应继续、调整还是停止。出勤率与满意度评分不作为衡量标准。'], ['可以远程培训吗？能到我们办公室授课吗？', '都可以。远程培训覆盖全美，通过视频进行。上门授课覆盖达拉斯—沃斯堡都会区，包括 Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及周边城市。看看<a href="/zh/ai-training/dallas/">我们在达拉斯—沃斯堡办过的活动</a>。']],
    bioK: '授课讲师', bio: '“我在达拉斯举办社区 AI 工作坊，因为实用的 AI 教育应当人人可及；为企业授课，我也秉持同样的方式。每一次课程都从一项真实任务开始，并坦诚回答：这件事是否真的适合交给 AI。”', bioBy: 'AI Man Jack 创始人', bioMore: '了解更多 →',
  },
};
C.zh.faq.push(...buyerQuestions('zh', 'program'));
export const TRAINING_FAQ = { en: C.en.faq, zh: C.zh.faq };

// The one program card, shared by / and /ai-training/: name, price and CTA on the left, what is included on the right.
// It is the only offer card on the site (2026-09-28); shorter formats are a line of text, never a competing card.
export const progCard = ({ k, big, sub, chip, p, items, note }, cta) => `<div class="prog dark on-dark solo"><div class="prog-main"><span class="k">${k}</span><span class="big">${big}</span><span class="sub">${sub}</span><span class="chip">${chip}</span><p>${p}</p>${cta}${note ? `<span class="note">${note}</span>` : ''}</div><ul class="ticks">${items.map((x) => `<li><span>${x}</span></li>`).join('')}</ul></div>`;

// The approved English copy is page-local so shared buying guides and the Chinese page stay unchanged.
const englishPage = () => {
  const c = C.en, bc = breadcrumb('en', [[c.crumb, '/ai-training/']]);
  const head = (k, h, p = '') => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div></div>`;
  const formats = [
    ['workshop', `${OFFERS.workshop.minutes}-minute team workshop`, 'One team wants to explore one or two focused tasks.', 'Guided workflow exercises, written instructions, an output-review checklist and notes on data boundaries.', 'Customized quote', 'Workshop details'],
    ['onsite', 'Full-day onsite training', 'Several teams need shared working rules and time to practise together.', 'Department use cases, guided labs, review checklists and a next-step plan with owners.', 'Customized quote', 'Onsite details'],
    ['program', 'Four-session program', 'Your team wants to practise between meetings and refine its workflows.', `Four live ${M}-minute sessions, workflow instructions and a repeatable playbook.`, `From ${PROGRAM_PRICE} per person`, 'Program details'],
  ];
  const headers = ['Format', 'A good fit when…', 'What it covers', 'Pricing'];
  return {
    title: c.title, description: c.description, og: c.og, view: 'training_page_view', offer: OFFERS.program.id, hero: 'photo', bodyClass: 'training-page',
    body: `${photoHero({ photo: 'workshop', alt: c.heroAlt, size: 'md', stats: c.stats, inner: `<div class="hero-main stack">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="lg brand-hero-title">${c.h1}</h1><p style="max-width:720px">${c.sub}</p><p style="max-width:720px">${c.intro}</p>
<div class="cta-row">${planBtn('en', { pos: 'training-hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="#formats" data-event="training_program_click" data-pos="training-hero">${c.seePricing}</a></div><span class="hero-contact">${c.text} <a href="${SMS}" data-event="sms_training_click" data-pos="training-hero">${SMS_DISPLAY}</a></span></div>` })}

<section class="sec" id="teams"><div class="wrap">${head('Your team’s tasks', 'Start with work your team knows', 'The training takes shape around your team’s responsibilities, available tools and approved source material. Example exercises include:')}
<div class="g3">${c.teams.map(([slug, name, example, label]) => `<div class="oak" id="team-${slug}" style="gap:18px;padding:30px 28px"><h3 style="font-size:26px">${name}</h3><p>${example}</p><a class="more" href="/use-cases/${slug}/">${label} →</a></div>`).join('')}</div>
<p class="prog-alt" id="team-owners">No coding experience is required. The focus is on choosing useful tasks, giving clear instructions and checking the result before using it.</p></div></section>

<section class="sec buyer-guide" id="team-paths"><div class="wrap">${head('Training formats', 'Choose a format that fits your team')}
<div class="format-comparison"><div class="table-wrap"><table><caption>Compare three formats for team AI training</caption><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>
${formats.map(([key, name, fit, includes, price, label]) => `<tr><th scope="row">${name}</th><td data-label="${headers[1]}">${fit}</td><td data-label="${headers[2]}">${includes}</td><td data-label="${headers[3]}"><strong>${price}</strong><a href="${key === 'program' ? '#formats' : OFFERS[key].path}" data-event="${key === 'program' ? 'training_program_click' : 'offer_path_click'}" data-pos="training-compare-${key}">${label} →</a></td></tr>`).join('')}
</tbody></table></div></div>
<p style="margin-top:18px;color:var(--muted)">Group size, goals and preparation requirements determine the final scope and price. AI tool accounts and subscriptions are separate. Travel outside Dallas–Fort Worth is quoted separately.</p></div></section>

<section class="sec dark" id="curriculum"><div class="wrap g12">
<div style="grid-column:span 4;display:flex;flex-direction:column;gap:20px"><div class="eyebrow">Training method</div><h2 style="font-size:clamp(36px,4.4vw,64px);line-height:1">Practise the task—and how to check it</h2><p style="font-size:17px;line-height:1.65">Exercises follow a practical sequence.</p><p style="font-size:15.5px;line-height:1.65">Exercises use synthetic, redacted or company-approved sample material. Tool selection and data rules are agreed before the session.</p></div>
<ol class="nums" style="grid-column:6 / span 7">${c.cur.map(([h, p], i) => `<li><span class="n">${i + 1}</span><div><h3 style="font-size:26px">${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div></section>

<section class="sec" id="formats"><div class="wrap">${head('The four-session program', 'Put workflows to use between sessions')}
${progCard(c.fmt, planBtn('en', { pos: 'training-format' }))}
<p class="prog-alt">This follow-up belongs to the four-session program. Additional support after a standalone workshop or onsite day is separately scoped.</p></div></section>

<section class="sec tight" id="about"><div class="wrap"><div class="big-card" style="flex-direction:row;align-items:center;gap:32px;flex-wrap:wrap"><img src="/img/jack-portrait-256.webp" width="256" height="256" loading="lazy" decoding="async" alt="Jack Qian" style="width:120px;height:120px;border-radius:50%;object-fit:cover;flex:none">
<div style="display:flex;flex-direction:column;gap:16px;flex:1 1 320px"><h2>Meet your instructor</h2><p>Jack Qian runs AI Man Jack LLC in Dallas, Texas. He designs and teaches the sessions himself.</p><p id="community-proof">His background includes business planning at a Dallas semiconductor company, building AI workflows and organizing community AI events. He also writes <a href="https://realagentusecases.com/">Real Agent Use Cases</a>, a newsletter about practical agents and workflows.</p><p><a class="more" href="/about/">More about Jack →</a> · <a href="/ai-training/dallas/">Dallas–Fort Worth sessions and venues →</a></p></div></div>
<aside class="buyer-prep"><h3>Workflow implementation example</h3><p>The <a href="/case-studies/livestream-agency-scheduling/">livestream-agency scheduling case study</a> describes a rules-based system that prepares a weekly schedule draft. An operations lead still reviews, edits and publishes the schedule. It is an implementation case, rather than evidence of training outcomes; net time savings have not been established.</p></aside>
<div class="buyer-links" id="testimonials"><a href="${GBP_URL}" target="_blank" rel="noopener">Read attendee reviews on Google ↗</a></div></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">Questions & preparation</div><h2 style="font-size:clamp(32px,3.6vw,52px)">Before we start</h2></div>
<div class="faq" style="grid-column:6 / span 7">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>
${ctaBand('en', { h: 'Discuss a starting point for your team', sub: 'Bring one recurring task to a workflow call. Discuss what your team needs, which tools are available and which training format fits the work.', pos: 'training-final' })}`,
    jsonld: [business('en'), person(), faqPage(c.faq, `${SITE}/ai-training/#faq`), bc.ld],
  };
};

const page = (lang) => {
  if (lang === 'en') return englishPage();
  const c = C[lang], bc = breadcrumb(lang, [[c.crumb, '/ai-training/']]);
  const head = (k, h, p, more) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div>${more || ''}</div>`;
  return {
    title: c.title, description: c.description, og: c.og, view: 'training_page_view', offer: OFFERS.program.id, hero: 'photo', bodyClass: 'training-page',
    body: `${photoHero({ photo: 'workshop', alt: c.heroAlt, size: 'md', stats: c.stats, inner: `<div class="hero-main stack">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="lg brand-hero-title">${c.h1}</h1><p style="max-width:720px">${c.sub}</p>
<div class="cta-row">${planBtn(lang, { pos: 'training-hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="#formats" data-event="training_program_click" data-pos="training-hero">${c.seePricing}</a></div><span class="hero-contact">${c.text} <a href="${SMS}" data-event="sms_training_click" data-pos="training-hero">${SMS_DISPLAY}</a></span></div>` })}

${trainingBrief(lang)}
<section class="sec" id="teams"><div class="wrap">${head(c.teamsK, c.teamsH, c.teamsP)}
<div class="g4">${c.teams.map(([slug, name, items]) => `<div class="oak${slug === 'owners' ? ' wide' : ''}" id="team-${slug}" style="gap:18px;padding:30px 28px"><h3 style="font-size:26px">${name}</h3><ul class="ticks">${items.map((i) => `<li><span>${i}</span></li>`).join('')}</ul></div>`).join('')}</div></div></section>

<section class="sec dark" id="curriculum"><div class="wrap g12">
<div style="grid-column:span 4;display:flex;flex-direction:column;gap:20px"><div class="eyebrow">${c.curK}</div><h2 style="font-size:clamp(36px,4.4vw,64px);line-height:1">${c.curH}</h2><p style="font-size:17px;line-height:1.65">${c.curP}</p><p style="margin-top:12px;padding-top:20px;border-top:1px solid var(--dark-line);font-size:15.5px;line-height:1.65">${c.curNote}</p></div>
<ol class="nums" style="grid-column:6 / span 7">${c.cur.map(([h, p, why], i) => `<li><span class="n">${i + 1}</span><div><h3 style="font-size:26px">${h}</h3><p>${p}</p>${why ? `<span class="why">${why}</span>` : ''}</div></li>`).join('')}</ol></div></section>

${caseProof(lang)}
<section class="sec" id="formats"><div class="wrap">${head(c.fmtK, c.fmtH, c.fmtP)}
${progCard(c.fmt, planBtn(lang, { pos: 'training-format' }))}<p class="prog-alt">${c.shorter}</p></div></section>
${clientProof(lang, 'training')}

<section class="sec tight" id="testimonials"><div class="wrap">${head(c.revK, c.revH, c.revP, `<a class="more" href="${GBP_URL}" target="_blank" rel="noopener">${c.revMore}</a>`)}
<div class="quote-grid">${c.rev.map(([name, q]) => `<figure class="quote"><span class="stars" aria-label="5 stars">★★★★★</span><blockquote style="margin:0;flex-grow:1"><p>${q}</p></blockquote><figcaption><b>${name}</b> <span>· ${c.revBy}</span></figcaption></figure>`).join('')}</div></div></section>

<section class="split-photo" id="community-proof"><img src="/img/events/dallas-multi-agent-workshop.webp" width="1200" height="900" loading="lazy" decoding="async" alt="${c.fromAlt}">
<div><div class="eyebrow">${c.fromK}</div><h2>${c.fromH}</h2><p>${c.fromP}</p><p><a class="more" href="${L(lang, '/ai-training/dallas/')}">${lang === 'zh' ? '达拉斯—沃斯堡的活动、场地与照片 →' : 'Sessions, venues and photos in Dallas–Fort Worth →'}</a></p></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${c.faqK}</div><h2 style="font-size:clamp(32px,3.6vw,52px)">${c.faqH}</h2></div>
<div class="faq" style="grid-column:6 / span 7">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>

<section class="sec tight" id="about"><div class="wrap"><div class="big-card" style="flex-direction:row;align-items:center;gap:32px;flex-wrap:wrap"><img src="/img/jack-portrait-256.webp" width="256" height="256" loading="lazy" decoding="async" alt="Jack Qian" style="width:120px;height:120px;border-radius:50%;object-fit:cover;flex:none">
<div style="display:flex;flex-direction:column;gap:10px;flex:1 1 320px"><div class="eyebrow">${c.bioK}</div><p style="font-size:clamp(17px,1.4vw,20px);line-height:1.6">${c.bio}</p><span style="font-size:15px;color:var(--muted)"><strong style="color:var(--ink)">Jack Qian</strong> · ${c.bioBy}</span></div><a class="more" href="${L(lang, '/about/')}">${c.bioMore}</a></div></div></section>
${ctaBand(lang, { pos: 'training-final' })}`,
    jsonld: [business(lang), person(), faqPage(c.faq, `${SITE}${L(lang, '/ai-training/')}#faq`), bc.ld],
  };
};

export const pages = [{ path: '/ai-training/', priority: 0.9, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
