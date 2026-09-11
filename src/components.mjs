import { SITE, EMAIL, DEMO_TEL, DEMO_DISPLAY, SMS_TEL, SMS_DISPLAY, PRICING, money, GBP_URL, langPath } from './config.mjs';
import { T } from './i18n.mjs';
import { callBtn, secondaryBtn, L, esc } from './layout.mjs';

// ── Shared data ───────────────────────────────────────────────────────────
export const INDUSTRIES = [
  { slug: 'salons', en: { name: 'Salon & beauty', tag: 'Hair, nails, lashes, barbershops' }, zh: { name: '美发美容', tag: '美发、美甲、美睫、理发店' } },
  { slug: 'med-spas', en: { name: 'Med spa', tag: 'Injectables, laser, skin treatments' }, zh: { name: '医美 spa', tag: '注射、激光、皮肤护理' } },
  { slug: 'clinics', en: { name: 'Clinics', tag: 'Dental, chiropractic, physical therapy, acupuncture' }, zh: { name: '诊所', tag: '牙科、脊椎、物理治疗、针灸' } },
  { slug: 'home-services', en: { name: 'Home services', tag: 'Cleaning, HVAC, plumbing, lawn care' }, zh: { name: '上门服务', tag: '保洁、空调、水管、草坪' } },
  { slug: 'repair-services', en: { name: 'Repair & service', tag: 'Auto, phone, appliance, shoe repair' }, zh: { name: '维修服务', tag: '汽车、手机、家电、修鞋' } },
];

// Status labels are facts, not marketing (PRD §13). Upgrade only after a real test.
export const INTEGRATIONS = [
  { cat: { en: 'Booking', zh: '预约' }, items: [
    { name: { en: 'AI Man Jack booking system (included)', zh: 'AI Man Jack 自带预约系统' }, status: 'supported' },
    { name: { en: 'Square Appointments', zh: 'Square Appointments' }, status: 'ask' },
    { name: { en: 'Booksy', zh: 'Booksy' }, status: 'ask' },
    { name: { en: 'Vagaro', zh: 'Vagaro' }, status: 'ask' },
    { name: { en: 'Fresha', zh: 'Fresha' }, status: 'ask' },
    { name: { en: 'Calendly', zh: 'Calendly' }, status: 'ask' },
  ] },
  { cat: { en: 'Calendar', zh: '日历' }, items: [
    { name: { en: 'Google Calendar', zh: 'Google 日历' }, status: 'pilot' },
    { name: { en: 'Outlook / Microsoft 365', zh: 'Outlook / Microsoft 365' }, status: 'ask' },
  ] },
  { cat: { en: 'Phone system', zh: '电话系统' }, items: [
    { name: { en: 'Call forwarding from your current number', zh: '现有号码呼叫转接' }, status: 'supported' },
    { name: { en: 'New dedicated number', zh: '新的专用号码' }, status: 'supported' },
    { name: { en: 'RingCentral, Grasshopper, other VoIP', zh: 'RingCentral、Grasshopper 等 VoIP' }, status: 'ask' },
  ] },
  { cat: { en: 'SMS', zh: '短信' }, items: [
    { name: { en: 'Text the owner the caller’s details', zh: '把来电信息短信发给店主' }, status: 'supported' },
    { name: { en: 'Confirmation texts to customers', zh: '给顾客发确认短信' }, status: 'pilot' },
  ] },
  { cat: { en: 'CRM', zh: 'CRM' }, items: [
    { name: { en: 'HubSpot, GoHighLevel, other CRMs', zh: 'HubSpot、GoHighLevel 等 CRM' }, status: 'ask' },
  ] },
];
export const STATUS = { supported: { en: 'Supported', zh: '已支持' }, pilot: { en: 'Pilot', zh: '测试中' }, ask: { en: 'Ask us', zh: '请联系确认' } };

