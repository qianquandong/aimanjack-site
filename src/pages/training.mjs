// /ai-training/ — the corporate AI training pillar (design canvas: Training / ZH-Training). Indexable, self-canonical.
import { SITE, SMS_TEL, SMS_DISPLAY, GBP_URL, TRAINING, OFFERS } from '../config.mjs';
import { planBtn, photoHero, ctaBand, L } from '../layout.mjs';
import { breadcrumb } from '../components.mjs';
import { business, person, faqPage } from '../schema.mjs';

const SMS = `sms:${SMS_TEL}?body=TRAINING%20-%20`;
const S = TRAINING.sessions, M = TRAINING.sessionMin;

const C = {
  en: {
    title: 'Corporate AI Training for Employees | 4 Sessions | AI Man Jack',
    description: `Practical AI training for business owners and nontechnical teams. Four live ${M}-minute sessions, priced for your team. Online across the U.S. or onsite in Dallas–Fort Worth, in English or Chinese.`,
    og: { title: 'Corporate AI Training for Your Team’s Everyday Work', description: 'Work through familiar business tasks with Jack Qian using company-approved tools. Practise giving clear instructions, reviewing outputs and setting data boundaries.', alt: 'Jack Qian teaching a hands-on AI training session in Dallas' },
    crumb: 'AI training', eyebrow: 'Remote across the U.S. · Dallas–Fort Worth onsite · English or Chinese',
    h1: 'Corporate AI training for your team’s <em>everyday work</em>',
    sub: 'Learn to apply AI to the tasks your team already handles—from preparing for customer meetings to documenting processes and drafting reports.',
    intro: 'AI Man Jack offers practical training for business owners and nontechnical teams, personally designed and taught by Jack Qian.',
    seePricing: 'See pricing & format', text: 'Prefer to text? Send TRAINING to', heroAlt: 'A full classroom in Dallas at one of Jack Qian’s hands-on AI workshops',
    stats: [['By quote', 'Priced for your team’s size and goals'], [`${S} × ${M} min`, 'Live sessions'], ['Custom', 'Your team’s tasks and approved tools'], ['Remote U.S.', 'Dallas–Fort Worth onsite available']],
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
    fmt: { k: 'Core program', big: `${S} sessions`, sub: `${S} × ${M}-minute live sessions`, chip: 'Priced by quote',
      p: 'In the four-session program, participants try their workflows between meetings and bring back questions, errors and review difficulties. Later sessions address what needs improvement.',
      items: [`${S} live ${M}-minute sessions, workflow instructions and a repeatable playbook`, 'Two weeks after the final session, Jack checks whether each workflow should continue, change or stop', 'The review considers actual use, output accuracy and the effort needed to check the work'],
      note: 'Custom team pricing available. Exact content changes based on the team’s tasks.' },
    faq: [
      ['Which tools will we use?', 'Training uses tools your company has approved, which may include <a href="/ai-training/chatgpt/">ChatGPT</a>, <a href="/ai-training/claude/">Claude</a>, Gemini, <a href="/ai-training/copilot/">Microsoft Copilot</a> or <a href="/ai-training/grok/">Grok</a>. The selection depends on your team’s tasks and access.'],
      ['What should participants prepare?', `Bring a few recurring tasks and suitable sample material. Participants need a laptop and access to the agreed tool. Onsite sessions also require reliable Wi-Fi and a shared screen or projector. <a href="${OFFERS.onsite.path}">Onsite preparation details</a>.`],
      ['Does training include software implementation?', 'Training does not include software development or CRM/ERP configuration and integration. Connecting to live systems or automatically updating records requires a separate implementation scope, permissions and testing.'],
    ],
  },
  zh: {
    title: '企业员工 AI 培训 | 四次定制实操课程 | AI Man Jack',
    description: `围绕团队日常工作开展的企业 AI 实操培训。四节 ${M} 分钟实时课程，按团队报价。全美远程，达拉斯—沃斯堡可上门，中文或英文授课。`,
    og: { title: '围绕团队日常工作开展的企业 AI 实操培训', description: '从客户会议、流程文档到报告，结合团队已经在做的任务，练习使用 AI、核验输出，并明确数据与审批边界。', alt: 'Jack Qian 在达拉斯主讲 AI 实操培训' },
    crumb: 'AI 培训', eyebrow: '全美实时远程授课 · 达拉斯—沃斯堡（DFW）可上门 · 中文或英文授课',
    h1: '围绕团队<em style="white-space:nowrap">日常工作</em>开展的<br>企业 AI 实操培训',
    sub: '从准备客户会议，到整理工作流程、起草报告，结合团队已经在做的任务，练习如何使用 AI，以及如何核验它的输出。',
    intro: 'AI Man Jack 为企业老板和非技术团队提供实操培训，由 Jack Qian 本人设计课程并授课。',
    seePricing: '查看价格与形式', text: '更习惯短信？发送 TRAINING 至', heroAlt: '达拉斯，Jack Qian 主讲的一场 AI 实操工作坊，教室座无虚席',
    stats: [['按需报价', '按团队人数和目标报价'], [`${S} × ${M} 分钟`, '实时课程'], ['定制', '围绕团队实际任务'], ['全美远程', '达拉斯—沃斯堡可上门']],
    teams: [
      ['sales', '销售', '调研客户、准备会议，或根据通话记录起草跟进邮件。', '查看销售工作流'],
      ['operations', '运营与行政', '将会议记录整理为待办事项，根据操作讲解起草流程文档，或使用导出的表格数据准备周报。', '查看运营工作流'],
      ['marketing', '市场营销', '整理研究资料、准备营销活动简报，或将已有内容改编为其他渠道使用的形式。', '查看营销工作流'],
    ],
    cur: [
      ['选择合适的任务。', '从重复性工作中，选择输入明确、结果便于核验的任务。'],
      ['提供清晰的背景。', '使用经批准的资料，说明目标、限制条件和所需输出格式。'],
      ['整理为可重复执行的步骤。', '写出可以测试、修改和再次使用的操作说明。'],
      ['核对输出。', '检查事实、遗漏的信息和缺少依据的说法，并通过刻意设置错误的示例练习发现问题。'],
      ['明确数据与审批边界。', '确定哪些信息可以使用，以及哪些结果在使用前必须由人审批。'],
    ],
    fmt: { k: '核心项目', big: `${S} 节课`, sub: `${S} 节 ${M} 分钟实时课程`, chip: '按需报价',
      p: '四次课程项目安排参与者在课间尝试使用工作流，再带着疑问、错误和核验中遇到的困难回来讨论。之后的课程围绕需要改进的地方继续练习。',
      items: [`四节 ${M} 分钟实时课程、工作流说明及可复用的操作手册`, '最后一节课结束两周后，Jack 会回访，了解工作流是否用于实际任务、输出是否足够准确，以及核验需要投入多少精力', '再讨论哪些流程应继续、调整或停止'],
      note: '具体内容会根据团队任务调整。团队可定制报价。' },
    faq: [
      ['培训使用哪些工具？', '使用公司已批准的工具，可能包括 <a href="/zh/ai-training/chatgpt/">ChatGPT</a>、<a href="/zh/ai-training/claude/">Claude</a>、Gemini、<a href="/zh/ai-training/copilot/">Microsoft Copilot</a> 或 <a href="/zh/ai-training/grok/">Grok</a>。具体选择取决于团队的任务和现有使用权限。'],
      ['参与者需要准备什么？', `准备几项重复性任务和适合练习的示例材料，并携带笔记本电脑，确保能够使用约定的工具。上门培训还需要稳定的 Wi-Fi，以及共用屏幕或投影设备。<a href="/zh${OFFERS.onsite.path}">查看上门培训准备事项</a>。`],
      ['培训包含软件开发或系统集成吗？', '培训不包含软件开发，也不包含 CRM／ERP 的配置和集成。连接真实业务系统或自动写入数据，需要另行明确实施范围、权限和测试要求。'],
    ],
  },
};
export const TRAINING_FAQ = { en: C.en.faq, zh: C.zh.faq };

