// Case studies. CURRENT cases (src/content/cases.mjs) are indexable proof pages for the training positioning.
// LEGACY receptionist-era cases below stay HTTP 200 + noindex, out of the sitemap, and are never linked from an indexable page.
import { SITE, DEMO_DISPLAY } from '../config.mjs';
import { L, planBtn, ctaBand, href } from '../layout.mjs';
import { pageHero, breadcrumb, finalCta, CASES, BUSINESS_REF, T } from '../components.mjs';
import { card } from '../resources.mjs';
import { CURRENT_CASES, LIVESTREAM } from '../content/cases.mjs';

const DATE = '2026-09-09';
const article = (lang, slug, headline, description) => ({
  '@type': 'Article', '@id': `${SITE}${lang === 'zh' ? '/zh' : ''}/case-studies/${slug}/`, headline, description, datePublished: DATE, dateModified: DATE,
  inLanguage: lang, author: { '@id': `${SITE}/#jack` }, publisher: { '@id': `${SITE}/#business` }, about: { '@id': `${SITE}/#service` },
});

// ── Index (current cases only) ──
const index = {
  en: { title: 'AI Workflow Case Studies | AI Man Jack', description: 'Real AI workflow implementations from AI Man Jack: the business problem, what was built, what failed, what was measured, and what still needs validation.',
    crumb: 'Case studies', h1: 'Real workflows. Real constraints. Real failures.', sub: 'No invented ROI. Each case shows the process before automation, what was actually built, the rules and guardrails, measured results, failures, and what still needs validation.', read: 'Read the case study' },
  zh: { title: 'AI 工作流案例 | AI Man Jack', description: 'AI Man Jack 的真实 AI 工作流落地案例：原始问题、实际搭建、失败、实测结果，以及仍待验证的部分。',
    crumb: '案例', h1: '真实工作流，真实约束，也写真实踩坑。', sub: '不编 ROI。每个案例都写自动化前的流程、真正搭了什么、规则和护栏、测到的结果、出过的错，以及还没验证的地方。', read: '查看完整案例' },
};
const casePath = (c) => `/case-studies/${c.slug}/`;
const currentCard = (c, lang, hl = 'h2') => card({ href: L(lang, casePath(c)), kicker: c[lang].eyebrow, title: c[lang].name, text: c[lang].card, tags: c[lang].tags, cta: index[lang].read, event: 'case_study_click', hl });

// One compact proof block for the home, training, operations and workflows pages. Keeps the six-hour figure next to its human-review caveat.
const PROOF = {
  en: { k: 'Real workflow · In production', real: 'Real deployment · In production', h: 'A livestream agency’s weekly first draft used to take about six hours.', p: 'Now it is generated automatically from staff availability and client-owned rules. A person still reviews, edits and publishes the schedule. The case study includes the measurements and everything that broke.' },
  zh: { k: '真实案例 · 已上线', real: '真实落地 · 已上线', h: '一家直播公司，以前每周排第一版班表大约要 6 小时。', p: '现在系统根据员工可播时间和客户自己维护的规则自动生成第一版，最终仍由运营负责人审核、修改并发布。案例里写了实测数据，也写了坏过的地方。' },
};
export const caseProof = (lang, { real = false } = {}) => { const x = PROOF[lang];
  return `<section class="sec tight case-proof${real ? ' flush' : ''}" id="case-study"><div class="wrap">${card({ href: L(lang, casePath(LIVESTREAM)), kicker: real ? x.real : x.k, title: x.h, text: x.p, tags: LIVESTREAM[lang].tags, cta: index[lang].read, event: 'case_study_click', hl: 'h2', oak: true })}</div></section>`; };