export const CASES = [
  { slug: 'ai-man-jack',
    en: { name: 'AI Man Jack demo line', type: 'AI service provider · Dallas–Fort Worth', status: 'Pilot results coming soon',
      problem: 'Prospects should try the receptionist before a sales call, without signing up.',
      summary: 'Our own phone line is answered by the product. It takes questions about the service and books the 15-minute call with Jack.' },
    zh: { name: 'AI Man Jack 演示线', type: 'AI 服务商 · 达拉斯—沃斯堡', status: '试点数据整理中',
      problem: '想让潜在客户在销售通话之前，不用注册就先试一试。',
      summary: '我们自己的电话就由这个产品来接。它回答关于服务的问题，并帮来电者约上和 Jack 的 15 分钟通话。' } },
  { slug: 'car-dealership-sms',
    en: { name: 'Used-car dealership, SMS booking agent', type: 'Auto dealer · Dallas–Fort Worth', status: 'Live · metrics not yet published',
      problem: 'Inbound texts about test drives went unanswered while staff were on the lot.',
      summary: 'A text-message agent collects the request, offers time slots, stores the confirmed booking and sends the dealer a summary.' },
    zh: { name: '二手车行短信预约 agent', type: '汽车经销商 · 达拉斯—沃斯堡', status: '已上线 · 数据待公布',
      problem: '员工在场地里忙的时候，顾客问试驾的短信没人回。',
      summary: '一个短信 agent 收集需求、给出可选时段、存下确认的预约，再把摘要发给车行。' } },
];

const FAQ = {
  en: [
    ['Do I need to change my phone number?', 'No. Keep your number and forward calls to the AI, or let the AI answer on a new number. Both are supported, and we pick one during setup.'],
    ['Can it use my existing booking system?', 'The included booking system works today. Third-party systems such as Square, Booksy, Vagaro or Fresha have not been tested yet, so each one is listed as <em>Ask us</em> on the <a href="/integrations/">integrations page</a>. Tell us what you use and we check before you pay.'],
    ['What happens when the AI does not know the answer?', 'It does not invent one. You choose the fallback during setup: take a message, transfer to a person, or text you the caller’s details.'],
    ['Can it transfer the call to a person?', 'Yes. Transfers to a number you choose are part of every plan.'],
    ['Can customers reschedule or cancel?', 'On Growth and Pro, rescheduling and cancellation are part of the booking workflow and follow the rules you set. Starter answers questions and takes messages but does not book.'],
    ['What languages can it speak?', 'English, Spanish and Chinese. The demo line speaks all three, so call it in the language your customers use.'],
    ['What does the monthly fee include?', 'The included voice minutes for your plan, AI answers to approved questions, message taking and transfers, and the reporting listed on the <a href="/pricing/">pricing page</a>. The one-time setup fee is separate.'],
    ['How long does setup take?', 'About one week after we receive your hours, services, prices and booking rules, then a tuning period that varies by business.'],
    ['What happens if the phone or booking integration fails?', 'The fallback flow runs, so callers can still leave a message, be transferred, or have their details texted to you. Jack is notified and fixes the connection.'],
    ['Can I turn the AI off?', 'Yes. Contact Jack and call forwarding is switched off. Your phone rings the way it did before.'],
    ['Who owns the number and data?', 'Your number is yours. If you forwarded your existing number, forwarding is switched off and nothing else changes. If AI Man Jack provisioned a number for your business, it can be transferred or ported to you when service ends, subject to carrier requirements. No vendor lock-in. Your website files and domain are yours too; included hosting ends with the service. Call data stays in your account and is not sold.'],
    ['Is this appropriate for healthcare businesses?', 'Clinics are welcome. Sensitive or regulated workflows are discussed before setup, and no compliance certification is claimed.'],
  ],
  zh: [
    ['我需要换电话号码吗？', '不用。可以保留现有号码，把来电转给 AI；也可以让 AI 用一个新号码接。两种都支持，设置时选一种就行。'],
    ['能接我现在用的预约系统吗？', '自带的预约系统现在就能用。Square、Booksy、Vagaro、Fresha 这类第三方系统还没测过，所以在<a href="/zh/integrations/">对接页</a>上都标为「请联系确认」。告诉我们你在用什么，付款前先查清楚。'],
    ['AI 不知道答案时怎么办？', '它不会编。设置时你来定兜底方式：留言、转给真人，或者把来电信息短信发给你。'],
    ['能把电话转给真人吗？', '能。转接到你指定的号码，每个方案都包含。'],
    ['顾客能改时间或取消吗？', 'Growth 和 Pro 方案里，改期和取消是预约流程的一部分，按你定的规则走。Starter 只回答问题和留言，不做预约。'],
    ['它会说哪些语言？', '英语、西班牙语和中文。演示线三种都会，用你顾客的语言打就行。'],
    ['月费包含什么？', '方案内的通话分钟数、按已确认信息回答问题、留言和转接，还有<a href="/zh/pricing/">价格页</a>上列的通话回顾。一次性安装费另计。'],
    ['安装要多久？', '收到你的营业时间、服务项目、价格和预约规则后，大约一周上线，之后还有一段磨合期，长短看店的情况。'],
    ['电话或预约对接出问题怎么办？', '兜底流程会接上：来电者仍然可以留言、转接，或者把信息短信发给你。Jack 会收到通知去修。'],
    ['我能把 AI 关掉吗？', '能。联系 Jack，关掉呼叫转接，你的电话就和以前一样响。'],
    ['号码和数据归谁？', '号码是你的。用自己号码转接的，关掉转接就行，别的都不变。号码是 AI Man Jack 帮你申请的，服务结束时可以转到你名下（按运营商的规定办）。不锁你。网站文件和域名也是你的，服务停止后包含的托管随之停止。通话数据留在你的账户里，不会出售。'],
    ['医疗类商家适合用吗？', '诊所欢迎。涉及敏感或受监管流程的，安装前先聊；我们不做任何合规认证的声明。'],
  ],
};