// The one program card, shared by / and /ai-training/: name, price and CTA on the left, what is included on the right.
// It is the only offer card on the site (2026-09-28); shorter formats are a line of text, never a competing card.
export const progCard = ({ k, big, sub, chip, p, items, note }, cta) => `<div class="prog dark on-dark solo"><div class="prog-main"><span class="k">${k}</span><span class="big">${big}</span><span class="sub">${sub}</span><span class="chip">${chip}</span><p>${p}</p>${cta}${note ? `<span class="note">${note}</span>` : ''}</div><ul class="ticks">${items.map((x) => `<li><span>${x}</span></li>`).join('')}</ul></div>`;

// Source: Jack Qian, 2026-10-17, confirmed in this website review that these ranges come from his learners' feedback.
// Self-reported weekly estimates, not timed measurements. No sample size or survey method was supplied; do not invent
// either, attribute the ranges to the unfinished client program, or turn them into a guarantee or Review markup.
const learnerFeedback = (lang) => {
  const zh = lang === 'zh';
  return `<section class="sec tight" id="learner-feedback"><div class="wrap">
<div class="sec-head"><div><div class="eyebrow">${zh ? '学员反馈' : 'Learner feedback'}</div><h2>${zh ? '学员自报的每周节约时间' : 'Learner-reported weekly time savings'}</h2><p class="lead">${zh ? '学员将 AI 用于工作后，向 Jack 反馈的每周节约时间如下。' : 'After applying AI to their work, learners have shared the following weekly time-saving estimates with Jack.'}</p></div></div>
<div class="g2"><div class="oak"><b style="font-size:36px">5–7</b><span>${zh ? '小时／周 · 普通员工／个人贡献者（IC）' : 'hours per week · Individual contributors (ICs)'}</span></div><div class="oak"><b style="font-size:36px">3–4</b><span>${zh ? '小时／周 · 高管' : 'hours per week · Executives'}</span></div></div>
<p class="review-source">${zh ? '来源：Jack Qian 于 2026 年 10 月 17 日汇总的学员反馈。这是学员自报的估算，未经独立计时验证；实际节约时间因岗位、任务和使用方式而异。' : 'Source: learner feedback summarized by Jack Qian on October 17, 2026. These are self-reported estimates, not independently timed measurements; results vary by role, task and use.'}</p>
</div></section>`;
};

