import { SITE, DEMO_DISPLAY } from '../config.mjs';
import { L } from '../layout.mjs';
import { pageHero, breadcrumb, caseCards, finalCta, CASES, BUSINESS_REF, T } from '../components.mjs';

const DATE = '2026-09-09';
const article = (lang, slug, headline, description) => ({
  '@type': 'Article', '@id': `${SITE}${lang === 'zh' ? '/zh' : ''}/case-studies/${slug}/`, headline, description, datePublished: DATE, dateModified: DATE,
  inLanguage: lang, author: { '@id': `${SITE}/#jack` }, publisher: { '@id': `${SITE}/#business` }, about: { '@id': `${SITE}/#service` },
});

// ── Index ──
const index = {
  en: { title: 'Case Studies: Measured, Not Invented | AI Man Jack', description: 'Two real deployments of AI Man Jack’s phone and SMS agents in Dallas–Fort Worth, with what was built, what is measured, and what still needs validation. No invented numbers.',
    crumb: 'Case studies', h1: 'Proof, as it becomes available.', sub: 'Every case study lists the problem, the implementation, the measurement period and the failures. Numbers appear only once they have been counted.' },
  zh: { title: '案例：只写测过的，不编 | AI Man Jack', description: 'AI Man Jack 在达拉斯—沃斯堡的两个真实项目：电话 agent 和短信 agent，写清楚做了什么、在测什么、还有什么没验证。不编数字。',
    crumb: '案例', h1: '证据，有多少给多少。', sub: '每个案例都写问题、实现方式、测量周期和出过的错。数字数过了才发。' },
};

// ── Case pages ──
const own = {
  en: {
    title: 'Case Study: AI Man Jack’s Own Demo Line | AI Man Jack',
    description: 'Our own phone line is answered by the product. What the demo line does today, what is measured, what still needs validation, and why the numbers are not published yet.',
    h1: 'The demo line: our own front desk, run by the product.',
    sub: 'Pilot results coming soon. This page is updated when the first full month has been counted.',
    kv: [['Business', 'AI Man Jack LLC, Dallas'], ['Business type', 'AI service provider'], ['Problem', 'Prospects should be able to try the receptionist before a sales call, with no signup and no form.'], ['Implementation', `The public line ${DEMO_DISPLAY} is answered by the AI receptionist, configured with our own hours, services and prices. It runs 24/7 in English, Spanish and Chinese.`], ['Measurement period', 'September 2026 onward'], ['Total relevant calls', 'Counted; published after the first full month'], ['Bookings', 'Booking the 15-minute call with Jack into the calendar is being added. Counts are published once it is live.'], ['Attended appointments', 'Not yet measured'], ['Exceptions and failures', 'Logged per call; a summary is published with the first month’s numbers'], ['Customer quote', 'Not applicable: the customer is us']],
    testedH: 'What was tested', tested: ['Answering questions about the service, pricing and setup from an approved sheet', 'Handling the three prompts we ask every caller to try: price, an appointment, a change to the time', 'Answering in the language the caller uses', 'Staying up around the clock'],
    measureH: 'What is measured', measure: ['Calls received, by hour and language', 'Calls that reached a booking request', 'Calls the AI handed off instead of answering', 'Failures: no answer, dropped call, wrong information'],
    openH: 'What still needs validation', open: ['Booking into the calendar end to end, including reschedule and cancel', 'Fallback behavior under a failed connection', 'How many demo callers become sales calls'],
    why: 'Why no numbers yet: the line went live in September 2026. Publishing a partial month would invite exactly the kind of inflated claim this site avoids.',
  },
  zh: {
    title: '案例：AI Man Jack 自己的演示线 | AI Man Jack',
    description: '我们自己的电话就由这个产品来接。演示线现在能做什么、在测什么、还有什么没验证，以及为什么数字还没发。',
    h1: '演示线：我们自己的前台，由产品来接。',
    sub: '试点数据整理中。第一个完整月份数完之后更新。',
    kv: [['商家', 'AI Man Jack LLC，达拉斯'], ['类型', 'AI 服务商'], ['问题', '潜在客户应该能在销售通话之前试一试 AI 前台，不用注册，不用填表。'], ['实现方式', `公开号码 ${DEMO_DISPLAY} 由 AI 前台接听，配的是我们自己的营业时间、服务和价格。24 小时运行，支持英语、西班牙语和中文。`], ['测量周期', '2026 年 9 月起'], ['相关来电总数', '在数；第一个完整月份后公布'], ['预约数', '把和 Jack 的 15 分钟通话写进日历的功能正在加。上线后公布数字。'], ['实际到场', '尚未测量'], ['异常和失败', '逐通记录；随第一个月的数据一起公布摘要'], ['客户评价', '不适用：客户就是我们自己']],
    testedH: '测了什么', tested: ['按确认过的信息表回答关于服务、价格和安装的问题', '处理我们让每个来电者试的三件事：问价格、约时间、改时间', '用来电者的语言回答', '全天候在线'],
    measureH: '在测什么', measure: ['来电数，按小时和语言', '走到预约请求的来电数', 'AI 没回答、转交出去的来电数', '失败：没接、断线、信息错误'],
    openH: '还没验证的', open: ['端到端写入日历，包括改期和取消', '连接故障时的兜底行为', '多少演示来电变成了销售通话'],
    why: '为什么还没数字：这条线 2026 年 9 月才上线。拿不完整的一个月来发，正是本站要避免的那种夸大。',
  },
};