// ── Blocks ────────────────────────────────────────────────────────────────
export const eyebrow = (s) => `<p class="eyebrow">${s}</p>`;

export function pageHero(lang, { eyebrow: e, h1, sub, ctas = true, pos = 'hero' }) {
  return `<section class="page-hero"><div class="wrap narrow">${e ? eyebrow(e) : ''}<h1>${h1}</h1>${sub ? `<p class="lead">${sub}</p>` : ''}
${ctas ? `<div class="cta-row">${callBtn(lang, { event: 'hero_call_click', pos })}${secondaryBtn(lang, { pos })}</div>` : ''}</div></section>`;
}

// PhoneDemoCard: live-call mockup on top, demo strip (number, Call now, languages, status) below.
export function phoneCard(lang, id = 'hero-call') {
  const d = T[lang].demo, t = T[lang];
  const lines = lang === 'zh'
    ? [['c', '周五下午有位置吗？'], ['a', '有，2:30 和 4:00 都可以。'], ['c', '2:30 吧。']]
    : [['c', '“Do you have anything Friday afternoon?”'], ['a', '“Yes. I have 2:30 PM and 4:00 PM.”'], ['c', '“2:30 works.”']];
  return `<div class="phone-card" aria-label="${d.try}">
<div class="live-call"><div class="live-head"><span class="live-dot" aria-hidden="true"></span><span>${d.live}</span><span class="live-role">${d.role}</span><span class="live-time" aria-hidden="true">00:37</span></div>
${lines.map(([w, s]) => `<div class="turn ${w === 'a' ? 'ai' : 'cust'}"><span class="who">${w === 'a' ? d.ai : d.customer}</span><p>${s}</p></div>`).join('')}
<div class="booked"><span class="check" aria-hidden="true">&#10003;</span><b>${d.booked}</b><span>${lang === 'zh' ? '周五 · 2:30 PM' : 'Friday · 2:30 PM'}</span></div>
<p class="example-note">${d.example}</p></div>
<div class="demo-strip"><p class="demo-try">${d.try}</p>
<a class="demo-number" id="${id}" href="tel:${DEMO_TEL}" data-call data-event="hero_call_click" data-pos="phone-card">${DEMO_DISPLAY}</a>
${callBtn(lang, { event: 'demo_call_click', pos: 'phone-card', label: t.cta.callNow })}
<p class="demo-meta"><span>${d.langs}</span><span><span class="status-dot" aria-hidden="true"></span>${d.alwaysOn}</span></p></div>
</div>`;
}

// Transcript module (PRD §10). lines: [['c'|'a', text]], result: string
export function transcript(lang, lines, result, { cta = true } = {}) {
  const d = T[lang].demo;
  return `<div class="transcript"><p class="example-note top">${d.example}</p>
${lines.map(([w, s]) => `<div class="turn ${w === 'a' ? 'ai' : 'cust'}"><span class="who">${w === 'a' ? d.ai : d.customer}</span><p>${s}</p></div>`).join('')}
<div class="booked"><span class="check" aria-hidden="true">&#10003;</span><b>${result}</b></div>
${cta ? `<p class="transcript-cta">${callBtn(lang, { event: 'demo_call_click', pos: 'transcript', cls: 'btn-sm', label: T[lang].cta.callYourself })} <span class="muted">${DEMO_DISPLAY}</span></p>` : ''}</div>`;
}