// ── Current case page: a proof page in the article layout (auto "on this page" list from the <h2>s) ──
const STR = { en: { toc: 'On this page', ctaH: 'Have a process like this on your team?', ctaSub: 'Book a 30-minute call. Bring the task; we will work out what should be a rule, what AI can draft, and what a person must check.', moreK: 'Keep going', moreH: 'From this case to your team',
    ops: ['Use case', 'AI for Operations', 'Where AI saves time in operations work, and which steps stay with a person.', 'Open use case'], wf: ['Workflows', 'Step-by-step AI workflows', 'Each with the prompt, an example, a human review checklist and when not to use it.', 'Browse workflows'], tr: ['Training', 'Corporate AI training', 'Each person brings a task they already do and leaves with a workflow and a way to verify it.', 'See how training works'] },
  zh: { toc: '本页目录', ctaH: '你的团队里也有这样的流程？', ctaSub: '预约 30 分钟通话。带上那项任务，我们一起分清哪些该写成规则、哪些可以让 AI 起草、哪些必须由人核验。', moreK: '接下来', moreH: '从这个案例到你的团队',
    ops: ['应用场景', '运营团队的 AI 应用', 'AI 在运营工作里能省时间的环节，以及哪些步骤要留给人。', '查看应用场景'], wf: ['工作流', '分步骤的 AI 工作流', '每条都有提示词、示例、人工核验清单，以及不适用的情况。', '浏览工作流'], tr: ['培训', '企业 AI 培训', '每位学员带一项真实任务来，带一条工作流和一套核验方法走。', '了解培训方式'] } };
