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
    description: '就团队 AI 培训联系 Jack 的三种方式：预约 30 分钟通话、发送邮件至 jack@aimanjack.com，或发送 TRAINING 至 (469) 425-4142。无需填写表单。',
    crumb: '联系', h1: '与 Jack 沟通你的团队需求。',
    sub: '无需填写表单，选择最方便的方式即可。',
    cards: [
      ['预约 30 分钟通话', '选择一个时间，Jack 会致电给你，了解团队每周的工作，并在 24 小时内提供推荐的培训形式与书面报价。', '预约通话', BOOK_URL, 'booking_start', true],
      ['发送邮件', '适合说明团队规模、已获批准的工具，以及希望员工掌握的能力。邮件由 Jack 本人回复。', '发送邮件至 ' + EMAIL, `mailto:${EMAIL}?subject=${encodeURIComponent('团队 AI 培训')}`, 'email_training_click', false],
      ['发送短信', '发送 TRAINING 并附上公司名称。Jack 会在当天或下一个工作日回复。', '发送短信至 ' + SMS_DISPLAY, `sms:${SMS_TEL}?body=TRAINING%20-%20`, 'sms_training_click', false],
    ],
    nextH: '后续流程', next: ['Jack 通常会在当天或下一个工作日回复。', '进行一次 30 分钟通话，了解团队情况、重复性任务以及已获批准的工具。', '24 小时内提供推荐的培训形式与书面报价；如决定合作，服务范围将以书面形式确认。'],
    idH: '公司信息', id: [['公司', 'AI Man Jack LLC'], ['所在地', '德州达拉斯'], ['服务范围', '达拉斯—沃斯堡地区上门授课；其他地区远程授课'], ['授课语言', '英语、中文'], ['邮箱', EMAIL], ['电话／短信', SMS_DISPLAY]],
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/contact/']]);
  return {
    title: c.title, description: c.description,
    body: `${pageHero(lang, { crumbs: bc.html, eyebrow: T[lang].footer.contact, h1: c.h1, sub: c.sub, ctas: false })}
<section class="sec tight"><div class="wrap"><div class="g3">${c.cards.map(([h, p, label, href, ev, primary]) => `<div class="card" style="padding:32px;display:flex;flex-direction:column;gap:14px"><h2 class="h3">${h}</h2><p style="flex-grow:1">${p}</p><a class="btn ${primary ? 'btn-primary' : 'btn-secondary'}" href="${href.startsWith('/') ? L(lang, href) : href}"${primary ? ' id="hero-cta"' : ''} data-event="${ev}" data-pos="contact">${label}</a></div>`).join('')}</div></div></section>
<section class="sec tight"><div class="wrap g2" style="gap:24px"><div class="big-card oakc"><h2>${c.nextH}</h2><ol style="margin-left:22px;display:flex;flex-direction:column;gap:10px">${c.next.map((n) => `<li>${n}</li>`).join('')}</ol></div>
<div class="big-card"><h2>${c.idH}</h2><dl class="kv">${c.id.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div></div></section>`,
    jsonld: [{ '@type': 'ContactPage', '@id': `${SITE}${L(lang, '/contact/')}`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

export const pages = [{ path: '/contact/', priority: 0.6, en: page('en'), zh: page('zh') }];