// How it works — three steps, each with a small product-UI visual (PRD §9).
export function howItWorks(lang, id = 'how') {
  const s = lang === 'zh' ? {
    h: '从电话响，到预约成。',
    steps: [
      ['客户打进来', '用你现在的号码转接，或者给 AI 一个新号码，装的时候定。', `<div class="mini incoming"><span class="mini-dot"></span><b>来电</b><span>(214) ··· ····</span></div>`],
      ['AI 接起来聊', '只答你确认过的问题，查空位，按你店里的规矩约。', `<div class="mini chat"><p class="b cust">周六上午有空吗？</p><p class="b ai">有，10:30 可以。</p></div>`],
      ['预约成了', '预约进你的系统，客户收到确认，你不用管。', `<div class="mini booked-mini"><span class="check">&#10003;</span><b>已预约</b><span>周六 · 10:30 AM</span></div>`],
    ],
  } : {
    h: 'From phone call to booked appointment.',
    steps: [
      ['Customer calls', 'Keep your current number or route calls to the AI, depending on setup.', `<div class="mini incoming"><span class="mini-dot"></span><b>Incoming call</b><span>(214) ··· ····</span></div>`],
      ['AI handles the conversation', 'It answers approved questions, checks availability, and follows your booking rules.', `<div class="mini chat"><p class="b cust">Anything Saturday morning?</p><p class="b ai">Yes, 10:30 is open.</p></div>`],
      ['Appointment is booked', 'The booking goes into the connected scheduling workflow and the customer gets confirmation.', `<div class="mini booked-mini"><span class="check">&#10003;</span><b>Booked</b><span>Saturday · 10:30 AM</span></div>`],
    ],
  };
  return `<section id="${id}" class="section"><div class="wrap">${eyebrow(T[lang].nav.how)}<h2>${s.h}</h2>
<ol class="steps">${s.steps.map(([h, p, v], i) => `<li><span class="num">0${i + 1}</span>${v}<h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></div></section>`;
}

export function capabilities(lang) {
  const c = lang === 'zh' ? { h: '你们每天在接的那些电话。', cards: [
    ['问店里的事', '几点开门、在哪儿、做什么项目、多少钱，都按你确认过的说。'],
    ['约时间', '查空位、约、改期，Growth 以上还能取消。'],
    ['记下客人信息', '姓名、电话、想做什么、什么时候方便。'],
    ['交给人', '转给你或员工、留言，或者把来电信息短信发给你。AI 不该答的，按你定的方式处理。'],
  ] } : { h: 'The calls your team answers every day.', cards: [
    ['Business questions', 'Hours, location, service information and the pricing you approve.'],
    ['Scheduling', 'Check availability, book, reschedule, and cancel on plans that include it.'],
    ['Lead capture', 'Caller name, phone, requested service and preferred time.'],
    ['Handoff', 'Transfer to a person, take a message, or text you the caller’s details. When the AI should not answer, your fallback runs.'],
  ] };
  return `<section class="section" id="capabilities"><div class="wrap">${eyebrow(lang === 'zh' ? '能处理什么' : 'What it can handle')}<h2>${c.h}</h2>
<div class="grid-4">${c.cards.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>`;
}

export function industryCards(lang, { heading = true, hl = 'h3' } = {}) {
  const other = lang === 'zh' ? ['其他行业', '不在这个单子里？跟我们说说你们店怎么接电话。'] : ['Other appointment businesses', 'Not listed? Tell us how you take calls today.'];
  return `${heading ? `<section class="section" id="industries"><div class="wrap">${eyebrow(T[lang].nav.useCases)}<h2>${lang === 'zh' ? '靠预约吃饭的生意，都用得上。' : 'Built for businesses that run on appointments.'}</h2>` : ''}
<div class="grid-3 industry-grid">${INDUSTRIES.map((i) => `<a class="card link-card" href="${L(lang, `/industries/${i.slug}/`)}"><${hl} class="h3">${i[lang].name}</${hl}><p>${i[lang].tag}</p><span class="arrow" aria-hidden="true">&rarr;</span></a>`).join('')}
<a class="card link-card" href="${L(lang, '/contact/')}"><${hl} class="h3">${other[0]}</${hl}><p>${other[1]}</p><span class="arrow" aria-hidden="true">&rarr;</span></a></div>${heading ? '</div></section>' : ''}`;
}

export const integrationLine = (lang) => lang === 'zh'
  ? `<p class="int-line">自带预约系统 · 现有号码转接 · Google 日历测试中 · <a href="${L(lang, '/integrations/')}" data-event="integration_click">全部对接和状态 &rarr;</a></p>`
  : `<p class="int-line">Booking system included · Call forwarding supported · Google Calendar pilot · <a href="${L(lang, '/integrations/')}" data-event="integration_click">All integrations and their status &rarr;</a></p>`;

export function integrationList(lang, { compact = false, hl = 'h3' } = {}) {
  const rows = INTEGRATIONS.filter((c) => !compact || ['Booking', 'Calendar', 'Phone system'].includes(c.cat.en)).map((c) =>
    `<div class="int-cat"><${hl} class="h3">${c.cat[lang]}</${hl}><ul>${c.items.map((i) => `<li><span>${i.name[lang]}</span><span class="badge badge-${i.status}">${STATUS[i.status][lang]}</span></li>`).join('')}</ul></div>`).join('');
  return `<div class="int-grid">${rows}</div>`;
}

export function caseCards(lang, { hl = 'h3' } = {}) {
  return `<div class="grid-2">${CASES.map((c) => `<article class="card case-card"><p class="status">${c[lang].status}</p><${hl} class="h3">${c[lang].name}</${hl}><p class="muted">${c[lang].type}</p><p>${c[lang].summary}</p><a href="${L(lang, `/case-studies/${c.slug}/`)}" data-event="case_study_click">${T[lang].cta.readCase} &rarr;</a></article>`).join('')}</div>`;
}

// Pricing (PRD §15, approved table). compact = three cards only; full = cards + comparison table.
const TIER_COPY = {
  en: { starter: ['Starter', 'AI receptionist: answers approved questions, takes messages, transfers calls. No booking.'], growth: ['Growth', 'Everything in Starter, plus booking, rescheduling and cancellation.'], pro: ['Pro', 'Everything in Growth, plus multiple staff, services and routing within one location.'],
    recommended: 'Recommended', mo: '/ month', setup: 'one-time setup', minutes: 'minutes / month included', overage: 'overage', choose: 'Start with', full: 'See the full comparison',
    addon: ['Optional add-on: website + Google Business Profile', `+${money(PRICING.addon.website)} one-time, on any plan`, ['One-page booking-focused website with call and booking entry points', 'Hosting and basic SEO setup (titles, descriptions, sitemap) while the service is active', 'Google Business Profile reviewed and corrected to match what the AI says', 'Already have a website? Skip this. The AI works with it as is.']],
    rows: [
      ['Monthly fee', (t) => `<b>${money(t.monthly)}</b> / month`],
      ['One-time setup fee', (t) => `<b>${money(t.setup)}</b>`],
      ['Included voice usage', (t) => `${t.minutes.toLocaleString()} minutes / month`],
      ['Voice overage', () => `$${PRICING.overage.toFixed(2)} / minute`],
      ['AI FAQs, messages and call transfers', () => 'Included'],
      ['AI booking, rescheduling and cancellation', (t) => ({ starter: 'Not included', growth: 'One standard booking workflow', pro: 'Multiple staff and service routing within one location' })[t.id]],
      ['Call review and reporting', (t) => ({ starter: 'Monthly summary', growth: 'Monthly spot checks and summary', pro: 'Weekly spot checks and monthly summary' })[t.id]],
      ['Website + Google Business Profile', () => `Optional add-on, +${money(PRICING.addon.website)} one-time`],
    ] },
  zh: { starter: ['Starter', 'AI 前台：答你确认过的问题、留言、转接。不做预约。'], growth: ['Growth', 'Starter 的全部，加上预约、改期、取消。'], pro: ['Pro', 'Growth 的全部，加上单店内多员工、多项目分流。'],
    recommended: '推荐', mo: '/ 月', setup: '一次性安装费', minutes: '分钟 / 月', overage: '超出部分', choose: '选择', full: '看完整对比',
    addon: ['可选加购：网站 + Google 商家资料', `一次性 +${money(PRICING.addon.website)}，任何方案都能加`, ['单页预约型网站，带拨号和预约入口', '服务期间含托管和基础 SEO 设置（标题、描述、sitemap）', 'Google 商家资料检查并改正，和 AI 说的一致', '已经有网站？不用加，AI 直接配你现有的网站。']],
    rows: [
      ['月费', (t) => `<b>${money(t.monthly)}</b> / 月`],
      ['一次性安装费', (t) => `<b>${money(t.setup)}</b>`],
      ['包含通话时长', (t) => `每月 ${t.minutes.toLocaleString()} 分钟`],
      ['超出部分', () => `每分钟 $${PRICING.overage.toFixed(2)}`],
      ['AI 答疑、留言、转接', () => '包含'],
      ['AI 预约、改期、取消', (t) => ({ starter: '不包含', growth: '一套标准预约流程', pro: '单店内多员工、多项目分流' })[t.id]],
      ['通话回顾与报告', (t) => ({ starter: '每月摘要', growth: '每月抽查 + 摘要', pro: '每周抽查 + 每月摘要' })[t.id]],
      ['网站 + Google 商家资料', () => `可选加购，一次性 +${money(PRICING.addon.website)}`],
    ] },
};

export function pricingCards(lang, { pos = 'pricing', hl = 'h3' } = {}) {
  const c = TIER_COPY[lang];
  return `<div class="tiers">${PRICING.tiers.map((t) => `<div class="tier${t.recommended ? ' rec' : ''}">${t.recommended ? `<span class="rec-badge">${c.recommended}</span>` : ''}
<${hl} class="h3">${c[t.id][0]}</${hl}><p class="tier-desc">${c[t.id][1]}</p>
<p class="price"><b>${money(t.monthly)}</b><span>${c.mo}</span></p>
<p class="setup">+ ${money(t.setup)} ${c.setup}</p>
<ul><li>${t.minutes.toLocaleString()} ${c.minutes}</li><li>$${PRICING.overage.toFixed(2)}/min ${c.overage}</li><li>${c.rows[4][0]}</li>${[5, 6].map((i) => { const v = c.rows[i][1](t); const no = /^(Not included|No website|不包含|不含)/.test(v); return `<li class="${no ? 'no' : ''}">${no ? `${c.rows[i][0]}: ${v.charAt(0).toLowerCase() + v.slice(1)}` : v}</li>`; }).join('')}</ul>
${secondaryBtn(lang, { pos: `${pos}-${t.id}`, cls: t.recommended ? '' : 'btn-ghost' })}</div>`).join('')}</div>`;
}

export function pricingTable(lang) {
  const c = TIER_COPY[lang];
  return `<div class="table-wrap"><table class="compare"><thead><tr><th scope="col">${lang === 'zh' ? '项目' : 'Feature'}</th>${PRICING.tiers.map((t) => `<th scope="col">${c[t.id][0]}${t.recommended ? ` <span class="rec-inline">${c.recommended}</span>` : ''}</th>`).join('')}</tr></thead>
<tbody>${c.rows.map(([label, f]) => `<tr><th scope="row">${label}</th>${PRICING.tiers.map((t) => `<td>${f(t)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function addonBlock(lang) {
  const [h, price, items] = TIER_COPY[lang].addon;
  return `<div class="addon"><div><p class="eyebrow">${lang === 'zh' ? '加购' : 'Add-on'}</p><h2 class="h3">${h}</h2><p class="addon-price">${price}</p></div><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;
}

export function contactSales(lang) {
  const s = lang === 'zh'
    ? ['多店、双语网站，或者要定制对接？', '约 15 分钟，聊范围和报价。']
    : ['Need multiple locations, a bilingual website or custom integrations?', 'Book 15 minutes to talk scope and pricing.'];
  return `<div class="contact-sales"><div><h2 class="h3">${s[0]}</h2><p>${s[1]}</p></div>${secondaryBtn(lang, { pos: 'contact-sales' })}</div>`;
}

export function founder(lang) {
  const f = lang === 'zh'
    ? ['达拉斯本地搭建，有问题找得到人。', 'AI Man Jack 帮 DFW 的华人老板和本地商家装实用的 AI 系统，省下员工时间，接住漏掉的客人。安装、测试、后来的支持，都是 Jack 本人。', '认识 Jack']
    : ['Built locally. Supported by a real person.', 'AI Man Jack helps DFW businesses install practical AI systems that save staff time and capture missed opportunities. Jack handles setup, testing, and ongoing support.', 'About Jack'];
  return `<section class="section founder"><div class="wrap founder-row"><img src="/img/jack-portrait-256.webp" width="128" height="128" loading="lazy" decoding="async" alt="Jack Qian"><div><h2>${f[0]}</h2><p>${f[1]}</p><a href="${L(lang, '/about/')}">${f[2]} &rarr;</a></div></div></section>`;
}

export function faq(lang, items = FAQ[lang], { heading = true } = {}) {
  const h = lang === 'zh' ? '常见问题' : 'Common questions';
  return `${heading ? `<section class="section" id="faq"><div class="wrap narrow"><h2>${h}</h2>` : ''}<div class="faq">${items.map(([q, a], i) => `<details><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('')}</div>${heading ? '</div></section>' : ''}`;
}
export const faqJsonLd = (items) => ({ '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q.replace(/<[^>]+>/g, ''), acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
export const HOME_FAQ = FAQ;

export function finalCta(lang, { h, sub } = {}) {
  const d = lang === 'zh'
    ? ['先试，再买。', '打个电话给 Jessy，让她给你约个时间。问问价格，约个时间，再改一次。']
    : ['Try it before you buy it.', 'Call Jessy, the AI receptionist, and ask her to book an appointment. Ask about price. Ask for a time. Try changing it.'];
  return `<section class="section final-cta" id="start"><div class="wrap narrow center"><h2>${h || d[0]}</h2><p class="lead">${sub || d[1]}</p>
<div class="cta-row center">${callBtn(lang, { event: 'demo_call_click', pos: 'final', cls: 'btn-lg' })}${secondaryBtn(lang, { pos: 'final', cls: 'btn-lg' })}</div>
<p class="final-number"><a href="tel:${DEMO_TEL}" data-event="demo_call_click" data-pos="final-number">${DEMO_DISPLAY}</a> · ${T[lang].cta.noSignup}</p></div></section>`;
}

// GEO fact module (PRD §40): stand-alone factual paragraphs.
export function geoFacts(lang) {
  const g = lang === 'zh' ? [
    ['AI Man Jack 做什么', 'AI Man Jack 为达拉斯—沃斯堡的预约制商家安装并维护 AI 电话接待流程。系统可以配置为回答已确认的营业问题、收集来电者信息，并把来电者接入支持的预约流程。支持英语、西班牙语和中文。'],
    ['它不做什么', 'AI 不会编造信息。没有配置过的问题，按设定的兜底流程处理：转接、留言，或者交给员工跟进。它不承诺任何排名或 AI 搜索推荐。'],
    ['服务范围', '达拉斯—沃斯堡都会区，包括 Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington；支持的情况下也可远程实施。'],
  ] : [
    ['What AI Man Jack does', 'AI Man Jack installs and manages AI phone reception workflows for appointment-based businesses in Dallas–Fort Worth. The system can be configured to answer approved business questions, collect lead information and connect callers to supported scheduling workflows. It speaks English, Spanish and Chinese.'],
    ['What it does not do', 'The AI does not invent information. Unsupported questions are handled by the configured fallback flow: transfer, message-taking or staff follow-up. It makes no promise about search rankings or AI-assistant recommendations.'],
    ['Where service is available', 'Dallas–Fort Worth, including Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney and Arlington, and remote implementation where supported.'],
  ];
  return `<section class="section facts"><div class="wrap"><div class="grid-3">${g.map(([h, p]) => `<div><h2 class="h3">${h}</h2><p>${p}</p></div>`).join('')}</div></div></section>`;
}

// Data-handling trust block (facts from Jack, 2026-09-09: no recordings, no transcripts stored).
export function dataHandling(lang) {
  const d = lang === 'zh' ? {
    h: '通话数据，能少存就少存', items: ['不录音。', 'AI Man Jack 不保存对话文字记录。', '只把完成预约流程需要的信息（姓名、电话、项目、时间）写进你的系统。', '电话线路（Twilio）只留通话元数据：时间、时长、号码。'],
    note: '医疗类部署逐家审核。整条流程没验证完之前，我们不做 HIPAA 合规的声明。',
  } : {
    h: 'Designed to minimize call data', items: ['No call recordings.', 'No conversation transcripts stored by AI Man Jack.', 'Only the information needed to complete the configured workflow (name, phone, service, time) is passed into your business system.', 'The phone carrier (Twilio) keeps call metadata only: time, duration, numbers.'],
    note: 'Healthcare deployments are reviewed individually. We do not claim HIPAA compliance unless the complete workflow has been verified.',
  };
  return `<section class="section soft" id="data"><div class="wrap split"><div><h2>${d.h}</h2><p class="lead">${d.note}</p></div><ul class="needs" style="columns:1">${d.items.map((i) => `<li>${i}</li>`).join('')}</ul></div></section>`;
}

// Breadcrumb html + JSON-LD. items: [[label, path(EN)]] excluding home.
export function breadcrumb(lang, items) {
  const all = [[T[lang].breadcrumbHome, '/'], ...items];
  const html = `<nav class="crumbs" aria-label="Breadcrumb"><ol>${all.map(([l, p], i) => i === all.length - 1 ? `<li aria-current="page">${l}</li>` : `<li><a href="${L(lang, p)}">${l}</a></li>`).join('')}</ol></nav>`;
  const ld = { '@type': 'BreadcrumbList', itemListElement: all.map(([l, p], i) => ({ '@type': 'ListItem', position: i + 1, name: l.replace(/<[^>]+>/g, ''), item: SITE + langPath(lang, p) })) };
  return { html, ld };
}

export const BUSINESS_REF = { '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: 'AI Man Jack', url: `${SITE}/`, telephone: '+1-469-425-4142', email: EMAIL };

export const AREA = [
  { '@type': 'AdministrativeArea', '@id': `${SITE}/#dfw`, name: 'Dallas–Fort Worth metroplex', sameAs: 'https://en.wikipedia.org/wiki/Dallas%E2%80%93Fort_Worth_metroplex',
    containedInPlace: { '@type': 'State', name: 'Texas', containedInPlace: { '@type': 'Country', name: 'United States' } } },
  ...['Dallas', 'Fort Worth', 'Plano', 'Richardson', 'Frisco', 'McKinney', 'Arlington'].map((n) => ({ '@type': 'City', name: n, containedInPlace: { '@id': `${SITE}/#dfw` } })),
];

export const SERVICE_LD = (lang, extra = {}) => ({
  '@type': 'Service', '@id': `${SITE}/#service`, serviceType: 'AI receptionist and appointment booking',
  name: lang === 'zh' ? '预约制商家的 AI 前台' : 'AI receptionist for appointment businesses',
  description: lang === 'zh'
    ? 'AI Man Jack 的 AI 前台接听来电、回答已确认的营业问题、收集来电信息并预约，面向达拉斯—沃斯堡的美发美容、医美 spa、诊所、上门服务和维修商家。支持英语、西班牙语和中文。演示线 +1 (469) 517-2968。'
    : 'AI Man Jack’s AI receptionist answers calls, handles approved business questions, captures lead details and books appointments for salons, med spas, clinics, home-service and repair businesses in Dallas–Fort Worth. English, Spanish and Chinese. Demo line +1 (469) 517-2968.',
  provider: { '@id': `${SITE}/#business` }, areaServed: AREA, availableLanguage: ['en', 'es', 'zh'],
  audience: { '@type': 'BusinessAudience', name: 'Appointment-based businesses in Dallas–Fort Worth: salons, med spas, clinics, home services, repair services' },
  offers: PRICING.tiers.map((t) => ({ '@type': 'Offer', name: `${TIER_COPY.en[t.id][0]} plan`, price: String(t.monthly), priceCurrency: 'USD',
    description: `${money(t.monthly)} per month plus ${money(t.setup)} one-time setup. ${t.minutes} voice minutes per month included, $${PRICING.overage.toFixed(2)} per minute overage.` })),
  url: `${SITE}${langPath(lang, '/ai-receptionist/')}`, ...extra,
});

export { FAQ, TIER_COPY, GBP_URL, DEMO_TEL, DEMO_DISPLAY, SMS_TEL, SMS_DISPLAY, EMAIL, SITE, callBtn, secondaryBtn, L, esc, T };