const table = (t) => `<div class="table-wrap"><table class="nums-t"><thead><tr>${t.head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${t.rows.map(([h, ...v]) => `<tr><th scope="row">${h}</th>${v.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const ol = (items) => `<ol>${items.map(([b, t]) => `<li><strong>${b}</strong> ${t}</li>`).join('')}</ol>`;

const currentPage = (c0, lang) => {
  const c = c0[lang], s = STR[lang], path = casePath(c0), url = `${SITE}${L(lang, path)}`;
  const bc = breadcrumb(lang, [[index[lang].crumb, '/case-studies/'], [c.name, path]]);
  const ops = href(lang, '/use-cases/operations/'), wf = href(lang, '/workflows/'), tr = L(lang, '/ai-training/');
  const secs = [
    [c.factsH, `<dl class="kv">${c.kv.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`],
    [c.beforeH, `<p>${c.beforeP}</p><div class="g2 ba"><div class="card"><div class="eyebrow">${c.beforeK}</div>${ul(c.before)}</div><div class="card oakc"><div class="eyebrow">${c.nowK}</div>${ul(c.now)}</div></div><p class="callout">${c.caveat}</p>`],
    [c.builtH, c.built.map((p) => `<p>${p}</p>`).join('')],
    [c.llmH, `${c.llm.map((p) => `<p>${p}</p>`).join('')}<p class="callout"><strong>${c.lesson}</strong></p>`],
    [c.notesH, ul(c.notes)],
    [c.measureH, `<p>${c.measureP1}</p>${table(c.t1)}<p>${c.measureP2}</p>${table(c.t2)}<p>${c.measureP3}</p>`],
    [c.failH, ol(c.fails)],
    [c.openH, `${ul(c.open)}<p class="callout">${c.why}</p>`],
    [c.teachH, `${ol(c.teach)}<p>${c.outro(ops, wf, tr)}</p>`],
  ];
  const toc = `<aside class="toc" aria-label="${s.toc}"><div class="eyebrow">${s.toc}</div><a href="#summary">${c.summaryH}</a>${secs.map(([h], i) => `<a href="#s${i + 1}">${h}</a>`).join('')}</aside>`;
  const onward = [[s.ops, ops, 'use_case_click'], [s.wf, wf, 'resource_click'], [s.tr, tr, 'resource_to_training_click']].map(([[k, t, p, cta], h, ev]) => card({ href: h, kicker: k, title: t, text: p, cta, event: ev }));
  return {
    title: c.title, description: c.description, view: 'case_study_view', ogType: 'article', bodyClass: 'post',
    body: `<div class="wrap"><header class="art-head" style="background:none;border:0">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="sm">${c.h1}</h1><p class="lead">${c.sub}</p><p class="art-by">${c.trust}</p></header>
<div class="art-grid">${toc}<article class="art-body post-body"><div class="takeaways" id="summary"><div class="eyebrow">${c.summaryH}</div><ul>${c.summary.map((t) => `<li><span>${t}</span></li>`).join('')}</ul></div>
${secs.map(([h, html], i) => `<h2 id="s${i + 1}">${h}</h2>${html}`).join('\n')}
<div class="cta-card on-dark"><div><b>${s.ctaH}</b><span>${s.ctaSub}</span></div>${planBtn(lang, { pos: 'case-study', cls: 'btn-sm' })}</div></article></div></div>
<section class="sec tight"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${s.moreK}</div><h2>${s.moreH}</h2></div><a class="more" href="${L(lang, '/case-studies/')}">${index[lang].crumb} →</a></div><div class="g3">${onward.join('')}</div></div></section>
${ctaBand(lang, { pos: 'case-study-final' })}`,
    jsonld: [{ '@type': 'Article', '@id': url, headline: c.h1, description: c.description, inLanguage: lang, datePublished: c0.date, dateModified: c0.updated || c0.date,
      author: { '@id': `${SITE}/#jack` }, publisher: { '@id': `${SITE}/#business` }, mainEntityOfPage: url }, BUSINESS_REF, bc.ld],
  };
};

// ── Legacy case pages (noindex) ──
const own = {
  en: {
    title: 'Case Study: Our Demo Line | AI Man Jack',
    description: 'Our demo line runs the product. What it does, what is measured, what is still unverified.',
    h1: 'The demo line: our own front desk, run by the product.',
    sub: 'Pilot results coming soon. This page is updated when the first full month has been counted.',
    kv: [['Business', 'AI Man Jack LLC, Dallas'], ['Business type', 'AI service provider'], ['Problem', 'Prospects should be able to try the receptionist before a sales call, with no signup and no form.'], ['Implementation', `The public line ${DEMO_DISPLAY} is answered by the AI receptionist, configured with our own hours, services and prices. It runs 24/7 in English, Spanish and Chinese.`], ['Measurement period', 'September 2026 onward'], ['Total relevant calls', 'Counted; published after the first full month'], ['Appointments booked', 'Booking the 30-minute call is being added; count published after it is live'], ['Show rate', 'Not measured yet'], ['Exceptions and failures', 'Reviewed call by call; summary published with the first month'], ['Customer quote', 'Not applicable: the customer is us']],
    testedH: 'What was tested', tested: ['Answering questions about the service, pricing and setup from an approved sheet', 'Handling the three prompts we ask every caller to try: price, an appointment, a change to the time', 'Answering in the language the caller uses', 'Staying up around the clock'],
    measureH: 'What is measured', measure: ['Calls received, by hour and language', 'Calls that reached a booking request', 'Calls the AI handed off instead of answering', 'Failures: no answer, dropped call, wrong information'],
    openH: 'What still needs validation', open: ['Booking into the calendar end to end, including reschedule and cancel', 'Fallback behavior under a failed connection', 'How many demo callers become sales calls'],
    why: 'Why no numbers yet: the line went live in September 2026. Publishing a partial month would invite exactly the kind of inflated claim this site avoids.',
  },
  zh: {
    title: '案例：我们的演示线 | AI Man Jack',
    description: '演示线运行我们的产品。能做什么、在测什么、还没验证的，实话实说。',
    h1: '演示线：我们自己的前台，由产品来接。',
    sub: '试点数据整理中。第一个完整月份数完之后更新。',
    kv: [['商家', 'AI Man Jack LLC，达拉斯'], ['类型', 'AI 服务商'], ['问题', '潜在客户应该能在销售通话之前试一试 AI 前台，不用注册，不用填表。'], ['实现方式', `公开号码 ${DEMO_DISPLAY} 由 AI 前台接听，配的是我们自己的营业时间、服务和价格。24 小时运行，支持英语、西班牙语和中文。`], ['测量周期', '2026 年 9 月起'], ['相关来电总数', '在数；第一个完整月份后公布'], ['预约数', '把和 Jack 的 30 分钟通话写进日历的功能正在加。上线后公布数字。'], ['实际到场', '尚未测量'], ['异常和失败', '逐通记录；随第一个月的数据一起公布摘要'], ['客户评价', '不适用：客户就是我们自己']],
    testedH: '测了什么', tested: ['按确认过的信息表回答关于服务、价格和安装的问题', '处理我们让每个来电者试的三件事：问价格、约时间、改时间', '用来电者的语言回答', '全天候在线'],
    measureH: '在测什么', measure: ['来电数，按小时和语言', '走到预约请求的来电数', 'AI 没回答、转交出去的来电数', '失败：没接、断线、信息错误'],
    openH: '还没验证的', open: ['端到端写入日历，包括改期和取消', '连接故障时的兜底行为', '多少演示来电变成了销售通话'],
    why: '为什么还没数字：这条线 2026 年 9 月才上线。拿不完整的一个月来发，正是本站要避免的那种夸大。',
  },
};

const dealer = {
  en: {
    title: 'Case Study: SMS Booking Agent | AI Man Jack',
    description: 'A live SMS booking agent for a DFW used-car dealer. Answers, offers slots, saves bookings, sends summaries. Metrics pending.',
    h1: 'A used-car dealership that answers texts while the lot is busy.',
    sub: 'Live in production. Dealership name withheld at their request; numbers are published once the owner approves them.',
    kv: [['Business', 'Used-car dealership, Dallas–Fort Worth (name withheld)'], ['Business type', 'Auto dealer, appointment-based test drives'], ['Problem', 'Inbound texts asking about test drives went unanswered while staff were with customers on the lot. Some buyers moved on.'], ['Implementation', 'An SMS agent on the dealer’s number. It asks which vehicle the buyer is interested in and when they can come in, offers time slots inside the dealer’s open hours, records the confirmed booking, and texts the dealer a summary with the buyer’s name, phone, vehicle and time.'], ['Channel', 'SMS only. This deployment does not answer voice calls.'], ['Measurement period', 'Not yet published'], ['Total relevant conversations', 'Logged; published with the owner’s approval'], ['Bookings', 'Logged; published with the owner’s approval'], ['Attended appointments', 'Tracked by the dealer'], ['Exceptions and failures', 'Logged per conversation; summary to follow'], ['Customer quote', 'None published yet']],
    notesH: 'Implementation notes', notes: ['The agent never quotes a vehicle price. Pricing questions are answered with a handoff to the dealer.', 'Bookings are stored in a database the dealer can read; nothing lives only in a chat log.', 'Every confirmed booking produces one summary text to the dealer, so a missed conversation still surfaces.', 'The same pattern, on voice instead of SMS, is what the <a href="/ai-receptionist/">AI receptionist</a> does.'],
    openH: 'What still needs validation', open: ['Booking-to-attendance rate', 'How often buyers ask something the agent hands off', 'Whether a voice line would capture buyers who do not text'],
  },
  zh: {
    title: '案例：短信预约 agent | AI Man Jack',
    description: '为达拉斯—沃斯堡二手车行做的短信 agent：回复、给时段、存预约、发摘要。已上线，数据待发。',
    h1: '一家二手车行，场地再忙也能回短信。',
    sub: '已在生产环境运行。应车行要求不公开名字；数字经店主同意后公布。',
    kv: [['商家', '二手车行，达拉斯—沃斯堡（不公开名字）'], ['类型', '汽车经销商，预约制试驾'], ['问题', '员工在场地里陪客户的时候，问试驾的短信没人回。有些买家就走了。'], ['实现方式', '车行号码上的一个短信 agent。它问买家看中哪辆车、什么时候能来，在车行营业时间内给出时段，记下确认的预约，再给车行发一条摘要短信：买家姓名、电话、车辆和时间。'], ['渠道', '只有短信。这个项目不接语音电话。'], ['测量周期', '尚未公布'], ['相关对话总数', '已记录；经店主同意后公布'], ['预约数', '已记录；经店主同意后公布'], ['实际到场', '由车行跟踪'], ['异常和失败', '逐段对话记录；摘要随后公布'], ['客户评价', '尚未公布']],
    notesH: '实现说明', notes: ['agent 从不报车价。问价格的，交给车行回答。', '预约存在车行能看的数据库里，不是只留在聊天记录里。', '每条确认的预约都会给车行发一条摘要短信，漏看的对话也能浮出来。', '同样的模式换成语音，就是 <a href="/zh/ai-receptionist/">AI 前台</a>做的事。'],
    openH: '还没验证的', open: ['预约到场率', '买家多久会问到一个需要转交的问题', '不发短信的买家，语音线能不能接住'],
  },
};

const casePage = (lang, slug, c) => {
  const bc = breadcrumb(lang, [[index[lang].crumb, '/case-studies/'], [CASES.find((x) => x.slug === slug)[lang].name, `/case-studies/${slug}/`]]);
  const list = (h, items) => `<div><h2 class="h3">${h}</h2><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;
  return {
    title: c.title, description: c.description, view: 'case_study_view', ogType: 'article',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: index[lang].crumb, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap prose" style="padding-bottom:48px"><dl class="kv">${c.kv.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>${c.why ? `<p class="callout">${c.why}</p>` : ''}</section>
<section class="section soft"><div class="wrap grid-3 prose" style="max-width:1200px">${c.tested ? list(c.testedH, c.tested) : list(c.notesH, c.notes)}${c.measure ? list(c.measureH, c.measure) : ''}${list(c.openH, c.open)}</div></section>
<section class="section"><div class="wrap narrow"><p class="lead">${lang === 'zh' ? '想看它在你店里怎么跑？' : 'Want to see how this runs for your business?'} <a href="${L(lang, '/ai-receptionist/')}">${lang === 'zh' ? 'AI 前台怎么运作' : 'How the AI receptionist works'} &rarr;</a> · <a href="${L(lang, '/pricing/')}">${T[lang].cta.viewPricing} &rarr;</a></p></div></section>
${finalCta(lang)}`,
    jsonld: [article(lang, slug, c.h1, c.description), BUSINESS_REF, bc.ld],
  };
};

