import { SITE, DEMO_DISPLAY } from '../config.mjs';
import { L } from '../layout.mjs';
import { eyebrow, pageHero, breadcrumb, phoneCard, howItWorks, transcript, capabilities, industryCards, integrationList, pricingCards, faq, faqJsonLd, finalCta, geoFacts, dataHandling, HOME_FAQ, SERVICE_LD, BUSINESS_REF, T } from '../components.mjs';

const copy = {
  en: {
    title: 'AI Receptionist That Answers Calls and Books | AI Man Jack',
    description: 'How the AI Man Jack receptionist works: it answers approved questions, captures caller details, books appointments, and hands off when it should not answer. English, Spanish and Chinese.',
    crumb: 'AI receptionist', eyebrow: 'The product',
    h1: 'An AI receptionist that answers, books, and knows when to hand off.',
    sub: 'It picks up every time, answers from the details you approve, and turns the call into a booking or a clean handoff. Nothing improvised.',
    tryH: 'Hear it before you read about it.', trySub: 'The demo line is the product, configured with our own details instead of yours. Ask it what the service costs, ask for a time, then change the time.',
    flowH: 'What happens on a call', flow: [
      ['Greeting', 'The AI answers with your business name and asks how it can help. Callers can speak English, Spanish or Chinese.'],
      ['Understanding the request', 'It sorts the call: a question, a booking, a change to a booking, or something it should not handle.'],
      ['Approved answers only', 'Hours, location, services and prices come from the sheet you approved during setup. If it is not on the sheet, the AI does not guess.'],
      ['Availability and booking', 'On Growth and Pro, it checks open slots, offers two options, confirms the choice and records the booking with the caller’s name and phone.'],
      ['Confirmation', 'The customer hears the confirmed time. Your business receives the booking in the connected workflow.'],
      ['Fallback', 'When the AI should not answer, it does what you chose: takes a message, transfers to a person, or texts you the caller’s details.'],
    ],
    callH: 'Example call', lines: [['c', '“Do you do gel removal?”'], ['a', '“Yes. Gel removal is $15 on its own, or included with a new set. Would you like to book?”'], ['c', '“Saturday morning if you have it.”'], ['a', '“Saturday I have 9:30 and 11:00.”'], ['c', '“11.”']],
    result: 'Booked · Saturday · 11:00 AM',
    needsH: 'What it needs from you', needsSub: 'Setup takes about a week once these are in. Then a tuning period, which varies by business.',
    needs: ['Business hours, address and parking notes', 'Services with the prices you are willing to quote', 'Booking rules: durations, buffers, who can be booked', 'The fallback you want: message, transfer, or text', 'How calls reach the AI: forwarding or a new number', 'A calendar or the included booking system to write into'],
    langH: 'Languages and limits', lang: [
      ['English, Spanish, Chinese', 'The receptionist answers in the language the caller uses. The demo line speaks all three.'],
      ['What it does not do', 'It does not invent prices or policies, does not give medical or legal advice, and does not promise rankings or AI-search recommendations.'],
      ['When something breaks', 'If the phone or booking connection fails, the fallback runs and Jack is notified. Callers still get a message, a transfer, or a text to you.'],
    ],
    priceH: 'Plans', priceSub: 'Setup once, then monthly. Starter answers and takes messages; Growth and Pro book.',
    faqPick: [0, 2, 3, 4, 5],
  },
  zh: {
    title: '接电话、约时间的 AI 前台 | AI Man Jack',
    description: 'AI Man Jack 的 AI 前台怎么运作：只回答确认过的问题、记下来电信息、完成预约，不该答的时候交接给人。支持英语、西班牙语和中文。',
    crumb: 'AI 前台', eyebrow: '产品',
    h1: '会接电话、会预约，也知道什么时候该找人的 AI 前台。',
    sub: '电话次次接得起，只说你确认过的，要么约成一个预约，要么干净地交给人。不瞎编。',
    tryH: '先打个电话听听，再往下看。', trySub: '演示线就是这套产品，只是配的是我们自己的信息。问问多少钱，约个时间，再改一次。',
    flowH: '一通电话里发生了什么', flow: [
      ['问候', 'AI 报上你的店名，问需要什么帮助。来电者可以说英语、西班牙语或中文。'],
      ['听懂需求', '它先分类：问问题、要预约、改预约，还是它不该处理的事。'],
      ['只答确认过的', '营业时间、地址、服务项目和价格，都来自你在设置时确认的那张表。表上没有的，AI 不猜。'],
      ['查空位并预约', 'Growth 和 Pro 方案里，它查开放时段、给两个选项、确认选择，并记下来电者的姓名和电话。'],
      ['确认', '顾客听到确认的时间。你的店在接好的流程里收到这条预约。'],
      ['兜底', 'AI 不该答的时候，按你选的方式办：留言、转给真人，或者把来电信息短信发给你。'],
    ],
    callH: '示例通话', lines: [['c', '你们做卸甲吗？'], ['a', '做。单独卸甲 $15，做新款的话包含在内。要约个时间吗？'], ['c', '周六上午有的话。'], ['a', '周六有 9:30 和 11:00。'], ['c', '11 点。']],
    result: '已预约 · 周六 · 11:00 AM',
    needsH: '需要你准备什么', needsSub: '这些齐了，安装大约一周。之后有一段磨合期，长短看店的情况。',
    needs: ['营业时间、地址和停车说明', '服务项目，以及你愿意报的价格', '预约规则：时长、间隔、哪些人可以被约', '你想要的兜底方式：留言、转接或短信', '电话怎么到 AI：转接现有号码，还是新号码', '一个可以写入的日历，或者用自带的预约系统'],
    langH: '语言和边界', lang: [
      ['英语、西班牙语、中文', '来电者用什么语言，AI 就用什么语言回答。演示线三种都会。'],
      ['它不做什么', '不编价格和规定，不给医疗或法律建议，也不承诺排名或 AI 搜索推荐。'],
      ['出问题的时候', '电话或预约对接出故障，兜底流程接上，Jack 收到通知。来电者仍然能留言、转接，或者信息短信发给你。'],
    ],
    priceH: '方案', priceSub: '一次安装，之后按月。Starter 接电话和留言；Growth 和 Pro 能预约。',
    faqPick: [0, 2, 3, 4, 5],
  },
};