// The existing home-page owner link now lands on useful buying guidance, not a one-line aside.
// Keep this audience within the corporate-training pillar instead of creating another competing service URL.
const ownerGuide = (lang) => {
  const zh = lang === 'zh';
  const examples = zh ? [
    ['客户跟进', '从脱敏的会议记录和已批准的服务说明，起草包含下一步行动的邮件。发送前由人核对价格、承诺、收件人和日期。', '/templates/follow-up-email/', '查看跟进邮件模板'],
    ['每周经营简报', '用经过核验的汇总数据和工作记录，起草一页周报。原始表格保留为依据，负责人核对数字、异常和解释。', '/templates/weekly-executive-summary/', '查看周报模板'],
    ['员工操作说明', '把负责人提供的操作步骤整理成检查清单。负责人逐项确认顺序、例外和审批要求，再让员工试用。', '/templates/sop-builder/', '查看操作流程模板'],
  ] : [
    ['Customer follow-ups', 'Use redacted meeting notes and an approved service description to draft an email with next steps. A person checks prices, commitments, recipients and dates before sending.', '/templates/follow-up-email/', 'Preview the follow-up template'],
    ['Weekly business updates', 'Turn checked summary figures and work notes into a one-page update. Keep the source spreadsheet; the owner checks the numbers, exceptions and explanations.', '/templates/weekly-executive-summary/', 'Preview the weekly update template'],
    ['Staff procedures', 'Turn a process owner’s walkthrough into a checklist. The owner confirms the sequence, exceptions and approval steps before another employee tries it.', '/templates/sop-builder/', 'Preview the procedure template'],
  ];
  return `<section class="sec tight" id="team-owners"><div class="wrap">
<div class="sec-head"><div><div class="eyebrow">${zh ? '老板与经营团队' : 'Owners & operators'}</div><h2>${zh ? '小企业 AI 培训，从一项每周都要做的工作开始' : 'AI training for small business owners and teams'}</h2><p class="lead">${zh ? '同一批人兼顾客户、营销和行政时，先选一项容易核验的重复性任务。Jack 会结合现有工具与工作方式设计练习，中文或英文授课，全美远程或达拉斯—沃斯堡上门。' : 'When the same people handle customers, marketing and administration, start with one recurring task you can check. Jack shapes the exercises around your current tools and way of working, in English or Chinese, live online across the U.S. or onsite in Dallas–Fort Worth.'}</p></div></div>
<p>${zh ? '先选一个练习示例，打开模板查看操作说明与核验步骤。课程使用模拟、脱敏或公司已批准的材料，再结合团队的任务调整练习。' : 'Choose an example exercise and open its template to see the instructions and review steps. Training uses synthetic, redacted or company-approved material, with exercises adapted to your team’s tasks.'}</p>
<div class="g3" style="margin-top:24px">${examples.map(([h, p, path, label]) => `<div class="oak"><h3>${h}</h3><p>${p}</p><a class="more" href="${L(lang, path)}">${label} →</a></div>`).join('')}</div>
<aside class="buyer-prep"><h3>${zh ? '先明确输入、结果和核验人' : 'Define the input, the output and who checks it'}</h3><p>${zh ? '咨询时说明谁做这项工作、多久做一次、有哪些可用资料，以及什么结果才算可用。需要严格计算或固定规则的部分，先考虑表格公式或代码；AI 可用于起草和整理文字。培训不包含软件开发或 CRM／ERP 集成。' : 'For the initial conversation, describe who does the task, how often, the available sources and what an acceptable result looks like. Exact calculations or fixed rules may belong in spreadsheet formulas or code; AI can help draft and organize text. Training does not include software development or CRM/ERP integration.'}</p></aside>
<p>${zh ? '每种形式均按团队书面报价，工具订阅另计。四次课程项目包含课间练习和最后一节课结束两周后的复盘，关注实际使用、输出准确性和核验成本；单次工作坊或上门培训后的额外支持另行确定范围。' : 'Every format is quoted for your team; tool subscriptions are separate. The four-session program includes practice between meetings and a review two weeks after the final session, covering actual use, output accuracy and review effort. Additional support after a standalone workshop or onsite day is separately scoped.'}</p>
<nav class="buyer-links" aria-label="${zh ? '小企业培训准备资料' : 'Small business training preparation'}"><a href="${L(lang, '/templates/team-ai-training-brief/')}">${zh ? '填写团队培训需求清单' : 'Prepare a team training brief'} →</a><a href="${L(lang, '/blog/ai-training-costs-small-business-teams/')}">${zh ? '了解培训报价包含什么' : 'Understand training scope and costs'} →</a><a href="${L(lang, '/contact/quote/')}?format=${OFFERS.program.format}" data-event="quote_cta_click" data-pos="training-owners">${zh ? '申请团队报价' : 'Request a team quote'} →</a></nav>
</div></section>`;
};