const dealer = {
  en: {
    title: 'Case Study: SMS Booking Agent for a DFW Car Dealership | AI Man Jack',
    description: 'A text-message booking agent built for a used-car dealership in Dallas–Fort Worth: it answers inbound texts, offers time slots, stores the booking and sends the dealer a summary. Live; metrics not yet published.',
    h1: 'A used-car dealership that answers texts while the lot is busy.',
    sub: 'Live in production. Dealership name withheld at their request; numbers are published once the owner approves them.',
    kv: [['Business', 'Used-car dealership, Dallas–Fort Worth (name withheld)'], ['Business type', 'Auto dealer, appointment-based test drives'], ['Problem', 'Inbound texts asking about test drives went unanswered while staff were with customers on the lot. Some buyers moved on.'], ['Implementation', 'An SMS agent on the dealer’s number. It asks which vehicle the buyer is interested in and when they can come in, offers time slots inside the dealer’s open hours, records the confirmed booking, and texts the dealer a summary with the buyer’s name, phone, vehicle and time.'], ['Channel', 'SMS only. This deployment does not answer voice calls.'], ['Measurement period', 'Not yet published'], ['Total relevant conversations', 'Logged; published with the owner’s approval'], ['Bookings', 'Logged; published with the owner’s approval'], ['Attended appointments', 'Tracked by the dealer'], ['Exceptions and failures', 'Logged per conversation; summary to follow'], ['Customer quote', 'None published yet']],
    notesH: 'Implementation notes', notes: ['The agent never quotes a vehicle price. Pricing questions are answered with a handoff to the dealer.', 'Bookings are stored in a database the dealer can read; nothing lives only in a chat log.', 'Every confirmed booking produces one summary text to the dealer, so a missed conversation still surfaces.', 'The same pattern, on voice instead of SMS, is what the <a href="/ai-receptionist/">AI receptionist</a> does.'],
    openH: 'What still needs validation', open: ['Booking-to-attendance rate', 'How often buyers ask something the agent hands off', 'Whether a voice line would capture buyers who do not text'],
  },
  zh: {
    title: '案例：DFW 二手车行的短信预约 agent | AI Man Jack',
    description: '为达拉斯—沃斯堡一家二手车行做的短信预约 agent：回复来信、给出时段、存下预约，再给车行发摘要。已上线，数据待公布。',
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
<section class="wrap" style="padding-bottom:64px">${caseCards(lang, { hl: 'h2' })}</section>${finalCta(lang)}`,
    jsonld: [BUSINESS_REF, bc.ld],
  };
};

export const pages = [
  { path: '/case-studies/', priority: 0.7, en: indexPage('en'), zh: indexPage('zh') },
  { path: '/case-studies/ai-man-jack/', priority: 0.6, en: casePage('en', 'ai-man-jack', own.en), zh: casePage('zh', 'ai-man-jack', own.zh) },
  { path: '/case-studies/car-dealership-sms/', priority: 0.6, en: casePage('en', 'car-dealership-sms', dealer.en), zh: casePage('zh', 'car-dealership-sms', dealer.zh) },
];
