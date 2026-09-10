import { SITE, DEMO_DISPLAY } from '../config.mjs';
import { callBtn, secondaryBtn, L } from '../layout.mjs';
import { eyebrow, phoneCard, howItWorks, transcript, capabilities, industryCards, integrationLine, caseCards, pricingCards, founder, faq, faqJsonLd, finalCta, geoFacts, HOME_FAQ, SERVICE_LD, T } from '../components.mjs';
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
    priceH: 'Pricing you can read in twenty seconds.', priceSub: 'Three plans. One-time setup plus a monthly fee. Every plan includes AI answers, messages and transfers. A website is an optional add-on.', priceLink: 'Full comparison, setup details and service terms',
  },
  zh: {
    title: '达拉斯华人商家的 AI 前台，接电话帮预约 | AI Man Jack',
    description: '忙着服务客人也不漏电话。AI 帮你接电话、答常见问题、查时间、直接预约，中英西三语。拨 (469) 517-2968 试一下。服务达拉斯—沃斯堡。',
    eyebrow: '给预约制生意的 AI 前台', h1: '忙着服务客人，也不用漏电话。',
    sub: 'AI 帮你接电话、回答常见问题、查时间、直接预约。中文、英文、西班牙语都能接。',
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
  og: { title: lang === 'zh' ? '忙着服务客人，也不用漏电话。' : 'Your phone can answer itself.', description: copy[lang].description },
  jsonld: [BUSINESS_FULL(lang), SERVICE_LD(lang), faqJsonLd(HOME_FAQ[lang]),
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'AI Man Jack', inLanguage: ['en', 'zh'], publisher: { '@id': `${SITE}/#business` } }],
});

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