const page = (lang) => {
  const c = copy[lang], t = T[lang], bc = breadcrumb(lang, [[c.crumb, '/ai-receptionist/']]);
  const items = c.faqPick.map((i) => HOME_FAQ[lang][i]);
  return {
    title: c.title, description: c.description,
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: c.eyebrow, h1: c.h1, sub: c.sub })}
<section class="section"><div class="wrap split"><div><h2>${c.tryH}</h2><p class="lead">${c.trySub}</p></div>${phoneCard(lang)}</div></section>
${howItWorks(lang)}
<section class="section soft"><div class="wrap"><h2>${c.flowH}</h2><ol class="steps" style="grid-template-columns:repeat(3,1fr)">${c.flow.map(([h, p], i) => `<li><span class="num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></div></section>
<section class="section"><div class="wrap split"><div>${eyebrow(c.callH)}<h2>${lang === 'zh' ? '一家美甲店的电话' : 'A nail salon call'}</h2><p class="lead">${lang === 'zh' ? '价格和时段都来自店主确认过的表。' : 'Prices and slots come from the owner’s approved sheet.'}</p></div>${transcript(lang, c.lines, c.result)}</div></section>
${capabilities(lang)}
<section class="section"><div class="wrap"><h2>${c.needsH}</h2><p class="lead">${c.needsSub}</p><ul class="needs">${c.needs.map((n) => `<li>${n}</li>`).join('')}</ul></div></section>
<section class="section soft"><div class="wrap"><h2>${c.langH}</h2><div class="grid-3">${c.lang.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>
${dataHandling(lang)}
${industryCards(lang)}
<section class="section"><div class="wrap">${eyebrow(t.footer.integrations)}<h2>${lang === 'zh' ? '对接状态' : 'Integration status'}</h2>${integrationList(lang, { compact: true })}<p style="margin-top:24px"><a href="${L(lang, '/integrations/')}" data-event="integration_click">${lang === 'zh' ? '所有对接' : 'All integrations'} &rarr;</a></p></div></section>
<section class="section" id="pricing"><div class="wrap">${eyebrow(t.nav.pricing)}<h2>${c.priceH}</h2><p class="lead">${c.priceSub}</p>${pricingCards(lang, { pos: 'product-pricing' })}<p style="margin-top:24px"><a href="${L(lang, '/pricing/')}">${t.cta.viewPricing} &rarr;</a></p></div></section>
${faq(lang, items)}
${finalCta(lang)}${geoFacts(lang)}`,
    jsonld: [SERVICE_LD(lang), BUSINESS_REF, faqJsonLd(items), bc.ld],
  };
};

export const pages = [{ path: '/ai-receptionist/', priority: 0.9, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
