import { SITE, EMAIL, SMS_TEL, SMS_DISPLAY, BOOK_URL } from '../config.mjs';
import { pageHero, breadcrumb, BUSINESS_REF, L, T } from '../components.mjs';

const copy = {
  en: {
    title: 'Contact AI Man Jack, Dallas | Book, Email or Text',
    description: 'Three ways to reach Jack about AI training for your team: book a 30-minute call, email jack@aimanjack.com, or text TRAINING to (469) 425-4142. No form, no wait.',
    crumb: 'Contact', h1: 'Talk with Jack about your team.',
    sub: 'No form. Pick whichever is fastest for you.',
    cards: [
      ['Book a 30-minute call', 'Pick a time. Jack calls you, asks what your team does every week, and sends a recommended format and written quote within 24 hours.', 'Book a call', BOOK_URL, 'booking_start', true],
      ['Email Jack', 'Best for describing your team, its size, the tools you have approved and what you want people to be able to do. Replies come from Jack, not a queue.', 'Email ' + EMAIL, `mailto:${EMAIL}?subject=AI%20training%20for%20our%20team`, 'email_training_click', false],
      ['Text Jack', 'Send TRAINING and your company name. Jack replies the same or next business day.', 'Text ' + SMS_DISPLAY, `sms:${SMS_TEL}?body=TRAINING%20-%20`, 'sms_training_click', false],
    ],
    nextH: 'What happens next', next: ['You hear from Jack, usually the same or next business day.', 'A 30-minute call about your team, the tasks people repeat, and the tools you have approved.', 'A recommended format and a written quote within 24 hours; if you proceed, the scope is written down.'],
    idH: 'Business identity', id: [['Company', 'AI Man Jack LLC'], ['Location', 'Dallas, Texas'], ['Service area', 'Dallas–Fort Worth onsite; remote anywhere'], ['Languages', 'English, Chinese'], ['Email', EMAIL], ['Phone / SMS', SMS_DISPLAY]],
  },
  zh: {
    title: '联系 AI Man Jack | 预约、邮件或短信',
    description: '找 Jack 聊团队 AI 培训的三种方式：预约 30 分钟通话，发邮件到 jack@aimanjack.com，或发 TRAINING 到 (469) 425-4142。不用填表，不用等。',
    crumb: '联系', h1: '跟 Jack 聊聊你的团队。',
    sub: '不用填表。哪个方便用哪个。',
    cards: [
      ['预约 30 分钟通话', '选个时间。Jack 打给你，问清楚你们团队每周在做什么，24 小时内给推荐的形式和书面报价。', '预约通话', BOOK_URL, 'booking_start', true],
      ['给 Jack 发邮件', '适合说清楚团队有多少人、批准了哪些工具、希望大家学会做什么。回信的是 Jack 本人，不是客服队列。', '发邮件到 ' + EMAIL, `mailto:${EMAIL}?subject=${encodeURIComponent('团队 AI 培训')}`, 'email_training_click', false],
      ['给 Jack 发短信', '发 TRAINING 加上公司名。Jack 当天或下一个工作日回。', '发短信到 ' + SMS_DISPLAY, `sms:${SMS_TEL}?body=TRAINING%20-%20`, 'sms_training_click', false],
    ],
    nextH: '接下来会怎样', next: ['Jack 回复你，通常当天或下一个工作日。', '一次 30 分钟通话，聊你的团队、大家重复在做的事，以及批准了哪些工具。', '24 小时内给推荐的形式和书面报价；想继续的话，把范围写清楚。'],
    idH: '公司信息', id: [['公司', 'AI Man Jack LLC'], ['所在地', '德州达拉斯'], ['服务范围', '达拉斯—沃斯堡上门；远程不限地区'], ['语言', '英语、中文'], ['邮箱', EMAIL], ['电话 / 短信', SMS_DISPLAY]],
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/contact/']]);
  return {
    title: c.title, description: c.description,
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: T[lang].footer.contact, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap" style="padding-bottom:64px"><div class="contact-grid">${c.cards.map(([h, p, label, href, ev, primary]) => `<div class="card"><h2 class="h3">${h}</h2><p>${p}</p><a class="btn ${primary ? 'btn-primary' : 'btn-secondary'}" href="${href.startsWith('/') ? L(lang, href) : href}"${primary ? ' id="hero-cta"' : ''} data-event="${ev}" data-pos="contact">${label}</a></div>`).join('')}</div></section>
<section class="section soft"><div class="wrap split"><div><h2>${c.nextH}</h2><ol class="prose" style="margin-left:22px">${c.next.map((n) => `<li>${n}</li>`).join('')}</ol></div>
<div><h2>${c.idH}</h2><dl class="kv">${c.id.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div></div></section>`,
    jsonld: [{ '@type': 'ContactPage', '@id': `${SITE}${L(lang, '/contact/')}`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

export const pages = [{ path: '/contact/', priority: 0.6, en: page('en'), zh: page('zh') }];