// The approved English copy is page-local so shared buying guides and the Chinese page stay unchanged.
const englishPage = () => {
  const c = C.en, bc = breadcrumb('en', [[c.crumb, '/ai-training/']]);
  const head = (k, h, p = '') => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div></div>`;
  const formats = [
    ['workshop', `${OFFERS.workshop.minutes}-minute team workshop`, 'One team wants to explore one or two focused tasks.', 'Guided workflow exercises, written instructions, an output-review checklist and notes on data boundaries.', 'Customized quote', 'Workshop details'],
    ['onsite', 'Full-day onsite training', 'Several teams need shared working rules and time to practise together.', 'Department use cases, guided labs, review checklists and a next-step plan with owners.', 'Customized quote', 'Onsite details'],
    ['program', 'Four-session program', 'Your team wants to practise between meetings and refine its workflows.', `Four live ${M}-minute sessions, workflow instructions and a repeatable playbook.`, 'Priced by quote', 'Program details'],
  ];
  const headers = ['Format', 'A good fit when…', 'What it covers', 'Pricing'];
  return {
    title: c.title, description: c.description, og: c.og, view: 'training_page_view', offer: OFFERS.program.id, hero: 'photo', bodyClass: 'training-page',
    body: `${photoHero({ photo: 'workshop', alt: c.heroAlt, size: 'md', stats: c.stats, inner: `<div class="hero-main stack">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="lg brand-hero-title">${c.h1}</h1><p style="max-width:720px">${c.sub}</p><p style="max-width:720px">${c.intro}</p>
<div class="cta-row">${planBtn('en', { pos: 'training-hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="#formats" data-event="training_program_click" data-pos="training-hero">${c.seePricing}</a></div><span class="hero-contact">${c.text} <a href="${SMS}" data-event="sms_training_click" data-pos="training-hero">${SMS_DISPLAY}</a></span></div>` })}

<section class="sec" id="teams"><div class="wrap">${head('Your team’s tasks', 'Start with work your team knows', 'The training takes shape around your team’s responsibilities, available tools and approved source material. Example exercises include:')}
<div class="g3">${c.teams.map(([slug, name, example, label]) => `<div class="oak" id="team-${slug}" style="gap:18px;padding:30px 28px"><h3 style="font-size:26px">${name}</h3><p>${example}</p><a class="more" href="/ai-training/${slug}-teams/" data-event="department_training_click" data-pos="training-teams">AI training for ${slug} teams →</a><a class="more" href="/use-cases/${slug}/">${label} →</a></div>`).join('')}</div>
<p class="prog-alt">No coding experience is required. The focus is on choosing useful tasks, giving clear instructions and checking the result before using it. Run a small business? See the <a href="#team-owners">owner and small-team training guide</a>. Leading the rollout? See <a href="/ai-training/leadership-teams/">AI training for leadership teams</a>.</p></div></section>

<section class="sec buyer-guide" id="team-paths"><div class="wrap">${head('Training formats', 'Choose a format that fits your team')}
<div class="format-comparison"><div class="table-wrap"><table><caption>Compare three formats for team AI training</caption><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>
${formats.map(([key, name, fit, includes, price, label]) => `<tr><th scope="row">${name}</th><td data-label="${headers[1]}">${fit}</td><td data-label="${headers[2]}">${includes}</td><td data-label="${headers[3]}"><strong>${price}</strong><a href="${key === 'program' ? '#formats' : OFFERS[key].path}" data-event="${key === 'program' ? 'training_program_click' : 'offer_path_click'}" data-pos="training-compare-${key}">${label} →</a></td></tr>`).join('')}
</tbody></table></div></div>
<p style="margin-top:18px;color:var(--muted)">Group size, goals and preparation requirements determine the final scope and price. AI tool accounts and subscriptions are separate. Travel outside Dallas–Fort Worth is quoted separately.</p></div></section>

${ownerGuide('en')}

<section class="sec dark" id="curriculum"><div class="wrap g12">
<div style="grid-column:span 4;display:flex;flex-direction:column;gap:20px"><div class="eyebrow">Training method</div><h2 style="font-size:clamp(36px,4.4vw,64px);line-height:1">Practise the task—and how to check it</h2><p style="font-size:17px;line-height:1.65">Exercises follow a practical sequence.</p><p style="font-size:15.5px;line-height:1.65">Exercises use synthetic, redacted or company-approved sample material. Tool selection and data rules are agreed before the session.</p></div>
<ol class="nums" style="grid-column:6 / span 7">${c.cur.map(([h, p], i) => `<li><span class="n">${i + 1}</span><div><h3 style="font-size:26px">${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div></section>

<section class="sec" id="formats"><div class="wrap">${head('The four-session program', 'Put workflows to use between sessions')}
${progCard(c.fmt, planBtn('en', { pos: 'training-format' }))}
<p class="prog-alt">This follow-up belongs to the four-session program. Additional support after a standalone workshop or onsite day is separately scoped.</p></div></section>

${learnerFeedback('en')}

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

// Chinese copy has its own renderer; English output and shared buying guides remain unchanged.
const chinesePage = () => {
  const c = C.zh, bc = breadcrumb('zh', [[c.crumb, '/ai-training/']]);
  const head = (k, h, p = '') => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div></div>`;
  const formats = [
    ['workshop', `${OFFERS.workshop.minutes} 分钟团队工作坊`, '一个团队想先围绕一到两项明确的任务试做。', '在指导下练习工作流，整理操作说明、输出核验清单和数据使用边界。', '按需定制报价', '工作坊详情'],
    ['onsite', '全天上门培训', '多个团队需要统一使用规则，并留出时间集中练习。', '各部门应用场景、实操练习、核验清单，以及明确负责人的后续计划。', '按需定制报价', '上门培训详情'],
    ['program', '四次课程项目', '希望在课间实际使用工作流，再逐次调整。', `四节 ${M} 分钟实时课程、工作流说明及可复用的操作手册。`, '按需报价', '课程详情'],
  ];
  const headers = ['培训形式', '适合什么情况', '主要内容', '价格'];
  return {
    title: c.title, description: c.description, og: c.og, view: 'training_page_view', offer: OFFERS.program.id, hero: 'photo', bodyClass: 'training-page',
    body: `${photoHero({ photo: 'workshop', alt: c.heroAlt, size: 'md', stats: c.stats, inner: `<div class="hero-main stack">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="lg brand-hero-title">${c.h1}</h1><p style="max-width:720px">${c.sub}</p><p style="max-width:720px">${c.intro}</p>
<div class="cta-row">${planBtn('zh', { pos: 'training-hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="#formats" data-event="training_program_click" data-pos="training-hero">${c.seePricing}</a></div><span class="hero-contact">${c.text} <a href="${SMS}" data-event="sms_training_click" data-pos="training-hero">${SMS_DISPLAY}</a></span></div>` })}

<section class="sec" id="teams"><div class="wrap">${head('实际工作任务', '从团队熟悉的工作开始', '课程围绕团队的实际职责、可用工具和经批准的资料设计。可以用于练习的任务包括：')}
<div class="g3">${c.teams.map(([slug, name, example, label]) => `<div class="oak" id="team-${slug}" style="gap:18px;padding:30px 28px"><h3 style="font-size:26px">${name}</h3><p>${example}</p><a class="more" href="/zh/ai-training/${slug}-teams/" data-event="department_training_click" data-pos="training-teams">${name}团队 AI 培训 →</a><a class="more" href="/zh/use-cases/${slug}/">${label} →</a></div>`).join('')}</div>
<p class="prog-alt">无需编程经验。培训重点是选择合适的任务、给出清晰的指令，并在使用结果前做好核验。自己经营企业？见<a href="#team-owners">小企业老板与团队培训指南</a>。负责推动落地？见<a href="/zh/ai-training/leadership-teams/">管理层 AI 培训</a>。</p></div></section>

<section class="sec buyer-guide" id="team-paths"><div class="wrap">${head('培训形式', '选择适合团队的培训形式')}
<div class="format-comparison"><div class="table-wrap"><table><caption>三种团队 AI 培训形式对比</caption><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>
${formats.map(([key, name, fit, includes, price, label]) => `<tr><th scope="row">${name}</th><td data-label="${headers[1]}">${fit}</td><td data-label="${headers[2]}">${includes}</td><td data-label="${headers[3]}"><strong>${price}</strong><a href="${key === 'program' ? '#formats' : L('zh', OFFERS[key].path)}" data-event="${key === 'program' ? 'training_program_click' : 'offer_path_click'}" data-pos="training-compare-${key}">${label} →</a></td></tr>`).join('')}
</tbody></table></div></div>
<p style="margin-top:18px;color:var(--muted)">最终范围和报价根据团队人数、目标及所需准备工作确定。培训费不包含 AI 工具账号或订阅费用。DFW 以外的差旅费用另行报价。</p></div></section>

${ownerGuide('zh')}

<section class="sec dark" id="curriculum"><div class="wrap g12">
<div style="grid-column:span 4;display:flex;flex-direction:column;gap:20px"><div class="eyebrow">实操方法</div><h2 style="font-size:clamp(36px,4.4vw,64px);line-height:1.2">练习怎么做，也练习怎么核验</h2><p style="font-size:17px;line-height:1.65">实操练习按以下五步展开。</p><p style="font-size:15.5px;line-height:1.65">练习使用模拟、脱敏或经公司批准的示例材料。课前会确认可用工具及数据使用规则。</p></div>
<ol class="nums" style="grid-column:6 / span 7">${c.cur.map(([h, p], i) => `<li><span class="n">${i + 1}</span><div><h3 style="font-size:26px">${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div></section>

<section class="sec" id="formats"><div class="wrap">${head('四次课程项目', '在四次课程之间使用，再带着问题回来')}
${progCard(c.fmt, planBtn('zh', { pos: 'training-format' }))}
<p class="prog-alt"><strong>两周回访属于四次课程项目。</strong>单次工作坊或全天上门培训后的额外支持，需要另行确认范围。</p></div></section>

${learnerFeedback('zh')}

<section class="sec tight" id="about"><div class="wrap"><div class="big-card" style="flex-direction:row;align-items:center;gap:32px;flex-wrap:wrap"><img src="/img/jack-portrait-256.webp" width="256" height="256" loading="lazy" decoding="async" alt="Jack Qian" style="width:120px;height:120px;border-radius:50%;object-fit:cover;flex:none">
<div style="display:flex;flex-direction:column;gap:16px;flex:1 1 320px"><h2>由谁授课</h2><p>Jack Qian 在德州达拉斯经营 AI Man Jack LLC，由他本人设计并讲授课程。</p><p id="community-proof">他的经历包括在达拉斯一家半导体公司从事业务规划、搭建 AI 工作流，以及组织本地社区 AI 活动。他也撰写 <a href="https://realagentusecases.com/">Real Agent Use Cases</a>，介绍实际应用中的 AI 智能体和工作流。</p><p><a class="more" href="/zh/about/">了解 Jack →</a> · <a href="/zh/ai-training/dallas/">查看达拉斯—沃斯堡的活动与场地 →</a></p></div></div>
<aside class="buyer-prep"><h3>一个工作流实施案例</h3><div><p><a href="/zh/case-studies/livestream-agency-scheduling/">直播机构排班案例</a>介绍了一套按明确规则生成每周排班初稿的系统。最终班表仍由运营负责人审核、修改并发布。</p><p>这是系统实施案例，不作为培训效果的证明；目前也尚未核实净节省时间。</p></div></aside>
<div class="buyer-links" id="testimonials"><a href="${GBP_URL}" target="_blank" rel="noopener">查看 Google 上的学员评价 ↗</a></div></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">常见问题与准备</div><h2 style="font-size:clamp(32px,3.6vw,52px)">开始前需要了解什么</h2></div>
<div class="faq" style="grid-column:6 / span 7">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>
${ctaBand('zh', { h: '一起讨论团队适合从哪里开始', sub: '带一项重复性任务来咨询，讨论团队的需求、现有工具，以及哪种培训形式适合这项工作。', pos: 'training-final' })}`,
    jsonld: [business('zh'), person(), faqPage(c.faq, `${SITE}/zh/ai-training/#faq`), bc.ld],
  };
};

const page = (lang) => lang === 'en' ? englishPage() : chinesePage();

export const pages = [{ path: '/ai-training/', priority: 0.9, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
