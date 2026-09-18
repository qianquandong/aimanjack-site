// /tools/missed-call-calculator/ — free calculator: what missed calls cost an appointment business per month and year.
// Why it exists: tool-shaped queries get no AI Overview, so the click survives, and a calculator earns links a post never does
// (Agent OS knowledge/marketing/seo-blog-playbook.md §9). Every number on the result is derived from the visitor's own inputs;
// the only site-supplied figures are the Starter plan price from config.mjs, which is what /pricing/ shows.
import { SITE, PRICING, money } from '../config.mjs';
import { pageHero, breadcrumb, faq, faqJsonLd, finalCta, BUSINESS_REF, T, L } from '../components.mjs';

const starter = PRICING.tiers.find((t) => t.id === 'starter');
const PATH = '/tools/missed-call-calculator/';

const copy = {
  en: {
    title: 'Missed Call Cost Calculator for Appointment Businesses | AI Man Jack',
    description: 'Free calculator: enter calls per day, the share you miss, how many would have booked and your average ticket. See what missed calls cost you per month and year. No signup.',
    crumb: 'Missed call calculator', eyebrow: 'Free tool',
    h1: 'What do missed calls cost your business?',
    sub: 'Five numbers you already know. The result is your math, not ours. Nothing is stored and there is no signup.',
    inputsH: 'Your numbers',
    fields: [
      ['calls', 'Incoming calls per business day', 20, 0, 500, 1, 'Count a normal day, not your busiest.'],
      ['missed', 'Share of calls that go unanswered', 25, 0, 100, 1, 'Voicemail, busy line, after hours, staff with a customer. Most owners guess 20–40%.'],
      ['book', 'Share of missed callers who would have booked', 30, 0, 100, 1, 'Not everyone who calls wants an appointment. Be conservative.'],
      ['ticket', 'Average value of one appointment ($)', 150, 0, 100000, 1, 'What one booked visit is worth to you, before costs.'],
      ['days', 'Business days per week', 5, 1, 7, 1, ''],
    ],
    resultsH: 'What that adds up to',
    rows: [['missedWeek', 'Missed calls per week'], ['missedMonth', 'Missed calls per month'], ['lostMonth', 'Lost bookings per month'], ['revMonth', 'Lost revenue per month'], ['revYear', 'Lost revenue per year']],
    compare: (m) => `For comparison, the Starter AI receptionist plan is ${money(starter.monthly)} a month plus a one-time ${money(starter.setup)} setup, ${starter.minutes} minutes included. Full details on the <a href="/pricing/">pricing page</a>.`,
    covers: { none: 'Enter a ticket value above zero to compare.', zero: 'At these numbers the plan would cost more than the calls you are losing. That is a real answer too; an AI receptionist is not for everyone.', one: 'At these numbers, recovering one booking a month covers the Starter monthly fee. Everything above that is yours.', some: 'At these numbers, recovering {n} bookings a month covers the Starter monthly fee. Everything above that is yours.' },
    share: 'Copy a link to these numbers', copied: 'Link copied',
    howH: 'How the math works',
    how: ['Missed calls per week = calls per day × share unanswered × business days per week.', 'A month is counted as 4.33 weeks (52 weeks ÷ 12).', 'Lost bookings = missed calls × share who would have booked. Lost revenue = lost bookings × average ticket.', 'The break-even line divides the Starter monthly fee by your average ticket and rounds up. Setup is a one-time cost and is not included in that line.', 'Nothing here accounts for callers who try again later, or for repeat business from a recovered customer. The first makes the real number smaller, the second makes it larger.'],
    whoH: 'Who this is for',
    who: 'Salons, med spas, dental and other clinics, home services, repair shops: any business where a phone call is how an appointment starts. If your bookings come through an app and the phone rarely rings, the number will be small, and that is the correct result.',
    faq: [
      ['How do I know what share of my calls go unanswered?', 'Your phone system or carrier portal usually shows missed calls and voicemails per day. If not, count for one normal week: calls that hit voicemail, rang out, or came in after hours. Divide by total calls.'],
      ['Is the calculator storing my numbers?', 'No. The math runs in your browser and nothing is sent anywhere. The "copy a link" button only puts your inputs in the page address so you can share it.'],
      ['What does an AI receptionist actually do with a missed call?', 'It answers, replies from information the business approved, books an appointment on the plans that include booking, and hands off to a person when it is unsure. You can hear it on our demo line before buying.'],
      ['Why is the result different from what a vendor told me?', 'Vendors tend to pick a high missed-call share and a high booking share. This calculator uses whatever you type. If you want a conservative number, lower the "would have booked" share.'],
    ],
    pillarLine: 'Want the AI to take those calls? <a href="/ai-receptionist/">How the AI receptionist works</a> · <a href="/industries/">Scenarios by industry</a>',
  },
  zh: {
    title: '漏接电话成本计算器：预约制生意每月损失多少 | AI Man Jack',
    description: '免费工具：填每天来电数、漏接比例、会预约的比例和客单价，算出漏接电话每月、每年让你损失多少。不用注册。',
    crumb: '漏接电话计算器', eyebrow: '免费工具',
    h1: '漏接的电话，让你损失了多少？',
    sub: '五个你本来就知道的数字。结果是你自己的账，不是我们替你算的。不存数据，不用注册。',
    inputsH: '你的数字',
    fields: [
      ['calls', '每个营业日的来电数', 20, 0, 500, 1, '按平常的一天算，不按最忙的一天。'],
      ['missed', '没接到的比例', 25, 0, 100, 1, '进语音信箱、占线、下班后、员工正在招呼客人。多数老板估在 20–40%。'],
      ['book', '漏接的人里本来会预约的比例', 30, 0, 100, 1, '不是每个打电话的人都要预约。往保守了填。'],
      ['ticket', '一次预约的平均价值（$）', 150, 0, 100000, 1, '一个到店的客人对你值多少钱，不扣成本。'],
      ['days', '每周营业天数', 5, 1, 7, 1, ''],
    ],
    resultsH: '加起来是多少',
    rows: [['missedWeek', '每周漏接'], ['missedMonth', '每月漏接'], ['lostMonth', '每月丢掉的预约'], ['revMonth', '每月损失'], ['revYear', '每年损失']],
    compare: (m) => `对比一下：AI 前台 Starter 方案每月 ${money(starter.monthly)}，加一次性安装费 ${money(starter.setup)}，含 ${starter.minutes} 分钟。完整说明在<a href="/zh/pricing/">价格页</a>。`,
    covers: { none: '客单价填个大于零的数，才能对比。', zero: '按这些数字，方案的钱比你漏掉的电话还多。这也是真实的答案：AI 前台不是每家店都需要。', one: '按这些数字，每月只要多接回 1 个预约，Starter 的月费就回来了。多出来的都是你的。', some: '按这些数字，每月只要多接回 {n} 个预约，Starter 的月费就回来了。多出来的都是你的。' },
    share: '复制这组数字的链接', copied: '已复制',
    howH: '怎么算的',
    how: ['每周漏接 = 每天来电 × 没接到的比例 × 每周营业天数。', '一个月按 4.33 周算（52 周 ÷ 12）。', '丢掉的预约 = 漏接数 × 会预约的比例。损失 = 丢掉的预约 × 客单价。', '回本那一行是 Starter 月费 ÷ 客单价，向上取整。安装费是一次性的，没算在那一行里。', '这里没算打不通会再打一次的人，也没算接回来的客人以后再来的钱。前者让真实数字变小，后者让它变大。'],
    whoH: '这个工具给谁用',
    who: '美发店、医美、牙科和各类诊所、家政、维修：只要预约是从一通电话开始的生意都适用。如果你的预约都走 app、电话很少响，算出来的数会很小，那也是对的。',
    faq: [
      ['我怎么知道自己漏接了多少比例？', '电话系统或运营商后台一般能看到每天的漏接和语音留言。看不到的话，挑平常的一周数一下：进语音信箱的、响到没人接的、下班后打来的，除以总来电数。'],
      ['计算器会存我的数字吗？', '不会。算法在你的浏览器里跑，什么都不往外发。「复制链接」只是把你填的数放进网址里，方便你转给别人。'],
      ['AI 前台拿到漏接的电话到底做什么？', '接起来，按店里确认过的信息回答，在含预约的方案里直接约时间，拿不准就转给人。买之前可以先打演示线听一听。'],
      ['为什么算出来和销售跟我说的不一样？', '销售一般会把漏接比例和预约比例都往高了取。这个计算器用的是你自己填的数。想要保守的结果，把「会预约的比例」调低。'],
    ],
    pillarLine: '想让 AI 来接这些电话？<a href="/zh/ai-receptionist/">AI 前台怎么运作</a> · <a href="/zh/industries/">各行业场景</a>',
  },
};