const indexPage = (lang) => {
  const c = index[lang], bc = breadcrumb(lang, [[c.crumb, '/case-studies/']]);
  return {
    title: c.title, description: c.description, view: 'case_study_view',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: c.crumb, h1: c.h1, sub: c.sub, ctas: false })}
<section class="sec tight"><div class="wrap"><div class="g2">${CURRENT_CASES.map((x) => currentCard(x, lang)).join('')}</div></div></section>${ctaBand(lang, { pos: 'case-studies-index' })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, '/case-studies/')}`, name: c.h1, description: c.description, inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` } }, BUSINESS_REF, bc.ld],
  };
};

export const pages = [
  { path: '/case-studies/', priority: 0.7, en: indexPage('en'), zh: indexPage('zh') },
  ...CURRENT_CASES.map((c) => ({ path: casePath(c), priority: 0.8, en: currentPage(c, 'en'), zh: currentPage(c, 'zh') })),
  { path: '/case-studies/ai-man-jack/', indexable: false, priority: 0.6, en: casePage('en', 'ai-man-jack', own.en), zh: casePage('zh', 'ai-man-jack', own.zh) },
  { path: '/case-studies/car-dealership-sms/', indexable: false, priority: 0.6, en: casePage('en', 'car-dealership-sms', dealer.en), zh: casePage('zh', 'car-dealership-sms', dealer.zh) },
];
