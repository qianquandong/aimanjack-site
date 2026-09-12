import { SITE, DEMO_DISPLAY } from '../config.mjs';
import { callBtn, secondaryBtn, L } from '../layout.mjs';
import { eyebrow, phoneCard, howItWorks, transcript, capabilities, industryCards, integrationLine, caseCards, pricingCards, founder, faq, faqJsonLd, finalCta, geoFacts, HOME_FAQ, SERVICE_LD, T } from '../components.mjs';
import { BUSINESS_FULL } from './about.mjs';

const copy = {
  en: {
    title: '24/7 AI Customer Service for DFW Businesses | AI Man Jack',
    description: 'AI customer service answers calls, handles common questions, checks availability and books appointments in English, Spanish and Chinese. Call the demo: (469) 517-2968.',
    eyebrow: '24/7 AI customer service for appointment businesses', h1: 'Never lose a customer to a missed call.',
    sub: 'Jessy answers calls, handles common questions, and books appointments while you work.',
    local: 'Built and supported in Dallas–Fort Worth.',
    trust: ['Built locally in Dallas–Fort Worth', 'Configured and tested with real business workflows', 'Demo line answers 24/7 in English, Spanish and Chinese'],
    callH: 'What a real call looks like', callSub: 'A salon call, start to finish. The AI only uses the prices, hours and rules the owner approved.',
    lines: [['c', '“How much is a haircut?”'], ['a', '“Haircuts start at $45. Would you like me to check available times?”'], ['c', '“Tomorrow after 4.”'], ['a', '“I have 4:30 PM and 5:15 PM.”'], ['c', '“4:30.”']],
    result: 'Booked · Tomorrow · 4:30 PM',
    intH: 'Works with the tools you already use.', intSub: 'Only what has been tested is marked Supported. Everything else says so.', intLink: 'All integrations and their status',
    caseH: 'Proof, as it becomes available.', caseSub: 'No invented numbers. Two real deployments, with what was measured and what still needs validation.', caseLink: 'All case studies',
    priceH: 'Pricing you can read in twenty seconds.', priceSub: 'Three plans. One-time setup plus a monthly fee. Every plan includes AI answers, messages and transfers. A website is an optional add-on.', priceLink: 'Full comparison, setup details and service terms',
  },
  zh: {
    title: '达拉斯商家 24/7 AI 客服，接电话帮预约 | AI Man Jack',
    description: 'AI 客服 24 小时接电话、答常见问题、查时间、直接预约，支持中文、英文和西班牙语。拨 (469) 517-2968 试一下。',
    eyebrow: '预约制商家的 24/7 AI 客服', h1: '别再因为漏接电话，丢掉一个客户。',
    sub: 'Jessy 替你接电话、回答常见问题、查时间、完成预约。中文、英文、西班牙语都能接。',
    local: '达拉斯本地搭建，有问题随时找得到人。',
    trust: ['达拉斯本地搭建', '按你店里真实的流程配置、测试', '演示线 24 小时都能打，中英西三语'],
    callH: '一通电话是怎么接的', callSub: '一家美发店的来电，从头到尾。AI 只说老板确认过的价格、营业时间和规矩。',
    lines: [['c', '剪发多少钱？'], ['a', '剪发 $45 起。要我帮你看看有哪些时间吗？'], ['c', '明天 4 点以后。'], ['a', '明天有 4:30 和 5:15。'], ['c', '4:30。']],
    result: '已预约 · 明天 · 4:30 PM',
    intH: '你现在用的工具，能接上。', intSub: '', intLink: '',
    caseH: '有多少证据，说多少。', caseSub: '不编数字。两个真实项目，测过什么、还没验证什么，都写清楚。', caseLink: '全部案例',
    priceH: '价格一眼看明白。', priceSub: '三档，一次安装费加月费。每档都包含接电话、答问题、留言和转接。网站是可选加购。', priceLink: '完整对比、安装细节和服务条款',
  },
};

const homeBusiness = (lang) => ({
  ...BUSINESS_FULL(lang),
  description: lang === 'zh'
    ? 'AI Man Jack LLC 为达拉斯—沃斯堡的预约制商家安装并维护 24 小时 AI 客服和预约系统。'
    : 'AI Man Jack LLC installs and manages 24/7 AI customer service and booking workflows for appointment businesses in Dallas–Fort Worth.',
  knowsAbout: ['AI customer service', 'AI receptionist', 'AI phone answering', 'appointment booking automation', 'multilingual customer service', 'workflow automation'],
});

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
<section class="section" id="integrations"><div class="wrap">${eyebrow(t.footer.integrations)}<h2>${c.intH}</h2>${integrationLine(lang)}</div></section>
<section class="section soft" id="cases"><div class="wrap">${eyebrow(t.nav.cases)}<h2>${c.caseH}</h2><p class="lead">${c.caseSub}</p>${caseCards(lang)}<p style="margin-top:24px"><a href="${L(lang, '/case-studies/')}">${c.caseLink} &rarr;</a></p></div></section>
<section class="section" id="pricing"><div class="wrap">${eyebrow(t.nav.pricing)}<h2>${c.priceH}</h2><p class="lead">${c.priceSub}</p>${pricingCards(lang, { pos: 'home-pricing' })}<p style="margin-top:24px"><a href="${L(lang, '/pricing/')}">${c.priceLink} &rarr;</a></p></div></section>
${founder(lang)}
${faq(lang)}
${finalCta(lang)}
${geoFacts(lang)}`;
};

const page = (lang) => ({
  title: copy[lang].title, description: copy[lang].description, body: body(lang),
  og: {
    title: lang === 'zh' ? '24 小时 AI 客服：接电话，直接帮你约好。' : '24/7 AI customer service that answers and books.',
    description: copy[lang].description,
    image: lang === 'zh' ? '/img/og-receptionist-zh.jpg?v=20260912-ai-customer-service' : '/img/og-receptionist.jpg?v=20260912-ai-customer-service',
    alt: lang === 'zh' ? 'AI Man Jack：24 小时 AI 客服，拨打 (469) 517-2968 试听' : 'AI Man Jack: 24/7 AI customer service for appointment businesses. Call the AI: (469) 517-2968',
  },
  jsonld: [homeBusiness(lang), SERVICE_LD(lang), faqJsonLd(HOME_FAQ[lang]),
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'AI Man Jack', inLanguage: ['en', 'zh'], publisher: { '@id': `${SITE}/#business` } }],
});

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