const script = (lang) => `<script>
(function(){var D=document,F=D.getElementById('calc'),Q=new URLSearchParams(location.search),S=${JSON.stringify(starter.monthly)};
var M=function(n){return '$'+Math.round(n).toLocaleString('en-US')},N=function(n){return Math.round(n).toLocaleString('en-US')};
var C=${JSON.stringify(copy[lang].covers)};
F.querySelectorAll('input').forEach(function(i){if(Q.has(i.name)&&Q.get(i.name)!=='')i.value=Q.get(i.name)});
function v(n){var i=F.elements[n],x=parseFloat(i.value);if(isNaN(x))x=0;x=Math.min(Math.max(x,+i.min),+i.max);return x}
function run(){var calls=v('calls'),missed=v('missed')/100,book=v('book')/100,ticket=v('ticket'),days=v('days');
 var mw=calls*missed*days,mm=mw*4.33,lm=mm*book,rm=lm*ticket,ry=rm*12;
 var o={missedWeek:N(mw),missedMonth:N(mm),lostMonth:N(lm),revMonth:M(rm),revYear:M(ry)};
 for(var k in o)D.getElementById('r-'+k).textContent=o[k];
 var be=ticket>0?Math.ceil(S/ticket):null;if(be!==null&&lm<=be&&rm<=S)be=0;
 D.getElementById('r-cover').textContent=be===null?C.none:be<=0?C.zero:be===1?C.one:C.some.replace('{n}',be)}
F.addEventListener('input',run);run();
var sh=D.getElementById('share');if(sh){if(!(navigator.clipboard&&isSecureContext))sh.hidden=true;sh.addEventListener('click',function(){var p=new URLSearchParams();F.querySelectorAll('input').forEach(function(i){p.set(i.name,i.value)});var u=location.origin+location.pathname+'?'+p;history.replaceState(null,'',u);navigator.clipboard.writeText(u).then(function(){sh.textContent=sh.dataset.copied})})}
})();
</script>`;

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, PATH]]);
  const fields = c.fields.map(([n, label, val, min, max, step, hint]) => `<label><span>${label}</span><input type="number" inputmode="decimal" name="${n}" value="${val}" min="${min}" max="${max}" step="${step}" required>${hint ? `<small>${hint}</small>` : ''}</label>`).join('');
  const rows = c.rows.map(([k, label]) => `<div class="calc-row${k === 'revMonth' ? ' calc-key' : ''}"><dt>${label}</dt><dd id="r-${k}">–</dd></div>`).join('');
  return {
    title: c.title, description: c.description, view: 'tool_view',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: c.eyebrow, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap calc-wrap" style="padding-bottom:64px"><div class="calc-grid">
<form id="calc" class="bk-form calc-form" onsubmit="return false"><h2 class="bk-h">${c.inputsH}</h2>${fields}<button type="button" class="btn btn-secondary btn-sm" id="share" data-copied="${c.copied}">${c.share}</button></form>
<div class="bk-card calc-out" aria-live="polite"><h2 class="bk-h">${c.resultsH}</h2><dl class="calc-results">${rows}</dl><p class="callout" id="r-cover"></p><p class="muted calc-compare">${c.compare()}</p><p class="calc-next">${c.pillarLine}</p></div>
</div></section>
<section class="section soft"><div class="wrap split"><div class="notes"><h2>${c.howH}</h2><ul>${c.how.map((h) => `<li>${h}</li>`).join('')}</ul></div><div class="notes"><h2>${c.whoH}</h2><p>${c.who}</p></div></div></section>
${faq(lang, c.faq)}
${finalCta(lang)}
${script(lang)}`,
    jsonld: [
      { '@type': 'WebApplication', '@id': `${SITE}${L(lang, PATH)}`, name: c.h1, description: c.description, url: `${SITE}${L(lang, PATH)}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', inLanguage: lang, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, provider: { '@id': `${SITE}/#business` } },
      BUSINESS_REF, faqJsonLd(c.faq), bc.ld,
    ],
  };
};

export const pages = [{ path: PATH, indexable: false, priority: 0.7, changefreq: 'monthly', en: page('en'), zh: page('zh') }];
