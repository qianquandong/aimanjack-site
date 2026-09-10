import { SITE, EMAIL, PRICING, money } from '../config.mjs';
import { pageHero, breadcrumb, pricingCards, pricingTable, addonBlock, contactSales, faq, faqJsonLd, finalCta, HOME_FAQ, SERVICE_LD, BUSINESS_REF, T } from '../components.mjs';

const copy = {
  en: {
    title: 'AI Receptionist Pricing: Starter, Growth, Pro | AI Man Jack',
    description: 'Three plans: Starter $199/mo + $750 setup, Growth $299/mo + $1,500 setup, Pro $599/mo + $2,000 setup. Included minutes, overage, website scope and terms, all on one page.',
    crumb: 'Pricing', h1: 'Simple pricing. Setup once, then monthly.',
    sub: 'Every plan is the AI receptionist for one business location. Setup fee plus monthly fee. A website is an optional add-on, not a requirement.',
    tableH: 'Full comparison',
    setupH: 'What setup includes', setup: ['Business knowledge configuration: hours, services, prices, policies you approve', 'Call flow design, including the greeting and the fallback you choose', 'Booking workflow on Growth and Pro', 'Testing with real scenarios before launch', 'Launch support and a tuning period'],
    termsH: 'Service terms in plain words', terms: [
      ['Minutes and overage', `Included voice minutes are per month and do not roll over. Overage is billed at $${PRICING.overage.toFixed(2)} per minute. Messaging or third-party charges, if any, are confirmed before contracting and never added silently.`],
      ['Website add-on', 'The add-on website assumes one language, a reusable design template, text and images you provide, and two revision rounds. Basic SEO means titles, descriptions, indexing configuration and a sitemap. No ranking is guaranteed and ongoing content is not included. If you already have a website, the AI works with it and you skip the add-on.'],
      ['Ownership', 'Your number is yours. A forwarded number is simply un-forwarded when service ends; a number AI Man Jack provisioned for you can be transferred or ported to you, subject to carrier requirements. No vendor lock-in. You own your domain and keep the website files after cancellation; included hosting ends with the service.'],
      ['Cancellation', 'Month to month. Stop any time; billing and offboarding details are in the service agreement.'],
      ['Go-live', 'About one week after we receive your details, for a verified standard workflow, then a tuning period that varies.'],
      ['Turning it off and support', 'Contact Jack to switch the AI off. Maintenance boundaries, additional pages and redesigns are defined in the service agreement, not on this page. No response-time promise is made.'],
    ],
    faqPick: [6, 7, 9, 10],
  },
  zh: {
    title: 'AI 前台价格：Starter、Growth、Pro | AI Man Jack',
    description: '三个方案：Starter 每月 $199 + $750 安装费，Growth 每月 $299 + $1,500 安装费，Pro 每月 $599 + $2,000 安装费。包含分钟数、超出计费、网站范围和条款，一页看完。',
    crumb: '价格', h1: '价格很简单。装一次，之后按月。',
    sub: '每个方案都是一家门店的 AI 前台，安装费加月费。网站是可选加购，不强制。',
    tableH: '完整对比',
    setupH: '安装包含什么', setup: ['配置店铺信息：营业时间、服务、价格，以及你确认的规定', '设计通话流程，包括问候语和你选的兜底方式', 'Growth 和 Pro 方案的预约流程', '上线前用真实场景测试', '上线支持和一段磨合期'],
    termsH: '服务条款，说人话', terms: [
      ['分钟数和超出', `包含的通话分钟按月计，不累积。超出部分每分钟 $${PRICING.overage.toFixed(2)}。如有短信或第三方费用，签约前先确认，不会悄悄加。`],
      ['网站加购', '加购的网站按一种语言、可复用的设计模板、你提供文字和图片、两轮修改来做。基础 SEO 指标题、描述、索引配置和 sitemap。不保证排名，不含持续内容。已经有网站的，AI 直接配现有网站，不用加购。'],
      ['归属', '号码是你的。转接的号码，服务结束时关掉转接就行；AI Man Jack 帮你申请的号码，可以转到你名下，按运营商规定办。不锁你。域名是你的，取消后网站文件也归你；包含的托管随服务停止。'],
      ['取消', '按月付，随时停。账单和交接细节见服务协议。'],
      ['上线时间', '收到资料后大约一周，前提是标准流程已验证；之后有一段长短不定的磨合期。'],
      ['关闭和支持', '联系 Jack 就能关掉 AI。日常维护范围、新增页面和改版，在服务协议里定，不在这一页。不承诺响应时间。'],
    ],
    faqPick: [6, 7, 9, 10],
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/pricing/']]);
  const items = c.faqPick.map((i) => HOME_FAQ[lang][i]);
  return {
    title: c.title, description: c.description, view: 'pricing_view',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: T[lang].nav.pricing, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap" style="padding-bottom:64px">${pricingCards(lang, { pos: 'pricing', hl: 'h2' })}${addonBlock(lang)}${contactSales(lang)}</section>
<section class="section"><div class="wrap"><h2>${c.tableH}</h2>${pricingTable(lang)}</div></section>
<section class="section soft"><div class="wrap split"><div class="notes"><h2>${c.setupH}</h2><ul>${c.setup.map((s) => `<li>${s}</li>`).join('')}</ul></div>
<div class="notes"><h2>${c.termsH}</h2>${c.terms.map(([h, p]) => `<h3>${h}</h3><p>${p}</p>`).join('')}</div></div></section>
${faq(lang, items)}
${finalCta(lang)}`,
    jsonld: [SERVICE_LD(lang, { url: `${SITE}${lang === 'zh' ? '/zh' : ''}/pricing/` }), BUSINESS_REF, faqJsonLd(items), bc.ld],
  };
};

export const pages = [{ path: '/pricing/', priority: 0.9, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
