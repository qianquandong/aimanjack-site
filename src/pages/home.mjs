import { SITE, DEMO_DISPLAY } from '../config.mjs';
import { callBtn, secondaryBtn, L } from '../layout.mjs';
import { eyebrow, phoneCard, howItWorks, transcript, capabilities, industryCards, integrationList, caseCards, pricingCards, founder, faq, faqJsonLd, finalCta, geoFacts, HOME_FAQ, SERVICE_LD, T } from '../components.mjs';
import { BUSINESS_FULL } from './about.mjs';

const copy = {
  en: {
    title: 'AI Receptionist for DFW Appointment Businesses | AI Man Jack',
    description: 'Your phone can answer itself. AI answers common questions, checks availability and books appointments. Call the AI demo: (469) 517-2968. Dallas–Fort Worth.',
    eyebrow: 'AI receptionist for appointment businesses', h1: 'Your phone can answer itself.',
    sub: 'AI answers common questions, checks availability, and books appointments while you work.',
    local: 'Built and supported in Dallas–Fort Worth.',
    trust: ['Built locally in Dallas–Fort Worth', 'Configured and tested with real business workflows', 'Demo line answers 24/7 in English, Spanish and Chinese'],
    callH: 'What a real call looks like', callSub: 'A salon call, start to finish. The AI only uses the prices, hours and rules the owner approved.',
    lines: [['c', '“How much is a haircut?”'], ['a', '“Haircuts start at $45. Would you like me to check available times?”'], ['c', '“Tomorrow after 4.”'], ['a', '“I have 4:30 PM and 5:15 PM.”'], ['c', '“4:30.”']],
    result: 'Booked · Tomorrow · 4:30 PM',
    intH: 'Works with the tools you already use.', intSub: 'Only what has been tested is marked Supported. Everything else says so.', intLink: 'All integrations and their status',
    caseH: 'Proof, as it becomes available.', caseSub: 'No invented numbers. Two real deployments, with what was measured and what still needs validation.', caseLink: 'All case studies',
    priceH: 'Pricing you can read in twenty seconds.', priceSub: 'Three plans. One-time setup plus a monthly fee. Every plan includes AI answers, messages and transfers.', priceLink: 'Full comparison, setup details and service terms',
  },
  zh: {
    title: '达拉斯预约制商家的 AI 前台 | AI Man Jack',
    description: '电话可以自己接。AI 回答常见问题、查空位、约时间。拨打演示线 (469) 517-2968 亲自试。服务达拉斯—沃斯堡。',
    eyebrow: '预约制商家的 AI 前台', h1: '你的电话，能自己接。',
    sub: 'AI 回答常见问题、查空位、约时间，你忙你的。',
    local: '在达拉斯—沃斯堡本地搭建和支持。',
    trust: ['达拉斯—沃斯堡本地搭建', '按真实业务流程配置和测试', '演示线 24 小时接，英语、西班牙语、中文都行'],
    callH: '一通真实的电话长什么样', callSub: '一家美发店的来电，从头到尾。AI 只用店主确认过的价格、营业时间和规则。',
    lines: [['c', '剪发多少钱？'], ['a', '剪发 $45 起。要我帮你看看有哪些时间吗？'], ['c', '明天 4 点以后。'], ['a', '明天有 4:30 和 5:15。'], ['c', '4:30。']],
    result: '已预约 · 明天 · 4:30 PM',
    intH: '接得上你已经在用的工具。', intSub: '只有测试过的才标「已支持」，其他的如实标出来。', intLink: '所有对接及当前状态',
    caseH: '证据，有多少给多少。', caseSub: '不编数字。两个真实项目，写清楚测了什么、还有什么没验证。', caseLink: '全部案例',
    priceH: '二十秒能看懂的价格。', priceSub: '三个方案。一次性安装费加月费。每个方案都包含 AI 答疑、留言和转接。', priceLink: '完整对比、安装细节和服务条款',
  },
};

const body = (lang) => {
  const c = copy[lang], t = T[lang];
  return `
<section class="hero wrap" aria-labelledby="h1">
<div>${eyebrow(c.eyebrow)}<h1 id="h1">${c.h1}</h1><p class="lead">${c.sub}</p>
<div class="cta-row">${callBtn(lang, { event: 'hero_call_click', pos: 'hero', cls: 'btn-lg' })}${secondaryBtn(lang, { pos: 'hero', cls: 'btn-lg' })}</div>
<p class="no-signup">${t.cta.noSignup} <a href="#how">${t.cta.seeHow} &darr;</a></p>
<p class="local">${c.local}</p></div>
${phoneCard(lang)}
</section>
<div class="trust"><div class="wrap"><ul>${c.trust.map((s) => `<li>${s}</li>`).join('')}</ul></div></div>
${howItWorks(lang)}
<section class="section" id="call"><div class="wrap split"><div>${eyebrow(lang === 'zh' ? '示例通话' : 'Example call')}<h2>${c.callH}</h2><p class="lead">${c.callSub}</p></div>${transcript(lang, c.lines, c.result)}</div></section>
${capabilities(lang)}
${industryCards(lang)}
<section class="section" id="integrations"><div class="wrap">${eyebrow(t.footer.integrations)}<h2>${c.intH}</h2><p class="lead">${c.intSub}</p>${integrationList(lang, { compact: true })}<p style="margin-top:24px"><a href="${L(lang, '/integrations/')}" data-event="integration_click">${c.intLink} &rarr;</a></p></div></section>
<section class="section soft" id="cases"><div class="wrap">${eyebrow(t.nav.cases)}<h2>${c.caseH}</h2><p class="lead">${c.caseSub}</p>${caseCards(lang)}<p style="margin-top:24px"><a href="${L(lang, '/case-studies/')}">${c.caseLink} &rarr;</a></p></div></section>
<section class="section" id="pricing"><div class="wrap">${eyebrow(t.nav.pricing)}<h2>${c.priceH}</h2><p class="lead">${c.priceSub}</p>${pricingCards(lang, { pos: 'home-pricing' })}<p style="margin-top:24px"><a href="${L(lang, '/pricing/')}">${c.priceLink} &rarr;</a></p></div></section>
${founder(lang)}
${faq(lang)}
${finalCta(lang)}
${geoFacts(lang)}`;
};

const page = (lang) => ({
  title: copy[lang].title, description: copy[lang].description, body: body(lang),
  og: { title: lang === 'zh' ? '你的电话，能自己接。' : 'Your phone can answer itself.', description: copy[lang].description },
  jsonld: [BUSINESS_FULL(lang), SERVICE_LD(lang), faqJsonLd(HOME_FAQ[lang]),
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'AI Man Jack', inLanguage: ['en', 'zh'], publisher: { '@id': `${SITE}/#business` } }],
});

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
