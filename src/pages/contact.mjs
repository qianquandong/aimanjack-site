import { SITE, EMAIL, DEMO_TEL, DEMO_DISPLAY, SMS_TEL, SMS_DISPLAY } from '../config.mjs';
import { pageHero, breadcrumb, BUSINESS_REF, T } from '../components.mjs';

const copy = {
  en: {
    title: 'Contact AI Man Jack, Dallas | Call, Email or Text',
    description: 'Three ways to reach AI Man Jack in Dallas: call the AI demo line at (469) 517-2968, email jack@aimanjack.com, or text (469) 425-4142. No form, no wait.',
    crumb: 'Contact', h1: 'Talk to the AI first, then to Jack.',
    sub: 'No form. Pick whichever is fastest for you.',
    cards: [
      ['Call the AI demo', 'The receptionist answers 24/7 in English, Spanish or Chinese. Ask what the service costs and ask for a time with Jack.', DEMO_DISPLAY, `tel:${DEMO_TEL}`, 'demo_call_click', T.en.cta.call, true],
      ['Email Jack', 'Best for describing your business, your booking system and your call volume. Replies come from Jack, not a queue.', EMAIL, `mailto:${EMAIL}?subject=AI%20receptionist`, 'email_click', 'Email Jack', false],
      ['Text Jack', 'Short questions. Include your business name and what you do.', SMS_DISPLAY, `sms:${SMS_TEL}`, 'sms_click', 'Text ' + SMS_DISPLAY, false],
    ],
    nextH: 'What happens next', next: ['You get a reply from Jack, usually the same or next business day.', 'A 15-minute call to go through your hours, services, booking rules and current setup.', 'A plan recommendation and, if you want to proceed, a service agreement with the scope written down.'],
    idH: 'Business identity', id: [['Company', 'AI Man Jack LLC'], ['Location', 'Dallas, Texas'], ['Service area', 'Dallas–Fort Worth metroplex; remote implementation where supported'], ['Languages', 'English, Spanish, Chinese'], ['Email', EMAIL], ['Phone / SMS', SMS_DISPLAY], ['AI demo line', DEMO_DISPLAY]],
  },
  zh: {
    title: '联系 AI Man Jack | 打电话、发邮件或短信',
    description: '联系达拉斯 AI Man Jack 的三种方式：拨打 AI 演示线 (469) 517-2968，发邮件到 jack@aimanjack.com，或发短信到 (469) 425-4142。不用填表，不用等。',
    crumb: '联系', h1: '先跟 AI 聊，再跟 Jack 聊。',
    sub: '不用填表。哪个方便用哪个。',
    cards: [
      ['打 AI 演示线', 'AI 前台 24 小时接，英语、西班牙语、中文都行。问问服务多少钱，再约个和 Jack 通话的时间。', DEMO_DISPLAY, `tel:${DEMO_TEL}`, 'demo_call_click', T.zh.cta.call, true],
      ['给 Jack 发邮件', '适合说清楚你的店、你的预约系统和来电量。回信的是 Jack 本人，不是客服队列。', EMAIL, `mailto:${EMAIL}?subject=${encodeURIComponent('AI 前台咨询')}`, 'email_click', '给 Jack 发邮件', false],
      ['给 Jack 发短信', '问短问题。写上店名和你们做什么。', SMS_DISPLAY, `sms:${SMS_TEL}`, 'sms_click', '发短信到 ' + SMS_DISPLAY, false],
    ],
    nextH: '接下来会怎样', next: ['Jack 回复你，通常当天或下一个工作日。', '一次 15 分钟通话，过一遍营业时间、服务、预约规则和现有设置。', '给你一个方案建议；想继续的话，签一份把范围写清楚的服务协议。'],
    idH: '公司信息', id: [['公司', 'AI Man Jack LLC'], ['所在地', '德州达拉斯'], ['服务范围', '达拉斯—沃斯堡都会区；支持的情况下可远程实施'], ['语言', '英语、西班牙语、中文'], ['邮箱', EMAIL], ['电话 / 短信', SMS_DISPLAY], ['AI 演示线', DEMO_DISPLAY]],
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/contact/']]);
  return {
    title: c.title, description: c.description,
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: T[lang].footer.contact, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap" style="padding-bottom:64px"><div class="contact-grid">${c.cards.map(([h, p, big, href, ev, label, call]) => `<div class="card"><h2 class="h3">${h}</h2><p>${p}</p><p class="big">${big}</p><a class="btn ${call ? 'btn-primary' : 'btn-secondary'}" href="${href}" ${call ? 'data-call' : ''} data-event="${ev}" data-pos="contact">${label}</a></div>`).join('')}</div></section>
<section class="section soft"><div class="wrap split"><div><h2>${c.nextH}</h2><ol class="prose" style="margin-left:22px">${c.next.map((n) => `<li>${n}</li>`).join('')}</ol></div>
<div><h2>${c.idH}</h2><dl class="kv">${c.id.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div></div></section>`,
    jsonld: [{ '@type': 'ContactPage', '@id': `${SITE}${lang === 'zh' ? '/zh' : ''}/contact/`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

export const pages = [{ path: '/contact/', priority: 0.6, en: page('en'), zh: page('zh') }];
